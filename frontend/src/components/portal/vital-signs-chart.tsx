"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { patientService } from "@/services/patient.service";
import { PortalCard } from "./ui/portal-card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { Activity, Heart, Thermometer, Droplet, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

interface VitalSignsChartProps {
  patientId: number;
}

const metrics = [
  { 
    id: "bp", 
    label: "فشار خون", 
    unit: "mmHg", 
    icon: Activity, 
    color: "#3b82f6", // blue-500
    gradient: "from-blue-500/20 to-blue-500/0"
  },
  { 
    id: "hr", 
    label: "ضربان", 
    unit: "bpm", 
    icon: Heart, 
    color: "#ef4444", // red-500
    gradient: "from-red-500/20 to-red-500/0"
  },
  { 
    id: "o2", 
    label: "اکسیژن", 
    unit: "%", 
    icon: Droplet, 
    color: "#0ea5e9", // sky-500
    gradient: "from-sky-500/20 to-sky-500/0"
  },
  { 
    id: "temp", 
    label: "دما", 
    unit: "°C", 
    icon: Thermometer, 
    color: "#f97316", // orange-500
    gradient: "from-orange-500/20 to-orange-500/0"
  },
  {
    id: "gcs",
    label: "هوشیاری",
    unit: "GCS",
    icon: Brain,
    color: "#8b5cf6", // violet-500
    gradient: "from-violet-500/20 to-violet-500/0"
  }
];

export function VitalSignsChart({ patientId }: VitalSignsChartProps) {
  const [activeMetric, setActiveMetric] = useState("bp");

  const { data: vitals, isLoading } = useQuery({
    queryKey: ["vitals", patientId],
    queryFn: () => patientService.getVitals(patientId),
  });

  if (isLoading) {
    return (
      <PortalCard className="h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-600"></div>
      </PortalCard>
    );
  }

  if (!vitals || vitals.length === 0) {
    return (
      <PortalCard className="h-[400px] flex items-center justify-center text-gray-400">
        اطلاعاتی برای نمایش وجود ندارد
      </PortalCard>
    );
  }

  // Process data for chart
  // Sort by date ascending
  const sortedVitals = [...vitals].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );

  const chartData = sortedVitals.map((v) => ({
    date: new DateObject({ date: new Date(v.recordedAt), calendar: persian, locale: persian_fa }).format("YYYY/MM/DD HH:mm"),
    systolic: v.systolicBloodPressure,
    diastolic: v.diastolicBloodPressure,
    hr: v.pulseRate,
    o2: v.oxygenSaturation,
    temp: v.bodyTemperature,
    gcs: v.glasgowComaScale || 15,
  }));

  const renderChart = () => {
    switch (activeMetric) {
      case "bp":
        return (
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSystolic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorDiastolic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#93c5fd" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#93c5fd" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} width={30} />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Area 
              type="monotone" 
              dataKey="systolic" 
              name="سیستولیک" 
              stroke="#3b82f6" 
              fillOpacity={1} 
              fill="url(#colorSystolic)" 
            />
            <Area 
              type="monotone" 
              dataKey="diastolic" 
              name="دیاستولیک" 
              stroke="#93c5fd" 
              fillOpacity={1} 
              fill="url(#colorDiastolic)" 
            />
          </AreaChart>
        );
      
      case "hr":
        return (
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} width={30} />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
            <Area type="monotone" dataKey="hr" name="ضربان قلب" stroke="#ef4444" fill="url(#colorHr)" />
          </AreaChart>
        );

      case "o2":
        return (
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorO2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
            <YAxis domain={[80, 100]} tick={{ fontSize: 12 }} width={30} />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
            <Area type="monotone" dataKey="o2" name="اکسیژن خون" stroke="#0ea5e9" fill="url(#colorO2)" />
          </AreaChart>
        );

      case "temp":
        return (
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} width={30} />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
            <Area type="monotone" dataKey="temp" name="دما" stroke="#f97316" fill="url(#colorTemp)" />
          </AreaChart>
        );

      case "gcs":
        return (
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
             <defs>
              <linearGradient id="colorGcs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
            <YAxis domain={[3, 15]} tick={{ fontSize: 12 }} width={30} />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
            <Area type="monotone" dataKey="gcs" name="سطح هوشیاری" stroke="#8b5cf6" fill="url(#colorGcs)" />
          </AreaChart>
        );
      
      default:
        return null;
    }
  };

  return (
    <PortalCard className="p-4 md:p-6 h-full flex flex-col">
      <div className="flex flex-col gap-4 mb-4">
        <h3 className="text-base md:text-lg font-bold text-gray-800">نمودار تغییرات علائم حیاتی</h3>
        
        {/* Mobile-first scrollable tabs */}
        <div className="flex overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 gap-2 no-scrollbar snap-x">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            const isActive = activeMetric === metric.id;
            return (
              <button
                key={metric.id}
                onClick={() => setActiveMetric(metric.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-xs md:text-sm font-medium transition-all whitespace-nowrap snap-start border",
                  isActive
                    ? "bg-gray-800 text-white border-gray-800 shadow-md transform scale-105"
                    : "bg-white text-gray-500 border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                )}
              >
                <Icon size={16} className={isActive ? "text-white" : `text-[${metric.color}]`} />
                {metric.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-[250px] md:h-[300px] w-full -ml-2 md:ml-0">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart() || <div />}
        </ResponsiveContainer>
      </div>
    </PortalCard>
  );
}
