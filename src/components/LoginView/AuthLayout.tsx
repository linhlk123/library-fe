import { useState } from 'react';
import LoginView from './LoginView';
import RegisterView from './RegisterView';

type AuthView = 'login' | 'register';

// 3D Isometric Library Illustration Component
const LibraryIllustration = () => (
  <svg viewBox="0 0 400 500" className="w-full h-full" style={{ fontFamily: "'Inter', sans-serif" }}>
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#059669" stopOpacity="0.6" />
      </linearGradient>
      <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6EE7B7" stopOpacity="0.7" />
        <stop offset="100%" stopColor="#10B981" stopOpacity="0.5" />
      </linearGradient>
      <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.1" />
      </filter>
    </defs>

    {/* Background blur circles */}
    <circle cx="100" cy="100" r="80" fill="#10B981" opacity="0.08" />
    <circle cx="320" cy="380" r="100" fill="#059669" opacity="0.05" />

    {/* Central connecting hub */}
    <circle cx="200" cy="250" r="35" fill="url(#grad1)" filter="url(#shadow)" />
    <circle cx="200" cy="250" r="30" fill="none" stroke="#10B981" strokeWidth="1" opacity="0.4" />

    {/* Isometric books - Left cluster */}
    {/* Book 1 */}
    <g>
      <polygon points="80,280 80,200 120,180 120,260" fill="#10B981" opacity="0.9" />
      <polygon points="80,200 120,180 135,185 95,205" fill="#6EE7B7" opacity="0.7" />
    </g>
    {/* Book 2 */}
    <g>
      <polygon points="50,310 50,230 90,210 90,290" fill="#059669" opacity="0.8" />
      <polygon points="50,230 90,210 105,215 65,235" fill="#10B981" opacity="0.6" />
    </g>
    {/* Book 3 */}
    <g>
      <polygon points="120,330 120,250 160,230 160,310" fill="#10B981" opacity="0.85" />
      <polygon points="120,250 160,230 175,235 135,255" fill="#6EE7B7" opacity="0.65" />
    </g>

    {/* Isometric books - Right cluster */}
    {/* Book 4 */}
    <g>
      <polygon points="280,200 280,120 320,100 320,180" fill="#10B981" opacity="0.9" />
      <polygon points="280,120 320,100 335,105 295,125" fill="#6EE7B7" opacity="0.7" />
    </g>
    {/* Book 5 */}
    <g>
      <polygon points="310,290 310,210 350,190 350,270" fill="#059669" opacity="0.8" />
      <polygon points="310,210 350,190 365,195 325,215" fill="#10B981" opacity="0.6" />
    </g>
    {/* Book 6 */}
    <g>
      <polygon points="250,330 250,250 290,230 290,310" fill="#10B981" opacity="0.85" />
      <polygon points="250,250 290,230 305,235 265,255" fill="#6EE7B7" opacity="0.65" />
    </g>

    {/* Connecting lines - Digital network */}
    <line x1="200" y1="250" x2="100" y2="250" stroke="#10B981" strokeWidth="2" opacity="0.3" strokeDasharray="5,5" />
    <line x1="200" y1="250" x2="300" y2="250" stroke="#10B981" strokeWidth="2" opacity="0.3" strokeDasharray="5,5" />
    <line x1="200" y1="250" x2="150" y2="150" stroke="#6EE7B7" strokeWidth="1.5" opacity="0.25" strokeDasharray="4,4" />
    <line x1="200" y1="250" x2="280" y2="140" stroke="#6EE7B7" strokeWidth="1.5" opacity="0.25" strokeDasharray="4,4" />

    {/* Network nodes */}
    <circle cx="150" cy="150" r="4" fill="#6EE7B7" opacity="0.8" />
    <circle cx="280" cy="140" r="4" fill="#6EE7B7" opacity="0.8" />
    <circle cx="100" cy="250" r="4" fill="#10B981" opacity="0.6" />
    <circle cx="300" cy="250" r="4" fill="#10B981" opacity="0.6" />

    {/* Top floating elements */}
    <rect x="180" y="80" width="40" height="25" fill="#10B981" opacity="0.7" rx="4" />
    <rect x="320" y="120" width="30" height="30" fill="#6EE7B7" opacity="0.6" rx="3" />

    {/* Bottom accent elements */}
    <path d="M 80 420 L 100 410 L 110 430 Z" fill="#10B981" opacity="0.5" />
    <path d="M 300 450 L 320 440 L 330 460 Z" fill="#6EE7B7" opacity="0.4" />
  </svg>
);

export default function AuthLayout() {
  const [currentView, setCurrentView] = useState<AuthView>('login');

  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden">
      {/* Subtle background blurs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-96 -left-96 w-96 h-96 bg-slate-200 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob"></div>
        <div className="absolute -bottom-96 -right-96 w-96 h-96 bg-slate-300 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-3 animate-blob animation-delay-4000"></div>
      </div>

      {/* Split Screen Container */}
      <div className="relative w-full min-h-screen flex">
        {/* Left Panel - Illustration */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative">
          <div className="w-full max-w-md h-full flex items-center justify-center">
            <div className="w-full aspect-square flex items-center justify-center">
              <LibraryIllustration />
            </div>
          </div>
          
          {/* Left panel accent line */}
          <div className="absolute right-0 top-0 w-px h-full bg-gradient-to-b from-transparent via-emerald-200 to-transparent opacity-30"></div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12">
          <div className="w-full max-w-sm">
            {/* Animated view transition */}
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
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <p className="text-xs text-slate-400 font-medium tracking-wide">
          © 2024 Smart Library Management. All rights reserved.
        </p>
      </div>

      {/* Animation styles */}
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
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
