import { NextRequest, NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "@/lib/mysql";
import { requireApiAuth } from "@/lib/api-auth";

type BorrowRow = RowDataPacket & {
  withdrawal_id: number;
  withdraw_date: string | Date;
  return_date: string | Date | null;
  withdraw_qty: number | string;
  return_qty: number | string;
  withdraw_by: string;
  return_by: string;
  status: string;
  project_id: string | number | null;
  material_id: string;
  project_name: string | null;
  material_name: string | null;
  unit: string | null;
};

type MaterialRow = RowDataPacket & {
  material_id: string;
  material_name: string;
  unit: string;
  quantity: number | string;
};

function dateOnly(value: string | Date | null | undefined) {
  if (!value) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function toPositiveInt(value: unknown) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : null;
}

function statusLabel(row: Pick<BorrowRow, "status" | "withdraw_qty" | "return_qty">) {
  const borrowed = Number(row.withdraw_qty ?? 0);
  const returned = Number(row.return_qty ?? 0);

  if (row.status === "2") return "ใช้หมด";
  if (row.status === "1" || returned >= borrowed) return "คืนแล้ว";
  return "ค้างคืน";
}

function statusCode(_borrowed: number, returned: number) {
  return returned > 0 ? "1" : "0";
}

function serializeBorrow(row: BorrowRow) {
  const borrowed = Number(row.withdraw_qty ?? 0);
  const returned = Number(row.return_qty ?? 0);

  return {
    id: Number(row.withdrawal_id),
    date: dateOnly(row.withdraw_date),
    returnDate: row.status === "1" || row.status === "2" || returned > 0 ? dateOnly(row.return_date) : "",
    type: "borrow",
    materialId: String(row.material_id ?? ""),
    materialName: row.material_name ?? "",
    materialCode: String(row.material_id ?? ""),
    unit: row.unit ?? "",
    projectId: row.project_id === null ? null : String(row.project_id),
    projectName: row.project_name ?? "",
    qtyBorrow: borrowed,
    qtyReturn: returned,
    borrower: row.withdraw_by ?? "",
    returner: row.return_by ?? "",
    status: statusLabel(row),
    statusCode: row.status,
    note: "",
  };
}

export async function GET() {
  const auth = await requireApiAuth();
  if (!auth.ok) return auth.response;

  try {
    const [borrowRows] = await pool.execute<BorrowRow[]>(
      `SELECT
         w.withdrawal_id,
         w.withdraw_date,
         w.return_date,
         w.withdraw_qty,
         w.return_qty,
         w.withdraw_by,
         w.return_by,
         w.status,
         w.project_id,
         w.material_id,
         p.project_name,
         m.material_name,
         m.unit
       FROM withdrawal w
       LEFT JOIN project p ON p.project_id = w.project_id
       LEFT JOIN material m ON m.material_id = w.material_id
       ORDER BY w.withdraw_date DESC, w.withdrawal_id DESC`
    );

    const [materialRows] = await pool.execute<MaterialRow[]>(
      `SELECT material_id, material_name, unit, quantity
       FROM material
       ORDER BY material_id ASC`
    );

    const materials = materialRows.map((row) => ({
      id: String(row.material_id),
      code: String(row.material_id),
      name: row.material_name ?? "",
      unit: row.unit ?? "",
      qty: Number(row.quantity ?? 0),
    }));

    return NextResponse.json({
      borrows: borrowRows.map(serializeBorrow),
      materials,
    });
  } catch (error) {
    console.error("Load borrows error:", error);
    return NextResponse.json({ error: "ไม่สามารถโหลดข้อมูลเบิก-คืนวัสดุได้" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireApiAuth();
  if (!auth.ok) return auth.response;

  const connection = await pool.getConnection();

  try {
    const data = await request.json();
    const action = String(data.action ?? "borrow");

    await connection.beginTransaction();

    if (action === "borrow") {
      const materialId = String(data.materialId ?? "").trim();
      const projectId = String(data.projectId ?? "").trim();
      const qty = toPositiveInt(data.qty);
      const borrower = String(data.borrower ?? "").trim();
      const withdrawDate = dateOnly(data.date) || new Date().toISOString().slice(0, 10);

      if (!materialId || !projectId || qty === null || !borrower) {
        await connection.rollback();
        return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
      }

      const [materials] = await connection.execute<MaterialRow[]>(
        `SELECT material_id, material_name, unit, quantity
         FROM material
         WHERE material_id = ?
         FOR UPDATE`,
        [materialId]
      );

      const material = materials[0];
      if (!material) {
        await connection.rollback();
        return NextResponse.json({ error: "ไม่พบวัสดุที่ต้องการเบิก" }, { status: 404 });
      }

      const currentQty = Number(material.quantity ?? 0);
      if (qty > currentQty) {
        await connection.rollback();
        return NextResponse.json({ error: `จำนวนวัสดุไม่เพียงพอ (คงเหลือ ${currentQty} ${material.unit})` }, { status: 400 });
      }

      await connection.execute(
        `UPDATE material
         SET quantity = quantity - ?
         WHERE material_id = ?`,
        [qty, materialId]
      );

      const [result] = await connection.execute<ResultSetHeader>(
        `INSERT INTO withdrawal
           (withdraw_date, return_date, project_id, material_id, withdraw_qty, return_qty, withdraw_by, return_by, status)
         VALUES (?, ?, ?, ?, ?, 0, ?, '', '0')`,
        [withdrawDate, withdrawDate, projectId, materialId, qty, borrower]
      );

      await connection.commit();

      return NextResponse.json({
        borrow: {
          id: result.insertId,
          date: withdrawDate,
          returnDate: "",
          type: "borrow",
          materialId,
          materialName: material.material_name ?? "",
          materialCode: materialId,
          unit: material.unit ?? "",
          projectId,
          qtyBorrow: qty,
          qtyReturn: 0,
          borrower,
          returner: "",
          status: "ค้างคืน",
          statusCode: "0",
          note: "",
        },
      }, { status: 201 });
    }

    if (action === "return") {
      const id = Number(data.id);
      const qty = toPositiveInt(data.qty);
      const returner = String(data.returner ?? "").trim();
      const returnDate = dateOnly(data.date) || new Date().toISOString().slice(0, 10);

      if (!id || qty === null || !returner) {
        await connection.rollback();
        return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
      }

      const [rows] = await connection.execute<BorrowRow[]>(
        `SELECT
           w.withdrawal_id,
           w.withdraw_date,
           w.return_date,
           w.withdraw_qty,
           w.return_qty,
           w.withdraw_by,
           w.return_by,
           w.status,
           w.project_id,
           w.material_id,
           p.project_name,
           m.material_name,
           m.unit
         FROM withdrawal w
         LEFT JOIN project p ON p.project_id = w.project_id
         LEFT JOIN material m ON m.material_id = w.material_id
         WHERE w.withdrawal_id = ?
         FOR UPDATE`,
        [id]
      );

      const borrow = rows[0];
      if (!borrow) {
        await connection.rollback();
        return NextResponse.json({ error: "ไม่พบรายการเบิกที่ต้องการคืน" }, { status: 404 });
      }
      if (borrow.status === "1" || borrow.status === "2") {
        await connection.rollback();
        return NextResponse.json({ error: "รายการนี้ปิดแล้ว ไม่สามารถคืนเพิ่มได้" }, { status: 400 });
      }

      const borrowDate = dateOnly(borrow.withdraw_date);
      if (borrowDate && returnDate < borrowDate) {
        await connection.rollback();
        return NextResponse.json({ error: "วันที่คืนต้องไม่ก่อนวันที่เบิก" }, { status: 400 });
      }

      const borrowed = Number(borrow.withdraw_qty ?? 0);
      const returned = Number(borrow.return_qty ?? 0);
      const remaining = borrowed - returned;
      if (qty > remaining) {
        await connection.rollback();
        return NextResponse.json({ error: `ไม่สามารถคืนเกินจำนวนที่เบิกได้ (คืนได้อีก ${remaining} ${borrow.unit ?? ""})` }, { status: 400 });
      }

      const nextReturned = returned + qty;
      const nextStatus = statusCode(borrowed, nextReturned);

      await connection.execute(
        `UPDATE material
         SET quantity = quantity + ?
         WHERE material_id = ?`,
        [qty, borrow.material_id]
      );

      await connection.execute(
        `UPDATE withdrawal
         SET return_date = ?, return_qty = ?, return_by = ?, status = ?
         WHERE withdrawal_id = ?`,
        [returnDate, nextReturned, returner, nextStatus, id]
      );

      await connection.commit();

      return NextResponse.json({
        borrow: serializeBorrow({
          ...borrow,
          return_date: returnDate,
          return_qty: nextReturned,
          return_by: returner,
          status: nextStatus,
        }),
      });
    }

    if (action === "use_up") {
      const id = Number(data.id);
      const usedBy = String(data.usedBy ?? data.returner ?? "").trim();
      const useDate = dateOnly(data.date) || new Date().toISOString().slice(0, 10);

      if (!id) {
        await connection.rollback();
        return NextResponse.json({ error: "ไม่พบรหัสรายการเบิก" }, { status: 400 });
      }

      const [rows] = await connection.execute<BorrowRow[]>(
        `SELECT
           w.withdrawal_id,
           w.withdraw_date,
           w.return_date,
           w.withdraw_qty,
           w.return_qty,
           w.withdraw_by,
           w.return_by,
           w.status,
           w.project_id,
           w.material_id,
           p.project_name,
           m.material_name,
           m.unit
         FROM withdrawal w
         LEFT JOIN project p ON p.project_id = w.project_id
         LEFT JOIN material m ON m.material_id = w.material_id
         WHERE w.withdrawal_id = ?
         FOR UPDATE`,
        [id]
      );

      const borrow = rows[0];
      if (!borrow) {
        await connection.rollback();
        return NextResponse.json({ error: "ไม่พบรายการเบิกที่ต้องการบันทึกว่าใช้หมด" }, { status: 404 });
      }
      if (borrow.status === "1" || borrow.status === "2") {
        await connection.rollback();
        return NextResponse.json({ error: "รายการนี้ปิดแล้ว ไม่สามารถเปลี่ยนเป็นใช้หมดได้" }, { status: 400 });
      }

      const borrowDate = dateOnly(borrow.withdraw_date);
      if (borrowDate && useDate < borrowDate) {
        await connection.rollback();
        return NextResponse.json({ error: "วันที่ใช้หมดต้องไม่ก่อนวันที่เบิก" }, { status: 400 });
      }

      await connection.execute(
        `UPDATE withdrawal
         SET return_date = ?, return_by = ?, status = '2'
         WHERE withdrawal_id = ?`,
        [useDate, usedBy || borrow.return_by || "", id]
      );

      await connection.commit();

      return NextResponse.json({
        borrow: serializeBorrow({
          ...borrow,
          return_date: useDate,
          return_by: usedBy || borrow.return_by || "",
          status: "2",
        }),
      });
    }

    await connection.rollback();
    return NextResponse.json({ error: "ไม่รู้จักคำสั่งที่ส่งมา" }, { status: 400 });
  } catch (error) {
    await connection.rollback();
    console.error("Save borrow error:", error);
    return NextResponse.json({ error: "ไม่สามารถบันทึกข้อมูลเบิก-คืนวัสดุได้" }, { status: 500 });
  } finally {
    connection.release();
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireApiAuth();
  if (!auth.ok) return auth.response;

  const connection = await pool.getConnection();

  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));

    if (!id) {
      return NextResponse.json({ error: "ไม่พบรหัสรายการ" }, { status: 400 });
    }

    await connection.beginTransaction();

    const [rows] = await connection.execute<BorrowRow[]>(
      `SELECT withdrawal_id, material_id, withdraw_qty, return_qty, status
       FROM withdrawal
       WHERE withdrawal_id = ?
       FOR UPDATE`,
      [id]
    );

    const borrow = rows[0];
    if (!borrow) {
      await connection.rollback();
      return NextResponse.json({ error: "ไม่พบรายการที่ต้องการลบ" }, { status: 404 });
    }

    const netOut = borrow.status === "2" ? 0 : Number(borrow.withdraw_qty ?? 0) - Number(borrow.return_qty ?? 0);
    if (netOut > 0) {
      await connection.execute(
        `UPDATE material
         SET quantity = quantity + ?
         WHERE material_id = ?`,
        [netOut, borrow.material_id]
      );
    }

    await connection.execute(`DELETE FROM withdrawal WHERE withdrawal_id = ?`, [id]);
    await connection.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    await connection.rollback();
    console.error("Delete borrow error:", error);
    return NextResponse.json({ error: "ไม่สามารถลบรายการเบิก-คืนวัสดุได้" }, { status: 500 });
  } finally {
    connection.release();
  }
}
