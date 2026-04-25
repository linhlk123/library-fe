import apiClient from './apiClient';
import type { ApiResponse, DauSach, Sach, CuonSach, TheLoai, TacGia, CTTacGia, LoaiDocGia, PageResponse } from '../types';

export const booksApi = {
  // DauSach (book titles)
  dausach: {
    getAll: (params?: { search?: string; page?: number; pageSize?: number }) =>
      apiClient.get<ApiResponse<DauSach[]>>('/api/dausach', { params }),
    getById: (maDauSach: number) =>
      apiClient.get<ApiResponse<DauSach>>(`/api/dausach/${maDauSach}`),
    create: (data: Omit<DauSach, 'maDauSach'>) =>
      apiClient.post<ApiResponse<DauSach>>('/api/dausach', data),
    update: (maDauSach: number, data: Partial<DauSach>) =>
      apiClient.put<ApiResponse<DauSach>>(`/api/dausach/${maDauSach}`, data),
    delete: (maDauSach: number) =>
      apiClient.delete<ApiResponse<void>>(`/api/dausach/${maDauSach}`),
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
  // Sach (book editions)
  sach: {
    getAll: (params?: {
      maDauSach?: string;
      maTheLoai?: string;
      page?: number;
      pageSize?: number;
    }) => apiClient.get<ApiResponse<Sach[]>>('/api/sach', { params }),
    getAllPaginated: (page: number, size: number) =>
      apiClient.get<ApiResponse<PageResponse<Sach>>>('/api/sach', {
        params: { page, size },
      }),
    getById: (maSach: number) =>
      apiClient.get<ApiResponse<Sach>>(`/api/sach/${maSach}`),
    create: (data: Omit<Sach, 'maSach'>) =>
      apiClient.post<ApiResponse<Sach>>('/api/sach', data),
    update: (maSach: number, data: Partial<Sach>) =>
      apiClient.put<ApiResponse<Sach>>(`/api/sach/${maSach}`, data),
    delete: (maSach: number) =>
      apiClient.delete<ApiResponse<void>>(`/api/sach/${maSach}`),
  },

  // CuonSach (book copies)
  cuonsach: {
    getAll: (params?: { maSach?: number; tinhTrang?: string; page?: number; pageSize?: number }) =>
      apiClient.get<ApiResponse<CuonSach[]>>('/api/cuonsach', { params }),
    getById: (maCuonSach: number) =>
      apiClient.get<ApiResponse<CuonSach>>(`/api/cuonsach/${maCuonSach}`),
    create: (data: Omit<CuonSach, 'maCuonSach'>) =>
      apiClient.post<ApiResponse<CuonSach>>('/api/cuonsach', data),
    update: (maCuonSach: number, data: Partial<CuonSach>) =>
      apiClient.put<ApiResponse<CuonSach>>(`/api/cuonsach/${maCuonSach}`, data),
    delete: (maCuonSach: number) =>
      apiClient.delete<ApiResponse<void>>(`/api/cuonsach/${maCuonSach}`),
  },

  // TheLoai (theloai/categories)
  theloai: {
    getAll: () =>
      apiClient.get<ApiResponse<TheLoai[]>>('/api/theloai'),
    getById: (maTheLoai: number) =>
      apiClient.get<ApiResponse<TheLoai>>(`/api/theloai/${maTheLoai}`),
    create: (data: Omit<TheLoai, 'maTheLoai'>) =>
      apiClient.post<ApiResponse<TheLoai>>('/api/theloai', data),
    update: (maTheLoai: number, data: Partial<TheLoai>) =>
      apiClient.put<ApiResponse<TheLoai>>(`/api/theloai/${maTheLoai}`, data),
    delete: (maTheLoai: number) =>
      apiClient.delete<ApiResponse<void>>(`/api/theloai/${maTheLoai}`),    
    getByTheLoai: (maTheLoai: number) =>
    apiClient.get<ApiResponse<DauSach[]>>(`/api/dausach/theloai/${maTheLoai}`),
    getBySach: (maSach: number) =>
  apiClient.get<ApiResponse<CuonSach[]>>(`/api/cuonsach/sach/${maSach}`),
  },

  // TacGia (tacgia)
  tacgia: {
    getAll: (params?: { search?: string; page?: number; pageSize?: number }) =>
      apiClient.get<ApiResponse<TacGia[]>>('/api/tacgia', { params }),
    getById: (maTacGia: number) =>
      apiClient.get<ApiResponse<TacGia>>(`/api/tacgia/${maTacGia}`),
    create: (data: Omit<TacGia, 'maTacGia'>) =>
      apiClient.post<ApiResponse<TacGia>>('/api/tacgia', data),
    update: (maTacGia: number, data: Partial<TacGia>) =>
      apiClient.put<ApiResponse<TacGia>>(`/api/tacgia/${maTacGia}`, data),
    delete: (maTacGia: number) =>
      apiClient.delete<ApiResponse<void>>(`/api/tacgia/${maTacGia}`),
  },

    cttacgia: {
    getAll: () =>
        apiClient.get<ApiResponse<CTTacGia[]>>('/api/ct_tacgia'),
    getByDauSach: (maDauSach: number) =>
        apiClient.get<ApiResponse<CTTacGia[]>>(`/api/ct_tacgia/dausach/${maDauSach}`),
    getByTacGia: (maTacGia: number) =>
        apiClient.get<ApiResponse<CTTacGia[]>>(`/api/ct_tacgia/tacgia/${maTacGia}`),
    create: (data: CTTacGia) =>
        apiClient.post<ApiResponse<CTTacGia>>('/api/ct_tacgia', data),
    delete: (maDauSach: number, maTacGia: number) =>
        apiClient.delete<ApiResponse<void>>(`/api/ct_tacgia/${maDauSach}/${maTacGia}`),
    },

    uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file); 
    return apiClient.post<ApiResponse<{ path: string }>>('/api/dausach/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};

export default booksApi;
