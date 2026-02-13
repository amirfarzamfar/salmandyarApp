"use client";

import { VitalSign, CareLevel } from "@/types/patient";
import { AlertCircle, Clock, CheckCircle2, AlertTriangle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Props {
  vitals: VitalSign[];
  careLevel: CareLevel;
}

export function NurseVitalSignsList({ vitals, careLevel }: Props) {
  
  const getComplianceStatus = (current: VitalSign, prev: VitalSign | undefined) => {
    if (!prev) return { label: 'اولین ثبت', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', icon: CheckCircle2 };

    const diffMs = new Date(current.measuredAt).getTime() - new Date(prev.measuredAt).getTime();
    const intervalMs = careLevel * 60 * 60 * 1000;
    const tolerance = 30 * 60 * 1000; // 30 mins tolerance
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const timeStr = `${diffHours} ساعت و ${diffMins} دقیقه`;

    if (Math.abs(diffMs - intervalMs) <= tolerance) {
      return { label: 'به موقع', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', timeStr, icon: CheckCircle2 };
    } else if (diffMs > intervalMs + tolerance) {
      const delay = Math.floor((diffMs - intervalMs) / (1000 * 60));
      return { label: `تاخیر (${delay} دقیقه)`, color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400', timeStr, icon: AlertCircle };
    } else {
      return { label: 'زودتر از موعد', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', timeStr, icon: AlertTriangle };
    }
  };

  return (
    <div className="space-y-4">
      {vitals.map((vital, index) => {
        const prev = vitals[index + 1];
        const compliance = getComplianceStatus(vital, prev);
        const ComplianceIcon = compliance.icon;

        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            key={vital.id}
            className="group relative bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 transition-all duration-200"
          >
            {/* Status Line */}
            <div className={cn(
              "absolute right-0 top-4 bottom-4 w-1 rounded-l-full transition-colors",
              compliance.color.includes('emerald') ? 'bg-emerald-500' : 
              compliance.color.includes('rose') ? 'bg-rose-500' : 
              compliance.color.includes('amber') ? 'bg-amber-500' : 'bg-gray-300'
            )} />

            <div className="flex justify-between items-start mb-4 pl-2 pr-3">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-black text-gray-800 dark:text-gray-100">
                    {new Date(vital.measuredAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                    {new Date(vital.measuredAt).toLocaleDateString('fa-IR')}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                   <div className={cn("px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1", compliance.color)}>
                     <ComplianceIcon size={12} />
                     {compliance.label}
                   </div>
                   {vital.isLateEntry && (
                     <div className="px-2 py-0.5 rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-[10px] font-bold flex items-center gap-1">
                       <AlertTriangle size={12} />
                       ثبت با تاخیر
                     </div>
                   )}
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-lg">
                <User size={14} />
                <span className="text-[10px] font-bold">{vital.recorderName}</span>
              </div>
            </div>

            {/* Vitals Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pr-3">
              <VitalItem label="فشار خون" value={`${vital.systolicBloodPressure}/${vital.diastolicBloodPressure}`} unit="mmHg" />
              <VitalItem label="MAP" value={vital.meanArterialPressure?.toString() || '-'} unit="mmHg" />
              <VitalItem label="ضربان قلب" value={vital.pulseRate.toString()} unit="bpm" />
              <VitalItem 
                label="دما" 
                value={vital.bodyTemperature.toString()} 
                unit="°C" 
                alert={vital.bodyTemperature > 37.5}
              />
              <VitalItem 
                label="اکسیژن" 
                value={vital.oxygenSaturation.toString()} 
                unit="%" 
                alert={vital.oxygenSaturation < 95}
              />
              <VitalItem label="هوشیاری" value={vital.glasgowComaScale?.toString() || '-'} unit="GCS" />
            </div>

            {vital.delayReason && (
              <div className="mt-3 mr-3 p-2 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-800/30 text-xs text-orange-700 dark:text-orange-400 flex items-start gap-2">
                 <AlertCircle size={14} className="mt-0.5 shrink-0" />
                 <span>دلیل تاخیر: {vital.delayReason}</span>
              </div>
            )}
            
            {/* Note */}
            {/* If there was a note field in the type, we would display it here */}
          </motion.div>
        );
      })}
    </div>
  );
}

function VitalItem({ label, value, unit, alert }: { label: string, value: string, unit: string, alert?: boolean }) {
  return (
    <div className={cn(
      "p-2 rounded-xl border flex flex-col items-center justify-center text-center transition-colors",
      alert 
        ? "bg-rose-50 border-rose-100 dark:bg-rose-900/20 dark:border-rose-800 text-rose-600 dark:text-rose-400" 
        : "bg-gray-50 border-gray-100 dark:bg-gray-700/30 dark:border-gray-700 text-gray-600 dark:text-gray-300"
    )}>
      <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mb-0.5">{label}</span>
      <div className="flex items-baseline gap-0.5">
        <span className="text-sm font-black tracking-tight">{value}</span>
        <span className="text-[9px] opacity-70">{unit}</span>
      </div>
    </div>
  );
}
