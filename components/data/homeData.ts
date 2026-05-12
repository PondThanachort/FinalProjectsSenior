// components/data/homeData.ts
// ข้อมูล static ทั้งหมดของหน้าแรก
// แยกออกมาเพื่อให้ page.tsx สั้นลง และแก้ข้อมูลได้ง่าย

export const SLIDES = [
  { id: 1, gradient: "linear-gradient(160deg,#12201a 0%,#1b3528 100%)", title: "ห้างหุ้นส่วนจำกัด สุวรรณอินทิเรียร์", subtitle: "แอนด์ รีโนเวชั่น จำกัด" },
  { id: 2, gradient: "linear-gradient(160deg,#1a1e2a 0%,#222840 100%)", title: "ออกแบบพื้นที่",         subtitle: "ที่สะท้อนตัวตนของคุณ" },
  { id: 3, gradient: "linear-gradient(160deg,#241a0e 0%,#3a2810 100%)", title: "สถาปัตยกรรม",          subtitle: "ที่ยืนยาวกาลเวลา" },
  { id: 4, gradient: "linear-gradient(160deg,#0e1e1a 0%,#162e28 100%)", title: "ก่อสร้างมาตรฐาน",     subtitle: "ระดับสากล ตรงเวลา โปร่งใส" },
  { id: 5, gradient: "linear-gradient(160deg,#1e1020 0%,#2e1830 100%)", title: "ครบวงจร",              subtitle: "ทุกขั้นตอน ดูแลโดยผู้เชี่ยวชาญ" },
];

export const PROJECTS = [
  { id: 1, name: "KWI Head office",       desc: "งานปรับปรุงตกแต่งออฟฟิศเก่าให้สวยงามและทันสมัย",              location: "กรุงเทพ สาทร",     year: "2565", area: "2,000 ตร.ม.",  tags: ["Office", "Renovation"],      g: "linear-gradient(135deg,#d4cfc8,#b0a898)" },
  { id: 2, name: "Shopee Express Office", desc: "ตกแต่งภายในสำนักงาน เพื่อการใช้งานที่มีประสิทธิภาพและครีน",  location: "อยุธยา",            year: "2565", area: "10,000 ตร.ม.", tags: ["Office", "Interior"],         g: "linear-gradient(135deg,#f97316,#ea580c)" },
  { id: 3, name: "Green Park Residence",  desc: "บ้านพักอาศัยสไตล์โมเดิร์น ผสานธรรมชาติและความหรูหรา",        location: "เชียงใหม่",         year: "2566", area: "450 ตร.ม.",    tags: ["Residential", "Architecture"], g: "linear-gradient(135deg,#3b6b3b,#2d4f2d)" },
  { id: 4, name: "Blue Sky Tower",        desc: "อาคารสำนักงานระดับพรีเมียม ออกแบบให้ตอบรับแสงธรรมชาติ",      location: "กรุงเทพ สีลม",     year: "2566", area: "25,000 ตร.ม.", tags: ["Commercial", "Architecture"],  g: "linear-gradient(135deg,#1e3f6b,#162d4e)" },
  { id: 5, name: "Teak Villa Chiang Mai", desc: "วิลล่าหรูสไตล์ล้านนาประยุกต์ วัสดุธรรมชาติเกรด Premium",    location: "เชียงใหม่ แม่ริม", year: "2567", area: "800 ตร.ม.",    tags: ["Residential", "Interior"],    g: "linear-gradient(135deg,#6b4020,#4e2e10)" },
  { id: 6, name: "Minimal Loft BKK",      desc: "ตกแต่งคอนโดสไตล์ Industrial Loft พื้นที่ใช้สอยสูงสุด",      location: "กรุงเทพ อโศก",     year: "2567", area: "120 ตร.ม.",    tags: ["Commercial", "Interior"],     g: "linear-gradient(135deg,#2e2e50,#1e1e38)" },
];

export const SERVICES = [
  { num: "01", icon: "🏠", title: "ออกแบบตกแต่งภายใน", desc: "สร้างพื้นที่อยู่อาศัยที่สะท้อนตัวตน ด้วยรายละเอียดที่ผสานความงามและประโยชน์ใช้สอยอย่างลงตัว" },
  { num: "02", icon: "🏛️", title: "สถาปัตยกรรม",       desc: "ออกแบบอาคารที่ยืนยาวกาลเวลา ทั้งบ้านพักอาศัย คอนโดมิเนียม และอาคารพาณิชย์" },
  { num: "03", icon: "🏗️", title: "งานก่อสร้าง",       desc: "ควบคุมการก่อสร้างด้วยมาตรฐานสูงสุด โปร่งใส และตรงเวลา ทุกขั้นตอน" },
];

export const PROCESS_STEPS = [
  { step: "01", name: "รับฟัง",  desc: "เราเริ่มต้นด้วยการฟังความต้องการและวิสัยทัศน์ของคุณอย่างละเอียด เพื่อให้เข้าใจเป้าหมายที่แท้จริง" },
  { step: "02", name: "ออกแบบ", desc: "ทีมออกแบบสร้าง concept และ 3D visualization เพื่อให้คุณเห็นภาพโครงการชัดเจนก่อนลงมือสร้าง" },
  { step: "03", name: "ก่อสร้าง",desc: "ลงมือก่อสร้างด้วยวัสดุคุณภาพสูง ควบคุมทุกรายละเอียดอย่างใกล้ชิด และรายงานความคืบหน้าสม่ำเสมอ" },
  { step: "04", name: "ส่งมอบ", desc: "ส่งมอบพื้นที่สมบูรณ์แบบพร้อมบริการหลังการขายและการดูแลรักษาตลอดอายุการใช้งาน" },
];

export const WHY_CARDS = [
  { icon: "✅", title: "คุณภาพมาตรฐาน",  desc: "วัสดุคัดสรรระดับพรีเมียม ตรวจสอบทุกขั้นตอน" },
  { icon: "⏱️", title: "ตรงเวลา",         desc: "ส่งมอบงานตามกำหนด ไม่มีค่าใช้จ่ายเพิ่มเติม" },
  { icon: "💬", title: "สื่อสารโปร่งใส",  desc: "อัปเดตความคืบหน้าสม่ำเสมอทุกสัปดาห์" },
  { icon: "🛡️", title: "รับประกันงาน",    desc: "รับประกันคุณภาพงานหลังส่งมอบ 2 ปี" },
];

export const FOOTER_COLS = [
  { h: "บริการ",  links: ["ออกแบบภายใน", "สถาปัตยกรรม", "งานก่อสร้าง", "ที่ปรึกษา"] },
  { h: "ผลงาน",  links: ["Office", "Residential", "Commercial", "Villa"] },
  { h: "ติดต่อ", links: ["ลำพูน, ไทย", "+66 89 809 4354", "suwannakorn62@gmail.com", "Line: 0826152905"] },
];
