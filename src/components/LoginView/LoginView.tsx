import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore, useUIStore } from '../../stores';
import authApi from '../../services/authApi';
import { parseError } from '../../services/apiClient';
import { validateForm, loginSchema } from '../../lib/validation';
import { TextInput } from '../shared/FormField';
import { Loader } from '../shared/Loader';
import { LogIn, ChevronRight } from 'lucide-react';
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
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Loader size="lg" message="Loading profile..." />
      </div>
    );
  }

  return (  
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg">
            <LogIn className="text-white" size={32} />
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">Welcome Back</h1>
        <p className="text-emerald-600/70 mt-2 font-medium">Sign in to your library account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
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
        />

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
        />

        <button
          type="submit"
          disabled={loginMutation.isPending || isLoadingProfile}
          className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 disabled:from-emerald-300 disabled:to-emerald-400 disabled:cursor-not-allowed font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200"
        >
          {loginMutation.isPending || isLoadingProfile ? (
            <>
              <Loader size="sm" />
              {isLoadingProfile ? 'Loading profile...' : 'Signing in...'}
            </>
          ) : (
            <>
              Sign In
              <ChevronRight size={20} />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 space-y-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-emerald-100"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-emerald-600/60 font-medium">Or</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onSwitchToRegister}
          disabled={loginMutation.isPending || isLoadingProfile}
          className="w-full py-2.5 px-4 border-2 border-emerald-100 rounded-xl text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create New Account
        </button>
      </div>

      <p className="text-center text-xs text-emerald-600/50 mt-6 font-medium">
        Role Staff: staff / Staff@123
      </p>
    </div>
  );
}

