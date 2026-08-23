'use client';

import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart,
} from 'recharts';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { DemoChartPoint } from './demo-data';

type MetricKey = 'heartRate' | 'bp' | 'spo2' | 'temperature';

const metricOptions: { key: MetricKey; label: string; color: string; unit: string }[] = [
  { key: 'heartRate', label: 'ضربان قلب', color: '#f43f5e', unit: 'BPM' },
  { key: 'bp', label: 'فشار خون', color: '#3b82f6', unit: 'mmHg' },
  { key: 'spo2', label: 'اکسیژن', color: '#14b8a6', unit: '%' },
  { key: 'temperature', label: 'دما', color: '#f59e0b', unit: '°C' },
];

interface Props {
  data: DemoChartPoint[];
}

export function DemoHealthChart({ data }: Props) {
  const [activeMetric, setActiveMetric] = useState<MetricKey>('heartRate');

  const renderChart = () => {
    switch (activeMetric) {
      case 'heartRate':
        return (
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis domain={[60, 90]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12, direction: 'rtl' }} />
            <Area type="monotone" dataKey="heartRate" stroke="#f43f5e" strokeWidth={2.5} fill="url(#hrGrad)" dot={false} activeDot={{ r: 5 }} />
          </AreaChart>
        );
      case 'bp':
        return (
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis domain={[60, 130]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12, direction: 'rtl' }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="systolic" name="سیستولیک" stroke="#3b82f6" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="diastolic" name="دیاستولیک" stroke="#8b5cf6" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
          </LineChart>
        );
      case 'spo2':
        return (
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="spoGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis domain={[94, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12, direction: 'rtl' }} />
            <Area type="monotone" dataKey="spo2" stroke="#14b8a6" strokeWidth={2.5} fill="url(#spoGrad)" dot={false} activeDot={{ r: 5 }} />
          </AreaChart>
        );
      case 'temperature':
        return (
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis domain={[36, 37.5]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12, direction: 'rtl' }} />
            <Area type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={2.5} fill="url(#tempGrad)" dot={false} activeDot={{ r: 5 }} />
          </AreaChart>
        );
    }
  };

  const currentMetric = metricOptions.find((m) => m.key === activeMetric)!;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {metricOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setActiveMetric(opt.key)}
            className={cn(
              'px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200',
              activeMetric === opt.key
                ? 'text-white shadow-md'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600'
            )}
            style={activeMetric === opt.key ? { backgroundColor: opt.color } : {}}
          >
            {opt.label}
            <span className="mr-1 opacity-75">{opt.unit}</span>
          </button>
        ))}
      </div>

      <motion.div
        key={activeMetric}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 shadow-sm"
      >
        <div className="text-[11px] font-bold text-slate-400 mb-2 tracking-wide">
          روند تغییرات {currentMetric.label} — ۸ نقطه اخیر
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
