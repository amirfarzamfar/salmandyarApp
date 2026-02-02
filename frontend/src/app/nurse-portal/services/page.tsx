"use client";

import { useState, useEffect } from "react";
import { PortalCard } from "@/components/portal/ui/portal-card";
import { CalendarDays, Clock, User, CheckCircle2, Timer, ChevronLeft, Loader2, Plus, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { nursePortalService } from "@/services/nurse-portal.service";
import { CareService } from "@/types/patient";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";

export default function NurseServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    const fetchAllServices = async () => {
      try {
        setIsLoading(true);
        const patients = await nursePortalService.getMyPatients();
        const allServices: any[] = [];
        
        for (const patient of patients) {
          const patientServices = await nursePortalService.getPatientServices(patient.id);
          allServices.push(...patientServices.map(s => ({
            ...s,
            patientName: `${patient.firstName} ${patient.lastName}`,
            patientId: patient.id,
            address: "سعادت آباد، خ سرو" // Mock address for cross-patient view
          })));
        }
        
        // Sort by time
        allServices.sort((a, b) => {
          const timeA = a.startTime || "00:00";
          const timeB = b.startTime || "00:00";
          return timeA.localeCompare(timeB);
        });
        
        setServices(allServices);
      } catch (error) {
        console.error(error);
        toast.error("خطا در دریافت لیست خدمات");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllServices();
  }, []);

  const filteredServices = services.filter(s => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return s.status !== 'Completed';
    if (activeTab === 'completed') return s.status === 'Completed';
    return true;
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <div className="space-y-8 px-4 md:px-0">
      <header className="flex justify-between items-center pt-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">برنامه مراقبتی</h1>
          <p className="text-sm font-medium text-gray-400 mt-1">زمان‌بندی خدمات امروز</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white shadow-soft-md flex items-center justify-center text-medical-600 border border-gray-50">
          <CalendarDays className="w-6 h-6" />
        </div>
      </header>

      {/* Premium Filter Tabs */}
      <div className="flex bg-neutral-warm-50 p-1.5 rounded-[1.5rem] border border-gray-100">
        {[
          { id: 'all', label: 'همه' },
          { id: 'pending', label: 'در انتظار' },
          { id: 'completed', label: 'انجام شده' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex-1 py-3.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300",
              activeTab === tab.id 
                ? "bg-white text-medical-600 shadow-soft-sm scale-[1.02]" 
                : "text-gray-400 hover:text-gray-600"
            )}
          >
            {tab.label}
          </button>
        ))}
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
            <p className="text-sm font-black">در حال بارگذاری برنامه...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-20 bg-white/50 backdrop-blur-md rounded-[2.5rem] border border-dashed border-gray-200">
            <CalendarDays className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-black text-gray-800 mb-1">خدمتی یافت نشد</h3>
            <p className="text-sm text-gray-400 font-medium">برنامه شما برای این بخش خالی است.</p>
          </div>
        ) : (
          filteredServices.map((service, index) => (
            <motion.div key={service.id} variants={item}>
              <PortalCard className="bg-white border-none shadow-soft-lg hover:shadow-soft-xl transition-all duration-300 overflow-hidden group" noPadding>
                <div className="flex">
                  {/* Left Time Bar */}
                  <div className={cn(
                    "w-20 flex flex-col items-center justify-center border-l border-gray-50",
                    service.status === 'Completed' ? "bg-calm-green-50/30" : "bg-medical-50/30"
                  )}>
                    <Clock className={cn("w-5 h-5 mb-1", service.status === 'Completed' ? "text-calm-green-500" : "text-medical-500")} />
                    <span className="text-sm font-black text-gray-800">{service.startTime || "۰۸:۰۰"}</span>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className={cn(
                          "text-lg font-black transition-all",
                          service.status === 'Completed' ? "text-gray-400 line-through" : "text-gray-800"
                        )}>
                          {service.serviceTitle || service.description}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                            <User className="w-3 h-3 text-gray-400" />
                          </div>
                          <span className="text-xs font-bold text-gray-500">{service.patientName}</span>
                        </div>
                      </div>
                      <div className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500",
                        service.status === 'Completed' 
                          ? "bg-calm-green-500 text-white shadow-glow-medical" 
                          : "bg-medical-50 text-medical-600"
                      )}>
                        {service.status === 'Completed' ? <CheckCircle2 className="w-5 h-5" /> : <Timer className="w-5 h-5" />}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{service.address}</span>
                      </div>
                    </div>
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
