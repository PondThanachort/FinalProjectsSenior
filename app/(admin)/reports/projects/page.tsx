"use client";

import Link from "next/link";
import { STATUS_STYLE, fmt } from "@/components/data/adminProjectsData";
import { formatDate, getQuotationName, useReportsProjectsPage } from "@/components/reports/useReportsProjectsPage";
import type { SortKey } from "@/components/reports/useReportsProjectsPage";
import "./projects.css";
export default function ReportProjectsPage() {
  const {
    projects,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    sortBy,
    setSortBy,
    view,
    setView,
    loading,
    loadError,
    detailTarget,
    galleryIndex,
    setGalleryIndex,
    statuses,
    filtered,
    doneCount,
    totalImages,
    inProgressCount,
    detailImages,
    quotationFile,
    quotationName,
    isQuotationImage,
    isQuotationPdf,
    openDetail,
    closeDetail,
    moveGallery,
    exportCsv,
  } = useReportsProjectsPage();
  return (
    <>
      <div className="page-wrap">
        <div className="page-inner">
          <div className="breadcrumb">
            <Link href="/projects">หน้าหลัก</Link>
            <span className="breadcrumb-sep">/</span>
            <Link href="/reports">รายงาน</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-cur">รายงานผลงานโครงการ</span>
          </div>

          <div className="page-header">
            <div className="page-title-wrap">
              <div className="page-label">รายงาน</div>
              <h1 className="page-title">รายงานผลงานโครงการ</h1>
              <p className="page-subtitle">ข้อมูลโครงการจริงจากฐานข้อมูล พร้อมจำนวนภาพผลงานจาก portfolio ของแต่ละโครงการ</p>
            </div>
            <div className="header-actions">
              <button className="btn btn-outline btn-sm" onClick={exportCsv} disabled={loading || filtered.length === 0}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                ส่งออก CSV
              </button>
              <button className="btn btn-dark btn-sm" onClick={() => window.print()}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                พิมพ์
              </button>
            </div>
          </div>

          <div className="summary-grid">
            <div className="sum-card">
              <div className="sum-card-icon" style={{ background: "#ecfdf5" }}>📋</div>
              <div className="sum-card-label">โครงการทั้งหมด</div>
              <div className="sum-card-value">{fmt(filtered.length)}</div>
              <div className="sum-card-sub">จากฐานข้อมูล project</div>
            </div>
            <div className="sum-card">
              <div className="sum-card-icon" style={{ background: "#f0fdf4" }}>✅</div>
              <div className="sum-card-label">เสร็จสิ้น</div>
              <div className="sum-card-value">{fmt(doneCount)}</div>
              <div className="sum-card-sub">โครงการที่ปิดงานแล้ว</div>
            </div>
            <div className="sum-card">
              <div className="sum-card-icon" style={{ background: "#fef9c3" }}>⏳</div>
              <div className="sum-card-label">กำลังดำเนินการ</div>
              <div className="sum-card-value">{fmt(inProgressCount)}</div>
              <div className="sum-card-sub">โครงการที่ยังเปิดอยู่</div>
            </div>
            <div className="sum-card">
              <div className="sum-card-icon" style={{ background: "#f5f3ff" }}>🖼️</div>
              <div className="sum-card-label">ภาพผลงานรวม</div>
              <div className="sum-card-value">{fmt(totalImages)}</div>
              <div className="sum-card-sub">รูปภาพทั้งหมดใน portfolio</div>
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

          <div className="toolbar">
            <div className="search-wrap">
              <span className="search-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </span>
              <input className="search-input" placeholder="ค้นหาโครงการ, สถานที่, ผู้รับผิดชอบ..." value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
            <div className="select-wrap">
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
            <div className="select-wrap">
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortKey)}>
                <option value="id">เรียงตาม: รหัสล่าสุด</option>
                <option value="name">เรียงตาม: ชื่อ</option>
                <option value="status">เรียงตาม: สถานะ</option>
                <option value="images">เรียงตาม: จำนวนภาพ</option>
                <option value="startDate">เรียงตาม: วันที่เริ่ม</option>
              </select>
            </div>
            <div className="view-toggle">
              <button className={`view-btn ${view === "table" ? "active" : ""}`} onClick={() => setView("table")} type="button">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
              </button>
              <button className={`view-btn ${view === "grid" ? "active" : ""}`} onClick={() => setView("grid")} type="button">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
              </button>
            </div>
          </div>

          {loadError && <div className="report-alert">{loadError}</div>}

          {loading ? (
            <div className="table-wrap">
              <div className="empty">
                <div className="spinner-dark" />
                <div className="empty-text">กำลังโหลดรายงาน...</div>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="table-wrap">
              <div className="empty">
                <div className="empty-icon">🔍</div>
                <div className="empty-text">ไม่พบโครงการที่ตรงกัน</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>ลองปรับตัวกรองหรือคำค้นหา</div>
              </div>
            </div>
          ) : view === "table" ? (
            <div className="table-wrap">
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>โครงการ</th>
                      <th>สถานะ</th>
                      <th>ระยะเวลา</th>
                      <th>ผู้รับผิดชอบ</th>
                      <th>ใบเสนอราคา</th>
                      <th>ภาพ</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((project) => {
                      const style = STATUS_STYLE[project.status] || { bg: "#f3f4f6", color: "#6b7280" };
                      const imageCount = project.portfolioImages?.length ?? 0;
                      return (
                        <tr key={project.id}>
                          <td style={{ color: "#9ca3af", fontWeight: 600 }}>{String(project.id).padStart(2, "0")}</td>
                          <td>
                            <div className="td-name">{project.name}</div>
                            <div className="td-name-sub">📍 {project.location}</div>
                          </td>
                          <td>
                            <span className="status-badge" style={{ background: style.bg, color: style.color }}>{project.status}</span>
                          </td>
                          <td style={{ whiteSpace: "nowrap", fontSize: 12, color: "#6b7280" }}>
                            <div>{formatDate(project.startDate)}</div>
                            <div>{formatDate(project.endDate)}</div>
                          </td>
                          <td>{project.staff || "-"}</td>
                          <td>
                            {project.quotationFile ? (
                              <a className="quotation-file-link" href={project.quotationFile} target="_blank" rel="noreferrer" title={getQuotationName(project)}>
                                {getQuotationName(project)}
                              </a>
                            ) : (
                              <span className="muted-cell">-</span>
                            )}
                          </td>
                          <td>
                            <span className="image-count">🖼️ {fmt(imageCount)}</span>
                          </td>
                          <td>
                            <button className="btn btn-outline btn-sm" style={{ whiteSpace: "nowrap" }} onClick={() => openDetail(project)} type="button">ดู →</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="table-footer">
                <span>แสดง {fmt(filtered.length)} จาก {fmt(projects.length)} โครงการ</span>
                <div className="table-total">
                  <span>ภาพรวม: <strong>{fmt(totalImages)}</strong> รูป</span>
                  <span>เสร็จสิ้น: <strong>{fmt(doneCount)}</strong> โครงการ</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="project-grid">
              {filtered.map((project) => {
                const style = STATUS_STYLE[project.status] || { bg: "#f3f4f6", color: "#6b7280" };
                const imageCount = project.portfolioImages?.length ?? 0;
                return (
                  <button key={project.id} className="proj-card" onClick={() => openDetail(project)} type="button">
                    <div className="proj-card-img">
                      {project.image ? <img src={project.image} alt={project.name} /> : <span style={{ fontSize: 40 }}>🏗️</span>}
                      <span className="status-badge" style={{ position: "absolute", top: 12, right: 12, background: style.bg, color: style.color }}>{project.status}</span>
                    </div>
                    <div className="proj-card-body">
                      <div className="proj-card-name">{project.name}</div>
                      <div className="proj-card-loc">📍 {project.location}</div>
                      <div className="proj-card-row">
                        <div className="proj-card-stat">
                          <span className="proj-card-stat-label">ผู้รับผิดชอบ</span>
                          <span className="proj-card-stat-value">{project.staff || "-"}</span>
                        </div>
                        <div className="proj-card-stat">
                          <span className="proj-card-stat-label">ภาพ</span>
                          <span className="proj-card-stat-value">🖼️ {fmt(imageCount)}</span>
                        </div>
                      </div>
                      <div className="proj-card-file" title={getQuotationName(project)}>
                        ใบเสนอราคา: {getQuotationName(project)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {detailTarget && (
        <div className="overlay" onClick={(event) => { if (event.target === event.currentTarget) closeDetail(); }}>
          <div className="modal" style={{ maxWidth: "800px" }}>
            <div className="modal-hd">
              <div className="modal-title">{detailTarget.name}</div>
              <button className="modal-close" onClick={closeDetail} type="button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-cover">
                {detailTarget.image ? <img src={detailTarget.image} alt={detailTarget.name} /> : <div style={{ fontSize: "48px" }}>🏗️</div>}
              </div>

              <div className="detail-grid">
                <div>
                  <div className="detail-label">ชื่อโครงการ</div>
                  <div className="detail-title">{detailTarget.name}</div>
                </div>
                <div>
                  <div className="detail-label">สถานที่</div>
                  <div className="detail-text">📍 {detailTarget.location}</div>
                </div>
                <div>
                  <div className="detail-label">วันที่เริ่มต้น</div>
                  <div className="detail-text">{formatDate(detailTarget.startDate)}</div>
                </div>
                <div>
                  <div className="detail-label">วันที่สิ้นสุด</div>
                  <div className="detail-text">{formatDate(detailTarget.endDate)}</div>
                </div>
                <div>
                  <div className="detail-label">ผู้รับผิดชอบ</div>
                  <div className="detail-text">{detailTarget.staff || "-"}</div>
                </div>
                <div>
                  <div className="detail-label">สถานะ</div>
                  <span className="status-badge" style={{
                    background: STATUS_STYLE[detailTarget.status]?.bg || "#f3f4f6",
                    color: STATUS_STYLE[detailTarget.status]?.color || "#6b7280",
                  }}>
                    {detailTarget.status}
                  </span>
                </div>
              </div>

              {quotationFile && (
                <div style={{ marginBottom: "24px" }}>
                  <div className="detail-label" style={{ marginBottom: "10px" }}>ใบเสนอราคา</div>
                  <a href={quotationFile} target="_blank" rel="noreferrer" className="quotation-preview">
                    {isQuotationImage ? (
                      <div className="quotation-preview-image-wrap">
                        <img src={quotationFile} alt={quotationName || `Quotation for ${detailTarget.name}`} className="quotation-preview-image" />
                      </div>
                    ) : (
                      <div className="quotation-preview-file">
                        <div className="quotation-preview-file-icon">{isQuotationPdf ? "PDF" : "FILE"}</div>
                      </div>
                    )}
                    <div className="quotation-preview-meta">
                      <div className="quotation-preview-title">{quotationName || "ไฟล์ใบเสนอราคา"}</div>
                      <div className="quotation-preview-subtitle">กดเพื่อเปิดไฟล์ใบเสนอราคา</div>
                    </div>
                  </a>
                </div>
              )}

              <div style={{ marginBottom: "24px" }}>
                <div className="detail-label" style={{ marginBottom: "8px" }}>รายละเอียดโครงการ</div>
                <div className="detail-description">{detailTarget.description || "-"}</div>
              </div>

              {detailImages.length > 0 && (
                <div style={{ marginBottom: "24px" }}>
                  <div className="detail-label" style={{ marginBottom: "10px" }}>ภาพผลงานโครงการ ({fmt(detailImages.length)} รูป)</div>
                  <div className="portfolio-gallery-grid">
                    {detailImages.slice(0, 4).map((image, index) => {
                      const hasMore = index === 3 && detailImages.length > 4;
                      return (
                        <button key={image} type="button" className="portfolio-gallery-item" onClick={() => setGalleryIndex(index)}>
                          <img src={image} alt={`${detailTarget.name} image ${index + 1}`} className="portfolio-gallery-image" />
                          {hasMore && (
                            <div className="portfolio-gallery-more">
                              <div className="portfolio-gallery-more-count">+{detailImages.length - 3}</div>
                              <div className="portfolio-gallery-more-text">ภาพเพิ่มเติม</div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-ft">
              <button className="btn btn-outline" onClick={closeDetail} type="button">ปิด</button>
              <Link href="/projects" className="btn btn-outline">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                แก้ไข
              </Link>
            </div>
          </div>
        </div>
      )}

      {detailTarget && galleryIndex !== null && detailImages[galleryIndex] && (
        <div className="gallery-lightbox" onClick={() => setGalleryIndex(null)}>
          <button type="button" className="gallery-lightbox-close" onClick={() => setGalleryIndex(null)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <button type="button" className="gallery-lightbox-nav gallery-lightbox-prev" onClick={(event) => { event.stopPropagation(); moveGallery(-1); }} aria-label="Previous image">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button type="button" className="gallery-lightbox-nav gallery-lightbox-next" onClick={(event) => { event.stopPropagation(); moveGallery(1); }} aria-label="Next image">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <div className="gallery-lightbox-stage" onClick={(event) => event.stopPropagation()}>
            <img src={detailImages[galleryIndex]} alt={`${detailTarget.name} image ${galleryIndex + 1}`} className="gallery-lightbox-image" />
            <div className="gallery-lightbox-meta">
              <div className="gallery-lightbox-title">{detailTarget.name}</div>
              <div className="gallery-lightbox-subtitle">{detailTarget.location}</div>
            </div>
            <div className="gallery-lightbox-counter">{galleryIndex + 1} / {detailImages.length}</div>
          </div>
        </div>
      )}
    </>
  );
}
