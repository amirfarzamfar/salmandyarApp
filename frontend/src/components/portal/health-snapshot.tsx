"use client";

import { PortalCard } from "./ui/portal-card";
import { Activity, Heart, Thermometer, Droplet, RefreshCw } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";

// Smoother mock data
const generateData = (base: number, variance: number) => 
  Array.from({ length: 10 }, (_, i) => ({ value: base + Math.sin(i) * variance }));

const VitalCard = ({ title, value, unit, icon: Icon, color, trend, data, statusColor }: any) => (
  <PortalCard className="relative overflow-hidden group hover:shadow-soft-lg transition-all duration-500" noPadding>
    <div className="p-6 relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${color} bg-opacity-10 backdrop-blur-sm transition-colors group-hover:bg-opacity-20`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} strokeWidth={1.5} />
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColor} bg-opacity-10 text-opacity-100`}>
          {trend}
        </span>
      </div>
      
      <div className="space-y-1">
        <span className="text-sm font-medium text-gray-500 block">{title}</span>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-gray-800 tracking-tight">{value}</span>
          <span className="text-sm text-gray-400 font-medium">{unit}</span>
        </div>
      </div>
    </div>
    
    <div className="absolute bottom-0 left-0 right-0 h-24 opacity-20 group-hover:opacity-30 transition-opacity duration-500">
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

export function HealthSnapshot() {
  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-lg font-bold text-gray-800">وضعیت سلامت شما</h2>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <RefreshCw className="w-3 h-3" />
          <span>بروزرسانی: ۱۰ دقیقه پیش</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <VitalCard 
          title="فشار خون" 
          value="12/8" 
          unit="mmHg" 
          icon={Activity} 
          color="bg-blue-500" 
          statusColor="bg-green-500 text-green-700"
          trend="نرمال"
          data={generateData(120, 5)}
        />
        <VitalCard 
          title="ضربان قلب" 
          value="72" 
          unit="bpm" 
          icon={Heart} 
          color="bg-rose-500" 
          statusColor="bg-green-500 text-green-700"
          trend="عالی"
          data={generateData(72, 3)}
        />
        <VitalCard 
          title="اکسیژن خون" 
          value="98" 
          unit="%" 
          icon={Droplet} 
          color="bg-sky-500" 
          statusColor="bg-blue-500 text-blue-700"
          trend="پایدار"
          data={generateData(98, 1)}
        />
        <VitalCard 
          title="دما" 
          value="36.5" 
          unit="°C" 
          icon={Thermometer} 
          color="bg-orange-500" 
          statusColor="bg-green-500 text-green-700"
          trend="طبیعی"
          data={generateData(36.5, 0.2)}
        />
      </div>
    </div>
  );
}
