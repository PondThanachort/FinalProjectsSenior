import { NextRequest, NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "@/lib/mysql";
import { requireApiAuth } from "@/lib/api-auth";

type MaterialRow = RowDataPacket & {
  material_id: string;
  material_name: string;
  material_type: string;
  unit: string;
  quantity: number | string;
};

function serializeMaterial(row: MaterialRow) {
  return {
    id: row.material_id,
    code: row.material_id,
    name: row.material_name ?? "",
    type: row.material_type ?? "",
    unit: row.unit ?? "",
    quantity: Number(row.quantity ?? 0),
  };
}

function toQuantity(value: unknown) {
  if (value === undefined || value === null || String(value).trim() === "") return 0;
  const quantity = Number(value);
  return Number.isFinite(quantity) && quantity >= 0 ? Math.floor(quantity) : null;
}

function nextMaterialId(rows: Pick<MaterialRow, "material_id">[]) {
  const max = rows.reduce((current, row) => {
    const match = String(row.material_id).match(/\d+/);
    const value = match ? Number(match[0]) : 0;
    return Math.max(current, Number.isFinite(value) ? value : 0);
  }, 0);

  return `M${String(max + 1).padStart(4, "0")}`.slice(0, 5);
}

export async function GET() {
  const auth = await requireApiAuth();
  if (!auth.ok) return auth.response;

  try {
    const [rows] = await pool.execute<MaterialRow[]>(
      `SELECT material_id, material_name, material_type, unit, quantity
       FROM material
       ORDER BY material_id ASC`
    );

    return NextResponse.json({ materials: rows.map(serializeMaterial) });
  } catch (error) {
    console.error("Load materials error:", error);
    return NextResponse.json({ error: "ไม่สามารถโหลดข้อมูลวัสดุได้" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireApiAuth();
  if (!auth.ok) return auth.response;

  try {
    const data = await request.json();
    const name = String(data.name ?? "").trim();
    const type = String(data.type ?? "").trim();
    const unit = String(data.unit ?? "").trim();
    const quantity = toQuantity(data.quantity);

    if (!name || !type || !unit) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    if (quantity === null) {
      return NextResponse.json({ error: "จำนวนคงเหลือต้องเป็นตัวเลขตั้งแต่ 0 ขึ้นไป" }, { status: 400 });
    }

    let code = String(data.code ?? "").trim();
    if (!code) {
      const [idRows] = await pool.execute<MaterialRow[]>(`SELECT material_id FROM material`);
      code = nextMaterialId(idRows);
    }

    if (code.length > 5) {
      return NextResponse.json({ error: "รหัสวัสดุต้องไม่เกิน 5 ตัวอักษร" }, { status: 400 });
    }

    await pool.execute<ResultSetHeader>(
      `INSERT INTO material (material_id, material_name, material_type, unit, quantity)
       VALUES (?, ?, ?, ?, ?)`,
      [code, name, type, unit, quantity]
    );

    return NextResponse.json({
      material: { id: code, code, name, type, unit, quantity },
    }, { status: 201 });
  } catch (error) {
    console.error("Create material error:", error);
    return NextResponse.json({ error: "ไม่สามารถเพิ่มวัสดุได้" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireApiAuth();
  if (!auth.ok) return auth.response;

  try {
    const data = await request.json();
    const id = String(data.id ?? data.code ?? "").trim();
    const name = String(data.name ?? "").trim();
    const type = String(data.type ?? "").trim();
    const unit = String(data.unit ?? "").trim();
    const quantity = toQuantity(data.quantity);

    if (!id || !name || !type || !unit) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    if (quantity === null) {
      return NextResponse.json({ error: "จำนวนคงเหลือต้องเป็นตัวเลขตั้งแต่ 0 ขึ้นไป" }, { status: 400 });
    }

    await pool.execute<ResultSetHeader>(
      `UPDATE material
       SET material_name = ?, material_type = ?, unit = ?, quantity = ?
       WHERE material_id = ?`,
      [name, type, unit, quantity, id]
    );

    return NextResponse.json({
      material: { id, code: id, name, type, unit, quantity },
    });
  } catch (error) {
    console.error("Update material error:", error);
    return NextResponse.json({ error: "ไม่สามารถแก้ไขวัสดุได้" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireApiAuth();
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const id = String(searchParams.get("id") ?? "").trim();

    if (!id) {
      return NextResponse.json({ error: "ไม่พบรหัสวัสดุ" }, { status: 400 });
    }

    await pool.execute<ResultSetHeader>(`DELETE FROM material WHERE material_id = ?`, [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete material error:", error);
    return NextResponse.json({ error: "ไม่สามารถลบวัสดุได้" }, { status: 500 });
  }
}
