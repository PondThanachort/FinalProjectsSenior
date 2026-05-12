"use client";

import Link from "next/link";
import { STATUSES, STATUS_STYLE, fmt, fmtDate, getStatus, periodLabel, useReportsBorrowPage } from "@/components/reports/useReportsBorrowPage";
import type { Period } from "@/components/reports/useReportsBorrowPage";
import "./borrow.css";

export default function ReportBorrowPage() {
  const {
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
  } = useReportsBorrowPage();

  return (
    <>
      <div className="page-wrap">
        <div className="page-inner">
          <div className="breadcrumb">
            <Link href="/projects">หน้าหลัก</Link>
            <span className="breadcrumb-sep">/</span>
            <Link href="/reports">รายงาน</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-cur">รายงานเบิก-คืนวัสดุ</span>
          </div>

          <div className="page-header">
            <div>
              <div className="page-label">รายงาน</div>
              <h1 className="page-title">รายงานการเบิก-คืนวัสดุ/อุปกรณ์</h1>
              <p className="page-subtitle">ติดตามรายการเบิก-คืนวัสดุจากข้อมูลจริงในฐานข้อมูล withdrawal และ material</p>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <div className="period-tabs">
                {(["รายวัน", "รายเดือน", "รายปี"] as Period[]).map((item) => (
                  <button key={item} className={`period-tab${period === item ? " active" : ""}`} onClick={() => setPeriod(item)} type="button">{item}</button>
                ))}
              </div>
              <button className="btn btn-outline btn-sm" onClick={exportCsv} disabled={loading || filtered.length === 0}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                ส่งออก CSV
              </button>
              <button className="btn btn-dark btn-sm" onClick={() => window.print()} type="button">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                พิมพ์
              </button>
            </div>
          </div>

          {loadError && <div className="report-alert">{loadError}</div>}

          {overdueCount > 0 && (
            <div className="alert-banner">
              <span className="alert-icon">⚠️</span>
              <div className="alert-text">
                มีรายการวัสดุที่ยังไม่ได้คืน
                <span className="alert-count">{fmt(overdueCount)} รายการ</span>
                {" "}กรุณาติดตามการคืนวัสดุ
              </div>
            </div>
          )}

          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-icon">📦</div>
              <div className="kpi-label">รายการเบิกทั้งหมด</div>
              <div className="kpi-value">{fmt(filtered.length)}</div>
              <div className="kpi-sub">รายการในช่วงที่เลือก</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon">✅</div>
              <div className="kpi-label">คืนครบแล้ว</div>
              <div className="kpi-value">{fmt(doneCount)}</div>
              <div className="kpi-sub">{Math.round((doneCount / Math.max(filtered.length, 1)) * 100)}% ของทั้งหมด</div>
            </div>
            <div className="kpi-card kpi-alert">
              <div className="kpi-icon">🔴</div>
              <div className="kpi-label">ค้างคืน</div>
              <div className="kpi-value">{fmt(overdueCount)}</div>
              <div className="kpi-sub">รายการที่ต้องติดตาม</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon">📊</div>
              <div className="kpi-label">อัตราคืน</div>
              <div className="kpi-value">{returnRate}%</div>
              <div className="kpi-sub">{fmt(totalReturned)} / {fmt(totalBorrowed)} หน่วย</div>
            </div>
          </div>

          <div className="period-summary">
            <div className="period-summary-head">
              <div>
                <div className="period-summary-title">สรุป{periodLabel(period)}</div>
                <div className="period-summary-sub">จัดกลุ่มจากวันที่เบิก ตามตัวกรองและช่วงวันที่ที่เลือก</div>
              </div>
              <div className="period-summary-count">{fmt(periodSummary.length)} ช่วงเวลา</div>
            </div>
            {loading ? (
              <div className="empty-state">กำลังโหลดข้อมูลสรุป...</div>
            ) : periodSummary.length === 0 ? (
              <div className="empty-state">ยังไม่มีข้อมูลสรุปในช่วงที่เลือก</div>
            ) : (
              <div className="period-summary-scroll">
                <table className="period-summary-table">
                  <thead>
                    <tr>
                      <th>ช่วงเวลา</th>
                      <th>รายการ</th>
                      <th>เบิกรวม</th>
                      <th>คืนแล้ว</th>
                      <th>ค้างคืน</th>
                      <th>คืนครบ</th>
                      <th>รายการค้างคืน</th>
                      <th>อัตราคืน</th>
                    </tr>
                  </thead>
                  <tbody>
                    {periodSummary.map((row) => (
                      <tr key={row.key}>
                        <td style={{ fontWeight: 700, color: "#111110", whiteSpace: "nowrap" }}>{row.label}</td>
                        <td>{fmt(row.transactions)}</td>
                        <td>{fmt(row.borrowed)}</td>
                        <td style={{ color: "#16a34a", fontWeight: 600 }}>{fmt(row.returned)}</td>
                        <td style={{ color: row.pending > 0 ? "#dc2626" : "#16a34a", fontWeight: 600 }}>{fmt(row.pending)}</td>
                        <td>{fmt(row.done)}</td>
                        <td style={{ color: row.overdue > 0 ? "#dc2626" : "#6b7280" }}>{fmt(row.overdue)}</td>
                        <td>
                          <div className="period-rate">
                            <span>{row.returnRate}%</span>
                            <div className="period-rate-bar">
                              <div className="period-rate-fill" style={{ width: `${row.returnRate}%` }} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div style={{ marginBottom: 8 }}>
            <div style={{ fontFamily: "'Noto Serif Thai',serif", fontSize: 18, fontWeight: 700, color: "#111110", marginBottom: 14 }}>
              สถานะวัสดุที่มีการเบิก
            </div>
            <div className="mat-grid">
              {materialSummary.length === 0 ? (
                <div className="empty-state">ยังไม่มีข้อมูลวัสดุสำหรับช่วงที่เลือก</div>
              ) : materialSummary.map((item) => {
                const closed = item.returned + item.usedUp;
                const pct = item.total > 0 ? Math.round((closed / item.total) * 100) : 0;
                const color = item.pending === 0 ? "#16a34a" : pct > 50 ? "#ca8a04" : "#dc2626";
                return (
                  <div key={`${item.name}-${item.unit}`} className="mat-card">
                    <div className="mat-name">{item.name}</div>
                    <div className="mat-unit">หน่วย: {item.unit || "-"}</div>
                    <div className="mat-progress-wrap">
                      <div className="mat-progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(to right,${color}99,${color})` }} />
                    </div>
                    <div className="mat-stats">
                      <span>คืนเข้า <strong>{fmt(item.returned)}</strong></span>
                      <span style={{ color }}>ปิด {pct}%</span>
                      <span>ค้างคืน <strong style={{ color: item.pending > 0 ? "#dc2626" : "#16a34a" }}>{fmt(item.pending)}</strong></span>
                    </div>
                    {item.usedUp > 0 && <div className="mat-unit" style={{ marginTop: 6 }}>ใช้หมด: {fmt(item.usedUp)} {item.unit || ""}</div>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="date-filter">
            <div className="date-group">
              <span>จากวันที่</span>
              <input type="date" className="date-input" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
            </div>
            <div className="date-group">
              <span>ถึงวันที่</span>
              <input type="date" className="date-input" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
            </div>
            <div className="filter-divider" />
            <div className="search-wrap">
              <span className="search-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </span>
              <input className="search-input" placeholder="ค้นหาวัสดุ, โครงการ, ผู้เบิก..." value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
            <div className="filter-divider" />
            <div className="status-filter">
              {STATUSES.map((status) => (
                <button key={status} className={`status-btn${statusFilter === status ? " active" : ""}`} onClick={() => setStatusFilter(status)} type="button">{status}</button>
              ))}
            </div>
          </div>

          <div className="table-wrap">
            <div className="table-header">
              <div style={{ fontFamily: "'Noto Serif Thai',serif", fontSize: 17, fontWeight: 700 }}>รายการเบิก-คืนทั้งหมด</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>แสดง {fmt(filtered.length)} รายการ</div>
            </div>
            <div className="table-scroll">
              {loading ? (
                <div className="empty-state">กำลังโหลดข้อมูล...</div>
              ) : filtered.length === 0 ? (
                <div className="empty-state">ไม่พบรายการที่ตรงกัน</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>วันที่เบิก</th>
                      <th>วัสดุ/อุปกรณ์</th>
                      <th>โครงการ</th>
                      <th>ผู้เบิก</th>
                      <th>จำนวนเบิก</th>
                      <th>ความคืบหน้า</th>
                      <th>วันที่คืน</th>
                      <th>ผู้คืน</th>
                      <th>สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((tx) => {
                      const status = getStatus(tx);
                      const style = STATUS_STYLE[status];
                      const retPct = tx.qtyBorrow > 0 ? Math.round((Math.min(tx.qtyReturn, tx.qtyBorrow) / tx.qtyBorrow) * 100) : 0;
                      const barColor = retPct === 100 ? "#16a34a" : retPct > 0 ? "#ca8a04" : "#dc2626";
                      return (
                        <tr key={tx.id}>
                          <td style={{ color: "#9ca3af", fontWeight: 600 }}>{String(tx.id).padStart(2, "0")}</td>
                          <td style={{ whiteSpace: "nowrap", color: "#6b7280" }}>{fmtDate(tx.date)}</td>
                          <td>
                            <div style={{ fontWeight: 600, color: "#111110" }}>{tx.materialName || tx.materialId}</div>
                            <div style={{ fontSize: 11, color: "#9ca3af" }}>{tx.materialCode || tx.materialId} · {tx.unit || "-"}</div>
                          </td>
                          <td style={{ color: "#374151", maxWidth: 160 }}>{tx.projectName || "-"}</td>
                          <td style={{ color: "#6b7280", whiteSpace: "nowrap" }}>{tx.borrower || "-"}</td>
                          <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{fmt(tx.qtyBorrow)} {tx.unit}</td>
                          <td className="progress-cell">
                            <div style={{ fontSize: 12, fontWeight: 600, color: barColor }}>{retPct}%</div>
                            <div className="mini-bar-wrap">
                              <div className="mini-bar-fill" style={{ width: `${retPct}%`, background: barColor }} />
                            </div>
                            <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>คืน {fmt(tx.qtyReturn)}/{fmt(tx.qtyBorrow)}</div>
                          </td>
                          <td style={{ whiteSpace: "nowrap", color: "#6b7280", fontSize: 12 }}>{fmtDate(tx.returnDate)}</td>
                          <td style={{ color: "#6b7280", whiteSpace: "nowrap" }}>{tx.returner || "-"}</td>
                          <td>
                            <span className="status-badge" style={{ background: style.bg, color: style.color }}>
                              <span className="status-dot" style={{ background: style.dot }} />
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            <div className="table-footer">
              <span>แสดง {fmt(filtered.length)} จาก {fmt(txs.length)} รายการ</span>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                <span>เบิกรวม: <strong>{fmt(totalBorrowed)} หน่วย</strong></span>
                <span>คืนแล้ว: <strong style={{ color: "#16a34a" }}>{fmt(totalReturned)} หน่วย</strong></span>
                <span>ค้างคืน: <strong style={{ color: "#dc2626" }}>{fmt(totalPending)} หน่วย</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
