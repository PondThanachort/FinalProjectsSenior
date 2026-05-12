"use client";

import { MAT_TYPES, MAT_UNITS, STOCK_STYLE, TYPE_COLOR, fmt, stockStatus, useMaterialsPage } from "@/components/materials/useMaterialsPage";
import "./materials.css";

export default function MaterialsPage() {
  const {
    items,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    stockFilter,
    setStockFilter,
    view,
    setView,
    modal,
    deleteTarget,
    form,
    errors,
    globalErr,
    loading,
    saving,
    toast,
    filtered,
    outStock,
    inStock,
    totalQuantity,
    types,
    stocks,
    openAdd,
    openEdit,
    openDelete,
    closeModal,
    setF,
    setQuantityDigitsOnly,
    handleSave,
    handleDelete,
  } = useMaterialsPage();

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
          <strong>จัดการวัสดุและอุปกรณ์</strong>
        </div>

        <div className="hd">
          <div>
            <div className="hd-label">คลังวัสดุ</div>
            <h1 className="hd-title">จัดการวัสดุและอุปกรณ์</h1>
            <p className="hd-sub">แสดง เพิ่ม แก้ไข และจัดการจำนวนคงเหลือของวัสดุ/อุปกรณ์ทั้งหมดในคลัง</p>
          </div>
          <button className="btn btn-dark" onClick={openAdd}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            เพิ่มวัสดุ/อุปกรณ์
          </button>
        </div>

        {(globalErr && modal === "none") && (
          <div className="alert-banner">
            <span style={{fontSize:22}}>!</span>
            <div>{globalErr}</div>
          </div>
        )}

        {outStock > 0 && (
          <div className="alert-banner">
            <span style={{fontSize:22}}>⚠️</span>
            <div>
              วัสดุหมดสต็อก <span className="alert-count">{outStock} รายการ</span> กรุณาตรวจสอบหรือสั่งซื้อเพิ่มเติม
            </div>
          </div>
        )}

        <div className="kpi-row">
          <div className="kpi">
            <div className="kpi-icon">📦</div>
            <div className="kpi-lbl">วัสดุทั้งหมด</div>
            <div className="kpi-val">{items.length}</div>
            <div className="kpi-sub">รายการ</div>
          </div>
          <div className="kpi">
            <div className="kpi-icon">✅</div>
            <div className="kpi-lbl">มีคงเหลือ</div>
            <div className="kpi-val" style={{color:"#16a34a"}}>{inStock}</div>
            <div className="kpi-sub">รายการ</div>
          </div>
          <div className="kpi">
            <div className="kpi-icon">⚠️</div>
            <div className="kpi-lbl">หมดสต็อก</div>
            <div className="kpi-val" style={{color:"#dc2626"}}>{outStock}</div>
            <div className="kpi-sub">รายการ</div>
          </div>
          <div className="kpi">
            <div className="kpi-icon">∑</div>
            <div className="kpi-lbl">จำนวนคงเหลือรวม</div>
            <div className="kpi-val" style={{fontSize:18}}>{fmt(totalQuantity)}</div>
            <div className="kpi-sub">หน่วยนับรวม</div>
          </div>
        </div>

        <div className="toolbar">
          <div className="search-wrap">
            <span className="search-ic">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </span>
            <input className="search-inp" placeholder="ค้นหาชื่อ, รหัส, ประเภท..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <select className="sel" value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}>
            {types.map(type => <option key={type}>{type}</option>)}
          </select>
          <select className="sel" value={stockFilter} onChange={e=>setStockFilter(e.target.value)}>
            {stocks.map(stock => <option key={stock}>{stock}</option>)}
          </select>
          <div className="view-toggle">
            <button className={`view-btn${view==="grid" ? " on" : ""}`} onClick={()=>setView("grid")} title="Grid" aria-label="แสดงแบบการ์ด">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
              </svg>
            </button>
            <button className={`view-btn${view==="table" ? " on" : ""}`} onClick={()=>setView("table")} title="Table" aria-label="แสดงแบบตาราง">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"/>
                <line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="empty">
            <div className="empty-icon">...</div>
            <div className="empty-txt">กำลังโหลดข้อมูลวัสดุ</div>
          </div>
        ) : view === "table" ? (
          <div className="table-wrap">
            <div className="table-scroll">
              {filtered.length === 0 ? (
                <div className="empty"><div className="empty-icon">🔍</div><div className="empty-txt">ไม่พบรายการที่ตรงกัน</div></div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>รหัส</th>
                      <th>ชื่อวัสดุ/อุปกรณ์</th>
                      <th>ประเภท</th>
                      <th>หน่วยนับ</th>
                      <th>จำนวนคงเหลือ</th>
                      <th>สถานะ</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item) => {
                      const status = stockStatus(item.quantity);
                      const stockStyle = STOCK_STYLE[status];
                      const typeStyle = TYPE_COLOR[item.type] || TYPE_COLOR["อื่นๆ"];
                      return (
                        <tr key={item.id}>
                          <td><span className="td-code">{item.code}</span></td>
                          <td><div className="td-name">{item.name}</div></td>
                          <td><span className="badge" style={{background:typeStyle.bg,color:typeStyle.color}}>{item.type}</span></td>
                          <td style={{color:"#6b7280"}}>{item.unit}</td>
                          <td>
                            <span className={`qty-cell${status==="หมด" ? " qty-out" : ""}`}>
                              {fmt(item.quantity)}
                            </span>
                          </td>
                          <td>
                            <span className="badge" style={{background:stockStyle.bg,color:stockStyle.color}}>
                              <span className="stock-dot" style={{background:stockStyle.dot}}/>
                              {status}
                            </span>
                          </td>
                          <td>
                            <div className="act-cell">
                              <button className="btn btn-outline btn-xs" onClick={()=>openEdit(item)}>แก้ไข</button>
                              <button className="btn btn-ghost btn-ico btn-xs" onClick={()=>openDelete(item)}>
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
              <span>แสดง {filtered.length} จาก {items.length} รายการ</span>
              <span>จำนวนคงเหลือรวม: <strong style={{color:"#111110"}}>{fmt(filtered.reduce((sum,item)=>sum+item.quantity,0))}</strong></span>
            </div>
          </div>
        ) : (
          filtered.length === 0 ? (
            <div className="empty"><div className="empty-icon">🔍</div><div className="empty-txt">ไม่พบรายการที่ตรงกัน</div></div>
          ) : (
            <div className="mat-grid">
              {filtered.map((item) => {
                const status = stockStatus(item.quantity);
                const stockStyle = STOCK_STYLE[status];
                const typeStyle = TYPE_COLOR[item.type] || TYPE_COLOR["อื่นๆ"];
                const barColor = status === "หมด" ? "#dc2626" : "#16a34a";
                const pct = item.quantity <= 0 ? 0 : 100;
                return (
                  <div key={item.id} className="mat-card">
                    <div className="mat-card-top">
                      <span className="mat-card-code">{item.code}</span>
                      <span className="badge" style={{background:stockStyle.bg,color:stockStyle.color}}>
                        <span className="stock-dot" style={{background:stockStyle.dot}}/>{status}
                      </span>
                    </div>
                    <div className="mat-card-name">{item.name}</div>
                    <div className="mat-card-type">
                      <span className="badge" style={{background:typeStyle.bg,color:typeStyle.color}}>{item.type}</span>
                    </div>
                    <div className="mat-card-stats">
                      <div className="mat-stat">
                        <div className="mat-stat-lbl">คงเหลือ</div>
                        <div className={`mat-stat-val${status==="หมด" ? " out" : ""}`}>
                          {fmt(item.quantity)} <span style={{fontSize:11,fontWeight:400,color:"#9ca3af"}}>{item.unit}</span>
                        </div>
                        <div className="stock-bar-wrap">
                          <div className="stock-bar-fill" style={{width:`${pct}%`,background:barColor}}/>
                        </div>
                      </div>
                    </div>
                    <div className="mat-card-actions">
                      <button className="btn btn-outline btn-sm" style={{flex:1}} onClick={()=>openEdit(item)}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        แก้ไข
                      </button>
                      <button className="btn btn-ghost btn-sm btn-ico" onClick={()=>openDelete(item)}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      {(modal === "add" || modal === "edit") && (
        <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)closeModal();}}>
          <div className="modal">
            <div className="modal-hd">
              <div className="modal-title">{modal==="add" ? "เพิ่มวัสดุ/อุปกรณ์ใหม่" : "แก้ไขวัสดุ/อุปกรณ์"}</div>
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

              <div className="fg2" style={{marginBottom:14}}>
                <div className="field">
                  <label className="fl">รหัสวัสดุ</label>
                  <input
                    className={`fi${errors.code?" e":""}`}
                    value={form.code}
                    onChange={e=>setF("code", e.target.value)}
                    placeholder="เช่น M0001"
                    disabled={modal === "edit"}
                    maxLength={5}
                  />
                  {errors.code && <span className="err">{errors.code}</span>}
                  {!errors.code && <span className="hint">{modal === "add" ? "เว้นว่างได้ ระบบจะสร้างรหัสให้" : "รหัสวัสดุไม่สามารถแก้ไขได้"}</span>}
                </div>

                <div className="field">
                  <label className="fl">ชื่อวัสดุ/อุปกรณ์ <span className="req">*</span></label>
                  <input className={`fi${errors.name?" e":""}`} value={form.name} onChange={e=>setF("name",e.target.value)} placeholder="เช่น ปูนซีเมนต์ TPI 50kg"/>
                  {errors.name && <span className="err">{errors.name}</span>}
                </div>

                <div className="field">
                  <label className="fl">ประเภท <span className="req">*</span></label>
                  <select className={`fs${errors.type?" e":""}`} value={form.type} onChange={e=>setF("type",e.target.value)}>
                    {MAT_TYPES.map(type=><option key={type}>{type}</option>)}
                  </select>
                  {errors.type && <span className="err">{errors.type}</span>}
                </div>

                <div className="field">
                  <label className="fl">หน่วยนับ <span className="req">*</span></label>
                  <select className={`fs${errors.unit?" e":""}`} value={form.unit} onChange={e=>setF("unit",e.target.value)}>
                    {MAT_UNITS.map(unit=><option key={unit}>{unit}</option>)}
                  </select>
                  {errors.unit && <span className="err">{errors.unit}</span>}
                </div>
              </div>

              <div className="field">
                <label className="fl">จำนวนคงเหลือ <span className="req">*</span></label>
                <input
                  className={`fi${errors.quantity?" e":""}`}
                  value={form.quantity}
                  onChange={e=>setQuantityDigitsOnly(e.target.value)}
                  onBeforeInput={e=>{
                    const input = e.nativeEvent as InputEvent;
                    if (input.data && /\D/.test(input.data)) e.preventDefault();
                  }}
                  onPaste={e=>{
                    if (/\D/.test(e.clipboardData.getData("text"))) e.preventDefault();
                  }}
                  placeholder="0"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
                {errors.quantity && <span className="err">{errors.quantity}</span>}
                {!errors.quantity && <span className="hint">ค่าเริ่มต้นคือ 0 และใช้เป็นจำนวนคงเหลือในคลัง</span>}
              </div>
            </div>

            <div className="modal-ft">
              <button className="btn btn-ghost" onClick={closeModal}>ยกเลิก</button>
              <button className="btn btn-dark" onClick={handleSave} disabled={saving}>
                {saving ? <><div className="spinner"/><span>กำลังบันทึก...</span></> : modal==="add" ? "เพิ่มวัสดุ/อุปกรณ์" : "บันทึกการแก้ไข"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modal === "delete" && deleteTarget && (
        <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)closeModal();}}>
          <div className="modal modal-delete">
            <div className="modal-hd">
              <div className="modal-title">ยืนยันการลบ</div>
              <button className="modal-close" onClick={closeModal}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="modal-body" style={{textAlign:"center",padding:"32px 24px"}}>
              <div className="del-icon-wrap">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </div>
              <p style={{fontSize:15,color:"#374151",marginBottom:8,lineHeight:1.7}}>
                ต้องการลบวัสดุ<br/>
                <strong style={{color:"#dc2626"}}>&quot;{deleteTarget.name}&quot;</strong> หรือไม่?
              </p>
              <div style={{display:"inline-flex",gap:16,background:"#f9fafb",borderRadius:10,padding:"10px 20px",fontSize:12,color:"#6b7280",marginBottom:8}}>
                <span>รหัส: <strong style={{color:"#374151"}}>{deleteTarget.code}</strong></span>
                <span>คงเหลือ: <strong style={{color:"#374151"}}>{fmt(deleteTarget.quantity)} {deleteTarget.unit}</strong></span>
              </div>
              <p style={{fontSize:13,color:"#9ca3af"}}>ข้อมูลจะถูกลบออกจากระบบและไม่สามารถกู้คืนได้</p>
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
