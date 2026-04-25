import apiClient from './apiClient';
import type { ApiResponse, NguoiDung, AuthTokenResponse } from '../types';

export const authApi = {
  login: (data: { tenDangNhap: string; matKhau: string }) =>
    apiClient.post<ApiResponse<AuthTokenResponse>>('/api/v1/auth/token', data),

signup: (data: {
  tenDangNhap: string;
  hoTen: string;
  email: string;
  ngaySinh: string;
  matKhau: string;
}) =>
  apiClient.post<ApiResponse<{ message: string }>>('/api/v1/users', {
    ...data,
    diaChi: '',          
    tenVaiTro: 'USER',   
  }),

  refresh: () =>
    apiClient.post<ApiResponse<AuthTokenResponse>>('/api/v1/auth/refresh'),

  logout: () =>
    apiClient.post('/api/v1/auth/logout'),

  getProfile: () =>
    apiClient.get<ApiResponse<NguoiDung>>('/api/v1/users/me'),
};

export default authApi;
