"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, Calendar } from 'lucide-react';

interface VitalsChartProps {
  data: any[];
  type: 'bp' | 'pulse' | 'spo2' | 'temp';
}

export function VitalsChart({ data, type }: VitalsChartProps) {
  const getConfig = () => {
    switch(type) {
      case 'bp': return { color: '#ef4444', gradient: ['#fee2e2', '#ffffff'], label: 'فشار خون' };
      case 'pulse': return { color: '#10b981', gradient: ['#d1fae5', '#ffffff'], label: 'ضربان قلب' };
      case 'spo2': return { color: '#3b82f6', gradient: ['#dbeafe', '#ffffff'], label: 'اکسیژن خون' };
      default: return { color: '#8b5cf6', gradient: ['#ede9fe', '#ffffff'], label: 'دما' };
    }
  };

  const config = getConfig();

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-soft-lg border border-gray-100 text-xs">
          <p className="font-bold text-gray-700 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} style={{ color: entry.color }} className="font-black flex items-center gap-1">
              <span>{entry.name === 'systolic' ? 'سیستولیک' : entry.name === 'diastolic' ? 'دیاستولیک' : config.label}:</span>
              <span>{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-[2rem] p-4 border border-white/50 dark:border-gray-700 shadow-soft-sm"
    >
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg bg-${config.color === '#ef4444' ? 'rose' : config.color === '#10b981' ? 'emerald' : 'blue'}-50 text-${config.color === '#ef4444' ? 'rose' : config.color === '#10b981' ? 'emerald' : 'blue'}-500`}>
            <TrendingUp size={16} />
          </div>
          <span className="text-xs font-black text-gray-700 dark:text-gray-200">{config.label} (۷ روز گذشته)</span>
        </div>
      </div>

      <div className="h-[200px] w-full dir-ltr">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={`color${type}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={config.color} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={config.color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#9ca3af' }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#9ca3af' }} 
            />
            <Tooltip content={<CustomTooltip />} />
            {type === 'bp' ? (
              <>
                <Area 
                  type="monotone" 
                  dataKey="systolic" 
                  stroke={config.color} 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill={`url(#color${type})`} 
                />
                <Area 
                  type="monotone" 
                  dataKey="diastolic" 
                  stroke="#fbbf24" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorbp2)" 
                />
              </>
            ) : (
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={config.color} 
                strokeWidth={3}
                fillOpacity={1} 
                fill={`url(#color${type})`} 
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
