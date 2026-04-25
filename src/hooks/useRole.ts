import { useAuthStore } from '../stores';
import { hasPermission, hasStaffFullAccess, getAccessibleViews } from '../utils/permissions';
import type { ViewState } from '../App';

export const useRole = () => {
  const role = useAuthStore((s) => s.role);
  return {
    isStaff: role === 'STAFF',
    isUser: role === 'USER',
    can: (allowedRoles: Array<'USER' | 'STAFF'>) => 
      role ? allowedRoles.includes(role) : false,
    // Check if current role has permission to access a specific view/page
    canAccessView: (view: ViewState) => hasPermission(role, view),
    // Check if STAFF has full access to all pages
    hasStaffFullAccess: () => hasStaffFullAccess(role),
    // Get all accessible views for current role
    getAccessibleViews: () => getAccessibleViews(role),
  };
};