"use client";

import { Bell, User, HeartPulse } from "lucide-react";
import { useState, useEffect } from "react";
import { PortalNotification, portalService } from "@/services/portal-mock";
import { Skeleton } from "./ui/skeleton";

interface SmartHeaderProps {
  patientName: string;
}

export function SmartHeader({ patientName }: SmartHeaderProps) {
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("سلام");

  useEffect(() => {
    // Set time-based greeting
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting("صبح بخیر");
    else if (hour >= 12 && hour < 17) setGreeting("ظهر بخیر");
    else if (hour >= 17 && hour < 21) setGreeting("عصر بخیر");
    else setGreeting("شب بخیر");

    portalService.getNotifications().then((data) => {
      setNotifications(data);
      setLoading(false);
    });
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <header className="flex items-center justify-between py-6 mb-2">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="w-12 h-12 rounded-full" />
      </header>
    );
  }

  return (
    <header className="flex items-center justify-between py-6 mb-2">
      <div className="flex items-center gap-4">
        <div className="relative group">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-medical-100 to-medical-200 flex items-center justify-center overflow-hidden border-2 border-white shadow-soft-md transition-transform duration-300 group-hover:scale-105">
             <User className="w-8 h-8 text-medical-700" strokeWidth={1.5} />
          </div>
          <div className="absolute bottom-1 right-1 w-4 h-4 bg-calm-green-500 border-2 border-white rounded-full animate-pulse"></div>
        </div>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            {greeting}، {patientName}
          </h1>
          <div className="flex items-center gap-2 mt-1 px-3 py-1 bg-calm-green-50 rounded-full border border-calm-green-100 w-fit">
             <HeartPulse className="w-4 h-4 text-calm-green-600" />
             <p className="text-sm text-calm-green-700 font-medium">وضعیت: پایدار و عالی</p>
          </div>
        </div>
      </div>

      <button 
        className="relative p-3 rounded-2xl bg-white shadow-soft-sm hover:shadow-soft-md hover:bg-medical-50 transition-all duration-300 group"
        aria-label="اعلان‌ها"
      >
        <Bell className="w-6 h-6 text-gray-400 group-hover:text-medical-600 transition-colors" strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </button>
    </header>
  );
}
