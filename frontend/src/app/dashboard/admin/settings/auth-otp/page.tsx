'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Swal from 'sweetalert2';
import { KeyRound, Mail, MessageSquare, Save, ShieldCheck, TimerReset } from 'lucide-react';
import { otpLoginSettingsService, OtpLoginSettings } from '@/services/otp-login-settings.service';

const schema = z.object({
  isEnabled: z.boolean(),
  allowSms: z.boolean(),
  allowEmail: z.boolean(),
  codeLength: z.number().min(4).max(8),
  codeExpiryMinutes: z.number().min(1).max(15),
  resendCooldownSeconds: z.number().min(30).max(300),
  maxVerifyAttempts: z.number().min(3).max(10),
});

type FormData = z.infer<typeof schema>;

export default function OtpLoginSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { register, handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      isEnabled: false,
      allowSms: true,
      allowEmail: true,
      codeLength: 6,
      codeExpiryMinutes: 5,
      resendCooldownSeconds: 60,
      maxVerifyAttempts: 5,
    }
  });

  const isEnabled = watch('isEnabled');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await otpLoginSettingsService.get();
        applyValues(data);
      } catch (error) {
        console.error(error);
        Swal.fire('خطا', 'دریافت تنظیمات OTP با مشکل مواجه شد', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [setValue]);

  const applyValues = (data: OtpLoginSettings) => {
    setValue('isEnabled', data.isEnabled);
    setValue('allowSms', data.allowSms);
    setValue('allowEmail', data.allowEmail);
    setValue('codeLength', data.codeLength);
    setValue('codeExpiryMinutes', data.codeExpiryMinutes);
    setValue('resendCooldownSeconds', data.resendCooldownSeconds);
    setValue('maxVerifyAttempts', data.maxVerifyAttempts);
  };

  const onSubmit = async (data: FormData) => {
    try {
      const saved = await otpLoginSettingsService.update(data);
      applyValues(saved);
      Swal.fire({
        title: 'موفق',
        text: 'تنظیمات ورود با رمز یکبار مصرف ذخیره شد',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error(error);
      Swal.fire('خطا', 'ذخیره تنظیمات OTP با مشکل مواجه شد', 'error');
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">در حال بارگذاری تنظیمات...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">ورود با رمز یکبار مصرف</h1>
          <p className="mt-1 text-sm text-gray-500">مدیریت OTP برای کاربرانی که قبلا ثبت نام کرده‌اند.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm text-indigo-700">
          <ShieldCheck className="h-4 w-4" />
          {isEnabled ? 'OTP فعال است' : 'OTP غیرفعال است'}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 bg-gradient-to-r from-indigo-600 to-violet-500 p-4 text-white sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              <h2 className="font-bold">فعال‌سازی ورود با OTP</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm opacity-90">{isEnabled ? 'فعال' : 'غیرفعال'}</span>
              <input
                type="checkbox"
                {...register('isEnabled')}
                className="h-5 w-5 cursor-pointer accent-white"
              />
            </div>
          </div>

          <div className={`grid grid-cols-1 gap-6 p-6 transition-opacity md:grid-cols-2 ${isEnabled ? 'opacity-100' : 'pointer-events-none opacity-50'}`}>
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-700">
                <MessageSquare className="h-4 w-4 text-teal-600" />
                کانال پیامک
              </div>
              <label className="flex items-center gap-3 text-sm text-gray-700">
                <input type="checkbox" {...register('allowSms')} className="h-4 w-4" />
                اجازه ارسال کد از طریق پیامک
              </label>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-700">
                <Mail className="h-4 w-4 text-blue-600" />
                کانال ایمیل
              </div>
              <label className="flex items-center gap-3 text-sm text-gray-700">
                <input type="checkbox" {...register('allowEmail')} className="h-4 w-4" />
                اجازه ارسال کد از طریق ایمیل
              </label>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-700">
                <KeyRound className="h-4 w-4 text-gray-400" />
                طول کد
              </label>
              <input
                type="number"
                {...register('codeLength', { valueAsNumber: true })}
                className="w-full rounded-xl border p-3 text-left ltr"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-700">
                <TimerReset className="h-4 w-4 text-gray-400" />
                زمان انقضا (دقیقه)
              </label>
              <input
                type="number"
                {...register('codeExpiryMinutes', { valueAsNumber: true })}
                className="w-full rounded-xl border p-3 text-left ltr"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-700">
                <TimerReset className="h-4 w-4 text-gray-400" />
                فاصله ارسال مجدد (ثانیه)
              </label>
              <input
                type="number"
                {...register('resendCooldownSeconds', { valueAsNumber: true })}
                className="w-full rounded-xl border p-3 text-left ltr"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-700">
                <ShieldCheck className="h-4 w-4 text-gray-400" />
                حداکثر دفعات تلاش
              </label>
              <input
                type="number"
                {...register('maxVerifyAttempts', { valueAsNumber: true })}
                className="w-full rounded-xl border p-3 text-left ltr"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          برای ارسال واقعی OTP، تنظیمات `پیامک` یا `ایمیل` باید در صفحه تنظیمات پیام نیز فعال و کامل شده باشد.
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-70 sm:w-auto"
          >
            <Save className="h-5 w-5" />
            {isSubmitting ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
          </button>
        </div>
      </form>
    </div>
  );
}
