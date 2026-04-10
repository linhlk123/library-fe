import React from 'react';
import {
  BookOpen,
  Library as LibraryIcon,
  LogOut,
  IdCard,
  Users,
  BookPlus,
  Shapes,
  Pencil,
  ClipboardList,
  Receipt,
  ChartColumn,
  SlidersHorizontal,
  Shield,
  UserPlus,
} from 'lucide-react';
import type { ViewState } from '../../App';

interface SidebarProps {
  currentView: ViewState;
  isSidebarOpen: boolean;
  onNavigate: (view: ViewState) => void;
  onCloseSidebar: () => void;
  onLogout: () => void;
}

const navItems = [
  { id: 'READER_CARD' as const, label: 'Lap the doc gia', icon: IdCard },
  {
    id: 'READER_TYPES' as const,
    label: 'Nhap danh sach loai doc gia',
    icon: Users,
  },
  { id: 'NEW_BOOK' as const, label: 'Tiep nhan sach moi', icon: BookPlus },
  { id: 'CATEGORIES' as const, label: 'Nhap danh sach the loai', icon: Shapes },
  { id: 'AUTHORS' as const, label: 'Nhap danh sach tac gia', icon: Pencil },
  { id: 'CATALOG' as const, label: 'Tra cuu sach', icon: BookOpen },
  {
    id: 'BORROW_RETURN' as const,
    label: 'Lap phieu muon tra sach',
    icon: ClipboardList,
  },
  {
    id: 'FINE_RECEIPT' as const,
    label: 'Lap phieu thu tien phat',
    icon: Receipt,
  },
  { id: 'REPORTS' as const, label: 'Lap bao cao', icon: ChartColumn },
  {
    id: 'REGULATIONS' as const,
    label: 'Thay doi quy dinh',
    icon: SlidersHorizontal,
  },
  { id: 'USER_ROLES' as const, label: 'Phan quyen nguoi dung', icon: Shield },
  { id: 'USER_ACCOUNTS' as const, label: 'Tao tai khoan user', icon: UserPlus },
];

const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  isSidebarOpen,
  onNavigate,
  onCloseSidebar,
  onLogout,
}) => {
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
          fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <LibraryIcon className="h-8 w-8 text-indigo-600 mr-3" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-800">
            EduLib
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onCloseSidebar();
                }}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 mb-1 shadow-sm border border-indigo-100/50'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon
                  className={`mr-3 h-5 w-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}
                />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onLogout}
            className="w-full flex items-center px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export { navItems };
export default Sidebar;
