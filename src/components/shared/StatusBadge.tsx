import React from 'react';

type BadgeType = 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO' | 'DEFAULT';

interface StatusBadgeProps {
  status: string;
  type?: BadgeType;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = 'DEFAULT',
  className = '',
}) => {
  const baseClass = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

  const typeClasses = {
    SUCCESS: 'bg-green-100 text-green-800',
    ERROR: 'bg-red-100 text-red-800',
    WARNING: 'bg-yellow-100 text-yellow-800',
    INFO: 'bg-blue-100 text-blue-800',
    DEFAULT: 'bg-gray-100 text-gray-800',
  };

  // Auto-detect type from status
  let detectedType = type;
  if (type === 'DEFAULT') {
    const statusUpper = status.toUpperCase();
    if (['ACTIVE', 'AVAILABLE', 'PAID'].includes(statusUpper)) {
      detectedType = 'SUCCESS';
    } else if (['OVERDUE', 'LOST', 'DAMAGED', 'UNPAID'].includes(statusUpper)) {
      detectedType = 'ERROR';
    } else if (['BORROWED', 'PENDING'].includes(statusUpper)) {
      detectedType = 'WARNING';
    }
  }

  return (
    <span className={`${baseClass} ${typeClasses[detectedType]} ${className}`}>
      {status}
    </span>
  );
};

interface RoleBadgeProps {
  role: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  const roleColors: Record<string, string> = {
    ADMIN: 'bg-purple-100 text-purple-800',
    LIBRARIAN: 'bg-blue-100 text-blue-800',
    STAFF: 'bg-indigo-100 text-indigo-800',
    PATRON: 'bg-gray-100 text-gray-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        roleColors[role] || roleColors.PATRON
      }`}
    >
      {role}
    </span>
  );
};
