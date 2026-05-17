import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import pool from "@/lib/mysql";
import { requireApiAuth } from "@/lib/api-auth";
import { runtimeUploadsDir } from "@/lib/upload-storage";

type PurchaseRow = RowDataPacket & {
  purchase_id: number;
  file_name: string;
  file_type: string;
  upload_date: string | Date;
  total_price: number | string;
  created_by: string;
  supplier: string;
  material_id: string | null;
  price: number | string | null;
  quantity: number | string | null;
};

type PurchaseItemInput = {
  material_id?: unknown;
  price?: unknown;
  quantity?: unknown;
};

type PurchaseItemRow = RowDataPacket & {
  material_id: string;
  quantity: number | string;
};

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
const ALLOWED_EXTS = [".jpg", ".jpeg", ".png", ".pdf"];
const MAX_FILE_SIZE = 50 * 1024 * 1024;

function dateOnly(value: string | Date) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value ?? "").slice(0, 10);
}

function serializePurchases(rows: PurchaseRow[]) {
  const map = new Map<number, {
    purchase_id: number;
    file_name: string;
    file_type: string;
    upload_date: string;
    total_price: string;
    created_by: string;
    supplier: string;
    items: { purchase_id: number; material_id: string; price: string; quantity: string }[];
  }>();

  for (const row of rows) {
    if (!map.has(row.purchase_id)) {
      map.set(row.purchase_id, {
        purchase_id: row.purchase_id,
        file_name: row.file_name,
        file_type: row.file_type,
        upload_date: dateOnly(row.upload_date),
        total_price: String(row.total_price ?? "0"),
        created_by: row.created_by,
        supplier: row.supplier,
        items: [],
      });
    }

    if (row.material_id) {
      map.get(row.purchase_id)!.items.push({
        purchase_id: row.purchase_id,
        material_id: row.material_id,
        price: String(row.price ?? "0"),
        quantity: String(row.quantity ?? "0"),
      });
    }
  }

  return Array.from(map.values());
}

function toMoney(value: unknown) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : null;
}

function toPositiveInt(value: unknown) {
  const amount = Number(value);
  return Number.isInteger(amount) && amount > 0 ? amount : null;
}

function normalizeItems(value: unknown) {
  const source = Array.isArray(value) ? value : [];
  const items = source
    .map((item: PurchaseItemInput) => {
      const materialId = String(item.material_id ?? "").trim();
      const price = toMoney(item.price);
      const quantity = toPositiveInt(item.quantity);
      if (!materialId) return null;
      if (price === null || quantity === null) return null;
      return { materialId, price, quantity };
    })
    .filter(Boolean) as { materialId: string; price: number; quantity: number }[];

  return items;
}

function fileTypeLabel(file: File) {
  return file.type.startsWith("image/") ? "IMAGE" : "PDF";
}

function aggregateItemQty(items: { materialId: string; quantity: number }[]) {
  const totals = new Map<string, number>();
  for (const item of items) {
    totals.set(item.materialId, (totals.get(item.materialId) ?? 0) + item.quantity);
  }
  return totals;
}

async function adjustMaterialStock(connection: PoolConnection, deltas: Map<string, number>) {
  for (const [materialId, delta] of deltas.entries()) {
    if (delta === 0) continue;

    if (delta < 0) {
      const [rows] = await connection.execute<RowDataPacket[]>(
        `SELECT quantity FROM material WHERE material_id = ? FOR UPDATE`,
        [materialId]
      );
      const currentQty = Number(rows[0]?.quantity ?? 0);
      if (currentQty + delta < 0) {
        throw new Error(`ไม่สามารถปรับสต็อกวัสดุ ${materialId} ได้ เพราะจำนวนคงเหลือไม่เพียงพอ`);
      }
    }

    await connection.execute(
      `UPDATE material SET quantity = quantity + ? WHERE material_id = ?`,
      [delta, materialId]
    );
  }
}

function diffItemQty(
  oldItems: { materialId: string; quantity: number }[],
  newItems: { materialId: string; quantity: number }[]
) {
  const deltas = aggregateItemQty(newItems);
  for (const [materialId, quantity] of aggregateItemQty(oldItems).entries()) {
    deltas.set(materialId, (deltas.get(materialId) ?? 0) - quantity);
  }
  return deltas;
}

async function saveFile(file: File) {
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTS.includes(ext)) {
    throw new Error("รองรับเฉพาะไฟล์ JPG, PNG และ PDF เท่านั้น");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("ขนาดไฟล์เกินกำหนด กรุณาอัปโหลดไฟล์ไม่เกิน 50 MB");
  }

  const uploadsDir = path.join(runtimeUploadsDir(), "purchase");
  await mkdir(uploadsDir, { recursive: true });

  const safeExt = ext || (file.type === "application/pdf" ? ".pdf" : ".jpg");
  const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}${safeExt}`;
  const filePath = path.join(uploadsDir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  return fileName;
}

export async function GET() {
  const auth = await requireApiAuth();
  if (!auth.ok) return auth.response;

  try {
    const [rows] = await pool.execute<PurchaseRow[]>(
      `SELECT
         p.purchase_id,
         p.file_name,
         p.file_type,
         p.upload_date,
         p.total_price,
         p.created_by,
         p.supplier,
         pi.material_id,
         pi.price,
         pi.quantity
       FROM purchase p
       LEFT JOIN purchase_item pi ON pi.purchase_id = p.purchase_id
       ORDER BY p.purchase_id DESC`
    );

    return NextResponse.json({ purchases: serializePurchases(rows) });
  } catch (error) {
    console.error("Load purchases error:", error);
    return NextResponse.json({ error: "ไม่สามารถโหลดข้อมูลการสั่งซื้อได้" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireApiAuth();
  if (!auth.ok) return auth.response;

  const connection = await pool.getConnection();

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const supplier = String(formData.get("supplier") ?? "").trim();
    const createdBy = String(formData.get("created_by") ?? "").trim();
    const totalPrice = toMoney(formData.get("total_price"));
    const items = normalizeItems(JSON.parse(String(formData.get("items") ?? "[]")));

    if (!file || !supplier || !createdBy || totalPrice === null) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    const savedFileName = await saveFile(file);

    await connection.beginTransaction();
    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO purchase (file_name, file_type, upload_date, total_price, created_by, supplier)
       VALUES (?, ?, CURDATE(), ?, ?, ?)`,
      [savedFileName, fileTypeLabel(file), totalPrice, createdBy, supplier]
    );

    const purchaseId = result.insertId;
    for (const item of items) {
      await connection.execute(
        `INSERT INTO purchase_item (purchase_id, material_id, price, quantity)
         VALUES (?, ?, ?, ?)`,
        [purchaseId, item.materialId, item.price, item.quantity]
      );
    }
    await adjustMaterialStock(connection, aggregateItemQty(items));

    await connection.commit();

    return NextResponse.json({
      purchase: {
        purchase_id: purchaseId,
        file_name: savedFileName,
        file_type: fileTypeLabel(file),
        upload_date: new Date().toISOString().slice(0, 10),
        total_price: String(totalPrice),
        created_by: createdBy,
        supplier,
        items: items.map((item) => ({
          purchase_id: purchaseId,
          material_id: item.materialId,
          price: String(item.price),
          quantity: String(item.quantity),
        })),
      },
    }, { status: 201 });
  } catch (error) {
    await connection.rollback();
    console.error("Create purchase error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "ไม่สามารถเพิ่มรายการสั่งซื้อได้",
    }, { status: 500 });
  } finally {
    connection.release();
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireApiAuth();
  if (!auth.ok) return auth.response;

  const connection = await pool.getConnection();

  try {
    const data = await request.json();
    const purchaseId = Number(data.purchase_id);
    const supplier = String(data.supplier ?? "").trim();
    const createdBy = String(data.created_by ?? "").trim();
    const totalPrice = toMoney(data.total_price);
    const items = normalizeItems(data.items);

    if (!purchaseId || !supplier || !createdBy || totalPrice === null) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    await connection.beginTransaction();
    const [oldItemRows] = await connection.execute<PurchaseItemRow[]>(
      `SELECT material_id, quantity FROM purchase_item WHERE purchase_id = ? FOR UPDATE`,
      [purchaseId]
    );
    const oldItems = oldItemRows.map((item) => ({
      materialId: item.material_id,
      quantity: Number(item.quantity ?? 0),
    }));

    await connection.execute(
      `UPDATE purchase
       SET supplier = ?, total_price = ?, created_by = ?
       WHERE purchase_id = ?`,
      [supplier, totalPrice, createdBy, purchaseId]
    );

    await connection.execute(`DELETE FROM purchase_item WHERE purchase_id = ?`, [purchaseId]);
    for (const item of items) {
      await connection.execute(
        `INSERT INTO purchase_item (purchase_id, material_id, price, quantity)
         VALUES (?, ?, ?, ?)`,
        [purchaseId, item.materialId, item.price, item.quantity]
      );
    }
    await adjustMaterialStock(connection, diffItemQty(oldItems, items));

    await connection.commit();

    return NextResponse.json({
      purchase: {
        purchase_id: purchaseId,
        file_name: String(data.file_name ?? ""),
        file_type: String(data.file_type ?? "PDF"),
        upload_date: dateOnly(String(data.upload_date ?? "")),
        total_price: String(totalPrice),
        created_by: createdBy,
        supplier,
        items: items.map((item) => ({
          purchase_id: purchaseId,
          material_id: item.materialId,
          price: String(item.price),
          quantity: String(item.quantity),
        })),
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Update purchase error:", error);
    return NextResponse.json({ error: "ไม่สามารถแก้ไขรายการสั่งซื้อได้" }, { status: 500 });
  } finally {
    connection.release();
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireApiAuth();
  if (!auth.ok) return auth.response;

  const connection = await pool.getConnection();

  try {
    const { searchParams } = new URL(request.url);
    const purchaseId = Number(searchParams.get("id"));

    if (!purchaseId) {
      return NextResponse.json({ error: "ไม่พบรหัสรายการสั่งซื้อ" }, { status: 400 });
    }

    await connection.beginTransaction();
    const [oldItemRows] = await connection.execute<PurchaseItemRow[]>(
      `SELECT material_id, quantity FROM purchase_item WHERE purchase_id = ? FOR UPDATE`,
      [purchaseId]
    );
    const oldItems = oldItemRows.map((item) => ({
      materialId: item.material_id,
      quantity: Number(item.quantity ?? 0),
    }));
    const reverseDeltas = new Map<string, number>();
    for (const [materialId, quantity] of aggregateItemQty(oldItems).entries()) {
      reverseDeltas.set(materialId, -quantity);
    }
    await adjustMaterialStock(connection, reverseDeltas);

    await connection.execute(`DELETE FROM purchase_item WHERE purchase_id = ?`, [purchaseId]);
    await connection.execute(`DELETE FROM purchase WHERE purchase_id = ?`, [purchaseId]);
    await connection.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    await connection.rollback();
    console.error("Delete purchase error:", error);
    return NextResponse.json({ error: "ไม่สามารถลบรายการสั่งซื้อได้" }, { status: 500 });
  } finally {
    connection.release();
  }
}
