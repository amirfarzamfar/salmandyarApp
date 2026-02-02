'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { notificationSettingsService, UpdateNotificationSettingsDto } from '@/services/notification-settings.service';
import Swal from 'sweetalert2';
import { Save, Mail, MessageSquare, ShieldCheck, Server, Key, Smartphone, Lock, User } from 'lucide-react';

const schema = z.object({
  // Email
  emailEnabled: z.boolean(),
  smtpHost: z.string().optional(),
  smtpPort: z.number().optional(),
  smtpUser: z.string().optional(),
  smtpPassword: z.string().optional(),
  smtpUseSsl: z.boolean(),

  // SMS
  smsEnabled: z.boolean(),
  smsProvider: z.string().optional(),
  smsApiKey: z.string().optional(),
  smsSenderNumber: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NotificationSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  
  const { register, handleSubmit, setValue, watch, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
        emailEnabled: false,
        smsEnabled: false,
        smtpUseSsl: true,
        smtpPort: 587
    }
  });

  const emailEnabled = watch('emailEnabled');
  const smsEnabled = watch('smsEnabled');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await notificationSettingsService.get();
      setValue('emailEnabled', data.emailEnabled);
      setValue('smtpHost', data.smtpHost);
      setValue('smtpPort', data.smtpPort);
      setValue('smtpUser', data.smtpUser);
      setValue('smtpUseSsl', data.smtpUseSsl);
      
      setValue('smsEnabled', data.smsEnabled);
      setValue('smsProvider', data.smsProvider);
      setValue('smsApiKey', data.smsApiKey);
      setValue('smsSenderNumber', data.smsSenderNumber);
    } catch (error) {
      console.error(error);
      Swal.fire('خطا', 'دریافت تنظیمات با مشکل مواجه شد', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      await notificationSettingsService.update(data as UpdateNotificationSettingsDto);
      Swal.fire({
        title: 'موفق',
        text: 'تنظیمات با موفقیت ذخیره شد',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error(error);
      Swal.fire('خطا', 'ذخیره تنظیمات با مشکل مواجه شد', 'error');
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">در حال بارگذاری تنظیمات...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">تنظیمات ارسال پیام</h1>
        <div className="text-sm text-gray-500">مدیریت درگاه‌های ایمیل و پیامک</div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Email Settings Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    <h2 className="font-bold">تنظیمات ایمیل (SMTP)</h2>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm opacity-90">{emailEnabled ? 'فعال' : 'غیرفعال'}</span>
                    <input 
                        type="checkbox" 
                        {...register('emailEnabled')}
                        className="toggle-checkbox w-5 h-5 accent-white cursor-pointer"
                    />
                </div>
            </div>
            
            <div className={`p-6 grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity ${emailEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <div className="col-span-2 md:col-span-1">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                        <Server className="w-4 h-4 text-gray-400" /> آدرس سرور (Host)
                    </label>
                    <input {...register('smtpHost')} className="w-full border p-2 rounded-lg ltr text-left" placeholder="smtp.gmail.com" />
                </div>
                
                <div className="col-span-2 md:col-span-1">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                        <Server className="w-4 h-4 text-gray-400" /> پورت (Port)
                    </label>
                    <input {...register('smtpPort', { valueAsNumber: true })} type="number" className="w-full border p-2 rounded-lg ltr text-left" placeholder="587" />
                </div>

                <div className="col-span-2 md:col-span-1">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                        <User className="w-4 h-4 text-gray-400" /> نام کاربری
                    </label>
                    <input {...register('smtpUser')} className="w-full border p-2 rounded-lg ltr text-left" placeholder="user@example.com" />
                </div>

                <div className="col-span-2 md:col-span-1">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                        <Key className="w-4 h-4 text-gray-400" /> رمز عبور
                    </label>
                    <input {...register('smtpPassword')} type="password" className="w-full border p-2 rounded-lg ltr text-left" placeholder="••••••••" />
                </div>

                <div className="col-span-2 flex items-center gap-2 mt-2">
                    <input type="checkbox" {...register('smtpUseSsl')} id="ssl" className="w-4 h-4" />
                    <label htmlFor="ssl" className="text-sm text-gray-700 cursor-pointer select-none flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4 text-green-600" />
                        استفاده از ارتباط امن (SSL/TLS)
                    </label>
                </div>
            </div>
        </div>

        {/* SMS Settings Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    <h2 className="font-bold">تنظیمات پیامک (SMS)</h2>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm opacity-90">{smsEnabled ? 'فعال' : 'غیرفعال'}</span>
                    <input 
                        type="checkbox" 
                        {...register('smsEnabled')}
                        className="toggle-checkbox w-5 h-5 accent-white cursor-pointer"
                    />
                </div>
            </div>
            
            <div className={`p-6 grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity ${smsEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <div className="col-span-2 md:col-span-1">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                        <Server className="w-4 h-4 text-gray-400" /> ارائه‌دهنده (Provider)
                    </label>
                    <select {...register('smsProvider')} className="w-full border p-2 rounded-lg">
                        <option value="KavehNegar">کاوه نگار</option>
                        <option value="Twilio">Twilio</option>
                        <option value="Magfa">مگفا</option>
                    </select>
                </div>
                
                <div className="col-span-2 md:col-span-1">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                        <Smartphone className="w-4 h-4 text-gray-400" /> شماره فرستنده
                    </label>
                    <input {...register('smsSenderNumber')} className="w-full border p-2 rounded-lg ltr text-left" placeholder="1000xxxx" />
                </div>

                <div className="col-span-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                        <Lock className="w-4 h-4 text-gray-400" /> کلید دسترسی (API Key)
                    </label>
                    <input {...register('smsApiKey')} className="w-full border p-2 rounded-lg ltr text-left font-mono text-sm" placeholder="API-KEY-HERE" />
                </div>
            </div>
        </div>

        <div className="flex justify-end pt-4">
            <button 
                type="submit" 
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all transform active:scale-95 disabled:opacity-70"
            >
                <Save className="w-5 h-5" />
                {isSubmitting ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
            </button>
        </div>

      </form>
    </div>
  );
}