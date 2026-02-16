import { useState } from 'react';
import { CreateMedicationDto, MedicationCriticality, MedicationFrequencyType } from '@/types/medication';
import { X } from 'lucide-react';

interface Props {
  patientId: number;
  onSuccess: () => void;
  onCancel: () => void;
  onSubmit: (data: CreateMedicationDto) => Promise<void>;
}

export default function MedicationForm({ patientId, onSuccess, onCancel, onSubmit }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateMedicationDto>>({
    careRecipientId: patientId,
    criticality: MedicationCriticality.Routine,
    frequencyType: MedicationFrequencyType.Daily,
    isPRN: false,
    highAlert: false,
    startDate: new Date().toISOString().split('T')[0],
    gracePeriodMinutes: 30,
    notifyPatient: false,
    notifyNurse: false,
    notifySupervisor: false,
    notifyFamily: false,
    escalationEnabled: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData as CreateMedicationDto);
      onSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b bg-teal-50">
        <h3 className="text-lg font-bold text-teal-800">افزودن داروی جدید</h3>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">نام دارو</label>
            <input
              type="text"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              value={formData.name || ''}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">شکل دارویی</label>
            <input
              type="text"
              placeholder="قرص، شربت..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              value={formData.form || ''}
              onChange={e => setFormData({ ...formData, form: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">دوز</label>
            <input
              type="text"
              required
              placeholder="500mg"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              value={formData.dosage || ''}
              onChange={e => setFormData({ ...formData, dosage: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">روش مصرف (Route)</label>
            <input
              type="text"
              required
              placeholder="Oral, IV..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              value={formData.route || ''}
              onChange={e => setFormData({ ...formData, route: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">نوع تکرار</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              value={formData.frequencyType}
              onChange={e => setFormData({ ...formData, frequencyType: Number(e.target.value) })}
            >
              <option value={MedicationFrequencyType.Daily}>روزانه</option>
              <option value={MedicationFrequencyType.Weekly}>هفتگی</option>
              <option value={MedicationFrequencyType.PRN}>PRN (در صورت نیاز)</option>
              <option value={MedicationFrequencyType.Interval}>بازه زمانی (هر X ساعت)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">جزئیات زمان‌بندی</label>
            <input
              type="text"
              placeholder="مثلا: 08:00,20:00 یا 8 (ساعت)"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              value={formData.frequencyDetail || ''}
              onChange={e => setFormData({ ...formData, frequencyDetail: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">تاریخ شروع</label>
            <input
              type="date"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              value={formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : ''}
              onChange={e => setFormData({ ...formData, startDate: new Date(e.target.value).toISOString() })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">تاریخ پایان (اختیاری)</label>
            <input
              type="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              value={formData.endDate ? new Date(formData.endDate).toISOString().split('T')[0] : ''}
              onChange={e => setFormData({ ...formData, endDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
            />
          </div>
        </div>

        <div>
           <label className="block text-sm font-medium text-gray-700">دستورالعمل</label>
           <textarea
             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
             rows={2}
             value={formData.instructions || ''}
             onChange={e => setFormData({ ...formData, instructions: e.target.value })}
           />
        </div>

        <div className="border-t pt-4 mt-4">
            <h4 className="text-md font-semibold text-gray-800 mb-3">تنظیمات یادآوری و هشدار</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">مهلت مصرف (دقیقه)</label>
                    <input
                        type="number"
                        min="0"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                        value={formData.gracePeriodMinutes || 30}
                        onChange={e => setFormData({ ...formData, gracePeriodMinutes: Number(e.target.value) })}
                    />
                    <p className="text-xs text-gray-500 mt-1">مدت زمان مجاز پس از ساعت مقرر برای مصرف دارو</p>
                </div>
                
                <div className="flex flex-col gap-2 pt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={formData.escalationEnabled}
                            onChange={e => setFormData({...formData, escalationEnabled: e.target.checked})}
                            className="rounded text-teal-600 focus:ring-teal-500"
                        />
                        <span className="text-sm font-medium text-gray-700">فعال‌سازی سیستم Escalation (ارتقاء هشدار)</span>
                    </label>
                </div>
            </div>

            <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">ارسال اعلان به:</p>
                <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={formData.notifyPatient}
                            onChange={e => setFormData({...formData, notifyPatient: e.target.checked})}
                            className="rounded text-teal-600 focus:ring-teal-500"
                        />
                        <span className="text-sm text-gray-600">بیمار</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={formData.notifyNurse}
                            onChange={e => setFormData({...formData, notifyNurse: e.target.checked})}
                            className="rounded text-teal-600 focus:ring-teal-500"
                        />
                        <span className="text-sm text-gray-600">پرستار</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={formData.notifySupervisor}
                            onChange={e => setFormData({...formData, notifySupervisor: e.target.checked})}
                            className="rounded text-teal-600 focus:ring-teal-500"
                        />
                        <span className="text-sm text-gray-600">سوپروایزر</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={formData.notifyFamily}
                            onChange={e => setFormData({...formData, notifyFamily: e.target.checked})}
                            className="rounded text-teal-600 focus:ring-teal-500"
                        />
                        <span className="text-sm text-gray-600">خانواده</span>
                    </label>
                </div>
            </div>
        </div>

        <div className="flex gap-6 items-center pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.highAlert}
                  onChange={e => setFormData({...formData, highAlert: e.target.checked})}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm font-medium text-red-600">High Alert (هشدار بالا)</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.isPRN}
                  onChange={e => setFormData({...formData, isPRN: e.target.checked})}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm font-medium text-gray-700">PRN (فقط در صورت نیاز)</span>
            </label>
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            انصراف
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? 'در حال ثبت...' : 'ثبت دارو'}
          </button>
        </div>
      </form>
    </div>
  );
}
