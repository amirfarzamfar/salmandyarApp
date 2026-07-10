'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '@/services/auth.service';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, KeyRound, Lock, LogIn, Mail, MessageSquare, User } from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/components/auth/UserContext';
import type { AuthResponse } from '@/types/auth';
import { resolveRoleHomePath } from '@/utils/role-routing';

const schema = z.object({
  identifier: z.string().min(1, 'لطفا شماره موبایل یا ایمیل خود را وارد کنید'),
  password: z.string().min(1, 'لطفا رمز عبور را وارد کنید'),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password');
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [otpIdentifier, setOtpIdentifier] = useState('');
  const [otpChannel, setOtpChannel] = useState<'sms' | 'email'>('sms');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpRequesting, setIsOtpRequesting] = useState(false);
  const [isOtpVerifying, setIsOtpVerifying] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const completeLogin = async (response: AuthResponse) => {
    if (rememberMe) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response));
    } else {
      sessionStorage.setItem('token', response.token);
      sessionStorage.setItem('user', JSON.stringify(response));
    }

    refreshUser();

    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });

    Toast.fire({
      icon: 'success',
      title: 'ورود موفقیت‌آمیز'
    });

    router.push(resolveRoleHomePath(response.role));
  };

  const onSubmit = async (data: FormData) => {
    setIsPasswordLoading(true);
    try {
      const response = await authService.login(data);
      await completeLogin(response);
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      Swal.fire({
        title: 'خطا',
        text: error.response?.data?.error || 'اطلاعات ورود نادرست است',
        icon: 'error',
        confirmButtonText: 'تلاش مجدد',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const requestOtpLogin = async () => {
    if (!otpIdentifier.trim()) {
      Swal.fire('خطا', 'لطفا شماره موبایل یا ایمیل خود را وارد کنید', 'error');
      return;
    }

    setIsOtpRequesting(true);
    try {
      const response = await authService.requestOtpLogin({
        identifier: otpIdentifier.trim(),
        channel: otpChannel,
      });

      setOtpRequested(true);
      Swal.fire({
        title: 'کد ارسال شد',
        text: response.message,
        icon: 'success',
        confirmButtonText: 'متوجه شدم',
      });
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      Swal.fire('خطا', error.response?.data?.error || 'ارسال کد با مشکل مواجه شد', 'error');
    } finally {
      setIsOtpRequesting(false);
    }
  };

  const verifyOtpLogin = async () => {
    if (!otpIdentifier.trim()) {
      Swal.fire('خطا', 'لطفا شماره موبایل یا ایمیل خود را وارد کنید', 'error');
      return;
    }

    if (!otpCode.trim()) {
      Swal.fire('خطا', 'لطفا کد ورود را وارد کنید', 'error');
      return;
    }

    setIsOtpVerifying(true);
    try {
      const response = await authService.verifyOtpLogin({
        identifier: otpIdentifier.trim(),
        channel: otpChannel,
        code: otpCode.trim(),
      });

      await completeLogin(response);
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      Swal.fire('خطا', error.response?.data?.error || 'کد ورود نامعتبر است', 'error');
    } finally {
      setIsOtpVerifying(false);
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

        <div className="mt-8">
          <div className="grid grid-cols-2 rounded-xl bg-gray-100 p-1 text-sm">
            <button
              type="button"
              onClick={() => setLoginMode('password')}
              className={`rounded-lg px-3 py-2 font-medium transition-colors ${loginMode === 'password' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-600'}`}
            >
              ورود با رمز عبور
            </button>
            <button
              type="button"
              onClick={() => setLoginMode('otp')}
              className={`rounded-lg px-3 py-2 font-medium transition-colors ${loginMode === 'otp' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-600'}`}
            >
              ورود با رمز یکبار مصرف
            </button>
          </div>
        </div>

        {loginMode === 'password' ? (
          <form className="mt-6 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6">
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

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">رمز عبور</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
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
                disabled={isPasswordLoading}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${isPasswordLoading ? 'bg-teal-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 shadow-lg transition-all duration-200`}
              >
                {isPasswordLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <LogIn className="h-5 w-5 text-teal-500 group-hover:text-teal-400" aria-hidden="true" />
                  </span>
                )}
                {isPasswordLoading ? 'در حال ورود...' : 'ورود'}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-6 space-y-5">
            {/* <div className="rounded-xl border border-teal-100 bg-teal-50 p-4 text-sm text-teal-800">
              این روش فقط برای کاربرانی است که قبلا ثبت نام کرده‌اند. کد ورود به کانال ثبت‌شده‌ی کاربر ارسال می‌شود.
            </div> */}

            <div>
              <label htmlFor="otp-identifier" className="block text-sm font-medium text-gray-700 mb-1">شماره موبایل یا ایمیل</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="otp-identifier"
                  value={otpIdentifier}
                  onChange={(event) => setOtpIdentifier(event.target.value)}
                  className="block w-full pr-10 rounded-lg border-gray-300 shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm py-2 border"
                  placeholder="0912... یا example@mail.com"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 text-sm font-medium text-gray-700">کانال دریافت کد</div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOtpChannel('sms')}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${otpChannel === 'sms' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-600 hover:border-teal-300'}`}
                >
                  <MessageSquare className="h-4 w-4" />
                  پیامک
                </button>
                <button
                  type="button"
                  onClick={() => setOtpChannel('email')}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${otpChannel === 'email' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-600 hover:border-teal-300'}`}
                >
                  <Mail className="h-4 w-4" />
                  ایمیل
                </button>
              </div>
            </div>

            {otpRequested && (
              <div>
                <label htmlFor="otp-code" className="block text-sm font-medium text-gray-700 mb-1">کد ورود</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="otp-code"
                    value={otpCode}
                    onChange={(event) => setOtpCode(event.target.value)}
                    className="block w-full pr-10 rounded-lg border-gray-300 shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm py-2 border tracking-[0.3em]"
                    placeholder="123456"
                    dir="ltr"
                    inputMode="numeric"
                    maxLength={8}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me-otp"
                  name="remember-me-otp"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me-otp" className="mr-2 block text-sm text-gray-900 cursor-pointer select-none">
                  مرا به خاطر بسپار
                </label>
              </div>

              {otpRequested && (
                <button
                  type="button"
                  onClick={requestOtpLogin}
                  disabled={isOtpRequesting}
                  className="text-sm font-medium text-teal-600 hover:text-teal-500 disabled:opacity-60"
                >
                  ارسال دوباره کد
                </button>
              )}
            </div>

            <div className="space-y-3">
              {!otpRequested ? (
                <button
                  type="button"
                  onClick={requestOtpLogin}
                  disabled={isOtpRequesting}
                  className={`w-full rounded-lg py-3 px-4 text-sm font-medium text-white shadow-lg transition-all duration-200 ${isOtpRequesting ? 'cursor-not-allowed bg-teal-400' : 'bg-teal-600 hover:bg-teal-700'}`}
                >
                  {isOtpRequesting ? 'در حال ارسال کد...' : 'ارسال کد ورود'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={verifyOtpLogin}
                  disabled={isOtpVerifying}
                  className={`w-full rounded-lg py-3 px-4 text-sm font-medium text-white shadow-lg transition-all duration-200 ${isOtpVerifying ? 'cursor-not-allowed bg-teal-400' : 'bg-teal-600 hover:bg-teal-700'}`}
                >
                  {isOtpVerifying ? 'در حال بررسی...' : 'ورود با کد'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
