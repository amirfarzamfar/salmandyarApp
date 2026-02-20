"use client";

import { useEffect, useState } from "react";
import { PortalCard } from "./ui/portal-card";
import { FileText, Loader2, ChevronDown, Clock, CalendarDays } from "lucide-react";
import { patientService } from "@/services/patient.service";
import { NursingReport } from "@/types/patient";
import { NursingReportDetailModal } from "./nursing-report-detail-modal";
import { NursingReportsListModal } from "./nursing-report-list-modal";
import { cn } from "@/lib/utils";

interface NursingReportFeedProps {
  patientId?: number;
}

export function NursingReportFeed({ patientId }: NursingReportFeedProps) {
  const [reports, setReports] = useState<NursingReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Modal States
  const [selectedReport, setSelectedReport] = useState<NursingReport | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isListModalOpen, setIsListModalOpen] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      if (!patientId) {
          setLoading(false);
          return;
      }
      
      try {
        setLoading(true);
        const data = await patientService.getReports(patientId);
        // Sort by date descending (newest first)
        const sortedData = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setReports(sortedData);
      } catch (err) {
        console.error("Failed to fetch nursing reports:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [patientId]);

  const handleOpenDetail = (report: NursingReport) => {
    setSelectedReport(report);
    setIsDetailModalOpen(true);
  };

  const displayedReports = reports.slice(0, 3);
  const hasMore = reports.length > 3;

  if (loading) {
      return (
          <div className="flex justify-center items-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-medical-500" />
          </div>
      );
  }

  if (error) {
      return (
          <div className="text-center py-4 text-red-500 text-sm bg-red-50 rounded-xl border border-red-100">
              خطا در دریافت گزارش‌ها
          </div>
      );
  }

  if (reports.length === 0) {
      return (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-medical-600" />
              گزارش‌های پرستاری
            </h2>
            <div className="bg-white/50 p-6 rounded-2xl text-center border border-dashed border-gray-300">
                <p className="text-gray-500 text-sm font-medium">هنوز گزارشی ثبت نشده است.</p>
            </div>
          </div>
      );
  }

  return (
    <div className="mb-8 relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-medical-100 flex items-center justify-center text-medical-600">
            <FileText size={18} />
          </div>
          گزارش‌های پرستاری
        </h2>
        {hasMore && (
           <button 
             onClick={() => setIsListModalOpen(true)}
             className="text-xs font-bold text-medical-600 hover:text-medical-700 hover:bg-medical-50 px-3 py-1.5 rounded-lg transition-colors"
           >
             مشاهده همه ({reports.length})
           </button>
        )}
      </div>

      <div className="space-y-4 relative">
        {displayedReports.map((report, index) => (
          <PortalCard key={report.id} variant="glass" className="group relative overflow-hidden border border-white/40 hover:border-medical-200 transition-all duration-300">
            
            {/* Decorative background blob */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-medical-50 to-transparent rounded-bl-full opacity-50 -z-10 group-hover:opacity-100 transition-opacity"></div>

            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-medical-700 font-bold text-sm border border-medical-50">
                    {(report.authorName || 'P').charAt(0)}
                 </div>
                 <div>
                    <span className="text-sm font-bold text-gray-800 block">{report.authorName || 'پرستار'}</span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5" dir="ltr">
                        <Clock size={10} />
                        {new Date(report.createdAt).toLocaleTimeString('fa-IR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        })}
                    </span>
                 </div>
              </div>
              
              <div className={cn(
                  "px-2.5 py-1 rounded-lg text-[10px] font-bold border shadow-sm",
                  report.shift === 'Morning' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                  report.shift === 'Evening' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                  'bg-indigo-50 text-indigo-600 border-indigo-100'
              )}>
                  {report.shift === 'Morning' ? 'شیفت صبح' : report.shift === 'Evening' ? 'شیفت عصر' : 'شیفت شب'}
              </div>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3 pr-2 border-r-2 border-gray-100 pl-2">
              {report.content}
            </p>

            <div className="flex justify-between items-center pt-3 border-t border-gray-50/50">
                <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                    <CalendarDays size={12} />
                    {new Date(report.createdAt).toLocaleDateString('fa-IR', { 
                        month: 'long', 
                        day: 'numeric'
                    })}
                </span>
                <button 
                    onClick={() => handleOpenDetail(report)}
                    className="text-white bg-medical-500 hover:bg-medical-600 text-xs font-medium px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-medical-200 hover:shadow-lg hover:shadow-medical-300 transition-all active:scale-95"
                >
                    <FileText className="w-3.5 h-3.5" />
                    مشاهده کامل
                </button>
            </div>
          </PortalCard>
        ))}

        {/* "More" Button for showing all reports */}
        {hasMore && (
            <div className="relative pt-2">
                <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-transparent to-medical-50/30 pointer-events-none -mt-12"></div>
                <button 
                    onClick={() => setIsListModalOpen(true)}
                    className="w-full bg-white border border-gray-200 hover:border-medical-300 hover:bg-medical-50 text-gray-500 hover:text-medical-700 font-medium py-3 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md group"
                >
                    <span className="text-sm">مشاهده گزارش‌های قدیمی‌تر</span>
                    <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
                </button>
            </div>
        )}
      </div>

      {/* Modals */}
      <NursingReportDetailModal 
        report={selectedReport} 
        isOpen={isDetailModalOpen} 
        onClose={() => setIsDetailModalOpen(false)} 
      />

      <NursingReportsListModal
        reports={reports}
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
        onSelectReport={(report) => {
            // Close list modal and open detail modal? Or keep list open?
            // Usually better to keep list open or open detail ON TOP.
            // Let's open detail on top (Dialog supports stacking usually, but let's see).
            // Actually, for better mobile UX, let's close list? No, user might want to go back.
            // Let's try stacking.
            handleOpenDetail(report);
        }}
      />
    </div>
  );
}
