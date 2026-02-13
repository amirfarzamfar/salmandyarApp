import { useEffect, useState, useCallback } from 'react';
import { medicationService } from '@/services/medication.service';
import { Medication, CreateMedicationDto, MedicationCriticality } from '@/types/medication';
import MedicationForm from '../MedicationForm';
import { Pill, Plus, AlertTriangle, Clock } from 'lucide-react';

interface Props {
  patientId: number;
}

export default function MedicationsTab({ patientId }: Props) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchMedications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await medicationService.getPatientMedications(patientId);
      setMedications(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  const handleCreate = async (data: CreateMedicationDto) => {
    await medicationService.addMedication(data);
    setShowForm(false);
    fetchMedications();
  };

  const getCriticalityBadge = (level: MedicationCriticality) => {
    switch (level) {
        case MedicationCriticality.Routine: return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">معمولی</span>;
        case MedicationCriticality.Important: return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">مهم</span>;
        case MedicationCriticality.HighAlert: return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded flex items-center gap-1"><AlertTriangle size={12}/> هشدار بالا</span>;
        case MedicationCriticality.LifeSaving: return <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded font-bold">حیاتی</span>;
        default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Pill className="text-teal-600" />
            کاردکس دارویی
        </h2>
        <button
            onClick={() => setShowForm(true)}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-teal-700 transition"
        >
            <Plus size={20} />
            افزودن دارو
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
           <MedicationForm 
             patientId={patientId}
             onSuccess={() => { setShowForm(false); fetchMedications(); }}
             onCancel={() => setShowForm(false)}
             onSubmit={handleCreate}
           />
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-500">در حال بارگذاری...</div>
      ) : medications.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-10 text-center">
            <Pill className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">هیچ دارویی برای این بیمار ثبت نشده است.</p>
            <button onClick={() => setShowForm(true)} className="text-teal-600 font-bold mt-2 hover:underline">ثبت اولین دارو</button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">نام دارو</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">دوز / فرم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">زمان‌بندی</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">اهمیت</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">دستورالعمل</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">وضعیت</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {medications.map((med) => (
                <tr key={med.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                        <div>
                            <div className="text-sm font-bold text-gray-900">{med.name}</div>
                            {med.highAlert && <span className="text-xs text-red-600 font-bold">High Alert</span>}
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{med.dosage}</div>
                    <div className="text-xs text-gray-500">{med.form} - {med.route}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center gap-1">
                        <Clock size={14} className="text-gray-400" />
                        {med.frequencyDetail || 'طبق دستور'}
                    </div>
                    <div className="text-xs text-gray-500">
                        {med.isPRN ? 'PRN (در صورت نیاز)' : 'زمان‌بندی شده'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getCriticalityBadge(med.criticality)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 truncate max-w-xs" title={med.instructions}>
                        {med.instructions || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      فعال
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
