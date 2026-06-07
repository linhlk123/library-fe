import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore, useUIStore } from './stores';
import { queryClient } from './lib/queryClient';
import { ToastContainer } from './components/shared/Toast';
import AuthLayout from './components/LoginView';
import UserLayout, { type UserViewType } from './layouts/UserLayout';
import StaffLayout from './layouts/StaffLayout';

// Admin views
//import DashboardView from './pages/staff/DashboardView';
import ReaderCardView from './pages/ReaderCard';
import ReaderTypesView from './pages/ReaderTypes'; // Đã thêm import
import NewBookIntakeView from './pages/NewBook'; // Đã thêm import
import CategoriesView from './pages/Categories'; // Đã thêm import
import AuthorsView from './pages/Authors'; // Đã thêm import
import CatalogView from './pages/BookSearch';
import BorrowReturnSlipView from './pages/BorrowReturn'; // Đã thêm import
import FineReceiptView from './pages/FineReceipt'; // Đã thêm import
import BorrowSlipManagerViewNew from './pages/staff/BorrowSlipManagerViewNew';
import FineReceiptManagerViewNew from './pages/staff/FineReceiptManagerViewNew';
import ReportsView from './pages/Reports';
import RegulationsView from './pages/Regulations';
import UserRolesView from './pages/UserRoles';
import UserAccountsView from './pages/UserAccounts';

// User views
import UserDashboardView from './views/user/UserDashboardView';
import MyReaderCardView from './views/user/MyReaderCardView';
import CatalogViewWithCart from './views/user/CatalogViewWithCart';
import ActiveBorrowsView from './views/user/ActiveBorrowsView';
import PenaltyFeeView from './views/user/PenaltyFeeView';

export type ViewState =
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

function AppContent() {
  const { user, role } = useAuthStore();
  const { notifications, removeNotification } = useUIStore();
  
  const [userView, setUserView] = React.useState<UserViewType>('DASHBOARD');
  // Đã đổi state staff thành viewToRender dùng ViewState
  const [viewToRender, setViewToRender] = React.useState<ViewState>('CATALOG');

  // Hàm kiểm tra quyền truy cập (Thay thế logic này bằng logic thực tế của bạn)
  const canAccessView = () => {
    // Ví dụ: Nếu cần kiểm tra quyền cụ thể từ backend/store
    // return user.permissions.includes(view);
    return true; 
  };

  // If not logged in, show auth layout (login/register)
  if (!user) {
    return <AuthLayout />;
  }

  // USER role - show user-facing interface
  if (role === 'USER') {
      return (
        <>
          <UserLayout currentView={userView} onNavigate={setUserView}>
            {userView === 'DASHBOARD' && <UserDashboardView />}
            {/* Đã đổi sang file xịn có tích hợp Giỏ hàng */}
            {userView === 'CATALOG' && <CatalogViewWithCart />}
            
            {/* Đã đổi sang file quản lý sách đang mượn chuẩn xác */}
            {userView === 'MY_BORROWINGS' && <ActiveBorrowsView />}
            
            {/* Quản lý Vi phạm & Phí phạt */}
            {userView === 'PENALTY_FEES' && <PenaltyFeeView />}
                      
            {userView === 'PROFILE' && <MyReaderCardView />}
          </UserLayout>
          <ToastContainer
            notifications={notifications}
            onRemove={removeNotification}
          />
        </>
      );
  }

  // STAFF / ADMIN role
  return (
    <>
      <StaffLayout currentView={viewToRender} onNavigate={setViewToRender}>
        <div className="max-w-7xl mx-auto">
          {/* {viewToRender === 'DASHBOARD' && canAccessView() && <DashboardView />} */}
          {viewToRender === 'READER_CARD' && canAccessView() && <ReaderCardView />}
          {viewToRender === 'READER_TYPES' && canAccessView() && <ReaderTypesView />}
          {viewToRender === 'NEW_BOOK' && canAccessView() && <NewBookIntakeView />}
          {viewToRender === 'CATEGORIES' && canAccessView() && <CategoriesView />}
          {viewToRender === 'AUTHORS' && canAccessView() && <AuthorsView />}
          {viewToRender === 'CATALOG' && canAccessView() && <CatalogView />}
          {viewToRender === 'BORROW_RETURN' && canAccessView() && <BorrowReturnSlipView />}
          {viewToRender === 'FINE_RECEIPT' && canAccessView() && <FineReceiptView />}
          {viewToRender === 'BORROW_SLIP_MANAGER' && canAccessView() && <BorrowSlipManagerViewNew />}
          {viewToRender === 'FINE_RECEIPT_MANAGER' && canAccessView() && <FineReceiptManagerViewNew />}
          {viewToRender === 'REPORTS' && canAccessView() && <ReportsView />}
          {viewToRender === 'REGULATIONS' && canAccessView() && <RegulationsView />}
          {viewToRender === 'USER_ROLES' && canAccessView() && <UserRolesView />}
          {viewToRender === 'USER_ACCOUNTS' && canAccessView() && <UserAccountsView />}
        </div>
      </StaffLayout>

      <ToastContainer
        notifications={notifications}
        onRemove={removeNotification}
      />
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
