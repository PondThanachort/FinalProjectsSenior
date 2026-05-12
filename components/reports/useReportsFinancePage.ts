"use client";

import { useEffect, useMemo, useState } from "react";

type TxKind = "income" | "expense";
export type Period = "เดือน" | "ไตรมาส" | "ปี";

interface FinanceTx {
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

export const ALL = "ทั้งหมด";
const THAI_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

export function toNum(value: string | number) {
  const amount = typeof value === "number" ? value : Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

export function fmt(value: number) {
  return value.toLocaleString("th-TH", { maximumFractionDigits: 2 });
}

export function fmtDate(iso: string) {
  if (!iso) return "-";
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  return `${day} ${THAI_MONTHS[month - 1]} ${year + 543}`;
}

export function poRef(id: number | null) {
  return id ? `PO-${String(id).padStart(3, "0")}` : "-";
}

function periodKey(date: string, period: Period) {
  const [yearRaw, monthRaw] = date.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  if (!year || !month) return { key: "unknown", label: "-" };

  if (period === "ปี") {
    return { key: String(year), label: String(year + 543) };
  }
  if (period === "ไตรมาส") {
    const quarter = Math.ceil(month / 3);
    return { key: `${year}-Q${quarter}`, label: `Q${quarter}/${String(year + 543).slice(-2)}` };
  }
  return { key: `${year}-${String(month).padStart(2, "0")}`, label: `${THAI_MONTHS[month - 1]} ${String(year + 543).slice(-2)}` };
}

function csvValue(value: string | number) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function inDateRange(date: string, dateFrom: string, dateTo: string) {
  if (dateFrom && date < dateFrom) return false;
  if (dateTo && date > dateTo) return false;
  return true;
}

export function useReportsFinancePage() {
  const [txs, setTxs] = useState<FinanceTx[]>([]);
  const [period, setPeriod] = useState<Period>("เดือน");
  const [typeFilter, setTypeFilter] = useState(ALL);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activeBucket, setActiveBucket] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    async function loadFinances() {
      try {
        setLoading(true);
        setLoadError("");

        const res = await fetch("/api/finances");
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error || "ไม่สามารถโหลดข้อมูลรายรับ-รายจ่ายได้");
        }

        const data = await res.json();
        setTxs(Array.isArray(data.finances) ? data.finances : []);
      } catch (error) {
        console.error("Load finance report failed:", error);
        setLoadError(error instanceof Error ? error.message : "ไม่สามารถโหลดรายงานได้");
      } finally {
        setLoading(false);
      }
    }

    loadFinances();
  }, []);

  const filteredTx = useMemo(() => {
    return txs.filter((tx) => {
      const q = search.trim().toLowerCase();
      const projectName = tx.projectName || "";
      const ref = poRef(tx.purchaseId);
      const matchSearch = !q
        || tx.detail.toLowerCase().includes(q)
        || tx.type.toLowerCase().includes(q)
        || projectName.toLowerCase().includes(q)
        || ref.toLowerCase().includes(q)
        || String(tx.id).includes(q);
      const matchType = typeFilter === ALL || tx.kind === (typeFilter === "รายรับ" ? "income" : "expense");
      return matchSearch && matchType && inDateRange(tx.date, dateFrom, dateTo);
    });
  }, [dateFrom, dateTo, search, txs, typeFilter]);

  const totalIncome = filteredTx.filter((tx) => tx.kind === "income").reduce((sum, tx) => sum + toNum(tx.amount), 0);
  const totalExpense = filteredTx.filter((tx) => tx.kind === "expense").reduce((sum, tx) => sum + toNum(tx.amount), 0);
  const netProfit = totalIncome - totalExpense;
  const margin = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;

  const chartData = useMemo(() => {
    const buckets = new Map<string, { key: string; label: string; income: number; expense: number }>();
    filteredTx.forEach((tx) => {
      const bucket = periodKey(tx.date, period);
      const current = buckets.get(bucket.key) || { ...bucket, income: 0, expense: 0 };
      if (tx.kind === "income") current.income += toNum(tx.amount);
      else current.expense += toNum(tx.amount);
      buckets.set(bucket.key, current);
    });

    return Array.from(buckets.values()).sort((a, b) => a.key.localeCompare(b.key));
  }, [filteredTx, period]);

  const byProject = useMemo(() => {
    const projects = new Map<string, { name: string; income: number; expense: number }>();
    filteredTx.forEach((tx) => {
      const name = tx.projectName || "ไม่ระบุโครงการ";
      const current = projects.get(name) || { name, income: 0, expense: 0 };
      if (tx.kind === "income") current.income += toNum(tx.amount);
      else current.expense += toNum(tx.amount);
      projects.set(name, current);
    });
    return Array.from(projects.values())
      .sort((a, b) => (b.income + b.expense) - (a.income + a.expense))
      .slice(0, 8);
  }, [filteredTx]);

  const maxVal = Math.max(1, ...chartData.map((item) => Math.max(item.income, item.expense)));
  const maxProjectTotal = Math.max(1, ...byProject.map((item) => item.income + item.expense));

  function exportCsv() {
    const rows = [
      ["วันที่", "ประเภท", "โครงการ", "หมวดหมู่", "รายละเอียด", "เลขอ้างอิง", "จำนวนเงิน"],
      ...filteredTx.map((tx) => [
        tx.date,
        tx.kind === "income" ? "รายรับ" : "รายจ่าย",
        tx.projectName || "-",
        tx.type,
        tx.detail,
        poRef(tx.purchaseId),
        tx.kind === "income" ? toNum(tx.amount) : -toNum(tx.amount),
      ]),
    ];
    const csv = rows.map((row) => row.map(csvValue).join(",")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "finance-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return {
    txs,
    period,
    setPeriod,
    typeFilter,
    setTypeFilter,
    search,
    setSearch,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    activeBucket,
    setActiveBucket,
    loading,
    loadError,
    filteredTx,
    totalIncome,
    totalExpense,
    netProfit,
    margin,
    chartData,
    byProject,
    maxVal,
    maxProjectTotal,
    exportCsv,
  };
}
