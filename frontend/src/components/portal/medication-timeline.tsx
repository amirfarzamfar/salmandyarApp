"use client";

import { PortalCard } from "./ui/portal-card";
import { PortalButton } from "./ui/portal-button";
import { CheckCircle2, Clock, Pill, ChevronLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { Medication, portalService } from "@/services/portal-mock";
import { CardSkeleton } from "./ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

export function MedicationTimeline() {
  const [meds, setMeds] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    portalService.getMedications().then((data) => {
      setMeds(data);
      setLoading(false);
    });
  }, []);

  const handleTakeMed = (id: string) => {
    setMeds(meds.map(m => m.id === id ? { ...m, status: 'taken' as const } : m));
  };

  if (loading) return <CardSkeleton />;

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-6 px-2">
        <div>
          <h2 className="text-xl font-bold text-gray-800">داروهای امروز</h2>
          <p className="text-sm text-gray-500 mt-1">برنامه مصرف داروی شما مرتب شده است</p>
        </div>
        <span className="text-sm font-medium text-medical-700 bg-medical-50 px-4 py-2 rounded-2xl border border-medical-100">
          {meds.filter(m => m.status === 'pending').length} وعده باقی‌مانده
        </span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-8 -mx-4 px-4 snap-x mandatory scrollbar-hide">
        {meds.map((med) => (
          <PortalCard 
            key={med.id} 
            variant={med.status === 'taken' ? 'calm' : 'default'}
            className="min-w-[300px] snap-center transition-all duration-500 border-none relative overflow-visible"
            noPadding
          >
            <div className="p-6 h-full flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${med.status === 'taken' ? 'bg-calm-green-100 text-calm-green-600' : 'bg-orange-50 text-orange-500'} transition-colors duration-500`}>
                    <Pill className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg ${med.status === 'taken' ? 'text-gray-500 line-through decoration-2 decoration-calm-green-400' : 'text-gray-800'} transition-all`}>
                      {med.name}
                    </h3>
                    <p className="text-sm text-gray-500">{med.dosage}</p>
                  </div>
                </div>
                {med.status === 'taken' && (
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    className="bg-calm-green-500 rounded-full p-1"
                  >
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </motion.div>
                )}
              </div>
              
              <div className="bg-neutral-warm-100/50 rounded-2xl p-4 mb-6 flex-1 border border-neutral-warm-200/50">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Clock className="w-4 h-4" /> زمان:
                  </span>
                  <span className="font-bold text-gray-800 dir-ltr font-mono text-base">
                    {new Date(med.nextDose).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-sm text-gray-600 leading-relaxed">
                  {med.instructions}
                </div>
              </div>

              <PortalButton 
                variant={med.status === 'taken' ? 'calm' : 'primary'}
                onClick={() => handleTakeMed(med.id)}
                disabled={med.status === 'taken'}
                className="w-full shadow-none"
              >
                {med.status === 'taken' ? 'مصرف شده' : 'تایید مصرف دارو'}
              </PortalButton>
            </div>
          </PortalCard>
        ))}
        
        {/* Spacer for scroll */}
        <div className="w-2 shrink-0"></div>
      </div>
    </div>
  );
}
