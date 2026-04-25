import React from 'react';
import { Menu, Bell, User as UserIcon } from 'lucide-react';
import type { NguoiDung } from '../../types';
import type { ViewState } from '../../App';
import { navItems } from './navItems';
interface HeaderProps {
  user: NguoiDung;
  currentView: ViewState;
  onOpenSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, currentView, onOpenSidebar }) => {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10">
      <div className="flex items-center">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 mr-4"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-semibold text-gray-800 hidden sm:block">
          {navItems.find((i: typeof navItems[0]) => i.id === currentView)?.label}
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        <button className="text-gray-400 hover:text-gray-500 relative">
          <Bell className="h-6 w-6" />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
        </button>

        <div className="flex items-center space-x-3 border-l border-gray-200 pl-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-medium text-gray-900">
              {user.tenDangNhap}
            </span>
            <span className="text-xs text-indigo-600 font-semibold">
              {user.vaiTro}
            </span>
          </div>
          <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">
            <UserIcon size={18} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
