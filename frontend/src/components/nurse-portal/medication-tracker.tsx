"use client";

import { useState } from "react";
import { Pill, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { KardexTimeline } from "@/features/medications/components/kardex/KardexTimeline";
import { PatientMedicationList } from "@/features/medications/components/patient/PatientMedicationList";
import { MedicationWizard } from "@/features/medications/components/wizard/MedicationWizard";
import { useCreateMedication } from "@/features/medications/hooks/useMedications";
import { MedicationFormData } from "@/features/medications/types";

export function MedicationTracker({ patientId }: { patientId: number }) {
  const [activeTab, setActiveTab] = useState<'schedule' | 'list'>('schedule');
  const [showWizard, setShowWizard] = useState(false);
  const { mutateAsync: createMedication } = useCreateMedication();

  const handleCreate = async (data: MedicationFormData) => {
    await createMedication(data);
    setShowWizard(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-2">
        <div className="flex items-center gap-2">
          <div className="bg-teal-50 p-2 rounded-xl text-teal-600">
             <Pill className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-gray-800 dark:text-gray-100">مدیریت دارویی</h2>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setShowWizard(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-teal-200 hover:bg-teal-700 transition-all active:scale-95"
          >
            <Plus size={18} />
            <span>افزودن دارو</span>
          </button>
          
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
            <button 
              onClick={() => setActiveTab('schedule')}
              className={cn(
                "px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all",
                activeTab === 'schedule' ? "bg-white dark:bg-gray-700 text-teal-600 dark:text-teal-400 shadow-sm" : "text-gray-400 dark:text-gray-500 hover:text-gray-600"
              )}
            >
              کاردکس (زمان‌بندی)
            </button>
            <button 
              onClick={() => setActiveTab('list')}
              className={cn(
                "px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all",
                activeTab === 'list' ? "bg-white dark:bg-gray-700 text-teal-600 dark:text-teal-400 shadow-sm" : "text-gray-400 dark:text-gray-500 hover:text-gray-600"
              )}
            >
              لیست کلی
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-50/50 rounded-3xl p-1 border border-dashed border-gray-200">
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
