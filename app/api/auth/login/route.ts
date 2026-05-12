import crypto from "crypto";
import { NextResponse } from "next/server";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import pool from "@/lib/mysql";

function verifyPassword(stored: string, password: string) {
  if (typeof stored !== "string") return false;
  if (!stored.startsWith("scrypt$")) {
    return stored === password;
  }
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const salt = parts[1];
  const hash = parts[2];
  const derived = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return expected.length === derived.length && crypto.timingSafeEqual(expected, derived);
}

function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${derived}`;
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" }, { status: 400 });
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT staff_id, username, password, first_name, last_name, email, role FROM staff WHERE username = ? LIMIT 1",
      [username]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
    }

    const user = rows[0] as {
      staff_id: number;
      username: string;
      password: string;
      first_name: string;
      last_name: string;
      email: string;
      role: string | number;
    };

    if (!verifyPassword(user.password, password)) {
      return NextResponse.json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
    }

    if (user.password && !user.password.startsWith("scrypt$")) {
      const hashed = hashPassword(password);
      await pool.execute<ResultSetHeader>(
        `UPDATE staff SET password = ? WHERE staff_id = ?`,
        [hashed, user.staff_id]
      );
    }

    const roleValue = typeof user.role === "string" ? Number(user.role) : user.role;
    const roleName = roleValue === 1 ? "admin" : roleValue === 2 ? "staff" : "user";
    const sessionData = {
      id: user.staff_id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      role: roleName,
    };
    const sessionValue = Buffer.from(JSON.stringify(sessionData)).toString("base64");

    const response = NextResponse.json({
      success: true,
      user: sessionData,
      redirectTo: "/projects",
    });

    response.cookies.set({
      name: "session",
      value: sessionValue,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดระหว่างเข้าสู่ระบบ" }, { status: 500 });
  }
}
