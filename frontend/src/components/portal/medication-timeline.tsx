"use client";

import { PortalCard } from "./ui/portal-card";
import { PortalButton } from "./ui/portal-button";
import { CheckCircle2, Clock, Pill, List } from "lucide-react";
import { CardSkeleton } from "./ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { useKardex, useLogDose } from "@/features/medications/hooks/useKardex";
import { DoseStatus } from "@/types/medication";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { useState } from "react";
import { PatientMedicationList } from "@/features/medications/components/patient/PatientMedicationList";
import { X } from "lucide-react";

export function MedicationTimeline() {
  const patientId = 1; // TODO: Get from context
  const today = format(new Date(), 'yyyy-MM-dd');
  const { data: doses, isLoading } = useKardex(patientId, today);
  const { mutate: logDose } = useLogDose();
  const [showList, setShowList] = useState(false);

  const handleTakeMed = (doseId: number) => {
    logDose({
        doseId,
        status: DoseStatus.Taken,
        takenAt: new Date().toISOString()
    }, {
        onSuccess: () => toast.success("مصرف دارو ثبت شد")
    });
  };

  if (isLoading) return <CardSkeleton />;

  const pendingCount = doses?.filter((d: any) => d.status === DoseStatus.Scheduled || d.status === DoseStatus.Due).length || 0;

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-6 px-2">
        <div>
          <h2 className="text-xl font-bold text-gray-800">داروهای امروز</h2>
          <p className="text-sm text-gray-500 mt-1">برنامه مصرف داروی شما</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setShowList(true)}
                className="flex items-center gap-2 text-sm font-bold text-teal-700 bg-white px-4 py-2 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-colors"
            >
                <List className="w-4 h-4" />
                لیست کامل
            </button>
            <span className="text-sm font-medium text-teal-700 bg-teal-50 px-4 py-2 rounded-2xl border border-teal-100 hidden sm:block">
            {pendingCount} وعده باقی‌مانده
            </span>
        </div>
      </div>

      {!doses?.length ? (
        <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            امروز هیچ دارویی ندارید.
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-8 -mx-4 px-4 snap-x mandatory scrollbar-hide">
            {doses.map((dose: any) => (
            <PortalCard 
                key={dose.id} 
                variant={dose.status === DoseStatus.Taken ? 'calm' : 'default'}
                className="min-w-[300px] snap-center transition-all duration-500 border-none relative overflow-visible"
                noPadding
            >
                <div className="p-6 h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl ${dose.status === DoseStatus.Taken ? 'bg-green-100 text-green-600' : 'bg-orange-50 text-orange-500'} transition-colors duration-500`}>
                        <Pill className="w-6 h-6" strokeWidth={1.5} />
                    </div>
                    <div>
                        <h3 className={`font-bold text-lg ${dose.status === DoseStatus.Taken ? 'text-gray-500 line-through decoration-2 decoration-green-400' : 'text-gray-800'} transition-all`}>
                        {dose.medicationName}
                        </h3>
                        <p className="text-sm text-gray-500">{dose.dosage} - {dose.route}</p>
                    </div>
                    </div>
                    {dose.status === DoseStatus.Taken && (
                    <motion.div 
                        initial={{ scale: 0 }} 
                        animate={{ scale: 1 }} 
                        className="bg-green-500 rounded-full p-1"
                    >
                        <CheckCircle2 className="w-5 h-5 text-white" />
                    </motion.div>
                    )}
                </div>
                
                <div className="bg-gray-50/50 rounded-2xl p-4 mb-6 flex-1 border border-gray-100">
                    <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-500 flex items-center gap-1">
                        <Clock className="w-4 h-4" /> زمان:
                    </span>
                    <span className="font-bold text-gray-800 dir-ltr font-mono text-base">
                        {new Date(dose.scheduledTime).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    </div>
                    {dose.instructions && (
                        <div className="text-sm text-gray-600 leading-relaxed mt-2 border-t pt-2">
                        {dose.instructions}
                        </div>
                    )}
                </div>

                <PortalButton 
                    variant={dose.status === DoseStatus.Taken ? 'calm' : 'primary'}
                    onClick={() => handleTakeMed(dose.id)}
                    disabled={dose.status === DoseStatus.Taken}
                    className="w-full shadow-none"
                >
                    {dose.status === DoseStatus.Taken ? 'مصرف شده' : 'تایید مصرف دارو'}
                </PortalButton>
                </div>
            </PortalCard>
            ))}
            
            {/* Spacer for scroll */}
            <div className="w-2 shrink-0"></div>
        </div>
      )}

      {/* Full List Modal */}
      <AnimatePresence>
        {showList && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                onClick={() => setShowList(false)}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="w-full max-w-2xl bg-white rounded-[2rem] p-6 max-h-[85vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-800">لیست کامل داروها</h3>
                        <button onClick={() => setShowList(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                    <PatientMedicationList patientId={patientId} />
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
