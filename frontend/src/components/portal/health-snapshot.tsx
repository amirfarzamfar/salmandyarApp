"use client";

import { PortalCard } from "./ui/portal-card";
import { Activity, Heart, Thermometer, Droplet, RefreshCw } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { patientService } from "@/services/patient.service";
import { formatDistanceToNow } from "date-fns";
import { faIR } from "date-fns/locale";

// Helper to generate chart data from history
const getChartData = (vitals: any[], key: string, limit = 10) => {
  if (!vitals || vitals.length === 0) return Array(10).fill({ value: 0 });
  
  // Sort by date ascending
  const sorted = [...vitals].sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
  // Take last N
  const slice = sorted.slice(-limit);
  
  return slice.map(v => ({ value: v[key] }));
};

const VitalCard = ({ title, value, unit, icon: Icon, color, trend, data, statusColor }: any) => (
  <PortalCard className="relative overflow-hidden group hover:shadow-soft-lg transition-all duration-500" noPadding>
    <div className="p-4 md:p-6 relative z-10">
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div className={`p-2 md:p-3 rounded-2xl ${color} bg-opacity-10 backdrop-blur-sm transition-colors group-hover:bg-opacity-20`}>
          <Icon className={`w-5 h-5 md:w-6 md:h-6 ${color.replace('bg-', 'text-')}`} strokeWidth={1.5} />
        </div>
        <span className={`text-[10px] md:text-xs font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full ${statusColor} bg-opacity-10 text-opacity-100`}>
          {trend}
        </span>
      </div>
      
      <div className="space-y-0.5 md:space-y-1">
        <span className="text-xs md:text-sm font-medium text-gray-500 block">{title}</span>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">{value}</span>
          <span className="text-xs md:text-sm text-gray-400 font-medium">{unit}</span>
        </div>
      </div>
    </div>
    
    <div className="absolute bottom-0 left-0 right-0 h-16 md:h-24 opacity-20 group-hover:opacity-30 transition-opacity duration-500">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="currentColor" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="currentColor" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="currentColor" 
            fill={`url(#gradient-${title})`} 
            className={`${color.replace('bg-', 'text-')}`}
            strokeWidth={3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </PortalCard>
);

interface HealthSnapshotProps {
  patientId: number;
}

export function HealthSnapshot({ patientId }: HealthSnapshotProps) {
  const { data: vitals, isLoading } = useQuery({
    queryKey: ["vitals", patientId],
    queryFn: () => patientService.getVitals(patientId),
  });

  if (isLoading) {
    return (
      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between px-2">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 md:h-40 bg-gray-100 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  // Get latest vital sign
  const latestVital = vitals && vitals.length > 0 
    ? [...vitals].sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())[0]
    : null;

  const lastUpdate = latestVital 
    ? formatDistanceToNow(new Date(latestVital.recordedAt), { addSuffix: true, locale: faIR })
    : "نامشخص";

  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-base md:text-lg font-bold text-gray-800">وضعیت سلامت شما</h2>
        <div className="flex items-center gap-1 text-[10px] md:text-xs text-gray-400">
          <RefreshCw className="w-3 h-3" />
          <span>بروزرسانی: {lastUpdate}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <VitalCard 
          title="فشار خون" 
          value={latestVital ? `${latestVital.systolicBloodPressure}/${latestVital.diastolicBloodPressure}` : "--/--"} 
          unit="mmHg" 
          icon={Activity} 
          color="bg-blue-500" 
          statusColor="bg-green-500 text-green-700"
          trend="نرمال"
          data={getChartData(vitals || [], "systolicBloodPressure")}
        />
        <VitalCard 
          title="ضربان قلب" 
          value={latestVital ? latestVital.pulseRate : "--"} 
          unit="bpm" 
          icon={Heart} 
          color="bg-rose-500" 
          statusColor="bg-green-500 text-green-700"
          trend="عالی"
          data={getChartData(vitals || [], "pulseRate")}
        />
        <VitalCard 
          title="اکسیژن خون" 
          value={latestVital ? latestVital.oxygenSaturation : "--"} 
          unit="%" 
          icon={Droplet} 
          color="bg-sky-500" 
          statusColor="bg-blue-500 text-blue-700"
          trend="پایدار"
          data={getChartData(vitals || [], "oxygenSaturation")}
        />
        <VitalCard 
          title="دما" 
          value={latestVital ? latestVital.bodyTemperature : "--"} 
          unit="°C" 
          icon={Thermometer} 
          color="bg-orange-500" 
          statusColor="bg-green-500 text-green-700"
          trend="طبیعی"
          data={getChartData(vitals || [], "bodyTemperature")}
        />
      </div>
    </div>
  );
}
