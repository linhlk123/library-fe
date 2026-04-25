import { z } from 'zod';

// Validation patterns
const matKhauRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Auth schemas
export const loginSchema = z.object({
  tenDangNhap: z
    .string()
    .min(3, 'Tên đăng nhập tối thiểu 3 ký tự')
    .max(50, 'Tên đăng nhập tối đa 50 ký tự'),
  matKhau: z                          
    .string()
    .min(1, 'Vui lòng nhập mật khẩu'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Signup schema
export const signupSchema = z.object({
  tenDangNhap: z
    .string()
    .regex(usernameRegex, 'Username: 3-50 chars, alphanumeric + underscore')
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be at most 50 characters'),
  hoTen: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be at most 100 characters'),
  email: z
    .string()
    .regex(emailRegex, 'Invalid email format'),
  ngaySinh: z
    .string()
    .refine((date) => {
      const d = new Date(date);
      const age = new Date().getFullYear() - d.getFullYear();
      return age >= 16;
    }, 'Age must be at least 16'),
  matKhau: z
    .string()
    .min(8, 'matKhau must be at least 8 characters')
    .regex(matKhauRegex, 'matKhau must contain: uppercase, digit, special char'),
  confirmmatKhau: z.string(),
}).refine((data) => data.matKhau === data.confirmmatKhau, {
  message: 'matKhaus do not match',
  path: ['confirmmatKhau'],
});

export type SignupInput = z.infer<typeof signupSchema>;

// User schemas
export const createUserSchema = z.object({
  tenDangNhap: z
    .string()
    .regex(usernameRegex, 'Username: 3-50 chars, alphanumeric + underscore')
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be at most 50 characters'),
  hoTen: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be at most 100 characters'),
  email: z
    .string()
    .regex(emailRegex, 'Invalid email format'),
  ngaySinh: z
    .string()
    .refine((date) => {
      const age = new Date().getFullYear() - new Date(date).getFullYear();
      return age >= 16;
    }, 'Age must be at least 16'),
  matKhau: z
    .string()
    .min(8, 'matKhau must be at least 8 characters')
    .regex(matKhauRegex, 'matKhau must contain: uppercase, digit, special char'),
  tenVaiTro: z.enum(['USER']),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

// Reader (DocGia) schemas
export const createReaderSchema = z.object({
  hoTen: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be at most 100 characters'),
  email: z
    .string()
    .regex(emailRegex, 'Invalid email format'),
  ngaySinh: z
    .string()
    .refine((date) => {
      const age = new Date().getFullYear() - new Date(date).getFullYear();
      return age >= 0;
    }, 'Invalid date of birth'),
  maLoaiDocGia: z.enum(['STUDENT', 'TEACHER', 'STAFF', 'EXTERNAL']),
});

export type CreateReaderInput = z.infer<typeof createReaderSchema>;

// Date range filter
export const dateRangeFilterSchema = z.object({
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
}).refine(
  (data) => {
    if (!data.fromDate || !data.toDate) return true;
    return new Date(data.fromDate) <= new Date(data.toDate);
  },
  { message: 'From date must be before or equal to to date', path: ['toDate'] }
);

export type DateRangeFilterInput = z.infer<typeof dateRangeFilterSchema>;

// Validate and return errors
export const validateForm = <T extends z.ZodSchema>(schema: T, data: unknown) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors: Record<string, string> = {};
    result.error.issues.forEach((err) => {
      const path = err.path.join('.');
      errors[path] = err.message;
    });
    return errors;
  }
  return {};
};
