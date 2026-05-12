"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ── Types ──────────────────────────────────────────────────────────────────────
interface LineItem {
  id:       number;
  desc:     string;
  unit:     string;
  qty:      string;
  price:    string;
}

interface QuotationForm {
  // ข้อมูลบริษัท (ออกใบ)
  companyName:    string;
  companyAddress: string;
  companyPhone:   string;
  companyEmail:   string;

  // ข้อมูลลูกค้า
  clientName:     string;
  clientAddress:  string;
  clientTaxId:    string;
  clientPhone:    string;
  clientEmail:    string;

  // ข้อมูลใบเสนอราคา
  quotationNo:    string;
  quotationDate:  string;
  validUntil:     string;
  projectName:    string;
  attn:           string;

  // รายการ
  items:          LineItem[];

  // ค่าแรง
  laborCost:      string;

  // ส่วนลด / ภาษี / หมายเหตุ
  discount:       string;
  vatEnabled:     boolean;
  remark:         string;
  paymentTerms:   string;
}

interface FormErrors {
  clientName?:    string;
  clientAddress?: string;
  projectName?:   string;
  quotationDate?: string;
  validUntil?:    string;
  laborCost?:     string;
  items?:         string;
  [key: string]:  string | undefined;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
let itemCounter = 4;
function newItem(): LineItem {
  return { id: ++itemCounter, desc: "", unit: "รายการ", qty: "", price: "" };
}

export const UNITS = ["รายการ", "ชิ้น", "ตร.ม.", "ม.", "ถุง", "ถัง", "กล่อง", "ชุด", "แผ่น", "เส้น", "กก.", "ลิตร"];

export function toNum(s: string) {
  const n = parseFloat(s.replace(/,/g, ""));
  return isNaN(n) ? 0 : n;
}
export function normalizeDigits(value: string, maxLength = Infinity) {
  const digitsOnly = value.replace(/[^0-9]/g, "");
  return digitsOnly.slice(0, maxLength);
}
function isPhone10(value: string) {
  return /^\d{10}$/.test(value);
}
function isValidEmail(value: string) {
  const email = value.trim();
  if (!email) return true;
  return /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/.test(email);
}
export function normalizeDecimalInput(value: string) {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const [whole, ...rest] = cleaned.split(".");
  return whole + (rest.length ? "." + rest.join("") : "");
}
export function fmtNum(n: number) {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function today() {
  return new Date().toISOString().split("T")[0];
}
function nextMonth() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().split("T")[0];
}

// ── Initial state ──────────────────────────────────────────────────────────────
const INIT_FORM: QuotationForm = {
  companyName:    "ห้างหุ้นส่วนจำกัด สุวรรณอินทิเรียร์ แอนด์ รีโนเวชั่น",
  companyAddress: "65 หมู่ 6 ต.ม่วงน้อย อ.ป่าซาง จ.ลำพูน 51120",
  companyPhone:   "0898094354",
  companyEmail:   "suwannakorn62@gmail.com",

  clientName:     "",
  clientAddress:  "",
  clientTaxId:    "",
  clientPhone:    "",
  clientEmail:    "",

  quotationNo:    "QT-2567-" + String(Math.floor(Math.random() * 900) + 100),
  quotationDate:  today(),
  validUntil:     nextMonth(),
  projectName:    "",
  attn:           "",

  items: [
    { id: 1, desc: "", unit: "รายการ", qty: "", price: "" },
    { id: 2, desc: "", unit: "รายการ", qty: "", price: "" },
    { id: 3, desc: "", unit: "รายการ", qty: "", price: "" },
  ],

  laborCost:     "0",

  discount:     "0",
  vatEnabled:   true,
  remark:       "",
  paymentTerms: "ชำระภายใน 30 วัน หลังได้รับใบแจ้งหนี้",
};

// ── Validate ───────────────────────────────────────────────────────────────────
function validate(form: QuotationForm): FormErrors {
  const e: FormErrors = {};

  if (!form.clientName.trim())   e.clientName   = "กรุณากรอกชื่อลูกค้า";
  if (!form.clientAddress.trim())e.clientAddress = "กรุณากรอกที่อยู่ลูกค้า";
  if (!form.projectName.trim())  e.projectName  = "กรุณากรอกชื่อโครงการ";
  if (!form.quotationDate)       e.quotationDate = "กรุณาเลือกวันที่ออกใบ";
  if (!form.validUntil)          e.validUntil   = "กรุณาเลือกวันหมดอายุ";

  // ต้องมีรายการอย่างน้อย 1 รายการที่กรอกครบ
  const filledItems = form.items.filter(it => it.desc.trim());
  if (filledItems.length === 0) {
    e.items = "กรุณากรอกข้อมูลให้ครบถ้วน (ต้องมีรายการอย่างน้อย 1 รายการ)";
  }

  // ตรวจ type ของ qty / price ในแต่ละรายการที่มีคำอธิบาย
  form.items.forEach((it, i) => {
    if (!it.desc.trim()) return;
    if (it.qty && !/^\d+(\.\d+)?$/.test(it.qty.trim())) {
      e[`item_qty_${i}`] = "กรุณากรอกข้อมูลให้ถูกต้องตามประเภทที่กำหนด (ตัวเลขเท่านั้น)";
    }
    if (it.price && !/^\d+(\.\d+)?$/.test(it.price.trim())) {
      e[`item_price_${i}`] = "กรุณากรอกข้อมูลให้ถูกต้องตามประเภทที่กำหนด (ตัวเลขเท่านั้น)";
    }
    if (!it.qty.trim())  e[`item_qty_${i}`]   = e[`item_qty_${i}`]   || "กรุณากรอกข้อมูลให้ครบถ้วน";
    if (!it.price.trim())e[`item_price_${i}`] = e[`item_price_${i}`] || "กรุณากรอกข้อมูลให้ครบถ้วน";
  });

  // เบอร์โทรต้องเป็นเลข 10 หลัก
  if (!isPhone10(form.companyPhone)) {
    e.companyPhone = "กรุณากรอกเบอร์โทร 10 หลัก";
  }
  // ปิดการตรวจเบอร์โทรลูกค้าไว้ก่อน เพราะหน้า create ซ่อนช่องนี้ไว้
  // if (!isPhone10(form.clientPhone)) {
  //   e.clientPhone = "กรุณากรอกเบอร์โทร 10 หลัก";
  // }

  // email ต้องถูกต้องตามรูปแบบมาตรฐาน
  if (form.companyEmail.trim() && !isValidEmail(form.companyEmail)) {
    e.companyEmail = "กรุณากรอกอีเมลให้ถูกต้อง เช่น user@domain.com";
  }
  // ปิดการตรวจอีเมลลูกค้าไว้ก่อน เพราะหน้า create ซ่อนช่องนี้ไว้
  // if (form.clientEmail.trim() && !isValidEmail(form.clientEmail)) {
  //   e.clientEmail = "กรุณากรอกอีเมลให้ถูกต้อง เช่น user@domain.com";
  // }

  // discount ต้องเป็นตัวเลข
  if (form.discount && !/^\d+(\.\d+)?$/.test(form.discount.trim())) {
    e.discount = "กรุณากรอกข้อมูลให้ถูกต้องตามประเภทที่กำหนด (ตัวเลขเท่านั้น)";
  }

  // laborCost ต้องเป็นตัวเลขและบังคับใส่
  if (!form.laborCost.trim()) {
    e.laborCost = "กรุณากรอกค่าแรง";
  } else if (!/^\d+(\.\d+)?$/.test(form.laborCost.trim())) {
    e.laborCost = "กรุณากรอกข้อมูลให้ถูกต้องตามประเภทที่กำหนด (ตัวเลขเท่านั้น)";
  }

  return e;
}

// ─────────────────────────────────────────────────────────────────────────────

export function useQuotationCreatePage() {
  const router = useRouter();
  const [form,        setForm]        = useState<QuotationForm>(INIT_FORM);
  const [errors,      setErrors]      = useState<FormErrors>({});
  const [globalError, setGlobalError] = useState("");
  const [processing,  setProcessing]  = useState(false);

  // ── Computed ────────────────────────────────────────────────────────────────
  const itemsSubtotal = form.items.reduce((s, it) => s + toNum(it.qty) * toNum(it.price), 0);
  const laborCost = toNum(form.laborCost);
  const subtotal  = itemsSubtotal + laborCost;
  const discount  = toNum(form.discount);
  const afterDisc = subtotal - discount;
  const vat       = form.vatEnabled ? afterDisc * 0.07 : 0;
  const total     = afterDisc + vat;

  // ── Field handlers ───────────────────────────────────────────────────────────
  function setField<K extends keyof QuotationForm>(key: K, val: QuotationForm[K]) {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key as string]) setErrors(e => { const n={...e}; delete n[key as string]; return n; });
    setGlobalError("");
  }

  function setItemField(idx: number, key: keyof LineItem, val: string) {
    setForm(f => {
      const items = [...f.items];
      items[idx] = { ...items[idx], [key]: val };
      return { ...f, items };
    });
    const eKey = `item_${key}_${idx}`;
    if (errors[eKey]) setErrors(e => { const n={...e}; delete n[eKey]; return n; });
    if (errors.items) setErrors(e => { const n={...e}; delete n.items; return n; });
    setGlobalError("");
  }

  function addItem() {
    setForm(f => ({ ...f, items: [...f.items, newItem()] }));
  }

  function removeItem(idx: number) {
    if (form.items.length <= 1) return;
    setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  }

  // ── Submit → go to preview ───────────────────────────────────────────────────
  async function handleNext() {
    const errs = validate(form);

    // Exception 1: ทุกฟิลด์หลักว่าง
    const allEmpty = !form.clientName.trim() && !form.projectName.trim() &&
      form.items.every(it => !it.desc.trim());
    if (allEmpty) { setGlobalError("กรุณากรอกข้อมูลให้ครบถ้วน"); return; }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      // ตรวจว่าเป็น type error หรือ missing
      const hasTypeErr = Object.values(errs).some(v => v?.includes("ถูกต้อง"));
      if (!hasTypeErr) setGlobalError("กรุณากรอกข้อมูลให้ครบถ้วน");
      if (typeof window !== "undefined") {
        window.setTimeout(() => {
          const firstError = document.querySelector(".fi.e, .global-err");
          if (firstError instanceof HTMLElement) {
            firstError.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 0);
      }
      return;
    }

    setProcessing(true);
    // จำลอง processing
    await new Promise(r => setTimeout(r, 600));

    // เก็บข้อมูลใน sessionStorage แล้วไปหน้า preview
    sessionStorage.setItem("quotation_draft", JSON.stringify({ form, subtotal, discount, afterDisc, vat, total, laborCost }));
    router.push("/quotation/preview");
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return {
    form,
    errors,
    globalError,
    processing,
    itemsSubtotal,
    laborCost,
    subtotal,
    discount,
    afterDisc,
    vat,
    total,
    setField,
    setItemField,
    addItem,
    removeItem,
    handleNext,
  };
}
