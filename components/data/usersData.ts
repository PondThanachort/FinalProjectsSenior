// ข้อมูล static ของหน้าจัดการพนักงาน

export interface Staff {
  staff_id:   string;
  prefix:     string;
  first_name: string;
  last_name:  string;
  address:    string;
  username:   string;
  password:   string;
  phone:      string;
  email:      string;
  position:   string;
  role:       "1" | "2";
}

export interface FormErrors {
  staff_id?:   string;
  prefix?:     string;
  first_name?: string;
  last_name?:  string;
  address?:    string;
  username?:   string;
  password?:   string;
  phone?:      string;
  email?:      string;
  position?:   string;
  role?:       string;
}

export const PREFIXES = ["นาย","นาง","นางสาว","ดร."];
export const POSITIONS = [
  "สถาปนิก",
  "มัณฑนากร",
  "วิศวกรโยธา",
  "วิศวกรไฟฟ้า",
  "ผู้จัดการโครงการ",
  "เจ้าหน้าที่บัญชี",
  "ผู้ช่วยทั่วไป",
];

export const MOCK_STAFF: Staff[] = [
  { staff_id:"ST001", prefix:"นาย",    first_name:"สมชาย",    last_name:"ใจดี",     address:"123 ถ.นิมมาน เชียงใหม่",   username:"somchai",   password:"Pass1234",  phone:"0812345678", email:"somchai@suwan.th",   position:"สถาปนิก",          role:"1" },
  { staff_id:"ST002", prefix:"นางสาว", first_name:"วิภา",     last_name:"รักดี",    address:"456 ถ.ห้วยแก้ว เชียงใหม่", username:"wipa",       password:"Pass5678",  phone:"0823456789", email:"wipa@suwan.th",       position:"มัณฑนากร",         role:"2" },
  { staff_id:"ST003", prefix:"นาย",    first_name:"ประเสริฐ", last_name:"ช่างดี",   address:"789 ถ.สุเทพ เชียงใหม่",    username:"prasert",   password:"Pass9012",  phone:"0834567890", email:"prasert@suwan.th",    position:"วิศวกรโยธา",       role:"2" },
  { staff_id:"ST004", prefix:"นางสาว", first_name:"นภา",      last_name:"สุขใจ",    address:"321 ถ.เชียงใหม่-ลำปาง",   username:"napa",      password:"Pass3456",  phone:"0845678901", email:"napa@suwan.th",       position:"เจ้าหน้าที่บัญชี", role:"2" },
  { staff_id:"ST005", prefix:"นาย",    first_name:"วิชัย",    last_name:"มั่นคง",   address:"654 ถ.ท่าแพ เชียงใหม่",    username:"wichai",    password:"Pass7890",  phone:"0856789012", email:"wichai@suwan.th",     position:"ผู้จัดการโครงการ", role:"2" },
];

export const EMPTY_FORM: Omit<Staff, "staff_id"> = {
  prefix:"นาย", first_name:"", last_name:"", address:"",
  username:"", password:"", phone:"", email:"", position:"", role:"2",
};
