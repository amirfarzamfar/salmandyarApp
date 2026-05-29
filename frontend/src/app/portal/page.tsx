"use client";

import { useState, useEffect } from "react";
import { SmartHeader } from "@/components/portal/smart-header";
import { HealthSnapshot } from "@/components/portal/health-snapshot";
import { VitalSignsChart } from "@/components/portal/vital-signs-chart";
import { VitalSignsHistory } from "@/components/portal/vital-signs-history";
import { MedicationTimeline } from "@/components/portal/medication-timeline";
import { CarePlanCards } from "@/components/portal/care-plan-cards";
import { NursingReportFeed } from "@/components/portal/nursing-report-feed";
import { DocumentCards } from "@/components/portal/document-cards";
import { QuickConnect } from "@/components/portal/quick-connect";
import { PrivacyBadge } from "@/components/portal/ui/privacy-badge";
import { cn } from "@/lib/utils";
import { Eye, Smartphone, ShieldCheck, ClipboardCheck, ArrowLeft, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { patientService } from "@/services/patient.service";
import { Patient } from "@/types/patient";
import { PatientDetailsModal } from "@/components/portal/patient-details-modal";
import { useUser } from "@/components/auth/UserContext";

export default function PortalPage() {
  const [isElderMode, setIsElderMode] = useState(false);
  const [isFamilyMode, setIsFamilyMode] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: userLoading } = useUser();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchPatient = async () => {
        if (!user) {
            setPatient(null);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const accessiblePatient = await patientService.getAccessiblePatient();
            if (!accessiblePatient) {
                setPatient(null);
                return;
            }

            const data = await patientService.getById(accessiblePatient.id);
            setPatient(data);
        } catch (error) {
            console.error("Failed to fetch patient", error);
            setPatient(null);
        } finally {
            setIsLoading(false);
        }
    };

    if (!userLoading) {
      fetchPatient();
    }
  }, [user, userLoading]);

  const patientId = patient?.id;
  const highlightedVitalIdParam = searchParams.get("vitalId");
  const highlightedVitalId = highlightedVitalIdParam ? Number(highlightedVitalIdParam) : null;

  if (userLoading || isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-28 rounded-3xl bg-gray-100" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-40 rounded-3xl bg-gray-100" />
            <div className="h-40 rounded-3xl bg-gray-100" />
          </div>
        </div>
      </div>
    );
  }

  if (!patientId) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-12">
        <div className="bg-white border border-dashed border-gray-200 rounded-3xl p-8 text-center text-gray-500">
          اطلاعات پرونده بیمار برای این حساب کاربری یافت نشد.
        </div>
      </div>
    );
  }

  // Stagger variants for the main content
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

  return (
    <div className={cn(
      "transition-all duration-500 ease-in-out selection:bg-medical-100 selection:text-medical-900",
      isElderMode ? "elder-mode" : ""
    )}>
      <PatientDetailsModal 
        isOpen={isPatientModalOpen} 
        onClose={() => setIsPatientModalOpen(false)} 
        patient={patient} 
      />

      {/* Premium UI Control Toggles - Refined Look */}
      <div className="fixed top-24 right-4 z-30 flex flex-col gap-3 md:top-10 md:right-10">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsElderMode(!isElderMode)}
          className={cn(
            "p-3 rounded-2xl shadow-soft-lg transition-all duration-300 ring-1 ring-black/5",
            isElderMode ? "bg-medical-600 text-white" : "bg-white text-gray-400 hover:text-medical-600"
          )}
          title={isElderMode ? "خروج از حالت سالمند" : "فعال‌سازی حالت سالمند"}
        >
          <Smartphone className="w-5 h-5" />
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsFamilyMode(!isFamilyMode)}
          className={cn(
            "p-3 rounded-2xl shadow-soft-lg transition-all duration-300 ring-1 ring-black/5",
            isFamilyMode ? "bg-indigo-600 text-white" : "bg-white text-gray-400 hover:text-indigo-600"
          )}
          title={isFamilyMode ? "مشاهده پورتال کامل" : "حالت همراه بیمار"}
        >
          <Eye className="w-5 h-5" />
        </motion.button>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <SmartHeader 
            patientName={patient ? `${patient.firstName} ${patient.lastName}` : "کاربر گرامی"} 
            onAvatarClick={() => setIsPatientModalOpen(true)}
        />
        
        <motion.main 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-10 pb-32 pt-2"
        >
          {/* Section: Health Status */}
          <motion.section variants={itemVariants} className="space-y-6">
            <HealthSnapshot patientId={patientId} />
            
            {!isElderMode && (
              <div className="space-y-6">
                <div>
                  <VitalSignsChart patientId={patientId} />
                </div>
                <div id="portal-vital-history-section" className="max-h-[500px] overflow-y-auto rounded-3xl no-scrollbar">
                  <VitalSignsHistory patientId={patientId} highlightedVitalId={Number.isFinite(highlightedVitalId) ? highlightedVitalId : null} />
                </div>
              </div>
            )}
          </motion.section>

          {/* Section: Medication - High Priority */}
          <motion.section variants={itemVariants}>
            <MedicationTimeline patientId={patientId} />
          </motion.section>

          {/* Section: Assessments */}
          <motion.section variants={itemVariants} className="space-y-4">
             <Link href="/portal/profile">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all group cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                            <User size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">پرونده پزشکی من</h3>
                            <p className="text-xs text-gray-500 mt-1 font-medium">مشاهده اطلاعات درمانی، داروها و مدارک</p>
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                </div>
             </Link>
             
             <Link href="/portal/assessments">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all group cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 group-hover:scale-110 transition-transform">
                            <ClipboardCheck size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 text-lg group-hover:text-teal-600 transition-colors">ارزیابی‌های سلامت</h3>
                            <p className="text-gray-500 text-sm">پرسشنامه‌های دوره ای و چک‌لیست‌های سلامتی</p>
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-teal-50 group-hover:border-teal-100 transition-colors">
                        <ArrowLeft size={20} className="text-gray-400 group-hover:text-teal-600" />
                    </div>
                </div>
             </Link>
          </motion.section>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* Section: Care Schedule */}
            <motion.section variants={itemVariants}>
              <CarePlanCards patientId={patientId} />
            </motion.section>

            {/* Section: Professional Updates */}
            <motion.section variants={itemVariants} className="space-y-10">
              <NursingReportFeed patientId={patientId} />
              <AnimatePresence>
                {!isElderMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <DocumentCards />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          </div>

          {/* Trust Section */}
          <motion.section variants={itemVariants} className="pt-10 border-t border-neutral-warm-200">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-12 h-12 rounded-full bg-medical-50 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-medical-600" />
              </div>
              <div>
                <h3 className="text-gray-800 font-bold">اطلاعات شما در امن‌ترین حالت است</h3>
                <p className="text-sm text-gray-500 max-w-sm mt-1 mx-auto leading-relaxed">
                  تمامی داده‌های پزشکی شما به صورت رمزنگاری شده و طبق استانداردهای جهانی محافظت می‌شود.
                </p>
              </div>
              <PrivacyBadge />
            </div>
          </motion.section>
        </motion.main>
      </div>

      <QuickConnect />
    </div>
  );
}
