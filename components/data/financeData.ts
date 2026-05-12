// components/data/financeData.ts
// ข้อมูล static ของหน้า Finance Report
// แยกออกมาเพื่อให้ page.tsx สั้นลง

export const MONTHLY_DATA = [
  { month:"ม.ค. 2567", income:850000,  expense:620000  },
  { month:"ก.พ. 2567", income:1200000, expense:980000  },
  { month:"มี.ค. 2567", income:960000,  expense:750000  },
  { month:"เม.ย. 2567", income:1450000, expense:1100000 },
  { month:"พ.ค. 2567", income:780000,  expense:540000  },
  { month:"มิ.ย. 2567", income:1680000, expense:1350000 },
  { month:"ก.ค. 2567", income:920000,  expense:680000  },
  { month:"ส.ค. 2567", income:1100000, expense:890000  },
];

export const TRANSACTIONS = [
  { id:1,  date:"15/08/2567", type:"income",  project:"KWI Head office",       category:"ค่าออกแบบ",       amount:480000,  ref:"INV-2024-001", by:"สมชาย ใจดี" },
  { id:2,  date:"14/08/2567", type:"expense", project:"Blue Sky Tower",         category:"ค่าวัสดุก่อสร้าง",amount:320000,  ref:"PO-2024-088",  by:"ประเสริฐ ช่างดี" },
  { id:3,  date:"12/08/2567", type:"income",  project:"Shopee Express Office",  category:"ค่างวดงาน 3",    amount:2400000, ref:"INV-2024-002", by:"วิภา รักดี" },
  { id:4,  date:"10/08/2567", type:"expense", project:"Teak Villa Chiang Mai",  category:"ค่าแรงงาน",      amount:180000,  ref:"PAY-2024-044", by:"สมชาย ใจดี" },
  { id:5,  date:"08/08/2567", type:"income",  project:"Blue Sky Tower",         category:"ค่างวดงาน 2",    amount:8400000, ref:"INV-2024-003", by:"ประเสริฐ ช่างดี" },
  { id:6,  date:"05/08/2567", type:"expense", project:"Minimal Loft BKK",       category:"ค่าอุปกรณ์ตกแต่ง",amount:95000, ref:"PO-2024-091",  by:"วิภา รักดี" },
  { id:7,  date:"03/08/2567", type:"income",  project:"Green Park Residence",   category:"ค่าออกแบบ + งวด 1",amount:960000, ref:"INV-2024-004", by:"สมชาย ใจดี" },
  { id:8,  date:"01/08/2567", type:"expense", project:"KWI Head office",        category:"ค่าวัสดุ",        amount:125000,  ref:"PO-2024-092",  by:"วิภา รักดี" },
];

export const BY_PROJECT = [
  { name:"KWI Head office",       income:4650000, expense:3820000 },
  { name:"Shopee Express Office", income:17200000,expense:14100000},
  { name:"Green Park Residence",  income:3350000, expense:3120000 },
  { name:"Blue Sky Tower",        income:28000000,expense:22400000},
  { name:"Teak Villa Chiang Mai", income:3200000, expense:2980000 },
  { name:"Minimal Loft BKK",      income:920000,  expense:780000  },
];

export function fmt(n: number) {
  return n.toLocaleString("th-TH");
}

export const maxVal = Math.max(...MONTHLY_DATA.map(m => Math.max(m.income, m.expense)));
