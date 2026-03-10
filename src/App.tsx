import { useState } from 'react';
import type { User } from './types';
import LoginView from './components/LoginView';
import { Sidebar, Header } from './components/Layout';
import CatalogView from './components/CatalogView';
import LoansView from './components/LoansView';
import FinesView from './components/FinesView';
import ChatWidget from './components/ChatWidget';

export type ViewState = 'CATALOG' | 'LOANS' | 'FINES';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('CATALOG');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user) {
    return <LoginView onLogin={setUser} />;
  }

  const handleLogout = () => {
    setUser(null);
    setCurrentView('CATALOG');
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
            {currentView === 'CATALOG' && <CatalogView />}
            {currentView === 'LOANS' && <LoansView />}
            {currentView === 'FINES' && <FinesView />}
          </div>
        </main>
      </div>

      <ChatWidget />
    </div>
  );
}

