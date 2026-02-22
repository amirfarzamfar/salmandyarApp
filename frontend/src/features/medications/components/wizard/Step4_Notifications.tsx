import { useFormContext } from 'react-hook-form';
import { MedicationFormData } from '../../types';
import { Bell, FileText, Clock, TrendingUp } from 'lucide-react';

export const Step4_Notifications = () => {
  const { register, watch } = useFormContext<MedicationFormData>();
  
  const escalationEnabled = watch('escalationEnabled');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Grace Period & Escalation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600" />
            مهلت تاخیر مجاز (دقیقه)
          </label>
          <input
            type="number"
            {...register('gracePeriodMinutes', { valueAsNumber: true })}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all outline-none"
            placeholder="30"
            min="0"
          />
          <p className="text-xs text-gray-500">زمان مجاز پس از ساعت مقرر برای ثبت بدون تاخیر.</p>
        </div>

        <div className="space-y-2">
          <label className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${escalationEnabled ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:border-amber-200'}`}>
            <input
              type="checkbox"
              {...register('escalationEnabled')}
              className="mt-1 w-4 h-4 text-amber-600 rounded focus:ring-amber-500 border-gray-300"
            />
            <div className="flex-1">
              <span className="font-medium text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Escalation (ارتقاء هشدار)
              </span>
              <p className="text-xs text-gray-500 mt-1">
                در صورت عدم اقدام پرستار، به سوپروایزر اطلاع داده شود.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Notifications */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
          <Bell className="w-5 h-5 text-teal-600" />
          تنظیمات اطلاع‌رسانی
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { id: 'notifyPatient', label: 'بیمار' },
            { id: 'notifyNurse', label: 'پرستار' },
            { id: 'notifySupervisor', label: 'سوپروایزر' },
            { id: 'notifyFamily', label: 'خانواده' },
          ].map((item) => (
            <label key={item.id} className="flex items-center gap-3 p-3 border rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                {...register(item.id as any)}
                className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
          <FileText className="w-4 h-4 text-teal-600" />
          دستورالعمل‌های خاص
        </label>
        <textarea
          {...register('instructions')}
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all outline-none resize-none"
          placeholder="مثلاً: بعد از غذا مصرف شود..."
        />
      </div>
    </div>
  );
};
