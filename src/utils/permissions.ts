import type { ViewState } from '../App';
import type { TenVaiTro } from '../types';

// Define permissions for each role
export const rolePermissions: Record<TenVaiTro, ViewState[]> = {
  'STAFF': [
    'READER_CARD',
    'READER_TYPES',
    'NEW_BOOK',
    'CATEGORIES',
    'AUTHORS',
    'CATALOG',
    'BORROW_RETURN',
    'FINE_RECEIPT',
    'BORROW_SLIP_MANAGER',
    'FINE_RECEIPT_MANAGER',
    'REPORTS',
    'REGULATIONS',
    'USER_ROLES',
    'USER_ACCOUNTS',
  ],
  'USER': [],
};

/**
 * Check if a role has permission to access a specific view
 */
export const hasPermission = (role: TenVaiTro | null, view: ViewState): boolean => {
  if (!role) return false;
  return rolePermissions[role]?.includes(view) ?? false;
};

/**
 * Get all accessible views for a role
 */
export const getAccessibleViews = (role: TenVaiTro | null): ViewState[] => {
  if (!role) return [];
  return rolePermissions[role] ?? [];
};

/**
 * Check if STAFF role has full access to pages (all views)
 */
export const hasStaffFullAccess = (role: TenVaiTro | null): boolean => {
  if (role !== 'STAFF') return false;
  const allViews: ViewState[] = [
    'READER_CARD',
    'READER_TYPES',
    'NEW_BOOK',
    'CATEGORIES',
    'AUTHORS',
    'CATALOG',
    'BORROW_RETURN',
    'FINE_RECEIPT',
    'BORROW_SLIP_MANAGER',
    'FINE_RECEIPT_MANAGER',
    'REPORTS',
    'REGULATIONS',
    'USER_ROLES',
    'USER_ACCOUNTS',
  ];
  return rolePermissions['STAFF'].length === allViews.length &&
    allViews.every(view => rolePermissions['STAFF'].includes(view));
};
