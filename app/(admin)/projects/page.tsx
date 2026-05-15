"use client";

import { STATUS_STYLE } from "@/components/data/adminProjectsData";
import { useProjectsPage } from "@/components/projects/useProjectsPage";
import "./editprojects.css";

export default function ProjectsPage() {
  const {
    projects,
    search,
    setSearch,
    statFilter,
    setStatFilter,
    view,
    setView,
    loading,
    loadError,
    modal,
    setModal,
    deleteTarget,
    detailTarget,
    galleryIndex,
    form,
    setForm,
    errors,
    globalError,
    saving,
    successMsg,
    staffOptions,
    provinces,
    provinceId,
    districtId,
    subdistrictId,
    detailAddress,
    setDetailAddress,
    fileRef,
    quotationRef,
    filtered,
    openAdd,
    openEdit,
    openDelete,
    openDetail,
    closeModal,
    handleField,
    handleImage,
    handleQuotationFile,
    buildLocation,
    selectProvince,
    selectDistrict,
    selectSubdistrict,
    districtOptions,
    subdistrictOptions,
    detailImages,
    quotationFile,
    quotationName,
    isQuotationImage,
    isQuotationPdf,
    openGallery,
    closeGallery,
    moveGallery,
    handleSave,
    handleDelete,
    statuses,
  } = useProjectsPage();

  return (
    <>
      {/* ── SUCCESS TOAST ── */}
      {successMsg && (
        <div className="toast">
          <div className="toast-icon">✓</div>
          {successMsg}
        </div>
      )}

      <div className="page">

        {/* Breadcrumb */}
        <div className="bc">
          <a href="/projects">หน้าหลัก</a><span>/</span>
          <strong>จัดการโครงการ</strong>
        </div>

        {/* Header */}
        <div className="hd">
          <div>
            <div className="hd-label">โครงการ</div>
            <h1 className="hd-title">จัดการโครงการ</h1>
            <p className="hd-sub">เพิ่ม แก้ไข และจัดการข้อมูลโครงการทั้งหมด</p>
          </div>
          <button className="btn btn-dark" onClick={openAdd}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            เพิ่มโครงการใหม่
          </button>
        </div>

        {/* KPI */}
        {loadError && (
          <div className="global-err" style={{marginBottom:16}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{flexShrink:0}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {loadError}
          </div>
        )}
        <div className="kpi-row">
          <div className="kpi">
            <div className="kpi-icon">🏗️</div>
            <div className="kpi-lbl">โครงการทั้งหมด</div>
            <div className="kpi-val">{projects.length}</div>
            <div className="kpi-sub">โครงการ</div>
          </div>
          <div className="kpi">
            <div className="kpi-icon">⚙️</div>
            <div className="kpi-lbl">กำลังดำเนินการ</div>
            <div className="kpi-val" style={{color:"#ca8a04"}}>{projects.filter(p=>p.status==="กำลังดำเนินการ").length}</div>
            <div className="kpi-sub">โครงการ</div>
          </div>
          <div className="kpi">
            <div className="kpi-icon">✅</div>
            <div className="kpi-lbl">เสร็จสิ้น</div>
            <div className="kpi-val" style={{color:"#16a34a"}}>{projects.filter(p=>p.status==="เสร็จสิ้น").length}</div>
            <div className="kpi-sub">โครงการ</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-wrap">
            <span className="search-ic">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input className="search-inp" placeholder="ค้นหาโครงการ, สถานที่..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <select className="sel" value={statFilter} onChange={e=>setStatFilter(e.target.value)}>
            {statuses.map(s=><option key={s}>{s}</option>)}
          </select>
          <div className="view-toggle">
            <button className={`view-btn${view==="grid"?" on":""}`} onClick={()=>setView("grid")} title="Grid">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            </button>
            <button className={`view-btn${view==="table"?" on":""}`} onClick={()=>setView("table")} title="Table">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            </button>
          </div>
          <span style={{fontSize:12,color:"#9ca3af",whiteSpace:"nowrap"}}>พบ {filtered.length} โครงการ</span>
        </div>

        {/* ── GRID VIEW ── */}
        {view === "grid" && (
          loading ? (
            <div className="empty">
              <div className="empty-txt">กำลังโหลดข้อมูลโครงการ...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">🔍</div>
              <div className="empty-txt">ไม่พบโครงการที่ตรงกัน</div>
              <div style={{fontSize:13,marginTop:4}}>ลองปรับตัวกรองหรือคำค้นหา</div>
            </div>
          ) : (
            <div className="proj-grid">
              {filtered.map(p => {
                const st = STATUS_STYLE[p.status] || {bg:"#f3f4f6",color:"#6b7280"};
                return (
                  <div key={p.id} className="proj-card" onClick={()=>openDetail(p)} style={{cursor:"pointer"}}>
                    <div className="proj-img" style={{background:`linear-gradient(135deg,#6b728022,#6b728044)`}}>
                      {p.image
                        ? <img src={p.image} alt={p.name}/>
                        : <div className="proj-img-placeholder">🏗️</div>
                      }
                      <span className="proj-status-badge" style={{background:st.bg,color:st.color}}>{p.status}</span>
                    </div>
                    <div className="proj-body">
                      <div className="proj-name">{p.name}</div>
                      <div className="proj-desc">{p.description}</div>
                      <div className="proj-meta">
                        <span>📍 {p.location}</span>
                        <span> {p.staff}</span>
                      </div>
                      <div className="proj-actions" onClick={e=>e.stopPropagation()}>
                        <button className="btn btn-outline btn-sm" style={{flex:1}} onClick={()=>openEdit(p)}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          แก้ไข
                        </button>
                        <button className="btn btn-ghost btn-sm icon-btn" onClick={()=>openDelete(p)} title="ลบ">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* ── TABLE VIEW ── */}
        {view === "table" && (
          <div className="table-wrap">
            <div className="table-scroll">
              {loading ? (
                <div className="empty"><div className="empty-txt">กำลังโหลดข้อมูลโครงการ...</div></div>
              ) : filtered.length === 0 ? (
                <div className="empty"><div className="empty-icon">🔍</div><div className="empty-txt">ไม่พบโครงการ</div></div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>#</th><th>โครงการ</th><th>สถานะ</th>
                      <th>ที่ตั้ง</th><th>ผู้รับผิดชอบ</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(p => {
                      const st = STATUS_STYLE[p.status]||{bg:"#f3f4f6",color:"#6b7280"};
                      return (
                        <tr key={p.id}>
                          <td style={{color:"#9ca3af",fontWeight:600}}>{String(p.id).padStart(2,"0")}</td>
                          <td>
                            <div className="td-name">{p.name}</div>
                            <div className="td-sub">{p.description.slice(0,40)}...</div>
                          </td>
                          <td><span className="td-badge" style={{background:st.bg,color:st.color}}>{p.status}</span></td>
                          <td style={{color:"#6b7280",fontSize:12,whiteSpace:"nowrap"}}>📍 {p.location}</td>
                          <td style={{color:"#6b7280",whiteSpace:"nowrap"}}>{p.staff}</td>
                          <td>
                            <div className="td-actions">
                              <button className="btn btn-outline btn-xs" onClick={()=>openEdit(p)}>แก้ไข</button>
                              <button className="btn btn-ghost btn-xs icon-btn" onClick={()=>openDelete(p)}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            <div className="table-ft">แสดง {filtered.length} จาก {projects.length} โครงการ</div>
          </div>
        )}
      </div>

      {/* ════ MODAL ADD / EDIT ════ */}
      {(modal === "add" || modal === "edit") && (
        <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)closeModal()}}>
          <div className="modal">
            <div className="modal-hd">
              <div className="modal-title">{modal==="add"?"เพิ่มโครงการใหม่":"แก้ไขโครงการ"}</div>
              <button className="modal-close" onClick={closeModal}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="modal-body">
              {/* Global error */}
              {globalError && (
                <div className="global-err">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{flexShrink:0}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {globalError}
                </div>
              )}

              <div className="form-grid">
                {/* ชื่อโครงการ */}
                <div className="field form-full">
                  <label className="field-label">ชื่อโครงการ <span className="req">*</span></label>
                  <input className={`field-input${errors.name?" has-err":""}`} placeholder="เช่น KWI Head office" value={form.name} onChange={e=>handleField("name",e.target.value)}/>
                  {errors.name && <span className="err-msg">{errors.name}</span>}
                </div>

                {/* รายละเอียด */}
                <div className="field form-full">
                  <label className="field-label">รายละเอียดโครงการ <span className="req">*</span></label>
                  <textarea className={`field-textarea${errors.description?" has-err":""}`} placeholder="อธิบายลักษณะและขอบเขตของโครงการ..." value={form.description} onChange={e=>handleField("description",e.target.value)}/>
                  {errors.description && <span className="err-msg">{errors.description}</span>}
                </div>

                {/* ที่ตั้ง */}
                <div className="field form-full">
                  <label className="field-label">สถานที่ดำเนินโครงการ <span className="req">*</span></label>
                  {modal === "add" ? (
                    <>
                      <div className="form-grid" style={{gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:10}}>
                        <div className="field" style={{marginBottom:0}}>
                          <select className={`field-select${errors.location?" has-err":""}`} value={provinceId} onChange={e=>selectProvince(e.target.value)}>
                            <option value="">-- เลือกจังหวัด --</option>
                            {provinces.map(p => <option key={p.id} value={p.id}>{p.name_th}</option>)}
                          </select>
                        </div>
                        <div className="field" style={{marginBottom:0}}>
                          <select className={`field-select${errors.location?" has-err":""}`} value={districtId} onChange={e=>selectDistrict(e.target.value)} disabled={!provinceId}>
                            <option value="">-- เลือกอำเภอ --</option>
                            {districtOptions.map(d => <option key={d.id} value={d.id}>{d.name_th}</option>)}
                          </select>
                        </div>
                        <div className="field" style={{marginBottom:0}}>
                          <select className={`field-select${errors.location?" has-err":""}`} value={subdistrictId} onChange={e=>selectSubdistrict(e.target.value)} disabled={!districtId}>
                            <option value="">-- เลือกตำบล --</option>
                            {subdistrictOptions.map(s => <option key={s.id} value={s.id}>{s.name_th}</option>)}
                          </select>
                        </div>
                      </div>
                      <input className={`field-input${errors.location?" has-err":""}`} placeholder="บ้านเลขที่ ถนน หมู่บ้าน" value={detailAddress} onChange={e=>setDetailAddress(e.target.value)}/>
                      <div style={{marginTop:8,fontSize:12,color:"#6b7280"}}>
                        {detailAddress || provinceId || districtId || subdistrictId ? `รวมที่อยู่: ${buildLocation()}` : ""}
                      </div>
                    </>
                  ) : (
                    <input className={`field-input${errors.location?" has-err":""}`} placeholder="เช่น กรุงเทพ สาทร" value={form.location} onChange={e=>handleField("location",e.target.value)}/>
                  )}
                  {errors.location && <span className="err-msg">{errors.location}</span>}
                </div>

                {/* สถานะ */}
                <div className="field">
                  <label className="field-label">สถานะโครงการ <span className="req">*</span></label>
                  <select className="field-select" value={form.status} onChange={e=>handleField("status",e.target.value)} disabled={modal === "add"}>
                    {statuses.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>

                {/* วันเริ่ม */}
                <div className="field">
                  <label className="field-label">วันที่เริ่มต้น <span className="req">*</span></label>
                  <input type="date" className={`field-input${errors.startDate?" has-err":""}`} value={form.startDate} onChange={e=>handleField("startDate",e.target.value)}/>
                  {errors.startDate && <span className="err-msg">{errors.startDate}</span>}
                </div>

                {/* วันสิ้นสุด */}
                <div className="field">
                  <label className="field-label">วันที่สิ้นสุด <span className="req">*</span></label>
                  <input type="date" className={`field-input${errors.endDate?" has-err":""}`} value={form.endDate} onChange={e=>handleField("endDate",e.target.value)}/>
                  {errors.endDate && <span className="err-msg">{errors.endDate}</span>}
                </div>


                {/* ผู้รับผิดชอบ */}
                <div className="field form-full">
                  <label className="field-label">ผู้รับผิดชอบ <span className="req">*</span></label>
                  <select className={`field-select${errors.staff?" has-err":""}`} value={form.staff} onChange={e=>handleField("staff",e.target.value)}>
                    <option value="">-- เลือกผู้รับผิดชอบ --</option>
                    {staffOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.staff && <span className="err-msg">{errors.staff}</span>}
                </div>

                {/* รูปภาพ */}
                <div className="field form-full">
                  <label className="field-label">รูปภาพหลักโครงการ</label>
                  <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleImage}/>
                  <div className="img-upload-area" onClick={()=>fileRef.current?.click()}>
                    {form.image
                      ? <img src={form.image} alt="preview" className="img-preview"/>
                      : <><div className="img-icon">🖼️</div><div className="img-txt">คลิกเพื่ออัปโหลดรูปภาพ<br/><span style={{fontSize:10,color:"#d1d5db"}}>PNG, JPG ขนาดไม่เกิน 50MB</span></div></>
                    }
                  </div>
                  {errors.image && <span className="err-msg">{errors.image}</span>}
                  {form.image && (
                    <button className="btn btn-ghost btn-sm" style={{alignSelf:"flex-start",marginTop:6}} onClick={()=>setForm(f=>({...f,image:""}))}>
                      ลบรูปภาพ
                    </button>
                  )}
                </div>

                {/* ใบเสนอราคา */}
                <div className="field form-full">
                  <label className="field-label">ใบเสนอราคา</label>
                  <input ref={quotationRef} type="file" accept="image/*,.pdf" style={{display:"none"}} onChange={handleQuotationFile}/>
                  <div className="img-upload-area" onClick={()=>quotationRef.current?.click()}>
                    {form.quotationFile
                      ? <div style={{display:"grid",placeItems:"center",gap:8}}>
                          <div className="img-icon">📄</div>
                          <div style={{fontSize:14,color:"#111827",fontWeight:600}}>{form.quotationName || "ไฟล์ที่เลือกแล้ว"}</div>
                          <div style={{fontSize:12,color:"#6b7280"}}>รองรับ PNG, JPG, PDF</div>
                        </div>
                      : <><div className="img-icon">📄</div><div className="img-txt">คลิกเพื่ออัปโหลดใบเสนอราคา<br/><span style={{fontSize:10,color:"#d1d5db"}}>PNG, JPG, PDF ขนาดไม่เกิน 50MB</span></div></>
                    }
                  </div>
                  {errors.quotationFile && <span className="err-msg">{errors.quotationFile}</span>}
                  {form.quotationFile && (
                    <button className="btn btn-ghost btn-sm" style={{alignSelf:"flex-start",marginTop:6}} onClick={()=>setForm(f=>({...f,quotationFile:"", quotationName:""}))}>
                      ลบไฟล์ใบเสนอราคา
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-ft">
              <button className="btn btn-ghost" onClick={closeModal}>ยกเลิก</button>
              <button className="btn btn-dark" onClick={handleSave} disabled={saving}>
                {saving ? <><div className="spinner"/><span>กำลังบันทึก...</span></> : modal==="add" ? "เพิ่มโครงการ" : "บันทึกการแก้ไข"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ MODAL DELETE ════ */}
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
              <div className="delete-icon-wrap">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </div>
              <p style={{fontSize:15,color:"#374151",marginBottom:8,lineHeight:1.6}}>
                คุณต้องการลบโครงการ<br/>
                <span className="delete-proj-name">&quot;{deleteTarget.name}&quot;</span> หรือไม่?
              </p>
              <p style={{fontSize:13,color:"#9ca3af"}}>ข้อมูลทั้งหมดจะถูกลบออกจากระบบ และไม่สามารถกู้คืนได้</p>
              {globalError && (
                <div className="global-err" style={{marginTop:18,marginBottom:0,textAlign:"left"}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{flexShrink:0}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {globalError}
                </div>
              )}
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

      {/* ════ MODAL DETAIL ════ */}
      {modal === "detail" && detailTarget && (
        <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)closeModal()}}>
          <div className="modal" style={{maxWidth:"800px"}}>
            <div className="modal-hd">
              <div className="modal-title">{detailTarget.name}</div>
              <button className="modal-close" onClick={closeModal}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="modal-body">
              {/* Project image */}
              <div style={{marginBottom:"24px",borderRadius:"8px",overflow:"hidden",background:"#f3f4f6",aspectRatio:"16/9",display:"grid",placeItems:"center"}}>
                {detailTarget.image
                  ? <img src={detailTarget.image} alt={detailTarget.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  : <div style={{fontSize:"48px"}}>🏗️</div>
                }
              </div>

              {/* Project details */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px",marginBottom:"24px"}}>
                <div>
                  <div style={{fontSize:"12px",color:"#6b7280",fontWeight:600,marginBottom:"4px"}}>ชื่อโครงการ</div>
                  <div style={{fontSize:"16px",color:"#111827",fontWeight:600}}>{detailTarget.name}</div>
                </div>
                <div>
                  <div style={{fontSize:"12px",color:"#6b7280",fontWeight:600,marginBottom:"4px"}}>สถานที่</div>
                  <div style={{fontSize:"14px",color:"#374151"}}>📍 {detailTarget.location}</div>
                </div>
                <div>
                  <div style={{fontSize:"12px",color:"#6b7280",fontWeight:600,marginBottom:"4px"}}>วันที่เริ่มต้น</div>
                  <div style={{fontSize:"14px",color:"#374151"}}>{detailTarget.startDate}</div>
                </div>
                <div>
                  <div style={{fontSize:"12px",color:"#6b7280",fontWeight:600,marginBottom:"4px"}}>วันที่สิ้นสุด</div>
                  <div style={{fontSize:"14px",color:"#374151"}}>{detailTarget.endDate}</div>
                </div>
                <div>
                  <div style={{fontSize:"12px",color:"#6b7280",fontWeight:600,marginBottom:"4px"}}>ผู้รับผิดชอบ</div>
                  <div style={{fontSize:"14px",color:"#374151"}}>{detailTarget.staff}</div>
                </div>
                <div>
                  <div style={{fontSize:"12px",color:"#6b7280",fontWeight:600,marginBottom:"4px"}}>สถานะ</div>
                  <div>
                    <span style={{
                      display:"inline-block",
                      padding:"4px 12px",
                      borderRadius:"4px",
                      fontSize:"12px",
                      fontWeight:600,
                      background: STATUS_STYLE[detailTarget.status]?.bg || "#f3f4f6",
                      color: STATUS_STYLE[detailTarget.status]?.color || "#6b7280"
                    }}>
                      {detailTarget.status}
                    </span>
                  </div>
                </div>
              </div>

              {quotationFile && (
                <div style={{marginBottom:"24px"}}>
                  <div style={{fontSize:"12px",color:"#6b7280",fontWeight:600,marginBottom:"10px"}}>ใบเสนอราคา</div>
                  <a
                    href={quotationFile}
                    target="_blank"
                    rel="noreferrer"
                    className="quotation-preview"
                  >
                    {isQuotationImage ? (
                      <div className="quotation-preview-image-wrap">
                        <img
                          src={quotationFile}
                          alt={quotationName || `Quotation for ${detailTarget.name}`}
                          className="quotation-preview-image"
                        />
                      </div>
                    ) : (
                      <div className="quotation-preview-file">
                        <div className="quotation-preview-file-icon">
                          {isQuotationPdf ? "PDF" : "FILE"}
                        </div>
                      </div>
                    )}
                    <div className="quotation-preview-meta">
                      <div className="quotation-preview-title">
                        {quotationName || "ไฟล์ใบเสนอราคา"}
                      </div>
                      <div className="quotation-preview-subtitle">
                        {isQuotationImage
                          ? "กดเพื่อดูใบเสนอราคาแบบรูปภาพ"
                          : isQuotationPdf
                            ? "กดเพื่อดูใบเสนอราคาแบบ PDF"
                            : "กดเพื่อเปิดไฟล์ใบเสนอราคา"}
                      </div>
                    </div>
                  </a>
                </div>
              )}

              {/* Project description */}
              <div>
                <div style={{fontSize:"12px",color:"#6b7280",fontWeight:600,marginBottom:"8px"}}>รายละเอียดโครงการ</div>
                <div style={{fontSize:"14px",color:"#374151",lineHeight:"1.6",padding:"12px",background:"#f9fafb",borderRadius:"6px"}}>
                  {detailTarget.description}
                </div>
              </div>

              {/* Project images */}
              {detailImages.length > 0 && (
                <div style={{ marginBottom: "24px" }}>
                  <div style={{fontSize:"12px",color:"#6b7280",fontWeight:600,marginBottom:"10px"}}>ภาพผลงานโครงการ</div>
                  <div className="portfolio-gallery-grid">
                    {detailImages.slice(0, 4).map((image: string, index: number) => {
                      const hasMore = index === 3 && detailImages.length > 4;
                      return (
                        <button
                          key={index}
                          type="button"
                          className="portfolio-gallery-item"
                          onClick={() => openGallery(index)}
                        >
                          <img
                            src={image}
                            alt={`Project ${detailTarget.id} Image ${index + 1}`}
                            className="portfolio-gallery-image"
                          />
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
              <button className="btn btn-ghost" onClick={closeModal}>ปิด</button>
              <button className="btn btn-outline" onClick={()=>{setModal("none"); openEdit(detailTarget)}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                แก้ไข
              </button>
            </div>
          </div>
        </div>
      )}

      {modal === "detail" && detailTarget && galleryIndex !== null && detailImages[galleryIndex] && (
        <div className="gallery-lightbox" onClick={closeGallery}>
          <button type="button" className="gallery-lightbox-close" onClick={closeGallery}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <button
            type="button"
            className="gallery-lightbox-nav gallery-lightbox-prev"
            onClick={(event) => { event.stopPropagation(); moveGallery(-1); }}
            aria-label="Previous image"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button
            type="button"
            className="gallery-lightbox-nav gallery-lightbox-next"
            onClick={(event) => { event.stopPropagation(); moveGallery(1); }}
            aria-label="Next image"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>

          <div className="gallery-lightbox-stage" onClick={(event) => event.stopPropagation()}>
            <img
              src={detailImages[galleryIndex]}
              alt={`${detailTarget.name} image ${galleryIndex + 1}`}
              className="gallery-lightbox-image"
            />
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
