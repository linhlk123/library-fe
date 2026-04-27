import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore, useUIStore } from '../../stores';
import authApi from '../../services/authApi';
import { parseError } from '../../services/apiClient';
import { validateForm, loginSchema } from '../../lib/validation';
import { TextInput } from '../shared/FormField';
import { Loader } from '../shared/Loader';
import { LogIn, ChevronRight, Lock, User } from 'lucide-react';
import type { LoginInput } from '../../lib/validation';
import type { ApiResponse, NguoiDung } from '../../types';

interface LoginViewProps {
  onSwitchToRegister: () => void;
}

export default function LoginView({ onSwitchToRegister }: LoginViewProps) {
  const { setUser, setToken } = useAuthStore();
  const { addNotification } = useUIStore();
  const [formData, setFormData] = useState<LoginInput>({
    tenDangNhap: '',
    matKhau: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const loginMutation = useMutation({
    mutationFn: async (data: { tenDangNhap: string; matKhau: string }) => {
      // 1. Login
      const loginRes = await authApi.login(data);
      const token = loginRes.data.result?.token;
      
      if (!token) {
        throw new Error('No token in response');
      }

      console.log('✅ Login successful, token:', token.substring(0, 30) + '...');

      // 2. Set token in store
      setToken(token);
      console.log('✅ Token set in store');

      // 3. Fetch profile with explicit token (avoid timing issues)
      setIsLoadingProfile(true);
      try {
        const profileRes = await axios.get<ApiResponse<NguoiDung>>(
          'https://library-crbe.onrender.com/api/v1/users/me',
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            timeout: 10000,
          }
        );

        console.log('✅ Profile loaded:', profileRes.data.result);

        if (profileRes.data?.result) {
          setUser(profileRes.data.result);
          addNotification({
            type: 'SUCCESS',
            message: 'Login successful!',
          });
          localStorage.setItem('maNhanVien', profileRes.data.result.tenDangNhap);
        }
      } catch (profileError) {
        console.error('❌ Profile fetch failed:', profileError);
        throw profileError;
      } finally {
        setIsLoadingProfile(false);
      }

      return loginRes;
    },
    onError: (error) => {
      setIsLoadingProfile(false);
      const apiError = parseError(error);
      console.error('❌ Login error:', apiError);
      addNotification({
        type: 'ERROR',
        message: apiError.message || 'Login failed. Please try again.',
      });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(loginSchema, formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    loginMutation.mutate(formData);
  };

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <Loader size="lg" message="Loading profile..." />
        </div>
      </div>
    );
  }

  return (  
    <div className="w-full space-y-8">
      {/* Header Section */}
      <div className="space-y-3 pb-8 border-b border-slate-200/50">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/20 group hover:shadow-emerald-500/30 transition-all duration-300">
          <LogIn className="text-white group-hover:scale-110 transition-transform duration-300" size={24} />
        </div>
        <div className="pt-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-slate-500 mt-2 font-medium text-base leading-relaxed">
            Access your library account and explore our collection
          </p>
        </div>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Username Field */}
        <div className="group">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="text-slate-400 group-focus-within:text-emerald-600 transition-colors duration-200" size={18} />
            </div>
            <TextInput
              label="Username"
              name="tenDangNhap"
              value={formData.tenDangNhap}
              onChange={handleChange}
              error={errors.tenDangNhap}
              placeholder="Enter your username"
              disabled={loginMutation.isPending || isLoadingProfile}
              autoComplete="username"
              required
              className="pl-12 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all duration-200"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="group">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="text-slate-400 group-focus-within:text-emerald-600 transition-colors duration-200" size={18} />
            </div>
            <TextInput
              label="Password"
              type="password"
              name="matKhau"
              value={formData.matKhau}
              onChange={handleChange}
              error={errors.matKhau}
              placeholder="Enter your password"
              disabled={loginMutation.isPending || isLoadingProfile}
              autoComplete="current-password"
              required
              className="pl-12 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all duration-200"
            />
          </div>
        </div>

        {/* Sign In Button */}
        <button
          type="submit"
          disabled={loginMutation.isPending || isLoadingProfile}
          className="w-full py-3 px-4 mt-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:from-emerald-600 hover:to-emerald-700 disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 group"
        >
          {loginMutation.isPending || isLoadingProfile ? (
            <>
              <Loader size="sm" />
              <span>{isLoadingProfile ? 'Loading profile...' : 'Signing in...'}</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 text-xs font-medium text-slate-400 bg-white">or</span>
        </div>
      </div>

      {/* Register Link */}
      <button
        type="button"
        onClick={onSwitchToRegister}
        disabled={loginMutation.isPending || isLoadingProfile}
        className="w-full py-2.5 px-4 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:border-emerald-200 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group"
      >
        Create New Account
      </button>

      {/* Footer Text */}
      <div className="pt-4 text-center">
        <p className="text-xs text-slate-400 font-medium tracking-wide">
          Demo: staff / Staff@123
        </p>
      </div>

      {/* Micro-interaction styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        .font-sans {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        input:focus {
          outline: none;
        }

        input::placeholder {
          @apply text-slate-400 transition-colors duration-200;
        }

        input:focus::placeholder {
          @apply text-slate-300;
        }
      `}</style>
    </div>
  );
}

