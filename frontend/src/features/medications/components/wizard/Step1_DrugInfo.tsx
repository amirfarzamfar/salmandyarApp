import { useFormContext } from 'react-hook-form';
import { MedicationFormData } from '../../types';

export const Step1_DrugInfo = () => {
  const { register, formState: { errors } } = useFormContext<MedicationFormData>();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            نام دارو <span className="text-red-500">*</span>
          </label>
          <input
            {...register('name')}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all outline-none"
            placeholder="مثلاً: متفورمین"
          />
          {errors.name && (
            <p className="text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            شکل دارویی <span className="text-red-500">*</span>
          </label>
          <input
            {...register('form')}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all outline-none"
            placeholder="مثلاً: قرص، شربت، آمپول..."
            list="medication-forms"
          />
          <datalist id="medication-forms">
            <option value="قرص" />
            <option value="کپسول" />
            <option value="شربت" />
            <option value="آمپول" />
            <option value="پماد" />
            <option value="قطره" />
            <option value="اسپری" />
          </datalist>
          {errors.form && (
            <p className="text-xs text-red-500">{errors.form.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            دوز مصرفی <span className="text-red-500">*</span>
          </label>
          <input
            {...register('dosage')}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all outline-none"
            placeholder="مثلاً: 500mg"
          />
          {errors.dosage && (
            <p className="text-xs text-red-500">{errors.dosage.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            روش مصرف (Route) <span className="text-red-500">*</span>
          </label>
          <input
            {...register('route')}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all outline-none"
            placeholder="مثلاً: خوراکی (PO)"
            list="medication-routes"
          />
          <datalist id="medication-routes">
            <option value="Oral (PO)" label="خوراکی" />
            <option value="IV" label="وریدی" />
            <option value="IM" label="عضلانی" />
            <option value="SC" label="زیرجلدی" />
            <option value="Topical" label="موضعی" />
            <option value="Inhalation" label="استنشاقی" />
          </datalist>
          {errors.route && (
            <p className="text-xs text-red-500">{errors.route.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-gray-800">موجودی و هشدار اتمام دارو</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">تعداد کل دارو (موجود)</label>
            <input
              type="number"
              {...register('totalQuantity', {
                valueAsNumber: true,
                setValueAs: (v) => {
                  if (v === '' || v === null || v === undefined) return 0;
                  const n = typeof v === 'number' ? v : Number(v);
                  return Number.isFinite(n) ? n : 0;
                }
              })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all outline-none"
              placeholder="مثلا: 30"
              min="0"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">آستانه هشدار (تعداد)</label>
            <input
              type="number"
              {...register('alertLimit', {
                valueAsNumber: true,
                setValueAs: (v) => {
                  if (v === '' || v === null || v === undefined) return 0;
                  const n = typeof v === 'number' ? v : Number(v);
                  return Number.isFinite(n) ? n : 0;
                }
              })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all outline-none"
              placeholder="مثلا: 5"
              min="0"
            />
            <p className="text-xs text-gray-500">وقتی موجودی به این عدد برسد هشدار ارسال می‌شود (گیرندگان در مرحله تنظیمات نهایی).</p>
          </div>
        </div>
      </div>
    </div>
  );
};
