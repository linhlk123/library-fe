import { useState } from 'react';
import type { User } from './types';
import LoginView from './components/LoginView';
import { Sidebar, Header } from './components/Layout';
import ChatWidget from './components/ChatWidget';
import ReaderCardView from './pages/ReaderCard';
import ReaderTypesView from './pages/ReaderTypes';
import NewBookIntakeView from './pages/NewBook';
import CategoriesView from './pages/Categories';
import AuthorsView from './pages/Authors';
import CatalogView from './pages/BookSearch';
import BorrowReturnSlipView from './pages/BorrowReturn';
import FineReceiptView from './pages/FineReceipt';
import ReportsView from './pages/Reports';
import RegulationsView from './pages/Regulations';
import UserRolesView from './pages/UserRoles';
import UserAccountsView from './pages/UserAccounts';

export type ViewState =
  | 'READER_CARD'
  | 'READER_TYPES'
  | 'NEW_BOOK'
  | 'CATEGORIES'
  | 'AUTHORS'
  | 'CATALOG'
  | 'BORROW_RETURN'
  | 'FINE_RECEIPT'
  | 'REPORTS'
  | 'REGULATIONS'
  | 'USER_ROLES'
  | 'USER_ACCOUNTS';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('READER_CARD');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user) {
    return <LoginView onLogin={setUser} />;
  }

  const handleLogout = () => {
    setUser(null);
    setCurrentView('READER_CARD');
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      <Sidebar
        currentView={currentView}
        isSidebarOpen={isSidebarOpen}
        onNavigate={setCurrentView}
        onCloseSidebar={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          user={user}
          currentView={currentView}
          onOpenSidebar={() => setIsSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {currentView === 'READER_CARD' && <ReaderCardView />}
            {currentView === 'READER_TYPES' && <ReaderTypesView />}
            {currentView === 'NEW_BOOK' && <NewBookIntakeView />}
            {currentView === 'CATEGORIES' && <CategoriesView />}
            {currentView === 'AUTHORS' && <AuthorsView />}
            {currentView === 'CATALOG' && <CatalogView />}
            {currentView === 'BORROW_RETURN' && <BorrowReturnSlipView />}
            {currentView === 'FINE_RECEIPT' && <FineReceiptView />}
            {currentView === 'REPORTS' && <ReportsView />}
            {currentView === 'REGULATIONS' && <RegulationsView />}
            {currentView === 'USER_ROLES' && <UserRolesView />}
            {currentView === 'USER_ACCOUNTS' && <UserAccountsView />}
          </div>
        </main>
      </div>

      <ChatWidget />
    </div>
  );
}

