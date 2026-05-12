"use client";

import { useEffect, useState } from "react";

type TxKind = "income" | "expense";

interface Transaction {
  id: number;
  date: string;
  kind: TxKind;
  type: string;
  detail: string;
  amount: string;
  projectId: number | null;
  projectName?: string;
  purchaseId: number | null;
}

interface ProjectOption {
  id: number;
  name: string;
}

interface PurchaseOption {
  purchase_id: number;
  supplier: string;
  total_price: string;
}

interface FormState {
  date: string;
  kind: TxKind;
  type: string;
  detail: string;
  amount: string;
  projectId: number | null;
  purchaseId: number | null;
}

interface FormErrors { [k: string]: string }

const EMPTY_FORM: FormState = {
  date: "",
  kind: "income",
  type: "",
  detail: "",
  amount: "",
  projectId: null,
  purchaseId: null,
};

function todayIso() { return new Date().toISOString().split("T")[0]; }
export function fmtDate(iso: string) {
  if (!iso) return "-";
  const [y,m,d] = iso.split("-");
  const months = ["","ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
  return `${parseInt(d)} ${months[parseInt(m)]} ${parseInt(y)+543}`;
}
export function fmt(n: number) { return n.toLocaleString("th-TH",{minimumFractionDigits:2,maximumFractionDigits:2}); }
export function toNum(s: string) { const n = parseFloat(s); return isNaN(n) ? 0 : n; }
export function isPos(s: string) { return /^\d+(\.\d+)?$/.test(s.trim()) && parseFloat(s) > 0; }
export function poRef(id: number | null) { return id ? `PO-${String(id).padStart(3,"0")}` : ""; }
function digitsOnly(value: string) { return value.replace(/\D/g, ""); }

function validate(f: FormState): FormErrors {
  const e: FormErrors = {};

  if (!f.date) e.date = "กรุณาระบุวันที่";
  if (!f.type.trim()) e.type = "กรุณาระบุหมวดหมู่";
  if (!f.detail.trim()) e.detail = "กรุณาระบุรายละเอียด";
  if (!f.amount.trim()) e.amount = "กรุณาระบุจำนวนเงิน";
  else if (!isPos(f.amount)) e.amount = "กรุณาระบุจำนวนเงินเป็นตัวเลขมากกว่า 0";
  if (!f.projectId) e.projectId = "กรุณาเลือกโครงการ";

  return e;
}

export function useFinancesPage() {
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [purchases, setPurchases] = useState<PurchaseOption[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadErr, setLoadErr] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ทั้งหมด");
  const [projFilter, setProjFilter] = useState("ทั้งหมด");
  const [monthFilter, setMonthFilter] = useState("ทั้งหมด");
  const [modal, setModal] = useState<"none"|"add"|"edit"|"delete">("none");
  const [editTarget, setEditTarget] = useState<Transaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [globalErr, setGlobalErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoadingData(true);
    setLoadErr("");

    try {
      const [financeRes, projectsRes, purchaseRes] = await Promise.all([
        fetch("/api/finances"),
        fetch("/api/projects"),
        fetch("/api/purchase"),
      ]);

      if (!financeRes.ok) throw new Error("ไม่สามารถโหลดข้อมูลรายรับ-รายจ่ายได้");

      const financeData = await financeRes.json();
      const projectsData = projectsRes.ok ? await projectsRes.json() : { projects: [] };
      const purchaseData = purchaseRes.ok ? await purchaseRes.json() : { purchases: [] };

      setTxs(Array.isArray(financeData.finances) ? financeData.finances : []);
      setProjects(Array.isArray(projectsData.projects) ? projectsData.projects : []);
      setPurchases(Array.isArray(purchaseData.purchases) ? purchaseData.purchases : []);
    } catch (error) {
      console.error("Load finances page error:", error);
      setLoadErr(error instanceof Error ? error.message : "ไม่สามารถโหลดข้อมูลได้");
      setTxs([]);
    } finally {
      setLoadingData(false);
    }
  }

  function projectName(projectId: number | null, fallback = "") {
    return projects.find(p => p.id === projectId)?.name || fallback;
  }

  const months = ["ทั้งหมด", ...Array.from(new Set(txs.map(t => t.date.slice(0,7)).filter(Boolean))).sort().reverse()];

  const filtered = txs.filter(t => {
    const q = search.toLowerCase();
    const pName = projectName(t.projectId, t.projectName);
    const ms = !q
      || t.detail.toLowerCase().includes(q)
      || t.type.toLowerCase().includes(q)
      || pName.toLowerCase().includes(q)
      || poRef(t.purchaseId).toLowerCase().includes(q);
    const mt = typeFilter === "ทั้งหมด" || t.kind === (typeFilter==="รายรับ" ? "income" : "expense");
    const mp = projFilter === "ทั้งหมด" || pName === projFilter;
    const mm = monthFilter === "ทั้งหมด" || t.date.startsWith(monthFilter);
    return ms && mt && mp && mm;
  });

  const totalIncome = filtered.filter(t=>t.kind==="income").reduce((s,t)=>s+toNum(t.amount),0);
  const totalExpense = filtered.filter(t=>t.kind==="expense").reduce((s,t)=>s+toNum(t.amount),0);
  const netProfit = totalIncome - totalExpense;

  function openAdd(kind: TxKind) {
    setForm({ ...EMPTY_FORM, date: todayIso(), kind });
    setErrors({}); setGlobalErr(""); setModal("add");
  }

  function openEdit(t: Transaction) {
    setEditTarget(t);
    setForm({
      date: t.date,
      kind: t.kind,
      type: t.type,
      detail: t.detail,
      amount: t.amount,
      projectId: t.projectId,
      purchaseId: t.purchaseId,
    });
    setErrors({}); setGlobalErr(""); setModal("edit");
  }

  function openDelete(t: Transaction) { setDeleteTarget(t); setModal("delete"); }
  function closeModal() { setModal("none"); setEditTarget(null); setDeleteTarget(null); setErrors({}); setGlobalErr(""); }

  function setF(k: keyof FormState, v: string | number | null) {
    setForm(f => {
      if (editTarget?.purchaseId && k === "kind" && v === "income") {
        return f;
      }
      const next = { ...f, [k]: v };
      if (k === "kind" && v === "income") next.purchaseId = null;
      return next;
    });
    if (errors[k as string]) setErrors(e=>{const n={...e};delete n[k as string];return n;});
    setGlobalErr("");
  }

  function setAmountDigitsOnly(value: string) {
    setF("amount", digitsOnly(value));
  }

  function blockNonDigitInput(event: React.FormEvent<HTMLInputElement>) {
    const input = event.nativeEvent as InputEvent;
    if (input.data && /\D/.test(input.data)) event.preventDefault();
  }

  function blockNonDigitPaste(event: React.ClipboardEvent<HTMLInputElement>) {
    if (/\D/.test(event.clipboardData.getData("text"))) event.preventDefault();
  }

  async function handleSave() {
    const allEmpty = !form.type.trim() && !form.detail.trim() && !form.amount.trim() && !form.projectId;
    if (allEmpty) { setGlobalErr("กรุณากรอกข้อมูลให้ครบถ้วน"); return; }

    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSaving(true);
    try {
      const payload = {
        ...form,
        id: editTarget?.id,
      };
      const res = await fetch("/api/finances", {
        method: modal === "edit" ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ไม่สามารถบันทึกข้อมูลได้");

      const saved: Transaction = {
        ...data.finance,
        projectName: projectName(data.finance.projectId),
      };

      if (modal === "add") {
        setTxs(prev => [saved, ...prev]);
        showToast("เพิ่มรายการสำเร็จ");
      } else if (modal === "edit" && editTarget) {
        setTxs(prev => prev.map(t => t.id===editTarget.id ? saved : t));
        showToast("บันทึกการแก้ไขสำเร็จ");
      }
      closeModal();
    } catch (error) {
      setGlobalErr(error instanceof Error ? error.message : "ไม่สามารถบันทึกข้อมูลได้");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/finances?id=${encodeURIComponent(deleteTarget.id)}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ไม่สามารถลบข้อมูลได้");
      setTxs(prev => prev.filter(t => t.id !== deleteTarget.id));
      closeModal();
      showToast("ลบรายการเรียบร้อย");
    } catch (error) {
      setGlobalErr(error instanceof Error ? error.message : "ไม่สามารถลบข้อมูลได้");
    } finally {
      setSaving(false);
    }
  }

  function showToast(msg: string) { setToast(msg); setTimeout(()=>setToast(""),3000); }

  return {
    txs,
    projects,
    purchases,
    loadingData,
    loadErr,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    projFilter,
    setProjFilter,
    monthFilter,
    setMonthFilter,
    modal,
    editTarget,
    deleteTarget,
    form,
    errors,
    globalErr,
    saving,
    toast,
    projectName,
    months,
    filtered,
    totalIncome,
    totalExpense,
    netProfit,
    openAdd,
    openEdit,
    openDelete,
    closeModal,
    setF,
    setAmountDigitsOnly,
    blockNonDigitInput,
    blockNonDigitPaste,
    handleSave,
    handleDelete,
  };
}
