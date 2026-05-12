// components/data/projectsData.ts
// ข้อมูล static และ constants สำหรับหน้า reports/projects
// แยกออกมาเพื่อให้ page.tsx สั้นลง และแก้ข้อมูลได้ง่าย

export const PROJECTS_DATA = [
  { id: 1, name: "KWI Head office",       type: "Office",      location: "กรุงเทพ สาทร",     start: "01/03/2565", end: "30/06/2565", area: "2,000",  status: "เสร็จสิ้น",  budget: 4800000,  actual: 4650000,  staff: "สมชาย ใจดี",    images: 24 },
  { id: 2, name: "Shopee Express Office", type: "Office",      location: "อยุธยา",            start: "15/04/2565", end: "20/09/2565", area: "10,000", status: "เสร็จสิ้น",  budget: 18000000, actual: 17200000, staff: "วิภา รักดี",     images: 41 },
  { id: 3, name: "Green Park Residence",  type: "Residential", location: "เชียงใหม่",         start: "01/01/2566", end: "30/08/2566", area: "450",   status: "เสร็จสิ้น",  budget: 3200000,  actual: 3350000,  staff: "สมชาย ใจดี",    images: 18 },
  { id: 4, name: "Blue Sky Tower",        type: "Commercial",  location: "กรุงเทพ สีลม",     start: "01/06/2566", end: "31/03/2567", area: "25,000", status: "กำลังดำเนินการ", budget: 42000000, actual: 28000000, staff: "ประเสริฐ ช่างดี", images: 12 },
  { id: 5, name: "Teak Villa Chiang Mai", type: "Residential", location: "เชียงใหม่ แม่ริม", start: "15/02/2567", end: "30/11/2567", area: "800",   status: "กำลังดำเนินการ", budget: 9500000,  actual: 3200000,  staff: "วิภา รักดี",     images: 8  },
  { id: 6, name: "Minimal Loft BKK",      type: "Condo",       location: "กรุงเทพ อโศก",     start: "01/04/2567", end: "30/06/2567", area: "120",   status: "เสร็จสิ้น",  budget: 980000,   actual: 920000,   staff: "สมชาย ใจดี",    images: 31 },
];

export const TYPE_COLORS: Record<string, string> = {
  Office:      "#3b82f6",
  Residential: "#22c55e",
  Commercial:  "#f97316",
  Condo:       "#a855f7",
};

export const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  "เสร็จสิ้น":          { bg: "#dcfce7", color: "#16a34a" },
  "กำลังดำเนินการ": { bg: "#fef9c3", color: "#ca8a04" },
  "ยกเลิก":             { bg: "#fee2e2", color: "#dc2626" },
};

export function fmt(n: number) {
  return n.toLocaleString("th-TH");
}