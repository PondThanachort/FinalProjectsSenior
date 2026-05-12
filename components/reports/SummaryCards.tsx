// components/reports/SummaryCards.tsx
"use client";

import { fmt } from "@/components/data/projectsData";

interface SummaryCardsProps {
  totalProjects: number;
  doneCount: number;
  totalBudget: number;
  totalActual: number;
  totalArea: number;
  totalImages: number;
}

export default function SummaryCards({
  totalProjects,
  doneCount,
  totalBudget,
  totalActual,
  totalArea,
  totalImages,
}: SummaryCardsProps) {
  return (
    <div className="summary-grid">
      <div className="sum-card">
        <div className="sum-card-icon" style={{ background:"#f0fdf4" }}>📋</div>
        <div className="sum-card-label">โครงการทั้งหมด</div>
        <div className="sum-card-value">{totalProjects}</div>
        <div className="sum-card-sub">เสร็จแล้ว {doneCount} โครงการ</div>
      </div>
      <div className="sum-card">
        <div className="sum-card-icon" style={{ background:"#eff6ff" }}>💰</div>
        <div className="sum-card-label">งบประมาณรวม</div>
        <div className="sum-card-value" style={{ fontSize:22 }}>฿{fmt(totalBudget)}</div>
        <div className="sum-card-sub">ใช้จริง ฿{fmt(totalActual)}</div>
      </div>
      <div className="sum-card">
        <div className="sum-card-icon" style={{ background:"#fff7ed" }}>📐</div>
        <div className="sum-card-label">พื้นที่รวม (ตร.ม.)</div>
        <div className="sum-card-value">{fmt(totalArea)}</div>
        <div className="sum-card-sub">ตารางเมตร</div>
      </div>
      <div className="sum-card">
        <div className="sum-card-icon" style={{ background:"#fdf4ff" }}>🖼️</div>
        <div className="sum-card-label">ภาพผลงานรวม</div>
        <div className="sum-card-value">{totalImages}</div>
        <div className="sum-card-sub">รูปภาพทั้งหมด</div>
      </div>
    </div>
  );
}