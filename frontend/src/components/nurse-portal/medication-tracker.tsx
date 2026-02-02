"use client";

import { useState, useEffect } from "react";
import { Pill, Check, Clock, Plus, AlertCircle, CheckCircle2, XCircle, CalendarDays } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { nursePortalService } from "@/services/nurse-portal.service";
import { MedicationSchedule, Medication } from "@/types/patient";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export function MedicationTracker({ patientId }: { patientId: number }) {
  const [activeTab, setActiveTab] = useState<'schedule' | 'list'>('schedule');
  const [schedules, setSchedules] = useState<MedicationSchedule[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // Mock adding state
  const [newSchedule, setNewSchedule] = useState({
    medicationId: "",
    time: "",
  });

  useEffect(() => {
    fetchData();
  }, [patientId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // In real app, we fetch both. For now, mocking data if service returns empty
      const [scheduleData, medsData] = await Promise.all([
        nursePortalService.getMedicationSchedule(patientId, new Date().toISOString().split('T')[0]),
        nursePortalService.getPatientMedications(patientId)
      ]);
      
      // Mock data if empty for demonstration
      if (!scheduleData || scheduleData.length === 0) {
        setSchedules([
          { id: 1, medicationId: 1, medicationName: "متفورمین", scheduledTime: "08:00", status: 'taken', takenAt: "08:05" },
          { id: 2, medicationId: 2, medicationName: "آتورواستاتین", scheduledTime: "12:00", status: 'pending' },
          { id: 3, medicationId: 3, medicationName: "آسپرین", scheduledTime: "20:00", status: 'pending' },
        ]);
      } else {
        setSchedules(scheduleData);
      }

      if (!medsData || medsData.length === 0) {
        setMedications([
          { id: 1, name: "متفورمین", dosage: "500mg", frequency: "روزانه", route: "خوراکی", startDate: "1402/01/01" },
          { id: 2, name: "آتورواستاتین", dosage: "20mg", frequency: "شب‌ها", route: "خوراکی", startDate: "1402/02/01" },
          { id: 3, name: "آسپرین", dosage: "80mg", frequency: "روزانه", route: "خوراکی", startDate: "1402/01/15" },
        ]);
      } else {
        setMedications(medsData);
      }
    } catch (error) {
      console.error(error);
      toast.error("خطا در دریافت اطلاعات دارویی");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTakeMedication = async (scheduleId: number) => {
    try {
      // Optimistic update
      setSchedules(prev => prev.map(s => 
        s.id === scheduleId ? { ...s, status: 'taken', takenAt: new Date().toLocaleTimeString('fa-IR', {hour: '2-digit', minute:'2-digit'}) } : s
      ));
      
      await nursePortalService.markMedicationAsTaken(scheduleId, {
        takenAt: new Date().toISOString()
      });
      toast.success("مصرف دارو ثبت شد");
    } catch (error) {
      toast.error("خطا در ثبت وضعیت");
      fetchData(); // Revert on error
    }
  };

  const handleAddSchedule = async () => {
    if (!newSchedule.medicationId || !newSchedule.time) {
      toast.error("لطفا دارو و زمان را انتخاب کنید");
      return;
    }

    try {
      await nursePortalService.addMedicationSchedule(patientId, {
        medicationId: parseInt(newSchedule.medicationId),
        scheduledTime: newSchedule.time,
        careRecipientId: patientId
      });
      toast.success("زمان‌بندی جدید اضافه شد");
      setIsAdding(false);
      fetchData();
    } catch (error) {
      toast.error("خطا در افزودن زمان‌بندی");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-2">
          <Pill className="w-5 h-5 text-medical-500" />
          <h2 className="text-xl font-black text-gray-800 dark:text-gray-100">مدیریت دارویی</h2>
        </div>
        <div className="flex bg-neutral-warm-50 dark:bg-gray-800 p-1 rounded-xl border border-gray-100 dark:border-gray-700">
          <button 
            onClick={() => setActiveTab('schedule')}
            className={cn(
              "px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all",
              activeTab === 'schedule' ? "bg-white dark:bg-gray-700 text-medical-600 dark:text-medical-400 shadow-soft-sm" : "text-gray-400 dark:text-gray-500 hover:text-gray-600"
            )}
          >
            برنامه روزانه
          </button>
          <button 
            onClick={() => setActiveTab('list')}
            className={cn(
              "px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all",
              activeTab === 'list' ? "bg-white dark:bg-gray-700 text-medical-600 dark:text-medical-400 shadow-soft-sm" : "text-gray-400 dark:text-gray-500 hover:text-gray-600"
            )}
          >
            لیست داروها
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'schedule' ? (
          <motion.div
            key="schedule"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Timeline View */}
            <div className="relative border-r-2 border-dashed border-gray-200 dark:border-gray-700 mr-4 space-y-8 py-2">
              {schedules.map((schedule, idx) => (
                <div key={schedule.id} className="relative pr-8 group">
                  {/* Timeline Dot */}
                  <div className={cn(
                    "absolute -right-[9px] top-3 w-4 h-4 rounded-full border-2 transition-colors duration-300 z-10",
                    schedule.status === 'taken' ? "bg-emerald-500 border-emerald-200" :
                    schedule.status === 'missed' ? "bg-rose-500 border-rose-200" :
                    "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  )} />
                  
                  <div className={cn(
                    "bg-white dark:bg-gray-800 rounded-[1.5rem] p-4 border transition-all duration-300",
                    schedule.status === 'taken' ? "border-emerald-100 dark:border-emerald-900/30 shadow-soft-sm" :
                    schedule.status === 'missed' ? "border-rose-100 dark:border-rose-900/30" :
                    "border-gray-100 dark:border-gray-700 hover:border-medical-200 dark:hover:border-medical-800"
                  )}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg font-black text-gray-800 dark:text-gray-100">{schedule.medicationName}</span>
                          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 px-2 py-0.5 rounded-lg dir-ltr">{schedule.scheduledTime}</span>
                        </div>
                        <p className="text-xs text-gray-400 font-medium">دوز: {medications.find(m => m.name === schedule.medicationName)?.dosage || 'طبق دستور'}</p>
                      </div>
                      
                      {schedule.status === 'pending' ? (
                        <button 
                          onClick={() => handleTakeMedication(schedule.id)}
                          className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-400 hover:bg-emerald-50 hover:text-emerald-500 dark:hover:bg-emerald-900/20 transition-all flex items-center justify-center group/btn"
                        >
                          <Check className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                        </button>
                      ) : schedule.status === 'taken' ? (
                        <div className="flex flex-col items-end">
                          <div className="text-emerald-500 flex items-center gap-1 text-xs font-black">
                            <CheckCircle2 size={14} />
                            مصرف شد
                          </div>
                          <span className="text-[10px] text-gray-300 font-bold mt-0.5 dir-ltr">{schedule.takenAt}</span>
                        </div>
                      ) : (
                        <div className="text-rose-500 flex items-center gap-1 text-xs font-black">
                          <XCircle size={14} />
                          فراموش شده
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Add Button */}
              <div className="relative pr-8">
                 <div className="absolute -right-[9px] top-3 w-4 h-4 rounded-full bg-medical-100 border-2 border-medical-50 z-10" />
                 <button 
                   onClick={() => setIsAdding(true)}
                   className="w-full py-4 rounded-[1.5rem] border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-400 hover:text-medical-500 hover:border-medical-200 hover:bg-medical-50/50 dark:hover:bg-medical-900/10 transition-all flex items-center justify-center gap-2 text-sm font-bold"
                 >
                   <Plus size={18} />
                   افزودن زمان‌بندی جدید
                 </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid gap-4"
          >
            {medications.map((med) => (
              <div key={med.id} className="bg-white dark:bg-gray-800 p-5 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-soft-sm flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-medical-50 dark:bg-medical-900/20 text-medical-500 flex items-center justify-center">
                    <Pill size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-800 dark:text-gray-100">{med.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400 font-medium mt-1">
                      <span className="bg-gray-50 dark:bg-gray-700 px-2 py-0.5 rounded-lg">{med.dosage}</span>
                      <span>•</span>
                      <span>{med.frequency}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-gray-300 uppercase tracking-wider mb-1">روش مصرف</div>
                  <div className="text-sm font-bold text-gray-600 dark:text-gray-300">{med.route}</div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Schedule Modal Overlay */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="w-full max-w-md bg-white dark:bg-gray-900 rounded-[2.5rem] p-6 shadow-soft-xl border border-white/50 dark:border-gray-800"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-gray-800 dark:text-gray-100">زمان‌بندی جدید</h3>
                <button onClick={() => setIsAdding(false)} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-400">
                  <XCircle size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 mr-2">انتخاب دارو</label>
                  <select 
                    className="w-full p-4 bg-neutral-warm-50 dark:bg-gray-800 rounded-2xl border-none focus:ring-2 focus:ring-medical-200 outline-none text-gray-700 dark:text-gray-200 font-bold text-sm"
                    value={newSchedule.medicationId}
                    onChange={(e) => setNewSchedule({...newSchedule, medicationId: e.target.value})}
                  >
                    <option value="">انتخاب کنید...</option>
                    {medications.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.dosage})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 mr-2">زمان مصرف</label>
                  <input 
                    type="time" 
                    className="w-full p-4 bg-neutral-warm-50 dark:bg-gray-800 rounded-2xl border-none focus:ring-2 focus:ring-medical-200 outline-none text-gray-700 dark:text-gray-200 font-bold text-lg text-center dir-ltr"
                    value={newSchedule.time}
                    onChange={(e) => setNewSchedule({...newSchedule, time: e.target.value})}
                  />
                </div>

                <button 
                  onClick={handleAddSchedule}
                  className="w-full py-4 bg-medical-500 hover:bg-medical-600 text-white rounded-2xl font-black text-sm shadow-glow-medical mt-4 transition-all active:scale-95"
                >
                  ثبت در برنامه
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
