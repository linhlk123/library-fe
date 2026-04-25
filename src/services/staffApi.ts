import apiClient from './apiClient';
import type { ApiResponse, PhieuThu } from '../types';
import readersApi from './readersApi';

export const staffApi = {
  // Borrow slip management (for staff/managers)
  borrowSlips: {
    getAll: (params?: {
      trangThai?: 'ĐANG_MƯỢN' | 'ĐÃ_TRẢ' | 'TRỄ_HẠN';
      maDocGia?: string;
      page?: number;
      pageSize?: number;
    }) =>
      apiClient.get<ApiResponse<any[]>>('/api/phieumuontra', { params }),

    getById: (maPhieu: string) =>
      apiClient.get<ApiResponse<any>>(`/api/phieumuontra/${maPhieu}`),

    update: (maPhieu: string, data: Record<string, unknown>) =>
      apiClient.put<ApiResponse<any>>(`/api/phieumuontra/${maPhieu}`, data),

    delete: (maPhieu: string) =>
      apiClient.delete<ApiResponse<void>>(`/api/phieumuontra/${maPhieu}`),

    getCountPending: () => apiClient.get<ApiResponse<number>>('/api/phieumuontra/count-pending'),
  },

  // Fine receipt management
  fineReceipts: {
    getAll: (params?: { maDocGia?: string; page?: number; pageSize?: number }) =>
      apiClient.get<ApiResponse<PhieuThu[]>>('/api/phieuthutienphat', { params }),

    getById: (soPTT: number) =>
      apiClient.get<ApiResponse<PhieuThu>>(`/api/phieuthutienphat/${soPTT}`),

    create: (data: Omit<PhieuThu, 'maPhieu'>) =>
      apiClient.post<ApiResponse<PhieuThu>>('/api/phieuthutienphat', data),

    update: (soPTT: number, data: Partial<PhieuThu>) =>
      apiClient.put<ApiResponse<PhieuThu>>(`/api/phieuthutienphat/${soPTT}`, data),

    delete: (soPTT: number) =>
      apiClient.delete<ApiResponse<void>>(`/api/phieuthutienphat/${soPTT}`),
  },

  /**
   * Update reader's debt (tongNo) based on total fines from all borrow slips
   * Called when a borrow slip is created/updated with tienPhat > 0
   */
  updateReaderDebt: async (maDocGia: string): Promise<void> => {
    try {
      // Get all borrow slips for this reader
      const response = await staffApi.borrowSlips.getAll({ maDocGia });
      const slips = response.data?.result ?? [];

      // Calculate total fines
      const totalFines = slips.reduce((sum: number, slip: any) => {
        return sum + (slip.tienPhat || 0);
      }, 0);

      // Update reader's debt if there are fines
      if (totalFines > 0) {
        await readersApi.docgia.update(maDocGia, { tongNo: totalFines });
      }
    } catch (err) {
      console.error('Failed to update reader debt:', err);
      // Don't throw error, just log it
    }
  },
};
