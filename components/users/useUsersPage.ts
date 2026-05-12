"use client";

import { useEffect, useState, type KeyboardEvent, type ClipboardEvent } from "react";
import { EMPTY_FORM, type Staff, type FormErrors } from "@/components/data/usersData";

type ThaiProvince = { id: string; name_th: string };
type ThaiDistrict = { id: string; province_id: string; name_th: string };
type ThaiSubdistrict = { id: string; district_id: string; name_th: string; zip_code?: string };
type ThaiProvinceJson = { id: string | number; name_th: string };
type ThaiDistrictJson = { id: string | number; province_id: string | number; name_th: string };
type ThaiSubdistrictJson = { id: string | number; district_id: string | number; name_th: string; zip_code?: string };

type StaffForm = Omit<Staff, "staff_id"> & {
  province: string;
  district: string;
  subdistrict: string;
  detail_address: string;
};

type StaffFormErrors = FormErrors & {
  province?: string;
  district?: string;
  subdistrict?: string;
};

const INITIAL_FORM: StaffForm = {
  ...EMPTY_FORM,
  province: "",
  district: "",
  subdistrict: "",
  detail_address: "",
};

// ── Helpers ────────────────────────────────────────────────────────────────────
export function genId(existing: Staff[]) {
  const maxNum = existing.reduce((max, s) => {
    const n = parseInt(s.staff_id.replace("ST",""));
    return isNaN(n) ? max : Math.max(max, n);
  }, 0);
  return `ST${String(maxNum + 1).padStart(3, "0")}`;
}
export function maskPassword(pw: string) { return pw ? "•".repeat(Math.min(pw.length, 8)) : "-"; }
function isOnlyDigits(s: string) { return /^\d+$/.test(s); }
function isValidName(s: string) { return /^[\p{L}\p{M} ]+$/u.test(s); }
function isValidEmail(s: string) { return /^[a-zA-Z0-9_.+\-]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9-.]+$/.test(s); }
function isValidUsername(s: string) { return /^[a-zA-Z0-9_]+$/.test(s); }

export function handleNameKeyDown(e: KeyboardEvent<HTMLInputElement>) {
  if (e.key.length === 1 && !/^[\p{L}\p{M} ]$/u.test(e.key)) {
    e.preventDefault();
  }
}

export function handleNamePaste(e: ClipboardEvent<HTMLInputElement>) {
  const text = e.clipboardData.getData("text");
  if (!/^[\p{L}\p{M} ]*$/u.test(text)) {
    e.preventDefault();
  }
}

export function handlePhoneKeyDown(e: KeyboardEvent<HTMLInputElement>) {
  if (e.key.length === 1 && !/[0-9]/.test(e.key)) {
    e.preventDefault();
  }
}

export function handlePhonePaste(e: ClipboardEvent<HTMLInputElement>) {
  const text = e.clipboardData.getData("text");
  if (!/^\d*$/.test(text)) {
    e.preventDefault();
  }
}

// ── Validate ───────────────────────────────────────────────────────────────────
function validate(f: StaffForm, existingStaff: Staff[], editId?: string, requirePassword = true): StaffFormErrors {
  const e: StaffFormErrors = {};

  if (!f.prefix)           e.prefix     = "กรุณากรอกข้อมูลให้ครบถ้วน";
  if (!f.first_name.trim()) {
    e.first_name = "กรุณากรอกข้อมูลให้ครบถ้วน";
  } else if (!isValidName(f.first_name)) {
    e.first_name = "ชื่อห้ามมีตัวเลขหรืออักขระพิเศษ";
  }
  if (!f.last_name.trim()) {
    e.last_name = "กรุณากรอกข้อมูลให้ครบถ้วน";
  } else if (!isValidName(f.last_name)) {
    e.last_name = "นามสกุลห้ามมีตัวเลขหรืออักขระพิเศษ";
  }
  if (!f.position)         e.position   = "กรุณากรอกข้อมูลให้ครบถ้วน";

  // username
  if (!f.username.trim()) {
    e.username = "กรุณากรอกข้อมูลให้ครบถ้วน";
  } else if (!isValidUsername(f.username)) {
    e.username = "กรุณากรอกข้อมูลให้ถูกต้องตามประเภทที่กำหนด (ตัวอักษร ตัวเลข _ เท่านั้น)";
  } else {
    const dup = existingStaff.find(s => s.username === f.username && s.staff_id !== editId);
    if (dup) e.username = "ชื่อผู้ใช้นี้มีในระบบแล้ว กรุณาใช้ชื่ออื่น";
  }

  // password
  if (requirePassword) {
    if (!f.password.trim()) e.password = "กรุณากรอกข้อมูลให้ครบถ้วน";
    else if (f.password.length < 6) e.password = "กรุณากรอกข้อมูลให้ถูกต้องตามประเภทที่กำหนด (อย่างน้อย 6 ตัวอักษร)";
  } else if (f.password.trim() && f.password.length < 6) {
    e.password = "กรุณากรอกข้อมูลให้ถูกต้องตามประเภทที่กำหนด (อย่างน้อย 6 ตัวอักษร)";
  }

  // phone
  if (!f.phone.trim()) {
    e.phone = "กรุณากรอกข้อมูลให้ครบถ้วน";
  } else if (!isOnlyDigits(f.phone)) {
    e.phone = "กรุณากรอกข้อมูลให้ถูกต้องตามประเภทที่กำหนด (ตัวเลขเท่านั้น)";
  } else if (f.phone.length !== 10) {
    e.phone = "กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (10 หลัก)";
  }

  if (!f.province)      e.province    = "กรุณาเลือกจังหวัด";
  if (!f.district)      e.district    = "กรุณาเลือกอำเภอ";
  if (!f.subdistrict)   e.subdistrict = "กรุณาเลือกตำบล";
  if (!f.detail_address.trim()) {
    e.address = "กรุณากรอกที่อยู่ (บ้านเลขที่ ถนน)";
  }

  // email
  if (!f.email.trim()) {
    e.email = "กรุณากรอกข้อมูลให้ครบถ้วน";
  } else if (!isValidEmail(f.email)) {
    e.email = "กรุณากรอกอีเมลที่ถูกต้อง";
  }

  return e;
}

// ─────────────────────────────────────────────────────────────────────────────

export function useUsersPage() {
  const [staff,        setStaff]        = useState<Staff[]>([]);
  const [search,       setSearch]       = useState("");
  const [roleFilter,   setRoleFilter]   = useState("ทั้งหมด");
  const [posFilter,    setPosFilter]    = useState("ทั้งหมด");
  const [modal,        setModal]        = useState<"none"|"add"|"edit"|"delete"|"view">("none");
  const [editTarget,   setEditTarget]   = useState<Staff | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Staff | null>(null);
  const [viewTarget,   setViewTarget]   = useState<Staff | null>(null);
  const [form,         setForm]         = useState<StaffForm>(INITIAL_FORM);
  const [errors,       setErrors]       = useState<StaffFormErrors>({});
  const [globalErr,    setGlobalErr]    = useState("");
  const [saving,       setSaving]       = useState(false);
  const [toast,        setToast]        = useState("");
  const [showPw,       setShowPw]       = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [loadError,    setLoadError]    = useState("");
  const [provinces,    setProvinces]    = useState<ThaiProvince[]>([]);
  const [districts,    setDistricts]    = useState<ThaiDistrict[]>([]);
  const [subdistricts, setSubdistricts] = useState<ThaiSubdistrict[]>([]);
  const [provinceId,   setProvinceId]   = useState("");
  const [districtId,   setDistrictId]   = useState("");
  const [subdistrictId,setSubdistrictId]= useState("");

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await fetch("/api/users");
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error((body && body.error) || res.statusText || "Fetch error");
        }
        const data = await res.json();
        setStaff(Array.isArray(data.users) ? data.users : []);
      } catch (error) {
        console.error("Load users failed:", error);
        setLoadError("ไม่สามารถโหลดข้อมูลพนักงานได้");
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  useEffect(() => {
    async function loadThaiAddressData() {
      try {
        const [provRes, distRes, subRes] = await Promise.all([
          fetch("/data/provinces.json"),
          fetch("/data/districts.json"),
          fetch("/data/sub_districts.json"),
        ]);
        if (!provRes.ok || !distRes.ok || !subRes.ok) {
          console.error("Could not load Thai address JSON files");
          return;
        }
        const [provData, distData, subData] = await Promise.all([
          provRes.json(),
          distRes.json(),
          subRes.json(),
        ]);

        setProvinces(Array.isArray(provData) ? (provData as ThaiProvinceJson[]).map((item) => ({ id: String(item.id), name_th: item.name_th })) : []);
        setDistricts(Array.isArray(distData) ? (distData as ThaiDistrictJson[]).map((item) => ({ id: String(item.id), province_id: String(item.province_id), name_th: item.name_th })) : []);
        setSubdistricts(Array.isArray(subData) ? (subData as ThaiSubdistrictJson[]).map((item) => ({ id: String(item.id), district_id: String(item.district_id), name_th: item.name_th, zip_code: item.zip_code })) : []);
      } catch (error) {
        console.error("Load Thai address data failed:", error);
      }
    }
    loadThaiAddressData();
  }, []);

  useEffect(() => {
    if (modal === "edit" && editTarget && provinces.length && districts.length && subdistricts.length && !provinceId) {
      const parsed = parseThaiLocation(editTarget.address, provinces, districts, subdistricts);
      setForm(f => ({
        ...f,
        province: parsed.province || f.province,
        district: parsed.district || f.district,
        subdistrict: parsed.subdistrict || f.subdistrict,
        detail_address: parsed.detailAddress || f.detail_address,
      }));
      setProvinceId(parsed.provinceId || "");
      setDistrictId(parsed.districtId || "");
      setSubdistrictId(parsed.subdistrictId || "");
    }
  }, [modal, editTarget, provinces, districts, subdistricts, provinceId]);

  // ── Filter ───────────────────────────────────────────────────────────────────
  const filtered = staff.filter(s => {
    const q   = search.toLowerCase();
    const full= `${s.first_name} ${s.last_name}`.toLowerCase();
    const ms  = !q || full.includes(q) || s.staff_id.toLowerCase().includes(q) || s.username.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.position.toLowerCase().includes(q);
    const mr  = roleFilter === "ทั้งหมด" || (roleFilter==="Admin"?"1":"2") === s.role;
    const mp  = posFilter  === "ทั้งหมด" || s.position === posFilter;
    return ms && mr && mp;
  });

  // ── Modal helpers ─────────────────────────────────────────────────────────────
  function openAdd() {
    setForm(INITIAL_FORM); setErrors({}); setGlobalErr(""); setShowPw(false); setProvinceId(""); setDistrictId(""); setSubdistrictId(""); setModal("add");
  }
  function openEdit(s: Staff) {
    const parsed = parseThaiLocation(s.address, provinces, districts, subdistricts);
    setEditTarget(s);
    setForm({
      prefix: s.prefix,
      first_name: s.first_name,
      last_name: s.last_name,
      address: "",
      username: s.username,
      password: "",
      phone: s.phone,
      email: s.email,
      position: s.position,
      role: s.role,
      province: parsed.province || "",
      district: parsed.district || "",
      subdistrict: parsed.subdistrict || "",
      detail_address: parsed.detailAddress || s.address,
    });
    setErrors({}); setGlobalErr(""); setShowPw(false);
    setProvinceId(parsed.provinceId || "");
    setDistrictId(parsed.districtId || "");
    setSubdistrictId(parsed.subdistrictId || "");
    setModal("edit");
  }
  function openDelete(s: Staff) { setDeleteTarget(s); setModal("delete"); }
  function openView(s: Staff)   { setViewTarget(s); setModal("view"); }
  function closeModal() { setModal("none"); setEditTarget(null); setDeleteTarget(null); setViewTarget(null); setErrors({}); setGlobalErr(""); }

  function setF(k: keyof StaffForm, v: string) {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k as keyof StaffFormErrors]) setErrors(e => { const n={...e}; delete n[k as keyof StaffFormErrors]; return n; });
    setGlobalErr("");
  }

  function selectProvince(id: string) {
    const province = provinces.find(p => p.id === id)?.name_th ?? "";
    setProvinceId(id);
    setDistrictId("");
    setSubdistrictId("");
    setF("province", province);
    setF("district", "");
    setF("subdistrict", "");
  }

  function selectDistrict(id: string) {
    const district = districts.find(d => d.id === id)?.name_th ?? "";
    setDistrictId(id);
    setSubdistrictId("");
    setF("district", district);
    setF("subdistrict", "");
  }

  function selectSubdistrict(id: string) {
    const subdistrict = subdistricts.find(s => s.id === id)?.name_th ?? "";
    setSubdistrictId(id);
    setF("subdistrict", subdistrict);
  }

  const districtOptions = provinceId ? districts.filter(d => d.province_id === provinceId) : [];
  const subdistrictOptions = districtId ? subdistricts.filter(s => s.district_id === districtId) : [];

  function buildLocation(f: StaffForm) {
    return [
      f.detail_address.trim(),
      f.subdistrict ? `ตำบล${f.subdistrict}` : "",
      f.district ? `อำเภอ${f.district}` : "",
      f.province ? `จังหวัด${f.province}` : "",
    ].filter(Boolean).join(" ");
  }

  function parseThaiLocation(address: string, provinces: ThaiProvince[], districts: ThaiDistrict[], subdistricts: ThaiSubdistrict[]) {
    const normalized = address.replace(/\s+/g, " ").trim();
    const anchors = [
      { key: "subdistrict", labels: ["ตำบล", "ต."] },
      { key: "district", labels: ["อำเภอ", "อ."] },
      { key: "province", labels: ["จังหวัด", "จ."] },
    ] as const;

    const found: { key: "province" | "district" | "subdistrict"; label: string; idx: number }[] = [];
    anchors.forEach(anchor => {
      anchor.labels.forEach(label => {
        const idx = normalized.indexOf(label);
        if (idx !== -1) found.push({ key: anchor.key, label, idx });
      });
    });
    found.sort((a, b) => a.idx - b.idx);

    const result: {
      province?: string;
      provinceId?: string;
      district?: string;
      districtId?: string;
      subdistrict?: string;
      subdistrictId?: string;
      detailAddress?: string;
    } = {};

    if (found.length > 0) {
      result.detailAddress = normalized.slice(0, found[0].idx).trim();
      found.forEach((item, index) => {
        const start = item.idx + item.label.length;
        const end = index + 1 < found.length ? found[index + 1].idx : normalized.length;
        const value = normalized.slice(start, end).trim().replace(/^[^\p{L}\p{M}]*(.*?)[^\p{L}\p{M}]*$/u, "$1");
        if (value) {
          if (item.key === "province") result.province = value;
          if (item.key === "district") result.district = value;
          if (item.key === "subdistrict") result.subdistrict = value;
        }
      });
    }

    const provinceName = result.province?.replace(/^(จังหวัด|จ\.)\s*/u, "").trim();
    if (provinceName) {
      const prov = provinces.find(p => p.name_th === provinceName) || provinces.find(p => provinceName.includes(p.name_th));
      if (prov) {
        result.province = prov.name_th;
        result.provinceId = prov.id;
      }
    }

    const districtName = result.district?.replace(/^(อำเภอ|อ\.)\s*/u, "").trim();
    if (districtName) {
      const dist = districts.find(d => d.name_th === districtName && (!result.provinceId || d.province_id === result.provinceId))
        || districts.find(d => d.name_th.includes(districtName) && (!result.provinceId || d.province_id === result.provinceId));
      if (dist) {
        result.district = dist.name_th;
        result.districtId = dist.id;
        if (!result.provinceId) {
          const prov = provinces.find(p => p.id === dist.province_id);
          if (prov) {
            result.province = prov.name_th;
            result.provinceId = prov.id;
          }
        }
      }
    }

    const subdistrictName = result.subdistrict?.replace(/^(ตำบล|ต\.)\s*/u, "").trim();
    if (subdistrictName) {
      const sub = subdistricts.find(s => s.name_th === subdistrictName && (!result.districtId || s.district_id === result.districtId))
        || subdistricts.find(s => s.name_th.includes(subdistrictName) && (!result.districtId || s.district_id === result.districtId));
      if (sub) {
        result.subdistrict = sub.name_th;
        result.subdistrictId = sub.id;
        if (!result.districtId) {
          const dist = districts.find(d => d.id === sub.district_id);
          if (dist) {
            result.district = dist.name_th;
            result.districtId = dist.id;
            if (!result.provinceId) {
              const prov = provinces.find(p => p.id === dist.province_id);
              if (prov) {
                result.province = prov.name_th;
                result.provinceId = prov.id;
              }
            }
          }
        }
      }
    }

    return result;
  }

  // ── Save ──────────────────────────────────────────────────────────────────────
  async function handleSave() {
    const allEmpty = !form.first_name.trim() && !form.last_name.trim() && !form.username.trim() && !form.email.trim();
    if (allEmpty) { setGlobalErr("กรุณากรอกข้อมูลให้ครบถ้วน"); return; }

    const errs = validate(form, staff, editTarget?.staff_id, modal !== "edit");
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSaving(true);
    try {
      if (modal === "add") {
        const location = buildLocation(form);
        const payload = {
          prefix: form.prefix,
          first_name: form.first_name,
          last_name: form.last_name,
          address: location,
          username: form.username,
          password: form.password,
          phone: form.phone,
          email: form.email,
          position: form.position,
          role: form.role,
        };
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const body = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error((body && body.error) || "ไม่สามารถเพิ่มพนักงานได้");
        }
        setStaff(prev => [{ ...body.user }, ...prev]);
        showToast("เพิ่มพนักงานสำเร็จ");
      } else if (modal === "edit" && editTarget) {
        const location = buildLocation(form);
        const payload: Record<string, string> = { staff_id: editTarget.staff_id, prefix: form.prefix, first_name: form.first_name, last_name: form.last_name, address: location, username: form.username, phone: form.phone, email: form.email, position: form.position, role: form.role };
        if (form.password.trim()) payload.password = form.password;
        const res = await fetch("/api/users", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const body = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error((body && body.error) || "ไม่สามารถบันทึกการแก้ไขได้");
        }
        setStaff(prev => prev.map(s => s.staff_id === editTarget.staff_id ? { ...body.user } : s));
        showToast("บันทึกการแก้ไขสำเร็จ");
      }
      closeModal();
    } catch (error: unknown) {
      console.error("Save user failed:", error);
      setGlobalErr(error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staff_id: deleteTarget.staff_id, username: deleteTarget.username }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error((body && body.error) || "ไม่สามารถลบพนักงานได้");
      }
      setStaff(prev => prev.filter(s => s.staff_id !== deleteTarget.staff_id));
      showToast("ลบพนักงานเรียบร้อย");
      closeModal();
    } catch (error: unknown) {
      console.error("Delete user failed:", error);
      setGlobalErr(error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการลบข้อมูล");
    } finally {
      setSaving(false);
    }
  }

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  const adminCount = staff.filter(s => s.role === "1").length;
  const staffCount = staff.filter(s => s.role === "2").length;

  // ── Avatar initials ───────────────────────────────────────────────────────────
  function avatar(s: Staff) { return s.first_name.charAt(0) + s.last_name.charAt(0); }
  const AVATAR_COLORS = ["#2d6a4f","#1e40af","#9333ea","#c2410c","#0f766e","#be185d"];
  function avatarColor(id: string) { return AVATAR_COLORS[parseInt(id.replace("ST","")) % AVATAR_COLORS.length]; }

  // ─────────────────────────────────────────────────────────────────────────────

  return {
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
  };
}
