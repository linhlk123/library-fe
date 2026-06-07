import React, { useState } from 'react';
import {
  BookOpen,
  Users,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  DollarSign,
  Search,
  Bell,
  PlusCircle,
  Tags,
  PenTool,
  UserCog,
  RefreshCcw,
  ClipboardList,
  Receipt,
  ShieldCheck
} from 'lucide-react';
import { useAuthStore } from '../stores';
import ChatWidget from '../components/ChatWidget';
import { useQuery } from '@tanstack/react-query';
import { staffApi } from '../services/staffApi';

export type StaffViewType =
  | 'DASHBOARD'
  | 'READER_CARD'
  | 'READER_TYPES'
  | 'NEW_BOOK'
  | 'CATEGORIES'
  | 'AUTHORS'
  | 'CATALOG'
  | 'BORROW_RETURN'
  | 'FINE_RECEIPT'
  | 'BORROW_SLIP_MANAGER'
  | 'FINE_RECEIPT_MANAGER'
  | 'REPORTS'
  | 'REGULATIONS'
  | 'USER_ROLES'
  | 'USER_ACCOUNTS';

interface StaffLayoutProps {
  currentView: StaffViewType;
  onNavigate: (view: StaffViewType) => void;
  children: React.ReactNode;
}

// Đã cập nhật ID cho khớp với StaffViewType
const navigationItems = [
  //{ id: 'DASHBOARD', label: 'Bảng Điều Khiển', icon: BarChart3 },
  { id: 'CATALOG', label: 'Danh Mục Sách', icon: BookOpen },
  { id: 'NEW_BOOK', label: 'Nhập Sách Mới', icon: PlusCircle },
  { id: 'CATEGORIES', label: 'Thể Loại', icon: Tags },
  { id: 'AUTHORS', label: 'Tác Giả', icon: PenTool },
  { id: 'READER_CARD', label: 'Thẻ Độc Giả', icon: Users },
  { id: 'READER_TYPES', label: 'Loại Độc Giả', icon: UserCog },
  { id: 'BORROW_RETURN', label: 'Mượn & Trả', icon: RefreshCcw },
  { id: 'BORROW_SLIP_MANAGER', label: 'Phiếu Mượn', icon: ClipboardList },
  { id: 'FINE_RECEIPT', label: 'Phạt Tiền', icon: Receipt },
  { id: 'FINE_RECEIPT_MANAGER', label: 'Quản Lý Phạt', icon: DollarSign },
  { id: 'REPORTS', label: 'Báo Cáo', icon: BarChart3 },
  { id: 'REGULATIONS', label: 'Quy Định', icon: FileText },
  { id: 'USER_ROLES', label: 'Vai Trò', icon: ShieldCheck },
  { id: 'USER_ACCOUNTS', label: 'Tài Khoản', icon: Settings },
] as const;

// Modern Library Logo Component
const ModernStaffLogo = () => (
  <svg viewBox="0 0 40 40" className="w-10 h-10" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="staffLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6EE7B7" />
        <stop offset="100%" stopColor="#10B981" />
      </linearGradient>
    </defs>
    <path d="M 12 8 L 8 12 L 8 32 Q 8 35 12 35 L 20 35 L 20 8 Z" 
          fill="url(#staffLogoGrad)" opacity="0.9"/>
    <path d="M 28 8 L 32 12 L 32 32 Q 32 35 28 35 L 20 35 L 20 8 Z" 
          fill="url(#staffLogoGrad)" opacity="0.7"/>
    <circle cx="14" cy="18" r="1.5" fill="#10B981" opacity="0.8"/>
    <circle cx="26" cy="20" r="1.5" fill="#10B981" opacity="0.8"/>
  </svg>
);

export default function StaffLayout({
  currentView,
  onNavigate,
  children,
}: StaffLayoutProps) {
  const { user, logout, token } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch pending borrow count for notification badge
  const { data: borrowData } = useQuery({
    queryKey: ['borrowSlips', 'pending', 'count'],
    queryFn: () => staffApi.borrowSlips.getCountPending(),
    enabled: !!token,
  });

  const pendingCount = borrowData?.data?.result ?? 0;

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-white via-cyan-50 to-emerald-50 overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      </div>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Glass-morphism Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-72 transform transition-transform duration-300 lg:relative lg:transform-none ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar glass background */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-xl border border-white/30"></div>
        
        <div className="relative flex h-full flex-col">
          {/* Logo Section */}
          <div className="flex items-center justify-between border-b border-white/20 px-6 py-6">
            <div className="flex items-center gap-3">
              <ModernStaffLogo />
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  EduLib
                </h1>
                <p className="text-xs font-semibold text-emerald-600">Bảng Quản Lý</p>
              </div>
            </div>
            <button
              className="lg:hidden text-slate-600 hover:text-slate-900 transition-colors"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 px-4 py-6 overflow-y-auto custom-scrollbar">
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200/30'
                      : 'text-slate-700 hover:bg-white/40 hover:text-emerald-600'
                  }`}
                >
                  <Icon size={18} strokeWidth={2} />
                  <span>{item.label}</span>
                  {/* Cập nhật ID check badge notification */}
                  {item.id === 'BORROW_SLIP_MANAGER' && pendingCount > 0 && (
                    <span className="ml-auto inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold">
                      {pendingCount > 9 ? '9+' : pendingCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="border-t border-white/20 px-4 py-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-200/30 transition-all duration-200"
            >
              <LogOut size={18} strokeWidth={2} />
              <span>Đăng Xuất</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-0">
        {/* Premium Header */}
        <header className="relative z-10">
          <div className="absolute inset-0 bg-white/40 backdrop-blur-xl border-b border-white/30"></div>
          <div className="relative px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between gap-6">
              {/* Left: Menu toggle & Title */}
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <button
                  className="lg:hidden text-slate-600 hover:text-slate-900 transition-colors flex-shrink-0"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <Menu size={24} />
                </button>
                <div className="min-w-0">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent truncate">
                    {navigationItems.find((item) => item.id === currentView)
                      ?.label || 'Staff Panel'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Quản lý các hoạt động thư viện hiệu quả</p>
                </div>
              </div>

              {/* Right: Search, Notification & User Profile */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {/* Search Bar */}
                <div className="hidden sm:flex items-center gap-2 bg-white/40 backdrop-blur-xl border border-white/30 rounded-xl px-4 py-2 hover:bg-white/50 transition-all duration-200">
                  <Search size={18} className="text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none w-32"
                  />
                </div>

                {/* Notification Bell */}
                <button className="relative p-2 rounded-xl bg-white/40 backdrop-blur-xl border border-white/30 hover:bg-white/50 transition-all duration-200 text-slate-600">
                  <Bell size={20} strokeWidth={1.5} />
                  {pendingCount > 0 && (
                    <span className="absolute top-1 right-1 inline-flex items-center justify-center h-4 w-4 rounded-full bg-red-500 text-white text-xs font-bold">
                      {pendingCount > 9 ? '9+' : pendingCount}
                    </span>
                  )}
                </button>

                {/* User Profile */}
                <div className="flex items-center gap-3 pl-3 border-l border-white/30">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-slate-800">
                      {user?.hoTen || 'Staff'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {user?.tenDangNhap}
                    </p>
                  </div>
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-200/40">
                    {user?.hoTen?.charAt(0) || 'S'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto relative z-0">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Floating Chat Widget */}
      <ChatWidget role="STAFF" />

      {/* Animation Keyframes */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        /* Custom Scrollbar for navigation */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.4);
        }
      `}</style>
    </div>
  );
}