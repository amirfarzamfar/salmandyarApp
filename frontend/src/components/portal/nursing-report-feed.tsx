"use client";

import { useEffect, useState } from "react";
import { PortalCard } from "./ui/portal-card";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { FileText, Loader2, ChevronDown, Clock, CalendarDays, ArrowLeft } from "lucide-react";
import { patientService } from "@/services/patient.service";
import { NursingReport } from "@/types/patient";
import { NursingReportDetailModal } from "./nursing-report-detail-modal";
import { NursingReportsListModal } from "./nursing-report-list-modal";
import { cn } from "@/lib/utils";

interface NursingReportFeedProps {
  patientId?: number;
}

const SHIFT_META: Record<string, { label: string; className: string }> = {
  Morning: {
    label: "شیفت صبح",
    className: "bg-amber-50 text-amber-700 border-amber-100",
  },
  Evening: {
    label: "شیفت عصر",
    className: "bg-sky-50 text-sky-700 border-sky-100",
  },
  Night: {
    label: "شیفت شب",
    className: "bg-violet-50 text-violet-700 border-violet-100",
  },
};

function getShiftMeta(shift: string) {
  return SHIFT_META[shift] ?? {
    label: "گزارش پرستاری",
    className: "bg-gray-50 text-gray-700 border-gray-200",
  };
}

function getAuthorInitial(name?: string) {
  const value = (name ?? "پرستار").trim();
  return value.charAt(0) || "پ";
}

function getReportPreview(content: string, maxLength = 150) {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trim()}...`;
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
          <PortalCard className="mb-8 border border-gray-100 bg-white p-6 shadow-soft-sm">
            <div className="flex items-center justify-center gap-3 py-6 text-sm text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin text-medical-500" />
              در حال بارگذاری گزارش‌های پرستاری...
            </div>
          </PortalCard>
      );
  }

  if (error) {
      return (
          <PortalCard className="mb-8 border border-red-100 bg-red-50/80 p-6">
            <div className="text-center text-sm font-medium text-red-600">
              دریافت گزارش‌های پرستاری با خطا روبه‌رو شد.
            </div>
          </PortalCard>
      );
  }

  if (reports.length === 0) {
      return (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-medical-600" />
              گزارش‌های پرستاری
            </h2>
            <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-6 text-center shadow-soft-sm">
                <p className="text-sm font-medium text-gray-500">هنوز گزارشی ثبت نشده است.</p>
            </div>
          </div>
      );
  }

  return (
    <div className="mb-8 relative">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-medical-50 text-medical-600">
            <FileText size={18} />
            </div>
            گزارش‌های پرستاری
          </h2>
          <p className="mt-1 text-xs leading-6 text-gray-500">
            خلاصه آخرین مشاهدات و اقدامات ثبت‌شده توسط تیم پرستاری
          </p>
        </div>
        {hasMore && (
           <button
             onClick={() => setIsListModalOpen(true)}
             className="inline-flex items-center justify-center rounded-xl border border-medical-100 bg-white px-3 py-2 text-xs font-bold text-medical-700 transition hover:bg-medical-50 sm:w-auto"
           >
             مشاهده همه ({reports.length})
           </button>
        )}
      </div>

      <div className="space-y-4 relative">
        {displayedReports.map((report) => (
          <PortalCard
            key={report.id}
            variant="default"
            className="group relative overflow-hidden border border-gray-100 bg-white p-4 shadow-soft-sm transition-all duration-300 hover:border-medical-100 hover:shadow-soft-md sm:p-5"
          >
            <div className="relative space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                 <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-medical-100 bg-medical-50 text-sm font-bold text-medical-700">
                    {getAuthorInitial(report.authorName)}
                 </div>
                 <div className="min-w-0">
                    <span className="block truncate text-sm font-bold text-gray-800">{report.authorName || "پرستار"}</span>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays size={12} />
                        {new DateObject({ date: new Date(report.createdAt), calendar: persian, locale: persian_fa }).format("DD MMMM YYYY")}
                      </span>
                      <span className="inline-flex items-center gap-1" dir="ltr">
                        <Clock size={12} />
                        {new Date(report.createdAt).toLocaleTimeString("fa-IR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                 </div>
                </div>
              
                <div className={cn(
                    "shrink-0 rounded-xl border px-2.5 py-1 text-[10px] font-bold",
                    getShiftMeta(report.shift).className
                )}>
                    {getShiftMeta(report.shift).label}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="mb-2 text-[11px] font-bold tracking-wide text-gray-500">
                  خلاصه گزارش
                </div>
                <p className="text-sm leading-7 text-gray-800 break-words">
                  {getReportPreview(report.content)}
                </p>
              </div>

              <div className="flex flex-col gap-3 border-t border-gray-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs leading-6 text-gray-500">
                  برای مشاهده متن کامل و جزئیات بیشتر، وارد گزارش شوید.
                </span>
                <button 
                    onClick={() => handleOpenDetail(report)}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-2xl bg-medical-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-medical-700 active:scale-95 sm:w-auto"
                >
                    مشاهده کامل گزارش
                    <ArrowLeft className="h-4 w-4" />
                </button>
              </div>
            </div>
          </PortalCard>
        ))}

        {/* "More" Button for showing all reports */}
        {hasMore && (
            <div className="relative pt-2">
                <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-transparent to-medical-50/30 pointer-events-none -mt-12"></div>
                <button 
                    onClick={() => setIsListModalOpen(true)}
                    className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-600 shadow-soft-sm transition-all hover:border-medical-200 hover:bg-medical-50 hover:text-medical-700"
                >
                    <span>مشاهده گزارش‌های قدیمی‌تر</span>
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
