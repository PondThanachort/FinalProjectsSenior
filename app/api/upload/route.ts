import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { requireApiAuth } from "@/lib/api-auth";
import { runtimeUploadsDir } from "@/lib/upload-storage";

function safeFolderName(value: FormDataEntryValue | null) {
  const raw = typeof value === "string" ? value.trim() : "";
  return raw
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "-")
    .replace(/\.+$/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 120);
}

function publicUrl(...segments: string[]) {
  return `/${segments.map(segment => encodeURIComponent(segment)).join("/")}`;
}

export async function POST(request: NextRequest) {
  const auth = await requireApiAuth();
  if (!auth.ok) return auth.response;

  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;
    const projectName = safeFolderName(data.get("projectName"));

    if (!file) {
      return NextResponse.json({ error: "No file received" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    // Validate file size (50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "ไฟล์ใหญ่เกินไป กรุณาเลือกไฟล์ไม่เกิน 50MB" }, { status: 400 });
    }

    // Create uploads/project directory if not exists
    const uploadsDir = runtimeUploadsDir();
    const targetDir = projectName ? path.join(uploadsDir, projectName) : uploadsDir;
    try {
      await mkdir(targetDir, { recursive: true });
    } catch {
      // Directory might already exist
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = path.extname(file.name);
    const filename = `${timestamp}_${Math.random().toString(36).substring(2)}${extension}`;
    const filepath = path.join(targetDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Return the public URL
    const url = projectName ? publicUrl("uploads", projectName, filename) : publicUrl("uploads", filename);

    return NextResponse.json({ url, filename, folder: projectName });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
