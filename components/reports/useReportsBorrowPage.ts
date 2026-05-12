"use client";

import { useEffect, useMemo, useState } from "react";

export type Period = "รายวัน" | "รายเดือน" | "รายปี";
type BorrowStatus = "คืนแล้ว" | "ค้างคืน" | "ใช้หมด";

interface BorrowTx {
  id: number;
  date: string;
  returnDate?: string;
  type: "borrow";
  materialId: string;
  materialName?: string;
  materialCode?: string;
  unit?: string;
  projectId: string | null;
  projectName?: string;
  qtyBorrow: number;
  qtyReturn: number;
  borrower: string;
  returner: string;
  status: string;
  statusCode?: string;
  note: string;
}

interface MaterialSummary {
  name: string;
  unit: string;
  total: number;
  returned: number;
  pending: number;
  usedUp: number;
}

interface PeriodSummary {
  key: string;
  label: string;
  transactions: number;
  borrowed: number;
  returned: number;
  pending: number;
  done: number;
  overdue: number;
  returnRate: number;
}

export const ALL = "ทั้งหมด";
export const STATUSES: Array<typeof ALL | BorrowStatus> = [ALL, "คืนแล้ว", "ค้างคืน", "ใช้หมด"];
const THAI_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

export const STATUS_STYLE: Record<BorrowStatus, { bg: string; color: string; dot: string }> = {
  "คืนแล้ว": { bg: "#dcfce7", color: "#16a34a", dot: "#16a34a" },
  "ค้างคืน": { bg: "#fee2e2", color: "#dc2626", dot: "#dc2626" },
  "ใช้หมด": { bg: "#e0e7ff", color: "#4338ca", dot: "#4338ca" },
};

export function fmt(value: number) {
  return value.toLocaleString("th-TH");
}

export function fmtDate(iso: string | undefined) {
  if (!iso) return "-";
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  return `${day} ${THAI_MONTHS[month - 1]} ${year + 543}`;
}

export function getStatus(tx: BorrowTx): BorrowStatus {
  if (tx.statusCode === "2" || tx.status === "ใช้หมด") return "ใช้หมด";
  if (tx.statusCode === "1" || tx.status === "คืนแล้ว" || Number(tx.qtyReturn || 0) > 0) return "คืนแล้ว";
  return "ค้างคืน";
}

function csvValue(value: string | number) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function inDateRange(tx: BorrowTx, dateFrom: string, dateTo: string) {
  if (dateFrom && tx.date < dateFrom) return false;
  if (dateTo && tx.date > dateTo) return false;
  return true;
}

export function periodLabel(period: Period) {
  if (period === "รายปี") return "รายปี";
  if (period === "รายเดือน") return "รายเดือน";
  return "รายวัน";
}

function periodBucket(date: string, period: Period) {
  const [yearRaw, monthRaw] = date.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);

  if (!year || !month) return { key: date || "unknown", label: date || "-" };

  if (period === "รายปี") {
    return { key: String(year), label: String(year + 543) };
  }

  if (period === "รายเดือน") {
    return {
      key: `${year}-${String(month).padStart(2, "0")}`,
      label: `${THAI_MONTHS[month - 1]} ${String(year + 543).slice(-2)}`,
    };
  }

  return { key: date, label: fmtDate(date) };
}

export function useReportsBorrowPage() {
  const [txs, setTxs] = useState<BorrowTx[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<typeof ALL | BorrowStatus>(ALL);
  const [period, setPeriod] = useState<Period>("รายวัน");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    async function loadBorrows() {
      try {
        setLoading(true);
        setLoadError("");

        const res = await fetch("/api/borrows");
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error || "ไม่สามารถโหลดข้อมูลเบิก-คืนวัสดุได้");
        }

        const data = await res.json();
        setTxs(Array.isArray(data.borrows) ? data.borrows : []);
      } catch (error) {
        console.error("Load borrow report failed:", error);
        setLoadError(error instanceof Error ? error.message : "ไม่สามารถโหลดรายงานได้");
      } finally {
        setLoading(false);
      }
    }

    loadBorrows();
  }, []);

  const filtered = useMemo(() => {
    return txs.filter((tx) => {
      const q = search.trim().toLowerCase();
      const status = getStatus(tx);
      const matchStatus = statusFilter === ALL || status === statusFilter;
      const matchSearch = !q
        || (tx.materialName || "").toLowerCase().includes(q)
        || (tx.materialCode || "").toLowerCase().includes(q)
        || (tx.projectName || "").toLowerCase().includes(q)
        || tx.borrower.toLowerCase().includes(q)
        || tx.returner.toLowerCase().includes(q)
        || String(tx.id).includes(q);
      return matchStatus && matchSearch && inDateRange(tx, dateFrom, dateTo);
    });
  }, [dateFrom, dateTo, search, statusFilter, txs]);

  const materialSummary = useMemo<MaterialSummary[]>(() => {
    const rows = new Map<string, MaterialSummary>();
    filtered.forEach((tx) => {
      const name = tx.materialName || tx.materialId || "ไม่ระบุวัสดุ";
      const unit = tx.unit || "";
      const key = `${name}-${unit}`;
      const current = rows.get(key) || { name, unit, total: 0, returned: 0, pending: 0, usedUp: 0 };
      const borrowed = Number(tx.qtyBorrow || 0);
      const returned = Math.min(Number(tx.qtyReturn || 0), borrowed);
      const status = getStatus(tx);
      current.total += borrowed;
      current.returned += returned;
      if (status === "ค้างคืน") current.pending += Math.max(borrowed - returned, 0);
      if (status === "ใช้หมด") current.usedUp += Math.max(borrowed - returned, 0);
      rows.set(key, current);
    });
    return Array.from(rows.values()).sort((a, b) => b.pending - a.pending).slice(0, 8);
  }, [filtered]);

  const periodSummary = useMemo<PeriodSummary[]>(() => {
    const rows = new Map<string, Omit<PeriodSummary, "returnRate">>();

    filtered.forEach((tx) => {
      const bucket = periodBucket(tx.date, period);
      const borrowed = Number(tx.qtyBorrow || 0);
      const returned = Math.min(Number(tx.qtyReturn || 0), borrowed);
      const current = rows.get(bucket.key) || {
        key: bucket.key,
        label: bucket.label,
        transactions: 0,
        borrowed: 0,
        returned: 0,
        pending: 0,
        done: 0,
        overdue: 0,
      };

      current.transactions += 1;
      current.borrowed += borrowed;
      current.returned += returned;

      const status = getStatus(tx);
      if (status === "ค้างคืน") current.pending += Math.max(borrowed - returned, 0);
      if (status === "คืนแล้ว") current.done += 1;
      if (status === "ค้างคืน") current.overdue += 1;

      rows.set(bucket.key, current);
    });

    return Array.from(rows.values())
      .sort((a, b) => b.key.localeCompare(a.key))
      .map((row) => ({
        ...row,
        returnRate: row.borrowed > 0 ? Math.round((row.returned / row.borrowed) * 100) : 0,
      }));
  }, [filtered, period]);

  const totalBorrowed = filtered.reduce((sum, tx) => sum + Number(tx.qtyBorrow || 0), 0);
  const totalReturned = filtered.reduce((sum, tx) => sum + Math.min(Number(tx.qtyReturn || 0), Number(tx.qtyBorrow || 0)), 0);
  const totalPending = filtered.reduce((sum, tx) => {
    if (getStatus(tx) !== "ค้างคืน") return sum;
    return sum + Math.max(Number(tx.qtyBorrow || 0) - Number(tx.qtyReturn || 0), 0);
  }, 0);
  const doneCount = filtered.filter((tx) => getStatus(tx) === "คืนแล้ว").length;
  const overdueCount = filtered.filter((tx) => getStatus(tx) === "ค้างคืน").length;
  const returnRate = totalBorrowed > 0 ? Math.round((totalReturned / totalBorrowed) * 100) : 0;

  function exportCsv() {
    const rows = [
      [`สรุป${periodLabel(period)}`],
      ["ช่วงเวลา", "จำนวนรายการ", "จำนวนเบิก", "จำนวนคืน", "ค้างคืน", "คืนครบ", "รายการค้างคืน", "อัตราคืน"],
      ...periodSummary.map((row) => [
        row.label,
        row.transactions,
        row.borrowed,
        row.returned,
        row.pending,
        row.done,
        row.overdue,
        `${row.returnRate}%`,
      ]),
      [],
      ["รหัส", "วันที่เบิก", "วัสดุ/อุปกรณ์", "โครงการ", "ผู้เบิก", "จำนวนเบิก", "จำนวนคืน", "วันที่คืน", "ผู้คืน", "สถานะ"],
      ...filtered.map((tx) => [
        tx.id,
        tx.date,
        tx.materialName || tx.materialId,
        tx.projectName || "-",
        tx.borrower || "-",
        tx.qtyBorrow,
        tx.qtyReturn,
        tx.returnDate || "-",
        tx.returner || "-",
        getStatus(tx),
      ]),
    ];
    const csv = rows.map((row) => row.map(csvValue).join(",")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "borrow-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return {
    txs,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    period,
    setPeriod,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    loading,
    loadError,
    filtered,
    materialSummary,
    periodSummary,
    totalBorrowed,
    totalReturned,
    totalPending,
    doneCount,
    overdueCount,
    returnRate,
    exportCsv,
  };
}
