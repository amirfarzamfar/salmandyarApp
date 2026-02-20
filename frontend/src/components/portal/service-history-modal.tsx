import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CareService, CareServiceStatus } from "@/types/patient";
import { Search, CalendarRange, Clock, User, ChevronLeft, Filter, ArrowUpDown } from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

interface ServiceHistoryModalProps {
  services: CareService[];
  isOpen: boolean;
  onClose: () => void;
  onSelectService: (service: CareService) => void;
}

export function ServiceHistoryModal({ services, isOpen, onClose, onSelectService }: ServiceHistoryModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<'All' | 'Completed' | 'Planned' | 'Cancelled'>('All');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const filteredServices = useMemo(() => {
    return services
      .filter(service => {
        const matchesSearch = (service.serviceTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (service.performerName || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        let matchesStatus = filterStatus === 'All';
        if (!matchesStatus) {
            if (filterStatus === 'Completed' && service.status === CareServiceStatus.Completed) matchesStatus = true;
            else if (filterStatus === 'Planned' && service.status === CareServiceStatus.Planned) matchesStatus = true;
            else if (filterStatus === 'Cancelled' && service.status === CareServiceStatus.Canceled) matchesStatus = true;
        }

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const dateA = new Date(a.performedAt || a.startTime || 0).getTime();
        const dateB = new Date(b.performedAt || b.startTime || 0).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
  }, [services, searchTerm, filterStatus, sortOrder]);

  const getStatusColor = (status: number) => {
    switch (status) {
      case CareServiceStatus.Completed: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case CareServiceStatus.Planned: return 'bg-blue-50 text-blue-600 border-blue-100';
      case CareServiceStatus.Canceled: return 'bg-rose-50 text-rose-600 border-rose-100';
      // case 'InProgress': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
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
      <DialogContent className="max-w-2xl md:max-w-4xl h-[85vh] flex flex-col p-0 rounded-[32px] overflow-hidden border-0 shadow-2xl bg-slate-50">
        
        {/* Header Section */}
        <div className="bg-white p-6 border-b border-gray-100 sticky top-0 z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <DialogTitle className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <CalendarRange size={20} />
                </div>
                تاریخچه خدمات
              </DialogTitle>
              <DialogDescription className="text-gray-500 mt-1 mr-14 text-sm">
                لیست تمام خدمات دریافت شده و برنامه‌ریزی شده
              </DialogDescription>
            </div>
            <button 
              onClick={onClose}
              className="md:hidden p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="جستجو در عنوان خدمت یا نام پرستار..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar items-center">
              <button
                 onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                 className="p-3 rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                 title="مرتب‌سازی بر اساس تاریخ"
              >
                  <ArrowUpDown size={16} className={sortOrder === 'asc' ? "rotate-180 transition-transform" : "transition-transform"} />
              </button>
              <div className="w-px h-6 bg-gray-200 mx-1"></div>
              {['All', 'Completed', 'Planned', 'Cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status as any)}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border",
                    filterStatus === status 
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20" 
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  )}
                >
                  {status === 'All' ? 'همه' : 
                   status === 'Completed' ? 'انجام شده' : 
                   status === 'Planned' ? 'برنامه‌ریزی شده' : 'لغو شده'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* List Section */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 bg-slate-50/50">
          {filteredServices.length > 0 ? (
            filteredServices.map((service) => (
              <div 
                key={service.id}
                onClick={() => onSelectService(service)}
                className="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs border shadow-sm", getStatusColor(service.status))}>
                      {service.status === 'Completed' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm md:text-base group-hover:text-indigo-600 transition-colors">{service.serviceTitle}</h4>
                      <span className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <User size={12} />
                        {service.performerName || 'نامشخص'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-left flex flex-col items-end gap-1">
                     <span className="text-xs font-bold text-gray-700 block">
                        {new DateObject({ date: new Date(service.performedAt || service.startTime || ''), calendar: persian, locale: persian_fa }).format("DD MMMM")}
                     </span>
                     <span className="text-[10px] text-gray-400 block bg-gray-50 px-2 py-0.5 rounded-md">
                        {new DateObject({ date: new Date(service.performedAt || service.startTime || ''), calendar: persian, locale: persian_fa }).format("HH:mm")}
                     </span>
                  </div>
                </div>
                
                {service.description && (
                   <p className="text-gray-500 text-xs leading-relaxed line-clamp-1 pr-1 border-r-2 border-gray-100 mr-13">
                     {service.description}
                   </p>
                )}

                <div className="flex justify-between items-center pt-3 border-t border-gray-50 mt-3">
                   <div className={cn("text-[10px] px-2 py-1 rounded-md border", getStatusColor(service.status))}>
                      {getStatusLabel(service.status)}
                   </div>
                   
                   <span className="text-indigo-500 text-xs font-bold flex items-center gap-1 group-hover:translate-x-[-4px] transition-transform">
                      مشاهده جزئیات
                      <ChevronLeft size={14} />
                   </span>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                <Filter size={24} />
              </div>
              <h3 className="text-gray-800 font-bold mb-1">نتیجه‌ای یافت نشد</h3>
              <p className="text-gray-500 text-sm">با تغییر فیلترها دوباره تلاش کنید</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
