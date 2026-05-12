"use client";

import { POSITIONS, PREFIXES } from "@/components/data/usersData";
import { genId, handleNameKeyDown, handleNamePaste, handlePhoneKeyDown, handlePhonePaste, maskPassword, useUsersPage } from "@/components/users/useUsersPage";
import "./users.css";

export default function StaffPage() {
  const {
    staff,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    posFilter,
    setPosFilter,
    modal,
    editTarget,
    deleteTarget,
    viewTarget,
    form,
    errors,
    globalErr,
    saving,
    toast,
    showPw,
    setShowPw,
    loading,
    loadError,
    provinces,
    provinceId,
    districtId,
    subdistrictId,
    filtered,
    openAdd,
    openEdit,
    openDelete,
    openView,
    closeModal,
    setF,
    selectProvince,
    selectDistrict,
    selectSubdistrict,
    districtOptions,
    subdistrictOptions,
    buildLocation,
    handleSave,
    handleDelete,
    adminCount,
    staffCount,
    avatar,
    avatarColor,
  } = useUsersPage();

  if (loading) {
    return (
      <div className="page" style={{ padding: 40, fontSize: 16, color: "#374151" }}>
        กำลังโหลดข้อมูลพนักงาน...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="page" style={{ padding: 40, fontSize: 16, color: "#b91c1c" }}>
        {loadError}
      </div>
    );
  }

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
          <a href="projects">หน้าหลัก</a><span>/</span>
          <strong>จัดการพนักงาน</strong>
        </div>

        {/* Header */}
        <div className="hd">
          <div>
            <div className="hd-label">ผู้ใช้งานระบบ</div>
            <h1 className="hd-title">จัดการข้อมูลพนักงาน</h1>
            <p className="hd-sub">แสดง เพิ่ม แก้ไข และจัดการข้อมูลผู้ดูแลและพนักงานทั้งหมด</p>
          </div>
          <button className="btn btn-dark" onClick={openAdd}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            เพิ่มพนักงาน
          </button>
        </div>

        {/* KPI */}
        <div className="kpi-row">
          <div className="kpi">
            <div className="kpi-icon">👥</div>
            <div className="kpi-lbl">ทั้งหมด</div>
            <div className="kpi-val">{staff.length}</div>
            <div className="kpi-sub">บัญชีผู้ใช้</div>
          </div>
          <div className="kpi">
            <div className="kpi-icon">🛡️</div>
            <div className="kpi-lbl">Admin</div>
            <div className="kpi-val" style={{color:"#2d6a4f"}}>{adminCount}</div>
            <div className="kpi-sub">ผู้ดูแลระบบ</div>
          </div>
          <div className="kpi">
            <div className="kpi-icon">👤</div>
            <div className="kpi-lbl">Staff</div>
            <div className="kpi-val" style={{color:"#1e40af"}}>{staffCount}</div>
            <div className="kpi-sub">พนักงาน</div>
          </div>
          <div className="kpi">
            <div className="kpi-icon">💼</div>
            <div className="kpi-lbl">ตำแหน่งงาน</div>
            <div className="kpi-val">{new Set(staff.map(s=>s.position)).size}</div>
            <div className="kpi-sub">ตำแหน่ง</div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-wrap">
            <span className="search-ic">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input className="search-inp" placeholder="ค้นหาชื่อ, รหัส, username, อีเมล..." value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <div className="role-tabs">
            {[["ทั้งหมด","all"],["Admin","admin"],["Staff","staff-t"]].map(([label,cls])=>(
              <button key={label} className={`role-tab ${cls}${roleFilter===label?" active":""}`} onClick={()=>setRoleFilter(label)}>{label}</button>
            ))}
          </div>
          <select className="sel" value={posFilter} onChange={e=>setPosFilter(e.target.value)}>
            <option>ทั้งหมด</option>
            {POSITIONS.map(p=><option key={p}>{p}</option>)}
          </select>
          <span style={{fontSize:12,color:"#9ca3af",whiteSpace:"nowrap"}}>พบ {filtered.length} คน</span>
        </div>

        {/* Table */}
        <div className="table-wrap">
          <div className="table-scroll">
            {filtered.length === 0
              ? <div className="empty"><div className="empty-icon">👥</div><div className="empty-txt">ไม่พบพนักงานที่ตรงกัน</div></div>
              : (
              <table>
                <thead>
                  <tr>
                    <th>พนักงาน</th><th>ตำแหน่ง</th><th>สิทธิ์</th>
                    <th>Username</th><th>เบอร์โทร</th><th>อีเมล</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => (
                    <tr key={s.staff_id}>
                      <td>
                        <div className="staff-info">
                          <div className="avatar" style={{background:avatarColor(s.staff_id)}}>{avatar(s)}</div>
                          <div>
                            <div className="staff-name">{s.prefix}{s.first_name} {s.last_name}</div>
                            <div className="staff-id">{s.staff_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="td-text">{s.position}</td>
                      <td>
                        {s.role === "1"
                          ? <span className="badge badge-admin"><span className="badge-dot" style={{background:"#16a34a"}}/>Admin</span>
                          : <span className="badge badge-staff"><span className="badge-dot" style={{background:"#3b82f6"}}/>Staff</span>
                        }
                      </td>
                      <td><span className="td-mono">{s.username}</span></td>
                      <td className="td-text" style={{whiteSpace:"nowrap"}}>{s.phone}</td>
                      <td className="td-text" style={{fontSize:12}}>{s.email}</td>
                      <td>
                        <div className="act-cell">
                          <button className="btn btn-outline btn-xs" onClick={()=>openView(s)}>ดู</button>
                          <button className="btn btn-outline btn-xs" onClick={()=>openEdit(s)}>แก้ไข</button>
                          <button className="btn btn-ghost btn-ico btn-xs" onClick={()=>openDelete(s)} title="ลบ">
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
            <span>แสดง {filtered.length} จาก {staff.length} คน</span>
            <div style={{display:"flex",gap:16}}>
              <span>Admin: <strong style={{color:"#2d6a4f"}}>{adminCount}</strong></span>
              <span>Staff: <strong style={{color:"#1e40af"}}>{staffCount}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* ════ MODAL ดูข้อมูล ════ */}
      {modal === "view" && viewTarget && (
        <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)closeModal()}}>
          <div className="modal">
            <div className="modal-hd">
              <div className="modal-title">ข้อมูลพนักงาน</div>
              <button className="modal-close" onClick={closeModal}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="modal-body">
              {/* Header */}
              <div className="view-header">
                <div className="view-avatar" style={{background:avatarColor(viewTarget.staff_id)}}>{avatar(viewTarget)}</div>
                <div>
                  <div className="view-name">{viewTarget.prefix}{viewTarget.first_name} {viewTarget.last_name}</div>
                  <div className="view-pos">{viewTarget.position}</div>
                  <div style={{marginTop:6}}>
                    {viewTarget.role === "1"
                      ? <span className="badge badge-admin"><span className="badge-dot" style={{background:"#16a34a"}}/>Admin</span>
                      : <span className="badge badge-staff"><span className="badge-dot" style={{background:"#3b82f6"}}/>Staff</span>
                    }
                  </div>
                </div>
              </div>

              <div className="view-grid">
                {[
                  ["รหัสพนักงาน", viewTarget.staff_id],
                  ["Username",    viewTarget.username],
                  ["รหัสผ่าน",   maskPassword(viewTarget.password)],
                  ["เบอร์โทร",   viewTarget.phone],
                  ["อีเมล",      viewTarget.email],
                  ["ตำแหน่ง",    viewTarget.position],
                ].map(([label, value]) => (
                  <div key={label} className="view-field">
                    <div className="view-field-label">{label}</div>
                    <div className="view-field-value">{value}</div>
                  </div>
                ))}
                {viewTarget.address && (
                  <div className="view-field" style={{gridColumn:"1/-1"}}>
                    <div className="view-field-label">ที่อยู่</div>
                    <div className="view-field-value">{viewTarget.address}</div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-ft">
              <button className="btn btn-ghost" onClick={closeModal}>ปิด</button>
              <button className="btn btn-dark" onClick={()=>openEdit(viewTarget)}>แก้ไขข้อมูล</button>
            </div>
          </div>
        </div>
      )}

      {/* ════ MODAL เพิ่ม/แก้ไข ════ */}
      {(modal === "add" || modal === "edit") && (
        <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)closeModal()}}>
          <div className="modal">
            <div className="modal-hd">
              <div className="modal-title">{modal==="add"?"เพิ่มพนักงานใหม่":"แก้ไขข้อมูลพนักงาน"}</div>
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

              {/* ── สิทธิ์ ── */}
              <div className="form-section">ระดับสิทธิ์</div>
              <div className="role-toggle" style={{marginBottom:18}}>
                <button className={`role-opt admin${form.role==="1"?" active":""}`} onClick={()=>setF("role","1")}>
                  <div className="role-opt-icon">🛡️</div>
                  <div className="role-opt-lbl">Admin (1)</div>
                  <div className="role-opt-sub">เข้าถึงได้ทุกหน้า รวมถึงรายงาน</div>
                </button>
                <button className={`role-opt staff-r${form.role==="2"?" active":""}`} onClick={()=>setF("role","2")}>
                  <div className="role-opt-icon">👤</div>
                  <div className="role-opt-lbl">Staff (2)</div>
                  <div className="role-opt-sub">เข้าถึงได้ทุกหน้า ยกเว้นรายงาน</div>
                </button>
              </div>

              {/* ── ข้อมูลส่วนตัว ── */}
              <div className="form-section">ข้อมูลส่วนตัว</div>

              {/* คำนำหน้า + ชื่อ + นามสกุล */}
              <div className="fg3" style={{gridTemplateColumns:"120px 1fr 1fr"}}>
                <div className="field">
                  <label className="fl">คำนำหน้า <span className="req">*</span></label>
                  <select className={`fs${errors.prefix?" e":""}`} value={form.prefix} onChange={e=>setF("prefix",e.target.value)}>
                    {PREFIXES.map(p=><option key={p}>{p}</option>)}
                  </select>
                  {errors.prefix && <span className="err">{errors.prefix}</span>}
                </div>
                <div className="field">
                  <label className="fl">ชื่อ <span className="req">*</span></label>
                  <input
                    className={`fi${errors.first_name?" e":""}`}
                    value={form.first_name}
                    onChange={e=>setF("first_name",e.target.value)}
                    onKeyDown={handleNameKeyDown}
                    onPaste={handleNamePaste}
                    placeholder="ชื่อจริง"
                  />
                  {errors.first_name && <span className="err">{errors.first_name}</span>}
                </div>
                <div className="field">
                  <label className="fl">นามสกุล <span className="req">*</span></label>
                  <input
                    className={`fi${errors.last_name?" e":""}`}
                    value={form.last_name}
                    onChange={e=>setF("last_name",e.target.value)}
                    onKeyDown={handleNameKeyDown}
                    onPaste={handleNamePaste}
                    placeholder="นามสกุล"
                  />
                  {errors.last_name && <span className="err">{errors.last_name}</span>}
                </div>
              </div>

              {/* ตำแหน่ง */}
              <div className="fg2">
                <div className="field">
                  <label className="fl">ตำแหน่งงาน <span className="req">*</span></label>
                  <select className={`fs${errors.position?" e":""}`} value={form.position} onChange={e=>setF("position",e.target.value)}>
                    <option value="">-- เลือกตำแหน่ง --</option>
                    {POSITIONS.map(p=><option key={p}>{p}</option>)}
                  </select>
                  {errors.position && <span className="err">{errors.position}</span>}
                </div>
                <div className="field">
                  <label className="fl">เบอร์โทรศัพท์ <span className="req">*</span></label>
                  <input
                    className={`fi${errors.phone?" e":""}`}
                    value={form.phone}
                    onChange={e=>setF("phone",e.target.value)}
                    onKeyDown={handlePhoneKeyDown}
                    onPaste={handlePhonePaste}
                    placeholder="0812345678"
                    inputMode="tel"
                    maxLength={10}
                  />
                  {errors.phone && <span className="err">{errors.phone}</span>}
                  {!errors.phone && <span className="hint">ตัวเลข 10 หลัก</span>}
                </div>
              </div>

              {/* อีเมล */}
              <div className="fg2">
                <div className="field fc">
                  <label className="fl">อีเมล <span className="req">*</span></label>
                  <input type="email" className={`fi${errors.email?" e":""}`} value={form.email} onChange={e=>setF("email",e.target.value)} placeholder="email@suwan.th"/>
                  {errors.email && <span className="err">{errors.email}</span>}
                </div>
              </div>

              {/* ที่อยู่ */}
              <div className="form-section">ที่อยู่</div>
              <div className="fg3" style={{gridTemplateColumns:"1fr 1fr 1fr"}}>
                <div className="field">
                  <label className="fl">จังหวัด <span className="req">*</span></label>
                  <select className={`fs${errors.province?" e":""}`} value={provinceId} onChange={e=>selectProvince(e.target.value)}>
                    <option value="">-- เลือกจังหวัด --</option>
                    {provinces.map(p=><option key={p.id} value={p.id}>{p.name_th}</option>)}
                  </select>
                  {errors.province && <span className="err">{errors.province}</span>}
                </div>
                <div className="field">
                  <label className="fl">อำเภอ <span className="req">*</span></label>
                  <select className={`fs${errors.district?" e":""}`} value={districtId} onChange={e=>selectDistrict(e.target.value)} disabled={!provinceId}>
                    <option value="">-- เลือกอำเภอ --</option>
                    {districtOptions.map(d=><option key={d.id} value={d.id}>{d.name_th}</option>)}
                  </select>
                  {errors.district && <span className="err">{errors.district}</span>}
                </div>
                <div className="field">
                  <label className="fl">ตำบล <span className="req">*</span></label>
                  <select className={`fs${errors.subdistrict?" e":""}`} value={subdistrictId} onChange={e=>selectSubdistrict(e.target.value)} disabled={!districtId}>
                    <option value="">-- เลือกตำบล --</option>
                    {subdistrictOptions.map(s=><option key={s.id} value={s.id}>{s.name_th}</option>)}
                  </select>
                  {errors.subdistrict && <span className="err">{errors.subdistrict}</span>}
                </div>
              </div>
              <div className="field" style={{marginBottom:14}}>
                <label className="fl">ที่อยู่ (บ้านเลขที่ / ถนน / หมู่บ้าน) <span className="req">*</span></label>
                <input className={`fi${errors.address?" e":""}`} value={form.detail_address} onChange={e=>setF("detail_address",e.target.value)} placeholder="บ้านเลขที่ ถนน หมู่บ้าน"/>
                {errors.address && <span className="err">{errors.address}</span>}
                {!errors.address && form.detail_address && (
                  <span className="hint">ตัวอย่างที่อยู่รวม: {buildLocation(form)}</span>
                )}
              </div>

              {/* ── บัญชีผู้ใช้ ── */}
              <div className="form-section">บัญชีผู้ใช้งาน</div>

              <div className="fg2">
                {/* Username */}
                <div className="field">
                  <label className="fl">Username <span className="req">*</span></label>
                  <input className={`fi${errors.username?" e":""}`} value={form.username} onChange={e=>setF("username",e.target.value)}
                    placeholder="เช่น somchai" maxLength={20}/>
                  {errors.username && <span className="err">{errors.username}</span>}
                  {!errors.username && <span className="hint">ตัวอักษร ตัวเลข และ _ สูงสุด 20 ตัว</span>}
                </div>

                {/* Password */}
                <div className="field">
                  <label className="fl">รหัสผ่าน {modal === "edit" ? <span style={{fontSize:12,color:"#6b7280"}}>(เว้นว่างไว้ถ้าไม่ต้องการเปลี่ยน)</span> : <span className="req">*</span>}</label>
                  <div className="pw-wrap">
                    <input type={showPw?"text":"password"} className={`fi${errors.password?" e":""}`}
                      value={form.password} onChange={e=>setF("password",e.target.value)}
                      placeholder={modal === "edit" ? "เว้นว่างไว้หากไม่แก้ไข" : "อย่างน้อย 6 ตัวอักษร"} maxLength={20}/>
                    <button type="button" className="pw-eye" onClick={()=>setShowPw(p=>!p)}>
                      {showPw
                        ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  </div>
                  {errors.password && <span className="err">{errors.password}</span>}
                  {!errors.password && <span className="hint">สูงสุด 20 ตัวอักษร</span>}
                </div>
              </div>

              {/* Staff ID preview */}
              {modal === "add" && (
                <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:9,padding:"10px 14px",fontSize:12,color:"#166534",display:"flex",alignItems:"center",gap:8}}>
                  <span>🆔</span>
                  <span>รหัสพนักงานที่จะได้รับ: <strong>{genId(staff)}</strong> (ระบบสร้างอัตโนมัติ)</span>
                </div>
              )}
              {modal === "edit" && editTarget && (
                <div style={{background:"#f9fafb",border:"1px solid #e5e7eb",borderRadius:9,padding:"10px 14px",fontSize:12,color:"#6b7280",display:"flex",alignItems:"center",gap:8}}>
                  <span>🆔</span>
                  <span>รหัสพนักงาน: <strong style={{color:"#111110"}}>{editTarget.staff_id}</strong></span>
                </div>
              )}
            </div>

            <div className="modal-ft">
              <button className="btn btn-ghost" onClick={closeModal}>ยกเลิก</button>
              <button className="btn btn-dark" onClick={handleSave} disabled={saving}>
                {saving ? <><div className="spinner"/><span>กำลังบันทึก...</span></> : modal==="add" ? "เพิ่มพนักงาน" : "บันทึกการแก้ไข"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ MODAL ลบ ════ */}
      {modal === "delete" && deleteTarget && (
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
              {/* Avatar */}
              <div style={{display:"flex",justifyContent:"center",marginBottom:14}}>
                <div className="avatar" style={{background:avatarColor(deleteTarget.staff_id),width:52,height:52,fontSize:18}}>
                  {avatar(deleteTarget)}
                </div>
              </div>
              <p style={{fontSize:15,color:"#374151",marginBottom:8,lineHeight:1.7}}>
                ต้องการลบพนักงาน<br/>
                <strong style={{color:"#dc2626"}}>{deleteTarget.prefix}{deleteTarget.first_name} {deleteTarget.last_name}</strong> หรือไม่?
              </p>
              <div style={{display:"flex",justifyContent:"center",gap:12,marginBottom:10,fontSize:12,color:"#6b7280"}}>
                <span>{deleteTarget.staff_id}</span>
                <span>·</span>
                <span>{deleteTarget.username}</span>
                <span>·</span>
                <span>{deleteTarget.role==="1"?"Admin":"Staff"}</span>
              </div>
              <p style={{fontSize:13,color:"#9ca3af"}}>บัญชีและข้อมูลจะถูกลบออกจากระบบถาวร</p>
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
