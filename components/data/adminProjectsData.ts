// components/data/adminProjectsData.ts
// ข้อมูลและฟังก์ชัน static สำหรับหน้าจัดการโครงการ (admin projects)

export interface Project {
  id:              number;
  name:            string;
  description:     string;
  location:        string;
  startDate:       string;
  endDate:         string;
  status:          string;
  type?:           string;
  area?:           string;
  budget?:         string;
  image:           string;
  quotationFile:   string;
  quotationName:   string;
  staff:           string;
  portfolioImages?: string[]; // Array of portfolio image URLs
}

export interface FormErrors {
  name?:        string;
  description?: string;
  location?:    string;
  startDate?:   string;
  endDate?:     string;
  staff?:       string;
  image?:       string;
  quotationFile?: string;
}

// export const PROJECT_TYPES   = ["Office", "Residential", "Commercial", "Condo", "Villa", "Other"];
export const PROJECT_STATUSES = ["กำลังดำเนินการ", "เสร็จสิ้น"];

export const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  "กำลังดำเนินการ": { bg: "#fef9c3", color: "#ca8a04" },
  "เสร็จสิ้น":      { bg: "#dcfce7", color: "#16a34a" },
};

export const TYPE_COLOR: Record<string, string> = {
  Office:"#3b82f6",
  Residential:"#22c55e",
  Commercial:"#f97316",
  Condo:"#a855f7",
  Villa:"#eab308",
  Other:"#6b7280",
};

export const EMPTY_FORM: Omit<Project, "id"> = {
  name:"", description:"", location:"", startDate:"", endDate:"",
  status:"กำลังดำเนินการ", image:"", quotationFile:"", quotationName:"", staff:"",
  portfolioImages: [],
};

export function fmt(n: string | number) {
  const num = typeof n === "string" ? parseFloat(n.replace(/,/g, "")) : n;
  return isNaN(num) ? "-" : num.toLocaleString("th-TH");
}

export function validateForm(form: Omit<Project, "id">): FormErrors {
  const e: FormErrors = {};
  if (!form.name.trim())        e.name        = "กรุณากรอกชื่อโครงการ";
  if (!form.description.trim()) e.description = "กรุณากรอกรายละเอียดโครงการ";
  if (!form.location.trim())    e.location    = "กรุณากรอกที่ตั้งโครงการ";
  if (!form.startDate)          e.startDate   = "กรุณาเลือกวันที่เริ่มต้น";
  if (!form.endDate)            e.endDate     = "กรุณาเลือกวันที่สิ้นสุด";
  if (form.startDate && form.endDate && form.endDate < form.startDate) {
    e.endDate = "วันที่สิ้นสุดต้องไม่ก่อนวันที่เริ่มต้น";
  }
  if (!form.staff)              e.staff       = "กรุณาเลือกผู้รับผิดชอบ";
  if (!form.quotationFile)      e.quotationFile = "กรุณาอัปโหลดใบเสนอราคา";

  return e;
}
