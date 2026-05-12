"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SLIDES } from "@/components/data/homeData";
export type HomeProject = {
  id: number;
  name: string;
  desc: string;
  location: string;
  year: string;
  area: string;
  tags: string[];
  g: string;
  image?: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  staff: string;
  quotationFile: string;
  quotationName: string;
};

type ApiProject = {
  id: number;
  name?: string;
  description?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  image?: string;
  staff?: string;
  quotationFile?: string;
  quotationName?: string;
};

export function fmtProjectDate(value: string) {
  if (!value) return "-";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

export function useHomePage() {
  const [scrollY, setScrollY] = useState(0);
  const [slide, setSlide] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allProjectsOpen, setAllProjectsOpen] = useState(false);
  const [allProjectsSearch, setAllProjectsSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [detailProject, setDetailProject] = useState<HomeProject | null>(null);
  const [detailImages, setDetailImages] = useState<string[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailFromAllProjects, setDetailFromAllProjects] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const DURATION = 5000;

  useEffect(() => {
    const onScroll = () => {
      setScrollY(window.scrollY);
      setMobileMenuOpen(false);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("sr-visible");
      }),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".sr").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch("/api/projects");
        if (!res.ok) return;
        const json = await res.json();
        if (Array.isArray(json.projects)) setProjects(json.projects);
      } catch (error) {
        console.error("Load projects failed:", error);
      }
    }
    loadProjects();
  }, []);

  const goTo = useCallback((index: number) => {
    if (transitioning) return;
    setTransitioning(true);
    setProgress(0);
    setTimeout(() => {
      setSlide(index);
      setTransitioning(false);
    }, 450);
  }, [transitioning]);

  const next = useCallback(() => goTo((slide + 1) % SLIDES.length), [goTo, slide]);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(next, DURATION);
      progressRef.current = setInterval(() => {
        setProgress((value) => Math.min(value + 100 / (DURATION / 100), 100));
      }, 100);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [next, playing]);

  const moveGallery = useCallback((direction: -1 | 1) => {
    setGalleryIndex((current) => {
      if (current === null || detailImages.length === 0) return current;
      return (current + direction + detailImages.length) % detailImages.length;
    });
  }, [detailImages.length]);

  useEffect(() => {
    if (!detailProject) return;

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (galleryIndex !== null) {
          setGalleryIndex(null);
          return;
        }
        closeProjectDetail();
      }
      if (galleryIndex !== null && event.key === "ArrowLeft") moveGallery(-1);
      if (galleryIndex !== null && event.key === "ArrowRight") moveGallery(1);
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [detailProject, galleryIndex, moveGallery]);

  const mappedProjects = projects.map((project) => ({
    id: project.id,
    name: project.name ?? "",
    desc: project.description ?? "",
    location: project.location ?? "",
    year: project.startDate ? project.startDate.split("-")[0] : "",
    area: "",
    tags: [],
    g: "linear-gradient(135deg,#d4cfc8,#b0a898)",
    image: project.image ?? "",
    description: project.description ?? "",
    startDate: project.startDate ?? "",
    endDate: project.endDate ?? "",
    status: project.status ?? "",
    staff: project.staff ?? "",
    quotationFile: project.quotationFile ?? "",
    quotationName: project.quotationName ?? "",
  })) as HomeProject[];

  const filteredProjects = mappedProjects.filter((project) => {
    const q = searchQuery.toLowerCase().trim();
    return q === ""
      || project.name.toLowerCase().includes(q)
      || project.location.toLowerCase().includes(q)
      || project.desc.toLowerCase().includes(q);
  });
  const previewProjects = filteredProjects.slice(0, 4);
  const showAllProjectsButton = mappedProjects.length > 0;
  const allProjectsFiltered = mappedProjects.filter((project) => {
    const q = allProjectsSearch.toLowerCase().trim();
    return q === ""
      || project.name.toLowerCase().includes(q)
      || project.location.toLowerCase().includes(q)
      || project.desc.toLowerCase().includes(q)
      || project.staff.toLowerCase().includes(q);
  });

  const togglePlay = () => {
    setPlaying((value) => !value);
    setProgress(0);
  };
  const navScrolled = scrollY > 60;

  async function openProjectDetail(project: HomeProject, fromAllProjects = false) {
    setDetailFromAllProjects(fromAllProjects);
    setDetailProject(project);
    setDetailImages([]);
    setGalleryIndex(null);
    setDetailLoading(true);

    try {
      const res = await fetch(`/api/portfolio?project_id=${project.id}`);
      if (!res.ok) return;
      const json = await res.json();
      if (Array.isArray(json.images)) {
        setDetailImages(json.images.map((img: { image_file: string }) => img.image_file).filter(Boolean));
      }
    } catch (error) {
      console.error("Load portfolio images failed:", error);
    } finally {
      setDetailLoading(false);
    }
  }

  function closeProjectDetail() {
    setDetailProject(null);
    setDetailImages([]);
    setDetailFromAllProjects(false);
    setGalleryIndex(null);
  }

  function openProjectFromAll(project: HomeProject) {
    setAllProjectsOpen(false);
    openProjectDetail(project, true);
  }

  function backToAllProjects() {
    setDetailProject(null);
    setDetailImages([]);
    setGalleryIndex(null);
    setDetailFromAllProjects(false);
    setAllProjectsOpen(true);
  }


  return {
    slide,
    playing,
    progress,
    searchQuery,
    setSearchQuery,
    allProjectsOpen,
    setAllProjectsOpen,
    allProjectsSearch,
    setAllProjectsSearch,
    mobileMenuOpen,
    setMobileMenuOpen,
    detailProject,
    detailImages,
    detailLoading,
    detailFromAllProjects,
    galleryIndex,
    setGalleryIndex,
    filteredProjects,
    previewProjects,
    showAllProjectsButton,
    allProjectsFiltered,
    togglePlay,
    navScrolled,
    goTo,
    moveGallery,
    openProjectDetail,
    closeProjectDetail,
    openProjectFromAll,
    backToAllProjects,
  };
}
