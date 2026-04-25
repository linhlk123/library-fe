import apiClient from './apiClient';
import type { ApiResponse } from '../types';

export interface VaiTro {
  tenVaiTro: string;
  moTaVaiTro?: string;
  phanQuyen?: PhanQuyen[];
}

export interface PhanQuyen {
  tenQuyen: string;
  moTaQuyenHan?: string;
}

export const rolesApi = {
  // Roles
  roles: {
    getAll: () =>
      apiClient.get<ApiResponse<VaiTro[]>>('/roles'),
    create: (data: VaiTro) =>
      apiClient.post<ApiResponse<VaiTro>>('/roles', data),
    delete: (tenVaiTro: string) =>
      apiClient.delete<ApiResponse<void>>(`/roles/${tenVaiTro}`),
  },

  // Permissions
  permissions: {
    getAll: () =>
      apiClient.get<ApiResponse<PhanQuyen[]>>('/permissions'),
    create: (data: PhanQuyen) =>
      apiClient.post<ApiResponse<PhanQuyen>>('/permissions', data),
    delete: (tenQuyen: string) =>
      apiClient.delete<ApiResponse<void>>(`/permissions/${tenQuyen}`),
  },
};

export default rolesApi;
