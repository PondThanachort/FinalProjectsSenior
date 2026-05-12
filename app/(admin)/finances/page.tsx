"use client";

import { fmt, fmtDate, isPos, poRef, toNum, useFinancesPage } from "@/components/finances/useFinancesPage";
import "./finances.css";

export default function FinancePage() {
  const {
    txs,
    projects,
    purchases,
    loadingData,
    loadErr,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    projFilter,
    setProjFilter,
    monthFilter,
    setMonthFilter,
    modal,
    editTarget,
    deleteTarget,
    form,
    errors,
    globalErr,
    saving,
    toast,
    projectName,
    months,
    filtered,
    totalIncome,
    totalExpense,
    netProfit,
    openAdd,
    openEdit,
    openDelete,
    closeModal,
    setF,
    setAmountDigitsOnly,
    blockNonDigitInput,
    blockNonDigitPaste,
    handleSave,
    handleDelete,
  } = useFinancesPage();

  return (
    <>
      {toast && (
        <div className="toast">
          <div className="toast-dot">✓</div>
          {toast}
        </div>
      )}

      <div className="page">
        <div className="bc">
          <a href="/projects">หน้าหลัก</a><span>/</span>
          <strong>รายรับ–รายจ่าย</strong>
        </div>

        <div className="hd">
          <div>
            <div className="hd-label">การเงิน</div>
            <h1 className="hd-title">จัดการรายรับ–รายจ่าย</h1>
            <p className="hd-sub">บันทึก แก้ไข และติดตามรายการรายรับ–รายจ่ายของแต่ละโครงการ</p>
          </div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <button className="btn btn-income btn-sm" onClick={()=>openAdd("income")}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              เพิ่มรายรับ
            </button>
            <button className="btn btn-expense btn-sm" onClick={()=>openAdd("expense")}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              เพิ่มรายจ่าย
            </button>
          </div>
        </div>

        <div className="kpi-row">
          <div className="kpi kpi-income">
            <div className="kpi-icon">💵</div>
            <div className="kpi-lbl">รายรับรวม</div>
            <div className="kpi-val">฿{fmt(totalIncome)}</div>
            <div className="kpi-sub">{filtered.filter(t=>t.kind==="income").length} รายการ</div>
          </div>
          <div className="kpi kpi-expense">
            <div className="kpi-icon" style={{opacity:.08,position:"absolute",top:16,right:16,fontSize:28}}>💸</div>
            <div className="kpi-lbl">รายจ่ายรวม</div>
            <div className="kpi-val">฿{fmt(totalExpense)}</div>
            <div className="kpi-sub">{filtered.filter(t=>t.kind==="expense").length} รายการ</div>
          </div>
          <div className="kpi kpi-profit">
            <div className="kpi-icon">📈</div>
            <div className="kpi-lbl">กำไรสุทธิ</div>
            <div className="kpi-val">฿{fmt(netProfit)}</div>
            <div className="kpi-sub">Margin {totalIncome>0?Math.round(netProfit/totalIncome*100):0}%</div>
          </div>
        </div>

        <div className="toolbar">
          <div className="search-wrap">
            <span className="search-ic">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input className="search-inp" placeholder="ค้นหารายการ, หมวดหมู่, โครงการ, เลข PO..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <div className="type-tabs">
            {[["ทั้งหมด","all"],["รายรับ","income"],["รายจ่าย","expense"]].map(([label,cls])=>(
              <button key={label} className={`type-tab ${cls}${typeFilter===label?" active":""}`} onClick={()=>setTypeFilter(label)}>{label}</button>
            ))}
          </div>
          <select className="sel" value={projFilter} onChange={e=>setProjFilter(e.target.value)}>
            <option>ทั้งหมด</option>
            {projects.map(p=><option key={p.id}>{p.name}</option>)}
          </select>
          <select className="sel" value={monthFilter} onChange={e=>setMonthFilter(e.target.value)}>
            {months.map(m=><option key={m}>{m}</option>)}
          </select>
          <span style={{fontSize:12,color:"#9ca3af",whiteSpace:"nowrap"}}>พบ {filtered.length} รายการ</span>
        </div>

        <div className="table-wrap">
          <div className="table-scroll">
            {loadingData
              ? <div className="empty"><div className="empty-icon">💼</div><div className="empty-txt">กำลังโหลดข้อมูล...</div></div>
              : loadErr
                ? <div className="empty"><div className="empty-icon">⚠</div><div className="empty-txt">{loadErr}</div></div>
                : filtered.length === 0
                  ? <div className="empty"><div className="empty-icon">💼</div><div className="empty-txt">ไม่พบรายการที่ตรงกัน</div></div>
                  : (
              <table>
                <thead>
                  <tr>
                    <th>วันที่</th><th>ประเภท</th><th>หมวดหมู่</th><th>รายละเอียด</th>
                    <th>โครงการ</th><th>อ้างอิง PO</th>
                    <th style={{textAlign:"right"}}>จำนวนเงิน</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(t => {
                    const pName = projectName(t.projectId, t.projectName);
                    return (
                      <tr key={t.id}>
                        <td style={{color:"#6b7280",fontSize:12,whiteSpace:"nowrap"}}>{fmtDate(t.date)}</td>
                        <td>
                          <span className={`badge badge-${t.kind}`}>
                            {t.kind==="income"?"▲ รายรับ":"▼ รายจ่าย"}
                          </span>
                        </td>
                        <td style={{fontSize:12,color:"#374151",whiteSpace:"nowrap"}}>{t.type}</td>
                        <td><div className="td-name">{t.detail}</div></td>
                        <td style={{fontSize:12,color:"#6b7280",maxWidth:120}}>{pName || <span style={{color:"#d1d5db"}}>ไม่ระบุ</span>}</td>
                        <td>{t.purchaseId?<span className="ref-code">{poRef(t.purchaseId)}</span>:<span style={{color:"#d1d5db",fontSize:12}}>-</span>}</td>
                        <td style={{textAlign:"right"}}>
                          <span className={t.kind==="income"?"amt-income":"amt-expense"}>
                            {t.kind==="income"?"+":"-"}฿{fmt(toNum(t.amount))}
                          </span>
                        </td>
                        <td>
                          <div className="act-cell">
                            <button className="btn btn-outline btn-xs" onClick={()=>openEdit(t)}>แก้ไข</button>
                            <button className="btn btn-ghost btn-ico btn-xs" onClick={()=>openDelete(t)}>
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
            <span>แสดง {filtered.length} จาก {txs.length} รายการ</span>
            <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
              <span>รายรับ: <strong style={{color:"#16a34a"}}>฿{fmt(totalIncome)}</strong></span>
              <span>รายจ่าย: <strong style={{color:"#dc2626"}}>฿{fmt(totalExpense)}</strong></span>
              <span>กำไร: <strong style={{color:netProfit>=0?"#16a34a":"#dc2626"}}>฿{fmt(netProfit)}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {(modal === "add" || modal === "edit") && (
        <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)closeModal()}}>
          <div className="modal">
            <div className="modal-hd">
              <div className="modal-title">{modal==="add"?"เพิ่มรายการใหม่":"แก้ไขรายการ"}</div>
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

              <div className="type-toggle">
                <button
                  className={`type-toggle-btn income${form.kind==="income"?" active":""}`}
                  onClick={()=>setF("kind","income")}
                  disabled={Boolean(editTarget?.purchaseId)}
                  title={editTarget?.purchaseId ? "รายการที่อ้างอิง PO ต้องเป็นรายจ่าย" : undefined}
                >
                  <div className="type-toggle-icon">💚</div>
                  <div className="type-toggle-lbl">รายรับ</div>
                </button>
                <button className={`type-toggle-btn expense${form.kind==="expense"?" active":""}`} onClick={()=>setF("kind","expense")}>
                  <div className="type-toggle-icon">🔴</div>
                  <div className="type-toggle-lbl">รายจ่าย</div>
                </button>
              </div>
              {editTarget?.purchaseId && (
                <div className="hint" style={{marginTop:-10,marginBottom:12,color:"#dc2626",fontWeight:600}}>
                  รายการนี้อ้างอิง PO {poRef(editTarget.purchaseId)} จึงต้องบันทึกเป็นรายจ่าย
                </div>
              )}

              <div className="fg2">
                <div className="field">
                  <label className="fl">วันที่ทำรายการ <span className="req">*</span></label>
                  <input type="date" className={`fi${errors.date?" e":""}`} value={form.date} onChange={e=>setF("date",e.target.value)}/>
                  {errors.date && <span className="err">{errors.date}</span>}
                </div>

                <div className="field">
                  <label className="fl">หมวดหมู่ <span className="req">*</span></label>
                  <input
                    className={`fi${errors.type?" e":""}`}
                    value={form.type}
                    onChange={e=>setF("type",e.target.value)}
                    placeholder={form.kind==="income" ? "เช่น ค่างวดงาน, ค่าออกแบบ" : "เช่น ค่าวัสดุก่อสร้าง, ค่าแรงงาน"}
                  />
                  {errors.type && <span className="err">{errors.type}</span>}
                </div>

                <div className="field fc">
                  <label className="fl">รายละเอียด <span className="req">*</span></label>
                  <input className={`fi${errors.detail?" e":""}`} value={form.detail} onChange={e=>setF("detail",e.target.value)} placeholder="อธิบายรายการ..."/>
                  {errors.detail && <span className="err">{errors.detail}</span>}
                </div>

                <div className="field">
                  <label className="fl">จำนวนเงิน (บาท) <span className="req">*</span></label>
                  <input
                    className={`fi${errors.amount?" e":""}`}
                    value={form.amount}
                    onChange={e=>setAmountDigitsOnly(e.target.value)}
                    onBeforeInput={blockNonDigitInput}
                    onPaste={blockNonDigitPaste}
                    placeholder="0"
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                  {errors.amount && <span className="err">{errors.amount}</span>}
                  {!errors.amount && form.amount && isPos(form.amount) && (
                    <div className="amount-preview">
                      <span style={{fontSize:12,color:"#6b7280"}}>{form.kind==="income"?"รายรับ":"รายจ่าย"}</span>
                      <span style={{color:form.kind==="income"?"#16a34a":"#dc2626"}}>
                        {form.kind==="income"?"+":"-"}฿{fmt(toNum(form.amount))}
                      </span>
                    </div>
                  )}
                </div>

                <div className="field">
                  <label className="fl">โครงการ <span className="req">*</span></label>
                  <select className={`fs${errors.projectId?" e":""}`} value={form.projectId||""} onChange={e=>setF("projectId",e.target.value?parseInt(e.target.value):null)}>
                    <option value="">-- เลือกโครงการ --</option>
                    {projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  {errors.projectId && <span className="err">{errors.projectId}</span>}
                </div>

                {form.kind === "expense" && (
                  <div className="field fc">
                    <label className="fl">อ้างอิงใบสั่งซื้อ (PO)</label>
                    <select className="fs" value={form.purchaseId||""} onChange={e=>setF("purchaseId",e.target.value?parseInt(e.target.value):null)}>
                      <option value="">-- ไม่อ้างอิง PO --</option>
                      {purchases.map(p=>(
                        <option key={p.purchase_id} value={p.purchase_id}>
                          {poRef(p.purchase_id)} - {p.supplier} (฿{fmt(toNum(p.total_price))})
                        </option>
                      ))}
                    </select>
                    <span className="hint">ระบบจะจัดเก็บเป็น purchase_id ของรายการสั่งซื้อ</span>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-ft">
              <button className="btn btn-ghost" onClick={closeModal}>ยกเลิก</button>
              <button className={`btn btn-${form.kind==="income"?"income":"expense"}`} onClick={handleSave} disabled={saving}>
                {saving
                  ? <><div className="spinner"/><span>กำลังบันทึก...</span></>
                  : modal==="add" ? "เพิ่มรายการ" : "บันทึกการแก้ไข"
                }
              </button>
            </div>
          </div>
        </div>
      )}

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
              {globalErr && <div className="gerr" style={{textAlign:"left"}}>{globalErr}</div>}
              <div className="del-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              </div>
              <p style={{fontSize:15,color:"#374151",marginBottom:10,lineHeight:1.7}}>
                ต้องการลบรายการ<br/>
                <strong style={{color:"#dc2626"}}>&quot;{deleteTarget.detail}&quot;</strong> หรือไม่?
              </p>
              <div style={{display:"inline-flex",gap:16,background:"#f9fafb",borderRadius:10,padding:"10px 20px",fontSize:12,color:"#6b7280"}}>
                <span className={`badge badge-${deleteTarget.kind}`}>{deleteTarget.kind==="income"?"▲ รายรับ":"▼ รายจ่าย"}</span>
                <strong style={{color:deleteTarget.kind==="income"?"#16a34a":"#dc2626",fontSize:14}}>
                  {deleteTarget.kind==="income"?"+":"-"}฿{fmt(toNum(deleteTarget.amount))}
                </strong>
              </div>
              <p style={{fontSize:13,color:"#9ca3af",marginTop:10}}>ข้อมูลจะถูกลบออกจากระบบถาวร</p>
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
