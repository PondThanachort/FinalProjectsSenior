import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "ออกจากระบบเรียบร้อย" });

  response.cookies.set({
    name: "session",
    value: "",
    path: "/",
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
