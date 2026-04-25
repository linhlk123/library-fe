import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore, useUIStore } from './stores';
import { queryClient } from './lib/queryClient';
import { ToastContainer } from './components/shared/Toast';
import AuthLayout from './components/LoginView';
import UserLayout, { type UserViewType } from './layouts/UserLayout';
import { Sidebar, Header } from './components/Layout';
import ChatWidget from './components/ChatWidget';
import { useRole } from './hooks/useRole';

// Admin views
import ReaderCardView from './pages/ReaderCard';
import ReaderTypesView from './pages/ReaderTypes';
import NewBookIntakeView from './pages/NewBook';
import CategoriesView from './pages/Categories';
import AuthorsView from './pages/Authors';
import CatalogView from './pages/BookSearch';
import BorrowReturnSlipView from './pages/BorrowReturn';
import FineReceiptView from './pages/FineReceipt';
import BorrowSlipManagerView from './pages/staff/BorrowSlipManagerView';
import FineReceiptManagerView from './pages/staff/FineReceiptManagerView';
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
  const { canAccessView } = useRole();
  const { notifications, removeNotification } = useUIStore();
  const [adminView, setAdminView] = React.useState<ViewState>('CATALOG');
  const [userView, setUserView] = React.useState<UserViewType>('DASHBOARD');
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const { logout } = useAuthStore();

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

  // STAFF/ADMIN role - show admin interface
  const handleLogout = () => {
    logout();
  };

  // Check if current view is accessible, if not, reset to first accessible view
  const accessibleViews = canAccessView('CATALOG') ? adminView : 'CATALOG' as ViewState;
  const viewToRender = canAccessView(adminView) ? adminView : accessibleViews;

  return (
    <>
      <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
        <Sidebar
          currentView={viewToRender}
          isSidebarOpen={isSidebarOpen}
          onNavigate={(view) => {
            // Only allow navigation to accessible views
            if (canAccessView(view)) {
              setAdminView(view);
            }
          }}
          onCloseSidebar={() => setIsSidebarOpen(false)}
          onLogout={handleLogout}
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header
            user={user}
            currentView={viewToRender}
            onOpenSidebar={() => setIsSidebarOpen(true)}
          />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50">
            <div className="max-w-7xl mx-auto">
              {viewToRender === 'READER_CARD' && canAccessView('READER_CARD') && <ReaderCardView />}
              {viewToRender === 'READER_TYPES' && canAccessView('READER_TYPES') && <ReaderTypesView />}
              {viewToRender === 'NEW_BOOK' && canAccessView('NEW_BOOK') && <NewBookIntakeView />}
              {viewToRender === 'CATEGORIES' && canAccessView('CATEGORIES') && <CategoriesView />}
              {viewToRender === 'AUTHORS' && canAccessView('AUTHORS') && <AuthorsView />}
              {viewToRender === 'CATALOG' && canAccessView('CATALOG') && <CatalogView />}
              {viewToRender === 'BORROW_RETURN' && canAccessView('BORROW_RETURN') && <BorrowReturnSlipView />}
              {viewToRender === 'FINE_RECEIPT' && canAccessView('FINE_RECEIPT') && <FineReceiptView />}
              {viewToRender === 'BORROW_SLIP_MANAGER' && canAccessView('BORROW_SLIP_MANAGER') && <BorrowSlipManagerView />}
              {viewToRender === 'FINE_RECEIPT_MANAGER' && canAccessView('FINE_RECEIPT_MANAGER') && <FineReceiptManagerView />}
              {viewToRender === 'REPORTS' && canAccessView('REPORTS') && <ReportsView />}
              {viewToRender === 'REGULATIONS' && canAccessView('REGULATIONS') && <RegulationsView />}
              {viewToRender === 'USER_ROLES' && canAccessView('USER_ROLES') && <UserRolesView />}
              {viewToRender === 'USER_ACCOUNTS' && canAccessView('USER_ACCOUNTS') && <UserAccountsView />}
            </div>
          </main>
        </div>

        <ChatWidget role="STAFF" />
      </div>

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

