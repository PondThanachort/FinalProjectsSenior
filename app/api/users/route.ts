import crypto from "crypto";
import { NextResponse } from "next/server";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import pool from "@/lib/mysql";
import { requireApiAuth } from "@/lib/api-auth";

type StaffRow = RowDataPacket & {
  staff_id: string;
  prefix: string | null;
  first_name: string | null;
  last_name: string | null;
  address: string | null;
  username: string | null;
  password: string | null;
  phone: string | null;
  email: string | null;
  position: string | null;
  role: string | number | null;
};

function normalizePhoneValue(value: unknown) {
  const text = String(value ?? "").trim();
  if (/^\d{9}$/.test(text)) {
    return `0${text}`;
  }
  return text;
}

function serializeUser(item: StaffRow) {
  return {
    staff_id: String(item.staff_id),
    prefix: item.prefix ?? "",
    first_name: item.first_name ?? "",
    last_name: item.last_name ?? "",
    address: item.address ?? "",
    username: item.username ?? "",
    password: "",
    phone: normalizePhoneValue(item.phone),
    email: item.email ?? "",
    position: item.position ?? "",
    role: String(item.role ?? ""),
  };
}

async function getNextStaffId() {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT staff_id FROM staff ORDER BY staff_id DESC LIMIT 1`
  );
  const lastId = Array.isArray(rows) && rows.length > 0 ? String(rows[0].staff_id) : "";
  const num = parseInt(lastId.replace(/^ST/, ""), 10);
  return `ST${String(isNaN(num) ? 1 : num + 1).padStart(3, "0")}`;
}

function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${derived}`;
}

export async function GET() {
  const auth = await requireApiAuth(["admin", "staff"]);
  if (!auth.ok) return auth.response;

  try {
    const [rows] = await pool.execute<StaffRow[]>(
      `SELECT staff_id, prefix, first_name, last_name, address, username, password, phone, email, position, role FROM staff ORDER BY staff_id`
    );

    const users = Array.isArray(rows) ? rows.map(serializeUser) : [];
    return NextResponse.json({ users });
  } catch (error) {
    console.error("Fetch users error:", error);
    return NextResponse.json({ error: "ไม่สามารถโหลดข้อมูลพนักงานได้" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireApiAuth(["admin"]);
  if (!auth.ok) return auth.response;

  try {
    const data = await request.json();
    const required = ["prefix", "first_name", "last_name", "username", "password", "phone", "email", "position", "role"];
    for (const key of required) {
      if (!data[key] || String(data[key]).trim() === "") {
        return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
      }
    }

    const [exists] = await pool.execute<RowDataPacket[]>(
      `SELECT staff_id FROM staff WHERE username = ? LIMIT 1`,
      [data.username]
    );
    if (Array.isArray(exists) && exists.length > 0) {
      return NextResponse.json({ error: "ชื่อผู้ใช้นี้มีแล้ว" }, { status: 409 });
    }

    const staff_id = await getNextStaffId();
    const hashedPassword = hashPassword(data.password);
    await pool.execute<ResultSetHeader>(
      `INSERT INTO staff (staff_id, prefix, first_name, last_name, address, username, password, phone, email, position, role)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [staff_id, data.prefix, data.first_name, data.last_name, data.address || "", data.username, hashedPassword, data.phone, data.email, data.position, data.role]
    );

    const [rows] = await pool.execute<StaffRow[]>(
      `SELECT staff_id, prefix, first_name, last_name, address, username, password, phone, email, position, role FROM staff WHERE staff_id = ? LIMIT 1`,
      [staff_id]
    );
    const user = Array.isArray(rows) && rows.length > 0 ? serializeUser(rows[0]) : { staff_id, ...data, role: String(data.role), password: hashedPassword };
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json({ error: "ไม่สามารถบันทึกข้อมูลพนักงานได้" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const auth = await requireApiAuth(["admin"]);
  if (!auth.ok) return auth.response;

  try {
    const data = await request.json();
    if (!data.staff_id) {
      return NextResponse.json({ error: "รหัสพนักงานไม่ถูกต้อง" }, { status: 400 });
    }

    const required = ["prefix", "first_name", "last_name", "username", "phone", "email", "position", "role"];
    for (const key of required) {
      if (!data[key] || String(data[key]).trim() === "") {
        return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
      }
    }

    const [exists] = await pool.execute<RowDataPacket[]>(
      `SELECT staff_id FROM staff WHERE username = ? AND staff_id <> ? LIMIT 1`,
      [data.username, data.staff_id]
    );
    if (Array.isArray(exists) && exists.length > 0) {
      return NextResponse.json({ error: "ชื่อผู้ใช้นี้มีแล้ว" }, { status: 409 });
    }

    let sql = `UPDATE staff SET prefix = ?, first_name = ?, last_name = ?, address = ?, username = ?, phone = ?, email = ?, position = ?, role = ? WHERE staff_id = ?`;
    const params: string[] = [data.prefix, data.first_name, data.last_name, data.address || "", data.username, data.phone, data.email, data.position, data.role, data.staff_id];

    if (data.password && String(data.password).trim() !== "") {
      const hashedPassword = hashPassword(data.password);
      sql = `UPDATE staff SET prefix = ?, first_name = ?, last_name = ?, address = ?, username = ?, password = ?, phone = ?, email = ?, position = ?, role = ? WHERE staff_id = ?`;
      params.splice(5, 0, hashedPassword);
    }

    await pool.execute<ResultSetHeader>(sql, params);

    const [rows] = await pool.execute<StaffRow[]>(
      `SELECT staff_id, prefix, first_name, last_name, address, username, password, phone, email, position, role FROM staff WHERE staff_id = ? LIMIT 1`,
      [data.staff_id]
    );
    const user = Array.isArray(rows) && rows.length > 0 ? serializeUser(rows[0]) : { staff_id: data.staff_id, ...data, role: String(data.role) };
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "ไม่สามารถอัปเดตข้อมูลพนักงานได้" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = await requireApiAuth(["admin"]);
  if (!auth.ok) return auth.response;

  try {
    const data = await request.json();
    const staffId = String(data.staff_id ?? "").trim();
    const username = String(data.username ?? "").trim();
    if (!staffId && !username) {
      return NextResponse.json({ error: "รหัสพนักงานไม่ถูกต้อง" }, { status: 400 });
    }

    const field = staffId ? "staff_id" : "username";
    const value = staffId || username;

    await pool.execute<ResultSetHeader>(
      `DELETE FROM staff WHERE ${field} = ?`,
      [value]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "ไม่สามารถลบข้อมูลพนักงานได้" }, { status: 500 });
  }
}
