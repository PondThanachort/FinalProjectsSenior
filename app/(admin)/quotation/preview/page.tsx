"use client";

import { fmtDate, fmtNum, toNum, useQuotationPreviewPage } from "@/components/quotation/useQuotationPreviewPage";
import "./preview.css";

export default function QuotationPreviewPage() {
  const {
    data,
    form,
    subtotal,
    discount,
    vat,
    total,
    laborCost,
    itemsSubtotal,
    filledItems,
    padRows,
    printRef,
    saving,
    handleBack,
    handlePrint,
    handleDownload,
  } = useQuotationPreviewPage();

  if (!data) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh" }}>
      <div style={{ textAlign:"center", color:"#9ca3af" }}>
        <div style={{ fontSize:32, marginBottom:12 }}>📄</div>
        <div>กำลังโหลดข้อมูล...</div>
      </div>
    </div>
  );

  if (!form) return null;

  return (
    <>
      <div className="screen-wrap">

        {/* Breadcrumb */}
        <div className="bc">
          <a href="/projects">หน้าหลัก</a><span>/</span>
          <a href="/quotation">ใบเสนอราคา</a><span>/</span>
          <a href="/quotation/create">ทำใบเสนอราคา</a><span>/</span>
          <strong>แสดงตัวอย่าง</strong>
        </div>

        {/* Steps */}
        <div className="steps">
          <div className="step">
            <div className="step-circle done">✓</div>
            <div className="step-label done">กรอกข้อมูล</div>
          </div>
          <div className="step-line" style={{ background:"#52b788" }}/>
          <div className="step">
            <div className="step-circle active">2</div>
            <div className="step-label active">แสดงตัวอย่าง</div>
          </div>
          <div className="step-line"/>
          <div className="step">
            <div className="step-circle todo">3</div>
            <div className="step-label todo">ดาวน์โหลด</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="preview-toolbar">
          <div className="preview-info">
            <strong>ตัวอย่างใบเสนอราคา</strong> · เลขที่ {form.quotationNo} · ตรวจสอบก่อนดาวน์โหลด
          </div>
          <div className="toolbar-actions">
            <button className="btn btn-outline" onClick={handleBack}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
              กลับแก้ไข
            </button>
            <button className="btn btn-outline" onClick={handlePrint}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              พิมพ์
            </button>
            <button className="btn btn-green" onClick={handleDownload} disabled={saving}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              {saving ? "กำลังสร้าง PDF..." : "ดาวน์โหลด PDF"}
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            A4 DOCUMENT — เหมือน Suwan ESTIMATE PDF
        ══════════════════════════════════════════ */}
        <div className="doc-shadow" ref={printRef}>
          <div className="doc">

            {/* ─── บรรทัดบนสุด: Logo + ชื่อบริษัท ─── */}
            <div className="doc-top">
              {/* Logo placeholder */}
              {/* <div className="doc-logo-placeholder">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div> */}
              <img src="/logo.jpg" alt="Suwan logo" className="doc-logo-placeholder" />

              {/* ชื่อบริษัทและที่อยู่ */}
              <div className="doc-company-block">
                <div className="doc-company-thai">
                  {form.companyName || "ห้างหุ้นส่วนจำกัด สุวรรณ อินทีเรียร์แอนด์รีโนเวชั่น (สำนักงานใหญ่)"}
                </div>
                <div className="doc-company-eng">
                  SUWAN INTERIOR &amp; RENOVATION LTD., PART
                </div>
                <div className="doc-company-addr">
                  {form.companyAddress || "65 หมู่ ต.ม่วงน้อย อ.ป่าซาง จ.ลำพูน 51120"}<br/>
                  65 M.6 Tombon Muangnoi, Ampher Pasang, Lamphun 51120<br/>
                  TEL.: {form.companyPhone || "082-615-2905 / 089-809-4354"}&nbsp;&nbsp;
                  เลขประจำตัวผู้เสียภาษีอากร 0513562000087<br/>
                  E-mail Address : {form.companyEmail || "Suwannakorn62@gmail.com"}
                </div>
              </div>
            </div>

            {/* ─── ชื่อเอกสาร กึ่งกลาง ─── */}
            <div className="doc-doc-title">ESTIMATE</div>

            {/* ─── MESSRS / ADDRESS / PROJECT / SUBJECT  +  NO. / DATE ─── */}
            <table className="doc-info-table">
              <colgroup>
                <col style={{ width:"110px" }}/>
                <col style={{ width:"8px" }}/>
                <col/>
                <col style={{ width:"150px" }}/>
              </colgroup>
              <tbody>
                <tr>
                  <td className="doc-info-label">MESSRS</td>
                  <td className="doc-info-colon">:</td>
                  <td className="doc-info-value" style={{ fontWeight:600 }}>
                    {form.clientName || ""}
                  </td>
                  <td className="doc-info-right">
                    NO. :&nbsp;&nbsp;<strong>{form.quotationNo}</strong>
                  </td>
                </tr>
                <tr>
                  <td className="doc-info-label"></td>
                  <td></td>
                  <td className="doc-info-value" style={{ fontSize:11, color:"#444" }}>
                    {/* บริษัทลูกค้าบรรทัด 2 (ถ้ากรอก) */}
                  </td>
                  <td className="doc-info-right">
                    DATE :&nbsp;&nbsp;<strong>{fmtDate(form.quotationDate)}</strong>
                  </td>
                </tr>
                <tr>
                  <td className="doc-info-label">ADDRESS</td>
                  <td className="doc-info-colon">:</td>
                  <td className="doc-info-value">{form.clientAddress || ""}</td>
                  <td className="doc-info-right" style={{ verticalAlign:"top" }}>
                    TERM OF DELIVERY :
                  </td>
                </tr>
                <tr>
                  <td className="doc-info-label">TAX ID</td>
                  <td className="doc-info-colon">:</td>
                  <td className="doc-info-value">
                    {form.clientTaxId || ""}
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td className="doc-info-label">PROJECT</td>
                  <td className="doc-info-colon">:</td>
                  <td className="doc-info-value" style={{ fontWeight:600 }}>
                    {form.projectName || ""}
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td className="doc-info-label">SUBJECT</td>
                  <td className="doc-info-colon">:</td>
                  <td className="doc-info-value" style={{ fontWeight:600 }}>
                    {form.remark || ""}
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td className="doc-info-label">ATTN</td>
                  <td className="doc-info-colon">:</td>
                  <td className="doc-info-value" style={{ fontWeight:600 }}>
                    {form.attn || ""}
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>

            {/* ─── ตารางรายการ ─── */}
            <table className="items-tbl">
              <thead>
                <tr>
                  <th className="th-no">NO.</th>
                  <th className="th-desc">DESCRIPTION</th>
                  <th className="th-qty">Q&apos;TY</th>
                  <th className="th-unit">UNIT</th>
                  <th className="th-price">PRICE</th>
                  <th className="th-amt">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {/* หัวข้อกลุ่มงาน (SUBJECT / remark) */}
                {form.remark && (
                  <tr>
                    <td colSpan={6} className="td-group-header">
                      {form.remark.toUpperCase()}
                    </td>
                  </tr>
                )}

                {/* รายการจริง */}
                {filledItems.map((it, idx) => {
                  const rowAmt = toNum(it.qty) * toNum(it.price);
                  return (
                    <tr key={it.id}>
                      <td className="td-no">{idx + 1}</td>
                      <td className="td-desc">{it.desc}</td>
                      <td className="td-qty">
                        {toNum(it.qty) > 0 ? fmtNum(toNum(it.qty)) : ""}
                      </td>
                      <td className="td-unit">{it.unit}</td>
                      <td className="td-price">
                        {toNum(it.price) > 0 ? fmtNum(toNum(it.price)) : ""}
                      </td>
                      <td className="td-amt">
                        {rowAmt > 0 ? fmtNum(rowAmt) : "-"}
                      </td>
                    </tr>
                  );
                })}

                {/* แถว padding ให้เต็มหน้า */}
                {Array.from({ length: padRows }).map((_, i) => (
                  <tr key={`pad-${i}`} className="tr-pad">
                    <td className="td-no"></td>
                    <td className="td-desc"></td>
                    <td className="td-qty"></td>
                    <td className="td-unit"></td>
                    <td className="td-price"></td>
                    <td className="td-amt"></td>
                  </tr>
                ))}

                {/* TOTAL */}
                <tr className="tr-total">
                  <td colSpan={5} className="td-total-label">MATERIALS TOTAL</td>
                  <td className="td-total-val">{fmtNum(itemsSubtotal)}</td>
                </tr>

                {/* Labor Cost */}
                <tr className="tr-total">
                  <td colSpan={5} className="td-total-label">LABOR COST</td>
                  <td className="td-total-val">{fmtNum(laborCost)}</td>
                </tr>

                {/* SUBTOTAL */}
                <tr className="tr-total">
                  <td colSpan={5} className="td-total-label">SUBTOTAL</td>
                  <td className="td-total-val">{fmtNum(subtotal)}</td>
                </tr>

                {/* VAT 7% */}
                {form.vatEnabled && (
                  <tr className="tr-total">
                    <td colSpan={5} className="td-total-label">VAT 7%</td>
                    <td className="td-total-val">{fmtNum(vat)}</td>
                  </tr>
                )}

                {/* Discount */}
                {discount > 0 && (
                  <tr className="tr-total">
                    <td colSpan={5} className="td-total-label">DISCOUNT</td>
                    <td className="td-total-val">({fmtNum(discount)})</td>
                  </tr>
                )}

                {/* GRAND TOTAL */}
                <tr className="tr-total tr-total-grand">
                  <td colSpan={5} className="td-total-label">GRAND TOTAL</td>
                  <td className="td-total-val">{fmtNum(total)}</td>
                </tr>
              </tbody>
            </table>

            {/* ─── ลายเซ็น ─── */}
            <div className="doc-sign">
              <div className="doc-sign-box">
                <div className="doc-sign-line"/>
                <div className="doc-sign-label">
                  RECEIVER / DATE<br/>
                  <span style={{ fontFamily:"'Noto Sans Thai',sans-serif", fontSize:10.5 }}>ผู้รับ / วันที่</span>
                </div>
              </div>
              <div className="doc-sign-box">
                <div className="doc-sign-line"/>
                <div className="doc-sign-label">
                  <span style={{ fontWeight:700, display:"block", marginBottom:2, fontSize:12 }}>
                    MS.KANNIKA YAKORN
                  </span>
                  MANAGER DIRECTOR
                </div>
              </div>
            </div>

            {/* ─── Email footer ─── */}
            <div className="doc-footer-note">
              E-mail Address : {form.companyEmail || "Suwannakorn62@gmail.com"}
            </div>

          </div>{/* .doc */}
        </div>{/* .doc-shadow */}

        {/* ปุ่มด้านล่าง */}
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:18, flexWrap:"wrap", gap:10 }}>
          <button className="btn btn-outline" onClick={handleBack}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            กลับแก้ไข
          </button>
          <div style={{ display:"flex", gap:8 }}>
            <button className="btn btn-outline" onClick={handlePrint}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              พิมพ์ / บันทึก PDF
            </button>
            <button className="btn btn-green" onClick={handleDownload} disabled={saving}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              {saving ? "กำลังสร้าง PDF..." : "ดาวน์โหลด PDF"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
