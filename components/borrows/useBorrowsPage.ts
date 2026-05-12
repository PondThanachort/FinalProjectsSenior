"use client";

import { useEffect, useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────
type TxType = "borrow" | "return";
type TxStatus = "ค้างคืน" | "คืนแล้ว" | "ใช้หมด";

interface Material {
  id: string; code: string; name: string; unit: string; qty: number;
}
interface Project {
  id: string; name: string;
}
interface Transaction {
  id:         number;
  date:       string;
  returnDate?: string;
  type:       TxType;
  materialId: string;
  materialName?: string;
  materialCode?: string;
  unit?: string;
  projectId:  string | null;
  projectName?: string;
  qtyBorrow:  number;
  qtyReturn:  number;
  borrower:   string;
  returner:   string;
  status:     TxStatus;
  note:       string;
}
interface BorrowForm {
  materialId: string;
  projectId:  string;
  qty:        string;
  borrower:   string;
  date:       string;
  note:       string;
}
interface ReturnForm {
  txId:      string;
  qty:       string;
  returner:  string;
  date:      string;
  note:      string;
}
interface FormErrors { [k: string]: string }

// ── Helpers ────────────────────────────────────────────────────────────────────
function todayIso() { return new Date().toISOString().split("T")[0]; }
function emptyBorrowForm(): BorrowForm {
  return { materialId:"", projectId:"", qty:"", borrower:"", date: todayIso(), note:"" };
}
function emptyReturnForm(): ReturnForm {
  return { txId:"", qty:"", returner:"", date: todayIso(), note:"" };
}
export function fmtDate(iso: string) {
  if (!iso) return "-";
  const [y,m,d] = iso.split("-");
  const months = ["","ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
  return `${parseInt(d)} ${months[parseInt(m)]} ${parseInt(y)+543}`;
}
export function fmt(n: number) { return n.toLocaleString("th-TH"); }
export function isPos(s: string) { return /^\d+(\.\d+)?$/.test(s.trim()) && parseFloat(s) > 0; }
function digitsOnly(value: string) { return value.replace(/\D/g, ""); }

export const STATUS_S: Record<TxStatus, { bg:string; color:string; dot:string }> = {
  "คืนแล้ว":     { bg:"#dcfce7", color:"#16a34a", dot:"#16a34a" },
  "ค้างคืน":     { bg:"#fee2e2", color:"#dc2626", dot:"#dc2626" },
  "ใช้หมด":      { bg:"#e0e7ff", color:"#4338ca", dot:"#4338ca" },
};

// ── Validate borrow form ───────────────────────────────────────────────────────
function validateBorrow(f: BorrowForm, materials: Material[]): FormErrors {
  const e: FormErrors = {};
  if (!f.materialId) { e.materialId = "กรุณากรอกข้อมูลให้ครบถ้วน (เลือกวัสดุ)"; }
  if (!f.projectId)  { e.projectId  = "กรุณาเลือกโครงการ"; }
  if (!f.borrower.trim()) { e.borrower = "กรุณากรอกข้อมูลให้ครบถ้วน (ระบุผู้เบิก)"; }
  if (!f.date) { e.date = "กรุณาเลือกวันที่เบิก"; }
  if (!f.qty.trim()) { e.qty = "กรุณากรอกข้อมูลให้ครบถ้วน (ระบุจำนวน)"; }
  else if (!isPos(f.qty)) { e.qty = "กรุณากรอกข้อมูลให้ถูกต้องตามประเภทที่กำหนด (ตัวเลขมากกว่า 0)"; }
  else {
    // Exception 3: จำนวนไม่พอ
    const mat = materials.find(m => m.id === f.materialId);
    if (mat && parseFloat(f.qty) > mat.qty) {
      e.qty = `จำนวนวัสดุไม่เพียงพอ (คงเหลือ ${fmt(mat.qty)} ${mat.unit})`;
    }
  }
  return e;
}

// ── Validate return form ───────────────────────────────────────────────────────
function validateReturn(f: ReturnForm, txs: Transaction[], materials: Material[]): FormErrors {
  const e: FormErrors = {};
  if (!f.txId)     { e.txId    = "กรุณากรอกข้อมูลให้ครบถ้วน (เลือกรายการเบิก)"; }
  if (!f.returner.trim()) { e.returner= "กรุณากรอกข้อมูลให้ครบถ้วน (ระบุผู้คืน)"; }
  if (!f.date) { e.date = "กรุณาเลือกวันที่คืน"; }
  if (!f.qty.trim()) { e.qty = "กรุณากรอกข้อมูลให้ครบถ้วน (ระบุจำนวน)"; }
  else if (!isPos(f.qty)) { e.qty = "กรุณากรอกข้อมูลให้ถูกต้องตามประเภทที่กำหนด (ตัวเลขมากกว่า 0)"; }
  else if (f.txId) {
    const tx = txs.find(t => t.id === parseInt(f.txId));
    if (tx) {
      const remaining = tx.qtyBorrow - tx.qtyReturn;
      if (parseFloat(f.qty) > remaining) {
        // Exception 4: คืนเกินที่เบิก
        const mat = materials.find(m => m.id === tx.materialId);
        e.qty = `ไม่สามารถคืนเกินจำนวนที่เบิกได้ (คืนได้อีก ${fmt(remaining)} ${mat?.unit||""})`;
      }
    }
  }
  return e;
}

// ─────────────────────────────────────────────────────────────────────────────

export function useBorrowsPage() {
  const [materials,   setMaterials]   = useState<Material[]>([]);
  const [projects,    setProjects]    = useState<Project[]>([]);
  const [txs,         setTxs]         = useState<Transaction[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [globalErr,   setGlobalErr]   = useState("");

  // Tab: list | borrow | return
  const [tab,         setTab]         = useState<"list"|"borrow"|"return">("list");

  // Filter
  const [search,      setSearch]      = useState("");
  const [statusFilter,setStatusFilter]= useState("ทั้งหมด");
  const [projFilter,  setProjFilter]  = useState("ทั้งหมด");

  // Borrow form
  const [bForm,       setBForm]       = useState<BorrowForm>(() => emptyBorrowForm());
  const [bErrors,     setBErrors]     = useState<FormErrors>({});
  const [bGlobalErr,  setBGlobalErr]  = useState("");

  // Return form
  const [rForm,       setRForm]       = useState<ReturnForm>(() => emptyReturnForm());
  const [rErrors,     setRErrors]     = useState<FormErrors>({});
  const [rGlobalErr,  setRGlobalErr]  = useState("");

  // Success
  const [saving,      setSaving]      = useState(false);
  const [toast,       setToast]       = useState("");

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);

  async function loadData() {
    try {
      setLoading(true);
      setGlobalErr("");

      const [borrowRes, projectRes] = await Promise.all([
        fetch("/api/borrows"),
        fetch("/api/projects"),
      ]);
      const borrowData: { borrows?: Transaction[]; materials?: Material[]; error?: string } = await borrowRes.json();
      const projectData: { projects?: Array<{ id: number | string; name: string }>; error?: string } = await projectRes.json();

      if (!borrowRes.ok) throw new Error(borrowData.error || "Load borrows failed");
      if (!projectRes.ok) throw new Error(projectData.error || "Load projects failed");

      setTxs(Array.isArray(borrowData.borrows) ? borrowData.borrows : []);
      setMaterials(Array.isArray(borrowData.materials) ? borrowData.materials : []);
      setProjects((projectData.projects ?? []).map((project) => ({
        id: String(project.id),
        name: project.name,
      })));
    } catch (error) {
      console.error("Load borrow page failed:", error);
      setGlobalErr(error instanceof Error ? error.message : "ไม่สามารถโหลดข้อมูลเบิก-คืนวัสดุได้");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // ── Filter list ──────────────────────────────────────────────────────────────
  const filteredTxs = txs.filter(t => {
    const mat = materials.find(m => m.id === t.materialId);
    const q   = search.toLowerCase();
    const ms  = !q || mat?.name.toLowerCase().includes(q) || mat?.code.toLowerCase().includes(q) || t.borrower.toLowerCase().includes(q);
    const mst = statusFilter === "ทั้งหมด" || t.status === statusFilter;
    const mpr = projFilter   === "ทั้งหมด" || (t.projectId && projects.find(p=>p.id===t.projectId)?.name===projFilter);
    return ms && mst && mpr;
  });

  // ── KPI ──────────────────────────────────────────────────────────────────────
  const pending     = txs.filter(t => t.status === "ค้างคืน").length;
  const doneCount   = txs.filter(t => t.status === "คืนแล้ว").length;
  const usedUpCount = txs.filter(t => t.status === "ใช้หมด").length;

  // ── Field helpers ─────────────────────────────────────────────────────────────
  function setBF(k: keyof BorrowForm, v: string) {
    setBForm(f=>({...f,[k]:v}));
    if (bErrors[k]) setBErrors(e=>{const n={...e};delete n[k];return n;});
    setBGlobalErr("");
  }
  function setRF(k: keyof ReturnForm, v: string) {
    setRForm(f=>({...f,[k]:v}));
    if (rErrors[k]) setRErrors(e=>{const n={...e};delete n[k];return n;});
    setRGlobalErr("");
  }

  function setBorrowQtyDigitsOnly(value: string) {
    setBF("qty", digitsOnly(value));
  }

  function setReturnQtyDigitsOnly(value: string) {
    setRF("qty", digitsOnly(value));
  }

  function blockNonDigitInput(event: React.FormEvent<HTMLInputElement>) {
    const input = event.nativeEvent as InputEvent;
    if (input.data && /\D/.test(input.data)) event.preventDefault();
  }

  function blockNonDigitPaste(event: React.ClipboardEvent<HTMLInputElement>) {
    if (/\D/.test(event.clipboardData.getData("text"))) event.preventDefault();
  }

  // ── Selected material info ────────────────────────────────────────────────────
  const selectedMat  = materials.find(m => m.id === bForm.materialId);
  const selectedTx   = txs.find(t => t.id === parseInt(rForm.txId));
  const selectedRMat = selectedTx ? materials.find(m => m.id === selectedTx.materialId) : null;
  const canReturnQty = selectedTx ? selectedTx.qtyBorrow - selectedTx.qtyReturn : 0;

  // ── Pending txs for return form ───────────────────────────────────────────────
  const pendingTxs = txs.filter(t => t.status !== "คืนแล้ว" && t.status !== "ใช้หมด");

  function showToast(msg: string) { setToast(msg); setTimeout(()=>setToast(""),3500); }

  // ── Submit Borrow ─────────────────────────────────────────────────────────────
  async function handleBorrow() {
    const allEmpty = !bForm.materialId && !bForm.qty.trim() && !bForm.borrower.trim();
    if (allEmpty) { setBGlobalErr("กรุณากรอกข้อมูลให้ครบถ้วน"); return; }

    const errs = validateBorrow(bForm, materials);
    if (Object.keys(errs).length > 0) { setBErrors(errs); return; }

    setSaving(true);
    try {
      const mat = materials.find(m => m.id === bForm.materialId)!;
      const qty = Number(bForm.qty);
      const res = await fetch("/api/borrows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "borrow",
          materialId: bForm.materialId,
          projectId: bForm.projectId,
          qty,
          borrower: bForm.borrower.trim(),
          date: bForm.date,
        }),
      });
      const data: { borrow?: Transaction; error?: string } = await res.json();
      if (!res.ok || !data.borrow) throw new Error(data.error || "Save failed");

      setBForm(emptyBorrowForm());
      setBErrors({}); setBGlobalErr("");
      setTab("list");
      showToast(`เบิก ${mat.name} สำเร็จ`);
      await loadData();
    } catch (error) {
      console.error("Borrow failed:", error);
      setBGlobalErr(error instanceof Error ? error.message : "ไม่สามารถบันทึกรายการเบิกได้");
    } finally {
      setSaving(false);
    }
  }

  // ── Submit Return ─────────────────────────────────────────────────────────────
  async function handleReturn() {
    const allEmpty = !rForm.txId && !rForm.qty.trim() && !rForm.returner.trim();
    if (allEmpty) { setRGlobalErr("กรุณากรอกข้อมูลให้ครบถ้วน"); return; }

    const errs = validateReturn(rForm, txs, materials);
    if (Object.keys(errs).length > 0) { setRErrors(errs); return; }

    setSaving(true);
    try {
      const qty = Number(rForm.qty);
      const tx  = txs.find(t => t.id === parseInt(rForm.txId))!;
      const mat = materials.find(m => m.id === tx.materialId)!;
      const res = await fetch("/api/borrows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "return",
          id: tx.id,
          qty,
          returner: rForm.returner.trim(),
          date: rForm.date,
        }),
      });
      const data: { borrow?: Transaction; error?: string } = await res.json();
      if (!res.ok || !data.borrow) throw new Error(data.error || "Save failed");

      setRForm(emptyReturnForm());
      setRErrors({}); setRGlobalErr("");
      setTab("list");
      showToast(`คืน ${mat.name} สำเร็จ`);
      await loadData();
    } catch (error) {
      console.error("Return failed:", error);
      setRGlobalErr(error instanceof Error ? error.message : "ไม่สามารถบันทึกรายการคืนได้");
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────────
  async function handleUseUp(tx: Transaction) {
    if (!window.confirm("ยืนยันว่ารายการนี้ใช้หมดแล้ว? ระบบจะปิดรายการโดยไม่เพิ่มวัสดุกลับเข้าคลัง")) return;

    setSaving(true);
    try {
      const mat = materials.find(m => m.id === tx.materialId);
      const res = await fetch("/api/borrows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "use_up",
          id: tx.id,
          date: rForm.date || todayIso(),
        }),
      });
      const data: { borrow?: Transaction; error?: string } = await res.json();
      if (!res.ok || !data.borrow) throw new Error(data.error || "Save failed");

      setRForm(emptyReturnForm());
      setRErrors({}); setRGlobalErr("");
      setTab("list");
      showToast(`บันทึกใช้หมด ${mat?.name || tx.materialName || tx.materialId} สำเร็จ`);
      await loadData();
    } catch (error) {
      console.error("Use up failed:", error);
      showToast(error instanceof Error ? error.message : "ไม่สามารถบันทึกใช้หมดได้");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/borrows?id=${encodeURIComponent(deleteTarget.id)}`, {
        method: "DELETE",
      });
      const data: { error?: string } = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");

      setDeleteTarget(null);
      showToast("ลบรายการเรียบร้อย");
      await loadData();
    } catch (error) {
      console.error("Delete borrow failed:", error);
      showToast(error instanceof Error ? error.message : "ไม่สามารถลบรายการได้");
    } finally {
      setSaving(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return {
    materials,
    projects,
    txs,
    loading,
    globalErr,
    tab,
    setTab,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    projFilter,
    setProjFilter,
    bForm,
    bErrors,
    bGlobalErr,
    rForm,
    setRForm,
    rErrors,
    rGlobalErr,
    saving,
    toast,
    deleteTarget,
    setDeleteTarget,
    filteredTxs,
    pending,
    doneCount,
    usedUpCount,
    setBF,
    setRF,
    setBorrowQtyDigitsOnly,
    setReturnQtyDigitsOnly,
    blockNonDigitInput,
    blockNonDigitPaste,
    selectedMat,
    selectedTx,
    selectedRMat,
    canReturnQty,
    pendingTxs,
    handleBorrow,
    handleReturn,
    handleUseUp,
    handleDelete,
  };
}
