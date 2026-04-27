import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useUIStore } from '../../stores';
import authApi from '../../services/authApi';
import { parseError } from '../../services/apiClient';
import { validateForm, signupSchema } from '../../lib/validation';
import { TextInput } from '../shared/FormField';
import { Loader } from '../shared/Loader';
import type { SignupInput } from '../../lib/validation';
import { ChevronRight } from 'lucide-react';

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
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">Create Account</h2>
        <p className="text-emerald-600/70 mt-2 text-sm font-medium">Join our library community</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput
          label="Full Name"
          name="hoTen"
          value={formData.hoTen}
          onChange={handleChange}
          error={errors.hoTen}
          placeholder="Your full name"
          disabled={signupMutation.isPending}
          required
        />

        <TextInput
          label="Username"
          name="tenDangNhap"
          value={formData.tenDangNhap}
          onChange={handleChange}
          error={errors.tenDangNhap}
          placeholder="3-50 chars, alphanumeric + underscore"
          disabled={signupMutation.isPending}
          autoComplete="username"
          required
        />

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
        />

        <TextInput
          label="Date of Birth"
          type="date"
          name="ngaySinh"
          value={formData.ngaySinh}
          onChange={handleChange}
          error={errors.ngaySinh}
          disabled={signupMutation.isPending}
          required
        />

        <TextInput
          label="Mật khẩu"
          type="password"
          name="matKhau"
          value={formData.matKhau}
          onChange={handleChange}
          error={errors.matKhau}
          placeholder="Min 8 chars, uppercase, digit, special char"
          disabled={signupMutation.isPending}
          autoComplete="new-matKhau"
          required
        />

        <TextInput
          label="Confirm matKhau"
          type="password"
          name="confirmmatKhau"
          value={formData.confirmmatKhau}
          onChange={handleChange}
          error={errors.confirmmatKhau}
          placeholder="Confirm your matKhau"
          disabled={signupMutation.isPending}
          autoComplete="new-matKhau"
          required
        />

        <button
          type="submit"
          disabled={signupMutation.isPending}
          className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 disabled:from-emerald-300 disabled:to-emerald-400 disabled:cursor-not-allowed font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200"
        >
          {signupMutation.isPending ? (
            <>
              <Loader size="sm" />
              Creating account...
            </>
          ) : (
            <>
              Create Account
              <ChevronRight size={18} />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-emerald-600/70 text-sm font-medium">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            disabled={signupMutation.isPending}
            className="text-emerald-600 hover:text-emerald-700 font-semibold disabled:text-emerald-400 transition-colors"
          >
            Login here
          </button>
        </p>
      </div>
    </div>
  );
}
