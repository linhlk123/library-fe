import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useUIStore } from '../../stores';
import authApi from '../../services/authApi';
import { parseError } from '../../services/apiClient';
import { validateForm, signupSchema } from '../../lib/validation';
import { Loader } from '../shared/Loader';
import type { SignupInput } from '../../lib/validation';
import { ChevronRight, Mail, User, Lock, Calendar } from 'lucide-react';

interface RegisterViewProps {
  onSwitchToLogin: () => void;
}

export default function RegisterView({ onSwitchToLogin }: RegisterViewProps) {
  const { addNotification } = useUIStore();
  const [formData, setFormData] = useState<SignupInput>({
    tenDangNhap: '',
    hoTen: '',
    email: '',
    ngaySinh: '',
    matKhau: '',
    confirmmatKhau: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const signupMutation = useMutation({
    mutationFn: (data: SignupInput) =>
      authApi.signup({
        tenDangNhap: data.tenDangNhap,
        hoTen: data.hoTen,
        email: data.email,
        ngaySinh: data.ngaySinh,
        matKhau: data.matKhau,
      }),
    onSuccess: () => {
      addNotification({
        type: 'SUCCESS',
        message: 'Account created successfully! Please login.',
      });
      onSwitchToLogin();
    },
    onError: (error) => {
      const apiError = parseError(error);
      if (apiError.code === 3001) {
        setErrors({
          tenDangNhap: 'Username already exists',
        });
      }
      addNotification({
        type: 'ERROR',
        message: apiError.message || 'Registration failed. Please try again.',
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
    const validationErrors = validateForm(signupSchema, formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    signupMutation.mutate(formData);
  };

  const inputClass = "w-full px-4 py-3 bg-gradient-to-br from-white/80 to-cyan-50/80 border border-emerald-200/50 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300/30 transition-all duration-200 text-slate-800 placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Full Name */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600 tracking-wide uppercase">Full Name</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-emerald-500 pointer-events-none">
            <User size={18} strokeWidth={2.5} />
          </div>
          <input
            type="text"
            name="hoTen"
            value={formData.hoTen}
            onChange={handleChange}
            placeholder="Your full name"
            disabled={signupMutation.isPending}
            required
            className={"pl-12 " + inputClass}
          />
          {errors.hoTen && <p className="text-xs text-red-500 mt-1 font-medium">{errors.hoTen}</p>}
        </div>
      </div>

      {/* Username */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600 tracking-wide uppercase">Username</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-emerald-500 pointer-events-none">
            <User size={18} strokeWidth={2.5} />
          </div>
          <input
            type="text"
            name="tenDangNhap"
            value={formData.tenDangNhap}
            onChange={handleChange}
            placeholder="3-50 chars, alphanumeric"
            disabled={signupMutation.isPending}
            autoComplete="username"
            required
            className={"pl-12 " + inputClass}
          />
          {errors.tenDangNhap && <p className="text-xs text-red-500 mt-1 font-medium">{errors.tenDangNhap}</p>}
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600 tracking-wide uppercase">Email</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-emerald-500 pointer-events-none">
            <Mail size={18} strokeWidth={2.5} />
          </div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your.email@example.com"
            disabled={signupMutation.isPending}
            autoComplete="email"
            required
            className={"pl-12 " + inputClass}
          />
          {errors.email && <p className="text-xs text-red-500 mt-1 font-medium">{errors.email}</p>}
        </div>
      </div>

      {/* Date of Birth */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600 tracking-wide uppercase">Date of Birth</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-emerald-500 pointer-events-none">
            <Calendar size={18} strokeWidth={2.5} />
          </div>
          <input
            type="date"
            name="ngaySinh"
            value={formData.ngaySinh}
            onChange={handleChange}
            disabled={signupMutation.isPending}
            required
            className={"pl-12 " + inputClass}
          />
          {errors.ngaySinh && <p className="text-xs text-red-500 mt-1 font-medium">{errors.ngaySinh}</p>}
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600 tracking-wide uppercase">Password</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-emerald-500 pointer-events-none">
            <Lock size={18} strokeWidth={2.5} />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            name="matKhau"
            value={formData.matKhau}
            onChange={handleChange}
            placeholder="Min 8 chars, uppercase, digit, special char"
            disabled={signupMutation.isPending}
            autoComplete="new-password"
            required
            className={"pl-12 pr-12 " + inputClass}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 transition-colors duration-200"
            disabled={signupMutation.isPending}
          >
            {showPassword ? '👁' : '👁‍🗨'}
          </button>
          {errors.matKhau && <p className="text-xs text-red-500 mt-1 font-medium">{errors.matKhau}</p>}
        </div>
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600 tracking-wide uppercase">Confirm Password</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-emerald-500 pointer-events-none">
            <Lock size={18} strokeWidth={2.5} />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            name="confirmmatKhau"
            value={formData.confirmmatKhau}
            onChange={handleChange}
            placeholder="Confirm your password"
            disabled={signupMutation.isPending}
            autoComplete="new-password"
            required
            className={"pl-12 pr-12 " + inputClass}
          />
          {errors.confirmmatKhau && <p className="text-xs text-red-500 mt-1 font-medium">{errors.confirmmatKhau}</p>}
        </div>
      </div>

      {/* Create Account Button */}
      <button
        type="submit"
        disabled={signupMutation.isPending}
        className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-200/50 hover:shadow-emerald-300/50 disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 group overflow-hidden relative"
      >
        <div className="relative flex items-center justify-center gap-2 w-full">
          {signupMutation.isPending ? (
            <>
              <Loader size="sm" />
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <span>CREATE ACCOUNT</span>
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
            </>
          )}
        </div>
      </button>

      {/* Switch to Login */}
      <div className="pt-2 text-center">
        <p className="text-sm text-slate-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            disabled={signupMutation.isPending}
            className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors duration-200 disabled:text-slate-400"
          >
            Sign In
          </button>
        </p>
      </div>
    </form>
  );
}
