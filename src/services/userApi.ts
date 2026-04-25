import apiClient from './apiClient';
import type { ApiResponse, NguoiDung, PageResponse } from '../types';
import type {
  DauSach,
  Sach,
  CuonSach,
  TacGia,
  TheLoai,
  PhieuMuonTra,
  ReaderCard,
} from '../types';

export const userApi = {
  // User management
  getAll: () =>
    apiClient.get<ApiResponse<NguoiDung[]>>('/api/v1/users'),

  create: (data: Record<string, unknown>) =>
    apiClient.post<ApiResponse<NguoiDung>>('/api/v1/users', data),

  update: (tenDangNhap: string, data: Record<string, unknown>) =>
    apiClient.put<ApiResponse<NguoiDung>>(`/api/v1/users/${tenDangNhap}`, data),

  delete: (tenDangNhap: string) =>
    apiClient.delete<ApiResponse<void>>(`/api/v1/users/${tenDangNhap}`),

  // Catalog endpoints
  getAllDauSach: () =>
    apiClient.get<ApiResponse<DauSach[]>>('/api/dausach'),

  getDauSachDetail: (maDauSach: string) =>
    apiClient.get<ApiResponse<DauSach>>(`/api/dausach/${maDauSach}`),

  getDauSachByCategory: (maTheLoai: string) =>
    apiClient.get<ApiResponse<DauSach[]>>(`/api/dausach/theloai/${maTheLoai}`),

  getAllCategories: () =>
    apiClient.get<ApiResponse<TheLoai[]>>('/api/theloai'),

  getAllAuthors: () =>
    apiClient.get<ApiResponse<TacGia[]>>('/api/tacgia'),

  getAllSach: () =>
    apiClient.get<ApiResponse<Sach[]>>('/api/sach'),

  getAllSachPaginated: (page: number, size: number) =>
    apiClient.get<ApiResponse<PageResponse<Sach>>>('/api/sach', {
      params: { page, size },
    }),

  getSachDetail: (maSach: string) =>
    apiClient.get<ApiResponse<Sach>>(`/api/sach/${maSach}`),

  // Physical copies
  getAllCuonSach: () =>
    apiClient.get<ApiResponse<CuonSach[]>>('/api/cuonsach'),

  getCuonSachBySach: (maSach: string) =>
    apiClient.get<ApiResponse<CuonSach[]>>(`/api/cuonsach/sach/${maSach}`),

  // Borrowing records
  getAllPhieuMuonTra: () =>
    apiClient.get<ApiResponse<PhieuMuonTra[]>>('/api/phieumuontra'),

  getPhieuMuonTraDetail: (soPhieu: string) =>
    apiClient.get<ApiResponse<PhieuMuonTra>>(`/api/phieumuontra/${soPhieu}`),

  getMyReaderCard: () =>
    apiClient.get<ApiResponse<ReaderCard>>('/api/docgia/my-card'),
};

export default userApi;
