import apiClient from './apiClient';
import type { ApiResponse, BCTinhHinhMuonSach, BCSachTraTre, CTBC_THMS } from '../types';

export const reportsApi = {
  lendingReport: {
    getAll: (params?: { page?: number; pageSize?: number }) =>
      apiClient.get<ApiResponse<BCTinhHinhMuonSach[]>>('/api/bctinhhinhmuonsach', { params }),

    getById: (maBCTHMS: string) =>
      apiClient.get<ApiResponse<BCTinhHinhMuonSach>>(`/api/bctinhhinhmuonsach/${maBCTHMS}`),

    // Chi tiết tất cả theo báo cáo
    getDetails: (maBCTHMS: string) =>
      apiClient.get<ApiResponse<CTBC_THMS[]>>(`/api/ctbc-thms/baocao/${maBCTHMS}`),

    // Chi tiết theo báo cáo + thể loại cụ thể
    getDetailByKey: (maBCTHMS: string, maTheLoai: string) =>
      apiClient.get<ApiResponse<CTBC_THMS>>(`/api/ctbc-thms/${maBCTHMS}/${maTheLoai}`),
  },

  overdueReport: {
    getAll: (params?: {
      maCuonSach?: string;
      page?: number;
      pageSize?: number;
    }) =>
      apiClient.get<ApiResponse<BCSachTraTre[]>>('/api/bc_sachtratre', { params }),

    getByDate: (ngay: string) =>
      apiClient.get<ApiResponse<BCSachTraTre[]>>(`/api/bc_sachtratre/ngay/${ngay}`),

    getByBook: (maCuonSach: string) =>
      apiClient.get<ApiResponse<BCSachTraTre[]>>(`/api/bc_sachtratre/cuonsach/${maCuonSach}`),

    getByKey: (ngay: string, maCuonSach: string) =>
      apiClient.get<ApiResponse<BCSachTraTre>>(`/api/bc_sachtratre/${ngay}/${maCuonSach}`),
  },
};

export default reportsApi;