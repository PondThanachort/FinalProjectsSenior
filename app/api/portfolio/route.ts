import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, unlink, rename } from "fs/promises";
import path from "path";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import pool from "@/lib/mysql";
import { getApiSession, requireApiAuth } from "@/lib/api-auth";
import { runtimeUploadsDir, safeUploadPath } from "@/lib/upload-storage";

type PortfolioImageRow = {
  image_id: number | string;
  project_id: number | string;
  image_file?: string;
  upload_date?: string;
  created_by?: string;
};
type PortfolioImageDbRow = RowDataPacket & PortfolioImageRow;

function toPortfolioUrl(imageFile: string) {
  const normalized = String(imageFile ?? "").replace(/\\/g, "/").replace(/^\/+/, "");
  if (!normalized) return "";
  if (normalized.startsWith("portfolio/")) {
    return `/${normalized.split("/").map(encodeURIComponent).join("/")}`.replace("/portfolio%2F", "/portfolio/");
  }
  return `/portfolio/${normalized.split("/").map(encodeURIComponent).join("/")}`;
}

function safeFolderName(value: unknown) {
  const raw = String(value ?? "").trim();
  return raw
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "-")
    .replace(/\.+$/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 120);
}

function portfolioRuntimeDir() {
  return path.join(runtimeUploadsDir(), "portfolio");
}

function portfolioBundledDir() {
  return path.join(process.cwd(), "public", "portfolio");
}

function portfolioPath(root: string, imageFile: string) {
  const segments = String(imageFile ?? "").replace(/\\/g, "/").replace(/^\/+/, "").split("/").filter(Boolean);
  return safeUploadPath(root, segments);
}

async function movePortfolioFile(oldImageFile: string, newImageFile: string) {
  const targetPath = portfolioPath(portfolioRuntimeDir(), newImageFile);
  if (!targetPath) return;

  await mkdir(path.dirname(targetPath), { recursive: true });

  for (const root of [portfolioRuntimeDir(), portfolioBundledDir()]) {
    const sourcePath = portfolioPath(root, oldImageFile);
    if (!sourcePath) continue;

    try {
      await rename(sourcePath, targetPath);
      return;
    } catch {
      // Try the next possible storage root.
    }
  }
}

async function deletePortfolioFile(imageFile: string) {
  for (const root of [portfolioRuntimeDir(), portfolioBundledDir()]) {
    const filePath = portfolioPath(root, imageFile);
    if (!filePath) continue;

    try {
      await unlink(filePath);
    } catch {
      // File may live in another storage root or may already be gone.
    }
  }
}

function serializePortfolioImage(item: PortfolioImageRow) {
  return {
    image_id: Number(item.image_id),
    project_id: Number(item.project_id),
    image_file: toPortfolioUrl(item.image_file ?? ""),
    upload_date: item.upload_date ?? "",
    created_by: item.created_by ?? "",
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("project_id");
    const session = await getApiSession();
    const isAuthenticated = session?.role === "admin" || session?.role === "staff";

    let query = `SELECT image_id, project_id, image_file, upload_date, created_by FROM portfolio_image`;
    const queryParams: string[] = [];

    if (projectId) {
      query += ` WHERE project_id = ?`;
      queryParams.push(projectId);
      if (!isAuthenticated) {
        query += ` AND EXISTS (SELECT 1 FROM project p WHERE p.project_id = portfolio_image.project_id AND p.status = '2')`;
      }
    } else if (!isAuthenticated) {
      query += ` WHERE EXISTS (SELECT 1 FROM project p WHERE p.project_id = portfolio_image.project_id AND p.status = '2')`;
    }

    query += ` ORDER BY image_id DESC`;
    const [rows] = await pool.execute<PortfolioImageDbRow[]>(query, queryParams);
    const images = Array.isArray(rows) ? rows.map(serializePortfolioImage) : [];
    return NextResponse.json({ images });
  } catch (error) {
    console.error("Load portfolio images error:", error);
    return NextResponse.json({ error: "ไม่สามารถโหลดข้อมูลภาพผลงานได้" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireApiAuth();
  if (!auth.ok) return auth.response;

  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;
    const projectId = data.get("project_id") as string;
    const createdBy = data.get("created_by") as string;

    if (!file) {
      return NextResponse.json({ error: "No file received" }, { status: 400 });
    }

    if (!projectId || !createdBy) {
      return NextResponse.json({ error: "Missing project_id or created_by" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "รองรับเฉพาะไฟล์ JPG และ PNG เท่านั้น" }, { status: 400 });
    }

    // Validate file size (50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "ไฟล์ใหญ่เกินไป กรุณาเลือกไฟล์ไม่เกิน 50MB" }, { status: 400 });
    }

    // Get project name
    const [projectRows] = await pool.execute<RowDataPacket[]>(
      `SELECT project_name FROM project WHERE project_id = ?`,
      [Number(projectId)]
    );
    if (projectRows.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 400 });
    }
    const projectName = safeFolderName(projectRows[0].project_name);

    // Create portfolio directory if not exists
    const portfolioDir = portfolioRuntimeDir();
    await mkdir(portfolioDir, { recursive: true });

    // Create project directory if not exists
    const projectDir = path.join(portfolioDir, projectName);
    await mkdir(projectDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const extension = path.extname(file.name);
    const filename = `${timestamp}_${Math.random().toString(36).substring(2)}${extension}`;
    const filepath = path.join(projectDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Save to database - use local date instead of UTC to avoid timezone issues
    const today = new Date(new Date().getTime() + 7 * 60 * 60 * 1000).toISOString().split('T')[0];
    const imageFilePath = `${projectName}/${filename}`;
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO portfolio_image (project_id, image_file, upload_date, created_by)
       VALUES (?, ?, ?, ?)`,
      [Number(projectId), imageFilePath, today, createdBy]
    );

    const insertId = typeof result?.insertId === "number" ? result.insertId : null;

    return NextResponse.json({
      image: {
        image_id: insertId,
        project_id: Number(projectId),
        image_file: imageFilePath,
        upload_date: today,
        created_by: createdBy,
      },
      url: `/portfolio/${imageFilePath}`
    }, { status: 201 });
  } catch (error) {
    console.error("Upload portfolio image error:", error);
    return NextResponse.json({ error: "ไม่สามารถอัปโหลดภาพผลงานได้" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireApiAuth();
  if (!auth.ok) return auth.response;

  try {
    const data = await request.json();
    const imageId = Number(data.image_id);
    const projectId = Number(data.project_id);
    const createdBy = String(data.created_by ?? "").trim();

    if (!imageId || !projectId || !createdBy) {
      return NextResponse.json({ error: "Missing image_id, project_id or created_by" }, { status: 400 });
    }

    const [projectRows] = await pool.execute<RowDataPacket[]>(
      `SELECT project_id, project_name FROM project WHERE project_id = ? LIMIT 1`,
      [projectId]
    );
    if (projectRows.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 400 });
    }

    const [imageRows] = await pool.execute<PortfolioImageDbRow[]>(
      `SELECT image_id, image_file FROM portfolio_image WHERE image_id = ? LIMIT 1`,
      [imageId]
    );
    if (imageRows.length === 0) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const oldImageFile = String(imageRows[0].image_file ?? "").replace(/\\/g, "/").replace(/^\/+/, "");
    const fileName = path.basename(oldImageFile);
    const newProjectName = safeFolderName(projectRows[0].project_name);
    const newImageFile = `${newProjectName}/${fileName}`;

    if (oldImageFile && oldImageFile !== newImageFile) {
      await movePortfolioFile(oldImageFile, newImageFile);
    }

    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE portfolio_image
       SET project_id = ?, image_file = ?, created_by = ?
       WHERE image_id = ?`,
      [projectId, newImageFile, createdBy, imageId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const [rows] = await pool.execute<PortfolioImageDbRow[]>(
      `SELECT image_id, project_id, image_file, upload_date, created_by
       FROM portfolio_image
       WHERE image_id = ?
       LIMIT 1`,
      [imageId]
    );

    return NextResponse.json({ image: serializePortfolioImage(rows[0]) });
  } catch (error) {
    console.error("Update portfolio image error:", error);
    return NextResponse.json({ error: "ไม่สามารถแก้ไขข้อมูลภาพผลงานได้" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireApiAuth();
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const imageIds = searchParams.get("ids")?.split(",").map(Number) || [];
    
    if (imageIds.length === 0) {
      return NextResponse.json({ error: "No image IDs provided" }, { status: 400 });
    }

    // Get image records
    const placeholders = imageIds.map(() => "?").join(",");
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT image_id, image_file FROM portfolio_image WHERE image_id IN (${placeholders})`,
      imageIds
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Images not found" }, { status: 404 });
    }

    // Delete files and DB records
    for (const row of rows) {
      await deletePortfolioFile(String(row.image_file ?? ""));
    }

    // Delete from database
    await pool.execute(
      `DELETE FROM portfolio_image WHERE image_id IN (${placeholders})`,
      imageIds
    );

    return NextResponse.json({ 
      message: `Deleted ${rows.length} images`,
      deletedCount: rows.length
    }, { status: 200 });
  } catch (error) {
    console.error("Delete portfolio image error:", error);
    return NextResponse.json({ error: "ไม่สามารถลบภาพผลงานได้" }, { status: 500 });
  }
}
