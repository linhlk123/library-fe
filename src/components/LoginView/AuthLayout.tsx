import React, { useState } from 'react';
import LoginView from './LoginView';
import RegisterView from './RegisterView';

type AuthView = 'login' | 'register';

export default function AuthLayout() {
  const [currentView, setCurrentView] = useState<AuthView>('login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Main card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 backdrop-blur-sm border border-gray-100">
          {/* Header with logo */}
          <div className="flex justify-center mb-6">
            <div className="text-4xl">📚</div>
          </div>
          <h1 className="text-center text-2xl font-bold text-gray-900 mb-1">
            Library System
          </h1>
          <p className="text-center text-sm text-gray-500 mb-8">
            Smart Library Management Platform
          </p>

          {/* Animation for view transitions */}
          <div
            className="transition-all duration-300"
            key={currentView}
          >
            {currentView === 'login' && (
              <LoginView
                onSwitchToRegister={() => setCurrentView('register')}
              />
            )}
            {currentView === 'register' && (
              <RegisterView
                onSwitchToLogin={() => setCurrentView('login')}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          © 2024 Library Management System. All rights reserved.
        </p>
      </div>
    </div>
  );
}
