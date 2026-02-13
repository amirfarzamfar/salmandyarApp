"use client";

import { useState, useEffect } from "react";
import { PortalCard } from "@/components/portal/ui/portal-card";
import { PortalButton } from "@/components/portal/ui/portal-button";
import { FileText, Save, X, ChevronLeft, Check, ChevronRight, ListChecks, Edit3, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { nursePortalService } from "@/services/nurse-portal.service";
import { reportConfigService } from "@/services/report-config.service";
import { toast } from "react-hot-toast";
import { ReportCategory, SubmitNursingReportDto } from "@/types/report";

interface ReportWriterProps {
  patientId: number;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
}

export function ReportWriter({ patientId, onSuccess, trigger, isOpen: controlledIsOpen, onClose: controlledOnClose }: ReportWriterProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const handleOpen = () => {
    if (isControlled) {
      // Parent should handle opening, but we can't trigger it from here easily if closed
      // Usually trigger prop implies uncontrolled usage
    } else {
      setInternalIsOpen(true);
    }
  };

  const handleClose = () => {
    if (isControlled) {
      controlledOnClose?.();
    } else {
      setInternalIsOpen(false);
    }
  };

  // ... rest of logic using isOpen and handleClose

  const [step, setStep] = useState(1);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Data State
  const [categories, setCategories] = useState<ReportCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [shift, setShift] = useState("Morning"); // Morning, Evening, Night
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [itemValues, setItemValues] = useState<Record<number, string>>({});
  const [generatedContent, setGeneratedContent] = useState("");

  // Load Config
  useEffect(() => {
    if (isOpen && categories.length === 0) {
      loadConfiguration();
    }
  }, [isOpen, categories.length]);

  const loadConfiguration = async () => {
    setIsLoadingConfig(true);
    try {
      const data = await reportConfigService.getCategories();
      setCategories(data);
      
      // Initialize default values
      const initialValues: Record<number, string> = {};
      data.forEach(cat => {
        cat.items.forEach(item => {
          initialValues[item.id] = item.defaultValue;
          item.subItems.forEach(sub => {
            initialValues[sub.id] = sub.defaultValue;
          });
        });
      });
      setItemValues(initialValues);
    } catch (error) {
      console.error("Error loading report config:", error);
      toast.error("خطا در دریافت قالب‌های گزارش");
    } finally {
      setIsLoadingConfig(false);
    }
  };

  // Generate Report Logic
  useEffect(() => {
    generateReportText();
  }, [checkedItems, itemValues, selectedCategoryId, shift]);

  const generateReportText = () => {
    if (!selectedCategoryId) {
      setGeneratedContent("");
      return;
    }

    const activeCategory = categories.find(c => c.id === selectedCategoryId);
    if (!activeCategory) return;

    let reportText = "";
    const catItems: string[] = [];

    activeCategory.items.forEach(item => {
      if (checkedItems[item.id]) {
        let itemText = itemValues[item.id] || item.title;
        
        // Check subitems
        const activeSubItems = item.subItems.filter(sub => checkedItems[sub.id]);
        if (activeSubItems.length > 0) {
          const subTexts = activeSubItems.map(sub => itemValues[sub.id] || sub.title).join('، ');
          itemText += ` (${subTexts})`;
        }
        
        catItems.push(itemText);
      }
    });

    if (catItems.length > 0) {
      reportText += `**${activeCategory.title}**: ${catItems.join(' - ')}.`;
    }

    setGeneratedContent(reportText);
  };

  const handleItemCheck = (itemId: number, checked: boolean) => {
    setCheckedItems(prev => ({ ...prev, [itemId]: checked }));
  };

  const handleItemValueChange = (itemId: number, value: string) => {
    setItemValues(prev => ({ ...prev, [itemId]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedCategoryId) {
      toast.error("لطفا نوع گزارش را انتخاب کنید");
      return;
    }

    if (!generatedContent.trim()) {
      toast.error("متن گزارش خالی است");
      return;
    }

    setIsSubmitting(true);
    try {
        const activeCategory = categories.find(c => c.id === selectedCategoryId);
        if (!activeCategory) return;

        // Prepare items list
        const validItemIds = new Set<number>();
        activeCategory.items.forEach(item => {
            validItemIds.add(item.id);
            item.subItems.forEach(sub => validItemIds.add(sub.id));
        });

        const items = Object.keys(checkedItems)
        .filter(key => {
            const id = Number(key);
            return checkedItems[id] && validItemIds.has(id);
        })
        .map(key => ({
            itemId: Number(key),
            isChecked: true,
            value: itemValues[Number(key)]
        }));

        const payload: SubmitNursingReportDto = {
            careRecipientId: patientId,
            shift,
            content: generatedContent,
            items
        };

        await nursePortalService.addReport(patientId, payload);
        toast.success("گزارش با موفقیت ثبت شد");
        handleClose();
        resetForm();
        onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error("خطا در ثبت گزارش");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedCategoryId(null);
    setCheckedItems({});
    setGeneratedContent("");
    // We keep itemValues defaults
  };

  const renderStep1_Context = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 px-1">انتخاب شیفت کاری</label>
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
          {['Morning', 'Evening', 'Night'].map((s) => {
            const label = s === 'Morning' ? 'صبح' : s === 'Evening' ? 'عصر' : 'شب';
            return (
              <button
                key={s}
                onClick={() => setShift(s)}
                className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${
                  shift === s 
                    ? 'bg-white dark:bg-gray-700 text-teal-600 dark:text-teal-400 shadow-sm' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 px-1">نوع گزارش</label>
        {isLoadingConfig ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`p-4 rounded-2xl border-2 text-right transition-all ${
                  selectedCategoryId === cat.id
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                    : 'border-transparent bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100'
                }`}
              >
                <div className="font-bold">{cat.title}</div>
                <div className="text-[10px] mt-1 opacity-70">{cat.items.length} آیتم چک‌لیست</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderStep2_Checklist = () => {
    const activeCategory = categories.find(c => c.id === selectedCategoryId);
    if (!activeCategory) return null;

    return (
      <div className="space-y-4 pb-20">
        <div className="flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10 py-2 border-b dark:border-gray-700 mb-4">
          <h3 className="font-bold text-teal-600">{activeCategory.title}</h3>
          <span className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded-full">
            {Object.keys(checkedItems).filter(k => {
                // Count only items in this category
                const id = Number(k);
                return checkedItems[id] && activeCategory.items.some(i => i.id === id || i.subItems.some(s => s.id === id));
            }).length} مورد انتخاب شده
          </span>
        </div>

        {activeCategory.items.map(item => (
          <div key={item.id} className={`p-4 rounded-2xl border transition-all ${
            checkedItems[item.id] 
              ? 'border-teal-200 bg-teal-50/30 dark:border-teal-800 dark:bg-teal-900/10' 
              : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
          }`}>
            <div className="flex items-start gap-3">
              <div 
                onClick={() => handleItemCheck(item.id, !checkedItems[item.id])}
                className={`w-6 h-6 mt-0.5 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-colors ${
                  checkedItems[item.id]
                    ? 'bg-teal-500 border-teal-500 text-white'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                {checkedItems[item.id] && <Check size={14} strokeWidth={3} />}
              </div>
              
              <div className="flex-1 space-y-3">
                <div 
                   onClick={() => handleItemCheck(item.id, !checkedItems[item.id])}
                   className="font-bold text-gray-700 dark:text-gray-200 cursor-pointer select-none"
                >
                  {item.title}
                </div>

                <AnimatePresence>
                  {checkedItems[item.id] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-3"
                    >
                      <textarea
                          value={itemValues[item.id] || ''}
                          onChange={(e) => handleItemValueChange(item.id, e.target.value)}
                          className="w-full text-sm p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 outline-none"
                          rows={2}
                        />

                      {item.subItems.length > 0 && (
                        <div className="space-y-2 border-r-2 border-teal-100 dark:border-teal-900 pr-3 mr-1">
                          {item.subItems.map(sub => (
                            <div key={sub.id} className="space-y-2">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id={`sub-${sub.id}`}
                                  checked={!!checkedItems[sub.id]}
                                  onChange={(e) => handleItemCheck(sub.id, e.target.checked)}
                                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                                />
                                <label htmlFor={`sub-${sub.id}`} className="text-sm text-gray-600 dark:text-gray-300">
                                  {sub.title}
                                </label>
                              </div>
                              {checkedItems[sub.id] && (
                                <input
                                  value={itemValues[sub.id] || ''}
                                  onChange={(e) => handleItemValueChange(sub.id, e.target.value)}
                                  className="w-full text-xs p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderStep3_Review = () => (
    <div className="space-y-4 h-full flex flex-col">
      <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
          <Edit3 size={16} />
          <span className="text-xs font-bold">قابل ویرایش</span>
        </div>
        <p className="text-[10px] text-amber-700 dark:text-amber-300 leading-relaxed">
          متن زیر به صورت خودکار بر اساس انتخاب‌های شما تولید شده است. در صورت نیاز می‌توانید آن را ویرایش کنید.
        </p>
      </div>

      <textarea
        value={generatedContent}
        onChange={(e) => setGeneratedContent(e.target.value)}
        className="flex-1 w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500 outline-none resize-none leading-7 text-sm font-medium"
        placeholder="متن گزارش..."
      />
    </div>
  );

  return (
    <>
      {trigger ? (
        <div onClick={() => !isControlled && setInternalIsOpen(true)}>{trigger}</div>
      ) : !isControlled && (
        <button 
          onClick={() => setInternalIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-xl text-xs font-black shadow-lg shadow-teal-500/20 active:scale-95 transition-all hover:bg-teal-600"
        >
          <FileText className="w-4 h-4" />
          گزارش جدید
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-lg bg-white dark:bg-gray-900 sm:rounded-[2rem] rounded-t-[2rem] h-[90vh] sm:h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 z-20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
                    {step === 1 && <ListChecks size={20} />}
                    {step === 2 && <Edit3 size={20} />}
                    {step === 3 && <Eye size={20} />}
                  </div>
                  <div>
                    <h2 className="font-black text-gray-800 dark:text-gray-100">
                      {step === 1 ? "تنظیمات گزارش" : step === 2 ? "تکمیل چک‌لیست" : "بازبینی نهایی"}
                    </h2>
                    <p className="text-[10px] text-gray-400 font-bold">گام {step} از ۳</p>
                  </div>
                </div>
                <button 
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="h-1 bg-gray-100 dark:bg-gray-800 w-full">
                <motion.div 
                  className="h-full bg-teal-500"
                  initial={{ width: "33%" }}
                  animate={{ width: `${(step / 3) * 100}%` }}
                />
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                {step === 1 && renderStep1_Context()}
                {step === 2 && renderStep2_Checklist()}
                {step === 3 && renderStep3_Review()}
              </div>

              {/* Footer */}
              <div className="p-4 border-t dark:border-gray-800 bg-white dark:bg-gray-900 z-20 flex gap-3">
                {step > 1 && (
                  <button 
                    onClick={() => setStep(s => s - 1)}
                    className="px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold text-sm flex items-center gap-2"
                  >
                    <ChevronRight size={18} />
                    قبلی
                  </button>
                )}
                
                <button 
                  onClick={() => {
                    if (step === 1) {
                      if (!selectedCategoryId) toast.error("لطفا نوع گزارش را انتخاب کنید");
                      else setStep(2);
                    } else if (step === 2) {
                      setStep(3);
                    } else {
                      handleSubmit();
                    }
                  }}
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-teal-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 active:scale-95 transition-all"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                       <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                       در حال ثبت...
                    </span>
                  ) : step === 3 ? (
                    <>
                      <Save size={18} />
                      ثبت نهایی گزارش
                    </>
                  ) : (
                    <>
                      مرحله بعد
                      <ChevronLeft size={18} />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
