import { useState } from 'react';
import { KardexTimeline } from '@/features/medications/components/kardex/KardexTimeline';
import { MedicationWizard } from '@/features/medications/components/wizard/MedicationWizard';
import { useCreateMedication } from '@/features/medications/hooks/useMedications';
import { Pill, Plus } from 'lucide-react';
import { MedicationFormData } from '@/features/medications/types';

interface Props {
  patientId: number;
}

export default function MedicationsTab({ patientId }: Props) {
  const [showWizard, setShowWizard] = useState(false);
  const { mutateAsync: createMedication } = useCreateMedication();

  const handleCreate = async (data: MedicationFormData) => {
    await createMedication(data);
    setShowWizard(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Actions */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="bg-teal-50 p-2.5 rounded-xl text-teal-600">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">مدیریت دارویی و کاردکس</h2>
            <p className="text-sm text-gray-500 font-medium">مشاهده زمان‌بندی و ثبت مصرف داروها</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowWizard(true)}
          className="bg-teal-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-teal-200 hover:bg-teal-700 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          تجویز داروی جدید
        </button>
      </div>

      {/* Main Content: Kardex Timeline */}
      <KardexTimeline patientId={patientId} />

      {/* Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
           <MedicationWizard 
             patientId={patientId}
             onSuccess={() => setShowWizard(false)}
             onCancel={() => setShowWizard(false)}
             onSubmit={handleCreate}
           />
        </div>
      )}
    </div>
  );
}
