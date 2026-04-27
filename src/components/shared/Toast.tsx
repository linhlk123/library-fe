import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import type { Notification } from '../../types';

interface ToastProps {
  notification: Notification;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ notification, onClose }) => {
  const bgColor = {
    SUCCESS: 'bg-green-50 border-green-200',
    ERROR: 'bg-red-50 border-red-200',
    WARNING: 'bg-yellow-50 border-yellow-200',
    INFO: 'bg-blue-50 border-blue-200',
  };

  const textColor = {
    SUCCESS: 'text-green-800',
    ERROR: 'text-red-800',
    WARNING: 'text-yellow-800',
    INFO: 'text-blue-800',
  };

  const icons = {
    SUCCESS: <CheckCircle className="w-5 h-5 text-green-600" />,
    ERROR: <AlertCircle className="w-5 h-5 text-red-600" />,
    WARNING: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
    INFO: <Info className="w-5 h-5 text-blue-600" />,
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${bgColor[notification.type as keyof typeof bgColor]}`}
      role="alert"
    >
      {icons[notification.type as keyof typeof icons]}
      <span className={`flex-1 text-sm font-medium ${textColor[notification.type as keyof typeof textColor]}`}>
        {notification.message}
      </span>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600"
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};

interface ToastContainerProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  notifications,
  onRemove,
}) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          notification={notification}
          onClose={() => onRemove(notification.id)}
        />
      ))}
    </div>
  );
};
