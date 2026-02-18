"use client";

import { useEffect, useState } from "react";
import { PortalCard } from "./ui/portal-card";
import { CalendarDays, ChevronLeft } from "lucide-react";
import { serviceReminderService, ServiceReminder } from "@/services/service-reminder.service";
import { HubConnectionBuilder, LogLevel, HubConnection } from "@microsoft/signalr";

export function CarePlanCards({ patientId }: { patientId?: number }) {
  const [reminders, setReminders] = useState<ServiceReminder[]>([]);

  const fetchReminders = async () => {
    if (!patientId) return;
    try {
      const data = await serviceReminderService.getAll(patientId);
      // Filter for upcoming reminders (scheduled time > now)
      const now = new Date();
      const upcoming = data.filter(r => new Date(r.scheduledTime) > now);
      // Sort by date ascending (closest first)
      upcoming.sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());
      
      setReminders(upcoming.slice(0, 5)); // Show top 5 upcoming
    } catch (error) {
      console.error("Failed to fetch reminders", error);
    }
  };

  useEffect(() => {
    if (!patientId) return;

    fetchReminders();

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
            fetchReminders();
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

  if (reminders.length === 0) {
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
        {reminders.map((reminder) => (
          <PortalCard key={reminder.id} className="flex items-center justify-between group hover:shadow-md transition-all cursor-pointer" noPadding>
            <div className="flex items-center gap-4 p-4 w-full">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{reminder.serviceTitle}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(reminder.scheduledTime).toLocaleDateString('fa-IR')} 
                  <span className="mx-2">•</span>
                  {new Date(reminder.scheduledTime).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                </p>
                {reminder.note && (
                    <p className="text-xs text-gray-400 mt-1 truncate max-w-[200px]">{reminder.note}</p>
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
