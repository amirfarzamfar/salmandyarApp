import { NursingReport } from "@/types/patient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FileText, Calendar, Clock, User, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface NursingReportDetailModalProps {
  report: NursingReport | null;
  isOpen: boolean;
  onClose: () => void;
}

export function NursingReportDetailModal({ report, isOpen, onClose }: NursingReportDetailModalProps) {
  if (!report) return null;

  const formattedDate = new Date(report.createdAt).toLocaleDateString('fa-IR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedTime = new Date(report.createdAt).toLocaleTimeString('fa-IR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const shiftLabel = report.shift === 'Morning' ? 'شیفت صبح' : 
                     report.shift === 'Evening' ? 'شیفت عصر' : 'شیفت شب';
  
  const shiftColor = report.shift === 'Morning' ? 'bg-orange-100 text-orange-700' : 
                     report.shift === 'Evening' ? 'bg-blue-100 text-blue-700' : 'bg-indigo-100 text-indigo-700';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-2xl rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
        {/* Header Section */}
        <div className="bg-medical-50 p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-medical-100 rounded-full -mr-10 -mt-10 opacity-50 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-100 rounded-full -ml-8 -mb-8 opacity-50 blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-medical-600">
                <FileText size={24} />
              </div>
              <div className={cn("px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm", shiftColor)}>
                {shiftLabel}
              </div>
            </div>
            
            <DialogTitle className="text-2xl font-bold text-gray-800 mb-2">
              گزارش پرستاری
            </DialogTitle>
            <DialogDescription className="text-gray-500 flex items-center gap-2">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {formattedDate}
              </span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {formattedTime}
              </span>
            </DialogDescription>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 md:p-8 bg-white">
          <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
              <User size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">ثبت شده توسط</p>
              <p className="text-sm font-bold text-gray-700">{report.authorName || 'پرستار'}</p>
            </div>
          </div>

          <div className="prose prose-sm max-w-none">
            <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-medical-500" />
              شرح وضعیت بیمار
            </h4>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-gray-700 leading-8 text-justify whitespace-pre-line text-base">
              {report.content}
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button 
              onClick={onClose}
              className="bg-gray-100 text-gray-600 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors w-full md:w-auto"
            >
              بستن
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
