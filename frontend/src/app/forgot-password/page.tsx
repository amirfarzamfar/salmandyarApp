'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService } from '@/services/auth.service';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, User, Lock, KeyRound, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { AuthBrandLink } from '@/components/auth/AuthBrandLink';

const step1Schema = z.object({
  identifier: z.string().min(1, 'لطفا شماره موبایل یا ایمیل خود را وارد کنید'),
});

const step2Schema = z.object({
  token: z.string().min(1, 'لطفا کد بازیابی را وارد کنید'),
  newPassword: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
  confirmPassword: z.string().min(6, 'تکرار رمز عبور الزامی است'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "رمز عبور و تکرار آن مطابقت ندارند",
  path: ["confirmPassword"],
});

type Step1FormData = z.infer<typeof step1Schema>;
type Step2FormData = z.infer<typeof step2Schema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [identifier, setIdentifier] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form1 = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
  });

  const form2 = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
  });

  const onSubmitStep1 = async (data: Step1FormData) => {
    setIsLoading(true);
    try {
      const response = await authService.forgotPassword(data);
      setIdentifier(data.identifier);
      
      // In a real scenario, the token is sent via SMS/Email.
      // For this demo, we might get the token in the response and show it, or just show success.
      Swal.fire({
        title: 'ارسال کد',
        text: response.message || 'در صورت وجود حساب کاربری، کد بازیابی ارسال شد.',
        icon: 'success',
        confirmButtonText: 'تایید',
        confirmButtonColor: '#0d9488'
      }).then(() => {
        // If it's a demo and we received the token, we could auto-fill it or alert it.
        // Let's just move to step 2.
        if (response.token) {
           // We can pre-fill it for demo purposes, but usually user enters it.
           form2.setValue('token', response.token);
        }
        setStep(2);
      });
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      Swal.fire({
        title: 'خطا',
        text: error.response?.data?.error || 'خطا در ارسال درخواست',
        icon: 'error',
        confirmButtonText: 'تلاش مجدد',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitStep2 = async (data: Step2FormData) => {
    setIsLoading(true);
    try {
      await authService.resetPassword({
        identifier,
        token: data.token,
        newPassword: data.newPassword
      });
      
      Swal.fire({
        title: 'موفقیت‌آمیز',
        text: 'رمز عبور شما با موفقیت تغییر کرد',
        icon: 'success',
        confirmButtonText: 'ورود به حساب',
        confirmButtonColor: '#0d9488'
      }).then(() => {
        router.push('/login');
      });
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      Swal.fire({
        title: 'خطا',
        text: error.response?.data?.error || 'خطا در بازیابی رمز عبور',
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
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl dark:shadow-none dark:border dark:border-gray-700">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <AuthBrandLink />
          </div>
          <div className="mx-auto h-16 w-16 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mb-4">
            <KeyRound className="h-8 w-8 text-teal-600 dark:text-teal-400" />
          </div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            بازیابی رمز عبور
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <Link href="/login" className="font-medium text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300 transition-colors flex items-center justify-center gap-1">
              <ArrowRight className="h-4 w-4" />
              بازگشت به صفحه ورود
            </Link>
          </p>
        </div>

        {step === 1 ? (
          <form className="mt-8 space-y-6" onSubmit={form1.handleSubmit(onSubmitStep1)}>
            <div className="space-y-6">
              <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">شماره موبایل یا ایمیل</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="identifier"
                    {...form1.register('identifier')}
                    className="block w-full pr-10 rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white sm:text-sm py-2 border"
                    placeholder="0912... یا example@mail.com"
                    dir="ltr"
                  />
                </div>
                {form1.formState.errors.identifier && <p className="mt-1 text-xs text-red-500">{form1.formState.errors.identifier.message}</p>}
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
                    <KeyRound className="h-5 w-5 text-teal-500 group-hover:text-teal-400" aria-hidden="true" />
                  </span>
                )}
                {isLoading ? 'در حال ارسال...' : 'ارسال کد بازیابی'}
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={form2.handleSubmit(onSubmitStep2)}>
            <div className="space-y-6">
              <div>
                <label htmlFor="token" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">کد بازیابی</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="token"
                    {...form2.register('token')}
                    className="block w-full pr-10 rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white sm:text-sm py-2 border"
                    placeholder="کد پیامک/ایمیل شده را وارد کنید"
                    dir="ltr"
                  />
                </div>
                {form2.formState.errors.token && <p className="mt-1 text-xs text-red-500">{form2.formState.errors.token.message}</p>}
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رمز عبور جدید</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    {...form2.register('newPassword')}
                    className="block w-full pr-10 pl-10 rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white sm:text-sm py-2 border"
                    placeholder="••••••"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {form2.formState.errors.newPassword && <p className="mt-1 text-xs text-red-500">{form2.formState.errors.newPassword.message}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تکرار رمز عبور جدید</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    {...form2.register('confirmPassword')}
                    className="block w-full pr-10 pl-10 rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white sm:text-sm py-2 border"
                    placeholder="••••••"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {form2.formState.errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{form2.formState.errors.confirmPassword.message}</p>}
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
                    <Lock className="h-5 w-5 text-teal-500 group-hover:text-teal-400" aria-hidden="true" />
                  </span>
                )}
                {isLoading ? 'در حال ذخیره...' : 'تغییر رمز عبور'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
