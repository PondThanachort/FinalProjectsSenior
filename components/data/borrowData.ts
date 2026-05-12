// components/data/borrowData.ts
// ข้อมูล static ของหน้า Borrow Report
// แยกออกมาเพื่อให้ page.tsx สั้นลง

export const BORROW_DATA = [
  { id:1,  date:"15/08/2567", returnDate:"18/08/2567", project:"KWI Head office",       material:"กระเบื้องหินอ่อน 60x60",    unit:"แผ่น",  qty:120, returned:120, borrower:"สมชาย ใจดี",    status:"คืนแล้ว" },
  { id:2,  date:"14/08/2567", returnDate:"-",           project:"Blue Sky Tower",         material:"เหล็กเส้น RB6",             unit:"เส้น",  qty:500, returned:0,   borrower:"ประเสริฐ ช่างดี",status:"ค้างคืน" },
  { id:3,  date:"13/08/2567", returnDate:"14/08/2567", project:"Shopee Express Office",  material:"สีทาผนัง Nippon 18L",       unit:"ถัง",   qty:24,  returned:24,  borrower:"วิภา รักดี",     status:"คืนแล้ว" },
  { id:4,  date:"12/08/2567", returnDate:"-",           project:"Teak Villa Chiang Mai",  material:"ไม้สักแปรรูป 2x4",         unit:"เมตร",  qty:80,  returned:30,  borrower:"สมชาย ใจดี",    status:"คืนบางส่วน" },
  { id:5,  date:"11/08/2567", returnDate:"13/08/2567", project:"Minimal Loft BKK",       material:"ปูนซีเมนต์ TPI 50kg",      unit:"ถุง",   qty:40,  returned:40,  borrower:"วิภา รักดี",     status:"คืนแล้ว" },
  { id:6,  date:"10/08/2567", returnDate:"-",           project:"Blue Sky Tower",         material:"ท่อ PVC 4 นิ้ว",           unit:"เส้น",  qty:200, returned:0,   borrower:"ประเสริฐ ช่างดี",status:"ค้างคืน" },
  { id:7,  date:"09/08/2567", returnDate:"10/08/2567", project:"Green Park Residence",   material:"กระจกนิรภัย 10mm",         unit:"แผ่น",  qty:15,  returned:15,  borrower:"สมชาย ใจดี",    status:"คืนแล้ว" },
  { id:8,  date:"08/08/2567", returnDate:"-",           project:"KWI Head office",        material:"สายไฟ THW 2.5 sqmm",       unit:"ม้วน",  qty:10,  returned:0,   borrower:"วิภา รักดี",     status:"ค้างคืน" },
  { id:9,  date:"07/08/2567", returnDate:"09/08/2567", project:"Shopee Express Office",  material:"แอร์ Mitsubishi 18000 BTU", unit:"เครื่อง",qty:8, returned:8,   borrower:"ประเสริฐ ช่างดี",status:"คืนแล้ว" },
  { id:10, date:"06/08/2567", returnDate:"-",           project:"Teak Villa Chiang Mai",  material:"อิฐมอญ",                   unit:"ก้อน",  qty:3000,returned:1200,borrower:"สมชาย ใจดี",    status:"คืนบางส่วน" },
];

export const STATUS_STYLE: Record<string, { bg:string; color:string; dot:string }> = {
  "คืนแล้ว":     { bg:"#dcfce7", color:"#16a34a", dot:"#16a34a" },
  "ค้างคืน":     { bg:"#fee2e2", color:"#dc2626", dot:"#dc2626" },
  "คืนบางส่วน":  { bg:"#fef9c3", color:"#ca8a04", dot:"#ca8a04" },
};

export const SUMMARY_BY_MAT = [
  { name:"เหล็กเส้น RB6",          unit:"เส้น",  total:500, returned:0   },
  { name:"กระเบื้องหินอ่อน 60x60", unit:"แผ่น",  total:120, returned:120 },
  { name:"ไม้สักแปรรูป 2x4",       unit:"เมตร",  total:80,  returned:30  },
  { name:"ท่อ PVC 4 นิ้ว",         unit:"เส้น",  total:200, returned:0   },
  { name:"อิฐมอญ",                  unit:"ก้อน",  total:3000,returned:1200},
];
