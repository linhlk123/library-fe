import { useState } from 'react';
import LoginView from './LoginView';
import RegisterView from './RegisterView';

type AuthView = 'login' | 'register';

// Modern Minimalist Logo Component
const ModernLibraryLogo = () => (
  <svg viewBox="0 0 60 60" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6EE7B7" />
        <stop offset="100%" stopColor="#10B981" />
      </linearGradient>
    </defs>
    <path d="M 20 15 L 15 20 L 15 45 Q 15 50 20 50 L 30 50 L 30 15 Z" 
          fill="url(#logoGrad)" opacity="0.9"/>
    <path d="M 40 15 L 45 20 L 45 45 Q 45 50 40 50 L 30 50 L 30 15 Z" 
          fill="url(#logoGrad)" opacity="0.7"/>
    <circle cx="22" cy="28" r="2.5" fill="#10B981" opacity="0.8"/>
    <circle cx="38" cy="32" r="2.5" fill="#10B981" opacity="0.8"/>
    <circle cx="30" cy="38" r="2" fill="#6EE7B7" opacity="0.6"/>
    <line x1="22" y1="28" x2="30" y2="38" stroke="#10B981" strokeWidth="1.5" opacity="0.5"/>
    <line x1="38" y1="32" x2="30" y2="38" stroke="#10B981" strokeWidth="1.5" opacity="0.5"/>
    <line x1="22" y1="28" x2="38" y2="32" stroke="#6EE7B7" strokeWidth="1" opacity="0.3"/>
  </svg>
);

// Cloud Wave Motif Component
const CloudWaveMotif = () => (
  <svg viewBox="0 0 200 600" className="w-full h-full" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6EE7B7" />
        <stop offset="50%" stopColor="#5dd9b1" />
        <stop offset="100%" stopColor="#10B981" />
      </linearGradient>
    </defs>
    <path d="M 0,100 Q 50,80 100,100 T 200,100 L 200,0 L 0,0 Z" 
          fill="url(#waveGrad)" opacity="0.15"/>
    <path d="M 0,200 Q 60,170 120,190 T 200,210 L 200,140 Q 100,160 0,140 Z" 
          fill="url(#waveGrad)" opacity="0.12"/>
    <path d="M 0,350 Q 70,320 140,350 T 200,370 L 200,280 Q 90,300 0,280 Z" 
          fill="url(#waveGrad)" opacity="0.1"/>
    <path d="M 0,480 Q 50,450 100,470 T 200,500 L 200,400 Q 100,430 0,410 Z" 
          fill="url(#waveGrad)" opacity="0.08"/>
  </svg>
);

export default function AuthLayout() {
  const [currentView, setCurrentView] = useState<AuthView>('login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-emerald-50 to-teal-50 overflow-hidden relative">
      {/* Animated background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-96 -left-96 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-96 -right-96 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      {/* Logo - Top Right */}
      <div className="absolute top-8 right-8 z-20 w-12 h-12 bg-white/40 backdrop-blur-md rounded-full p-2 shadow-xl shadow-emerald-100/50">
        <ModernLibraryLogo />
      </div>

      {/* Main Container */}
      <div className="relative w-full min-h-screen flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-5xl">
          {/* Glass Panel */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-emerald-200/30">
            {/* Glass background with backdrop blur */}
            <div className="absolute inset-0 bg-white/70 backdrop-blur-xl border border-white/40"></div>

            {/* Main Content */}
            <div className="relative flex flex-col lg:flex-row min-h-[600px]">
              
              {/* Left Section - Form */}
              <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-12 lg:p-16">
                <div className="space-y-8">
                  {/* Form Header */}
                  <div className="space-y-2">
                    <h2 className="text-3xl font-light text-slate-800">Hello!</h2>
                    <p className="text-sm font-medium text-emerald-600">Sign in to your account</p>
                  </div>

                  {/* Form Content */}
                  <div key={currentView} className="space-y-6">
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

              {/* Right Section - Cloud Motif & Welcome Message */}
              <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12 bg-gradient-to-br from-emerald-50/50 to-cyan-50/50">
                
                {/* Cloud Wave Background */}
                <div className="absolute right-0 top-0 w-64 h-full">
                  <CloudWaveMotif />
                </div>

                {/* Welcome Message */}
                <div className="relative z-10 max-w-xs text-center">
                  <h3 className="text-3xl font-semibold bg-gradient-to-br from-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-4">
                    Welcome Back!
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed font-light">
                    Access your digital library, manage your reading list, and explore thousands of books in our collection.
                  </p>
                  <div className="mt-8 flex justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                    <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                    <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Label */}
          <div className="text-center mt-8 text-xs text-slate-400 font-medium tracking-widest">
            USER-FRIENDLY DESIGN MATERIALS
          </div>
        </div>
      </div>

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
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
