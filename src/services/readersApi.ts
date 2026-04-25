import apiClient from './apiClient';
import type { ApiResponse, DocGia, LoaiDocGia } from '../types';

export interface CreateDocGiaPayload {
  maDocGia: string;
  maLoaiDocGia: number;
  ngayLapThe: string;
  ngayHetHan: string;
}

export const readersApi = {
    docgia: {
    getAll: (params?: {
      maLoaiDocGia?: number;
      debtStatus?: 'ALL' | 'NO_DEBT' | 'HAS_DEBT';
      search?: string;
      page?: number;
      pageSize?: number;
    }) => apiClient.get<ApiResponse<DocGia[]>>('/api/docgia', { params }),

    getById: (maDocGia: string) =>
      apiClient.get<ApiResponse<DocGia>>(`/api/docgia/${maDocGia}`),

    create: (data: CreateDocGiaPayload) =>
      apiClient.post<ApiResponse<DocGia>>('/api/docgia', data),

    update: (maDocGia: string, data: Partial<DocGia>) =>
      apiClient.put<ApiResponse<DocGia>>(`/api/docgia/${maDocGia}`, data),

    delete: (maDocGia: string) =>
      apiClient.delete<ApiResponse<void>>(`/api/docgia/${maDocGia}`),
  },

    loaidocgia: {
    getAll: () =>
      apiClient.get<ApiResponse<LoaiDocGia[]>>('/api/loaidocgia'),

    getById: (id: number) =>
      apiClient.get<ApiResponse<LoaiDocGia>>(`/api/loaidocgia/${id}`),

    create: (data: Omit<LoaiDocGia, 'maLoaiDocGia'>) =>
      apiClient.post<ApiResponse<LoaiDocGia>>('/api/loaidocgia', data),

    update: (id: number, data: Partial<LoaiDocGia>) =>
      apiClient.put<ApiResponse<LoaiDocGia>>(`/api/loaidocgia/${id}`, data),

    delete: (id: number) =>
      apiClient.delete<ApiResponse<void>>(`/api/loaidocgia/${id}`),
  },
};

export default readersApi;
