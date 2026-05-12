import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export type SessionRole = "admin" | "staff" | "user";

export type ApiSession = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: SessionRole;
};

function parseSessionValue(value: string | undefined) {
  if (!value) return null;
  try {
    const decoded = Buffer.from(value, "base64").toString("utf8");
    const session = JSON.parse(decoded) as Partial<ApiSession>;
    if (!session.id || !session.username || !session.role) return null;
    if (!["admin", "staff", "user"].includes(session.role)) return null;
    return session as ApiSession;
  } catch {
    return null;
  }
}

export async function getApiSession() {
  const cookieStore = await cookies();
  return parseSessionValue(cookieStore.get("session")?.value);
}

export async function requireApiAuth(roles: SessionRole[] = ["admin", "staff"]) {
  const session = await getApiSession();

  if (!session) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 }),
    };
  }

  if (!roles.includes(session.role)) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "ไม่มีสิทธิ์ใช้งานส่วนนี้" }, { status: 403 }),
    };
  }

  return { ok: true as const, session };
}
