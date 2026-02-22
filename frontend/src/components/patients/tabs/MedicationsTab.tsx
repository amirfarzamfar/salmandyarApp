import { useState } from 'react';
import { KardexTimeline } from '@/features/medications/components/kardex/KardexTimeline';
import { MedicationWizard } from '@/features/medications/components/wizard/MedicationWizard';
import { PatientMedicationList } from '@/features/medications/components/patient/PatientMedicationList';
import { useCreateMedication } from '@/features/medications/hooks/useMedications';
import { Pill, Plus, Calendar, List } from 'lucide-react';
import { MedicationFormData } from '@/features/medications/types';
import { cn } from '@/lib/utils';

interface Props {
  patientId: number;
}

export default function MedicationsTab({ patientId }: Props) {
  const [activeTab, setActiveTab] = useState<'schedule' | 'list'>('schedule');
  const [showWizard, setShowWizard] = useState(false);
  const { mutateAsync: createMedication } = useCreateMedication();

  const handleCreate = async (data: MedicationFormData) => {
    await createMedication(data);
    setShowWizard(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="bg-teal-50 p-2.5 rounded-xl text-teal-600">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">مدیریت دارویی و کاردکس</h2>
            <p className="text-sm text-gray-500 font-medium">مشاهده زمان‌بندی و ثبت مصرف داروها</p>
          </div>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
            <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
                <button 
                onClick={() => setActiveTab('schedule')}
                className={cn(
                    "px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2",
                    activeTab === 'schedule' ? "bg-white text-teal-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                )}
                >
                <Calendar size={16} />
                <span className="hidden sm:inline">زمان‌بندی</span>
                </button>
                <button 
                onClick={() => setActiveTab('list')}
                className={cn(
                    "px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2",
                    activeTab === 'list' ? "bg-white text-teal-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                )}
                >
                <List size={16} />
                <span className="hidden sm:inline">لیست داروها</span>
                </button>
            </div>

            <button
            onClick={() => setShowWizard(true)}
            className="bg-teal-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg shadow-teal-200 hover:bg-teal-700 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 text-sm whitespace-nowrap"
            >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">تجویز جدید</span>
            </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1">
        {activeTab === 'schedule' ? (
            <KardexTimeline patientId={patientId} />
        ) : (
            <div className="p-4">
                <PatientMedicationList patientId={patientId} />
            </div>
        )}
      </div>

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
