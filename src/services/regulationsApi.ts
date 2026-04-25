import apiClient from './apiClient';
import type { ApiResponse, ThamSo } from '../types';

export const regulationsApi = {
  // ThamSo (Regulations/Parameters)
  thamso: {
    getAll: () =>
      apiClient.get<ApiResponse<ThamSo[]>>('/api/thamso'),
    getByKey: (tenThamSo: string) =>
      apiClient.get<ApiResponse<ThamSo>>(`/api/thamso/${tenThamSo}`),
    create: (data: Omit<ThamSo, 'tenThamSo'> & { tenThamSo: string }) =>
      apiClient.post<ApiResponse<ThamSo>>('/api/thamso', data),
    update: (tenThamSo: string, data: Partial<ThamSo>) =>
      apiClient.put<ApiResponse<ThamSo>>(`/api/thamso/${tenThamSo}`, data),
    delete: (tenThamSo: string) =>
      apiClient.delete<ApiResponse<void>>(`/api/thamso/${tenThamSo}`),
  },
};

export default regulationsApi;
