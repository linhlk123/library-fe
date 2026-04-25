// ─── Wrapper chung ───────────────────────────────────────────────
export interface ApiResponse<T> {
  code: number;
  message?: string;
  result: T;
}

export interface PageResponse<T> {
  content: T[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
}

export interface ApiError {
  code: number;
  message?: string;
}

// ─── Auth ────────────────────────────────────────────────────────
export type TenVaiTro = 'USER' | 'STAFF';

export interface NguoiDung {
  tenDangNhap: string;
  hoTen: string;
  ngaySinh: string;
  email: string;
  vaiTro: TenVaiTro;
}

export interface AuthTokenResponse {
  token: string;
  exToken?: string;
}

export interface CreateNguoiDungRequest {
  tenDangNhap: string;
  matKhau: string;
  hoTen: string;
  ngaySinh: string;
  diaChi: string;
  email: string;
  tenVaiTro: TenVaiTro;
}

// ─── LoaiDocGia (entity riêng, có CRUD) ─────────────────────────
export interface LoaiDocGia {
  maLoaiDocGia: number;
  tenLoaiDocGia: string;
}

// ─── DocGia ──────────────────────────────────────────────────────
export interface DocGia {
  maDocGia: string;
  hoTen: string;
  ngaySinh: string;
  email: string;
  diaChi?: string;
  matKhau?: string;
  tenVaiTro?: TenVaiTro;
  ngayLapThe: string;
  ngayHetHan: string;
  tongNo: number;
  loaiDocGia?: LoaiDocGia;   // object khi GET
  maLoaiDocGia?: number;
  tenLoaiDocGia?: string;    // từ response
}

export interface ReaderCard {
  maDocGia: string;
  hoTen: string;
  ngayHetHan: string;
  tongNo: number;
}

// ─── ThamSo (Regulations) ────────────────────────────────────────
export interface ThamSo {
  tenThamSo: string;          // ID: "SO_NGAY_MUON", "TIEN_PHAT_MOI_NGAY"...
  giaTri: string | number;
}

// ─── TheLoai / TacGia / DauSach / Sach / CuonSach ───────────────
export interface TheLoai {
  maTheLoai: number;
  tenTheLoai: string;
}

export interface TacGia {
  maTacGia: number;
  tenTacGia: string;
}

export interface CTTacGia {
  maDauSach: number;
  maTacGia: number;
  tacGia?: TacGia;
}

export interface DauSach {
  maDauSach: number;
  tenDauSach: string;
  maTheLoai: number;    
  tacGiaList?: TacGia[];          
  anhBiaUrl?: string | null;
}

export interface Sach {
  maSach: number;
  maDauSach: number;
  maTheLoai: number;
  nhaXuatBan: string;
  namXuatBan: number;
  giaTien: number;
  soLuong: number;
  }

  export type TinhTrangCuonSach = 'AVAILABLE' | 'BORROWED' | 'DAMAGED' | 'LOST';

export interface CuonSach {
  maCuonSach: number;
  maSach: number;
  tinhTrang: TinhTrangCuonSach;
}


export interface BookForUI {
  maDauSach: number;
  tenDauSach: string;
  tacGiaList: TacGia[];
  maSach?: number;
  nhaXuatBan?: string;
  namXuatBan?: number;
  giaTien?: number;
  soLuong?: number;
  theLoai?: TheLoai;
  totalCopies: number;
  availableCopies: number;
  status: 'AVAILABLE' | 'UNAVAILABLE';
  anhBiaUrl?: string;
}

// ─── PhieuMuonTra ────────────────────────────────────────────────
export type TrangThaiPhieuMuon = 'ĐANG_MƯỢN' | 'ĐÃ_TRẢ' | 'TRỄ_HẠN';

export interface PhieuMuonTra {
  soPhieu?: number;           // Legacy field
  maCuonSach: number;
  maDocGia: string;
  ngayMuon: string;
  ngayPhaiTra: string;
  ngayTra?: string;
  soNgayMuon?: number;        // Number of rental days
  tienPhat: number;
  maNhanVien: string;
  trangThai?: TrangThaiPhieuMuon;  // For manager view
}

// ─── PhieuThuTienPhat ────────────────────────────────────────────
export interface PhieuThuTienPhat {
  soPTT: number;              // ID đúng theo /api/phieuthutienphat/:soPTT
  maDocGia: string;
  soTienThu: number;
  ngayThu: string;
  maNhanVien: string;
  conLai: number;
}

// ─── PhieuThu (Fine Receipt) ─────────────────────────────────────
export interface PhieuThu {
  soPTT: number;              // ID đúng theo /api/phieuthutienphat/:soPTT
  maDocGia: string;
  soTienThu: number;
  ngayThu: string;
  maNhanVien: string;
  ghiChu?: string;
}

// ─── Báo cáo ─────────────────────────────────────────────────────
export interface BCTinhHinhMuonSach {
  maBCTHMS: string;
  tenBaoCao: string;
  ngayTao: string;
}

export interface CTBC_THMS {
  maBCTHMS: string;           // composite key 1
  maTheLoai: string;          // composite key 2
  soLuotMuon: number;
  tyLe: number;
  theLoai?: TheLoai;
}

export interface BCSachTraTre {
  ngay: string;               // composite key 1
  maCuonSach: string;         // composite key 2
  soNgayTraTre: number;
  tienPhatMoiNgay: number;
  cuonSach?: CuonSach;
}

// ─── AI Chat ─────────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'USER' | 'BOT';
  timestamp: Date;
}


export interface Notification {
  id: string;
  type: 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO';
  message: string;
}

// ─── ThongBao (Notification System) ──────────────────────────────
export type LoaiThongBao = 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';

export interface ThongBao {
  id: number;
  tieuDe: string;
  noiDung: string;
  loaiThongBao: LoaiThongBao;
  daDoc: boolean;
  ngayTao: string; // ISO format
}

