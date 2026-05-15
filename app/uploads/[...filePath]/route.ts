import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { bundledUploadsDir, runtimeUploadsDir, safeUploadPath } from "@/lib/upload-storage";

const CONTENT_TYPES: Record<string, string> = {
  ".gif": "image/gif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ filePath: string[] }> }
) {
  const { filePath } = await context.params;
  const roots = [runtimeUploadsDir(), bundledUploadsDir()];

  for (const root of roots) {
    const targetPath = safeUploadPath(root, filePath);
    if (!targetPath) return NextResponse.json({ error: "Invalid file path" }, { status: 400 });

    try {
      const file = await readFile(targetPath);
      const ext = path.extname(targetPath).toLowerCase();
      return new NextResponse(file, {
        headers: {
          "Content-Type": CONTENT_TYPES[ext] ?? "application/octet-stream",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch {
      // Try the next storage root.
    }
  }

  return NextResponse.json({ error: "File not found" }, { status: 404 });
}
