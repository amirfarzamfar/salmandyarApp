"use client";

import { useState, useEffect } from "react";
import { PortalCard } from "@/components/portal/ui/portal-card";
import { CheckCircle2, Clock, CalendarDays, ChevronLeft, Plus, Timer, MoreVertical, X, Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { nursePortalService } from "@/services/nurse-portal.service";
import { CareService } from "@/types/patient";
import { toast } from "react-hot-toast";

export function ServiceTracker({ patientId }: { patientId: number }) {
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming'>('today');
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [services, setServices] = useState<CareService[]>([]);
  const [newService, setNewService] = useState({
    title: "",
    time: "",
    note: ""
  });

  useEffect(() => {
    fetchServices();
  }, [patientId]);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const data = await nursePortalService.getPatientServices(patientId);
      setServices(data);
    } catch (error) {
      console.error(error);
      toast.error("خطا در دریافت لیست خدمات");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!newService.title || !newService.time) {
      toast.error("لطفاً عنوان و زمان خدمت را وارد کنید");
      return;
    }

    setIsSubmitting(true);
    try {
      await nursePortalService.addService(patientId, {
        careRecipientId: patientId,
        serviceDefinitionId: 1, // Mock ID
        performedAt: new Date().toISOString(),
        description: newService.title,
        notes: newService.note,
        startTime: newService.time
      });
      toast.success("خدمت جدید با موفقیت ثبت شد");
      setIsAdding(false);
      setNewService({ title: "", time: "", note: "" });
      fetchServices();
    } catch (error) {
      console.error(error);
      toast.error("خطا در ثبت خدمت");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-medical-500" />
          <h2 className="text-xl font-black text-gray-800 dark:text-gray-100">برنامه مراقبتی</h2>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsAdding(true)}
            className="w-8 h-8 rounded-lg bg-medical-50 dark:bg-medical-900/30 text-medical-600 dark:text-medical-400 flex items-center justify-center hover:bg-medical-100 dark:hover:bg-medical-900/50 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
          <div className="flex bg-neutral-warm-50 dark:bg-gray-800 p-1 rounded-xl border border-gray-100 dark:border-gray-700">
            <button 
              onClick={() => setActiveTab('today')}
              className={cn(
                "px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all",
                activeTab === 'today' ? "bg-white dark:bg-gray-700 text-medical-600 dark:text-medical-400 shadow-soft-sm" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              )}
            >
              امروز
            </button>
            <button 
              onClick={() => setActiveTab('upcoming')}
              className={cn(
                "px-4 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all",
                activeTab === 'upcoming' ? "bg-white dark:bg-gray-700 text-medical-600 dark:text-medical-400 shadow-soft-sm" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              )}
            >
              آینده
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-4"
        >
          {services.map((service) => (
            <PortalCard key={service.id} className="flex justify-between items-center bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-soft-sm">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center",
                  service.status === 'Completed' ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500" : "bg-blue-50 dark:bg-blue-900/20 text-blue-500"
                )}>
                  {service.status === 'Completed' ? <CheckCircle2 size={24} /> : <Timer size={24} />}
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-800 dark:text-gray-100">{service.serviceTitle}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-400 font-medium mt-1">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {service.startTime || '00:00'}
                    </span>
                    <span>•</span>
                    <span>{service.performerName || 'پرستار شیفت'}</span>
                  </div>
                </div>
              </div>
              <button className="text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400">
                <MoreVertical size={20} />
              </button>
            </PortalCard>
          ))}
          
          {services.length === 0 && (
            <div className="text-center py-10 text-gray-400 dark:text-gray-500 font-medium text-sm">
              خدمتی برای نمایش وجود ندارد
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="w-full max-w-md bg-white dark:bg-gray-900 rounded-[2.5rem] p-6 shadow-soft-xl border border-white/50 dark:border-gray-800"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-gray-800 dark:text-gray-100">افزودن خدمت جدید</h3>
                <button onClick={() => setIsAdding(false)} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-full text-gray-400">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 mr-2">عنوان خدمت</label>
                  <input 
                    type="text" 
                    className="w-full p-4 bg-neutral-warm-50 dark:bg-gray-800 rounded-2xl border-none focus:ring-2 focus:ring-medical-200 outline-none text-gray-700 dark:text-gray-200 font-bold text-sm placeholder-gray-300"
                    placeholder="مثال: تعویض پانسمان"
                    value={newService.title}
                    onChange={(e) => setNewService({...newService, title: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 mr-2">زمان انجام</label>
                  <input 
                    type="time" 
                    className="w-full p-4 bg-neutral-warm-50 dark:bg-gray-800 rounded-2xl border-none focus:ring-2 focus:ring-medical-200 outline-none text-gray-700 dark:text-gray-200 font-bold text-lg text-center dir-ltr"
                    value={newService.time}
                    onChange={(e) => setNewService({...newService, time: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 mr-2">توضیحات تکمیلی</label>
                  <textarea 
                    className="w-full h-24 p-4 bg-neutral-warm-50 dark:bg-gray-800 rounded-2xl border-none focus:ring-2 focus:ring-medical-200 outline-none text-gray-700 dark:text-gray-200 font-bold text-sm placeholder-gray-300 resize-none"
                    placeholder="توضیحات ضروری برای پرستار بعدی..."
                    value={newService.note}
                    onChange={(e) => setNewService({...newService, note: e.target.value})}
                  />
                </div>

                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full py-4 bg-medical-500 hover:bg-medical-600 text-white rounded-2xl font-black text-sm shadow-glow-medical mt-4 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={18} />}
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
