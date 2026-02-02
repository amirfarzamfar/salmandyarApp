"use client";

import { useState, useEffect } from "react";
import { PortalCard } from "@/components/portal/ui/portal-card";
import { FileText, Search, Calendar, User, Clock, ChevronLeft, Loader2, Quote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { nursePortalService } from "@/services/nurse-portal.service";
import { NursingReport } from "@/types/patient";
import { toast } from "react-hot-toast";

export default function NurseReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchAllReports = async () => {
      try {
        setIsLoading(true);
        // In a real app, we'd have an endpoint for all reports for this nurse
        // For now, we fetch patients then their reports to simulate a global list
        const patients = await nursePortalService.getMyPatients();
        const allReports: any[] = [];
        
        for (const patient of patients) {
          const patientReports = await nursePortalService.getPatientReports(patient.id);
          allReports.push(...patientReports.map(r => ({
            ...r,
            patientName: `${patient.firstName} ${patient.lastName}`,
            patientId: patient.id
          })));
        }
        
        // Sort by date descending
        allReports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setReports(allReports);
      } catch (error) {
        console.error(error);
        toast.error("خطا در دریافت گزارش‌ها");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllReports();
  }, []);

  const filteredReports = reports.filter(r => 
    r.content.includes(searchTerm) || 
    r.patientName.includes(searchTerm)
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8 px-4 md:px-0">
      <header className="flex justify-between items-center pt-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">تاریخچه گزارش‌ها</h1>
          <p className="text-sm font-medium text-gray-400 mt-1">آرشیو تمامی گزارش‌های ثبت شده</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white shadow-soft-md flex items-center justify-center text-medical-600 border border-gray-50">
          <FileText className="w-6 h-6" />
        </div>
      </header>

      {/* Premium Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-medical-400" />
        </div>
        <input
          type="text"
          className="block w-full pr-14 pl-6 py-5 bg-white/70 backdrop-blur-md border border-white/50 rounded-[2rem] shadow-soft-md focus:ring-2 focus:ring-medical-200 focus:bg-white transition-all text-gray-700 placeholder-gray-400 font-medium"
          placeholder="جستجو در متن گزارش یا نام بیمار..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-6"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-medical-500" />
            <p className="text-sm font-black">در حال دریافت گزارش‌ها...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-20 bg-white/50 backdrop-blur-md rounded-[2.5rem] border border-dashed border-gray-200">
            <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-black text-gray-800 mb-1">گزارشی یافت نشد</h3>
            <p className="text-sm text-gray-400 font-medium">موردی مطابق با جستجوی شما یافت نشد.</p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <motion.div key={report.id} variants={item}>
              <PortalCard className="bg-white border-none shadow-soft-lg hover:shadow-soft-xl transition-all duration-300 overflow-hidden relative" noPadding>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-medical-50 flex items-center justify-center text-medical-600">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-gray-800">{report.patientName}</h3>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>شیفت {report.shift}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-200" />
                          <span>{new Date(report.createdAt).toLocaleDateString('fa-IR')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-gray-50 rounded-lg text-[8px] font-black text-gray-400 uppercase tracking-widest">
                      ID: {report.patientId}
                    </div>
                  </div>

                  <div className="relative bg-neutral-warm-50/50 p-5 rounded-2xl border border-gray-50/50">
                    <Quote className="absolute top-3 right-3 w-6 h-6 text-medical-100 -scale-x-100" />
                    <p className="text-sm text-gray-600 leading-relaxed font-medium pr-8">
                      {report.content}
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button className="text-[10px] font-black text-medical-500 hover:text-medical-600 transition-colors flex items-center gap-1 group">
                      جزئیات کامل
                      <ChevronLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </PortalCard>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}
