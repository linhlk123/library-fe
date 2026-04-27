import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Library as LibraryIcon,
  LogOut,
} from 'lucide-react';
import type { ViewState } from '../../App';
import { useRole } from '../../hooks/useRole';
import { navItems } from './navItems';
import { staffApi } from '../../services/staffApi';

interface SidebarProps {
  currentView: ViewState;
  isSidebarOpen: boolean;
  onNavigate: (view: ViewState) => void;
  onCloseSidebar: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  isSidebarOpen,
  onNavigate,
  onCloseSidebar,
  onLogout,
}) => {
  const { canAccessView } = useRole();

  const { data: pendingCount = 0 } = useQuery({
    queryKey: ['staff-borrow-pending-count'],
    queryFn: async () => {
      const response = await staffApi.borrowSlips.getCountPending();
      return response.data.result ?? 0;
    },
    refetchInterval: 10000,
    staleTime: 5000,
  });

  // Filter menu items based on user permissions
  const accessibleItems = navItems.filter(item => canAccessView(item.id));

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 z-20 lg:hidden backdrop-blur-sm"
          onClick={onCloseSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30 w-64 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col shadow-lg lg:shadow-none
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-16 flex items-center px-6 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-indigo-700 shadow-sm">
          <LibraryIcon className="h-8 w-8 text-white mr-3" />
          <span className="text-xl font-bold text-white">
            Thư Viện
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {accessibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const showPendingDot =
              pendingCount > 0 &&
              (item.id === 'BORROW_SLIP_MANAGER' || item.id === 'BORROW_RETURN');
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onCloseSidebar();
                }}
                className={`w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                }`}
              >
                <Icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-indigo-600'}`}
                />
                <span className="truncate">{item.label}</span>
                {showPendingDot && (
                  <span className="ml-2 inline-flex h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-red-200" aria-label="Có yêu cầu chờ duyệt mới" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 bg-white">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
          >
            <LogOut className="mr-2 h-5 w-5" />
            Đăng xuất
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

