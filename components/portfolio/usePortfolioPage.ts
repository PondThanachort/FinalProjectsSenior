"use client";

import { useState, useRef, useCallback, useEffect, type ChangeEvent, type DragEvent } from "react";

// ── Types (ตรงกับ DB Schema) ────────────────────────────────────────────────────
interface PortfolioImage {
  image_id:    number;
  project_id:  number;
  image_file:  string;   // base64 หรือ URL
  image_name:  string;   // ชื่อไฟล์
  upload_date: string;   // YYYY-MM-DD
  created_by:  string;   // FK → staff
}

type PortfolioApiImage = Omit<PortfolioImage, "image_name"> & {
  image_name?: string;
};

interface FormState {
  project_id:  string;
  created_by:  string;
  files:       UploadFile[];
}

interface UploadFile {
  id:      number;
  name:    string;
  size:    number;
  preview: string;
  error:   string;
  file:    File;  // เพิ่ม File object
}

interface FormErrors {
  project_id?:  string;
  files?:       string;
  created_by?:  string;
}

// ── Constants ──────────────────────────────────────────────────────────────────
export const MAX_FILE_SIZE_LABEL = "50MB";
const MAX_FILE_SIZE    = 50 * 1024 * 1024;
const ALLOWED_TYPES    = ["image/jpeg", "image/jpg", "image/png"];
const ALLOWED_EXT      = [".jpg", ".jpeg", ".png"];

// ── Mock Data ──────────────────────────────────────────────────────────────────
export function gradientBg(id: number) {
  const gs = [
    "linear-gradient(135deg,#d4cfc8,#b0a898)",
    "linear-gradient(135deg,#f97316,#ea580c)",
    "linear-gradient(135deg,#1e3f6b,#162d4e)",
    "linear-gradient(135deg,#6b4020,#4e2e10)",
    "linear-gradient(135deg,#2e2e50,#1e1e38)",
    "linear-gradient(135deg,#3b6b3b,#2d4f2d)",
  ];
  return gs[id % gs.length];
}

let _fileId = 0;

export function fmtDate(iso: string) {
  if (!iso) return "-";
  const [y,m,d] = iso.split("-");
  const months = ["","ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
  return `${parseInt(d)} ${months[parseInt(m)]} ${parseInt(y)+543}`;
}
export function fmtSize(bytes: number) {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024*1024)   return `${(bytes/1024).toFixed(1)} KB`;
  return `${(bytes/1024/1024).toFixed(1)} MB`;
}

export function portfolioImageSrc(imageFile: string) {
  const value = String(imageFile ?? "").trim().replace(/\\/g, "/");
  if (!value) return "";
  if (value.startsWith("data:") || value.startsWith("blob:") || /^https?:\/\//.test(value)) return value;
  if (value.startsWith("/")) return value;
  if (value.startsWith("portfolio/")) return `/${value}`;
  return `/portfolio/${value}`;
}

// ── Validate file ──────────────────────────────────────────────────────────────
function validateFile(file: File): string {
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXT.includes(ext)) {
    return "รองรับเฉพาะไฟล์ JPG และ PNG เท่านั้น";
  }
  if (file.size > MAX_FILE_SIZE) {
    return `ไฟล์ใหญ่เกินไป กรุณาเลือกไฟล์ไม่เกิน ${MAX_FILE_SIZE_LABEL}`;
  }
  return "";
}

// ── Validate form ──────────────────────────────────────────────────────────────
function validateForm(f: FormState, isEdit: boolean): FormErrors {
  const e: FormErrors = {};
  if (!f.project_id) e.project_id = "กรุณากรอกข้อมูลให้ครบถ้วน (เลือกโครงการ)";
  if (!f.created_by) e.created_by = "กรุณากรอกข้อมูลให้ครบถ้วน (เลือกผู้อัปโหลด)";
  if (!isEdit && f.files.length === 0) e.files = "กรุณากรอกข้อมูลให้ครบถ้วน (เลือกรูปภาพ)";
  if (!isEdit && f.files.length > 0 && f.files.every(fi => fi.error)) {
    e.files = "ไม่มีไฟล์ที่ถูกต้อง กรุณาเลือกไฟล์ใหม่";
  }
  return e;
}

interface ApiProject {
  id: number;
  name: string;
}

interface ApiStaff {
  staff_id: string;
  first_name: string;
  last_name: string;
  prefix?: string;
  address?: string;
  username?: string;
  phone?: string;
  email?: string;
  position?: string;
  role?: string;
}

// ─────────────────────────────────────────────────────────────────────────────

export function usePortfolioPage() {
  const [images,           setImages]           = useState<PortfolioImage[]>([]);
  const [projFilter,       setProjFilter]       = useState("ทั้งหมด");
  const [view,             setView]             = useState<"grid"|"list">("grid");
  const [modal,            setModal]            = useState<"none"|"add"|"edit"|"delete"|"lightbox">("none");
  const [editTarget,       setEditTarget]       = useState<PortfolioImage | null>(null);
  const [deleteTarget,     setDeleteTarget]     = useState<PortfolioImage | null>(null);
  const [lightboxImg,      setLightboxImg]      = useState<PortfolioImage | null>(null);
  const [form,             setForm]             = useState<FormState>({ project_id:"", created_by:"", files:[] });
  const [errors,           setErrors]           = useState<FormErrors>({});
  const [globalErr,        setGlobalErr]        = useState("");
  const [saving,           setSaving]           = useState(false);
  const [toast,            setToast]            = useState("");
  const [isDragging,       setIsDragging]       = useState(false);
  const [projectsOptions,  setProjectsOptions]  = useState<ApiProject[]>([]);
  const [staffOptions,     setStaffOptions]     = useState<ApiStaff[]>([]);
  const [,                 setLoadingData]      = useState(true);
  const [isSelectMode,     setIsSelectMode]     = useState(false);
  const [selectedIds,      setSelectedIds]      = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Load Projects, Staff and Portfolio Images from API ──────────────────────
  useEffect(() => {
    async function loadData() {
      try {
        setLoadingData(true);
        const [projectsRes, usersRes, portfolioRes] = await Promise.all([
          fetch("/api/projects"),
          fetch("/api/users"),
          fetch("/api/portfolio"),
        ]);

        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          if (projectsData.projects && Array.isArray(projectsData.projects)) {
            setProjectsOptions(projectsData.projects);
          }
        } else {
          console.error("Failed to load projects:", projectsRes.status, await projectsRes.text());
        }

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          if (usersData.users && Array.isArray(usersData.users)) {
            setStaffOptions(usersData.users);
          }
        } else {
          console.error("Failed to load staff:", usersRes.status, await usersRes.text());
        }

        if (portfolioRes.ok) {
          const portfolioData = await portfolioRes.json();
          if (portfolioData.images && Array.isArray(portfolioData.images)) {
            // Convert API data to match our interface
            const convertedImages = (portfolioData.images as PortfolioApiImage[]).map((img) => ({
              ...img,
              image_name: img.image_file, // Use image_file as image_name for display
            }));
            setImages(convertedImages);
          }
        } else {
          console.error("Failed to load portfolio images:", portfolioRes.status, await portfolioRes.text());
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoadingData(false);
      }
    }

    loadData();
  }, []);

  // ── Filter ───────────────────────────────────────────────────────────────────
  const filtered = images.filter(img => {
    const proj = projectsOptions.find(p=>p.id===img.project_id);
    const mp   = projFilter === "ทั้งหมด" || proj?.name === projFilter;
    return mp;
  });

  // ── Group by project ──────────────────────────────────────────────────────────
  const selectedVisibleCount = filtered.reduce((count, img) => count + (selectedIds.has(img.image_id) ? 1 : 0), 0);

  const groupedByProject = projectsOptions.map(p => ({
    project: p,
    images: filtered.filter(img => img.project_id === p.id),
  })).filter(g => g.images.length > 0);

  // ── File processing ───────────────────────────────────────────────────────────
  function processFiles(rawFiles: FileList | File[]) {
    const arr = Array.from(rawFiles);
    const processed: UploadFile[] = arr.map(f => {
      const err = validateFile(f);
      const preview = !err ? URL.createObjectURL(f) : "";
      return { id: ++_fileId, name: f.name, size: f.size, preview, error: err, file: f };
    });
    setForm(prev => ({ ...prev, files: [...prev.files, ...processed] }));
    if (processed.some(f => f.error)) {
      setErrors(e => ({ ...e, files: undefined }));
    } else {
      setErrors(e => { const n={...e}; delete n.files; return n; });
    }
    setGlobalErr("");
  }

  function handleFileInput(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) processFiles(e.target.files);
    e.target.value = "";
  }

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
  }, []);

  function removeFile(id: number) {
    setForm(prev => ({ ...prev, files: prev.files.filter(f => f.id !== id) }));
  }

  // ── Modal helpers ─────────────────────────────────────────────────────────────
  function openAdd() {
    setForm({ project_id:"", created_by:"", files:[] });
    setErrors({}); setGlobalErr(""); setModal("add");
  }
  function openEdit(img: PortfolioImage) {
    setEditTarget(img);
    setForm({ project_id: String(img.project_id), created_by: img.created_by, files:[] });
    setErrors({}); setGlobalErr(""); setModal("edit");
  }
  function openDelete(img: PortfolioImage) { setDeleteTarget(img); setModal("delete"); }
  function openLightbox(img: PortfolioImage) { setLightboxImg(img); setModal("lightbox"); }
  function closeModal() {
    setModal("none"); setEditTarget(null); setDeleteTarget(null); setLightboxImg(null);
    setErrors({}); setGlobalErr("");
  }

  function toggleSelectMode() {
    setIsSelectMode(!isSelectMode);
    setSelectedIds(new Set());
  }

  function toggleSelectImage(imageId: number) {
    const newSet = new Set(selectedIds);
    if (newSet.has(imageId)) {
      newSet.delete(imageId);
    } else {
      newSet.add(imageId);
    }
    setSelectedIds(newSet);
  }

  function selectAllFiltered() {
    const allIds = new Set(filtered.map(img => img.image_id));
    setSelectedIds(allIds);
  }

  function clearAllSelected() {
    setSelectedIds(new Set());
  }

  useEffect(() => {
    if (!isSelectMode) return;

    const filteredIdSet = new Set(filtered.map((img) => img.image_id));
    setSelectedIds((prev) => {
      const next = new Set(Array.from(prev).filter((id) => filteredIdSet.has(id)));
      const unchanged = next.size === prev.size && Array.from(next).every((id) => prev.has(id));
      return unchanged ? prev : next;
    });
  }, [filtered, isSelectMode]);


  async function handleDeleteMultiple() {
    if (selectedIds.size === 0) return;
    setSaving(true);
    try {
      const ids = Array.from(selectedIds).join(",");
      const response = await fetch(`/api/portfolio?ids=${ids}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        showToast(error.error || "ไม่สามารถลบภาพได้");
        setSaving(false);
        return;
      }

      setImages(prev => prev.filter(img => !selectedIds.has(img.image_id)));
      setSelectedIds(new Set());
      setIsSelectMode(false);
      showToast(`ลบ ${selectedIds.size} ภาพผลงานเรียบร้อย`);
    } catch (error) {
      console.error("Delete error:", error);
      showToast("เกิดข้อผิดพลาดในการลบภาพ");
    } finally {
      setSaving(false);
    }
  }

  function setF(k: keyof Omit<FormState,"files">, v: string) {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => { const n={...e}; delete n[k as keyof FormErrors]; return n; });
    setGlobalErr("");
  }

  // ── Save ──────────────────────────────────────────────────────────────────────
  async function handleSave() {
    const isEdit = modal === "edit";
    const allEmpty = !form.project_id && !form.created_by && form.files.length === 0;
    if (allEmpty) { setGlobalErr("กรุณากรอกข้อมูลให้ครบถ้วน"); return; }

    const errs = validateForm(form, isEdit);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    // ตรวจว่าไฟล์ที่ valid มีอย่างน้อย 1
    const validFiles = form.files.filter(f => !f.error);
    if (!isEdit && validFiles.length === 0 && form.files.length > 0) {
      setErrors(e => ({ ...e, files: "ไม่มีไฟล์ที่ถูกต้อง กรุณาเลือกไฟล์ใหม่" }));
      return;
    }

    setSaving(true);
    setGlobalErr("");
    let shouldClose = false;

    try {
      if (isEdit && editTarget) {
        const response = await fetch("/api/portfolio", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image_id: editTarget.image_id,
            project_id: Number(form.project_id),
            created_by: form.created_by,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.error || "Update failed");
        }

        const result = await response.json();
        const updatedImage = {
          ...result.image,
          image_name: result.image.image_file,
        };

        setImages(prev => prev.map(img => img.image_id === editTarget.image_id ? updatedImage : img));
        shouldClose = true;
        showToast("บันทึกการแก้ไขสำเร็จ");
      } else {
        // Upload each valid file
        const uploadPromises = validFiles.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file.file); // The actual File object
          formData.append("project_id", form.project_id);
          formData.append("created_by", form.created_by);

          const response = await fetch("/api/portfolio", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Upload failed");
          }

          return await response.json();
        });

        const results = await Promise.all(uploadPromises);

        // Add uploaded images to state
        const newImages = results.map(result => ({
          ...result.image,
          image_name: result.image.image_file, // For display consistency
        }));

        setImages(prev => [...newImages, ...prev]);
        shouldClose = true;
        showToast(`อัปโหลด ${validFiles.length} ภาพสำเร็จ`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setGlobalErr(error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการอัปโหลด");
    } finally {
      setSaving(false);
      if (shouldClose) closeModal();
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/portfolio?ids=${deleteTarget.image_id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        showToast(error.error || "ไม่สามารถลบภาพได้");
        setSaving(false);
        return;
      }

      setImages(prev => prev.filter(img => img.image_id !== deleteTarget.image_id));
      closeModal();
      showToast("ลบภาพผลงานเรียบร้อย");
    } catch (error) {
      console.error("Delete error:", error);
      showToast("เกิดข้อผิดพลาดในการลบภาพ");
    } finally {
      setSaving(false);
    }
  }

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  const kpiTotal    = images.length;
  const kpiProjects = new Set(images.map(img => img.project_id)).size;

  // ─────────────────────────────────────────────────────────────────────────────

  return {
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
    toast,
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
  };
}
