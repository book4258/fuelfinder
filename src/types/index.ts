// ─── Fuel Types ──────────────────────────────────────────────────────────────
export type FuelType = 'diesel' | 'gasohol91' | 'gasohol95' | 'e20' | 'e85' | 'lpg';

export const FUEL_LABELS: Record<FuelType, string> = {
  diesel:    'ดีเซล',
  gasohol91: 'แก๊สโซฮอล์ 91',
  gasohol95: 'แก๊สโซฮอล์ 95',
  e20:       'E20',
  e85:       'E85',
  lpg:       'LPG / NGV',
};

export const FUEL_COLORS: Record<FuelType, string> = {
  diesel:    '#3B82F6',
  gasohol91: '#F59E0B',
  gasohol95: '#10B981',
  e20:       '#8B5CF6',
  e85:       '#EC4899',
  lpg:       '#06B6D4',
};

// ─── Station ─────────────────────────────────────────────────────────────────
export interface FuelStatus {
  available: boolean;
  price?:    number;   // THB per litre
  updatedAt: number;   // epoch ms
}

export interface Station {
  id:          string;
  name:        string;
  brand:       string;          // PTT, Shell, Caltex, BangchakGas, etc.
  address:     string;
  province:    string;
  lat:         number;
  lng:         number;
  fuels:       Partial<Record<FuelType, FuelStatus>>;
  phone?:      string;
  openHours?:  string;
  confidence:  number;          // 0–100 crowd-sourced reliability score
  reportCount: number;
  featured:    boolean;         // paid promotion flag
  createdAt:   number;
  updatedAt:   number;
}

// ─── Report ──────────────────────────────────────────────────────────────────
export type ReportStatus = 'available' | 'unavailable' | 'running_low';

export interface Report {
  id:         string;
  stationId:  string;
  userId:     string;
  fuelType:   FuelType;
  status:     ReportStatus;
  price?:     number;
  note?:      string;
  upvotes:    number;
  downvotes:  number;
  timestamp:  number;
}

// ─── User ─────────────────────────────────────────────────────────────────────
export interface AppUser {
  uid:          string;
  displayName:  string;
  email:        string;
  photoURL?:    string;
  trustScore:   number;        // 0–100
  reportCount:  number;
  isPremium:    boolean;
  bookmarks:    string[];      // station IDs
  createdAt:    number;
}

// ─── Filters ─────────────────────────────────────────────────────────────────
export interface MapFilters {
  province?:  string;
  fuelType?:  FuelType;
  available?: boolean;
}

// ─── Thailand Provinces ───────────────────────────────────────────────────────
export const PROVINCES = [
  'กรุงเทพมหานคร','กระบี่','กาญจนบุรี','กาฬสินธุ์','กำแพงเพชร',
  'ขอนแก่น','จันทบุรี','ฉะเชิงเทรา','ชลบุรี','ชัยนาท',
  'ชัยภูมิ','ชุมพร','เชียงราย','เชียงใหม่','ตรัง',
  'ตราด','ตาก','นครนายก','นครปฐม','นครพนม',
  'นครราชสีมา','นครศรีธรรมราช','นครสวรรค์','นนทบุรี','นราธิวาส',
  'น่าน','บึงกาฬ','บุรีรัมย์','ปทุมธานี','ประจวบคีรีขันธ์',
  'ปราจีนบุรี','ปัตตานี','พระนครศรีอยุธยา','พะเยา','พังงา',
  'พัทลุง','พิจิตร','พิษณุโลก','เพชรบุรี','เพชรบูรณ์',
  'แพร่','ภูเก็ต','มหาสารคาม','มุกดาหาร','แม่ฮ่องสอน',
  'ยโสธร','ยะลา','ร้อยเอ็ด','ระนอง','ระยอง',
  'ราชบุรี','ลพบุรี','ลำปาง','ลำพูน','เลย',
  'ศรีสะเกษ','สกลนคร','สงขลา','สตูล','สมุทรปราการ',
  'สมุทรสงคราม','สมุทรสาคร','สระแก้ว','สระบุรี','สิงห์บุรี',
  'สุโขทัย','สุพรรณบุรี','สุราษฎร์ธานี','สุรินทร์','หนองคาย',
  'หนองบัวลำภู','อ่างทอง','อำนาจเจริญ','อุดรธานี','อุตรดิตถ์',
  'อุทัยธานี','อุบลราชธานี',
] as const;

export type Province = typeof PROVINCES[number];
