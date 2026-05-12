"use client";

import { MAX_FILE_SIZE_MB, fmt, fmtDate, fmtSize, poRef, purchaseFileSrc, toNum, usePurchasePage } from "@/components/purchase/usePurchasePage";
import "./purchase.css";

export default function PurchasePage() {
  const {
    purchases,
    materials,
    search,
    setSearch,
    supplierFilter,
    setSupplierFilter,
    modal,
    editTarget,
    deleteTarget,
    viewTarget,
    form,
    setForm,
    errors,
    setErrors,
    globalErr,
    loading,
    saving,
    converting,
    toast,
    isDragging,
    setIsDragging,
    staffOptions,
    fileInputRef,
    suppliers,
    filtered,
    totalValue,
    handleFileInput,
    handleDrop,
    setItemF,
    addItem,
    removeItem,
    calcTotal,
    openAdd,
    openEdit,
    openDelete,
    openView,
    closeModal,
    setF,
    setNumericF,
    setNumericItemF,
    blockNonDigitInput,
    blockNonDigitPaste,
    handleSave,
    handleDelete,
  } = usePurchasePage();

  return (
    <>
      {toast && <div className="toast"><div className="toast-dot">✓</div>{toast}</div>}

      <div className="page">
        {/* Breadcrumb */}
        <div className="bc">
          <a href="/projects">หน้าหลัก</a><span>/</span>
          <strong>จัดการสั่งซื้อวัสดุ</strong>
        </div>

        {/* Header */}
        <div className="hd">
          <div>
            <div className="hd-label">การจัดซื้อ</div>
            <h1 className="hd-title">จัดการสั่งซื้ออุปกรณ์และวัสดุ</h1>
            <p className="hd-sub">บันทึก แก้ไข และติดตามประวัติการสั่งซื้อวัสดุทั้งหมด</p>
          </div>
          <button className="btn btn-dark" onClick={openAdd}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            เพิ่มรายการสั่งซื้อ
          </button>
        </div>

        {(globalErr && modal === "none") && (
          <div className="gerr">{globalErr}</div>
        )}

        {/* KPI */}
        <div className="kpi-row">
          <div className="kpi">
            <div className="kpi-icon">🧾</div>
            <div className="kpi-lbl">รายการทั้งหมด</div>
            <div className="kpi-val">{purchases.length}</div>
            <div className="kpi-sub">ใบสั่งซื้อ</div>
          </div>
          <div className="kpi">
            <div className="kpi-icon">🏪</div>
            <div className="kpi-lbl">แหล่งจัดซื้อ</div>
            <div className="kpi-val">{new Set(purchases.map(p=>p.supplier)).size}</div>
            <div className="kpi-sub">ร้านค้า/บริษัท</div>
          </div>
          <div className="kpi">
            <div className="kpi-icon">📄</div>
            <div className="kpi-lbl">ไฟล์แนบ</div>
            <div className="kpi-val">{purchases.length}</div>
            <div className="kpi-sub">เอกสาร PDF</div>
          </div>
          <div className="kpi">
            <div className="kpi-icon">💰</div>
            <div className="kpi-lbl">มูลค่ารวม</div>
            <div className="kpi-val" style={{fontSize:16}}>฿{fmt(purchases.reduce((s,p)=>s+toNum(p.total_price),0))}</div>
            <div className="kpi-sub">บาท</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-wrap">
            <span className="search-ic">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input className="search-inp" placeholder="ค้นหา เลข PO, แหล่งจัดซื้อ, ไฟล์, ผู้อัปโหลด..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <select className="sel" value={supplierFilter} onChange={e=>setSupplierFilter(e.target.value)}>
            {suppliers.map(s=><option key={s}>{s}</option>)}
          </select>
          <span style={{fontSize:12,color:"#9ca3af",whiteSpace:"nowrap"}}>พบ {filtered.length} รายการ</span>
        </div>

        {/* Table */}
        <div className="table-wrap">
          <div className="table-scroll">
            {loading
              ? <div className="empty"><div className="empty-icon">...</div><div className="empty-txt">กำลังโหลดข้อมูลการสั่งซื้อ</div></div>
              : filtered.length===0
              ? <div className="empty"><div className="empty-icon">🧾</div><div className="empty-txt">ไม่พบรายการสั่งซื้อ</div></div>
              : (
              <table>
                <thead>
                  <tr>
                    <th>เลขที่ PO</th><th>เอกสาร</th><th>แหล่งจัดซื้อ</th>
                    <th>วันที่</th><th>รายการ</th><th>ผู้อัปโหลด</th>
                    <th style={{textAlign:"right"}}>ราคารวม</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p=>(
                    <tr key={p.purchase_id}>
                      <td><span className="td-mono">{poRef(p.purchase_id)}</span></td>
                      <td>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <div className={`file-icon ${p.file_type==="PDF"?"pdf":"img"}`}>
                            {p.file_type==="PDF"?"📄":"🖼️"}
                          </div>
                          <div>
                            <div className="td-name" style={{fontSize:12}}>{p.file_name}</div>
                            <span className={`badge ${p.file_type==="PDF"?"badge-pdf":"badge-img"}`}>
                              {p.file_type}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td style={{maxWidth:160}}>
                        <div className="td-name" style={{fontSize:13}}>{p.supplier}</div>
                      </td>
                      <td style={{fontSize:12,color:"#6b7280",whiteSpace:"nowrap"}}>{fmtDate(p.upload_date)}</td>
                      <td>
                        <span style={{background:"#f3f4f6",padding:"3px 9px",borderRadius:20,fontSize:12,fontWeight:600}}>
                          {p.items.length} รายการ
                        </span>
                      </td>
                      <td style={{fontSize:12,color:"#6b7280",whiteSpace:"nowrap"}}>{p.created_by}</td>
                      <td style={{textAlign:"right",fontWeight:700,whiteSpace:"nowrap"}}>฿{fmt(toNum(p.total_price))}</td>
                      <td>
                        <div className="act-cell">
                          <button className="btn btn-outline btn-xs" onClick={()=>openView(p)}>ดู</button>
                          <button className="btn btn-outline btn-xs" onClick={()=>openEdit(p)}>แก้ไข</button>
                          <button className="btn btn-ghost btn-ico btn-xs" onClick={()=>openDelete(p)}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="table-ft">
            <span>แสดง {filtered.length} จาก {purchases.length} รายการ</span>
            <span>มูลค่ารวม: <strong style={{color:"#111110"}}>฿{fmt(totalValue)}</strong></span>
          </div>
        </div>
      </div>

      {/* ════ MODAL ดูรายละเอียด ════ */}
      {modal==="view" && viewTarget && (
        <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)closeModal()}}>
          <div className="modal">
            <div className="modal-hd">
              <div className="modal-title">รายละเอียดการสั่งซื้อ</div>
              <button className="modal-close" onClick={closeModal}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="view-section-title">ข้อมูลใบสั่งซื้อ</div>
              <div className="view-grid">
                {[
                  ["เลขที่ PO",    poRef(viewTarget.purchase_id)],
                  ["วันที่",       fmtDate(viewTarget.upload_date)],
                  ["แหล่งจัดซื้อ",viewTarget.supplier],
                  ["ผู้อัปโหลด",   viewTarget.created_by],
                  ["ไฟล์เอกสาร",  viewTarget.file_name],
                  ["ประเภทไฟล์",  viewTarget.file_type],
                ].map(([label,value])=>(
                  <div key={label} className="view-field">
                    <div className="vf-label">{label}</div>
                    <div className="vf-value">{value}</div>
                  </div>
                ))}
                <div className="view-field" style={{gridColumn:"1/-1"}}>
                  <div className="vf-label">ราคารวม</div>
                  <div className="vf-value" style={{fontSize:18,fontFamily:"'Noto Serif Thai',serif",fontWeight:700}}>฿{fmt(toNum(viewTarget.total_price))}</div>
                </div>
              </div>

              {viewTarget.items.length > 0 && (
                <>
                  <div className="view-section-title">รายการวัสดุ/อุปกรณ์</div>
                  <div className="items-table-wrap">
                    <table className="items-tbl">
                      <thead>
                        <tr><th>#</th><th>วัสดุ/อุปกรณ์</th><th style={{textAlign:"right"}}>ราคา/หน่วย</th><th style={{textAlign:"right"}}>จำนวน</th><th style={{textAlign:"right"}}>รวม</th></tr>
                      </thead>
                      <tbody>
                        {viewTarget.items.map((it,i)=>{
                          const mat = materials.find(m=>m.material_id===it.material_id);
                          return (
                            <tr key={i}>
                              <td style={{color:"#9ca3af",fontSize:12,padding:"10px 10px"}}>{i+1}</td>
                              <td style={{padding:"10px 10px"}}>
                                <div style={{fontWeight:600,color:"#111110"}}>{mat?.name||"-"}</div>
                                <div style={{fontSize:11,color:"#9ca3af"}}>{mat?.code} · {mat?.unit}</div>
                              </td>
                              <td style={{textAlign:"right",padding:"10px 10px"}}>฿{fmt(toNum(it.price))}</td>
                              <td style={{textAlign:"right",padding:"10px 10px"}}>{it.quantity} {mat?.unit}</td>
                              <td style={{textAlign:"right",fontWeight:700,padding:"10px 10px"}}>฿{fmt(toNum(it.price)*toNum(it.quantity))}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
            <div className="modal-ft">
              <a
                className="btn btn-outline"
                href={purchaseFileSrc(viewTarget.file_name)}
                target="_blank"
                rel="noreferrer"
              >
                ดูไฟล์เอกสาร
              </a>
              <button className="btn btn-ghost" onClick={closeModal}>ปิด</button>
              <button className="btn btn-dark" onClick={()=>{closeModal();openEdit(viewTarget);}}>แก้ไขข้อมูล</button>
            </div>
          </div>
        </div>
      )}

      {/* ════ MODAL เพิ่ม/แก้ไข ════ */}
      {(modal==="add"||modal==="edit") && (
        <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)closeModal()}}>
          <div className="modal">
            <div className="modal-hd">
              <div className="modal-title">{modal==="add"?"เพิ่มรายการสั่งซื้อใหม่":"แก้ไขรายการสั่งซื้อ"}</div>
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

              {/* ── ข้อมูลการสั่งซื้อ ── */}
              <div className="form-section">ข้อมูลการสั่งซื้อ</div>
              <div className="fg2">
                <div className="field fc">
                  <label className="fl">แหล่งจัดซื้อ / ร้านค้า <span className="req">*</span></label>
                  <input className={`fi${errors.supplier?" e":""}`} value={form.supplier} onChange={e=>setF("supplier",e.target.value)} placeholder="เช่น บ.วัสดุก่อสร้างไทย จำกัด"/>
                  {errors.supplier && <span className="err">{errors.supplier}</span>}
                </div>
                <div className="field">
                  <label className="fl">ราคารวม (บาท) <span className="req">*</span></label>
                  <input className={`fi${errors.total_price?" e":""}`} value={form.total_price} onChange={e=>setNumericF("total_price",e.target.value)}
                    onBeforeInput={blockNonDigitInput}
                    onPaste={blockNonDigitPaste}
                    placeholder="0" inputMode="numeric" pattern="[0-9]*"/>
                  {errors.total_price && <span className="err">{errors.total_price}</span>}
                  {!errors.total_price && calcTotal>0 && (
                    <span className="hint" style={{color:"#2d6a4f"}}>
                      ✓ ยอดจากรายการ: ฿{fmt(calcTotal)}
                      {Math.abs(toNum(form.total_price)-calcTotal)>1 && " (ต่างจากรายการ)"}
                    </span>
                  )}
                </div>
                <div className="field">
                  <label className="fl">ผู้อัปโหลด <span className="req">*</span></label>
                  <select className={`fs${errors.created_by?" e":""}`} value={form.created_by} onChange={e=>setF("created_by",e.target.value)}>
                    <option value="">-- เลือกผู้อัปโหลด --</option>
                    {staffOptions.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.created_by && <span className="err">{errors.created_by}</span>}
                </div>
              </div>

              {/* ── ไฟล์เอกสาร ── */}
              <div className="form-section">ไฟล์เอกสารการสั่งซื้อ {modal==="add"&&<span className="req">*</span>}</div>

              {modal==="add" && !form.file && !converting && (
                <>
                  <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                    style={{display:"none"}} onChange={handleFileInput}/>
                  <div
                    className={`dropzone${isDragging?" dragging":""}${errors.file?" has-err":""}`}
                    onClick={()=>fileInputRef.current?.click()}
                    onDragOver={e=>{e.preventDefault();setIsDragging(true);}}
                    onDragLeave={()=>setIsDragging(false)}
                    onDrop={handleDrop}
                  >
                    <div className="dropzone-icon">📎</div>
                    <div className="dropzone-title">ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือก</div>
                    <div className="dropzone-sub">
                      รองรับไฟล์รูปภาพและ PDF<br/>
                      ระบบจะจัดเก็บไฟล์เอกสารไว้กับรายการสั่งซื้อ
                    </div>
                    <div className="file-badges">
                      <span className="file-badge img-badge">JPG</span>
                      <span className="file-badge img-badge">PNG</span>
                      <span className="file-badge pdf-badge">PDF</span>
                      <span className="file-badge size-badge">สูงสุด {MAX_FILE_SIZE_MB} MB</span>
                    </div>
                  </div>
                  {errors.file && <span className="err" style={{marginTop:4}}>{errors.file}</span>}
                </>
              )}

              {/* Converting... */}
              {converting && (
                <div className="converting-box">
                  <div className="spinner-blue"/>
                  <span>กำลังแปลงไฟล์รูปภาพเป็น PDF...</span>
                </div>
              )}

              {/* Uploaded file preview */}
              {form.file && !converting && (
                <div className={`uploaded-file${form.file.error?" has-err":" ok"}`}>
                  <div className="uploaded-preview">
                    {form.file.preview ? <img src={form.file.preview} alt="preview"/> : "📄"}
                  </div>
                  <div className="uploaded-info">
                    <div className="uploaded-name">{form.file.name}</div>
                    <div className="uploaded-meta">{fmtSize(form.file.size)}</div>
                    {!form.file.converted && !form.file.error && form.file.type === "application/pdf" && (
                      <span className="uploaded-tag tag-ok">✓ ไฟล์ PDF พร้อมใช้</span>
                    )}
                    {!form.file.converted && !form.file.error && form.file.type !== "application/pdf" && (
                      <span className="uploaded-tag tag-converted">✓ ไฟล์รูปภาพพร้อมใช้</span>
                    )}
                    {form.file.error && <div className="uploaded-err">{form.file.error}</div>}
                  </div>
                  <button className="remove-file" onClick={()=>{setForm(f=>({...f,file:null}));setErrors(e=>{const n={...e};delete n.file;return n;});}}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              )}

              {/* แสดงไฟล์เดิม (edit) */}
              {modal==="edit" && editTarget && !form.file && (
                <div style={{background:"#f9fafb",border:"1px solid #f0f0f0",borderRadius:10,padding:"12px 16px",display:"flex",alignItems:"center",gap:12}}>
                  <div className={`file-icon ${editTarget.file_type==="PDF"?"pdf":"img"}`}>
                    {editTarget.file_type==="PDF"?"📄":"🖼️"}
                  </div>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,color:"#111110"}}>{editTarget.file_name}</div>
                    <div style={{fontSize:11,color:"#9ca3af"}}>ไฟล์เดิม · {editTarget.file_type}</div>
                  </div>
                    <a
                      href={purchaseFileSrc(editTarget.file_name)}
                      target="_blank"
                      rel="noreferrer"
                      style={{fontSize:12,color:"#111110",fontWeight:700,textDecoration:"underline",display:"inline-flex",marginTop:4}}
                    >
                      ดูไฟล์เอกสาร
                    </a>
                </div>
              )}

              {/* ── รายการวัสดุ ── */}
              <div className="form-section" style={{marginTop:20}}>รายการวัสดุ/อุปกรณ์ที่สั่งซื้อ</div>

              <div className="items-table-wrap">
                <table className="items-tbl">
                  <thead>
                    <tr>
                      <th className="col-no">#</th>
                      <th className="col-mat">วัสดุ/อุปกรณ์</th>
                      <th className="col-price">ราคา/หน่วย <span className="req">*</span></th>
                      <th className="col-qty">จำนวน <span className="req">*</span></th>
                      <th className="col-total">รวม</th>
                      <th className="col-del"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.items.map((it,i)=>{
                      const rowTotal = toNum(it.price)*toNum(it.quantity);
                      return (
                        <tr key={i}>
                          <td className="col-no">{i+1}</td>
                          <td className="col-mat">
                            <select className="fs" style={{fontSize:12,padding:"8px 10px"}}
                              value={it.material_id||""} onChange={e=>setItemF(i,"material_id",e.target.value)}>
                              <option value="">-- เลือกวัสดุ --</option>
                              {materials.map(m=><option key={m.material_id} value={m.material_id}>{m.code} · {m.name}</option>)}
                            </select>
                          </td>
                          <td className="col-price">
                            <input className={`fi${errors[`item_price_${i}`]?" e":""}`}
                              style={{fontSize:12,padding:"8px 10px",textAlign:"right"}}
                              value={it.price} placeholder="0" inputMode="numeric" pattern="[0-9]*"
                              onBeforeInput={blockNonDigitInput}
                              onPaste={blockNonDigitPaste}
                              onChange={e=>setNumericItemF(i,"price",e.target.value)}/>
                            {errors[`item_price_${i}`] && <div className="err" style={{fontSize:10,marginTop:2}}>{errors[`item_price_${i}`]}</div>}
                          </td>
                          <td className="col-qty">
                            <input className={`fi${errors[`item_qty_${i}`]?" e":""}`}
                              style={{fontSize:12,padding:"8px 10px",textAlign:"right"}}
                              value={it.quantity} placeholder="0" inputMode="numeric" pattern="[0-9]*"
                              onBeforeInput={blockNonDigitInput}
                              onPaste={blockNonDigitPaste}
                              onChange={e=>setNumericItemF(i,"quantity",e.target.value)}/>
                            {errors[`item_qty_${i}`] && <div className="err" style={{fontSize:10,marginTop:2}}>{errors[`item_qty_${i}`]}</div>}
                          </td>
                          <td className="col-total">{rowTotal>0?`฿${fmt(rowTotal)}`:"-"}</td>
                          <td className="col-del">
                            <button className="del-row-btn" onClick={()=>removeItem(i)} disabled={form.items.length<=1}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <button className="add-row" onClick={addItem}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                เพิ่มรายการ
              </button>

              {calcTotal>0 && (
                <div className="items-sum">
                  <span className="items-sum-label">ยอดรวมจากรายการ</span>
                  <span className="items-sum-val">฿{fmt(calcTotal)}</span>
                </div>
              )}
            </div>

            <div className="modal-ft">
              <button className="btn btn-ghost" onClick={closeModal}>ยกเลิก</button>
              <button className="btn btn-dark" onClick={handleSave} disabled={saving||converting}>
                {saving ? <><div className="spinner"/><span>กำลังบันทึก...</span></> : modal==="add"?"เพิ่มรายการ":"บันทึกการแก้ไข"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ MODAL ลบ ════ */}
      {modal==="delete" && deleteTarget && (
        <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)closeModal()}}>
          <div className="modal modal-sm">
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
              <p style={{fontSize:15,color:"#374151",marginBottom:8,lineHeight:1.7}}>
                ต้องการลบใบสั่งซื้อ<br/>
                <strong style={{color:"#dc2626"}}>{poRef(deleteTarget.purchase_id)}</strong> หรือไม่?
              </p>
              <div style={{display:"flex",justifyContent:"center",gap:16,fontSize:12,color:"#6b7280",marginBottom:8}}>
                <span>{deleteTarget.supplier}</span>
                <span>·</span>
                <span>฿{fmt(toNum(deleteTarget.total_price))}</span>
              </div>
              <p style={{fontSize:13,color:"#9ca3af"}}>ข้อมูลและไฟล์เอกสารจะถูกลบออกจากระบบถาวร</p>
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
