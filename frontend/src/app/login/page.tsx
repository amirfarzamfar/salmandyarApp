'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '@/services/auth.service';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn, User, Lock } from 'lucide-react';
import Link from 'next/link';

const schema = z.object({
  identifier: z.string().min(1, 'لطفا شماره موبایل یا ایمیل خود را وارد کنید'),
  password: z.string().min(1, 'لطفا رمز عبور را وارد کنید'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);
      
      // Store token
      if (rememberMe) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response));
      } else {
        sessionStorage.setItem('token', response.token);
        sessionStorage.setItem('user', JSON.stringify(response));
      }
      
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      });
      
      Toast.fire({
        icon: 'success',
        title: 'ورود موفقیت‌آمیز'
      });

      // Redirect based on role
      if (['Patient', 'Elderly', 'PatientFamily'].includes(response.role)) {
        router.push('/portal');
      } else if (['Nurse', 'AssistantNurse', 'ElderlyCareAssistant', 'Physiotherapist'].includes(response.role)) {
        router.push('/nurse-portal');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      Swal.fire({
        title: 'خطا',
        text: error.response?.data?.error || 'اطلاعات ورود نادرست است',
        icon: 'error',
        confirmButtonText: 'تلاش مجدد',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-[family-name:var(--font-vazirmatn)]" dir="rtl">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
            <LogIn className="h-8 w-8 text-teal-600" />
          </div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            ورود به حساب کاربری
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            یا{' '}
            <Link href="/register" className="font-medium text-teal-600 hover:text-teal-500 transition-colors">
              حساب کاربری جدید بسازید
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6">
            
            {/* Identifier (Phone or Email) */}
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">شماره موبایل یا ایمیل</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="identifier"
                  {...register('identifier')}
                  className="block w-full pr-10 rounded-lg border-gray-300 shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm py-2 border"
                  placeholder="0912... یا example@mail.com"
                  dir="ltr"
                />
              </div>
              {errors.identifier && <p className="mt-1 text-xs text-red-500">{errors.identifier.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">رمز عبور</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register('password')}
                  className="block w-full pr-10 pl-10 rounded-lg border-gray-300 shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm py-2 border"
                  placeholder="••••••••"
                  dir="ltr"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="mr-2 block text-sm text-gray-900 cursor-pointer select-none">
                  مرا به خاطر بسپار
                </label>
              </div>

              <div className="text-sm">
                <Link href="/forgot-password" className="font-medium text-teal-600 hover:text-teal-500">
                  رمز عبور را فراموش کرده‌اید؟
                </Link>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${isLoading ? 'bg-teal-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 shadow-lg transition-all duration-200`}
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <LogIn className="h-5 w-5 text-teal-500 group-hover:text-teal-400" aria-hidden="true" />
                </span>
              )}
              {isLoading ? 'در حال ورود...' : 'ورود'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}