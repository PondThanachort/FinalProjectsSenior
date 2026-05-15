"use client";

import { STATUS_S, fmt, fmtDate, isPos, useBorrowsPage } from "@/components/borrows/useBorrowsPage";
import "./borrows.css";

export default function BorrowPage() {
  const {
    materials,
    projects,
    txs,
    loading,
    globalErr,
    tab,
    setTab,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    projFilter,
    setProjFilter,
    bForm,
    bErrors,
    bGlobalErr,
    rForm,
    setRForm,
    rErrors,
    rGlobalErr,
    saving,
    toast,
    deleteTarget,
    setDeleteTarget,
    filteredTxs,
    pending,
    doneCount,
    usedUpCount,
    setBF,
    setRF,
    setBorrowQtyDigitsOnly,
    setReturnQtyDigitsOnly,
    blockNonDigitInput,
    blockNonDigitPaste,
    selectedMat,
    selectedTx,
    selectedRMat,
    canReturnQty,
    pendingTxs,
    handleBorrow,
    handleReturn,
    handleUseUp,
    handleDelete,
  } = useBorrowsPage();

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
          <strong>เบิก–คืนวัสดุ/อุปกรณ์</strong>
        </div>

        {/* Header */}
        <div className="hd">
          <div>
            <div className="hd-label">คลังวัสดุ</div>
            <h1 className="hd-title">จัดการเบิก–คืนวัสดุ/อุปกรณ์</h1>
            <p className="hd-sub">เบิก คืน และติดตามรายการวัสดุ/อุปกรณ์แต่ละโครงการ</p>
          </div>
        </div>

        {globalErr && (
          <div className="alert-banner">
            <span style={{fontSize:22}}>!</span>
            <span>{globalErr}</span>
          </div>
        )}

        {/* Alert */}
        {pending > 0 && (
          <div className="alert-banner">
            <span style={{fontSize:22}}>⚠️</span>
            <span>
              มีรายการค้างคืน <span className="alert-count">{pending} รายการ</span>
              {" "}กรุณาติดตามการคืนวัสดุ หรือบันทึกใช้หมดหากวัสดุถูกใช้ในโครงการแล้ว
            </span>
          </div>
        )}

        {/* KPI */}
        <div className="kpi-row">
          <div className="kpi">
            <div className="kpi-icon">📋</div>
            <div className="kpi-lbl">รายการทั้งหมด</div>
            <div className="kpi-val">{txs.length}</div>
            <div className="kpi-sub">รายการเบิก</div>
          </div>
          <div className="kpi">
            <div className="kpi-icon">🔴</div>
            <div className="kpi-lbl">ค้างคืน</div>
            <div className="kpi-val" style={{color:"#dc2626"}}>{pending}</div>
            <div className="kpi-sub">รายการ</div>
          </div>
          <div className="kpi">
            <div className="kpi-icon">📌</div>
            <div className="kpi-lbl">ใช้หมด</div>
            <div className="kpi-val" style={{color:"#4338ca"}}>{usedUpCount}</div>
            <div className="kpi-sub">รายการ</div>
          </div>
          <div className="kpi">
            <div className="kpi-icon">✅</div>
            <div className="kpi-lbl">คืนครบแล้ว</div>
            <div className="kpi-val" style={{color:"#16a34a"}}>{doneCount}</div>
            <div className="kpi-sub">รายการ</div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="tab-bar">
          <button className={`tab-btn${tab==="list"?" active":""}`} onClick={()=>setTab("list")}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            <span className="tab-label">รายการเบิก–คืนทั้งหมด</span>
          </button>
          <button className={`tab-btn borrow${tab==="borrow"?" active":""}`} onClick={()=>setTab("borrow")}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
            <span className="tab-label">เบิกวัสดุ</span>
          </button>
          <button className={`tab-btn return${tab==="return"?" active":""}`} onClick={()=>setTab("return")}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
            <span className="tab-label">คืนวัสดุ</span>
          </button>
        </div>

        {/* ════ TAB: รายการ ════ */}
        {tab === "list" && (
          <>
            <div className="toolbar">
              <div className="search-wrap">
                <span className="search-ic">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </span>
                <input className="search-inp" placeholder="ค้นหาวัสดุ, รหัส, ผู้เบิก..." value={search} onChange={e=>setSearch(e.target.value)}/>
              </div>
              <select className="sel" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
                {["ทั้งหมด","ค้างคืน","คืนแล้ว","ใช้หมด"].map(s=><option key={s}>{s}</option>)}
              </select>
              <select className="sel" value={projFilter} onChange={e=>setProjFilter(e.target.value)}>
                <option>ทั้งหมด</option>
                {projects.map(p=><option key={p.id}>{p.name}</option>)}
              </select>
              <span style={{fontSize:12,color:"#9ca3af",whiteSpace:"nowrap"}}>พบ {filteredTxs.length} รายการ</span>
            </div>

            <div className="table-wrap">
              <div className="table-scroll">
                {loading
                  ? <div className="empty"><div className="empty-icon">...</div><div className="empty-txt">กำลังโหลดข้อมูลเบิก-คืนวัสดุ</div></div>
                  : filteredTxs.length === 0
                  ? <div className="empty"><div className="empty-icon">📋</div><div className="empty-txt">ไม่พบรายการที่ตรงกัน</div></div>
                  : (
                  <table>
                    <thead>
                      <tr>
                        <th>วันที่</th><th>วัสดุ/อุปกรณ์</th><th>โครงการ</th>
                        <th>จำนวนเบิก</th><th>คืนแล้ว</th><th>ความคืบหน้า</th>
                        <th>ผู้เบิก</th><th>ผู้คืน</th><th>สถานะ</th><th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTxs.map(t => {
                        const mat = materials.find(m=>m.id===t.materialId);
                        const proj= projects.find(p=>p.id===t.projectId);
                        const ss  = STATUS_S[t.status];
                        const unit = mat?.unit || t.unit || "";
                        const pct = t.qtyBorrow > 0 ? Math.round((t.qtyReturn/t.qtyBorrow)*100) : 0;
                        const barColor = t.status==="คืนแล้ว"?"#16a34a":t.status==="ใช้หมด"?"#4338ca":"#dc2626";
                        return (
                          <tr key={t.id}>
                            <td style={{color:"#6b7280",fontSize:12,whiteSpace:"nowrap"}}>{fmtDate(t.date)}</td>
                            <td>
                              <div className="td-name">{mat?.name || t.materialName || "-"}</div>
                              <div className="td-sub">{mat?.code || t.materialCode || t.materialId} · {unit}</div>
                            </td>
                            <td style={{fontSize:12,color:"#6b7280",maxWidth:120}}>{proj?.name || t.projectName || <span style={{color:"#d1d5db"}}>ไม่ระบุ</span>}</td>
                            <td style={{fontWeight:700,whiteSpace:"nowrap"}}>{fmt(t.qtyBorrow)} {unit}</td>
                            <td style={{whiteSpace:"nowrap",color: t.qtyReturn===t.qtyBorrow?"#16a34a":"#6b7280"}}>
                              {fmt(t.qtyReturn)} {unit}
                            </td>
                            <td style={{minWidth:80}}>
                              <div style={{fontSize:11,fontWeight:700,color:barColor}}>{pct}%</div>
                              <div className="mini-bar-wrap">
                                <div className="mini-bar-fill" style={{width:`${pct}%`,background:barColor}}/>
                              </div>
                            </td>
                            <td style={{fontSize:12,color:"#374151",whiteSpace:"nowrap"}}>{t.borrower}</td>
                            <td style={{fontSize:12,color:"#6b7280",whiteSpace:"nowrap"}}>{t.returner||<span style={{color:"#d1d5db"}}>-</span>}</td>
                            <td>
                              <span className="badge" style={{background:ss.bg,color:ss.color}}>
                                <span className="badge-dot" style={{background:ss.dot}}/>
                                {t.status}
                              </span>
                            </td>
                            <td>
                              <div className="act-cell">
                                {t.status !== "คืนแล้ว" && t.status !== "ใช้หมด" && (
                                  <>
                                    <button
                                      className="btn btn-amber btn-xs"
                                      onClick={() => {
                                        setRForm(f => ({
                                          ...f,
                                          txId: String(t.id),
                                          date: !f.date || f.date < t.date ? t.date : f.date,
                                        }));
                                        setTab("return");
                                      }}
                                    >
                                      คืน
                                    </button>
                                    <button className="btn btn-indigo btn-xs" onClick={()=>handleUseUp(t)} disabled={saving}>
                                      ใช้หมด
                                    </button>
                                  </>
                                )}
                                <button className="btn btn-ghost btn-ico btn-xs" onClick={()=>setDeleteTarget(t)}>
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
              <div className="table-ft">
                <span>แสดง {filteredTxs.length} จาก {txs.length} รายการ</span>
                <div style={{display:"flex",gap:16}}>
                  <span>ค้างคืน: <strong style={{color:"#dc2626"}}>{pending}</strong></span>
                  <span>คืนแล้ว: <strong style={{color:"#16a34a"}}>{doneCount}</strong></span>
                  <span>ใช้หมด: <strong style={{color:"#4338ca"}}>{usedUpCount}</strong></span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ════ TAB: เบิกวัสดุ ════ */}
        {tab === "borrow" && (
          <div className="form-card">
            <div className="form-card-header">
              <div className="form-card-icon" style={{background:"#eff6ff"}}>📤</div>
              <div>
                <div className="form-card-title">เบิกวัสดุ/อุปกรณ์</div>
                <div className="form-card-sub">ระบุวัสดุที่ต้องการเบิกและจำนวน ระบบจะหักจากคลังอัตโนมัติ</div>
              </div>
            </div>
            <div className="form-body">
              {bGlobalErr && (
                <div className="gerr">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{flexShrink:0}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {bGlobalErr}
                </div>
              )}

              <div className="fg2">
                {/* เลือกวัสดุ */}
                <div className="field fc">
                  <label className="fl">วัสดุ/อุปกรณ์ที่ต้องการเบิก <span className="req">*</span></label>
                  <select className={`fs${bErrors.materialId?" e":""}`} value={bForm.materialId} onChange={e=>setBF("materialId",e.target.value)}>
                    <option value="">-- เลือกวัสดุ/อุปกรณ์ --</option>
                    {materials.map(m=>(
                      <option key={m.id} value={m.id} disabled={m.qty===0}>
                        {m.code} · {m.name} (คงเหลือ {fmt(m.qty)} {m.unit}){m.qty===0?" — หมดสต็อก":""}
                      </option>
                    ))}
                  </select>
                  {bErrors.materialId && <span className="err">{bErrors.materialId}</span>}
                </div>

                {/* แสดงข้อมูลวัสดุที่เลือก */}
                {selectedMat && (
                  <div className={`info-box fc${selectedMat.qty===0?" red":selectedMat.qty<10?" amber":""}`}>
                    <div className="info-row">
                      <span>รหัส</span><strong>{selectedMat.code}</strong>
                    </div>
                    <div className="info-row">
                      <span>หน่วยนับ</span><strong>{selectedMat.unit}</strong>
                    </div>
                    <div className="info-row">
                      <span>จำนวนคงเหลือในคลัง</span>
                      <strong style={{fontSize:15}}>{fmt(selectedMat.qty)} {selectedMat.unit}</strong>
                    </div>
                    {selectedMat.qty === 0 && (
                      <div style={{marginTop:8,fontWeight:700,color:"#dc2626"}}>⚠ วัสดุนี้หมดสต็อก ไม่สามารถเบิกได้</div>
                    )}
                  </div>
                )}

                {/* จำนวน */}
                <div className="field">
                  <label className="fl">จำนวนที่ต้องการเบิก <span className="req">*</span></label>
                  <input className={`fi${bErrors.qty?" e":""}`} value={bForm.qty} onChange={e=>setBorrowQtyDigitsOnly(e.target.value)}
                    onBeforeInput={blockNonDigitInput}
                    onPaste={blockNonDigitPaste}
                    placeholder="0" inputMode="numeric" pattern="[0-9]*"
                    disabled={selectedMat?.qty===0}/>
                  {bErrors.qty && <span className="err">{bErrors.qty}</span>}
                  {!bErrors.qty && selectedMat && bForm.qty && isPos(bForm.qty) && parseFloat(bForm.qty)<=selectedMat.qty && (
                    <span className="hint">คงเหลือหลังเบิก: {fmt(selectedMat.qty - parseFloat(bForm.qty))} {selectedMat.unit}</span>
                  )}
                </div>

                {/* วันที่เบิก */}
                <div className="field">
                  <label className="fl">วันที่เบิก <span className="req">*</span></label>
                  <input
                    type="date"
                    className={`fi${bErrors.date ? " e" : ""}`}
                    value={bForm.date}
                    onChange={e=>setBF("date", e.target.value)}
                  />
                  {bErrors.date && <span className="err">{bErrors.date}</span>}
                </div>

                {/* โครงการ */}
                <div className="field">
                  <label className="fl">โครงการ <span className="req">*</span></label>
                  <select className={`fs${bErrors.projectId?" e":""}`} value={bForm.projectId} onChange={e=>setBF("projectId",e.target.value)}>
                    <option value="">-- เลือกโครงการ --</option>
                    {projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  {bErrors.projectId && <span className="err">{bErrors.projectId}</span>}
                </div>

                {/* ผู้เบิก */}
                <div className="field">
                  <label className="fl">ผู้เบิก <span className="req">*</span></label>
                  <input
                    className={`fi${bErrors.borrower?" e":""}`}
                    value={bForm.borrower}
                    onChange={e=>setBF("borrower",e.target.value)}
                    placeholder="กรอกชื่อผู้เบิก"
                    maxLength={100}
                  />
                  {bErrors.borrower && <span className="err">{bErrors.borrower}</span>}
                </div>

                {/* หมายเหตุ */}
                <div className="field">
                  <label className="fl">หมายเหตุ</label>
                  <input className="fi" value={bForm.note} onChange={e=>setBF("note",e.target.value)} placeholder="หมายเหตุ (ถ้ามี)"/>
                </div>
              </div>
            </div>
            <div className="form-ft">
              <button className="btn btn-ghost" onClick={()=>setTab("list")}>ยกเลิก</button>
              <button className="btn btn-green" onClick={handleBorrow} disabled={saving || selectedMat?.qty===0}>
                {saving ? <><div className="spinner"/><span>กำลังบันทึก...</span></> : <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                  ยืนยันการเบิก
                </>}
              </button>
            </div>
          </div>
        )}

        {/* ════ TAB: คืนวัสดุ ════ */}
        {tab === "return" && (
          <div className="form-card">
            <div className="form-card-header">
              <div className="form-card-icon" style={{background:"#fff7ed"}}>📥</div>
              <div>
                <div className="form-card-title">คืนวัสดุ/อุปกรณ์</div>
                <div className="form-card-sub">เลือกรายการเบิกที่ต้องการคืน ระบบจะเพิ่มจำนวนกลับเข้าคลัง</div>
              </div>
            </div>
            <div className="form-body">
              {rGlobalErr && (
                <div className="gerr">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{flexShrink:0}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {rGlobalErr}
                </div>
              )}

              <div className="fg2">
                {/* เลือกรายการเบิก */}
                <div className="field fc">
                  <label className="fl">รายการเบิกที่ต้องการคืน <span className="req">*</span></label>
                  <select
                    className={`fs${rErrors.txId?" e":""}`}
                    value={rForm.txId}
                    onChange={e => {
                      const tx = pendingTxs.find(item => String(item.id) === e.target.value);
                      setRF("txId", e.target.value);
                      if (tx?.date && (!rForm.date || rForm.date < tx.date)) setRF("date", tx.date);
                    }}
                  >
                    <option value="">-- เลือกรายการเบิก --</option>
                    {pendingTxs.map(t=>{
                      const mat = materials.find(m=>m.id===t.materialId);
                      const proj= projects.find(p=>p.id===t.projectId);
                      const remaining = t.qtyBorrow - t.qtyReturn;
                      return (
                        <option key={t.id} value={t.id}>
                          {fmtDate(t.date)} · {mat?.name} · คืนได้อีก {fmt(remaining)} {mat?.unit}
                          {proj?` · ${proj.name}`:""}
                        </option>
                      );
                    })}
                  </select>
                  {rErrors.txId && <span className="err">{rErrors.txId}</span>}
                </div>

                {/* แสดงรายละเอียดรายการที่เลือก */}
                {selectedTx && selectedRMat && (
                  <div className="info-box amber fc">
                    <div className="info-row"><span>วัสดุ</span><strong>{selectedRMat.name} ({selectedRMat.code})</strong></div>
                    <div className="info-row"><span>จำนวนที่เบิก</span><strong>{fmt(selectedTx.qtyBorrow)} {selectedRMat.unit}</strong></div>
                    <div className="info-row"><span>คืนแล้ว</span><strong>{fmt(selectedTx.qtyReturn)} {selectedRMat.unit}</strong></div>
                    <div className="info-row">
                      <span>ยังต้องคืนอีก</span>
                      <strong style={{color:"#dc2626",fontSize:15}}>{fmt(canReturnQty)} {selectedRMat.unit}</strong>
                    </div>
                    <div className="info-row"><span>ผู้เบิก</span><strong>{selectedTx.borrower}</strong></div>
                    <div className="info-row">
                      <span>สถานะ</span>
                      <span className="badge" style={{background:STATUS_S[selectedTx.status].bg,color:STATUS_S[selectedTx.status].color,padding:"2px 8px"}}>
                        {selectedTx.status}
                      </span>
                    </div>
                  </div>
                )}

                {/* จำนวนที่คืน */}
                <div className="field">
                  <label className="fl">จำนวนที่ต้องการคืน <span className="req">*</span></label>
                  <input className={`fi${rErrors.qty?" e":""}`} value={rForm.qty} onChange={e=>setReturnQtyDigitsOnly(e.target.value)}
                    onBeforeInput={blockNonDigitInput}
                    onPaste={blockNonDigitPaste}
                    placeholder="0" inputMode="numeric" pattern="[0-9]*"/>
                  {rErrors.qty && <span className="err">{rErrors.qty}</span>}
                  {!rErrors.qty && selectedTx && selectedRMat && rForm.qty && isPos(rForm.qty) && parseFloat(rForm.qty)<=canReturnQty && (
                    <span className="hint">
                      คืนหลังนี้: {fmt(selectedTx.qtyReturn + parseFloat(rForm.qty))} / {fmt(selectedTx.qtyBorrow)} {selectedRMat.unit}
                      {parseFloat(rForm.qty) === canReturnQty ? " ✅ ครบทั้งหมด" : ""}
                    </span>
                  )}
                  <span className="hint">กรอกจำนวนเฉพาะกรณีคืนเข้าคลัง หากวัสดุถูกใช้หมดให้กดปุ่มบันทึกใช้หมดด้านล่างโดยไม่ต้องกรอกจำนวน</span>
                </div>

                {/* วันที่คืน */}
                <div className="field">
                  <label className="fl">วันที่คืน <span className="req">*</span></label>
                  <input
                    type="date"
                    className={`fi${rErrors.date ? " e" : ""}`}
                    value={rForm.date}
                    min={selectedTx?.date || undefined}
                    onChange={e=>setRF("date", e.target.value)}
                  />
                  {rErrors.date && <span className="err">{rErrors.date}</span>}
                  <span className="hint">ใช้วันที่นี้ทั้งกรณีคืนเข้าคลังและบันทึกใช้หมด</span>
                </div>

                {/* ผู้คืน */}
                <div className="field">
                  <label className="fl">ผู้คืน <span className="req">*</span></label>
                  <input
                    className={`fi${rErrors.returner?" e":""}`}
                    value={rForm.returner}
                    onChange={e=>setRF("returner",e.target.value)}
                    placeholder="กรอกชื่อผู้คืน"
                    maxLength={100}
                  />
                  {rErrors.returner && <span className="err">{rErrors.returner}</span>}
                </div>

                {/* หมายเหตุ */}
                <div className="field fc">
                  <label className="fl">หมายเหตุ</label>
                  <input className="fi" value={rForm.note} onChange={e=>setRF("note",e.target.value)} placeholder="หมายเหตุ (ถ้ามี)"/>
                </div>
              </div>
            </div>
            <div className="form-ft">
              <button className="btn btn-ghost" onClick={()=>setTab("list")}>ยกเลิก</button>
              <div className="use-up-action">
                <button className="btn btn-indigo" onClick={()=>selectedTx && handleUseUp(selectedTx)} disabled={saving || !selectedTx}>
                  บันทึกใช้หมด
                </button>
                <span>ไม่ต้องกรอกจำนวนคืน</span>
              </div>
              <button className="btn btn-amber" onClick={handleReturn} disabled={saving}>
                {saving ? <><div className="spinner"/><span>กำลังบันทึก...</span></> : <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
                  ยืนยันการคืน
                </>}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ════ DELETE MODAL ════ */}
      {deleteTarget && (
        <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)setDeleteTarget(null)}}>
          <div className="modal">
            <div className="modal-hd">
              <div className="modal-title">ยืนยันการลบ</div>
              <button className="modal-close" onClick={()=>setDeleteTarget(null)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="del-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              </div>
              <p style={{fontSize:15,color:"#374151",marginBottom:8,lineHeight:1.7}}>
                ต้องการลบรายการเบิก<br/>
                <strong style={{color:"#dc2626"}}>&quot;{materials.find(m=>m.id===deleteTarget.materialId)?.name || deleteTarget.materialName || deleteTarget.materialId}&quot;</strong> หรือไม่?
              </p>
              <p style={{fontSize:13,color:"#9ca3af"}}>ข้อมูลจะถูกลบออกจากระบบถาวร</p>
            </div>
            <div className="modal-ft">
              <button className="btn btn-ghost" onClick={()=>setDeleteTarget(null)}>ยกเลิก</button>
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
