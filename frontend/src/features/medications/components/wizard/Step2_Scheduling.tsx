import { useFormContext, Controller, useWatch } from 'react-hook-form';
import { MedicationFormData, MedicationFrequencyType } from '../../types';
import { TimeListSelector } from '../shared/TimeListSelector';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import { Calendar } from 'lucide-react';

const WEEK_DAYS = [
  { id: 6, label: 'شنبه' },
  { id: 0, label: 'یک‌شنبه' },
  { id: 1, label: 'دوشنبه' },
  { id: 2, label: 'سه‌شنبه' },
  { id: 3, label: 'چهارشنبه' },
  { id: 4, label: 'پنج‌شنبه' },
  { id: 5, label: 'جمعه' },
];

export const Step2_Scheduling = () => {
  const { register, control, setValue, getValues, formState: { errors } } = useFormContext<MedicationFormData>();
  
  const frequencyType = useWatch<MedicationFormData, 'frequencyType'>({ control, name: 'frequencyType' });
  const frequencyDetail = useWatch<MedicationFormData, 'frequencyDetail'>({ control, name: 'frequencyDetail' });

  const handleDayToggle = (dayId: number, currentDetail: string | null | undefined) => {
    // Format: "DAYS:0,1|TIMES:08:00" or simple "0,1|08:00"
    const parts = (currentDetail || '').split('|');
    const daysPart = parts[0] || '';
    const timesPart = parts[1] || '';
    
    let currentDays = daysPart ? daysPart.split(',').map(Number) : [];
    
    if (currentDays.includes(dayId)) {
      currentDays = currentDays.filter(d => d !== dayId);
    } else {
      currentDays.push(dayId);
    }
    
    const newDaysStr = currentDays.join(',');
    const newValue = `${newDaysStr}|${timesPart}`;
    setValue('frequencyDetail', newValue, { shouldValidate: true, shouldDirty: true });
  };

  const handleWeeklyTimesChange = (newTimes: string[]) => {
    const currentDetail = getValues('frequencyDetail');
    const parts = (currentDetail || '').split('|');
    const daysPart = parts[0] || '';
    
    const newTimesStr = newTimes.join(',');
    setValue('frequencyDetail', `${daysPart}|${newTimesStr}`, { shouldValidate: true, shouldDirty: true });
  };

  const getWeeklyDays = () => {
    // Force dependency on frequencyDetail to ensure re-render
    const detail = frequencyDetail || ''; 
    if (!detail) return [];
    
    if (!detail.includes('|') && Number(frequencyType) === MedicationFrequencyType.Weekly) {
         // If we switched to Weekly but format is still Daily (just times), return empty days
         return [];
    }
    
    const [daysStr] = detail.split('|');
    return daysStr ? daysStr.split(',').map(d => parseInt(d)).filter(n => !isNaN(n)) : [];
  };

  const getWeeklyTimes = () => {
    const detail = frequencyDetail || '';
    if (!detail) return [];
    
    if (!detail.includes('|')) {
        return [];
    }

    const [, timesStr] = detail.split('|');
    return timesStr ? timesStr.split(',').filter(Boolean) : [];
  };

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
            <Controller
              control={control}
              name="frequencyType"
              render={({ field }) => (
                <select
                  value={field.value}
                  onChange={(e) => {
                    const newType = Number(e.target.value);
                    field.onChange(newType);
                    
                    // Reset frequency detail when type changes to avoid format mismatch
                    // This ensures the UI renders correctly for the new type
                    setValue('frequencyDetail', '', { shouldValidate: true, shouldDirty: true });
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all outline-none bg-white"
                >
                  <option value={MedicationFrequencyType.Daily}>روزانه (همه روزها)</option>
                  <option value={MedicationFrequencyType.Weekly}>هفتگی (روزهای خاص)</option>
                  <option value={MedicationFrequencyType.PRN}>PRN (در صورت نیاز)</option>
                  <option value={MedicationFrequencyType.Interval}>بازه زمانی (هر X ساعت)</option>
                </select>
              )}
            />
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
                    value={field.value && !field.value.includes('|') ? field.value.split(',').filter(Boolean) : []}
                    onChange={(times) => field.onChange(times.join(','))}
                  />
                )}
              />
            ) : Number(frequencyType) === MedicationFrequencyType.Weekly ? (
              <div className="space-y-4 animate-in fade-in duration-300">
                 {/* Week Days Selector */}
                 <div className="space-y-2">
                    <span className="text-xs text-gray-500">روزهای مصرف:</span>
                    <div className="flex flex-wrap gap-2">
                        {WEEK_DAYS.map((day) => {
                            const selectedDays = getWeeklyDays();
                            const isSelected = selectedDays.includes(day.id);
                            
                            return (
                                <button
                                    key={day.id}
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleDayToggle(day.id, frequencyDetail);
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                                        isSelected 
                                        ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-200' 
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300 hover:bg-teal-50'
                                    }`}
                                >
                                    {day.label}
                                </button>
                            );
                        })}
                    </div>
                 </div>

                 {/* Times Selector for Weekly */}
                 <div className="space-y-2 pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-500">ساعات مصرف در روزهای انتخاب شده:</span>
                    <TimeListSelector
                        value={getWeeklyTimes()}
                        onChange={handleWeeklyTimesChange}
                    />
                 </div>
              </div>
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
