import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CareService, CareServiceStatus } from "@/types/patient";
import { Calendar, Clock, User, CheckCircle2, FileText, AlertCircle, CalendarClock, Stethoscope, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

interface ServiceDetailModalProps {
  service: CareService | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ServiceDetailModal({ service, isOpen, onClose }: ServiceDetailModalProps) {
  if (!service) return null;

  const date = new DateObject({ date: new Date(service.performedAt || service.startTime || ''), calendar: persian, locale: persian_fa });
  const formattedDate = date.format("dddd DD MMMM YYYY");
  const formattedTime = date.format("HH:mm");

  const getStatusColor = (status: number) => {
    switch (status) {
      case CareServiceStatus.Completed: return 'bg-emerald-100 text-emerald-700 border-emerald-200'; // Completed
      case CareServiceStatus.Planned: return 'bg-blue-100 text-blue-700 border-blue-200'; // Planned
      case CareServiceStatus.Canceled: return 'bg-rose-100 text-rose-700 border-rose-200'; // Canceled
      // case 'InProgress': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: number) => {
    switch (status) {
      case CareServiceStatus.Completed: return 'انجام شده';
      case CareServiceStatus.Planned: return 'برنامه‌ریزی شده';
      case CareServiceStatus.Canceled: return 'لغو شده';
      // case 'InProgress': return 'در حال انجام';
      default: return 'نامشخص';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl rounded-[32px] p-0 overflow-hidden border-0 shadow-2xl bg-white">
        
        {/* Decorative Header */}
        <div className="bg-medical-50 p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-medical-100 rounded-full -mr-16 -mt-16 opacity-60 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-100 rounded-full -ml-10 -mb-10 opacity-60 blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-medical-600 border border-medical-50">
                <Stethoscope size={28} />
              </div>
              <div className={cn("px-3 py-1.5 rounded-xl text-xs font-bold border shadow-sm", getStatusColor(service.status))}>
                {getStatusLabel(service.status)}
              </div>
            </div>
            
            <DialogTitle className="text-2xl font-bold text-gray-800 mb-2">
              {service.serviceTitle}
            </DialogTitle>
            
            <DialogDescription className="text-gray-500 flex flex-wrap items-center gap-4 mt-3">
              <span className="flex items-center gap-1.5 bg-white/60 px-2 py-1 rounded-lg">
                <Calendar size={14} className="text-medical-600" />
                <span className="text-sm font-medium text-gray-700">{formattedDate}</span>
              </span>
              <span className="flex items-center gap-1.5 bg-white/60 px-2 py-1 rounded-lg">
                <Clock size={14} className="text-medical-600" />
                <span className="text-sm font-medium text-gray-700">{formattedTime}</span>
              </span>
            </DialogDescription>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 md:p-8 space-y-6">
          
          {/* Performer Info */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-400 shadow-sm border border-gray-100">
              <User size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">ارائه دهنده خدمت</p>
              <p className="text-base font-bold text-gray-800">{service.performerName || 'نامشخص'}</p>
            </div>
          </div>

          {/* Description */}
          {service.description && (
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FileText size={16} className="text-medical-500" />
                توضیحات
              </h4>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-gray-600 leading-7 text-sm text-justify">
                {service.description}
              </div>
            </div>
          )}

          {/* Notes */}
          {service.notes && (
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <AlertCircle size={16} className="text-orange-500" />
                یادداشت‌های اضافی
              </h4>
              <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100 text-gray-600 leading-7 text-sm text-justify">
                {service.notes}
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <button 
              onClick={onClose}
              className="bg-gray-100 text-gray-600 px-8 py-3 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors w-full md:w-auto"
            >
              بستن
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
