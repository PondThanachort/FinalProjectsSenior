"use client";

import { MAX_FILE_SIZE_LABEL, fmtDate, fmtSize, gradientBg, portfolioImageSrc, usePortfolioPage } from "@/components/portfolio/usePortfolioPage";
import "./portfolio.css";

export default function PortfolioPage() {
  const {
    images,
    projFilter,
    setProjFilter,
    view,
    setView,
    modal,
    editTarget,
    deleteTarget,
    lightboxImg,
    form,
    setForm,
    errors,
    globalErr,
    saving,
    isDragging,
    setIsDragging,
    projectsOptions,
    staffOptions,
    isSelectMode,
    selectedIds,
    fileInputRef,
    filtered,
    selectedVisibleCount,
    groupedByProject,
    handleFileInput,
    handleDrop,
    removeFile,
    openAdd,
    openEdit,
    openDelete,
    openLightbox,
    closeModal,
    toggleSelectMode,
    toggleSelectImage,
    selectAllFiltered,
    clearAllSelected,
    handleDeleteMultiple,
    setF,
    handleSave,
    handleDelete,
    kpiTotal,
    kpiProjects,
    toast,
  } = usePortfolioPage();

  return (
    <>
      {toast && (
        <div className="toast">
          <div className="toast-dot">✓</div>
          {toast}
        </div>
      )}

      <div className="page">
        {/* Breadcrumb */}
        <div className="bc">
          <a href="/projects">หน้าหลัก</a><span>/</span>
          <strong>จัดเก็บภาพผลงาน</strong>
        </div>

        {/* Header */}
        <div className="hd">
          <div>
            <div className="hd-label">ภาพผลงาน</div>
            <h1 className="hd-title">จัดเก็บภาพและรายละเอียดผลงาน</h1>
            <p className="hd-sub">อัปโหลด แก้ไข และจัดการภาพผลงานของแต่ละโครงการ</p>
          </div>
          <button className="btn btn-dark" onClick={openAdd}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            อัปโหลดภาพผลงาน
          </button>
        </div>

        {/* KPI */}
        <div className="kpi-row">
          <div className="kpi">
            <div className="kpi-icon">🖼️</div>
            <div className="kpi-lbl">ภาพทั้งหมด</div>
            <div className="kpi-val">{kpiTotal}</div>
            <div className="kpi-sub">รูปภาพ</div>
          </div>
          <div className="kpi">
            <div className="kpi-icon">📁</div>
            <div className="kpi-lbl">โครงการที่มีภาพ</div>
            <div className="kpi-val">{kpiProjects}</div>
            <div className="kpi-sub">โครงการ</div>
          </div>
          <div className="kpi">
            <div className="kpi-icon">📅</div>
            <div className="kpi-lbl">อัปโหลดล่าสุด</div>
            <div className="kpi-val" style={{fontSize:16,paddingTop:4}}>
              {images.length > 0 ? fmtDate(images.sort((a,b)=>b.upload_date.localeCompare(a.upload_date))[0].upload_date) : "-"}
            </div>
            <div className="kpi-sub">วันที่</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <select className="sel" value={projFilter} onChange={e=>setProjFilter(e.target.value)}>
            <option>ทั้งหมด</option>
            {projectsOptions.map(p=><option key={p.id}>{p.name}</option>)}
          </select>
          <div className="view-toggle">
            {!isSelectMode && (
              <>
                <button className={`view-btn${view==="grid"?" on":""}`} onClick={()=>setView("grid")} title="Grid">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                </button>
                <button className={`view-btn${view==="list"?" on":""}`} onClick={()=>setView("list")} title="List">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                </button>
              </>
            )}
          </div>
          {isSelectMode ? (
            <div className="select-toolbar">
              <span className="select-count">{selectedVisibleCount} เลือก</span>
              <span className="select-hint">คลิกเลือกรูปทีละรูป หรือใช้ปุ่มเลือกทั้งหมด</span>
              <button className="btn btn-sm btn-ghost" onClick={clearAllSelected} title="ยกเลิกเลือก">ยกเลิก</button>
              <button className="btn btn-sm btn-ghost" onClick={selectAllFiltered} title="เลือกทั้งหมด">เลือกทั้งหมด</button>
              {selectedVisibleCount > 0 && (
                <button className="btn btn-sm btn-danger" onClick={handleDeleteMultiple} disabled={saving} title="ลบที่เลือก">
                  {saving ? <><div className="spinner" style={{width:12,height:12}}/><span>กำลังลบ...</span></> : `ลบที่เลือก (${selectedVisibleCount})`}
                </button>
              )}
              <button className="btn btn-sm btn-outline" onClick={toggleSelectMode} title="ปิดโหมดเลือก">ปิด</button>
            </div>
          ) : (
            <>
              <span style={{fontSize:12,color:"#9ca3af",whiteSpace:"nowrap"}}>พบ {filtered.length} ภาพ</span>
              {filtered.length > 0 && (
                <button className="btn btn-sm btn-ghost" onClick={toggleSelectMode} title="เลือกหลายรูป">เลือกหลายรูป</button>
              )}
            </>
          )}
        </div>

        {/* ── GRID view (grouped by project) ── */}
        {view === "grid" && (
          filtered.length === 0
            ? <div className="empty"><div className="empty-icon">🖼️</div><div className="empty-txt">ไม่พบภาพผลงาน</div><div style={{fontSize:13,marginTop:4}}>ลองปรับตัวกรองหรือคำค้นหา</div></div>
            : groupedByProject.map(({ project, images: imgs }) => (
              <div key={project.id} className="project-section">
                <div className="project-section-header">
                  <div className="project-section-left">
                    <span className="project-section-title">{project.name}</span>
                    <span className="project-section-count">{imgs.length} ภาพ</span>
                  </div>
                  <button className="btn btn-outline btn-sm" onClick={()=>{setForm(f=>({...f,project_id:String(project.id)}));openAdd();}}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    เพิ่มภาพ
                  </button>
                </div>
                <div className="img-grid">
                  {imgs.map(img => (
                    <div
                      key={img.image_id}
                      className={`img-card${selectedIds.has(img.image_id) ? " selected" : ""}${isSelectMode ? " selectable" : ""}`}
                      onClick={isSelectMode ? () => toggleSelectImage(img.image_id) : undefined}
                    >
                      <div className="img-thumb" style={{background: img.image_file ? "transparent" : gradientBg(img.image_id)}}>
                        {isSelectMode && (
                          <div className="img-select-check">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(img.image_id)}
                              onChange={() => toggleSelectImage(img.image_id)}
                              onClick={(event) => event.stopPropagation()}
                              style={{width:18,height:18,cursor:"pointer"}}
                            />
                          </div>
                        )}
                        {img.image_file
                          ? <img src={portfolioImageSrc(img.image_file)} alt={img.image_name}/>
                          : <div className="img-placeholder">🏗️</div>
                        }
                        {!isSelectMode && (
                          <div className="img-overlay">
                            <button className="img-overlay-btn img-overlay-view" onClick={()=>openLightbox(img)} title="ดูภาพ">
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            </button>
                            <button className="img-overlay-btn img-overlay-edit" onClick={()=>openEdit(img)} title="แก้ไข">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button className="img-overlay-btn img-overlay-del" onClick={()=>openDelete(img)} title="ลบ">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="img-body">
                        <div className="img-name">{img.image_name}</div>
                        <div className="img-meta">
                          <span>{fmtDate(img.upload_date)}</span>
                          <span>{img.created_by.split(" ")[0]}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
        )}

        {/* ── LIST view ── */}
        {view === "list" && (
          <div className="table-wrap">
            <div className="table-scroll">
              {filtered.length === 0
                ? <div className="empty"><div className="empty-icon">🖼️</div><div className="empty-txt">ไม่พบภาพผลงาน</div></div>
                : (
                <table>
                  <thead>
                    <tr>
                      {isSelectMode && <th style={{width:40,textAlign:"center"}}><input type="checkbox" checked={selectedVisibleCount === filtered.length && filtered.length > 0} onChange={selectedVisibleCount === filtered.length ? clearAllSelected : selectAllFiltered} style={{width:18,height:18}}/></th>}
                      <th>รูปภาพ</th><th>ชื่อไฟล์</th>
                      <th>โครงการ</th><th>วันที่อัปโหลด</th><th>ผู้อัปโหลด</th>{!isSelectMode && <th></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(img => {
                      const proj = projectsOptions.find(p=>p.id===img.project_id);
                      return (
                        <tr key={img.image_id}>
                          {isSelectMode && (
                            <td style={{width:40,textAlign:"center"}}>
                              <input
                                type="checkbox"
                                checked={selectedIds.has(img.image_id)}
                                onChange={() => toggleSelectImage(img.image_id)}
                                style={{width:18,height:18}}
                              />
                            </td>
                          )}
                          <td>
                            <div className="td-thumb" style={{background:gradientBg(img.image_id)}}>
                              {img.image_file
                                ? <img src={portfolioImageSrc(img.image_file)} alt={img.image_name}/>
                                : <div className="td-placeholder">🏗️</div>
                              }
                            </div>
                          </td>
                          <td>
                            <div className="td-name">{img.image_name}</div>
                            <div className="td-sub">#{img.image_id}</div>
                          </td>
                          <td>
                            <span className="badge" style={{background:"#6b7280"}}>{proj?.name||"-"}</span>
                          </td>
                          <td style={{fontSize:12,color:"#6b7280",whiteSpace:"nowrap"}}>{fmtDate(img.upload_date)}</td>
                          <td style={{fontSize:12,color:"#374151",whiteSpace:"nowrap"}}>{img.created_by}</td>
                          {!isSelectMode && (
                          <td>
                            <div className="act-cell">
                              <button className="btn btn-outline btn-xs" onClick={()=>openLightbox(img)}>ดู</button>
                              <button className="btn btn-outline btn-xs" onClick={()=>openEdit(img)}>แก้ไข</button>
                              <button className="btn btn-ghost btn-ico btn-xs" onClick={()=>openDelete(img)}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                              </button>
                            </div>
                          </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            <div className="table-ft">แสดง {filtered.length} จาก {images.length} ภาพ</div>
          </div>
        )}
      </div>

      {/* ════ LIGHTBOX ════ */}
      {modal === "lightbox" && lightboxImg && (
        <div className="lightbox-overlay" onClick={closeModal}>
          <button className="lightbox-close" onClick={closeModal}>×</button>
          <div className="lightbox-img-wrap" onClick={e=>e.stopPropagation()}>
            {lightboxImg.image_file
              ? <img src={portfolioImageSrc(lightboxImg.image_file)} alt={lightboxImg.image_name}/>
              : <div className="lightbox-placeholder" style={{background:gradientBg(lightboxImg.image_id)}}>🏗️</div>
            }
          </div>
          <div className="lightbox-info" onClick={e=>e.stopPropagation()}>
            <div className="lightbox-name">{lightboxImg.image_name}</div>
            <div className="lightbox-meta">
              {projectsOptions.find(p=>p.id===lightboxImg.project_id)?.name} · {fmtDate(lightboxImg.upload_date)} · {lightboxImg.created_by}
            </div>
          </div>
        </div>
      )}

      {/* ════ MODAL เพิ่ม/แก้ไข ════ */}
      {(modal === "add" || modal === "edit") && (
        <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)closeModal()}}>
          <div className="modal">
            <div className="modal-hd">
              <div className="modal-title">{modal==="add"?"อัปโหลดภาพผลงาน":"แก้ไขข้อมูลภาพ"}</div>
              <button className="modal-close" onClick={closeModal}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="modal-body">
              {globalErr && (
                <div className="gerr">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{flexShrink:0}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {globalErr}
                </div>
              )}

              <div className="fg2">
                {/* โครงการ */}
                <div className="field fc">
                  <label className="fl">โครงการ <span className="req">*</span></label>
                  <select className={`fs${errors.project_id?" e":""}`} value={form.project_id} onChange={e=>setF("project_id",e.target.value)}>
                    <option value="">-- เลือกโครงการ --</option>
                    {projectsOptions.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  {errors.project_id && <span className="err">{errors.project_id}</span>}
                </div>

                {/* ผู้อัปโหลด */}
                <div className="field fc">
                  <label className="fl">ผู้อัปโหลด <span className="req">*</span></label>
                  <select className={`fs${errors.created_by?" e":""}`} value={form.created_by} onChange={e=>setF("created_by",e.target.value)}>
                    <option value="">-- เลือกผู้อัปโหลด --</option>
                    {staffOptions.map(s => (
                      <option key={s.staff_id} value={`${s.first_name} ${s.last_name}`}>
                        {s.first_name} {s.last_name}
                      </option>
                    ))}
                  </select>
                  {errors.created_by && <span className="err">{errors.created_by}</span>}
                </div>
              </div>

              {/* Drop zone (เฉพาะ add หรือ edit ก็ได้เพิ่ม) */}
              {modal === "add" && (
                <div className="field" style={{marginBottom:0}}>
                  <label className="fl">รูปภาพ <span className="req">*</span></label>
                  <input ref={fileInputRef} type="file" multiple accept=".jpg,.jpeg,.png,image/jpeg,image/png" style={{display:"none"}} onChange={handleFileInput}/>

                  <div
                    className={`dropzone${isDragging?" dragging":""}${errors.files?" has-error":""}`}
                    onClick={()=>fileInputRef.current?.click()}
                    onDragOver={e=>{e.preventDefault();setIsDragging(true);}}
                    onDragLeave={()=>setIsDragging(false)}
                    onDrop={handleDrop}
                  >
                    <div className="dropzone-icon">🖼️</div>
                    <div className="dropzone-title">ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์</div>
                    <div className="dropzone-sub">อัปโหลดได้หลายไฟล์พร้อมกัน</div>
                    <div className="dropzone-badge">
                      <span className="file-badge">JPG</span>
                      <span className="file-badge">PNG</span>
                      <span className="size-badge">สูงสุด {MAX_FILE_SIZE_LABEL}/ไฟล์</span>
                    </div>
                  </div>
                  {errors.files && <span className="err">{errors.files}</span>}

                  {/* Preview list */}
                  {form.files.length > 0 && (
                    <div className="upload-list">
                      {form.files.map(f => (
                        <div key={f.id} className={`upload-item${f.error?" has-err":""}`}>
                          <div className="upload-preview">
                            {f.preview && !f.error
                              ? <img src={f.preview} alt={f.name}/>
                              : <span>❌</span>
                            }
                          </div>
                          <div className="upload-info">
                            <div className="upload-name">{f.name}</div>
                            <div className="upload-size">{fmtSize(f.size)}</div>
                            {f.error && <div className="upload-err">{f.error}</div>}
                          </div>
                          <button className="upload-remove" onClick={()=>removeFile(f.id)}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* แสดงรูปเดิม (edit mode) */}
              {modal === "edit" && editTarget && (
                <div className="field">
                  <label className="fl">รูปภาพปัจจุบัน</label>
                  <div style={{display:"flex",gap:12,alignItems:"center",padding:"12px",background:"#f9fafb",borderRadius:10,border:"1px solid #f0f0f0"}}>
                    <div style={{width:56,height:56,borderRadius:8,overflow:"hidden",background:gradientBg(editTarget.image_id),flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,opacity:.5}}>
                      {editTarget.image_file ? <img src={portfolioImageSrc(editTarget.image_file)} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : "🏗️"}
                    </div>
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:"#111110"}}>{editTarget.image_name}</div>
                      <div style={{fontSize:11,color:"#9ca3af"}}>อัปโหลดเมื่อ {fmtDate(editTarget.upload_date)}</div>
                    </div>
                  </div>
                  <span className="hint">ไม่สามารถเปลี่ยนไฟล์ภาพในโหมดแก้ไข</span>
                </div>
              )}
            </div>

            <div className="modal-ft">
              <button className="btn btn-ghost" onClick={closeModal}>ยกเลิก</button>
              <button className="btn btn-dark" onClick={handleSave} disabled={saving}>
                {saving
                  ? <><div className="spinner"/><span>กำลังอัปโหลด...</span></>
                  : modal==="add"
                    ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>อัปโหลดภาพ{form.files.filter(f=>!f.error).length > 0 ? ` (${form.files.filter(f=>!f.error).length} ไฟล์)` : ""}</>
                    : "บันทึกการแก้ไข"
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ MODAL ลบ ════ */}
      {modal === "delete" && deleteTarget && (
        <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)closeModal()}}>
          <div className="modal modal-delete">
            <div className="modal-hd">
              <div className="modal-title">ยืนยันการลบ</div>
              <button className="modal-close" onClick={closeModal}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="modal-body" style={{textAlign:"center",padding:"32px 24px"}}>
              <div className="del-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              </div>
              {/* ภาพ preview ในโมดัลลบ */}
              <div style={{width:80,height:60,borderRadius:10,overflow:"hidden",background:gradientBg(deleteTarget.image_id),margin:"0 auto 14px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,opacity:.5}}>
                {deleteTarget.image_file ? <img src={portfolioImageSrc(deleteTarget.image_file)} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : "🏗️"}
              </div>
              <p style={{fontSize:15,color:"#374151",marginBottom:8,lineHeight:1.7}}>
                ต้องการลบภาพ<br/>
                <strong style={{color:"#dc2626"}}>&quot;{deleteTarget.image_name}&quot;</strong> หรือไม่?
              </p>
              <div style={{fontSize:12,color:"#9ca3af",marginBottom:4}}>
                {projectsOptions.find(p=>p.id===deleteTarget.project_id)?.name} · {fmtDate(deleteTarget.upload_date)}
              </div>
              <p style={{fontSize:13,color:"#9ca3af"}}>ไฟล์ภาพจะถูกลบออกจากระบบถาวร</p>
            </div>
            <div className="modal-ft">
              <button className="btn btn-ghost" onClick={closeModal}>ยกเลิก</button>
              <button className="btn btn-danger" onClick={handleDelete} disabled={saving}>
                {saving ? <><div className="spinner"/><span>กำลังลบ...</span></> : "ยืนยันการลบ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
