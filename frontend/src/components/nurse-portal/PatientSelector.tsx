"use client";

import { useState, useEffect } from "react";
import { nursePortalService } from "@/services/nurse-portal.service";
import { PatientList } from "@/types/patient";
import { Search, User, X, ChevronLeft, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PortalCard } from "@/components/portal/ui/portal-card";

interface PatientSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (patientId: number) => void;
}

export function PatientSelector({ isOpen, onClose, onSelect }: PatientSelectorProps) {
  const [patients, setPatients] = useState<PatientList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen) {
      const fetchPatients = async () => {
        try {
          setIsLoading(true);
          const data = await nursePortalService.getMyPatients();
          setPatients(data);
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchPatients();
    }
  }, [isOpen]);

  const filteredPatients = patients.filter(p => 
    `${p.firstName} ${p.lastName}`.includes(searchTerm) || 
    p.primaryDiagnosis.includes(searchTerm)
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-lg bg-white dark:bg-gray-900 sm:rounded-[2rem] rounded-t-[2rem] h-[80vh] flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 z-20">
              <div>
                <h2 className="font-black text-gray-800 dark:text-gray-100">انتخاب بیمار</h2>
                <p className="text-[10px] text-gray-400 font-bold">برای ثبت گزارش، بیمار را انتخاب کنید</p>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500"
              >
                <X size={16} />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
              <div className="relative">
                <Search className="absolute right-3 top-3 text-gray-400" size={18} />
                <input 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="جستجو..."
                  className="w-full p-3 pr-10 rounded-xl border-none bg-white dark:bg-gray-800 shadow-sm focus:ring-2 focus:ring-teal-500 outline-none text-sm text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-teal-500" />
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">بیماری یافت نشد</div>
              ) : (
                filteredPatients.map(patient => (
                  <div 
                    key={patient.id}
                    onClick={() => onSelect(patient.id)}
                    className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 active:scale-95 transition-all cursor-pointer hover:border-teal-500/50 hover:shadow-lg"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500">
                      <User size={20} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 dark:text-gray-200">{patient.firstName} {patient.lastName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                          patient.currentStatus === 'Stable' 
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' 
                            : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'
                        }`}>
                          {patient.currentStatus === 'Stable' ? 'پایدار' : 'نیازمند توجه'}
                        </span>
                        <span className="text-[10px] text-gray-400">{patient.age} ساله</span>
                      </div>
                    </div>
                    <ChevronLeft className="text-gray-300" size={18} />
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
