import { NextRequest, NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "@/lib/mysql";
import { requireApiAuth } from "@/lib/api-auth";

type FinanceRow = RowDataPacket & {
  finance_id: number;
  date: string | Date;
  type: string;
  detail: string;
  amount: number | string;
  project_id: number | null;
  purchase_id: number | null;
  project_name: string | null;
};

function dateOnly(value: string | Date) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value ?? "").slice(0, 10);
}

function toAmount(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

function serializeFinance(row: FinanceRow) {
  const amount = Number(row.amount ?? 0);
  const purchaseId = Number(row.purchase_id ?? 0) || null;

  return {
    id: Number(row.finance_id),
    date: dateOnly(row.date),
    kind: amount < 0 || purchaseId ? "expense" : "income",
    type: row.type ?? "",
    detail: row.detail ?? "",
    amount: String(Math.abs(amount)),
    projectId: Number(row.project_id ?? 0) || null,
    projectName: row.project_name ?? "",
    purchaseId,
  };
}

export async function GET() {
  const auth = await requireApiAuth();
  if (!auth.ok) return auth.response;

  try {
    const [rows] = await pool.execute<FinanceRow[]>(
      `SELECT
         f.finance_id,
         f.\`date\`,
         f.\`type\`,
         f.detail,
         f.amount,
         f.project_id,
         f.purchase_id,
         p.project_name
       FROM finance f
       LEFT JOIN project p ON p.project_id = f.project_id
       ORDER BY f.date DESC, f.finance_id DESC`
    );

    return NextResponse.json({ finances: rows.map(serializeFinance) });
  } catch (error) {
    console.error("Load finances error:", error);
    return NextResponse.json({ error: "ไม่สามารถโหลดข้อมูลรายรับ-รายจ่ายได้" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireApiAuth();
  if (!auth.ok) return auth.response;

  try {
    const data = await request.json();
    const date = String(data.date ?? "").trim();
    const kind = data.kind === "expense" ? "expense" : "income";
    const type = String(data.type ?? "").trim();
    const detail = String(data.detail ?? "").trim();
    const amount = toAmount(data.amount);
    const projectId = Number(data.projectId);
    const purchaseId = Number(data.purchaseId ?? 0) || 0;

    if (!date || !type || !detail || amount === null || !projectId) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    const signedAmount = kind === "expense" ? -amount : amount;
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO finance (\`date\`, \`type\`, detail, amount, project_id, purchase_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [date, type, detail, signedAmount, projectId, purchaseId]
    );

    return NextResponse.json({
      finance: {
        id: result.insertId,
        date,
        kind,
        type,
        detail,
        amount: String(amount),
        projectId,
        purchaseId: purchaseId || null,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Create finance error:", error);
    return NextResponse.json({ error: "ไม่สามารถเพิ่มรายการรายรับ-รายจ่ายได้" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireApiAuth();
  if (!auth.ok) return auth.response;

  try {
    const data = await request.json();
    const id = Number(data.id);
    const date = String(data.date ?? "").trim();
    const kind = data.kind === "expense" ? "expense" : "income";
    const type = String(data.type ?? "").trim();
    const detail = String(data.detail ?? "").trim();
    const amount = toAmount(data.amount);
    const projectId = Number(data.projectId);
    const purchaseId = Number(data.purchaseId ?? 0) || 0;

    if (!id || !date || !type || !detail || amount === null || !projectId) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    const signedAmount = kind === "expense" ? -amount : amount;
    await pool.execute(
      `UPDATE finance
       SET \`date\` = ?, \`type\` = ?, detail = ?, amount = ?, project_id = ?, purchase_id = ?
       WHERE finance_id = ?`,
      [date, type, detail, signedAmount, projectId, purchaseId, id]
    );

    return NextResponse.json({
      finance: {
        id,
        date,
        kind,
        type,
        detail,
        amount: String(amount),
        projectId,
        purchaseId: purchaseId || null,
      },
    });
  } catch (error) {
    console.error("Update finance error:", error);
    return NextResponse.json({ error: "ไม่สามารถแก้ไขรายการรายรับ-รายจ่ายได้" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireApiAuth();
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));

    if (!id) {
      return NextResponse.json({ error: "ไม่พบรหัสรายการ" }, { status: 400 });
    }

    await pool.execute(`DELETE FROM finance WHERE finance_id = ?`, [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete finance error:", error);
    return NextResponse.json({ error: "ไม่สามารถลบรายการรายรับ-รายจ่ายได้" }, { status: 500 });
  }
}
