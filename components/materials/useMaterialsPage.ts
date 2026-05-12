"use client";

import { useEffect, useState } from "react";

type Material = {
  id: string;
  code: string;
  name: string;
  type: string;
  unit: string;
  quantity: number;
};

type FormState = {
  code: string;
  name: string;
  type: string;
  unit: string;
  quantity: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

export const MAT_TYPES = [
  "วัสดุก่อสร้าง",
  "วัสดุตกแต่ง",
  "อุปกรณ์ไฟฟ้า",
  "อุปกรณ์ประปา",
  "เครื่องมือช่าง",
  "วัสดุสี",
  "อื่นๆ",
];

export const MAT_UNITS = [
  "ชิ้น",
  "อัน",
  "เส้น",
  "แผ่น",
  "ถุง",
  "ถัง",
  "กล่อง",
  "ม้วน",
  "เมตร",
  "ตร.ม.",
  "กก.",
  "ลิตร",
  "ชุด",
];

export const TYPE_COLOR: Record<string, { bg: string; color: string }> = {
  "วัสดุก่อสร้าง": { bg: "#fef9c3", color: "#854d0e" },
  "วัสดุตกแต่ง": { bg: "#ede9fe", color: "#6d28d9" },
  "อุปกรณ์ไฟฟ้า": { bg: "#dbeafe", color: "#1e40af" },
  "อุปกรณ์ประปา": { bg: "#ccfbf1", color: "#0f766e" },
  "เครื่องมือช่าง": { bg: "#fee2e2", color: "#991b1b" },
  "วัสดุสี": { bg: "#fce7f3", color: "#9d174d" },
  "อื่นๆ": { bg: "#f3f4f6", color: "#374151" },
};

const EMPTY: FormState = {
  code: "",
  name: "",
  type: "วัสดุก่อสร้าง",
  unit: "ชิ้น",
  quantity: "0",
};

export function fmt(value: string | number) {
  const number = typeof value === "string" ? Number(value) : value;
  return Number.isFinite(number) ? number.toLocaleString("th-TH") : "-";
}

function isWholeNumber(value: string) {
  return /^\d+$/.test(value.trim());
}

export function stockStatus(quantity: number) {
  return quantity <= 0 ? "หมด" : "มีคงเหลือ";
}

export const STOCK_STYLE: Record<string, { bg: string; color: string; dot: string }> = {
  "มีคงเหลือ": { bg: "#dcfce7", color: "#16a34a", dot: "#16a34a" },
  "หมด": { bg: "#fee2e2", color: "#dc2626", dot: "#dc2626" },
};

function validate(form: FormState) {
  const errors: FormErrors = {};

  if (form.code.trim() && form.code.trim().length > 5) {
    errors.code = "รหัสวัสดุต้องไม่เกิน 5 ตัวอักษร";
  }
  if (!form.name.trim()) errors.name = "กรุณากรอกชื่อวัสดุ/อุปกรณ์";
  if (!form.type.trim()) errors.type = "กรุณาเลือกประเภท";
  if (!form.unit.trim()) errors.unit = "กรุณาเลือกหน่วยนับ";
  if (!form.quantity.trim()) {
    errors.quantity = "กรุณากรอกจำนวนคงเหลือ";
  } else if (!isWholeNumber(form.quantity)) {
    errors.quantity = "จำนวนคงเหลือต้องเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป";
  }

  return errors;
}

export function useMaterialsPage() {
  const [items, setItems] = useState<Material[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ทั้งหมด");
  const [stockFilter, setStockFilter] = useState("ทั้งหมด");
  const [view, setView] = useState<"table" | "grid">("table");
  const [modal, setModal] = useState<"none" | "add" | "edit" | "delete">("none");
  const [editTarget, setEditTarget] = useState<Material | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Material | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [globalErr, setGlobalErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  async function loadMaterials() {
    try {
      setLoading(true);
      const res = await fetch("/api/materials");
      const data: { materials?: Material[]; error?: string } = await res.json();
      if (!res.ok) throw new Error(data.error || "Load failed");
      setItems(Array.isArray(data.materials) ? data.materials : []);
    } catch (error) {
      console.error("Load materials failed:", error);
      setGlobalErr(error instanceof Error ? error.message : "ไม่สามารถโหลดข้อมูลวัสดุได้");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMaterials();
  }, []);

  const filtered = items.filter((item) => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      item.code.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q);
    const matchType = typeFilter === "ทั้งหมด" || item.type === typeFilter;
    const matchStock = stockFilter === "ทั้งหมด" || stockStatus(item.quantity) === stockFilter;
    return matchSearch && matchType && matchStock;
  });

  const outStock = items.filter((item) => item.quantity <= 0).length;
  const inStock = items.length - outStock;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const types = ["ทั้งหมด", ...MAT_TYPES];
  const stocks = ["ทั้งหมด", "มีคงเหลือ", "หมด"];

  function openAdd() {
    setForm(EMPTY);
    setErrors({});
    setGlobalErr("");
    setModal("add");
  }

  function openEdit(item: Material) {
    setEditTarget(item);
    setForm({
      code: item.code,
      name: item.name,
      type: item.type || "วัสดุก่อสร้าง",
      unit: item.unit || "ชิ้น",
      quantity: String(item.quantity ?? 0),
    });
    setErrors({});
    setGlobalErr("");
    setModal("edit");
  }

  function openDelete(item: Material) {
    setDeleteTarget(item);
    setModal("delete");
  }

  function closeModal() {
    setModal("none");
    setEditTarget(null);
    setDeleteTarget(null);
    setErrors({});
    setGlobalErr("");
  }

  function setF(key: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
    setGlobalErr("");
  }

  function setQuantityDigitsOnly(value: string) {
    setF("quantity", value.replace(/\D/g, ""));
  }

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  }

  async function handleSave() {
    const nextErrors = validate(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        id: editTarget?.id,
        code: form.code.trim(),
        name: form.name.trim(),
        type: form.type,
        unit: form.unit,
        quantity: Number(form.quantity || 0),
      };

      const res = await fetch("/api/materials", {
        method: modal === "add" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data: { material?: Material; error?: string } = await res.json();
      if (!res.ok || !data.material) throw new Error(data.error || "Save failed");

      if (modal === "add") {
        setItems((current) => [data.material!, ...current]);
        showToast("เพิ่มวัสดุ/อุปกรณ์สำเร็จ");
      } else {
        setItems((current) => current.map((item) => item.id === data.material!.id ? data.material! : item));
        showToast("บันทึกการแก้ไขสำเร็จ");
      }

      closeModal();
    } catch (error) {
      console.error("Save material failed:", error);
      setGlobalErr(error instanceof Error ? error.message : "ไม่สามารถบันทึกข้อมูลวัสดุได้");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/materials?id=${encodeURIComponent(deleteTarget.id)}`, {
        method: "DELETE",
      });
      const data: { error?: string } = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");

      setItems((current) => current.filter((item) => item.id !== deleteTarget.id));
      closeModal();
      showToast("ลบวัสดุ/อุปกรณ์เรียบร้อย");
    } catch (error) {
      console.error("Delete material failed:", error);
      setGlobalErr(error instanceof Error ? error.message : "ไม่สามารถลบวัสดุได้");
    } finally {
      setSaving(false);
    }
  }

  return {
    items,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    stockFilter,
    setStockFilter,
    view,
    setView,
    modal,
    deleteTarget,
    form,
    errors,
    globalErr,
    loading,
    saving,
    toast,
    filtered,
    outStock,
    inStock,
    totalQuantity,
    types,
    stocks,
    openAdd,
    openEdit,
    openDelete,
    closeModal,
    setF,
    setQuantityDigitsOnly,
    handleSave,
    handleDelete,
  };
}
