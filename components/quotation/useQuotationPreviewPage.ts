"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

// ── Types ──────────────────────────────────────────────────────────────────────
interface LineItem { id: number; desc: string; unit: string; qty: string; price: string; }
interface QuotationForm {
  companyName: string; companyAddress: string; companyPhone: string; companyEmail: string;
  clientName: string; clientAddress: string; clientTaxId?: string; clientPhone: string; clientEmail: string;
  quotationNo: string; quotationDate: string; validUntil: string; projectName: string; attn?: string;
  items: LineItem[]; laborCost: string; discount: string; vatEnabled: boolean; remark: string; paymentTerms: string;
}
interface DraftData {
  form: QuotationForm;
  subtotal: number; discount: number; afterDisc: number; vat: number; total: number; laborCost: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
// ตัวเลขไม่มีทศนิยม ตามต้นฉบับ PDF
export function fmtNum(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
export function fmtDate(iso: string) {
  if (!iso) return "-";
  const [y, m, d] = iso.split("-");
  const months = ["January","February","March","April","May","June",
                  "July","August","September","October","November","December"];
  return `${parseInt(d)} ${months[parseInt(m)-1]} ${parseInt(y)}`;
}
export function toNum(s: string) { const n = parseFloat(s); return isNaN(n) ? 0 : n; }

// จำนวนแถวขั้นต่ำ (ให้ตารางเต็มหน้า A4)
const MIN_ROWS = 11;

// ─────────────────────────────────────────────────────────────────────────────

export function useQuotationPreviewPage() {
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);
  const [data,   setData]   = useState<DraftData | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("quotation_draft");
    if (!raw) { router.push("/quotation/create"); return; }
    setData(JSON.parse(raw));
  }, [router]);

  function handleBack()  { router.push("/quotation/create"); }
  function handlePrint() { window.print(); }

  async function handleDownload() {
    if (!printRef.current) return;
    setSaving(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const { default: jsPDF }       = await import("jspdf");
      const canvas = await html2canvas(printRef.current, {
        scale: 3, backgroundColor: "#ffffff", useCORS: true,
      });
      const pdf = new jsPDF({ orientation:"portrait", unit:"mm", format:"a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgH  = (canvas.height * pageW) / canvas.width;
      let left = imgH, pos = 0;
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, pos, pageW, imgH);
      left -= pageH;
      while (left > 0) {
        pos -= pageH; pdf.addPage();
        pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, pos, pageW, imgH);
        left -= pageH;
      }
      pdf.save(`ESTIMATE-${data?.form.quotationNo || "document"}.pdf`);
    } catch {
      window.print(); // fallback
    } finally {
      setSaving(false);
    }
  }

  const form = data?.form;
  const subtotal = data?.subtotal ?? 0;
  const discount = data?.discount ?? 0;
  const vat = data?.vat ?? 0;
  const total = data?.total ?? 0;
  const laborCost = data?.laborCost ?? 0;
  const itemsSubtotal = subtotal - laborCost;
  const filledItems = form?.items.filter(it => it.desc.trim()) ?? [];
  const usedRows = (form?.remark ? 1 : 0) + filledItems.length;
  const padRows = Math.max(0, MIN_ROWS - usedRows);


  return {
    data,
    form,
    subtotal,
    discount,
    vat,
    total,
    laborCost,
    itemsSubtotal,
    filledItems,
    padRows,
    printRef,
    saving,
    handleBack,
    handlePrint,
    handleDownload,
  };
}
