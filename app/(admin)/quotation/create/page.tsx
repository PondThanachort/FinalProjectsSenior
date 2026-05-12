"use client";

import { UNITS, fmtNum, normalizeDecimalInput, normalizeDigits, toNum, useQuotationCreatePage } from "@/components/quotation/useQuotationCreatePage";
import "./create.css";

export default function QuotationCreatePage() {
  const {
    form,
    errors,
    globalError,
    processing,
    itemsSubtotal,
    laborCost,
    subtotal,
    afterDisc,
    vat,
    total,
    setField,
    setItemField,
    addItem,
    removeItem,
    handleNext,
  } = useQuotationCreatePage();

  return (
    <>
      <div className="page">
        {/* Breadcrumb */}
        <div className="bc">
          <a href="/projects">หน้าหลัก</a><span>/</span>
          <a href="/quotation">ใบเสนอราคา</a><span>/</span>
          <strong>ทำใบเสนอราคา</strong>
        </div>

        {/* Steps */}
        <div className="steps">
          <div className="step">
            <div className="step-circle active">1</div>
            <div className="step-label active">กรอกข้อมูล</div>
          </div>
          <div className="step-line"/>
          <div className="step">
            <div className="step-circle todo">2</div>
            <div className="step-label todo">แสดงตัวอย่าง</div>
          </div>
          <div className="step-line"/>
          <div className="step">
            <div className="step-circle todo">3</div>
            <div className="step-label todo">ดาวน์โหลด</div>
          </div>
        </div>

        {/* Header */}
        <div className="hd">
          <div className="hd-label">ทำใบเสนอราคา</div>
          <h1 className="hd-title">กรอกข้อมูลใบเสนอราคา</h1>
          <p className="hd-sub">กรอกข้อมูลให้ครบถ้วน แล้วกด &quot;ถัดไป&quot; เพื่อดูตัวอย่างก่อนดาวน์โหลด</p>
        </div>

        {/* Global error */}
        {globalError && (
          <div className="global-err">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{flexShrink:0}}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {globalError}
          </div>
        )}

        {/* ── บริษัท ── */}
        <div className="card">
          <div className="card-title">
            <div className="card-title-icon">🏢</div>
            ข้อมูลบริษัท (ผู้ออกใบเสนอราคา)
          </div>
          <div className="fg2">
            <div className="field fc">
              <label className="fl">ชื่อบริษัท</label>
              <input className="fi" value={form.companyName} onChange={e=>setField("companyName",e.target.value)} placeholder="ชื่อบริษัท"/>
            </div>
            <div className="field fc">
              <label className="fl">ที่อยู่บริษัท</label>
              <input className="fi" value={form.companyAddress} onChange={e=>setField("companyAddress",e.target.value)} placeholder="ที่อยู่บริษัท"/>
            </div>
            <div className="field">
              <label className="fl">เบอร์โทร</label>
              <input
                className={`fi${errors.companyPhone?" e":""}`}
                type="tel"
                inputMode="numeric"
                pattern="[0-9]{10}"
                maxLength={10}
                value={form.companyPhone}
                onChange={e=>setField("companyPhone", normalizeDigits(e.target.value, 10))}
                placeholder="0xxxxxxxxx"
              />
              {errors.companyPhone && <span className="err">{errors.companyPhone}</span>}
            </div>
            <div className="field">
              <label className="fl">อีเมล</label>
              <input
                className={`fi${errors.companyEmail?" e":""}`}
                type="email"
                inputMode="email"
                value={form.companyEmail}
                onChange={e=>setField("companyEmail",e.target.value)}
                placeholder="email@company.com"
              />
              {errors.companyEmail && <span className="err">{errors.companyEmail}</span>}
            </div>
          </div>
        </div>

        {/* ── ลูกค้า ── */}
        <div className="card">
          <div className="card-title">
            <div className="card-title-icon">👤</div>
            ข้อมูลลูกค้า <span className="req" style={{fontSize:13}}>*</span>
          </div>
          <div className="fg2">
            <div className="field fc">
              <label className="fl">ชื่อลูกค้า / บริษัท <span className="req">*</span></label>
              <input className={`fi${errors.clientName?" e":""}`} value={form.clientName} onChange={e=>setField("clientName",e.target.value)} placeholder="เช่น บริษัท ABC จำกัด หรือ คุณสมชาย ใจดี"/>
              {errors.clientName && <span className="err">{errors.clientName}</span>}
            </div>
            <div className="field fc">
              <label className="fl">ที่อยู่ลูกค้า <span className="req">*</span></label>
              <input className={`fi${errors.clientAddress?" e":""}`} value={form.clientAddress} onChange={e=>setField("clientAddress",e.target.value)} placeholder="ที่อยู่สำหรับออกใบเสนอราคา"/>
              {errors.clientAddress && <span className="err">{errors.clientAddress}</span>}
            </div>
            <div className="field fc">
              <label className="fl">เลขประจำตัวผู้เสียภาษี</label>
              <input
                className="fi"
                value={form.clientTaxId}
                onChange={e=>setField("clientTaxId", normalizeDigits(e.target.value, 13))}
                placeholder="เลขประจำตัวผู้เสียภาษี 13 หลัก"
                inputMode="numeric"
                maxLength={13}
              />
            </div>
            {/* <div className="field">
              <label className="fl">เบอร์โทร</label>
              <input
                className={`fi${errors.clientPhone?" e":""}`}
                type="tel"
                inputMode="numeric"
                pattern="[0-9]{10}"
                maxLength={10}
                value={form.clientPhone}
                onChange={e=>setField("clientPhone", normalizeDigits(e.target.value, 10))}
                placeholder="0xxxxxxxxx"
              />
              {errors.clientPhone && <span className="err">{errors.clientPhone}</span>}
            </div>
            <div className="field">
              <label className="fl">อีเมล</label>
              <input
                className={`fi${errors.clientEmail?" e":""}`}
                type="email"
                inputMode="email"
                value={form.clientEmail}
                onChange={e=>setField("clientEmail",e.target.value)}
                placeholder="client@email.com"
              />
              {errors.clientEmail && <span className="err">{errors.clientEmail}</span>}
            </div> */}
          </div>
        </div>

        {/* ── ข้อมูลใบ ── */}
        <div className="card">
          <div className="card-title">
            <div className="card-title-icon">📄</div>
            ข้อมูลใบเสนอราคา
          </div>
          <div className="fg3">
            <div className="field">
              <label className="fl">เลขที่ใบเสนอราคา</label>
              <input className="fi" value={form.quotationNo} onChange={e=>setField("quotationNo",e.target.value)}/>
            </div>
            <div className="field">
              <label className="fl">วันที่ออกใบ <span className="req">*</span></label>
              <input type="date" className={`fi${errors.quotationDate?" e":""}`} value={form.quotationDate} onChange={e=>setField("quotationDate",e.target.value)}/>
              {errors.quotationDate && <span className="err">{errors.quotationDate}</span>}
            </div>
            <div className="field">
              <label className="fl">ใช้ได้ถึงวันที่ <span className="req">*</span></label>
              <input type="date" className={`fi${errors.validUntil?" e":""}`} value={form.validUntil} onChange={e=>setField("validUntil",e.target.value)}/>
              {errors.validUntil && <span className="err">{errors.validUntil}</span>}
            </div>
            <div className="field fc">
              <label className="fl">ชื่อโครงการ / งาน <span className="req">*</span></label>
              <input className={`fi${errors.projectName?" e":""}`} value={form.projectName} onChange={e=>setField("projectName",e.target.value)} placeholder="เช่น งานปรับปรุงตกแต่งภายใน สำนักงาน KWI สาทร"/>
              {errors.projectName && <span className="err">{errors.projectName}</span>}
            </div>
            <div className="field fc">
              <label className="fl">ATTN</label>
              <input
                className="fi"
                value={form.attn}
                onChange={e=>setField("attn", e.target.value)}
                placeholder="ชื่อผู้ติดต่อ เช่น Mr. TOSSAPORN"
              />
            </div>
          </div>
        </div>

        {/* ── รายการ ── */}
        <div className="card">
          <div className="card-title">
            <div className="card-title-icon">📝</div>
            รายการงาน / วัสดุอุปกรณ์ <span className="req" style={{fontSize:13}}>*</span>
          </div>

          {errors.items && (
            <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:"#fef2f2",border:"1px solid #fecaca",borderRadius:10,fontSize:13,color:"#dc2626",marginBottom:14,fontWeight:500}}>
              ⚠ {errors.items}
            </div>
          )}

          <div className="items-wrap">
            <table className="items-table">
              <thead>
                <tr>
                  <th className="col-no">#</th>
                  <th className="col-desc">รายละเอียด <span className="req">*</span></th>
                  <th className="col-unit">หน่วย</th>
                  <th className="col-qty">จำนวน <span className="req">*</span></th>
                  <th className="col-price">ราคา/หน่วย <span className="req">*</span></th>
                  <th className="col-total">รวม</th>
                  <th className="col-del"></th>
                </tr>
              </thead>
              <tbody>
                {form.items.map((it, idx) => {
                  const rowTotal = toNum(it.qty) * toNum(it.price);
                  return (
                    <tr key={it.id}>
                      <td className="col-no">{idx + 1}</td>
                      <td className="col-desc">
                        <input
                          className="fi"
                          style={{fontSize:12,padding:"8px 10px"}}
                          value={it.desc}
                          placeholder="รายละเอียดงาน/วัสดุ"
                          onChange={e => setItemField(idx, "desc", e.target.value)}
                        />
                      </td>
                      <td className="col-unit">
                        <select
                          className="fs"
                          style={{fontSize:12,padding:"8px 8px"}}
                          value={it.unit}
                          onChange={e => setItemField(idx, "unit", e.target.value)}
                        >
                          {UNITS.map(u => <option key={u}>{u}</option>)}
                        </select>
                      </td>
                      <td className="col-qty">
                        <input
                          className={`fi${errors[`item_qty_${idx}`]?" e":""}`}
                          style={{fontSize:12,padding:"8px 10px",textAlign:"right"}}
                          value={it.qty}
                          placeholder="0"
                          type="text"
                          inputMode="decimal"
                          onChange={e => setItemField(idx, "qty", normalizeDecimalInput(e.target.value))}
                        />
                        {errors[`item_qty_${idx}`] && (
                          <div className="err" style={{fontSize:10,marginTop:2}}>{errors[`item_qty_${idx}`]}</div>
                        )}
                      </td>
                      <td className="col-price">
                        <input
                          className={`fi${errors[`item_price_${idx}`]?" e":""}`}
                          style={{fontSize:12,padding:"8px 10px",textAlign:"right"}}
                          value={it.price}
                          placeholder="0.00"
                          type="text"
                          inputMode="decimal"
                          onChange={e => setItemField(idx, "price", normalizeDecimalInput(e.target.value))}
                        />
                        {errors[`item_price_${idx}`] && (
                          <div className="err" style={{fontSize:10,marginTop:2}}>{errors[`item_price_${idx}`]}</div>
                        )}
                      </td>
                      <td className="col-total">
                        {rowTotal > 0 ? fmtNum(rowTotal) : "-"}
                      </td>
                      <td className="col-del">
                        <button className="del-btn" onClick={() => removeItem(idx)} disabled={form.items.length <= 1}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <button className="add-row-btn" onClick={addItem}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            เพิ่มรายการ
          </button>

          {/* ค่าแรง */}
          <div className="labor-box" style={{marginTop:16,padding:"14px 16px",background:"#f8fafc",borderRadius:10,border:"1px solid #e2e8f0",display:"flex",alignItems:"center",justifyContent:"space-between",gap:16}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:14,fontWeight:500,color:"#1e293b"}}>👷‍♂️ ค่าแรง <span className="req">*</span></span>
              <span style={{fontSize:12,color:"#64748b"}}>(บังคับกรอก)</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <input
                className={`fi${errors.laborCost?" e":""}`}
                style={{width:150,textAlign:"right",padding:"8px 12px",fontSize:14}}
                value={form.laborCost}
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                onChange={e=>setField("laborCost", normalizeDecimalInput(e.target.value))}
              />
              <span style={{fontSize:14,color:"#475569"}}>บาท</span>
            </div>
          </div>
          {errors.laborCost && (
            <div style={{fontSize:12,color:"#dc2626",marginTop:6,marginLeft:4}}>{errors.laborCost}</div>
          )}

          {/* Summary */}
          <div className="summary-box">
            <div className="sum-row">
              <span>ยอดรวมวัสดุอุปกรณ์</span>
              <span className="sum-val">฿{fmtNum(itemsSubtotal)}</span>
            </div>
            <div className="sum-row">
              <span>ค่าแรง</span>
              <span className="sum-val">฿{fmtNum(laborCost)}</span>
            </div>
            <div className="sum-row">
              <span>ยอดรวมก่อนหักส่วนลด</span>
              <span className="sum-val">฿{fmtNum(subtotal)}</span>
            </div>
            <div className="sum-row" style={{alignItems:"flex-start",gap:16}}>
              <span>ส่วนลด (บาท)</span>
              <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end"}}>
                <input
                  className={`fi${errors.discount?" e":""}`}
                  style={{width:120,textAlign:"right",padding:"6px 10px",fontSize:13}}
                  value={form.discount}
                  type="text"
                  inputMode="decimal"
                  onChange={e=>setField("discount", normalizeDecimalInput(e.target.value))}
                />
                {errors.discount && <span className="err">{errors.discount}</span>}
              </div>
            </div>
            <div className="sum-row">
              <span>ยอดหลังหักส่วนลด</span>
              <span className="sum-val">฿{fmtNum(afterDisc)}</span>
            </div>
            <div className="sum-row">
              <div className="toggle-wrap">
                <label className="toggle">
                  <input type="checkbox" checked={form.vatEnabled} onChange={e=>setField("vatEnabled",e.target.checked)}/>
                  <div className="toggle-track"/>
                  <div className="toggle-thumb"/>
                </label>
                <span>ภาษีมูลค่าเพิ่ม 7%</span>
              </div>
              <span className="sum-val">฿{fmtNum(vat)}</span>
            </div>
            <div className="sum-row total">
              <span>ยอดรวมทั้งสิ้น</span>
              <span className="sum-val total">฿{fmtNum(total)}</span>
            </div>
          </div>
        </div>

        {/* ── เงื่อนไข / หมายเหตุ ── */}
        <div className="card">
          <div className="card-title">
            <div className="card-title-icon">📋</div>
            เงื่อนไขการชำระเงิน / หมายเหตุ
          </div>
          <div className="fg2">
            <div className="field fc">
              <label className="fl">เงื่อนไขการชำระเงิน</label>
              <input className="fi" value={form.paymentTerms} onChange={e=>setField("paymentTerms",e.target.value)} placeholder="เช่น ชำระภายใน 30 วัน หลังได้รับใบแจ้งหนี้"/>
            </div>
            <div className="field fc">
              <label className="fl">หมายเหตุ</label>
              <textarea className="ft" value={form.remark} onChange={e=>setField("remark",e.target.value)} placeholder="หมายเหตุเพิ่มเติม เช่น ราคานี้รวมค่าแรง ค่าวัสดุ และภาษีมูลค่าเพิ่มแล้ว..."/>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="page-ft">
          {/* <a href="/quotation" className="btn btn-ghost">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            ยกเลิก
          </a> */}
          <button className="btn btn-dark" onClick={handleNext} disabled={processing}>
            {processing
              ? <><div className="spinner"/><span>กำลังประมวลผล...</span></>
              : <>ถัดไป — ดูตัวอย่างใบเสนอราคา <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></>
            }
          </button>
        </div>
      </div>
    </>
  );
}
