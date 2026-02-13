"use client";

import { useState, useEffect } from "react";
import { nursePortalService } from "@/services/nurse-portal.service";
import { PatientList } from "@/types/patient";
import { PortalCard } from "@/components/portal/ui/portal-card";
import { Search, Activity, User, ChevronLeft, Plus, Clock, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { NurseVitalSignsForm } from "@/components/nurse-portal/vital-signs-form";

export default function VitalSignsDashboard() {
  const [patients, setPatients] = useState<PatientList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatientForAdd, setSelectedPatientForAdd] = useState<PatientList | null>(null);

  useEffect(() => {
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
  }, []);

  const filteredPatients = patients.filter(p => 
    `${p.firstName} ${p.lastName}`.includes(searchTerm) || 
    p.primaryDiagnosis.includes(searchTerm)
  );

  return (
    <div className="pb-24 px-4 md:px-0 space-y-6">
      <header className="pt-6 flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-3">
             <div className="w-12 h-12 rounded-2xl bg-medical-500 text-white flex items-center justify-center shadow-glow-medical">
               <Activity className="w-6 h-6" />
             </div>
             مدیریت علائم حیاتی
           </h1>
           <p className="text-sm font-bold text-gray-400 mt-2 mr-1">پایش و ثبت وضعیت سلامت بیماران</p>
        </div>
      </header>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
           <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
           type="text"
           className="block w-full pr-12 pl-4 py-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[1.5rem] shadow-soft-sm focus:ring-2 focus:ring-medical-200 focus:border-medical-300 transition-all font-bold text-sm"
           placeholder="جستجوی نام بیمار..."
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Patient List */}
      <div className="space-y-4">
        {isLoading ? (
           <div className="flex flex-col items-center justify-center py-20 text-gray-400">
             <Loader2 className="w-8 h-8 animate-spin mb-4 text-medical-500" />
             <p className="font-bold">در حال دریافت لیست...</p>
           </div>
        ) : filteredPatients.length === 0 ? (
           <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] border border-dashed border-gray-200">
             <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
             <p className="font-bold text-gray-500">بیماری یافت نشد</p>
           </div>
        ) : (
           filteredPatients.map((patient, index) => (
             <motion.div
               key={patient.id}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: index * 0.05 }}
             >
               <PortalCard className="group relative bg-white dark:bg-gray-800 border-none shadow-soft-sm hover:shadow-soft-lg transition-all p-0 overflow-hidden">
                 <div className="p-5 flex items-center gap-4">
                    <Link href={`/nurse-portal/patient/${patient.id}`} className="flex-1 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-400 group-hover:bg-medical-50 group-hover:text-medical-600 transition-colors">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-gray-800 dark:text-gray-100 group-hover:text-medical-600 transition-colors">
                                {patient.firstName} {patient.lastName}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-lg">
                                    سطح مراقبت: {patient.careLevel}
                                </span>
                                <span className="text-xs text-gray-400 font-medium truncate max-w-[150px]">
                                    {patient.primaryDiagnosis}
                                </span>
                            </div>
                        </div>
                    </Link>

                    <button 
                        onClick={() => setSelectedPatientForAdd(patient)}
                        className="w-10 h-10 rounded-xl bg-medical-50 text-medical-600 hover:bg-medical-500 hover:text-white flex items-center justify-center transition-all active:scale-90"
                        title="ثبت سریع علائم"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                    <Link href={`/nurse-portal/patient/${patient.id}`} className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-100 flex items-center justify-center transition-all">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                 </div>
               </PortalCard>
             </motion.div>
           ))
        )}
      </div>

      {/* Quick Add Modal */}
      <AnimatePresence>
        {selectedPatientForAdd && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-lg my-auto"
            >
                <div className="mb-4 text-center text-white">
                    <h3 className="text-lg font-bold">ثبت علائم برای {selectedPatientForAdd.firstName} {selectedPatientForAdd.lastName}</h3>
                </div>
                <NurseVitalSignsForm 
                    patientId={selectedPatientForAdd.id}
                    onSuccess={() => setSelectedPatientForAdd(null)}
                    onCancel={() => setSelectedPatientForAdd(null)}
                />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
