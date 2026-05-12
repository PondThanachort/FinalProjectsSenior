"use client";

import { useEffect, useState, useRef, type ChangeEvent, type DragEvent } from "react";

// ── Types (ตรงกับ DB Schema) ────────────────────────────────────────────────────
interface Purchase {
  purchase_id:  number;         // PK, AUTO_INCREMENT
  file_name:    string;         // Varchar(255)
  file_type:    string;         // Varchar(50)
  upload_date:  string;         // Varchar(255), Current
  total_price:  string;         // DECIMAL(10,2), >=0
  created_by:   string;         // Varchar(50)
  supplier:     string;         // Varchar(255)
  items:        PurchaseItem[];
}

interface PurchaseItem {
  purchase_id:  number;  // FK
  material_id:  string;  // FK
  price:        string;  // DECIMAL(10,2), >=0
  quantity:     string;  // INT, >0
}

interface UploadedFile {
  name:        string;
  type:        string;  // "image/jpeg" | "image/png" | "application/pdf"
  size:        number;
  preview:     string;
  converted:   boolean;
  error:       string;
  raw:          File | null;
}

interface MaterialOption {
  material_id: string;
  code:        string;
  name:        string;
  unit:        string;
}

type StaffOptionUser = {
  first_name?: string;
  last_name?:  string;
};

interface FormState {
  supplier:    string;
  total_price: string;
  created_by:  string;
  file:        UploadedFile | null;
  items:       PurchaseItem[];
}

interface FormErrors {
  supplier?:    string;
  total_price?: string;
  created_by?:  string;
  file?:        string;
  [key: string]: string | undefined;
}

// ── Constants ──────────────────────────────────────────────────────────────────
export const MAX_FILE_SIZE_MB  = 50;
const MAX_FILE_SIZE     = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES    = ["image/jpeg","image/jpg","image/png","application/pdf"];
const ALLOWED_EXTS     = [".jpg",".jpeg",".png",".pdf"];

export const STAFF    = ["สมชาย ใจดี","วิภา รักดี","ประเสริฐ ช่างดี","นภา สุขใจ"];
// ── Helpers ────────────────────────────────────────────────────────────────────
export function fmtDate(iso: string) {
  if (!iso) return "-";
  const [y,m,d] = iso.split("-");
  const months = ["","ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
  return `${parseInt(d)} ${months[parseInt(m)]} ${parseInt(y)+543}`;
}
export function fmt(n: number|string) {
  const num = typeof n==="string" ? parseFloat(n) : n;
  return isNaN(num) ? "-" : num.toLocaleString("th-TH",{minimumFractionDigits:2,maximumFractionDigits:2});
}
export function toNum(s: string) { const n=parseFloat(s); return isNaN(n)?0:n; }
function isNonNegNum(s: string){ return /^\d+(\.\d+)?$/.test(s.trim()); }
function isPosInt(s: string)   { return /^\d+$/.test(s.trim()) && parseInt(s)>0; }
function digitsOnly(value: string) { return value.replace(/\D/g, ""); }
export function fmtSize(b: number) {
  if (b < 1024)      return `${b} B`;
  if (b < 1024*1024) return `${(b/1024).toFixed(1)} KB`;
  return `${(b/1024/1024).toFixed(1)} MB`;
}
export function purchaseFileSrc(fileName: string) {
  const value = String(fileName ?? "").trim().replace(/\\/g, "/");
  if (!value) return "";
  if (value.startsWith("data:") || value.startsWith("blob:") || /^https?:\/\//.test(value)) return value;
  if (value.startsWith("/")) return value;
  if (value.startsWith("purchase/")) return `/${value.split("/").map(encodeURIComponent).join("/")}`.replace("/purchase%2F", "/purchase/");
  return `/purchase/${value.split("/").map(encodeURIComponent).join("/")}`;
}

// ── Validate file ──────────────────────────────────────────────────────────────
function validateFile(file: File): string {
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTS.includes(ext)) {
    return "รองรับเฉพาะไฟล์ JPG, PNG และ PDF เท่านั้น";
  }
  if (file.size > MAX_FILE_SIZE) {
    return `ขนาดไฟล์เกินกำหนด กรุณาอัปโหลดไฟล์ใหม่ (สูงสุด ${MAX_FILE_SIZE_MB} MB)`;
  }
  return "";
}

// ── Validate form ──────────────────────────────────────────────────────────────
function validateForm(f: FormState, isEdit: boolean): FormErrors {
  const e: FormErrors = {};
  if (!f.supplier.trim())    e.supplier    = "กรุณากรอกข้อมูลให้ครบถ้วน (ระบุแหล่งจัดซื้อ)";
  if (!f.created_by)         e.created_by  = "กรุณากรอกข้อมูลให้ครบถ้วน (เลือกผู้อัปโหลด)";
  if (!f.total_price.trim()) e.total_price = "กรุณากรอกข้อมูลให้ครบถ้วน (ระบุราคารวม)";
  else if (!isNonNegNum(f.total_price)) e.total_price = "กรุณากรอกข้อมูลให้ถูกต้องตามประเภทที่กำหนด (ตัวเลข >= 0)";

  if (!isEdit && !f.file) e.file = "กรุณากรอกข้อมูลให้ครบถ้วน (อัปโหลดไฟล์เอกสาร)";
  if (f.file?.error)      e.file = f.file.error;

  // validate items ที่กรอก
  f.items.forEach((it, i) => {
    if (!it.material_id) return;
    if (!it.price.trim())     e[`item_price_${i}`]    = "กรุณากรอกข้อมูลให้ครบถ้วน";
    else if (!isNonNegNum(it.price)) e[`item_price_${i}`] = "กรุณากรอกข้อมูลให้ถูกต้องตามประเภทที่กำหนด (ตัวเลข)";
    if (!it.quantity.trim())  e[`item_qty_${i}`]      = "กรุณากรอกข้อมูลให้ครบถ้วน";
    else if (!isPosInt(it.quantity)) e[`item_qty_${i}`] = "กรุณากรอกข้อมูลให้ถูกต้องตามประเภทที่กำหนด (จำนวนเต็ม > 0)";
  });

  return e;
}

const EMPTY_ITEM = (): PurchaseItem => ({ purchase_id:0, material_id:"", price:"", quantity:"" });
const EMPTY_FORM: FormState = { supplier:"", total_price:"", created_by:"", file:null, items:[EMPTY_ITEM()] };

// ─────────────────────────────────────────────────────────────────────────────

export function poRef(id: number) { return `PO-${new Date().getFullYear()}-${String(id).padStart(3,"0")}`; }

export function usePurchasePage() {
  const [purchases,    setPurchases]    = useState<Purchase[]>([]);
  const [materials,    setMaterials]    = useState<MaterialOption[]>([]);
  const [search,       setSearch]       = useState("");
  const [supplierFilter, setSupplierFilter] = useState("ทั้งหมด");
  const [modal,        setModal]        = useState<"none"|"add"|"edit"|"delete"|"view">("none");
  const [editTarget,   setEditTarget]   = useState<Purchase | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Purchase | null>(null);
  const [viewTarget,   setViewTarget]   = useState<Purchase | null>(null);
  const [form,         setForm]         = useState<FormState>(EMPTY_FORM);
  const [errors,       setErrors]       = useState<FormErrors>({});
  const [globalErr,    setGlobalErr]    = useState("");
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const converting = false;
  const [toast,        setToast]        = useState("");
  const [isDragging,   setIsDragging]   = useState(false);
  const [staffOptions, setStaffOptions] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function loadPageData() {
    try {
      setLoading(true);
      const [purchaseRes, materialRes, usersRes] = await Promise.all([
        fetch("/api/purchase"),
        fetch("/api/materials"),
        fetch("/api/users"),
      ]);
      const purchaseData: { purchases?: Purchase[]; error?: string } = await purchaseRes.json();
      const materialData: {
        materials?: { id: string; code: string; name: string; unit: string }[];
        error?: string;
      } = await materialRes.json();
      const usersData: { users?: StaffOptionUser[]; error?: string } = usersRes.ok ? await usersRes.json() : {};

      if (!purchaseRes.ok) throw new Error(purchaseData.error || "Load purchase failed");
      if (!materialRes.ok) throw new Error(materialData.error || "Load materials failed");

      setPurchases(Array.isArray(purchaseData.purchases) ? purchaseData.purchases : []);
      setMaterials((materialData.materials || []).map((m) => ({
        material_id: m.id,
        code: m.code,
        name: m.name,
        unit: m.unit,
      })));
      setStaffOptions(Array.isArray(usersData.users)
        ? usersData.users
            .map((user) => `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim())
            .filter(Boolean)
        : []
      );
      setGlobalErr("");
    } catch (error) {
      console.error("Load purchase page failed:", error);
      setGlobalErr(error instanceof Error ? error.message : "ไม่สามารถโหลดข้อมูลการสั่งซื้อได้");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPageData();
  }, []);

  // ── Filter ───────────────────────────────────────────────────────────────────
  const suppliers = ["ทั้งหมด", ...Array.from(new Set(purchases.map(p=>p.supplier)))];
  const filtered  = purchases.filter(p => {
    const q  = search.toLowerCase();
    const ms = !q || `PO-${String(p.purchase_id).padStart(3,"0")}`.toLowerCase().includes(q)
                  || p.supplier.toLowerCase().includes(q) || p.file_name.toLowerCase().includes(q)
                  || p.created_by.toLowerCase().includes(q);
    const msup = supplierFilter==="ทั้งหมด" || p.supplier===supplierFilter;
    return ms && msup;
  });

  const totalValue = filtered.reduce((s,p)=>s+toNum(p.total_price),0);

  // ── File handler ──────────────────────────────────────────────────────────────
  async function processFile(raw: File) {
    const err = validateFile(raw);
    if (err) {
      setForm(f => ({ ...f, file: { name:raw.name, type:raw.type, size:raw.size, preview:"", converted:false, error:err, raw } }));
      setErrors(e => ({ ...e, file:err }));
      return;
    }

    const isImage = raw.type.startsWith("image/");
    const preview = isImage ? URL.createObjectURL(raw) : "";

    if (isImage) {
      setForm(f => ({ ...f, file: { name:raw.name, type:raw.type, size:raw.size, preview, converted:false, error:"", raw } }));
    } else {
      setForm(f => ({ ...f, file: { name:raw.name, type:"application/pdf", size:raw.size, preview:"", converted:false, error:"", raw } }));
    }
    setErrors(e => { const n={...e}; delete n.file; return n; });
    setGlobalErr("");
  }

  function handleFileInput(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) processFile(f);
    e.target.value = "";
  }
  function handleDrop(e: DragEvent) {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) processFile(f);
  }

  // ── Item helpers ──────────────────────────────────────────────────────────────
  function setItemF(i: number, k: keyof PurchaseItem, v: string | number) {
    setForm(f => { const items=[...f.items]; items[i]={...items[i],[k]:v}; return {...f,items}; });
    const eKeys = [`item_price_${i}`,`item_qty_${i}`];
    eKeys.forEach(ek => { if (errors[ek]) setErrors(e=>{const n={...e};delete n[ek];return n;}); });
    setGlobalErr("");
  }
  function addItem()      { setForm(f=>({...f,items:[...f.items,EMPTY_ITEM()]})); }
  function removeItem(i: number) {
    if (form.items.length<=1) return;
    setForm(f=>({...f,items:f.items.filter((_,idx)=>idx!==i)}));
  }

  // auto-calc total from items
  const calcTotal = form.items.reduce((s,it)=>{
    if (!it.material_id) return s;
    return s + toNum(it.price)*toNum(it.quantity);
  },0);

  // ── Modal helpers ─────────────────────────────────────────────────────────────
  function openAdd() {
    setForm(EMPTY_FORM); setErrors({}); setGlobalErr(""); setModal("add");
  }
  function openEdit(p: Purchase) {
    setEditTarget(p);
    setForm({ supplier:p.supplier, total_price:p.total_price, created_by:p.created_by, file:null,
              items: p.items.map(it=>({...it,price:it.price,quantity:it.quantity})) });
    setErrors({}); setGlobalErr(""); setModal("edit");
  }
  function openDelete(p: Purchase) { setDeleteTarget(p); setModal("delete"); }
  function openView(p: Purchase)   { setViewTarget(p); setModal("view"); }
  function closeModal()            { setModal("none"); setEditTarget(null); setDeleteTarget(null); setViewTarget(null); setErrors({}); setGlobalErr(""); }

  function setF(k: keyof Omit<FormState,"items"|"file">, v: string) {
    setForm(f=>({...f,[k]:v}));
    if (errors[k]) setErrors(e=>{const n={...e};delete n[k];return n;});
    setGlobalErr("");
  }

  function setNumericF(k: "total_price", v: string) {
    setF(k, digitsOnly(v));
  }

  function setNumericItemF(i: number, k: "price" | "quantity", v: string) {
    setItemF(i, k, digitsOnly(v));
  }

  function blockNonDigitInput(event: React.FormEvent<HTMLInputElement>) {
    const input = event.nativeEvent as InputEvent;
    if (input.data && /\D/.test(input.data)) event.preventDefault();
  }

  function blockNonDigitPaste(event: React.ClipboardEvent<HTMLInputElement>) {
    if (/\D/.test(event.clipboardData.getData("text"))) event.preventDefault();
  }

  // ── Save ──────────────────────────────────────────────────────────────────────
  async function handleSave() {
    const isEdit = modal==="edit";
    const allEmpty = !form.supplier.trim() && !form.total_price.trim() && !form.created_by;
    if (allEmpty) { setGlobalErr("กรุณากรอกข้อมูลให้ครบถ้วน"); return; }

    const errs = validateForm(form, isEdit);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSaving(true);
    try {
      const cleanItems = form.items.filter(it=>it.material_id);

      if (modal==="add") {
        const body = new FormData();
        body.append("supplier", form.supplier.trim());
        body.append("total_price", form.total_price.trim());
        body.append("created_by", form.created_by);
        body.append("items", JSON.stringify(cleanItems));
        body.append("file", form.file!.raw as File, form.file!.name);

        const res = await fetch("/api/purchase", { method:"POST", body });
        const data: { purchase?: Purchase; error?: string } = await res.json();
        if (!res.ok || !data.purchase) throw new Error(data.error || "Save failed");

        setPurchases(prev=>[data.purchase!, ...prev]);
        showToast("เพิ่มรายการสั่งซื้อสำเร็จ");
      } else if (isEdit && editTarget) {
        const payload = {
          purchase_id: editTarget.purchase_id,
          file_name: editTarget.file_name,
          file_type: editTarget.file_type,
          upload_date: editTarget.upload_date,
          supplier: form.supplier.trim(),
          total_price: form.total_price.trim(),
          created_by: form.created_by,
          items: cleanItems,
        };

        const res = await fetch("/api/purchase", {
          method:"PATCH",
          headers:{ "Content-Type":"application/json" },
          body: JSON.stringify(payload),
        });
        const data: { purchase?: Purchase; error?: string } = await res.json();
        if (!res.ok || !data.purchase) throw new Error(data.error || "Save failed");

        setPurchases(prev=>prev.map(p=>p.purchase_id===editTarget.purchase_id ? data.purchase! : p));
        showToast("บันทึกการแก้ไขสำเร็จ");
      }

      closeModal();
    } catch (error) {
      console.error("Save purchase failed:", error);
      setGlobalErr(error instanceof Error ? error.message : "ไม่สามารถบันทึกรายการสั่งซื้อได้");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/purchase?id=${encodeURIComponent(deleteTarget.purchase_id)}`, {
        method:"DELETE",
      });
      const data: { error?: string } = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");

      setPurchases(prev=>prev.filter(p=>p.purchase_id!==deleteTarget.purchase_id));
      closeModal();
      showToast("ลบรายการสั่งซื้อเรียบร้อย");
    } catch (error) {
      console.error("Delete purchase failed:", error);
      setGlobalErr(error instanceof Error ? error.message : "ไม่สามารถลบรายการสั่งซื้อได้");
    } finally {
      setSaving(false);
    }
  }

  function showToast(msg: string) { setToast(msg); setTimeout(()=>setToast(""),3000); }


  // ─────────────────────────────────────────────────────────────────────────────

  return {
    purchases,
    materials,
    search,
    setSearch,
    supplierFilter,
    setSupplierFilter,
    modal,
    editTarget,
    deleteTarget,
    viewTarget,
    form,
    setForm,
    errors,
    setErrors,
    globalErr,
    loading,
    saving,
    converting,
    toast,
    isDragging,
    setIsDragging,
    staffOptions,
    fileInputRef,
    suppliers,
    filtered,
    totalValue,
    handleFileInput,
    handleDrop,
    setItemF,
    addItem,
    removeItem,
    calcTotal,
    openAdd,
    openEdit,
    openDelete,
    openView,
    closeModal,
    setF,
    setNumericF,
    setNumericItemF,
    blockNonDigitInput,
    blockNonDigitPaste,
    handleSave,
    handleDelete,
  };
}
