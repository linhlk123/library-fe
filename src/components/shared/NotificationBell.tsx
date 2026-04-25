import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import notificationApi from '../../services/notificationApi';
import {
  Bell,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import type { ThongBao } from '../../types';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<ThongBao[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch unread count
  const { data: unreadCountData } = useQuery({
    queryKey: ['unread-count'],
    queryFn: async () => {
      const response = await notificationApi.getUnreadCount();
      return response.data ?? 0;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 1,
  });

  // Update unread count when data changes
  useEffect(() => {
    if (unreadCountData !== undefined) {
      setUnreadCount(unreadCountData);
    }
  }, [unreadCountData]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await notificationApi.getMyNotifications();
      if (response.success) {
        setNotifications(response.data ?? []);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  // Mark single notification as read
  const handleMarkAsRead = useCallback(
    async (id: number) => {
      try {
        const response = await notificationApi.markAsRead(id);
        if (response.success) {
          // Update local state immediately for smooth UI
          setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, daDoc: true } : n))
          );
          // Update unread count
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    },
    []
  );

  // Mark all notifications as read
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      const response = await notificationApi.markAllAsRead();
      if (response.success) {
        // Update local state immediately
        setNotifications((prev) => prev.map((n) => ({ ...n, daDoc: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, []);

  // Delete notification
  const handleDeleteNotification = useCallback(
    async (e: React.MouseEvent, id: number) => {
      e.stopPropagation(); // Prevent triggering mark as read
      try {
        const response = await notificationApi.deleteNotification(id);
        if (response.success) {
          // Remove from local state immediately
          setNotifications((prev) => prev.filter((n) => n.id !== id));
          // Update unread count if was unread
          const deletedNotification = notifications.find((n) => n.id === id);
          if (deletedNotification && !deletedNotification.daDoc) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
        }
      } catch (error) {
        console.error('Failed to delete notification:', error);
      }
    },
    [notifications]
  );

  // Get icon based on notification type
  const getNotificationIcon = (type: ThongBao['loaiThongBao']) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle size={18} className="text-green-600 flex-shrink-0" />;
      case 'WARNING':
        return (
          <AlertTriangle size={18} className="text-amber-600 flex-shrink-0" />
        );
      case 'ERROR':
        return <AlertCircle size={18} className="text-red-600 flex-shrink-0" />;
      case 'INFO':
      default:
        return <Info size={18} className="text-blue-600 flex-shrink-0" />;
    }
  };

  // Format date time
  const formatDateTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('vi-VN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-700 hover:text-indigo-600 transition-colors duration-200 rounded-lg hover:bg-gray-100"
        aria-label="Notifications"
      >
        <Bell size={24} />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <div className="absolute top-1 right-1 flex items-center justify-center">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-red-600 text-white text-xs font-bold shadow-lg animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </div>
        )}
      </button>

      {/* Dropdown Menu - Glassmorphism */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 rounded-2xl bg-white/90 backdrop-blur-md shadow-2xl border border-white/20 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/50 bg-gradient-to-r from-indigo-50/60 to-blue-50/60">
            <h3 className="text-lg font-bold text-gray-900">📬 Thông báo</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 px-3 py-1.5 rounded-full bg-indigo-100/70 hover:bg-indigo-100 transition-all duration-200 hover:shadow-sm"
              >
                ✓ Đánh dấu tất cả
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              // Loading skeleton
              <div className="space-y-3 p-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 bg-gray-200/50 rounded-lg animate-pulse"
                  ></div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Bell className="mx-auto text-gray-300 mb-3" size={32} />
                <p className="text-sm text-gray-500 font-medium">
                  Không có thông báo nào
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => {
                      if (!notification.daDoc) {
                        handleMarkAsRead(notification.id);
                      }
                    }}
                    className={`w-full px-6 py-4 text-left transition-all duration-200 hover:bg-gray-50/80 group ${
                      notification.daDoc
                        ? 'bg-white'
                        : 'bg-indigo-50/50 hover:bg-indigo-50/70'
                    }`}
                  >
                    <div className="flex gap-3 items-start">
                      {/* Icon */}
                      <div className="mt-1 flex-shrink-0">
                        {getNotificationIcon(notification.loaiThongBao)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4
                            className={`text-sm font-semibold truncate ${
                              notification.daDoc
                                ? 'text-gray-600'
                                : 'text-gray-900'
                            }`}
                          >
                            {notification.tieuDe}
                          </h4>
                          {!notification.daDoc && (
                            <span className="flex-shrink-0 inline-flex h-2.5 w-2.5 rounded-full bg-indigo-600 shadow-sm"></span>
                          )}
                        </div>
                        <p
                          className={`text-xs mt-1.5 line-clamp-2 leading-relaxed ${
                            notification.daDoc
                              ? 'text-gray-500'
                              : 'text-gray-700'
                          }`}
                        >
                          {notification.noiDung}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatDateTime(notification.ngayTao)}
                        </p>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => handleDeleteNotification(e, notification.id)}
                        className="flex-shrink-0 ml-2 p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50/50 opacity-0 group-hover:opacity-100 transition-all duration-200"
                        aria-label="Delete notification"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-6 py-3 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-gray-50/30 text-center">
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Đóng
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;

