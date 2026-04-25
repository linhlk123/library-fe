import apiClient from './apiClient';
import type { ApiResponse, PhieuMuonTra, PhieuThuTienPhat } from '../types';
import axios from 'axios';

export const lendingApi = {
    dauSach: {
    create: (data: {
      tenDauSach: string;
      theLoai: string;
      tacGia: string;
    }) => axios.post('/api/dausach', data),
  },

  sach: {
    create: (data: {
      maDauSach: string;
      nhaXuatBan: string;
      namXuatBan?: number;
    }) => axios.post('/api/sach', data),
  },

  cuonSach: {
    create: (data: { maSach: string }) =>
      axios.post('/api/cuonsach', data),
  },
  // Lending slips (PhieuMuonTra)
  phieuMuonTra: {
    getAll: (params?: {
      status?: 'ACTIVE' | 'OVERDUE' | 'RETURNED';
      maDocGia?: string;
      maCuonSach?: string;
      page?: number;
      pageSize?: number;
    }) =>
      apiClient.get<ApiResponse<PhieuMuonTra[]>>('/api/phieumuontra', { params }),

    getById: (soPhieu: string) =>
      apiClient.get<ApiResponse<PhieuMuonTra>>(`/api/phieumuontra/${soPhieu}`),

    create: (data: Omit<PhieuMuonTra, 'soPhieu' | 'tienPhat' | 'ngayTra'>) =>
      apiClient.post<ApiResponse<PhieuMuonTra>>('/api/phieumuontra', data),

    update: (soPhieu: string, data: Record<string, unknown>) =>
      apiClient.put<ApiResponse<PhieuMuonTra>>(`/api/phieumuontra/${soPhieu}`, data),

    getByMaDocGia: (maDocGia: string) => 
      apiClient.get<ApiResponse<PhieuMuonTra[]>>(`/api/phieumuontra/docgia/${maDocGia}`),
    
    delete: (soPhieu: string) =>
      apiClient.delete<ApiResponse<void>>(`/api/phieumuontra/${soPhieu}`),

    // Return a book (update loan with return date)
    return: (soPhieu: string, data: { ngayTra: string }) =>
      apiClient.put<ApiResponse<PhieuMuonTra>>(`/api/phieumuontra/${soPhieu}`, data),
  },

  // Fine receipts (PhieuThuTienPhat)
  phieuThuTienPhat: {
    getAll: (params?: { maPhieuMuonTra?: string; page?: number; pageSize?: number }) =>
      apiClient.get<ApiResponse<PhieuThuTienPhat[]>>('/api/phieuthutienphat', { params }),

    create: (data: Omit<PhieuThuTienPhat, 'soPTT'>) =>
      apiClient.post<ApiResponse<PhieuThuTienPhat>>('/api/phieuthutienphat', data),

    update: (soPTT: string, data: Record<string, unknown>) =>
      apiClient.put<ApiResponse<PhieuThuTienPhat>>(`/api/phieuthutienphat/${soPTT}`, data),

    delete: (soPTT: string) =>
      apiClient.delete<ApiResponse<void>>(`/api/phieuthutienphat/${soPTT}`),
  },
};

export default lendingApi;
