import { NextResponse } from "next/server";
import { cookies } from "next/headers";

type SessionData = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "staff" | "user";
};

export async function GET() {
  const cookiesStore = await cookies();
  const sessionValue = cookiesStore.get("session")?.value;

  if (!sessionValue) {
    return NextResponse.json({ error: "ไม่พบ session" }, { status: 401 });
  }

  try {
    const decoded = Buffer.from(sessionValue, "base64").toString("utf8");
    const session = JSON.parse(decoded) as SessionData;
    return NextResponse.json({ user: session });
  } catch (error) {
    console.error("Session parse error:", error);
    return NextResponse.json({ error: "Session ไม่ถูกต้อง" }, { status: 401 });
  }
}
