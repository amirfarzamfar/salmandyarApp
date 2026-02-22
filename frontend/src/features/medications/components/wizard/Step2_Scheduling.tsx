import { useFormContext, Controller } from 'react-hook-form';
import { MedicationFormData, MedicationFrequencyType } from '../../types';
import { TimeListSelector } from '../shared/TimeListSelector';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import { Calendar } from 'lucide-react';

export const Step2_Scheduling = () => {
  const { register, control, watch, setValue, formState: { errors } } = useFormContext<MedicationFormData>();
  
  const frequencyType = watch('frequencyType');
  const isPRN = watch('isPRN');

  // Handle PRN toggle effect on Frequency
  // If PRN is checked in step 3 (Wait, PRN is in step 3 in my plan, but here frequencyType can be PRN too)
  // Let's stick to the plan.

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Frequency Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-teal-600" />
          زمان‌بندی مصرف
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              الگوی تکرار
            </label>
            <select
              {...register('frequencyType', { valueAsNumber: true })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all outline-none bg-white"
            >
              <option value={MedicationFrequencyType.Daily}>روزانه (ساعات مشخص)</option>
              <option value={MedicationFrequencyType.Weekly}>هفتگی</option>
              <option value={MedicationFrequencyType.PRN}>PRN (در صورت نیاز)</option>
              <option value={MedicationFrequencyType.Interval}>بازه زمانی (هر X ساعت)</option>
              <option value={MedicationFrequencyType.SpecificDays}>روزهای خاص</option>
            </select>
          </div>

          {/* Dynamic Frequency Detail Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              جزئیات زمان‌بندی
            </label>
            
            {Number(frequencyType) === MedicationFrequencyType.Daily ? (
              <Controller
                control={control}
                name="frequencyDetail"
                render={({ field }) => (
                  <TimeListSelector
                    value={field.value ? field.value.split(',').filter(Boolean) : []}
                    onChange={(times) => field.onChange(times.join(','))}
                  />
                )}
              />
            ) : Number(frequencyType) === MedicationFrequencyType.Interval ? (
              <div className="relative">
                <input
                  type="number"
                  placeholder="مثلاً: 8"
                  {...register('frequencyDetail')}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all outline-none pl-12"
                />
                <span className="absolute left-4 top-2.5 text-gray-400 text-sm">ساعت یکبار</span>
              </div>
            ) : (
              <input
                {...register('frequencyDetail')}
                placeholder={
                  Number(frequencyType) === MedicationFrequencyType.PRN 
                    ? "حداکثر دفعات مجاز یا شرایط مصرف" 
                    : "توضیحات تکمیلی"
                }
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all outline-none"
              />
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 my-6"></div>

      {/* Date Range Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            تاریخ شروع <span className="text-red-500">*</span>
          </label>
          <Controller
            control={control}
            name="startDate"
            render={({ field }) => (
              <DatePicker
                value={field.value ? new Date(field.value) : new Date()}
                onChange={(date: any) => field.onChange(date ? date.toDate().toISOString() : '')}
                calendar={persian}
                locale={persian_fa}
                calendarPosition="bottom-right"
                inputClass="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all outline-none"
                format="YYYY/MM/DD"
              />
            )}
          />
          {errors.startDate && (
            <p className="text-xs text-red-500">{errors.startDate.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            تاریخ پایان (اختیاری)
          </label>
          <Controller
            control={control}
            name="endDate"
            render={({ field }) => (
              <DatePicker
                value={field.value ? new Date(field.value) : undefined}
                onChange={(date: any) => field.onChange(date ? date.toDate().toISOString() : undefined)}
                calendar={persian}
                locale={persian_fa}
                calendarPosition="bottom-right"
                inputClass="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all outline-none placeholder-gray-400"
                format="YYYY/MM/DD"
                placeholder="--/--/--"
              />
            )}
          />
        </div>
      </div>
    </div>
  );
};
