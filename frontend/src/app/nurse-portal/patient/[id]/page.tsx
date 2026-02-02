"use client";

import { useState, useEffect, use } from "react";
import { VitalsManager } from "@/components/nurse-portal/vitals-manager";
import { ReportWriter } from "@/components/nurse-portal/report-writer";
import { ServiceTracker } from "@/components/nurse-portal/service-tracker";
import { MedicationTracker } from "@/components/nurse-portal/medication-tracker";
import { PortalButton } from "@/components/portal/ui/portal-button";
import { ChevronRight, User, Phone, Activity, FileText, Calendar, AlertCircle, Loader2, Pill } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { patientService } from "@/services/patient.service";
import { Patient } from "@/types/patient";
import { toast } from "react-hot-toast";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<'vitals' | 'reports' | 'services' | 'meds'>('vitals');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setIsLoading(true);
        const data = await patientService.getById(parseInt(id));
        setPatient(data);
      } catch (error) {
        console.error(error);
        toast.error("خطا در دریافت اطلاعات بیمار");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPatient();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-neutral-warm-50 dark:bg-gray-900">
        <Loader2 className="w-10 h-10 animate-spin text-medical-500" />
        <p className="text-sm font-black text-gray-400">در حال دریافت پرونده بیمار...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-neutral-warm-50 dark:bg-gray-900 px-6 text-center">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-500">
          <AlertCircle className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-800 dark:text-gray-100 mb-2">بیمار یافت نشد</h2>
          <p className="text-sm text-gray-400 font-medium leading-relaxed">متأسفانه اطلاعاتی برای این شناسه یافت نشد یا دسترسی شما محدود شده است.</p>
        </div>
        <Link href="/nurse-portal">
          <PortalButton variant="outline">بازگشت به لیست</PortalButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-32 px-4 md:px-0">
      {/* Premium Header */}
      <header className="flex items-center justify-between pt-6 mb-8">
        <div className="flex items-center gap-4">
          <Link href="/nurse-portal">
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 shadow-soft-md flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-medical-600 dark:hover:text-medical-400 transition-all active:scale-90 border border-gray-50 dark:border-gray-700">
              <ChevronRight className="w-6 h-6" />
            </div>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">{patient.firstName} {patient.lastName}</h1>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 mt-0.5">
              <span className="bg-medical-50 dark:bg-medical-900/30 text-medical-600 dark:text-medical-400 px-2 py-0.5 rounded-lg">ID: {patient.id}</span>
              <span>•</span>
              <span>{patient.currentStatus}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <ThemeToggle />
          <a href={`tel:${patient.id}`} className="w-12 h-12 rounded-2xl bg-calm-green-500 text-white shadow-glow-medical flex items-center justify-center active:scale-90 transition-transform">
            <Phone className="w-5 h-5" />
          </a>
        </div>
      </header>

      {/* Premium Info Summary Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] shadow-soft-xl border border-white dark:border-gray-700 mb-8"
      >
        <div className="absolute top-0 right-0 p-4">
          <div className="bg-medical-50 dark:bg-medical-900/30 text-medical-500 dark:text-medical-400 px-3 py-1 rounded-xl text-[10px] font-black flex items-center gap-1 border border-medical-100 dark:border-medical-800 uppercase tracking-wider">
            <Activity className="w-3 h-3" />
            سطح مراقبت: {patient.careLevel}
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-medical-50 to-medical-100 dark:from-medical-900 dark:to-medical-800 flex items-center justify-center text-medical-600 dark:text-medical-400 shadow-inner">
            <User className="w-8 h-8" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">پرونده پزشکی</div>
            <div className="text-sm font-bold text-gray-700 dark:text-gray-200 leading-relaxed max-w-[200px]">{patient.primaryDiagnosis}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-neutral-warm-50/50 dark:bg-gray-700/50 p-4 rounded-2xl border border-gray-50 dark:border-gray-600">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold">سن</span>
            </div>
            <div className="text-lg font-black text-gray-800 dark:text-gray-100">{new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} <span className="text-xs font-medium text-gray-400">سال</span></div>
          </div>
          <div className="bg-neutral-warm-50/50 dark:bg-gray-700/50 p-4 rounded-2xl border border-gray-50 dark:border-gray-600">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Activity className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold">گروه خونی</span>
            </div>
            <div className="text-lg font-black text-gray-800 dark:text-gray-100">O+</div>
          </div>
        </div>
      </motion.div>

      {/* Premium Tab Navigation */}
      <div className="flex p-1.5 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-[2rem] mb-6 border border-white/60 dark:border-gray-700 shadow-sm sticky top-4 z-30 mx-2 md:mx-0 overflow-x-auto">
        <TabButton 
          id="vitals" 
          label="علائم" 
          icon={Activity} 
          active={activeTab === 'vitals'} 
          onClick={() => setActiveTab('vitals')} 
        />
        <TabButton 
          id="meds" 
          label="داروها" 
          icon={Pill} 
          active={activeTab === 'meds'} 
          onClick={() => setActiveTab('meds')} 
        />
        <TabButton 
          id="reports" 
          label="گزارش" 
          icon={FileText} 
          active={activeTab === 'reports'} 
          onClick={() => setActiveTab('reports')} 
        />
        <TabButton 
          id="services" 
          label="خدمات" 
          icon={Calendar} 
          active={activeTab === 'services'} 
          onClick={() => setActiveTab('services')} 
        />
      </div>

      {/* Tab Content with Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'vitals' && <VitalsManager patientId={patient.id} />}
          {activeTab === 'meds' && <MedicationTracker patientId={patient.id} />}
          {activeTab === 'reports' && <ReportWriter patientId={patient.id} />}
          {activeTab === 'services' && <ServiceTracker patientId={patient.id} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function TabButton({ id, label, icon: Icon, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 min-w-[80px] flex items-center justify-center gap-2 py-3.5 rounded-[1.5rem] transition-all duration-300 ${
        active 
          ? 'bg-medical-600 dark:bg-medical-500 text-white shadow-soft-md scale-[1.02]' 
          : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
      }`}
    >
      <Icon className={`w-4 h-4 ${active ? 'stroke-[2.5px]' : 'stroke-2'}`} />
      <span className="text-xs font-black tracking-wide">{label}</span>
    </button>
  );
}
