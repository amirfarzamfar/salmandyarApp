"use client";

import { useState, useEffect } from "react";
import { Pill, Check, Plus, CheckCircle2, XCircle, X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { medicationService } from "@/services/medication.service";
import { Medication, MedicationDose, DoseStatus, RecordDoseDto, SideEffectSeverity, CreateMedicationDto } from "@/types/medication";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import MedicationForm from "@/components/patients/MedicationForm";

export function MedicationTracker({ patientId }: { patientId: number }) {
  const [activeTab, setActiveTab] = useState<'schedule' | 'list'>('schedule');
  const [schedules, setSchedules] = useState<MedicationDose[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Modal states
  const [selectedDose, setSelectedDose] = useState<MedicationDose | null>(null);
  const [actionType, setActionType] = useState<'take' | 'miss' | null>(null);
  const [notes, setNotes] = useState("");
  const [missedReason, setMissedReason] = useState("");
  
  useEffect(() => {
    fetchData();
  }, [patientId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [scheduleData, medsData] = await Promise.all([
        medicationService.getDailySchedule(patientId, new Date()),
        medicationService.getPatientMedications(patientId)
      ]);
      
      setSchedules(scheduleData);
      setMedications(medsData);
    } catch (error) {
      console.error(error);
      toast.error("خطا در دریافت اطلاعات دارویی");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMedication = async (data: CreateMedicationDto) => {
      await medicationService.addMedication(data);
  };

  const handleActionClick = (dose: MedicationDose, type: 'take' | 'miss') => {
      setSelectedDose(dose);
      setActionType(type);
      setNotes("");
      setMissedReason("");
  };

  const submitAction = async () => {
      if (!selectedDose || !actionType) return;

      try {
          const dto: RecordDoseDto = {
              takenAt: new Date().toISOString(),
              status: actionType === 'take' ? DoseStatus.Taken : DoseStatus.Missed,
              notes: notes,
              missedReason: actionType === 'miss' ? missedReason : undefined,
              sideEffectSeverity: SideEffectSeverity.None // Simplified for MVP
          };

          await medicationService.logDose(selectedDose.id, dto);
          
          toast.success(actionType === 'take' ? "مصرف دارو ثبت شد" : "عدم مصرف ثبت شد");
          setSelectedDose(null);
          setActionType(null);
          fetchData();
      } catch (error) {
          toast.error("خطا در ثبت وضعیت");
      }
  };

  const formatTime = (dateStr: string) => {
      return new Date(dateStr).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-2">
          <Pill className="w-5 h-5 text-medical-500" />
          <h2 className="text-xl font-black text-gray-800 dark:text-gray-100">مدیریت دارویی</h2>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-1.5 bg-medical-500 text-white rounded-xl text-xs font-bold shadow-glow-medical hover:bg-medical-600 transition-all active:scale-95"
          >
            <Plus size={16} />
            <span>افزودن دارو</span>
          </button>
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
            {schedules.length === 0 ? (
                <div className="text-center py-10 text-gray-400">برنامه‌ای برای امروز یافت نشد.</div>
            ) : (
            <div className="relative border-r-2 border-dashed border-gray-200 dark:border-gray-700 mr-4 space-y-8 py-2">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="relative pr-8 group">
                  {/* Timeline Dot */}
                  <div className={cn(
                    "absolute -right-[9px] top-3 w-4 h-4 rounded-full border-2 transition-colors duration-300 z-10",
                    schedule.status === DoseStatus.Taken ? "bg-emerald-500 border-emerald-200" :
                    schedule.status === DoseStatus.Missed ? "bg-rose-500 border-rose-200" :
                    "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  )} />
                  
                  <div className={cn(
                    "bg-white dark:bg-gray-800 rounded-[1.5rem] p-4 border transition-all duration-300",
                    schedule.status === DoseStatus.Taken ? "border-emerald-100 dark:border-emerald-900/30 shadow-soft-sm" :
                    schedule.status === DoseStatus.Missed ? "border-rose-100 dark:border-rose-900/30" :
                    "border-gray-100 dark:border-gray-700 hover:border-medical-200 dark:hover:border-medical-800"
                  )}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg font-black text-gray-800 dark:text-gray-100">{schedule.medicationName}</span>
                          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 px-2 py-0.5 rounded-lg dir-ltr">{formatTime(schedule.scheduledTime)}</span>
                        </div>
                        <p className="text-xs text-gray-400 font-medium">دوز: {schedule.dosage} - {schedule.route}</p>
                        {schedule.instructions && <p className="text-xs text-blue-500 mt-1">{schedule.instructions}</p>}
                      </div>
                      
                      {schedule.status === DoseStatus.Scheduled || schedule.status === DoseStatus.Late || schedule.status === DoseStatus.Due ? (
                        <div className="flex gap-2">
                            <button 
                            onClick={() => handleActionClick(schedule, 'miss')}
                            className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-900/20 transition-all flex items-center justify-center"
                            title="عدم مصرف"
                            >
                            <XCircle className="w-5 h-5" />
                            </button>
                            <button 
                            onClick={() => handleActionClick(schedule, 'take')}
                            className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-400 hover:bg-emerald-50 hover:text-emerald-500 dark:hover:bg-emerald-900/20 transition-all flex items-center justify-center"
                            title="مصرف شد"
                            >
                            <Check className="w-5 h-5" />
                            </button>
                        </div>
                      ) : schedule.status === DoseStatus.Taken ? (
                        <div className="flex flex-col items-end">
                          <div className="text-emerald-500 flex items-center gap-1 text-xs font-black">
                            <CheckCircle2 size={14} />
                            مصرف شد
                          </div>
                          <span className="text-[10px] text-gray-300 font-bold mt-0.5 dir-ltr">{schedule.takenAt ? formatTime(schedule.takenAt) : '-'}</span>
                          <span className="text-[10px] text-gray-400">{schedule.takenByName}</span>
                        </div>
                      ) : (
                        <div className="text-rose-500 flex flex-col items-end gap-1">
                            <div className="flex items-center gap-1 text-xs font-black">
                                <XCircle size={14} />
                                فراموش شده
                            </div>
                            {schedule.missedReason && <span className="text-[10px] text-rose-400">{schedule.missedReason}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}
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
                    <h3 className="text-lg font-black text-gray-800 dark:text-gray-100 flex items-center gap-2">
                        {med.name}
                        {med.highAlert && <AlertTriangle size={14} className="text-red-500" />}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400 font-medium mt-1">
                      <span className="bg-gray-50 dark:bg-gray-700 px-2 py-0.5 rounded-lg">{med.dosage}</span>
                      <span>•</span>
                      <span>{med.frequencyDetail || 'طبق دستور'}</span>
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

      {/* Action Modal */}
      <AnimatePresence>
        {selectedDose && (
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
                <h3 className="text-lg font-black text-gray-800 dark:text-gray-100">
                    {actionType === 'take' ? 'ثبت مصرف دارو' : 'ثبت عدم مصرف'}
                </h3>
                <button onClick={() => setSelectedDose(null)} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-400">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl">
                    <p className="font-bold text-gray-700 dark:text-gray-200">{selectedDose.medicationName}</p>
                    <p className="text-sm text-gray-500">{selectedDose.dosage} - {formatTime(selectedDose.scheduledTime)}</p>
                </div>

                {actionType === 'miss' && (
                    <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2 mr-2">دلیل عدم مصرف *</label>
                        <select
                            className="w-full p-4 bg-neutral-warm-50 dark:bg-gray-800 rounded-2xl border-none focus:ring-2 focus:ring-medical-200 outline-none text-gray-700 dark:text-gray-200 text-sm"
                            value={missedReason}
                            onChange={(e) => setMissedReason(e.target.value)}
                        >
                            <option value="">انتخاب کنید...</option>
                            <option value="PatientRefused">بیمار امتناع کرد</option>
                            <option value="NPO">بیمار NPO است</option>
                            <option value="Vomiting">استفراغ</option>
                            <option value="NotAvailable">دارو موجود نیست</option>
                            <option value="Other">سایر</option>
                        </select>
                    </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 mr-2">توضیحات تکمیلی</label>
                  <textarea 
                    className="w-full p-4 bg-neutral-warm-50 dark:bg-gray-800 rounded-2xl border-none focus:ring-2 focus:ring-medical-200 outline-none text-gray-700 dark:text-gray-200 text-sm min-h-[100px]"
                    placeholder="توضیحات پرستاری..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <button 
                  onClick={submitAction}
                  disabled={actionType === 'miss' && !missedReason}
                  className={cn(
                      "w-full py-4 text-white rounded-2xl font-black text-sm shadow-glow-medical mt-4 transition-all active:scale-95 disabled:opacity-50",
                      actionType === 'take' ? "bg-emerald-500 hover:bg-emerald-600" : "bg-rose-500 hover:bg-rose-600"
                  )}
                >
                  {actionType === 'take' ? 'تایید مصرف' : 'تایید عدم مصرف'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Add Medication Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl"
            >
                <MedicationForm 
                    patientId={patientId}
                    onSuccess={() => {
                        setShowAddForm(false);
                        fetchData();
                        toast.success("داروی جدید با موفقیت ثبت شد");
                    }}
                    onCancel={() => setShowAddForm(false)}
                    onSubmit={handleAddMedication}
                />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
