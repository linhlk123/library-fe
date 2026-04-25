import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  BookCheck,
  User,
  LogOut,
  Menu,
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
} from 'lucide-react';
import { useAuthStore } from '../stores';
import ChatWidget from '../components/ChatWidget';

export type UserViewType =
  | 'DASHBOARD'
  | 'CATALOG'
  | 'MY_BORROWINGS'
  | 'PENALTY_FEES'
  | 'PROFILE';

interface UserLayoutProps {
  currentView: UserViewType;
  onNavigate: (view: UserViewType) => void;
  children: React.ReactNode;
}

const navigationItems = [
  { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'CATALOG', label: 'Khám phá', icon: BookOpen },
  { id: 'MY_BORROWINGS', label: 'Đang mượn', icon: BookCheck },
  { id: 'PENALTY_FEES', label: 'Phí phạt', icon: AlertCircle },
  { id: 'PROFILE', label: 'Hồ sơ', icon: User },
] as const;

export default function UserLayout({
  currentView,
  onNavigate,
  children,
}: UserLayoutProps) {
  const { user, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('user-layout-theme') !== 'light';
  });

  useEffect(() => {
    localStorage.setItem('user-layout-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const handleLogout = () => {
    logout();
  };

  const rootBg = isDarkMode ? 'bg-slate-950' : 'bg-gray-50';
  const overlayBg = isDarkMode ? 'bg-black/70' : 'bg-black/40';
  const sidebarBg = isDarkMode
    ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'
    : 'bg-gradient-to-br from-white via-emerald-50 to-white';
  const sidebarBorder = isDarkMode ? 'border-slate-800' : 'border-emerald-100';
  const sidebarMuted = isDarkMode ? 'text-slate-400' : 'text-gray-600';
  const sidebarMutedHover = isDarkMode ? 'hover:text-white' : 'hover:text-gray-900';
  const navDefault = isDarkMode
    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
    : 'text-gray-700 hover:text-gray-900 hover:bg-emerald-50';
  const navActive = 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg';
  const avatarBg = 'bg-gradient-to-br from-emerald-400 to-emerald-600';
  const headerBg = isDarkMode
    ? 'bg-gradient-to-r from-slate-900 to-slate-800 border-slate-800'
    : 'bg-gradient-to-r from-white to-emerald-50 border-emerald-100';
  const titleGradient = 'bg-gradient-to-r from-emerald-500 to-emerald-700 bg-clip-text text-transparent';
  const headerSub = isDarkMode ? 'text-slate-400' : 'text-gray-500';
  const mainBg = isDarkMode
    ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950'
    : 'bg-gradient-to-br from-gray-50 via-emerald-50 to-white';

  return (
    <div className={`flex h-screen ${rootBg}`}>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className={`fixed inset-0 z-40 lg:hidden ${overlayBg}`}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Premium Sidebar - Slim to Wide */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen shadow-2xl transform transition-all duration-300 lg:relative lg:transform-none lg:shadow-none ${sidebarBg} ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          sidebarExpanded ? 'w-64' : 'w-20'
        }`}
      >
        <div className={`flex h-full flex-col border-r ${sidebarBorder}`}>
          {/* Logo & Brand */}
          <div className={`flex items-center justify-between border-b px-4 py-6 ${sidebarBorder}`}>
            {sidebarExpanded && (
              <div className="flex items-center gap-3">
                <div className="text-2xl font-bold bg-gradient-to-br from-emerald-500 to-emerald-700 bg-clip-text text-transparent">⚡</div>
                <div>
                  <h1 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>LibConnect</h1>
                  <p className={`text-xs ${sidebarMuted}`}>IT Library</p>
                </div>
              </div>
            )}
            {!sidebarExpanded && <div className="text-2xl font-bold text-center flex-1">⚡</div>}
            <button
              className={`lg:hidden transition-colors ${sidebarMuted} ${sidebarMutedHover}`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 px-3 py-6 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id as UserViewType);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? navActive
                      : navDefault
                  }`}
                  title={!sidebarExpanded ? item.label : ''}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {sidebarExpanded && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* User Profile */}
          {sidebarExpanded && (
            <div className={`border-t px-4 py-4 space-y-4 ${sidebarBorder}`}>
              <div className="flex items-center gap-3 px-2">
                <div className={`h-10 w-10 rounded-xl ${avatarBg} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                  {user?.hoTen?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {user?.hoTen || 'User'}
                  </p>
                  <p className={`text-xs truncate ${sidebarMuted}`}>
                    {user?.tenDangNhap}
                  </p>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={20} />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}

          {/* Sidebar Toggle */}
          <div className={`hidden lg:block border-t p-4 ${sidebarBorder}`}>
            <button
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              className={`w-full flex items-center justify-center rounded-xl py-3 transition-colors ${sidebarMuted} ${sidebarMutedHover} ${
                isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-emerald-50'
              }`}
              title={sidebarExpanded ? 'Collapse' : 'Expand'}
            >
              {sidebarExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Premium Header */}
        <header className={`border-b px-4 sm:px-6 lg:px-8 py-4 shadow-lg backdrop-blur-sm ${headerBg}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                className={`lg:hidden transition-colors ${isDarkMode ? 'text-slate-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu size={24} />
              </button>
              <div>
                <h2 className={`text-2xl font-bold ${titleGradient}`}>
                  {navigationItems.find((item) => item.id === currentView)
                    ?.label || 'Dashboard'}
                </h2>
                <p className={`text-xs mt-1 ${headerSub}`}>LibConnect LMS • IT-focused Library System</p>
              </div>
            </div>

            <button
              onClick={() => setIsDarkMode((prev) => !prev)}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium border transition-colors ${
                isDarkMode
                  ? 'border-slate-700 text-slate-200 hover:bg-slate-800'
                  : 'border-emerald-200 text-gray-700 hover:bg-emerald-50'
              }`}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
              <span>{isDarkMode ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </header>

        {/* Main content area */}
        <main className={`flex-1 overflow-y-auto ${mainBg}`}>
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* ChatWidget for Users - with backdrop blur */}
      <ChatWidget role="USER" />
    </div>
  );
}
