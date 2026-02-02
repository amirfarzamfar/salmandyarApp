"use client";

import { useState, useEffect } from "react";
import { PortalCard } from "@/components/portal/ui/portal-card";
import { Search, User, ChevronLeft, MapPin, Activity, Heart, Calendar, Loader2, AlertCircle, Bell, Filter, Plus, FileText, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { nursePortalService } from "@/services/nurse-portal.service";
import { PatientList } from "@/types/patient";
import { toast } from "react-hot-toast";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

export default function NursePortalPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<'all' | 'stable' | 'critical' | 'attention'>('all');
  const [patients, setPatients] = useState<PatientList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    tasks: 12 // Mock
  });

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setIsLoading(true);
        const data = await nursePortalService.getMyPatients();
        setPatients(data);
        setStats(prev => ({
          ...prev,
          total: data.length,
          critical: data.filter(p => p.currentStatus !== 'Stable').length
        }));
      } catch (error) {
        console.error(error);
        toast.error("خطا در دریافت لیست بیماران");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(p => {
    const matchesSearch = `${p.firstName} ${p.lastName}`.includes(searchTerm) || p.primaryDiagnosis.includes(searchTerm);
    const matchesFilter = 
      activeFilter === 'all' ? true :
      activeFilter === 'stable' ? p.currentStatus === 'Stable' :
      activeFilter === 'critical' ? p.currentStatus !== 'Stable' : true;
    
    return matchesSearch && matchesFilter;
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "صبح بخیر";
    if (hour < 18) return "عصر بخیر";
    return "شب بخیر";
  };

  return (
    <div className="space-y-6 px-4 md:px-0 pb-24">
      {/* Header Section */}
      <header className="flex justify-between items-start pt-6">
        <div>
          <div className="flex items-center gap-2 text-medical-600 dark:text-medical-400 text-sm font-bold mb-1">
            <span className="w-2 h-2 rounded-full bg-medical-500 animate-pulse" />
            <span>{getTimeGreeting()}، پرستار مریم</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">داشبورد مراقبت</h1>
        </div>
        <div className="flex gap-3 items-center">
          <ThemeToggle />
          <button className="relative w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-soft-sm flex items-center justify-center text-gray-400 dark:text-gray-500 hover:text-medical-600 dark:hover:text-medical-400 transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-rose-500 border-2 border-white dark:border-gray-800" />
          </button>
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-medical-500 to-medical-600 flex items-center justify-center text-white font-black shadow-glow-medical">
            M
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-medical-500 text-white p-4 rounded-[1.5rem] shadow-glow-medical relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="text-3xl font-black mb-1">{stats.total}</div>
            <div className="text-[10px] font-bold opacity-80 uppercase tracking-wider">کل بیماران</div>
          </div>
          <User className="absolute bottom-3 left-3 w-8 h-8 text-white/20" />
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-[1.5rem] shadow-soft-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
          <div className="text-3xl font-black text-rose-500 mb-1">{stats.critical}</div>
          <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">وضعیت حساس</div>
          <Activity className="absolute bottom-3 left-3 w-8 h-8 text-rose-500/10" />
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-[1.5rem] shadow-soft-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
          <div className="text-3xl font-black text-amber-500 mb-1">{stats.tasks}</div>
          <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">وظایف امروز</div>
          <Calendar className="absolute bottom-3 left-3 w-8 h-8 text-amber-500/10" />
        </div>
      </div>

      {/* Search & Filter */}
      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pr-12 pl-12 py-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[1.5rem] shadow-soft-sm focus:ring-2 focus:ring-medical-200 dark:focus:ring-medical-800 focus:border-medical-300 transition-all text-gray-700 dark:text-gray-200 placeholder-gray-400 font-bold text-sm"
            placeholder="جستجوی نام بیمار، کد پرونده..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-2 flex items-center">
            <button className="p-2 bg-medical-50 dark:bg-medical-900/20 rounded-xl text-medical-600 dark:text-medical-400 hover:bg-medical-100 dark:hover:bg-medical-900/40 transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'all', label: 'همه بیماران' },
            { id: 'stable', label: 'وضعیت پایدار' },
            { id: 'critical', label: 'نیازمند توجه' },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id as any)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all",
                activeFilter === filter.id
                  ? "bg-gray-800 dark:bg-white text-white dark:text-gray-900 shadow-lg scale-[1.02]"
                  : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-black text-gray-800 dark:text-gray-100 mb-3 px-1">دسترسی سریع</h3>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/nurse-portal/reports" className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-[1.5rem] border border-blue-100 dark:border-blue-800/30 group">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-blue-900/30 flex items-center justify-center text-blue-500 shadow-sm group-hover:scale-110 transition-transform">
              <FileText size={20} />
            </div>
            <div>
              <div className="text-sm font-black text-gray-800 dark:text-gray-200">گزارش‌نویسی</div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 font-bold">ثبت گزارش جدید</div>
            </div>
          </Link>
          <button className="flex items-center gap-3 p-4 bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-900/20 dark:to-rose-800/10 rounded-[1.5rem] border border-rose-100 dark:border-rose-800/30 group">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-rose-900/30 flex items-center justify-center text-rose-500 shadow-sm group-hover:scale-110 transition-transform">
              <Phone size={20} />
            </div>
            <div>
              <div className="text-sm font-black text-gray-800 dark:text-gray-200">تماس فوری</div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 font-bold">با سوپروایزر</div>
            </div>
          </button>
        </div>
      </div>

      {/* Patient List */}
      <div>
        <div className="flex justify-between items-end mb-4 px-1">
          <h3 className="text-sm font-black text-gray-800 dark:text-gray-100">لیست بیماران</h3>
          <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-lg">
            {filteredPatients.length} پرونده
          </span>
        </div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
              <Loader2 className="w-10 h-10 animate-spin mb-4 text-medical-500" />
              <p className="text-sm font-black">در حال دریافت لیست بیماران...</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-700">
              <User className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <h3 className="text-sm font-black text-gray-600 dark:text-gray-400">بیماری یافت نشد</h3>
            </div>
          ) : (
            filteredPatients.map((patient) => (
              <motion.div key={patient.id} variants={item}>
                <Link href={`/nurse-portal/patient/${patient.id}`}>
                  <PortalCard 
                    className="group relative overflow-hidden border-none bg-white dark:bg-gray-800 shadow-soft-sm hover:shadow-soft-lg dark:shadow-none dark:border dark:border-gray-700 transition-all duration-300 active:scale-[0.98]"
                    noPadding
                  >
                    {/* Status Strip */}
                    <div className={cn(
                      "absolute top-0 right-0 w-1.5 h-full transition-colors",
                      patient.currentStatus === 'Stable' ? 'bg-emerald-400' : 'bg-rose-400'
                    )} />

                    <div className="p-5 pl-4">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-[1.2rem] bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:bg-medical-50 dark:group-hover:bg-medical-900/20 group-hover:text-medical-600 dark:group-hover:text-medical-400 transition-colors border border-gray-100 dark:border-gray-600">
                            <User className="w-6 h-6" />
                          </div>
                          {patient.currentStatus !== 'Stable' && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                            </span>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className="text-lg font-black text-gray-800 dark:text-gray-100 truncate group-hover:text-medical-600 dark:group-hover:text-medical-400 transition-colors">
                              {patient.firstName} {patient.lastName}
                            </h3>
                            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-lg">
                              {patient.age} ساله
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={cn(
                              "text-[10px] font-black px-2 py-0.5 rounded-md",
                              patient.currentStatus === 'Stable' 
                                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" 
                                : "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400"
                            )}>
                              {patient.currentStatus === 'Stable' ? 'پایدار' : 'نیازمند توجه'}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate font-medium">
                              {patient.primaryDiagnosis}
                            </span>
                          </div>
                        </div>

                        <ChevronLeft className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-medical-500 dark:group-hover:text-medical-400 transition-colors" />
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-700/50 flex justify-between items-center">
                        <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500">
                          <Clock size={12} />
                          <span className="text-[10px] font-bold">آخرین ویزیت: امروز ۰۹:۳۰</span>
                        </div>
                        <div className="flex -space-x-2 space-x-reverse">
                          {/* Mock Indicators for medications/tasks */}
                          <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-900/20 border-2 border-white dark:border-gray-800 flex items-center justify-center text-[10px] font-bold text-blue-500">
                            2
                          </div>
                          <div className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border-2 border-white dark:border-gray-800 flex items-center justify-center text-[10px] font-bold text-emerald-500">
                            <Check size={10} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </PortalCard>
                </Link>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
}

// Helper icons
import { Clock, Check } from "lucide-react";
