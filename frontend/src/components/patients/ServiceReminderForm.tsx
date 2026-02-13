'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import { X, Bell, User, Shield, Users, Calendar, Check } from 'lucide-react';
import { ServiceDefinition } from '@/types/service';
import { serviceReminderService } from '@/services/service-reminder.service';
import Swal from 'sweetalert2';

const schema = z.object({
  careRecipientId: z.number().optional(), // Added for global mode
  serviceDefinitionId: z.number().min(1, 'انتخاب خدمت الزامی است'),
  scheduledTime: z.any(),
  note: z.string().optional(),
  notifyPatient: z.boolean(),
  notifyAdmin: z.boolean(),
  notifySupervisor: z.boolean(),
});

type FormData = z.infer<typeof schema>;

import { ServiceReminder } from '@/services/service-reminder.service';

interface Props {
  patientId: number;
  definitions: ServiceDefinition[];
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: ServiceReminder;
}

export default function ServiceReminderForm({ patientId, definitions, onSuccess, onCancel, initialData }: Props) {
  const { control, register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      serviceDefinitionId: initialData?.serviceDefinitionId || undefined,
      scheduledTime: initialData?.scheduledTime ? new Date(initialData.scheduledTime) : undefined,
      note: initialData?.note || '',
      notifyPatient: initialData?.notifyPatient ?? true,
      notifyAdmin: initialData?.notifyAdmin ?? false,
      notifySupervisor: initialData?.notifySupervisor ?? false
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      if (initialData) {
        await serviceReminderService.update(initialData.id, {
            serviceDefinitionId: Number(data.serviceDefinitionId),
            scheduledTime: new Date(data.scheduledTime).toISOString(),
            note: data.note || '',
            notifyPatient: data.notifyPatient,
            notifyAdmin: data.notifyAdmin,
            notifySupervisor: data.notifySupervisor
        });
        Swal.fire({
            title: 'موفق',
            text: 'یادآور با موفقیت ویرایش شد',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        });
      } else {
        await serviceReminderService.create({
            careRecipientId: patientId,
            serviceDefinitionId: Number(data.serviceDefinitionId),
            scheduledTime: new Date(data.scheduledTime).toISOString(),
            note: data.note || '',
            notifyPatient: data.notifyPatient,
            notifyAdmin: data.notifyAdmin,
            notifySupervisor: data.notifySupervisor
        });
        Swal.fire({
            title: 'موفق',
            text: 'یادآور با موفقیت ثبت شد',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        });
      }
      onSuccess();
    } catch (error) {
      console.error(error);
      Swal.fire('خطا', 'مشکلی در عملیات پیش آمد', 'error');
    }
  };

  const RecipientChip = ({ label, icon: Icon, field }: any) => {
    const isChecked = watch(field);
    return (
      <div 
        onClick={() => setValue(field, !isChecked)}
        className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
          isChecked 
            ? 'bg-teal-50 border-teal-200 text-teal-700 shadow-sm' 
            : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
        }`}
      >
        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isChecked ? 'bg-teal-100' : 'bg-gray-100'}`}>
            {isChecked ? <Check className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
        </div>
        <span className="text-sm font-medium">{label}</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-lg w-full">
      <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-6 flex justify-between items-center text-white">
        <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <Bell className="w-6 h-6" />
            </div>
            <div>
                <h3 className="font-bold text-lg">تنظیم یادآور جدید</h3>
                <p className="text-teal-100 text-xs opacity-90">اطلاع‌رسانی خودکار زمان خدمت</p>
            </div>
        </div>
        <button onClick={onCancel} className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
        {/* Service Selection */}
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">انتخاب خدمت</label>
            <select 
                {...register('serviceDefinitionId', { valueAsNumber: true })}
                className="w-full border-gray-300 rounded-xl focus:ring-teal-500 focus:border-teal-500 py-3 bg-gray-50 focus:bg-white transition-colors"
            >
                <option value="">انتخاب کنید...</option>
                {definitions.map(def => (
                    <option key={def.id} value={def.id}>{def.title}</option>
                ))}
            </select>
            {errors.serviceDefinitionId && <p className="text-red-500 text-xs mt-1">{errors.serviceDefinitionId.message}</p>}
        </div>

        {/* Date Time Picker */}
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">زمان یادآوری</label>
            <div className="relative">
                <Controller
                    control={control}
                    name="scheduledTime"
                    render={({ field: { onChange, value } }) => (
                    <DatePicker
                        value={value || new Date()}
                        onChange={(date: any) => onChange(date?.toDate())}
                        calendar={persian}
                        locale={persian_fa}
                        plugins={[<TimePicker key="time-picker" position="bottom" />]}
                        calendarPosition="bottom-right"
                        containerClassName="w-full"
                        inputClass="w-full border-gray-300 rounded-xl focus:ring-teal-500 focus:border-teal-500 py-3 pr-10 bg-gray-50 focus:bg-white transition-colors font-iransans"
                        format="YYYY/MM/DD HH:mm"
                    />
                    )}
                />
                <Calendar className="absolute left-3 top-3.5 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>
        </div>

        {/* Recipients */}
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">گیرندگان هشدار</label>
            <div className="flex flex-wrap gap-3">
                <RecipientChip label="بیمار / خانواده" icon={User} field="notifyPatient" />
                <RecipientChip label="سوپروایزر" icon={Users} field="notifySupervisor" />
                <RecipientChip label="ادمین سیستم" icon={Shield} field="notifyAdmin" />
            </div>
            <p className="text-xs text-gray-400 mt-2 pr-1">
                * پیامک و ایمیل برای افراد انتخاب شده ارسال خواهد شد.
            </p>
        </div>

        {/* Note */}
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">توضیحات تکمیلی (اختیاری)</label>
            <textarea 
                {...register('note')}
                rows={3}
                className="w-full border-gray-300 rounded-xl focus:ring-teal-500 focus:border-teal-500 bg-gray-50 focus:bg-white transition-colors"
                placeholder="متن پیام یا نکات مهم..."
            />
        </div>

        <div className="pt-4 flex gap-3">
            <button type="button" onClick={onCancel} className="flex-1 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                انصراف
            </button>
            <button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-600/20 transition-all transform active:scale-95 disabled:opacity-70 disabled:active:scale-100"
            >
                {isSubmitting ? 'در حال ثبت...' : 'تنظیم یادآور'}
            </button>
        </div>
      </form>
    </div>
  );
}