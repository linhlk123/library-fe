import React, { useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Clock,
  DollarSign,
} from 'lucide-react';
import { useAuthStore } from '../stores';
import ChatWidget from '../components/ChatWidget';

export type StaffViewType =
  | 'DASHBOARD'
  | 'BOOKS'
  | 'BORROW_MANAGEMENT'
  | 'FINE_MANAGEMENT'
  | 'REPORTS'
  | 'USERS'
  | 'REGULATIONS'
  | 'ROLES'
  | 'ACCOUNTS';

interface StaffLayoutProps {
  currentView: StaffViewType;
  onNavigate: (view: StaffViewType) => void;
  children: React.ReactNode;
}

const navigationItems = [
  { id: 'DASHBOARD', label: 'Bảng điều khiển', icon: LayoutDashboard },
  { id: 'BOOKS', label: 'Quản lý sách', icon: BookOpen },
  { id: 'BORROW_MANAGEMENT', label: 'Duyệt mượn sách', icon: Clock },
  { id: 'FINE_MANAGEMENT', label: 'Quản lý phí phạt', icon: DollarSign },
  { id: 'REPORTS', label: 'Báo cáo', icon: BarChart3 },
  { id: 'USERS', label: 'Độc giả', icon: Users },
  { id: 'REGULATIONS', label: 'Quy định', icon: FileText },
  { id: 'ROLES', label: 'Vai trò', icon: Settings },
  { id: 'ACCOUNTS', label: 'Tài khoản', icon: Settings },
] as const;

export default function StaffLayout({
  currentView,
  onNavigate,
  children,
}: StaffLayoutProps) {
  const { user, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-64 bg-white shadow-lg transform transition-transform duration-300 lg:relative lg:transform-none lg:shadow-none ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between border-b px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold bg-gradient-to-br from-emerald-500 to-emerald-700 bg-clip-text text-transparent">⚡</div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">LibConnect</h1>
                <p className="text-xs text-emerald-600 font-semibold">IT Library</p>
              </div>
            </div>
            <button
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 px-4 py-6">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id as StaffViewType);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="border-t px-4 py-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={20} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="border-b bg-gradient-to-r from-white to-emerald-50 px-4 sm:px-6 lg:px-8 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                className="lg:hidden text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu size={24} />
              </button>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-emerald-700 bg-clip-text text-transparent">
                  {navigationItems.find((item) => item.id === currentView)
                    ?.label || 'Quản lý'}
                </h2>
                <p className="text-xs text-gray-500 mt-1">LibConnect LMS • Staff Management</p>
              </div>
            </div>

            {/* User info */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.hoTen || 'Staff'}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.tenDangNhap}
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                {user?.hoTen?.charAt(0) || 'S'}
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* ChatWidget for Staff */}
      <ChatWidget role="STAFF" />
    </div>
  );
}
