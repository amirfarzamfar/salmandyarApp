 "use client";

import { useState, useEffect } from "react";
import { nursePortalService } from "@/services/nurse-portal.service";
import { PatientList } from "@/types/patient";
import { PortalCard } from "@/components/portal/ui/portal-card";
import { Search, User, ChevronLeft, Plus, Clock, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { NurseVitalSignsForm } from "@/components/nurse-portal/vital-signs-form";

export default function PatientManagementDashboard() {
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
               <User className="w-6 h-6" />
             </div>
             مدیریت بیماران
           </h1>
           <p className="text-sm font-bold text-gray-400 mt-2 mr-1">پایش و ثبت وضعیت سلامت بیماران</p>
        </div>
      </header>

      <div className="relative mt-2">
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pr-12 pl-4 py-3 bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-soft-sm focus:ring-2 focus:ring-medical-200 dark:focus:ring-medical-800 focus:border-medical-300 transition-all text-gray-700 dark:text-gray-200 placeholder-gray-400 text-sm"
          placeholder="جستجوی نام بیمار یا تشخیص..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-black text-gray-800 dark:text-gray-100">لیست بیماران</h2>
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-lg flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {filteredPatients.length} نفر
          </span>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-medical-500" />
            <p className="text-sm font-black">در حال دریافت لیست بیماران...</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
            <User className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <h3 className="text-sm font-black text-gray-600 dark:text-gray-400">بیماری یافت نشد</h3>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPatients.map((patient) => (
              <PortalCard 
                key={patient.id}
                className="flex items-center justify-between gap-3 p-4 bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-soft-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-medical-50 dark:bg-medical-900/20 flex items-center justify-center text-medical-600">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-black text-gray-900 dark:text-gray-100 truncate">
                      {patient.firstName} {patient.lastName}
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                      {patient.primaryDiagnosis || "بدون تشخیص ثبت‌شده"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/nurse-portal/patient/${patient.id}`}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-gray-900 text-white text-[11px] font-bold hover:bg-gray-700 transition-colors"
                  >
                    <span>جزئیات</span>
                    <ChevronLeft className="w-3 h-3" />
                  </Link>
                  <button
                    onClick={() => setSelectedPatientForAdd(patient)}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-medical-50 text-medical-600 hover:bg-medical-100 dark:bg-medical-900/20 dark:text-medical-400 dark:hover:bg-medical-900/40 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </PortalCard>
            ))}
          </div>
        )}
      </section>

      <AnimatePresence>
        {selectedPatientForAdd && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-soft-lg p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-gray-900 dark:text-gray-100">
                  ثبت علائم برای {selectedPatientForAdd.firstName} {selectedPatientForAdd.lastName}
                </h3>
                <button
                  onClick={() => setSelectedPatientForAdd(null)}
                  className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 flex items-center justify-center"
                >
                  <ChevronLeft className="w-4 h-4 rotate-180" />
                </button>
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
