'use client';

import { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vitalSignSchema, VitalSignFormData, getVitalWarnings } from './VitalSignFormSchema';
import { AlertTriangle, Clock, Save, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { patientService } from '@/services/patient.service';
import { evaluateBloodSugar, getBloodSugarMeasurementTypeLabel } from '@/utils/blood-sugar';
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import TimePicker from "react-multi-date-picker/plugins/time_picker";

interface Props {
  patientId: number;
  expectedTime?: Date;
  onSuccess: () => void;
  onCancel: () => void;
  showCloseButton?: boolean;
}

export default function VitalSignForm({ patientId, expectedTime, onSuccess, onCancel, showCloseButton }: Props) {
  const { register, handleSubmit, watch, setValue, control, formState: { errors, isSubmitting } } = useForm<VitalSignFormData>({
    resolver: zodResolver(vitalSignSchema),
    defaultValues: {
      measuredAt: new Date().toISOString(),
      oxygenSaturation: 98,
      bodyTemperature: 37,
      glasgowComaScale: 15
    }
  });

  const watchedValues = watch();
  const {
    systolicBloodPressure,
    diastolicBloodPressure,
    pulseRate,
    respiratoryRate,
    bodyTemperature,
    oxygenSaturation,
    bloodSugar,
    bloodSugarMeasurementType,
    glasgowComaScale,
    measuredAt,
  } = watchedValues;

  const warnings = useMemo(() => {
    const newWarnings = getVitalWarnings({
      systolicBloodPressure,
      diastolicBloodPressure,
      bodyTemperature,
      oxygenSaturation,
      bloodSugar,
      bloodSugarMeasurementType,
    });

    if (expectedTime && measuredAt) {
      const measured = new Date(measuredAt).getTime();
      const expected = expectedTime.getTime();
      const diffMinutes = (measured - expected) / (1000 * 60);

      if (Math.abs(diffMinutes) > 30) {
        const direction = diffMinutes > 0 ? 'تاخیر' : 'زودتر از موعد';
        newWarnings.push(`زمان ثبت با برنامه زمان‌بندی (${direction} ${Math.abs(Math.round(diffMinutes))} دقیقه) مغایرت دارد.`);
      }
    }

    return newWarnings;
  }, [
    systolicBloodPressure,
    diastolicBloodPressure,
    bodyTemperature,
    oxygenSaturation,
    bloodSugar,
    bloodSugarMeasurementType,
    measuredAt,
    expectedTime,
  ]);

  const bloodSugarEvaluation = useMemo(
    () => evaluateBloodSugar(bloodSugar, bloodSugarMeasurementType),
    [bloodSugar, bloodSugarMeasurementType]
  );

  // Calculate MAP dynamically
  const sbp = systolicBloodPressure || 0;
  const dbp = diastolicBloodPressure || 0;
  const map = sbp && dbp ? Math.round((sbp + 2 * dbp) / 3) : null;

  const onSubmit = async (data: VitalSignFormData) => {
    if (warnings.length > 0) {
      const result = await Swal.fire({
        title: 'هشدار بالینی',
        text: 'برخی مقادیر خارج از رنج نرمال هستند. آیا از صحت آنها اطمینان دارید؟',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'بله، ثبت کن',
        cancelButtonText: 'بازبینی',
        confirmButtonColor: '#f59e0b'
      });
      if (!result.isConfirmed) return;
    }

    try {
      // Ensure measuredAt is valid ISO string
      const measuredAtISO = new Date(data.measuredAt).toISOString();
      
      const result = await patientService.addVitalSign(patientId, {
        ...data,
        measuredAt: measuredAtISO,
        careRecipientId: patientId
      });
      
      Swal.fire({
        title: 'ثبت موفق',
        text: 'علائم حیاتی با موفقیت ثبت شد',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });

      if (result?.alerts?.length) {
        const severity = result.alerts.some(a => a.severity === 'Critical') ? 'error' : 'warning';
        const html = `<div style="text-align:right;direction:rtl"><div style="font-weight:700;margin-bottom:8px">${result.patientName}</div><ul style="margin:0;padding-right:18px">${result.alerts
          .slice(0, 5)
          .map(a => `<li style="margin-bottom:4px">${a.title}</li>`)
          .join('')}</ul></div>`;
        await Swal.fire({
          title: severity === 'error' ? 'هشدار فوری' : 'هشدار بالینی',
          html,
          icon: severity as any,
          confirmButtonText: 'متوجه شدم',
          confirmButtonColor: severity === 'error' ? '#ef4444' : '#f59e0b'
        });
      }
      onSuccess();
    } catch (error: any) {
      const serverMsg = error?.response?.data?.error || 'مشکلی در ثبت اطلاعات پیش آمد';
      Swal.fire('خطا', serverMsg, 'error');
    }
  };

  const setNormalPreset = () => {
    setValue('systolicBloodPressure', 120);
    setValue('diastolicBloodPressure', 80);
    setValue('pulseRate', 72);
    setValue('respiratoryRate', 16);
    setValue('bodyTemperature', 37);
    setValue('oxygenSaturation', 98);
    setValue('glasgowComaScale', 15);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 relative">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h3 className="text-lg font-bold text-gray-900">ثبت علائم حیاتی جدید</h3>
        {showCloseButton !== false && (
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      <div className="mb-4 flex justify-end">
        <button 
          type="button" 
          onClick={setNormalPreset}
          className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
        >
          استفاده از مقادیر نرمال (Preset)
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Time Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Clock className="h-4 w-4 ml-2 text-gray-500" />
            زمان اندازه‌گیری (شمسی)
          </label>
          <Controller
            control={control}
            name="measuredAt"
            render={({ field: { onChange, value } }) => (
              <DatePicker
                portal
                value={value ? new Date(value) : new Date()}
                onChange={(date: any) => {
                  if (date && date.isValid) {
                    onChange(date.toDate().toISOString());
                  }
                }}
                calendar={persian}
                locale={persian_fa}
                format="YYYY/MM/DD HH:mm"
                plugins={[
                  <TimePicker key="time-picker" position="bottom" />
                ]}
                calendarPosition="bottom-right"
                inputClass="w-full border-gray-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 text-center font-bold text-gray-700 h-10"
                containerStyle={{ width: "100%" }}
              />
            )}
          />
          {errors.measuredAt && <p className="text-red-500 text-xs mt-1">{errors.measuredAt.message}</p>}
          
          {/* Late Entry Reason Logic */}
          {watchedValues.measuredAt && (Date.now() - new Date(watchedValues.measuredAt).getTime() > 3600000) && (
             <div className="mt-3 animate-fade-in">
               <label className="block text-sm font-medium text-amber-700 mb-1">دلیل تاخیر در ثبت (بیش از ۱ ساعت)</label>
               <input 
                 {...register('delayReason')}
                 className="w-full border-amber-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                 placeholder="مثال: رسیدگی به بیمار بدحال دیگر..."
               />
               {errors.delayReason && <p className="text-red-500 text-xs mt-1">{errors.delayReason.message}</p>}
             </div>
          )}
        </div>

        {/* Vitals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* BP */}
          <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
             <div>
               <label className="block text-sm font-medium text-gray-700">فشار سیستول (mmHg)</label>
               <input type="number" {...register('systolicBloodPressure', { valueAsNumber: true })} className="mt-1 w-full rounded-lg border-gray-300" />
               {errors.systolicBloodPressure && <p className="text-red-500 text-xs">{errors.systolicBloodPressure.message}</p>}
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700">فشار دیاستول (mmHg)</label>
               <input type="number" {...register('diastolicBloodPressure', { valueAsNumber: true })} className="mt-1 w-full rounded-lg border-gray-300" />
               {errors.diastolicBloodPressure && <p className="text-red-500 text-xs">{errors.diastolicBloodPressure.message}</p>}
             </div>
             {map && (
               <div className="col-span-2 text-center text-sm text-slate-600 font-mono bg-slate-100 py-1 rounded">
                 MAP: {map} mmHg
               </div>
             )}
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700">ضربان قلب (BPM)</label>
             <input type="number" {...register('pulseRate', { valueAsNumber: true })} className="mt-1 w-full rounded-lg border-gray-300" />
             {errors.pulseRate && <p className="text-red-500 text-xs">{errors.pulseRate.message}</p>}
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700">تعداد تنفس (RPM)</label>
             <input type="number" {...register('respiratoryRate', { valueAsNumber: true })} className="mt-1 w-full rounded-lg border-gray-300" />
             {errors.respiratoryRate && <p className="text-red-500 text-xs">{errors.respiratoryRate.message}</p>}
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700">دمای بدن (°C)</label>
             <input type="number" step="0.1" {...register('bodyTemperature', { valueAsNumber: true })} className="mt-1 w-full rounded-lg border-gray-300" />
             {errors.bodyTemperature && <p className="text-red-500 text-xs">{errors.bodyTemperature.message}</p>}
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700">اشباع اکسیژن (%)</label>
             <input type="number" {...register('oxygenSaturation', { valueAsNumber: true })} className="mt-1 w-full rounded-lg border-gray-300" />
             {errors.oxygenSaturation && <p className="text-red-500 text-xs">{errors.oxygenSaturation.message}</p>}
          </div>

          <div className="md:col-span-2 rounded-lg border border-amber-100 bg-amber-50/60 p-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700">قند خون (mg/dL)</label>
                 <input type="number" {...register('bloodSugar', { valueAsNumber: true })} className="mt-1 w-full rounded-lg border-gray-300" />
                 {errors.bloodSugar && <p className="text-red-500 text-xs mt-1">{errors.bloodSugar.message}</p>}
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700">نوع اندازه‌گیری قند خون</label>
                 <select {...register('bloodSugarMeasurementType')} className="mt-1 w-full rounded-lg border-gray-300 bg-white">
                   <option value="">انتخاب کنید</option>
                   <option value="fasting">{getBloodSugarMeasurementTypeLabel('fasting')}</option>
                   <option value="random">{getBloodSugarMeasurementTypeLabel('random')}</option>
                 </select>
                 {errors.bloodSugarMeasurementType && <p className="text-red-500 text-xs mt-1">{errors.bloodSugarMeasurementType.message}</p>}
               </div>
             </div>

             {bloodSugar != null && !bloodSugarMeasurementType && (
               <div className="mt-3 rounded-lg border border-amber-200 bg-white/70 px-3 py-2 text-sm text-amber-700">
                 برای نمایش وضعیت لحظه‌ای قند خون، نوع اندازه‌گیری را انتخاب کنید.
               </div>
             )}

             {bloodSugarEvaluation && (
               <div className={`mt-3 rounded-lg border px-3 py-3 ${bloodSugarEvaluation.statusMeta.cardClassName}`}>
                 <div className="flex flex-wrap items-center justify-between gap-2">
                   <div className="text-sm font-bold text-gray-900">
                     وضعیت لحظه‌ای قند خون {bloodSugarEvaluation.measurementLabel}
                   </div>
                   <span className={`rounded-full border px-2 py-1 text-xs font-bold ${bloodSugarEvaluation.statusMeta.badgeClassName}`}>
                     {bloodSugarEvaluation.statusMeta.label}
                   </span>
                 </div>
                 <div className="mt-1 text-sm text-gray-700">{bloodSugarEvaluation.message}</div>
                 {bloodSugarEvaluation.isCritical && (
                   <div className={`mt-2 text-sm font-bold ${bloodSugarEvaluation.statusMeta.accentClassName}`}>
                     هشدار فوری: مقدار قند خون در محدوده خطرناک قرار دارد.
                   </div>
                 )}
               </div>
             )}
          </div>
          
          <div>
             <label className="block text-sm font-medium text-gray-700">GCS (هوشیاری)</label>
             <input type="number" {...register('glasgowComaScale', { valueAsNumber: true })} className="mt-1 w-full rounded-lg border-gray-300" />
             {errors.glasgowComaScale && <p className="text-red-500 text-xs">{errors.glasgowComaScale.message}</p>}
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="block text-sm font-medium text-gray-700">یادداشت (اختیاری)</label>
          <textarea {...register('note')} rows={2} className="mt-1 w-full rounded-lg border-gray-300" placeholder="توضیحات تکمیلی..." />
          {errors.note && <p className="text-red-500 text-xs">{errors.note.message}</p>}
        </div>

        {/* Warnings Display */}
        {warnings.length > 0 && (
          <div className="bg-yellow-50 border-r-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="mr-3">
                <h3 className="text-sm font-medium text-yellow-800">هشدارهای بالینی</h3>
                <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                  {warnings.map((w, idx) => <li key={idx}>{w}</li>)}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            انصراف
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center px-4 py-2 bg-teal-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
          >
            {isSubmitting ? 'در حال ثبت...' : (
              <>
                <Save className="ml-2 h-4 w-4" />
                ثبت اطلاعات
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
