import { useFormContext } from 'react-hook-form';
import { MedicationFormData, MedicationCriticality } from '../../types';
import { ShieldAlert, AlertTriangle, Pill } from 'lucide-react';

export const Step3_Safety = () => {
  const { register, watch } = useFormContext<MedicationFormData>();
  
  const isHighAlert = watch('highAlert');
  const isPRN = watch('isPRN');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Criticality Level */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-800 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-teal-600" />
            سطح اهمیت (Criticality)
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: MedicationCriticality.Routine, label: 'معمول', color: 'bg-green-50 border-green-200 text-green-700 peer-checked:bg-green-100 peer-checked:border-green-500' },
              { value: MedicationCriticality.Important, label: 'مهم', color: 'bg-orange-50 border-orange-200 text-orange-700 peer-checked:bg-orange-100 peer-checked:border-orange-500' },
              { value: MedicationCriticality.LifeSaving, label: 'حیاتی', color: 'bg-red-50 border-red-200 text-red-700 peer-checked:bg-red-100 peer-checked:border-red-500' },
            ].map((option) => (
              <label key={option.value} className="cursor-pointer relative">
                <input
                  type="radio"
                  value={option.value}
                  {...register('criticality')}
                  className="peer sr-only"
                />
                <div className={`p-3 text-center rounded-xl border-2 transition-all hover:shadow-sm ${option.color}`}>
                  <span className="font-medium text-sm">{option.label}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-6">
          <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${isHighAlert ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-200'}`}>
            <input
              type="checkbox"
              {...register('highAlert')}
              className="mt-1 w-5 h-5 text-red-600 rounded focus:ring-red-500 border-gray-300"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 font-semibold text-gray-900">
                <AlertTriangle className={`w-5 h-5 ${isHighAlert ? 'text-red-600' : 'text-gray-400'}`} />
                High Alert Medication
              </div>
              <p className="text-sm text-gray-500 mt-1">
                این دارو نیاز به دو بار چک کردن (Double Check) قبل از مصرف دارد.
              </p>
            </div>
          </label>

          <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${isPRN ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}`}>
            <input
              type="checkbox"
              {...register('isPRN')}
              className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 font-semibold text-gray-900">
                <Pill className={`w-5 h-5 ${isPRN ? 'text-blue-600' : 'text-gray-400'}`} />
                PRN (در صورت نیاز)
              </div>
              <p className="text-sm text-gray-500 mt-1">
                این دارو برنامه زمانی ثابت ندارد و بر اساس وضعیت بیمار تجویز می‌شود.
              </p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};
