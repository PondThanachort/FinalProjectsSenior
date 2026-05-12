"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import type { Project, FormErrors } from "@/components/data/adminProjectsData";
import { EMPTY_FORM, PROJECT_STATUSES, validateForm } from "@/components/data/adminProjectsData";

type ThaiProvince = { id: string; name_th: string };
type ThaiDistrict = { id: string; province_id: string; name_th: string };
type ThaiSubdistrict = { id: string; district_id: string; name_th: string };
type StaffOptionUser = { first_name?: string; last_name?: string };
type ThaiProvinceJson = { id: string | number; name_th: string };
type ThaiDistrictJson = { id: string | number; province_id: string | number; name_th: string };
type ThaiSubdistrictJson = { id: string | number; district_id: string | number; name_th: string };

const MAX_PROJECT_UPLOAD_SIZE = 50 * 1024 * 1024;
const FILE_TOO_LARGE_MESSAGE = "ไฟล์ใหญ่เกินไป กรุณาเลือกไฟล์ไม่เกิน 50MB";

export function useProjectsPage() {
  const [projects,    setProjects]   = useState<Project[]>([]);
  const [search,      setSearch]     = useState("");
  const [statFilter,  setStatFilter] = useState("ทั้งหมด");
  const [view,        setView]       = useState<"grid"|"table">("grid");
  const [loading,     setLoading]    = useState(true);
  const [loadError,   setLoadError]  = useState("");

  // Modal state
  const [modal,       setModal]      = useState<"none"|"add"|"edit"|"delete"|"detail">("none");
  const [editTarget,  setEditTarget] = useState<Project | null>(null);
  const [deleteTarget,setDeleteTarget] = useState<Project | null>(null);
  const [detailTarget,setDetailTarget] = useState<Project | null>(null);
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
  const [form,        setForm]       = useState<Omit<Project,"id">>(EMPTY_FORM);
  const [errors,      setErrors]     = useState<FormErrors>({});
  const [globalError, setGlobalError] = useState("");
  const [saving,      setSaving]     = useState(false);
  const [successMsg,  setSuccessMsg] = useState("");
  const [staffOptions, setStaffOptions] = useState<string[]>([]);
  const [provinces,   setProvinces]  = useState<ThaiProvince[]>([]);
  const [districts,   setDistricts]  = useState<ThaiDistrict[]>([]);
  const [subdistricts,setSubdistricts]= useState<ThaiSubdistrict[]>([]);
  const [provinceId,  setProvinceId]  = useState("");
  const [districtId,  setDistrictId]  = useState("");
  const [subdistrictId,setSubdistrictId]= useState("");
  const [detailAddress, setDetailAddress] = useState("");

  const fileRef = useRef<HTMLInputElement>(null);
  const quotationRef = useRef<HTMLInputElement>(null);

  // ── Format date for input[type="date"] ─────────────────────────────────────
  function formatDateForInput(dateVal: unknown): string {
    if (!dateVal) return "";
    
    try {
      let date: Date | null = null;
      
      // If it's already a Date object
      if (dateVal instanceof Date) {
        date = dateVal;
      }
      // If it's a number (timestamp)
      else if (typeof dateVal === "number") {
        date = new Date(dateVal);
      }
      // If it's a string
      else if (typeof dateVal === "string") {
        // Try parsing as ISO or MySQL format
        date = new Date(dateVal);
      }
      
      if (date && !isNaN(date.getTime())) {
        // Format as YYYY-MM-DD using local timezone
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      }
    } catch (e) {
      console.error("formatDateForInput error:", e, dateVal);
    }
    
    return "";
  }

  // ── Filtered ────────────────────────────────────────────────────────────────
  const filtered = projects.filter(p => {
    const q  = search.toLowerCase();
    const ms = !q || p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    const mx = statFilter === "ทั้งหมด" || p.status === statFilter;
    return ms && mx;
  });

  // ── Open modals ──────────────────────────────────────────────────────────────
  function openAdd() {
    setForm(EMPTY_FORM); setErrors({}); setGlobalError(""); setProvinceId(""); setDistrictId(""); setSubdistrictId(""); setDetailAddress(""); setModal("add");
  }
  function openEdit(p: Project) {
    setEditTarget(p);
    setForm({ 
      name:p.name, 
      description:p.description, 
      location:p.location, 
      startDate: formatDateForInput(p.startDate), 
      endDate: formatDateForInput(p.endDate), 
      status:p.status, 
      image:p.image, 
      quotationFile:p.quotationFile, 
      quotationName:p.quotationName, 
      staff:p.staff 
    });
    setErrors({}); setGlobalError(""); setProvinceId(""); setDistrictId(""); setSubdistrictId(""); setDetailAddress(""); setModal("edit");
  }
  function openDelete(p: Project) { setDeleteTarget(p); setModal("delete"); }
  function openDetail(p: Project) { setDetailTarget(p); setGalleryIndex(null); setModal("detail"); }
  function closeModal() { setModal("none"); setEditTarget(null); setDeleteTarget(null); setDetailTarget(null); setGalleryIndex(null); setErrors({}); setGlobalError(""); }

  // ── Form field handler ───────────────────────────────────────────────────────
  function handleField(field: keyof Omit<Project,"id">, value: string) {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field as keyof FormErrors]) setErrors(e => ({ ...e, [field]: undefined }));
    setGlobalError("");
  }

  // ── Image upload ─────────────────────────────────────────────────────────────
  function handleImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_PROJECT_UPLOAD_SIZE) {
      setErrors(prev => ({ ...prev, image: FILE_TOO_LARGE_MESSAGE }));
      setGlobalError("");
      e.target.value = "";
      return;
    }
    const projectName = form.name.trim();
    if (!projectName) {
      setErrors(prev => ({ ...prev, name: "กรุณากรอกชื่อโครงการก่อนอัปโหลดไฟล์" }));
      setGlobalError("กรุณากรอกชื่อโครงการก่อนอัปโหลดไฟล์");
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("projectName", projectName);

    fetch("/api/upload", {
      method: "POST",
      body: formData,
    })
      .then(res => res.json())
      .then(result => {
        if (result.url) {
          setForm(f => ({ ...f, image: result.url }));
          if (errors.image) setErrors(e => ({ ...e, image: undefined }));
          setGlobalError("");
        } else {
          setErrors(e => ({ ...e, image: result.error === "File too large" ? FILE_TOO_LARGE_MESSAGE : result.error }));
          console.error("Upload failed:", result.error);
        }
      })
      .catch(error => {
        console.error("Upload error:", error);
      });
  }

  function handleQuotationFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_PROJECT_UPLOAD_SIZE) {
      setErrors(prev => ({ ...prev, quotationFile: FILE_TOO_LARGE_MESSAGE }));
      setGlobalError("");
      e.target.value = "";
      return;
    }
    const projectName = form.name.trim();
    if (!projectName) {
      setErrors(prev => ({ ...prev, name: "กรุณากรอกชื่อโครงการก่อนอัปโหลดไฟล์" }));
      setGlobalError("กรุณากรอกชื่อโครงการก่อนอัปโหลดไฟล์");
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("projectName", projectName);

    fetch("/api/upload", {
      method: "POST",
      body: formData,
    })
      .then(res => res.json())
      .then(result => {
        if (result.url) {
          setForm(f => ({
            ...f,
            quotationFile: result.url,
            quotationName: file.name,
          }));
          if (errors.quotationFile) setErrors(e => ({ ...e, quotationFile: undefined }));
          setGlobalError("");
        } else {
          setErrors(e => ({
            ...e,
            quotationFile: result.error === "File too large" ? FILE_TOO_LARGE_MESSAGE : result.error,
          }));
          console.error("Upload failed:", result.error);
        }
      })
      .catch(error => {
        console.error("Upload error:", error);
      });
  }

  const [portfolioImages, setPortfolioImages] = useState<Record<number, string[]>>({});

  function buildLocation() {
    try {
      return [
        detailAddress.trim(),
        subdistrictId ? `ตำบล${subdistricts.find(s => s.id === subdistrictId)?.name_th ?? ""}` : "",
        districtId ? `อำเภอ${districts.find(d => d.id === districtId)?.name_th ?? ""}` : "",
        provinceId ? `จังหวัด${provinces.find(p => p.id === provinceId)?.name_th ?? ""}` : "",
      ].filter(Boolean).join(" ");
    } catch (error) {
      console.error("Error building location:", error);
      return "";
    }
  }

  async function loadPortfolioImages(projectId: number) {
    try {
      const res = await fetch(`/api/portfolio?project_id=${projectId}`);
      if (!res.ok) {
        console.error("Failed to load portfolio images for project", projectId);
        return;
      }
      const json = await res.json();
      if (Array.isArray(json.images)) {
        const imageFiles = json.images.map((img: { image_file: string }) => img.image_file);
        setPortfolioImages(prev => {
          if (!prev) {
            console.error("Previous state is undefined");
            return { [projectId]: imageFiles };
          }
          return { ...prev, [projectId]: imageFiles };
        });
        setProjects(prev => prev.map(project => project.id === projectId ? { ...project, portfolioImages: imageFiles } : project));
        setDetailTarget(prev => prev && prev.id === projectId ? { ...prev, portfolioImages: imageFiles } : prev);
      } else {
        console.error("Invalid response format for portfolio images:", json);
      }
    } catch (error) {
      console.error("Error loading portfolio images:", error);
    }
  }

  function selectProvince(id: string) {
    setProvinceId(id);
    setDistrictId("");
    setSubdistrictId("");
    if (!id) {
      console.error("Province ID is empty");
    }
  }

  function selectDistrict(id: string) {
    setDistrictId(id);
    setSubdistrictId("");
    if (!id) {
      console.error("District ID is empty");
    }
  }

  function selectSubdistrict(id: string) {
    setSubdistrictId(id);
    if (!id) {
      console.error("Subdistrict ID is empty");
    }
  }

  const districtOptions = provinceId ? districts.filter(d => d.province_id === provinceId) : [];
  const subdistrictOptions = districtId ? subdistricts.filter(s => s.district_id === districtId) : [];
  const detailImages = detailTarget?.portfolioImages ?? [];
  const quotationFile = detailTarget?.quotationFile ?? "";
  const quotationName =
    detailTarget?.quotationName ||
    (quotationFile ? decodeURIComponent(quotationFile.split("/").pop() || "") : "");
  const quotationExtension = quotationFile.split(".").pop()?.toLowerCase() ?? "";
  const isQuotationImage = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(quotationExtension);
  const isQuotationPdf = quotationExtension === "pdf";

  function openGallery(index: number) {
    setGalleryIndex(index);
  }

  function closeGallery() {
    setGalleryIndex(null);
  }

  function moveGallery(direction: -1 | 1) {
    if (galleryIndex === null || detailImages.length === 0) return;
    setGalleryIndex((galleryIndex + direction + detailImages.length) % detailImages.length);
  }

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch("/api/projects");
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error((body && body.error) || res.statusText || "Fetch error");
        }
        const data = await res.json();
        setProjects(Array.isArray(data.projects) ? data.projects : []);
      } catch (error) {
        console.error("Load projects failed:", error);
        setLoadError(error instanceof Error ? error.message : "ไม่สามารถโหลดข้อมูลโครงการได้");
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  useEffect(() => {
    async function loadStaffOptions() {
      try {
        const res = await fetch("/api/users");
        if (!res.ok) {
          throw new Error("Failed to load staff options");
        }
        const data: { users?: StaffOptionUser[] } = await res.json();
        const names = Array.isArray(data.users)
          ? data.users
              .map((user) => `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim())
              .filter(Boolean)
          : [];
        setStaffOptions(names);
      } catch (error) {
        console.error("Load staff options failed:", error);
      }
    }

    loadStaffOptions();
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
          throw new Error("Could not load Thai address JSON files");
        }
        const [provData, distData, subData]: [ThaiProvinceJson[], ThaiDistrictJson[], ThaiSubdistrictJson[]] = await Promise.all([
          provRes.json(),
          distRes.json(),
          subRes.json(),
        ]);

        setProvinces(Array.isArray(provData) ? provData.map((item) => ({ id: String(item.id), name_th: item.name_th })) : []);
        setDistricts(Array.isArray(distData) ? distData.map((item) => ({ id: String(item.id), province_id: String(item.province_id), name_th: item.name_th })) : []);
        setSubdistricts(Array.isArray(subData) ? subData.map((item) => ({ id: String(item.id), district_id: String(item.district_id), name_th: item.name_th })) : []);
      } catch (error) {
        console.error("Load Thai address data failed:", error);
      }
    }

    loadThaiAddressData();
  }, []);

  useEffect(() => {
    projects.forEach(project => {
      if (!portfolioImages[project.id]) {
        loadPortfolioImages(project.id);
      }
    });
  }, [projects, portfolioImages]);

  useEffect(() => {
    if (galleryIndex === null) return;

    function handleGalleryKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeGallery();
      if (event.key === "ArrowLeft") {
        setGalleryIndex((current) => current === null ? current : (current - 1 + detailImages.length) % detailImages.length);
      }
      if (event.key === "ArrowRight") {
        setGalleryIndex((current) => current === null ? current : (current + 1) % detailImages.length);
      }
    }

    window.addEventListener("keydown", handleGalleryKey);
    return () => window.removeEventListener("keydown", handleGalleryKey);
  }, [galleryIndex, detailImages.length]);

  // ── Save ─────────────────────────────────────────────────────────────────────
  async function handleSave() {
    const computedLocation = modal === "add" ? buildLocation() : form.location;
    const saveForm = modal === "add" ? { ...form, location: computedLocation } : form;
    const errs = validateForm(saveForm);

    // Exception 1: ข้อมูลว่างทั้งหมด
    const allEmpty = !saveForm.name.trim() && !saveForm.description.trim() && !saveForm.location.trim() && !saveForm.startDate && !saveForm.endDate;
    if (allEmpty) { setGlobalError("กรุณากรอกข้อมูลให้ครบถ้วน"); return; }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);

    if (modal === "add") {
      try {
        const payload = {
          name: saveForm.name,
          description: saveForm.description,
          location: saveForm.location,
          startDate: saveForm.startDate,
          endDate: saveForm.endDate,
          status: saveForm.status,
          quotationFile: saveForm.quotationFile,
          quotationName: saveForm.quotationName,
          staff: saveForm.staff,
          image: saveForm.image,
        };

        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (!res.ok) {
          throw new Error(result?.error || "ไม่สามารถบันทึกข้อมูลได้");
        }
        const created = result.project;
        const newId = typeof created?.id === "number"
          ? created.id
          : Math.max(0, ...projects.map(p => p.id)) + 1;

        setProjects(prev => ([{ id: newId, ...saveForm }, ...prev]));
        setSuccessMsg("เพิ่มโครงการสำเร็จแล้ว");
      } catch (error) {
        setGlobalError(error instanceof Error ? error.message : "ไม่สามารถบันทึกข้อมูลได้");
        setSaving(false);
        return;
      }
    } else if (modal === "edit" && editTarget) {
      try {
        const payload = {
          id: editTarget.id,
          name: form.name,
          description: form.description,
          location: form.location,
          startDate: form.startDate,
          endDate: form.endDate,
          status: form.status,
          image: form.image,
          quotationFile: form.quotationFile,
          quotationName: form.quotationName,
          staff: form.staff,
        };

        const res = await fetch("/api/projects", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (!res.ok) {
          throw new Error(result?.error || "ไม่สามารถแก้ไขข้อมูลได้");
        }
        setProjects(prev => prev.map(p => p.id === editTarget.id ? { ...p, ...form } : p));
        setSuccessMsg("บันทึกการแก้ไขสำเร็จแล้ว");
      } catch (error) {
        setGlobalError(error instanceof Error ? error.message : "ไม่สามารถแก้ไขข้อมูลได้");
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    closeModal();
    setTimeout(() => setSuccessMsg(""), 3000);
  }

  // ── Delete ───────────────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteTarget) return;
    setSaving(true);
    setGlobalError("");

    try {
      const res = await fetch(`/api/projects?id=${encodeURIComponent(deleteTarget.id)}`, {
        method: "DELETE",
      });
      const data: { error?: string } = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "ไม่สามารถลบโครงการได้");
      }

      setProjects(prev => prev.filter(p => p.id !== deleteTarget.id));
      closeModal();
    setSuccessMsg("ลบโครงการเรียบร้อยแล้ว");
    setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error) {
      setGlobalError(error instanceof Error ? error.message : "ไม่สามารถลบโครงการได้");
    } finally {
      setSaving(false);
    }
  }

  const statuses = ["ทั้งหมด", ...PROJECT_STATUSES];

  // ─────────────────────────────────────────────────────────────────────────────
  return {
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
    editTarget,
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
  };
}
