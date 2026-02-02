"use client";

import { useState, useEffect } from "react";
import { PortalCard } from "@/components/portal/ui/portal-card";
import { PortalButton } from "@/components/portal/ui/portal-button";
import { Heart, Activity, Thermometer, Droplet, Plus, Save, X, History, TrendingUp, Loader2, BarChart2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { nursePortalService } from "@/services/nurse-portal.service";
import { toast } from "react-hot-toast";
import { VitalsChart } from "./vitals-chart";

interface VitalInputProps {
  label: string;
  icon: any;
  unit: string;
  color: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

const VitalInput = ({ label, icon: Icon, unit, color, value, onChange, placeholder = "--" }: VitalInputProps) => (
  <div className="bg-neutral-warm-50/50 dark:bg-gray-800 rounded-[1.5rem] p-5 border border-gray-100 dark:border-gray-700 focus-within:ring-2 focus-within:ring-medical-200 focus-within:border-medical-300 focus-within:bg-white dark:focus-within:bg-gray-700 transition-all group">
    <div className="flex items-center gap-2 mb-3">
      <div className={`p-1.5 rounded-lg ${color.replace('text-', 'bg-').replace('500', '50')} ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-focus-within:text-medical-500 transition-colors">{label}</span>
    </div>
    <div className="flex items-baseline gap-2">
      <input
        type="number"
        className="w-full bg-transparent text-3xl font-black text-gray-800 dark:text-gray-100 placeholder-gray-200 focus:outline-none"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <span className="text-xs text-gray-400 font-bold">{unit}</span>
    </div>
  </div>
);

export function VitalsManager({ patientId }: { patientId: number }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCharts, setShowCharts] = useState(true);
  const [vitalsHistory, setVitalsHistory] = useState<any[]>([]);
  const [vitals, setVitals] = useState({
    bpSys: "",
    bpDia: "",
    pulse: "",
    temp: "",
    spo2: "",
    resp: ""
  });

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Fetch actual history
        const data = await nursePortalService.getPatientVitals(patientId);
        // Transform for chart (assuming API returns sorted or we sort it)
        const chartData = data.map(v => ({
          date: new Date(v.measuredAt).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' }),
          systolic: v.systolicBloodPressure,
          diastolic: v.diastolicBloodPressure,
          pulse: v.pulseRate,
          spo2: v.oxygenSaturation,
          temp: v.bodyTemperature
        })).slice(0, 7).reverse(); // Last 7 records
        setVitalsHistory(chartData);
        
        // Mock data if empty
        if (chartData.length === 0) {
          setVitalsHistory([
            { date: '۱۰ تیر', systolic: 120, diastolic: 80, pulse: 72, spo2: 98, temp: 36.5 },
            { date: '۱۱ تیر', systolic: 118, diastolic: 78, pulse: 75, spo2: 97, temp: 36.6 },
            { date: '۱۲ تیر', systolic: 122, diastolic: 82, pulse: 70, spo2: 99, temp: 36.4 },
            { date: '۱۳ تیر', systolic: 125, diastolic: 85, pulse: 78, spo2: 96, temp: 37.0 },
            { date: '۱۴ تیر', systolic: 119, diastolic: 79, pulse: 74, spo2: 98, temp: 36.5 },
          ]);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchHistory();
  }, [patientId]);

  const handleSubmit = async () => {
    if (!vitals.bpSys || !vitals.bpDia || !vitals.pulse || !vitals.temp || !vitals.spo2) {
      toast.error("لطفاً تمامی مقادیر را وارد کنید");
      return;
    }

    setIsSubmitting(true);
    try {
      await nursePortalService.addVitalSign(patientId, {
        careRecipientId: patientId,
        systolicBloodPressure: parseInt(vitals.bpSys),
        diastolicBloodPressure: parseInt(vitals.bpDia),
        pulseRate: parseInt(vitals.pulse),
        respiratoryRate: parseInt(vitals.resp) || 0,
        bodyTemperature: parseFloat(vitals.temp),
        oxygenSaturation: parseInt(vitals.spo2),
        measuredAt: new Date().toISOString(),
      });
      
      toast.success("علائم حیاتی با موفقیت ثبت شد");
      setIsAdding(false);
      setVitals({ bpSys: "", bpDia: "", pulse: "", temp: "", spo2: "", resp: "" });
    } catch (error) {
      console.error(error);
      toast.error("خطا در ثبت اطلاعات");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-medical-500" />
          <h2 className="text-xl font-black text-gray-800 dark:text-gray-100">علائم حیاتی</h2>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowCharts(!showCharts)}
            className={`p-2 rounded-xl transition-colors ${showCharts ? 'bg-medical-50 text-medical-600 dark:bg-medical-900/30 dark:text-medical-400' : 'text-gray-400 dark:text-gray-500'}`}
          >
            <BarChart2 className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-medical-50 dark:bg-medical-900/30 text-medical-600 dark:text-medical-400 rounded-xl text-xs font-black hover:bg-medical-100 dark:hover:bg-medical-900/50 transition-colors active:scale-95"
          >
            <Plus className="w-4 h-4" />
            ثبت جدید
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showCharts && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden"
          >
            <VitalsChart data={vitalsHistory} type="bp" />
            <VitalsChart data={vitalsHistory} type="pulse" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <PortalCard className="bg-white dark:bg-gray-800 border-none shadow-soft-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-medical-400 to-medical-600" />
              
              <div className="flex justify-between items-center mb-6 pt-2">
                <div>
                  <h3 className="text-lg font-black text-gray-800 dark:text-gray-100">ثبت علائم جدید</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">مقادیر دقیق دستگاه را وارد کنید</p>
                </div>
                <button onClick={() => setIsAdding(false)} className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="col-span-2 grid grid-cols-2 gap-4">
                  <VitalInput
                    label="فشار سیستولیک"
                    icon={Activity}
                    unit="mmHg"
                    color="text-rose-500"
                    value={vitals.bpSys}
                    onChange={(v) => setVitals({ ...vitals, bpSys: v })}
                    placeholder="120"
                  />
                  <VitalInput
                    label="فشار دیاستولیک"
                    icon={Activity}
                    unit="mmHg"
                    color="text-rose-500"
                    value={vitals.bpDia}
                    onChange={(v) => setVitals({ ...vitals, bpDia: v })}
                    placeholder="80"
                  />
                </div>
                
                <VitalInput
                  label="ضربان قلب"
                  icon={Heart}
                  unit="BPM"
                  color="text-emerald-500"
                  value={vitals.pulse}
                  onChange={(v) => setVitals({ ...vitals, pulse: v })}
                  placeholder="75"
                />
                
                <VitalInput
                  label="اکسیژن خون"
                  icon={Droplet}
                  unit="%"
                  color="text-blue-500"
                  value={vitals.spo2}
                  onChange={(v) => setVitals({ ...vitals, spo2: v })}
                  placeholder="98"
                />

                <VitalInput
                  label="دمای بدن"
                  icon={Thermometer}
                  unit="°C"
                  color="text-orange-500"
                  value={vitals.temp}
                  onChange={(v) => setVitals({ ...vitals, temp: v })}
                  placeholder="36.5"
                />

                <VitalInput
                  label="تعداد تنفس"
                  icon={Activity}
                  unit="/min"
                  color="text-indigo-500"
                  value={vitals.resp}
                  onChange={(v) => setVitals({ ...vitals, resp: v })}
                  placeholder="16"
                />
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-4 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded-2xl font-bold text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  انصراف
                </button>
                <PortalButton 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="flex-[2]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      در حال ثبت...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      ثبت نهایی علائم
                    </>
                  )}
                </PortalButton>
              </div>
            </PortalCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
