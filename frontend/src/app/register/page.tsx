'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '@/services/auth.service';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, UserPlus, Phone, User, Mail, CreditCard, Lock, Briefcase } from 'lucide-react';
import Link from 'next/link';

const roles = [
  { value: 'Manager', label: 'مدیر' },
  { value: 'Supervisor', label: 'سوپروایزر' },
  { value: 'Nurse', label: 'پرستار' },
  { value: 'AssistantNurse', label: 'کمک پرستار' },
  { value: 'Physiotherapist', label: 'فیزیوتراپ' },
  { value: 'ElderlyCareAssistant', label: 'سالمندیار' },
  { value: 'Elderly', label: 'سالمند' },
  { value: 'Patient', label: 'بیمار' },
  { value: 'PatientFamily', label: 'خانواده بیمار' },
];

const phoneRegex = /^09[0-9]{9}$/;

const schema = z.object({
  firstName: z.string().min(2, 'نام باید حداقل ۲ حرف باشد'),
  lastName: z.string().min(2, 'نام خانوادگی باید حداقل ۲ حرف باشد'),
  email: z.string().email('ایمیل معتبر نیست').optional().or(z.literal('')),
  phoneNumber: z.string().regex(phoneRegex, 'شماره موبایل معتبر نیست (مثال: 09123456789)'),
  role: z.string().min(1, 'لطفا یک نقش را انتخاب کنید'),
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
  confirmPassword: z.string().min(6, 'تکرار رمز عبور الزامی است'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "رمز عبور و تکرار آن مطابقت ندارند",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      // Exclude confirmPassword from the request payload if necessary, 
      // but authService.register expects RegisterRequest which has specific fields.
      // We need to map FormData to RegisterRequest (omitting confirmPassword).
      const requestData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        password: data.password,
        role: data.role
      };
      
      const response = await authService.register(requestData);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response));
      
      Swal.fire({
        title: 'ثبت‌نام موفق',
        text: 'به سامانه سالمندیار خوش آمدید',
        icon: 'success',
        confirmButtonText: 'ورود به پنل',
        confirmButtonColor: '#0d9488'
      }).then(() => {
        // Redirect based on role
        if (['Patient', 'Elderly', 'PatientFamily'].includes(response.role)) {
          router.push('/portal');
        } else if (['Nurse', 'AssistantNurse', 'ElderlyCareAssistant', 'Physiotherapist'].includes(response.role)) {
          router.push('/nurse-portal');
        } else {
          router.push('/dashboard');
        }
      });
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      Swal.fire({
        title: 'خطا',
        text: error.response?.data?.error || 'ثبت‌نام با خطا مواجه شد',
        icon: 'error',
        confirmButtonText: 'تلاش مجدد',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 font-[family-name:var(--font-vazirmatn)]" dir="rtl">
      <div className="max-w-2xl w-full space-y-8 bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl dark:shadow-none dark:border dark:border-gray-700">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="h-8 w-8 text-teal-600 dark:text-teal-400" />
          </div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            ایجاد حساب کاربری
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            یا{' '}
            <Link href="/login" className="font-medium text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300 transition-colors">
              وارد حساب کاربری خود شوید
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نام</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="firstName"
                  {...register('firstName')}
                  className="block w-full pr-10 rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white sm:text-sm py-2 border"
                  placeholder="نام خود را وارد کنید"
                />
              </div>
              {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نام خانوادگی</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="lastName"
                  {...register('lastName')}
                  className="block w-full pr-10 rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white sm:text-sm py-2 border"
                  placeholder="نام خانوادگی را وارد کنید"
                />
              </div>
              {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>}
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">شماره تلفن</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phoneNumber"
                  {...register('phoneNumber')}
                  className="block w-full pr-10 rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white sm:text-sm py-2 border"
                  placeholder="09123456789"
                  dir="ltr"
                />
              </div>
              {errors.phoneNumber && <p className="mt-1 text-xs text-red-500">{errors.phoneNumber.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ایمیل (اختیاری)</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  {...register('email')}
                  className="block w-full pr-10 rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white sm:text-sm py-2 border"
                  placeholder="example@mail.com"
                  dir="ltr"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            {/* Role */}
            <div className="col-span-1 sm:col-span-2">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نقش کاربری</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="role"
                  {...register('role')}
                  className="block w-full pr-10 rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white sm:text-sm py-2 border appearance-none"
                >
                  <option value="">انتخاب کنید...</option>
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
              {errors.role && <p className="mt-1 text-xs text-red-500">{errors.role.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رمز عبور</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register('password')}
                  className="block w-full pr-10 pl-10 rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white sm:text-sm py-2 border"
                  placeholder="••••••"
                  dir="ltr"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 left-0 pl-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تکرار رمز عبور</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  {...register('confirmPassword')}
                  className="block w-full pr-10 pl-10 rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white sm:text-sm py-2 border"
                  placeholder="••••••"
                  dir="ltr"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 left-0 pl-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-teal-600 py-2 px-4 text-sm font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <UserPlus className="h-5 w-5 text-teal-500 group-hover:text-teal-400" aria-hidden="true" />
                  </span>
                  ثبت‌نام
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
