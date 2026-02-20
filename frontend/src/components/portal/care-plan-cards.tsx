"use client";

import { useEffect, useState } from "react";
import { PortalCard } from "./ui/portal-card";
import { CalendarDays, ChevronLeft, Clock, Stethoscope } from "lucide-react";
import { serviceReminderService } from "@/services/service-reminder.service";
import { nursePortalService } from "@/services/nurse-portal.service";
import { CareServiceStatus } from "@/types/service";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

interface PlannedItem {
  id: string;
  originalId: number;
  title: string;
  date: Date;
  type: 'service' | 'reminder';
  note?: string;
}

export function CarePlanCards({ patientId }: { patientId?: number }) {
  const [items, setItems] = useState<PlannedItem[]>([]);

  const fetchData = async () => {
    if (!patientId) return;
    try {
      const [services, reminders] = await Promise.all([
        nursePortalService.getPatientServices(patientId),
        serviceReminderService.getAll(patientId)
      ]);

      const now = new Date();

      const upcomingServices: PlannedItem[] = services
        .filter(s => s.status === CareServiceStatus.Planned && new Date(s.startTime || s.performedAt) > now)
        .map(s => ({
            id: `service-${s.id}`,
            originalId: s.id,
            title: s.serviceTitle,
            date: new Date(s.startTime || s.performedAt),
            type: 'service',
            note: s.description
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

  if (items.length === 0) {
      return (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-4">خدمات برنامه‌ریزی شده</h2>
          <div className="bg-white p-6 rounded-3xl border border-gray-100 text-center text-gray-500">
            هیچ خدمت برنامه‌ریزی شده‌ای یافت نشد.
          </div>
        </div>
      );
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-gray-800 mb-4">خدمات برنامه‌ریزی شده</h2>
      <div className="space-y-3">
        {items.map((item) => (
          <PortalCard key={item.id} className="flex items-center justify-between group hover:shadow-md transition-all cursor-pointer" noPadding>
            <div className="flex items-center gap-4 p-4 w-full">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${item.type === 'service' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-100' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'}`}>
                {item.type === 'service' ? <Stethoscope className="w-6 h-6" /> : <CalendarDays className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{item.title}</h3>
                <p className="text-sm text-gray-500">
                  {item.date.toLocaleDateString('fa-IR')} 
                  <span className="mx-2">•</span>
                  {item.date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                </p>
                {item.note && (
                    <p className="text-xs text-gray-400 mt-1 truncate max-w-[200px]">{item.note}</p>
                )}
              </div>
              <ChevronLeft className="w-5 h-5 text-gray-400 mr-auto" />
            </div>
          </PortalCard>
        ))}
      </div>
    </div>
  );
}
