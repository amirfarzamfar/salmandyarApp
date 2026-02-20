import { NursingReport } from "@/types/patient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, Filter, CalendarDays, Clock, FileText, ChevronLeft, CalendarRange } from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface NursingReportsListModalProps {
  reports: NursingReport[];
  isOpen: boolean;
  onClose: () => void;
  onSelectReport: (report: NursingReport) => void;
}

export function NursingReportsListModal({ reports, isOpen, onClose, onSelectReport }: NursingReportsListModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterShift, setFilterShift] = useState<'All' | 'Morning' | 'Evening' | 'Night'>('All');

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesSearch = report.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (report.authorName || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesShift = filterShift === 'All' || report.shift === filterShift;
      return matchesSearch && matchesShift;
    });
  }, [reports, searchTerm, filterShift]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl md:max-w-4xl h-[85vh] flex flex-col p-0 rounded-3xl overflow-hidden border-0 shadow-2xl bg-slate-50">
        
        {/* Header Section */}
        <div className="bg-white p-6 border-b border-gray-100 sticky top-0 z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <DialogTitle className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 bg-medical-50 text-medical-600 rounded-xl flex items-center justify-center">
                  <CalendarRange size={20} />
                </div>
                تاریخچه گزارش‌های پرستاری
              </DialogTitle>
              <DialogDescription className="text-gray-500 mt-1 mr-14 text-sm">
                مشاهده تمام گزارش‌های ثبت شده در پرونده
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
                placeholder="جستجو در متن گزارش یا نام پرستار..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medical-500/20 focus:border-medical-500 transition-all"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              {['All', 'Morning', 'Evening', 'Night'].map((shift) => (
                <button
                  key={shift}
                  onClick={() => setFilterShift(shift as any)}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border",
                    filterShift === shift 
                      ? "bg-medical-600 text-white border-medical-600 shadow-md shadow-medical-500/20" 
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  )}
                >
                  {shift === 'All' ? 'همه شیفت‌ها' : 
                   shift === 'Morning' ? 'شیفت صبح' : 
                   shift === 'Evening' ? 'شیفت عصر' : 'شیفت شب'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* List Section */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50/50">
          {filteredReports.length > 0 ? (
            filteredReports.map((report) => (
              <div 
                key={report.id}
                onClick={() => onSelectReport(report)}
                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-medical-200 transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-1 h-full bg-medical-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs border-2 border-white shadow-sm">
                      {(report.authorName || 'P').charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm">{report.authorName || 'پرستار'}</h4>
                      <span className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Clock size={10} />
                        {new Date(report.createdAt).toLocaleTimeString('fa-IR', {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                  <div className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-bold border",
                    report.shift === 'Morning' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                    report.shift === 'Evening' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                    'bg-indigo-50 text-indigo-600 border-indigo-100'
                  )}>
                    {report.shift === 'Morning' ? 'صبح' : report.shift === 'Evening' ? 'عصر' : 'شب'}
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-3 pr-2 border-r-2 border-gray-100 pl-4">
                  {report.content}
                </p>

                <div className="flex justify-between items-center pt-3 border-t border-gray-50 mt-2">
                   <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                      <CalendarDays size={12} />
                      {new Date(report.createdAt).toLocaleDateString('fa-IR', {weekday: 'long', day: 'numeric', month: 'long'})}
                   </span>
                   <span className="text-medical-600 text-xs font-bold flex items-center gap-1 group-hover:translate-x-[-4px] transition-transform">
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
