"use client";

import Link from "next/link";
import { ALL, fmt, fmtDate, poRef, toNum, useReportsFinancePage } from "@/components/reports/useReportsFinancePage";
import type { Period } from "@/components/reports/useReportsFinancePage";
import "./finance.css";

export default function ReportFinancePage() {
  const {
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
  } = useReportsFinancePage();

  return (
    <>
      <div className="page-wrap">
        <div className="page-inner">
          <div className="breadcrumb">
            <Link href="/projects">หน้าหลัก</Link>
            <span className="breadcrumb-sep">/</span>
            <Link href="/reports">รายงาน</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-cur">รายงานรายรับ-รายจ่าย</span>
          </div>

          <div className="page-header">
            <div>
              <div className="page-label">รายงาน</div>
              <h1 className="page-title">รายงานสรุปรายรับ-รายจ่าย</h1>
              <p className="page-subtitle">สรุปรายรับ รายจ่าย และกำไรสุทธิจากข้อมูลจริงในฐานข้อมูล finance</p>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <div className="period-tabs">
                {(["เดือน", "ไตรมาส", "ปี"] as Period[]).map((item) => (
                  <button key={item} className={`period-tab${period === item ? " active" : ""}`} onClick={() => setPeriod(item)} type="button">{item}</button>
                ))}
              </div>
              <button className="btn btn-outline btn-sm" onClick={exportCsv} disabled={loading || filteredTx.length === 0}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                ส่งออก CSV
              </button>
              <button className="btn btn-dark btn-sm" onClick={() => window.print()} type="button">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                พิมพ์
              </button>
            </div>
          </div>

          <div className="kpi-grid">
            <div className="kpi-card kpi-card-income">
              <div className="kpi-icon">💵</div>
              <div className="kpi-label">รายรับรวม</div>
              <div className="kpi-value">฿{fmt(totalIncome)}</div>
              <div className="kpi-sub">{filteredTx.filter((tx) => tx.kind === "income").length} รายการ</div>
            </div>
            <div className="kpi-card kpi-card-expense">
              <div className="kpi-icon" style={{ opacity: .08, position: "absolute", right: 20, top: 20, fontSize: 32 }}>💸</div>
              <div className="kpi-label" style={{ color: "#9ca3af" }}>รายจ่ายรวม</div>
              <div className="kpi-value" style={{ color: "#dc2626" }}>฿{fmt(totalExpense)}</div>
              <div className="kpi-sub" style={{ color: "#6b7280" }}>{filteredTx.filter((tx) => tx.kind === "expense").length} รายการ</div>
            </div>
            <div className="kpi-card kpi-card-profit">
              <div className="kpi-icon">📈</div>
              <div className="kpi-label">กำไรสุทธิ</div>
              <div className="kpi-value">฿{fmt(netProfit)}</div>
              <div className="kpi-sub">Margin {margin}%</div>
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
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <div className="chart-title">รายรับ-รายจ่าย ราย{period}</div>
              <div className="chart-legend">
                <span><span className="legend-dot" style={{ background: "#111110" }} />รายรับ</span>
                <span><span className="legend-dot" style={{ background: "#d1d5db" }} />รายจ่าย</span>
              </div>
            </div>
            {chartData.length === 0 ? (
              <div className="empty-chart">ยังไม่มีข้อมูลสำหรับแสดงกราฟ</div>
            ) : (
              <div className="bar-chart">
                {chartData.map((item, index) => (
                  <div key={item.key} className="bar-group" onMouseEnter={() => setActiveBucket(index)} onMouseLeave={() => setActiveBucket(null)}>
                    {activeBucket === index && (
                      <div className="bar-tooltip">
                        รับ ฿{fmt(item.income)}<br />จ่าย ฿{fmt(item.expense)}<br />กำไร ฿{fmt(item.income - item.expense)}
                      </div>
                    )}
                    <div className="bar-pair">
                      <div className="bar bar-inc" style={{ height: `${(item.income / maxVal) * 160}px` }} />
                      <div className="bar bar-exp" style={{ height: `${(item.expense / maxVal) * 160}px` }} />
                    </div>
                    <div className="bar-label">{item.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="proj-finance">
            <div className="chart-title" style={{ marginBottom: 20 }}>สรุปรายโครงการ</div>
            {byProject.length === 0 ? (
              <div className="empty-chart">ยังไม่มีข้อมูลโครงการ</div>
            ) : byProject.map((project) => {
              const net = project.income - project.expense;
              const total = project.income + project.expense;
              return (
                <div key={project.name} className="proj-row">
                  <div className="proj-row-name">{project.name}</div>
                  <div style={{ minWidth: 120 }}>
                    <div className="proj-bar-wrap">
                      <div className="proj-bar-fill" style={{ width: `${(total / maxProjectTotal) * 100}%` }} />
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280", whiteSpace: "nowrap" }}>
                    รับ <span style={{ fontWeight: 600, color: "#111110" }}>฿{fmt(project.income)}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280", whiteSpace: "nowrap" }}>
                    จ่าย <span style={{ fontWeight: 600, color: "#374151" }}>฿{fmt(project.expense)}</span>
                  </div>
                  <div className={net >= 0 ? "amount-pos" : "amount-neg"} style={{ whiteSpace: "nowrap" }}>
                    {net >= 0 ? "+" : ""}฿{fmt(net)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="table-wrap">
            <div className="table-header">
              <div className="table-title-search">
                <div className="chart-title">รายการทั้งหมด</div>
                <div className="search-wrap">
                  <span className="search-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </span>
                  <input className="search-input" placeholder="ค้นหารายการ..." value={search} onChange={(event) => setSearch(event.target.value)} />
                </div>
              </div>
              <div className="type-filter">
                {[ALL, "รายรับ", "รายจ่าย"].map((label) => (
                  <button key={label} className={`type-btn${typeFilter === label ? " active" : ""}`} onClick={() => setTypeFilter(label)} type="button">
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {loadError && <div className="report-alert">{loadError}</div>}

            <div className="table-scroll">
              {loading ? (
                <div className="empty-state">กำลังโหลดข้อมูล...</div>
              ) : filteredTx.length === 0 ? (
                <div className="empty-state">ไม่พบรายการที่ตรงกัน</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>วันที่</th>
                      <th>ประเภท</th>
                      <th>โครงการ</th>
                      <th>หมวดหมู่</th>
                      <th>รายละเอียด</th>
                      <th>เลขอ้างอิง</th>
                      <th style={{ textAlign: "right" }}>จำนวนเงิน</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTx.map((tx) => (
                      <tr key={tx.id}>
                        <td style={{ whiteSpace: "nowrap", color: "#6b7280" }}>{fmtDate(tx.date)}</td>
                        <td>
                          {tx.kind === "income"
                            ? <span className="badge-income">▲ รายรับ</span>
                            : <span className="badge-expense">▼ รายจ่าย</span>
                          }
                        </td>
                        <td style={{ fontWeight: 600, color: "#111110" }}>{tx.projectName || "-"}</td>
                        <td style={{ color: "#6b7280" }}>{tx.type || "-"}</td>
                        <td style={{ color: "#374151" }}>{tx.detail || "-"}</td>
                        <td><span className="ref-code">{poRef(tx.purchaseId)}</span></td>
                        <td style={{ textAlign: "right", fontWeight: 700, whiteSpace: "nowrap", color: tx.kind === "income" ? "#16a34a" : "#dc2626" }}>
                          {tx.kind === "income" ? "+" : "-"}฿{fmt(toNum(tx.amount))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="table-footer">
              <span>แสดง {filteredTx.length} จาก {txs.length} รายการ</span>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                <span>รายรับ: <strong style={{ color: "#16a34a" }}>฿{fmt(totalIncome)}</strong></span>
                <span>รายจ่าย: <strong style={{ color: "#dc2626" }}>฿{fmt(totalExpense)}</strong></span>
                <span>กำไร: <strong style={{ color: netProfit >= 0 ? "#16a34a" : "#dc2626" }}>฿{fmt(netProfit)}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
