import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import pool from "@/lib/mysql";
import { getApiSession, requireApiAuth } from "@/lib/api-auth";

type ProjectRow = RowDataPacket & {
  project_id: number | string;
  project_name: string | null;
  project_detail: string | null;
  project_image: string | null;
  location: string | null;
  start_date: string | Date | null;
  end_date: string | Date | null;
  status: string;
  quotation_file: string | null;
  created_by: string | null;
};

function isInvalidDateRange(startDate: unknown, endDate: unknown) {
  const start = String(startDate ?? "").trim();
  const end = String(endDate ?? "").trim();
  return Boolean(start && end && end < start);
}

function serializeProject(item: ProjectRow) {
  const statusMap: Record<string, string> = {
    "1": "กำลังดำเนินการ",
    "2": "เสร็จสิ้น",
  };
  
  // Helper to format date to YYYY-MM-DD
  const formatDate = (d: string | Date | null) => {
    if (!d) return "";
    try {
      const date = d instanceof Date ? d : new Date(d);
      if (isNaN(date.getTime())) return "";
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch {
      return "";
    }
  };
  
  return {
    id: Number(item.project_id),
    name: item.project_name ?? "",
    description: item.project_detail ?? "",
    location: item.location ?? "",
    startDate: formatDate(item.start_date),
    endDate: formatDate(item.end_date),
    status: statusMap[item.status] || item.status,
    image: item.project_image ?? "",
    quotationFile: item.quotation_file ?? "",
    quotationName: item.quotation_file ? item.quotation_file.split('/').pop() || "" : "",
    staff: item.created_by ?? "",
  };
}

export async function GET() {
  try {
    const session = await getApiSession();
    const isAuthenticated = session?.role === "admin" || session?.role === "staff";
    const [rows] = isAuthenticated
      ? await pool.execute<ProjectRow[]>(
          `SELECT project_id, project_name, project_detail, project_image, location, start_date, end_date, status, quotation_file, created_by FROM project ORDER BY project_id DESC`
        )
      : await pool.execute<ProjectRow[]>(
          `SELECT project_id, project_name, project_detail, project_image, location, start_date, end_date, status, quotation_file, created_by FROM project WHERE status = '2' ORDER BY project_id DESC`
        );
    const projects = Array.isArray(rows) ? rows.map(serializeProject) : [];
    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Load projects error:", error);
    return NextResponse.json({ error: "ไม่สามารถโหลดข้อมูลโครงการได้" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireApiAuth();
  if (!auth.ok) return auth.response;

  try {
    const data = await request.json();
    const statusMap: Record<string, string> = {
      "กำลังดำเนินการ": "1",
      "เสร็จสิ้น": "2",
    };
    const required = ["name", "description", "location", "startDate", "endDate", "quotationFile", "staff"];
    for (const key of required) {
      if (!data[key] || String(data[key]).trim() === "") {
        return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
      }
    }
    if (isInvalidDateRange(data.startDate, data.endDate)) {
      return NextResponse.json({ error: "วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่มต้น" }, { status: 400 });
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO project (project_name, project_detail, project_image, location, start_date, end_date, status, quotation_file, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name,
        data.description,
        data.image || "",
        data.location,
        data.startDate,
        data.endDate,
        statusMap[data.status] || data.status,
        data.quotationFile,
        data.staff,
      ]
    );

    const insertId = typeof result?.insertId === "number" ? result.insertId : null;
    return NextResponse.json({ project: { id: insertId, ...data } }, { status: 201 });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json({ error: "ไม่สามารถบันทึกข้อมูลโครงการได้" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await requireApiAuth();
  if (!auth.ok) return auth.response;

  try {
    const data = await request.json();
    const { id, name, description, location, startDate, endDate, status, image, quotationFile, quotationName, staff } = data;

    if (!id) {
      return NextResponse.json({ error: "ไม่ระบุ ID ของโครงการ" }, { status: 400 });
    }
    if (isInvalidDateRange(startDate, endDate)) {
      return NextResponse.json({ error: "วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่มต้น" }, { status: 400 });
    }

    const statusMap: Record<string, string> = {
      "กำลังดำเนินการ": "1",
      "เสร็จสิ้น": "2",
    };

    await pool.execute<ResultSetHeader>(
      `UPDATE project SET project_name = ?, project_detail = ?, project_image = ?, location = ?, start_date = ?, end_date = ?, status = ?, quotation_file = ?, created_by = ? WHERE project_id = ?`,
      [
        name,
        description,
        image || "",
        location,
        startDate,
        endDate,
        statusMap[status] || status,
        quotationFile,
        staff,
        id,
      ]
    );

    return NextResponse.json({ project: { id, name, description, location, startDate, endDate, status, image, quotationFile, quotationName, staff } });
  } catch (error) {
    console.error("Update project error:", error);
    return NextResponse.json({ error: "ไม่สามารถแก้ไขข้อมูลโครงการได้" }, { status: 500 });
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
      return NextResponse.json({ error: "ไม่พบรหัสโครงการ" }, { status: 400 });
    }

    await connection.beginTransaction();

    const [financeRows] = await connection.execute<RowDataPacket[]>(
      `SELECT finance_id FROM finance WHERE project_id = ? LIMIT 1`,
      [id]
    );
    const [withdrawRows] = await connection.execute<RowDataPacket[]>(
      `SELECT withdrawal_id FROM withdrawal WHERE project_id = ? LIMIT 1`,
      [id]
    );

    if (financeRows.length > 0 || withdrawRows.length > 0) {
      await connection.rollback();
      return NextResponse.json(
        { error: "ไม่สามารถลบโครงการนี้ได้ เพราะมีรายการรายรับ-รายจ่ายหรือรายการเบิก-คืนผูกอยู่" },
        { status: 409 }
      );
    }

    await connection.execute(`DELETE FROM portfolio_image WHERE project_id = ?`, [id]);
    const [result] = await connection.execute<ResultSetHeader>(
      `DELETE FROM project WHERE project_id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return NextResponse.json({ error: "ไม่พบโครงการที่ต้องการลบ" }, { status: 404 });
    }

    await connection.commit();
    return NextResponse.json({ success: true });
  } catch (error) {
    await connection.rollback();
    console.error("Delete project error:", error);
    return NextResponse.json({ error: "ไม่สามารถลบโครงการได้" }, { status: 500 });
  } finally {
    connection.release();
  }
}
