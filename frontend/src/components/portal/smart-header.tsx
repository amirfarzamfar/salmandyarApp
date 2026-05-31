"use client";

import { User, HeartPulse } from "lucide-react";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";

interface SmartHeaderProps {
  patientName: string;
  onAvatarClick?: () => void;
}

export function SmartHeader({ patientName, onAvatarClick }: SmartHeaderProps) {
  const hour = new Date().getHours();
  const greeting =
    hour >= 5 && hour < 12
      ? "صبح بخیر"
      : hour >= 12 && hour < 17
        ? "ظهر بخیر"
        : hour >= 17 && hour < 21
          ? "عصر بخیر"
          : "شب بخیر";

  return (
    <header className="relative z-10 mb-2 flex items-start justify-between gap-3 py-4 sm:items-center sm:py-6">
      <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
        <div 
            className="relative group cursor-pointer" 
            onClick={onAvatarClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    onAvatarClick?.();
                }
            }}
        >
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-gradient-to-br from-medical-100 to-medical-200 shadow-soft-md transition-transform duration-300 group-active:scale-95 group-hover:scale-105 sm:h-16 sm:w-16">
             <User className="h-7 w-7 text-medical-700 sm:h-8 sm:w-8" strokeWidth={1.5} />
          </div>
          <div className="absolute bottom-1 right-1 w-4 h-4 bg-calm-green-500 border-2 border-white rounded-full animate-pulse"></div>
          <div className="absolute inset-0 rounded-full ring-2 ring-medical-400 ring-offset-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        </div>
        
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold tracking-tight text-gray-800 sm:text-2xl">
            {greeting}، {patientName}
          </h1>
          <div className="mt-1 flex w-fit items-center gap-2 rounded-full border border-calm-green-100 bg-calm-green-50 px-3 py-1">
             <HeartPulse className="w-4 h-4 text-calm-green-600" />
             <p className="text-xs font-medium text-calm-green-700 sm:text-sm">وضعیت: پایدار و عالی</p>
          </div>
        </div>
      </div>

      <div className="shrink-0 self-start sm:self-auto">
        <NotificationCenter appearance="portal" />
      </div>
    </header>
  );
}
