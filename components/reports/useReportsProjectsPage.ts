"use client";

import { useEffect, useMemo, useState } from "react";
import type { Project } from "@/components/data/adminProjectsData";
type PortfolioImage = {
  image_id: number;
  project_id: number;
  image_file: string;
};

export type SortKey = "id" | "name" | "status" | "images" | "startDate";

export const ALL = "ทั้งหมด";

export function formatDate(value: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function csvValue(value: string | number) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function projectInDateRange(project: Project, dateFrom: string, dateTo: string) {
  const start = project.startDate || "";
  const end = project.endDate || start;
  if (dateFrom && end && end < dateFrom) return false;
  if (dateTo && start && start > dateTo) return false;
  return true;
}

export function getQuotationName(project: Project) {
  if (project.quotationName) return project.quotationName;
  if (!project.quotationFile) return "-";
  return decodeURIComponent(project.quotationFile.split("/").pop() || project.quotationFile);
}

export function useReportsProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("id");
  const [view, setView] = useState<"table" | "grid">("table");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [detailTarget, setDetailTarget] = useState<Project | null>(null);
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);

  useEffect(() => {
    async function loadReportData() {
      try {
        setLoading(true);
        setLoadError("");

        const [projectRes, portfolioRes] = await Promise.all([
          fetch("/api/projects"),
          fetch("/api/portfolio"),
        ]);

        if (!projectRes.ok) {
          const body = await projectRes.json().catch(() => null);
          throw new Error(body?.error || "ไม่สามารถโหลดข้อมูลโครงการได้");
        }
        if (!portfolioRes.ok) {
          const body = await portfolioRes.json().catch(() => null);
          throw new Error(body?.error || "ไม่สามารถโหลดภาพผลงานได้");
        }

        const projectJson = await projectRes.json();
        const portfolioJson = await portfolioRes.json();
        const rows: Project[] = Array.isArray(projectJson.projects) ? projectJson.projects : [];
        const images: PortfolioImage[] = Array.isArray(portfolioJson.images) ? portfolioJson.images : [];
        const imagesByProject = images.reduce<Record<number, string[]>>((acc, image) => {
          const projectId = Number(image.project_id);
          if (!acc[projectId]) acc[projectId] = [];
          if (image.image_file) acc[projectId].push(image.image_file);
          return acc;
        }, {});

        setProjects(rows.map((project) => ({
          ...project,
          portfolioImages: imagesByProject[project.id] ?? [],
        })));
      } catch (error) {
        console.error("Load project report failed:", error);
        setLoadError(error instanceof Error ? error.message : "ไม่สามารถโหลดรายงานได้");
      } finally {
        setLoading(false);
      }
    }

    loadReportData();
  }, []);

  const statuses = useMemo(() => {
    const values = Array.from(new Set(projects.map((project) => project.status).filter(Boolean)));
    return [ALL, ...values];
  }, [projects]);

  const filtered = useMemo(() => {
    return projects
      .filter((project) => {
        const q = search.trim().toLowerCase();
        const matchSearch = !q
          || project.name.toLowerCase().includes(q)
          || project.location.toLowerCase().includes(q)
          || project.staff.toLowerCase().includes(q)
          || project.description.toLowerCase().includes(q);
        const matchStatus = statusFilter === ALL || project.status === statusFilter;
        const matchDate = projectInDateRange(project, dateFrom, dateTo);
        return matchSearch && matchStatus && matchDate;
      })
      .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name, "th");
        if (sortBy === "status") return a.status.localeCompare(b.status, "th");
        if (sortBy === "images") return (b.portfolioImages?.length ?? 0) - (a.portfolioImages?.length ?? 0);
        if (sortBy === "startDate") return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        return b.id - a.id;
      });
  }, [dateFrom, dateTo, projects, search, sortBy, statusFilter]);

  const doneCount = filtered.filter((project) => project.status === "เสร็จสิ้น").length;
  const totalImages = filtered.reduce((sum, project) => sum + (project.portfolioImages?.length ?? 0), 0);
  const inProgressCount = filtered.filter((project) => project.status === "กำลังดำเนินการ").length;
  const detailImages = detailTarget?.portfolioImages ?? [];
  const quotationFile = detailTarget?.quotationFile ?? "";
  const quotationName = detailTarget?.quotationName || (quotationFile ? decodeURIComponent(quotationFile.split("/").pop() || "") : "");
  const quotationExtension = quotationFile.split(".").pop()?.toLowerCase() ?? "";
  const isQuotationImage = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(quotationExtension);
  const isQuotationPdf = quotationExtension === "pdf";

  function openDetail(project: Project) {
    setDetailTarget(project);
    setGalleryIndex(null);
  }

  function closeDetail() {
    setDetailTarget(null);
    setGalleryIndex(null);
  }

  function moveGallery(direction: -1 | 1) {
    if (galleryIndex === null || detailImages.length === 0) return;
    setGalleryIndex((galleryIndex + direction + detailImages.length) % detailImages.length);
  }

  function exportCsv() {
    const rows = [
      ["รหัส", "โครงการ", "สถานที่", "ผู้รับผิดชอบ", "สถานะ", "วันที่เริ่ม", "วันที่สิ้นสุด", "ใบเสนอราคา", "จำนวนภาพ"],
      ...filtered.map((project) => [
        project.id,
        project.name,
        project.location,
        project.staff,
        project.status,
        project.startDate,
        project.endDate,
        getQuotationName(project),
        project.portfolioImages?.length ?? 0,
      ]),
    ];
    const csv = rows.map((row) => row.map(csvValue).join(",")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "project-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  }


  return {
    projects,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    sortBy,
    setSortBy,
    view,
    setView,
    loading,
    loadError,
    detailTarget,
    galleryIndex,
    setGalleryIndex,
    statuses,
    filtered,
    doneCount,
    totalImages,
    inProgressCount,
    detailImages,
    quotationFile,
    quotationName,
    isQuotationImage,
    isQuotationPdf,
    openDetail,
    closeDetail,
    moveGallery,
    exportCsv,
  };
}
