'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { Save, Bell, Mail, MessageSquare, Clock3 } from 'lucide-react';
import {
  medicationAlertSettingsService,
  UpdateMedicationAlertSettingsDto,
} from '@/services/medication-alert-settings.service';

type FormData = UpdateMedicationAlertSettingsDto;

const variables = ['{PatientName}', '{MedicationName}', '{CurrentStock}', '{AlertThreshold}', '{DateTime}'];

export default function MedicationAlertSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { register, handleSubmit, setValue, formState: { isSubmitting } } = useForm<FormData>({
    defaultValues: {
      allowEarlyConfirmationMinutes: 30,
      allowLateConfirmationMinutes: 120,
      smsTemplate: '',
      emailSubjectTemplate: '',
      emailBodyTemplate: '',
      inAppTemplate: '',
    }
  });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await medicationAlertSettingsService.get();
        setValue('allowEarlyConfirmationMinutes', data.allowEarlyConfirmationMinutes);
        setValue('allowLateConfirmationMinutes', data.allowLateConfirmationMinutes);
        setValue('smsTemplate', data.smsTemplate);
        setValue('emailSubjectTemplate', data.emailSubjectTemplate);
        setValue('emailBodyTemplate', data.emailBodyTemplate);
        setValue('inAppTemplate', data.inAppTemplate);
      } catch {
        Swal.fire('خطا', 'دریافت تنظیمات پیام هشدار دارو با مشکل مواجه شد.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      await medicationAlertSettingsService.update(data);
      Swal.fire({
        title: 'موفق',
        text: 'تنظیمات پیام هشدار دارو ذخیره شد.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire('خطا', 'ذخیره تنظیمات پیام هشدار دارو انجام نشد.', 'error');
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">در حال بارگذاری تنظیمات پیام هشدار دارو...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">تنظیمات پایش و هشدار دارو</h1>
          <p className="mt-1 text-sm text-gray-500">مدیریت بازه مجاز ثبت مصرف توسط بیمار به‌همراه قالب پیام‌های هشدار کمبود موجودی دارو.</p>
        </div>
        <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-700">
          متغیرها: {variables.join(' - ')}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <TemplateCard
          title="تنظیمات پایش مصرف دارو"
          icon={<Clock3 className="h-5 w-5" />}
          colorClass="from-indigo-500 to-violet-600"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">بازه مجاز ثبت مصرف قبل از زمان دارو (دقیقه)</label>
              <input
                type="number"
                min={0}
                max={720}
                {...register('allowEarlyConfirmationMinutes', { valueAsNumber: true })}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
              />
              <p className="text-xs text-slate-500">تعیین می‌کند بیمار چند دقیقه قبل از زمان مقرر بتواند مصرف دارو را ثبت کند. مثال: 30 دقیقه.</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">بازه مجاز ثبت مصرف با تأخیر (دقیقه)</label>
              <input
                type="number"
                min={1}
                max={1440}
                {...register('allowLateConfirmationMinutes', { valueAsNumber: true })}
                className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
              />
              <p className="text-xs text-slate-500">تعیین می‌کند بیمار تا چند دقیقه پس از زمان مقرر امکان ثبت مصرف داشته باشد. مثال: 120 دقیقه.</p>
            </div>
          </div>
        </TemplateCard>

        <TemplateCard
          title="نوتیفیکیشن داخل سیستم"
          icon={<Bell className="h-5 w-5" />}
          colorClass="from-amber-500 to-amber-600"
        >
          <textarea
            {...register('inAppTemplate')}
            rows={4}
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
          />
        </TemplateCard>

        <TemplateCard
          title="متن پیامک هشدار"
          icon={<MessageSquare className="h-5 w-5" />}
          colorClass="from-teal-500 to-teal-600"
        >
          <textarea
            {...register('smsTemplate')}
            rows={4}
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
          />
        </TemplateCard>

        <TemplateCard
          title="قالب ایمیل"
          icon={<Mail className="h-5 w-5" />}
          colorClass="from-blue-500 to-blue-600"
        >
          <div className="space-y-4">
            <input
              {...register('emailSubjectTemplate')}
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
            />
            <textarea
              {...register('emailBodyTemplate')}
              rows={6}
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
            />
          </div>
        </TemplateCard>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-8 py-3 font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-60"
          >
            <Save className="h-5 w-5" />
            {isSubmitting ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
          </button>
        </div>
      </form>
    </div>
  );
}

function TemplateCard({
  title,
  icon,
  colorClass,
  children
}: {
  title: string;
  icon: React.ReactNode;
  colorClass: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      <div className={`bg-gradient-to-r ${colorClass} px-5 py-4 text-white`}>
        <div className="flex items-center gap-2 font-bold">
          {icon}
          {title}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
