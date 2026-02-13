"use client";

import { useState, useEffect, useCallback } from "react";
import { PortalCard } from "@/components/portal/ui/portal-card";
import { PortalButton } from "@/components/portal/ui/portal-button";
import { Heart, Activity, Thermometer, Droplet, Plus, BarChart2, Clock, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { nursePortalService } from "@/services/nurse-portal.service";
import { toast } from "react-hot-toast";
import { VitalsChart } from "./vitals-chart";
import { NurseVitalSignsForm } from "./vital-signs-form";
import { NurseVitalSignsList } from "./vital-signs-list";
import { VitalSign, CareLevel } from "@/types/patient";

interface Props {
  patientId: number;
  careLevel?: CareLevel;
}

export function VitalsManager({ patientId, careLevel = CareLevel.Level2 }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [showCharts, setShowCharts] = useState(true);
  const [vitals, setVitals] = useState<VitalSign[]>([]);
  const [nextDue, setNextDue] = useState<Date | null>(null);
  const [now, setNow] = useState(new Date());

  // Live timer
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchVitals = useCallback(async () => {
    try {
      const data = await nursePortalService.getPatientVitals(patientId);
      // Ensure sorted by date descending (newest first)
      const sorted = data.sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime());
      setVitals(sorted);
    } catch (error) {
      console.error(error);
      toast.error("خطا در دریافت علائم حیاتی");
    }
  }, [patientId]);

  useEffect(() => {
    fetchVitals();
  }, [fetchVitals]);

  // Calculate Next Due
  useEffect(() => {
    if (vitals.length === 0) {
      setNextDue(null);
      return;
    }

    // Sort ascending for calculation
    const sortedVitals = [...vitals].sort((a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime());
    const anchorTime = new Date(sortedVitals[0].measuredAt);
    const intervalMs = careLevel * 60 * 60 * 1000;
    
    // Find next slot relative to anchor that is in the future relative to the last measurement
    const lastMeasured = new Date(sortedVitals[sortedVitals.length - 1].measuredAt).getTime();
    
    // Logic: Next slot = Anchor + k * Interval > LastMeasured
    // We want the immediate next scheduled time after the last record
    const timeSinceAnchor = lastMeasured - anchorTime.getTime();
    const slotsPassed = Math.floor(timeSinceAnchor / intervalMs);
    const nextSlot = anchorTime.getTime() + ((slotsPassed + 1) * intervalMs);
    
    setNextDue(new Date(nextSlot));

  }, [vitals, careLevel]);

  // Chart Data Preparation
  const chartData = [...vitals].slice(0, 10).reverse().map(v => ({
    date: new Date(v.measuredAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
    systolic: v.systolicBloodPressure,
    diastolic: v.diastolicBloodPressure,
    pulse: v.pulseRate,
    value: v.pulseRate // fallback for simple charts
  }));

  const getStatusColor = () => {
    if (!nextDue) return 'text-gray-500';
    const diff = nextDue.getTime() - now.getTime();
    if (diff < 0) return 'text-rose-500'; // Late
    if (diff < 3600000) return 'text-amber-500'; // Warning
    return 'text-emerald-500'; // OK
  };

  const getStatusText = () => {
    if (!nextDue) return 'ثبتی انجام نشده';
    const diff = nextDue.getTime() - now.getTime();
    const hours = Math.floor(Math.abs(diff) / (1000 * 60 * 60));
    const mins = Math.floor((Math.abs(diff) % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diff < 0) return `تاخیر: ${hours} ساعت و ${mins} دقیقه`;
    if (diff < 3600000) return `زمان باقی‌مانده: ${mins} دقیقه`;
    return `نوبت بعدی: ${hours} ساعت دیگر`;
  };

  return (
    <div className="space-y-6">
      {/* Header / Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
        <div>
          <h2 className="text-xl font-black text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Activity className="w-6 h-6 text-medical-500" />
            علائم حیاتی
          </h2>
          <div className={`text-xs font-bold mt-1 flex items-center gap-1 ${getStatusColor()}`}>
            <Clock size={12} />
            {getStatusText()}
          </div>
        </div>
        
        <div className="flex w-full md:w-auto gap-2">
          <button 
            onClick={() => setShowCharts(!showCharts)}
            className={`p-3 rounded-2xl transition-colors flex-1 md:flex-none flex justify-center ${showCharts ? 'bg-medical-50 text-medical-600 dark:bg-medical-900/30 dark:text-medical-400' : 'bg-gray-50 text-gray-400 dark:bg-gray-800 dark:text-gray-500'}`}
          >
            <BarChart2 className="w-5 h-5" />
          </button>
          <PortalButton 
            onClick={() => setIsAdding(true)}
            className="flex-1 md:flex-none"
          >
            <Plus className="w-5 h-5 ml-2" />
            ثبت جدید
          </PortalButton>
        </div>
      </div>

      {/* Charts Section */}
      <AnimatePresence>
        {showCharts && chartData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden"
          >
            <VitalsChart data={chartData} type="bp" />
            <VitalsChart data={chartData} type="pulse" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* History List */}
      <NurseVitalSignsList vitals={vitals} careLevel={careLevel} />

      {/* Add Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-lg my-auto"
            >
                <NurseVitalSignsForm 
                    patientId={patientId}
                    expectedTime={nextDue || new Date()}
                    onSuccess={() => { setIsAdding(false); fetchVitals(); }}
                    onCancel={() => setIsAdding(false)}
                />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
