"use client";

import { useState, useEffect } from "react";
import { PortalCard } from "@/components/portal/ui/portal-card";
import { FileText, Search, User, Clock, ChevronLeft, Loader2, Quote, Plus, X, Calendar } from "lucide-react";
// import { motion } from "framer-motion"; // Temporarily removed to debug visibility issues
import { nursePortalService } from "@/services/nurse-portal.service";
import { NursingReport } from "@/types/patient";
import { toast } from "react-hot-toast";
import { PatientSelector } from "@/components/nurse-portal/PatientSelector";
import { ReportWriter } from "@/components/nurse-portal/report-writer";

export default function NurseReportsPage() {
  const [reports, setReports] = useState<NursingReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPatientSelectorOpen, setIsPatientSelectorOpen] = useState(false);
  const [selectedPatientForReport, setSelectedPatientForReport] = useState<number | null>(null);
  const [viewingReport, setViewingReport] = useState<NursingReport | null>(null);

  // Helper to normalize report data from backend (handles PascalCase, camelCase, etc.)
  const normalizeReport = (r: any): NursingReport => ({
    id: r.id || r.Id || r.ID || Math.floor(Math.random() * 100000),
    content: r.content || r.Content || r.body || "",
    patientName: r.patientName || r.PatientName || r.patient?.name || "نامشخص",
    shift: r.shift || r.Shift || "Morning",
    createdAt: r.createdAt || r.CreatedAt || new Date().toISOString(),
    careRecipientId: r.careRecipientId || r.CareRecipientId || r.patientId || 0,
    authorName: r.authorName || r.AuthorName
  });

  const fetchAllReports = async () => {
    try {
      setIsLoading(true);
      const response = await nursePortalService.getAllMyReports();
      console.log("Raw fetched reports:", response);
      
      // Handle various response structures (array, { data: [] }, { items: [] })
      let reportsData: any[] = [];
      if (Array.isArray(response)) {
        reportsData = response;
      } else if (response && Array.isArray(response.data)) {
        reportsData = response.data;
      } else if (response && Array.isArray(response.items)) {
        reportsData = response.items;
      } else if (response && Array.isArray(response.value)) {
        reportsData = response.value;
      }

      console.log("Extracted reports array:", reportsData);

      const mappedReports = reportsData.map(normalizeReport);
      console.log("Mapped reports:", mappedReports);

      setReports(mappedReports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("خطا در دریافت گزارش‌ها");
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllReports();
  }, []);

  // Robust filtering
  const filteredReports = reports.filter(r => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    
    const content = (r.content || "").toLowerCase();
    const name = (r.patientName || "").toLowerCase();
    
    return content.includes(term) || name.includes(term);
  });

  return (
    <div className="space-y-8 px-4 md:px-0 pb-24">
      <header className="flex justify-between items-center pt-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">تاریخچه گزارش‌ها</h1>
          <p className="text-sm font-medium text-gray-400 dark:text-gray-500 mt-1">آرشیو تمامی گزارش‌های ثبت شده</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 shadow-soft-md flex items-center justify-center text-medical-600 dark:text-medical-400 border border-gray-50 dark:border-gray-700">
          <FileText className="w-6 h-6" />
        </div>
      </header>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-medical-400" />
        </div>
        <input
          type="text"
          className="block w-full pr-14 pl-6 py-5 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md border border-white/50 dark:border-gray-700/50 rounded-[2rem] shadow-soft-md focus:ring-2 focus:ring-medical-200 dark:focus:ring-medical-800 focus:bg-white dark:focus:bg-gray-800 transition-all text-gray-700 dark:text-gray-200 placeholder-gray-400 font-medium"
          placeholder="جستجو در متن گزارش یا نام بیمار..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Reports List - Removed framer-motion to ensure visibility */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-medical-500" />
            <p className="text-sm font-black">در حال دریافت گزارش‌ها...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-[2.5rem] border border-dashed border-gray-300 dark:border-gray-700 shadow-sm">
            <FileText className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 mb-1">گزارشی یافت نشد</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-6">
              {searchTerm ? "موردی مطابق با جستجوی شما یافت نشد." : "هنوز گزارشی ثبت نشده است."}
            </p>
            {!searchTerm && (
              <button 
                onClick={() => setIsPatientSelectorOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-medical-500 hover:bg-medical-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-medical-500/20"
              >
                <Plus size={20} />
                ثبت اولین گزارش
              </button>
            )}
          </div>
        ) : (
          filteredReports.map((report) => (
            <div key={report.id} className="block">
              <PortalCard className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-soft-lg hover:shadow-soft-xl dark:shadow-none transition-all duration-300 overflow-hidden relative" noPadding>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-medical-50 dark:bg-medical-900/20 flex items-center justify-center text-medical-600 dark:text-medical-400 shadow-sm border border-medical-100 dark:border-medical-800/30">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 mb-0.5">{report.patientName}</h3>
                        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                          <Clock className="w-3.5 h-3.5 text-medical-500" />
                          <span>شیفت {report.shift === 'Morning' ? 'صبح' : report.shift === 'Evening' ? 'عصر' : 'شب'}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                          <span>
                            {report.createdAt && !isNaN(new Date(report.createdAt).getTime()) 
                              ? new Date(report.createdAt).toLocaleDateString('fa-IR') 
                              : 'تاریخ نامعتبر'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative bg-gray-50 dark:bg-gray-700/30 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50 mb-4">
                    <Quote className="absolute top-4 right-4 w-8 h-8 text-gray-200 dark:text-gray-600 -scale-x-100 pointer-events-none" />
                    <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed font-medium relative z-10 pr-2">
                      {report.content}
                    </p>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-gray-50 dark:border-gray-700/50">
                    <button 
                      onClick={() => setViewingReport(report)}
                      className="text-xs font-black text-medical-600 dark:text-medical-400 hover:text-medical-700 dark:hover:text-medical-300 transition-colors flex items-center gap-1 group px-3 py-1.5 rounded-lg hover:bg-medical-50 dark:hover:bg-medical-900/20"
                    >
                      جزئیات کامل
                      <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </PortalCard>
            </div>
          ))
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsPatientSelectorOpen(true)}
        className="fixed bottom-24 left-6 w-14 h-14 bg-teal-500 text-white rounded-full shadow-lg shadow-teal-500/30 flex items-center justify-center hover:bg-teal-600 hover:scale-110 active:scale-95 transition-all z-40"
      >
        <Plus size={28} />
      </button>

      <PatientSelector
        isOpen={isPatientSelectorOpen}
        onClose={() => setIsPatientSelectorOpen(false)}
        onSelect={(patientId) => {
          setIsPatientSelectorOpen(false);
          setSelectedPatientForReport(patientId);
        }}
      />

      {selectedPatientForReport && (
        <ReportWriter
          isOpen={true}
          patientId={selectedPatientForReport}
          onClose={() => setSelectedPatientForReport(null)}
          onSuccess={() => {
            setSelectedPatientForReport(null);
            toast.success("گزارش با موفقیت ثبت شد");
            fetchAllReports();
          }}
        />
      )}

      {/* Report Details Modal */}
      {viewingReport && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
          <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
              <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <FileText className="w-6 h-6 text-medical-500" />
                جزئیات گزارش
              </h2>
              <button 
                onClick={() => setViewingReport(null)}
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/50 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm text-medical-600 dark:text-medical-400">
                  <User className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-bold mb-1">نام بیمار</div>
                  <div className="text-lg font-black text-gray-900 dark:text-gray-100">{viewingReport.patientName}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/50">
                  <div className="flex items-center gap-2 mb-2 text-medical-600 dark:text-medical-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">شیفت</span>
                  </div>
                  <div className="font-black text-gray-900 dark:text-gray-100">
                    {viewingReport.shift === 'Morning' ? 'صبح' : viewingReport.shift === 'Evening' ? 'عصر' : 'شب'}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/50">
                  <div className="flex items-center gap-2 mb-2 text-medical-600 dark:text-medical-400">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">تاریخ ثبت</span>
                  </div>
                  <div className="font-black text-gray-900 dark:text-gray-100">
                    {viewingReport.createdAt && !isNaN(new Date(viewingReport.createdAt).getTime()) 
                      ? new Date(viewingReport.createdAt).toLocaleDateString('fa-IR') 
                      : 'نامشخص'}
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -top-3 right-4 bg-white dark:bg-gray-800 px-2 text-xs font-bold text-gray-500 dark:text-gray-400">
                  متن گزارش
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-5 text-gray-700 dark:text-gray-300 leading-relaxed text-justify min-h-[150px] whitespace-pre-wrap">
                  {viewingReport.content}
                </div>
              </div>

              {viewingReport.authorName && (
                <div className="text-right text-xs font-medium text-gray-400 dark:text-gray-500 mt-4">
                  ثبت شده توسط: {viewingReport.authorName}
                </div>
              )}

              <button 
                onClick={() => setViewingReport(null)}
                className="w-full py-4 bg-gray-900 dark:bg-gray-700 text-white rounded-2xl font-bold text-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-all shadow-lg shadow-gray-900/20"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
