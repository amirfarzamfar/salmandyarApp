"use client";

import { useState } from "react";
import { PortalCard } from "@/components/portal/ui/portal-card";
import { PortalButton } from "@/components/portal/ui/portal-button";
import { FileText, Save, Mic, Paperclip, X, Clock, Quote, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { nursePortalService } from "@/services/nurse-portal.service";
import { toast } from "react-hot-toast";

export function ReportWriter({ patientId }: { patientId: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState("");
  const [shift, setShift] = useState("صبح");

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("لطفاً متن گزارش را وارد کنید");
      return;
    }

    setIsSubmitting(true);
    try {
      await nursePortalService.addReport(patientId, {
        careRecipientId: patientId,
        shift,
        content
      });
      toast.success("گزارش با موفقیت ثبت شد");
      setIsOpen(false);
      setContent("");
    } catch (error) {
      console.error(error);
      toast.error("خطا در ثبت گزارش");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-medical-500" />
          <h2 className="text-xl font-black text-gray-800 dark:text-gray-100">گزارش روزانه</h2>
        </div>
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-medical-500 text-white rounded-xl text-xs font-black shadow-glow-medical active:scale-95 transition-all hover:bg-medical-600"
        >
          <FileText className="w-4 h-4" />
          گزارش جدید
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <PortalCard className="bg-white dark:bg-gray-800 border-none shadow-soft-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-medical-400 to-medical-600" />
              
              <div className="flex justify-between items-center mb-6 pt-2">
                <div>
                  <h3 className="text-lg font-black text-gray-800 dark:text-gray-100">ثبت گزارش تخصصی</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">مشاهدات و اقدامات شیفت جاری</p>
                </div>
                <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mb-6 flex p-1 bg-neutral-warm-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                {['صبح', 'عصر', 'شب'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setShift(s)}
                    className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${
                      shift === s 
                        ? 'bg-white dark:bg-gray-700 text-medical-600 dark:text-medical-400 shadow-soft-sm' 
                        : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                  >
                    شیفت {s}
                  </button>
                ))}
              </div>

              <div className="relative mb-6">
                <Quote className="absolute top-4 right-4 w-8 h-8 text-medical-50/50 dark:text-medical-900/30 -scale-x-100" />
                <textarea
                  className="w-full h-48 p-6 bg-neutral-warm-50/30 dark:bg-gray-900/30 rounded-[2rem] border border-gray-100 dark:border-gray-700 focus:ring-2 focus:ring-medical-200 dark:focus:ring-medical-800 focus:border-medical-300 focus:bg-white dark:focus:bg-gray-900 transition-all resize-none text-gray-700 dark:text-gray-200 placeholder-gray-300 font-medium text-sm leading-relaxed"
                  placeholder="شرح کامل وضعیت بیمار، داروها و اقدامات..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setIsOpen(false)}
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
                      ثبت نهایی گزارش
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
