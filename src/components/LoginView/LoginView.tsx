import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore, useUIStore } from '../../stores';
import authApi from '../../services/authApi';
import { parseError } from '../../services/apiClient';
import { validateForm, loginSchema } from '../../lib/validation';
import { Loader } from '../shared/Loader';
import { Lock, User, ChevronRight } from 'lucide-react';
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
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
          '/api/v1/users/me',
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
            message: 'Đăng nhập thành công!',
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
        message: apiError.message || 'Đăng nhập thất bại. Vui lòng thử lại.',
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
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Loader size="lg" message="Đang tải hồ sơ..." />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Username Input */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-600 tracking-wide uppercase">Tên Đăng Nhập</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-emerald-500 group-focus-within:text-emerald-600 transition-colors duration-200">
            <User size={18} strokeWidth={2.5} />
          </div>
          <input
            type="text"
            name="tenDangNhap"
            value={formData.tenDangNhap}
            onChange={handleChange}
            disabled={loginMutation.isPending || isLoadingProfile}
            placeholder="Nhập tên đăng nhập"
            autoComplete="username"
            required
            className="w-full pl-12 pr-4 py-3 bg-gradient-to-br from-white/80 to-cyan-50/80 border border-emerald-200/50 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/30 transition-all duration-200 text-slate-800 placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {errors.tenDangNhap && (
            <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.tenDangNhap}</p>
          )}
        </div>
      </div>

      {/* Password Input */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-600 tracking-wide uppercase">Mật Khẩu</label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-emerald-500 group-focus-within:text-emerald-600 transition-colors duration-200">
            <Lock size={18} strokeWidth={2.5} />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            name="matKhau"
            value={formData.matKhau}
            onChange={handleChange}
            disabled={loginMutation.isPending || isLoadingProfile}
            placeholder="Nhập mật khẩu"
            autoComplete="current-password"
            required
            className="w-full pl-12 pr-12 py-3 bg-gradient-to-br from-white/80 to-cyan-50/80 border border-emerald-200/50 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/30 transition-all duration-200 text-slate-800 placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 transition-colors duration-200"
            disabled={loginMutation.isPending || isLoadingProfile}
          >
            {showPassword ? '👁' : '👁‍🗨'}
          </button>
          {errors.matKhau && (
            <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.matKhau}</p>
          )}
        </div>
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between pt-2">
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={loginMutation.isPending || isLoadingProfile}
            className="w-4 h-4 rounded border-emerald-300 text-emerald-600 bg-white/50 focus:ring-emerald-400 focus:ring-offset-0 transition-all duration-200 cursor-pointer accent-emerald-600"
          />
          <span className="text-sm text-slate-600 font-medium group-hover:text-slate-800 transition-colors">
            Nhớ tôi
          </span>
        </label>
        <button
          type="button"
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors duration-200 hover:underline"
        >
          Quên mật khẩu?
        </button>
      </div>

      {/* Sign In Button */}
      <button
        type="submit"
        disabled={loginMutation.isPending || isLoadingProfile}
        className="w-full mt-8 py-3 px-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-200/50 hover:shadow-emerald-300/50 disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 group overflow-hidden relative"
      >
        {/* Background gradient animation on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="relative flex items-center justify-center gap-2 w-full">
          {loginMutation.isPending || isLoadingProfile ? (
            <>
              <Loader size="sm" />
              <span>{isLoadingProfile ? 'Đang tải hồ sơ...' : 'Đang đăng nhập...'}</span>
            </>
          ) : (
            <>
              <span>ĐĂNG NHẬP</span>
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
            </>
          )}
        </div>
      </button>

      {/* Sign Up Link */}
      <div className="pt-4 text-center">
        <p className="text-sm text-slate-600">
          Chưa có tài khoản?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            disabled={loginMutation.isPending || isLoadingProfile}
            className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors duration-200 disabled:text-slate-400"
          >
            Đăng Ký
          </button>
        </p>
      </div>
    </form>
  );
}

