import apiClient from './apiClient';
import type { ApiResponse, ThongBao } from '../types';

interface CreateNotificationRequest {
  tieuDe: string;
  noiDung: string;
  loaiThongBao: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
  nguoiNhan: string; // user ID
}

interface SendBroadcastRequest {
  tieuDe: string;
  noiDung: string;
  loaiThongBao: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
}

interface UnreadCountResponse {
  unreadCount: number;
}

const notificationApi = {
  /**
   * Lấy danh sách thông báo của người dùng hiện tại
   * GET /api/thongbao/me
   */
  getMyNotifications: async () => {
    try {
      const response = await apiClient.get<ApiResponse<ThongBao[]>>(
        '/api/thongbao/me'
      );
      return {
        success: true,
        data: response.data?.result ?? [],
      };
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return {
        success: false,
        data: [],
        error,
      };
    }
  },

  /**
   * Lấy số lượng thông báo chưa đọc
   * GET /api/thongbao/unread-count
   */
  getUnreadCount: async () => {
    try {
      const response = await apiClient.get<ApiResponse<UnreadCountResponse>>(
        '/api/thongbao/unread-count'
      );
      return {
        success: true,
        data: response.data?.result?.unreadCount ?? 0,
      };
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      return {
        success: false,
        data: 0,
        error,
      };
    }
  },

  /**
   * Lấy chi tiết một thông báo
   * GET /api/thongbao/{id}
   */
  getNotificationById: async (id: number) => {
    try {
      const response = await apiClient.get<ApiResponse<ThongBao>>(
        `/api/thongbao/${id}`
      );
      return {
        success: true,
        data: response.data?.result,
      };
    } catch (error) {
      console.error(`Failed to fetch notification ${id}:`, error);
      return {
        success: false,
        data: null,
        error,
      };
    }
  },

  /**
   * Tạo một thông báo mới
   * POST /api/thongbao
   */
  createNotification: async (payload: CreateNotificationRequest) => {
    try {
      const response = await apiClient.post<ApiResponse<ThongBao>>(
        '/api/thongbao',
        payload
      );
      return {
        success: true,
        data: response.data?.result,
      };
    } catch (error) {
      console.error('Failed to create notification:', error);
      return {
        success: false,
        data: null,
        error,
      };
    }
  },

  /**
   * Gửi thông báo broadcast cho tất cả người dùng
   * POST /api/thongbao/broadcast
   */
  sendBroadcast: async (payload: SendBroadcastRequest) => {
    try {
      const response = await apiClient.post<ApiResponse<{ success: boolean }>>(
        '/api/thongbao/broadcast',
        payload
      );
      return {
        success: true,
        data: response.data?.result?.success ?? false,
      };
    } catch (error) {
      console.error('Failed to send broadcast:', error);
      return {
        success: false,
        data: false,
        error,
      };
    }
  },

  /**
   * Đánh dấu một thông báo là đã đọc
   * PUT /api/thongbao/{id}/read
   */
  markAsRead: async (id: number) => {
    try {
      const response = await apiClient.put<ApiResponse<ThongBao>>(
        `/api/thongbao/${id}/read`
      );
      return {
        success: true,
        data: response.data?.result,
      };
    } catch (error) {
      console.error(`Failed to mark notification ${id} as read:`, error);
      return {
        success: false,
        data: null,
        error,
      };
    }
  },

  /**
   * Đánh dấu tất cả thông báo là đã đọc
   * PUT /api/thongbao/read-all
   */
  markAllAsRead: async () => {
    try {
      const response = await apiClient.put<ApiResponse<{ success: boolean }>>(
        '/api/thongbao/read-all'
      );
      return {
        success: true,
        data: response.data?.result?.success ?? false,
      };
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      return {
        success: false,
        data: false,
        error,
      };
    }
  },

  /**
   * Xóa một thông báo
   * DELETE /api/thongbao/{id}
   */
  deleteNotification: async (id: number) => {
    try {
      const response = await apiClient.delete<ApiResponse<{ success: boolean }>>(
        `/api/thongbao/${id}`
      );
      return {
        success: true,
        data: response.data?.result?.success ?? false,
      };
    } catch (error) {
      console.error(`Failed to delete notification ${id}:`, error);
      return {
        success: false,
        data: false,
        error,
      };
    }
  },
};

export default notificationApi;

