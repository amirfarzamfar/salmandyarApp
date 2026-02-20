"use client";

import { useEffect, useState } from "react";
import { PortalCard } from "./ui/portal-card";
import { CalendarDays, ChevronLeft, Clock, Stethoscope, History } from "lucide-react";
import { serviceReminderService } from "@/services/service-reminder.service";
import { nursePortalService } from "@/services/nurse-portal.service";
import { CareServiceStatus, CareService } from "@/types/patient";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { ServiceDetailModal } from "./service-detail-modal";
import { ServiceHistoryModal } from "./service-history-modal";

interface PlannedItem {
  id: string;
  originalId: number;
  title: string;
  date: Date;
  type: 'service' | 'reminder';
  note?: string;
  data?: CareService; // Store original object for details
}

export function CarePlanCards({ patientId }: { patientId?: number }) {
  const [items, setItems] = useState<PlannedItem[]>([]);
  const [allServices, setAllServices] = useState<CareService[]>([]);
  
  // Modal States
  const [selectedService, setSelectedService] = useState<CareService | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const fetchData = async () => {
    if (!patientId) return;
    try {
      const [services, reminders] = await Promise.all([
        nursePortalService.getPatientServices(patientId),
        serviceReminderService.getAll(patientId)
      ]);

      setAllServices(services);

      const now = new Date();

      const upcomingServices: PlannedItem[] = services
        .filter(s => s.status === CareServiceStatus.Planned && new Date(s.startTime || s.performedAt) > now)
        .map(s => ({
            id: `service-${s.id}`,
            originalId: s.id,
            title: s.serviceTitle,
            date: new Date(s.startTime || s.performedAt),
            type: 'service',
            note: s.description,
            data: s
        }));

      const upcomingReminders: PlannedItem[] = reminders
        .filter(r => new Date(r.scheduledTime) > now)
        .map(r => ({
            id: `reminder-${r.id}`,
            originalId: r.id,
            title: r.serviceTitle,
            date: new Date(r.scheduledTime),
            type: 'reminder',
            note: r.note
        }));
      
      const allItems = [...upcomingServices, ...upcomingReminders]
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(0, 5); // Show top 5 upcoming
      
      setItems(allItems);
    } catch (error) {
      console.error("Failed to fetch planned items", error);
    }
  };

  useEffect(() => {
    if (!patientId) return;

    fetchData();

    const connection = new HubConnectionBuilder()
      .withUrl("http://localhost:5016/serviceHub")
      .configureLogging(LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    const startConnection = async () => {
      try {
        await connection.start();
        console.log("Connected to ServiceHub");
        await connection.invoke("JoinPatientGroup", patientId.toString());
        
        connection.on("ReceiveServiceUpdate", () => {
            console.log("Received service update, refreshing...");
            fetchData();
        });

      } catch (err) {
        console.error("SignalR Connection Error: ", err);
        setTimeout(startConnection, 5000);
      }
    };

    startConnection();

    return () => {
      connection.stop();
    };
  }, [patientId]);

  const handleItemClick = (item: PlannedItem) => {
    if (item.type === 'service' && item.data) {
        setSelectedService(item.data);
        setIsDetailModalOpen(true);
    }
    // TODO: Handle reminder details if needed
  };

  return (
    <div className="mb-8 relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <CalendarDays size={18} />
            </div>
            خدمات برنامه‌ریزی شده
        </h2>
        
        <button 
            onClick={() => setIsHistoryModalOpen(true)}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
        >
            <History size={14} />
            تاریخچه خدمات
        </button>
      </div>

      {items.length === 0 ? (
          <div className="bg-white p-6 rounded-3xl border border-dashed border-gray-200 text-center text-gray-500 flex flex-col items-center justify-center min-h-[150px]">
            <CalendarDays className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-sm">هیچ خدمت برنامه‌ریزی شده‌ای یافت نشد.</p>
          </div>
      ) : (
        <div className="space-y-3">
            {items.map((item) => (
            <PortalCard 
                key={item.id} 
                className="flex items-center justify-between group hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-indigo-100" 
                noPadding
                onClick={() => handleItemClick(item)}
            >
                <div className="flex items-center gap-4 p-4 w-full">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-sm ${item.type === 'service' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-100' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'}`}>
                    {item.type === 'service' ? <Stethoscope className="w-6 h-6" /> : <CalendarDays className="w-6 h-6" />}
                </div>
                <div>
                    <h3 className="font-bold text-gray-800 text-sm md:text-base group-hover:text-indigo-600 transition-colors">{item.title}</h3>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                            {item.date.toLocaleDateString('fa-IR')} 
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                            {item.date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </p>
                    {item.note && (
                        <p className="text-[10px] text-gray-400 mt-1 truncate max-w-[200px] border-r-2 border-gray-200 pr-1 mr-1">{item.note}</p>
                    )}
                </div>
                <div className="mr-auto bg-gray-50 p-1.5 rounded-full group-hover:bg-indigo-50 transition-colors">
                    <ChevronLeft className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                </div>
                </div>
            </PortalCard>
            ))}
        </div>
      )}

      {/* Modals */}
      <ServiceDetailModal 
        service={selectedService}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />

      <ServiceHistoryModal
        services={allServices}
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onSelectService={(service) => {
            setSelectedService(service);
            setIsDetailModalOpen(true);
            // Optional: Close history modal? 
            // setIsHistoryModalOpen(false); 
        }}
      />
    </div>
  );
}
