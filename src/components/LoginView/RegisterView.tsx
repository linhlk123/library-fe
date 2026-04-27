import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useUIStore } from '../../stores';
import authApi from '../../services/authApi';
import { parseError } from '../../services/apiClient';
import { validateForm, signupSchema } from '../../lib/validation';
import { TextInput } from '../shared/FormField';
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
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const validationErrors = validateForm(signupSchema, formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Submit
    signupMutation.mutate(formData);
  };

  return (
    <div className="w-full space-y-8">
      {/* Header Section */}
      <div className="space-y-3 pb-8 border-b border-slate-200/50">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/20">
          <Mail className="text-white" size={24} />
        </div>
        <div className="pt-2">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-slate-500 mt-2 font-medium text-base">
            Join our community and start exploring
          </p>
        </div>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name */}
        <div className="group">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 group-focus-within:text-emerald-600 pointer-events-none transition-colors duration-200">
              <User size={18} />
            </div>
            <TextInput
              label="Full Name"
              name="hoTen"
              value={formData.hoTen}
              onChange={handleChange}
              error={errors.hoTen}
              placeholder="Your full name"
              disabled={signupMutation.isPending}
              required
              className="pl-10 bg-slate-50/50 border-slate-200"
            />
          </div>
        </div>

        {/* Username */}
        <div className="group">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 group-focus-within:text-emerald-600 pointer-events-none transition-colors duration-200">
              <User size={18} />
            </div>
            <TextInput
              label="Username"
              name="tenDangNhap"
              value={formData.tenDangNhap}
              onChange={handleChange}
              error={errors.tenDangNhap}
              placeholder="3-50 chars, alphanumeric"
              disabled={signupMutation.isPending}
              autoComplete="username"
              required
              className="pl-10 bg-slate-50/50 border-slate-200"
            />
          </div>
        </div>

        {/* Email */}
        <div className="group">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 group-focus-within:text-emerald-600 pointer-events-none transition-colors duration-200">
              <Mail size={18} />
            </div>
            <TextInput
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="your.email@example.com"
              disabled={signupMutation.isPending}
              autoComplete="email"
              required
              className="pl-10 bg-slate-50/50 border-slate-200"
            />
          </div>
        </div>

        {/* Date of Birth */}
        <div className="group">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 group-focus-within:text-emerald-600 pointer-events-none transition-colors duration-200">
              <Calendar size={18} />
            </div>
            <TextInput
              label="Date of Birth"
              type="date"
              name="ngaySinh"
              value={formData.ngaySinh}
              onChange={handleChange}
              error={errors.ngaySinh}
              disabled={signupMutation.isPending}
              required
              className="pl-10 bg-slate-50/50 border-slate-200"
            />
          </div>
        </div>

        {/* Password */}
        <div className="group">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 group-focus-within:text-emerald-600 pointer-events-none transition-colors duration-200">
              <Lock size={18} />
            </div>
            <TextInput
              label="Password"
              type="password"
              name="matKhau"
              value={formData.matKhau}
              onChange={handleChange}
              error={errors.matKhau}
              placeholder="Min 8 chars, uppercase, digit, special char"
              disabled={signupMutation.isPending}
              autoComplete="new-password"
              required
              className="pl-10 bg-slate-50/50 border-slate-200"
            />
          </div>
        </div>

        {/* Confirm Password */}
        <div className="group">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 group-focus-within:text-emerald-600 pointer-events-none transition-colors duration-200">
              <Lock size={18} />
            </div>
            <TextInput
              label="Confirm Password"
              type="password"
              name="confirmmatKhau"
              value={formData.confirmmatKhau}
              onChange={handleChange}
              error={errors.confirmmatKhau}
              placeholder="Confirm your password"
              disabled={signupMutation.isPending}
              autoComplete="new-password"
              required
              className="pl-10 bg-slate-50/50 border-slate-200"
            />
          </div>
        </div>

        {/* Create Account Button */}
        <button
          type="submit"
          disabled={signupMutation.isPending}
          className="w-full py-3 px-4 mt-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:from-emerald-600 hover:to-emerald-700 disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 group"
        >
          {signupMutation.isPending ? (
            <>
              <Loader size="sm" />
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
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

      {/* Login Link */}
      <div className="text-center">
        <p className="text-slate-600 text-sm font-medium">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            disabled={signupMutation.isPending}
            className="text-emerald-600 hover:text-emerald-700 font-semibold disabled:text-slate-300 transition-colors duration-200"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
