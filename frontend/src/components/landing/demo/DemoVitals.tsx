'use client';

import { motion } from 'framer-motion';
import { Heart, Activity, Droplets, Thermometer, Wind, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DemoVitalSign } from './demo-data';

const iconMap = {
  heart: Heart,
  activity: Activity,
  droplets: Droplets,
  thermometer: Thermometer,
  wind: Wind,
  clock: Clock,
};

const colorBgMap: Record<string, string> = {
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400',
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  teal: 'bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400',
};

const colorAccentMap: Record<string, string> = {
  rose: 'from-rose-500 to-rose-600',
  blue: 'from-blue-500 to-blue-600',
  teal: 'from-teal-500 to-teal-600',
  amber: 'from-amber-500 to-amber-600',
  emerald: 'from-emerald-500 to-emerald-600',
  violet: 'from-violet-500 to-violet-600',
};

const statusBadge: Record<string, string> = {
  normal: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  critical: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

const statusLabel: Record<string, string> = {
  normal: 'طبیعی',
  warning: 'هشدار',
  critical: 'بحرانی',
};

interface Props {
  vitals: DemoVitalSign[];
  onAnimate?: boolean;
}

export function DemoVitals({ vitals, onAnimate = true }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {vitals.map((vital, idx) => {
        const Icon = iconMap[vital.icon];
        const TrendIcon = vital.trend === 'up' ? TrendingUp : vital.trend === 'down' ? TrendingDown : Minus;
        const trendColor = vital.trend === 'up' ? 'text-rose-500' : vital.trend === 'down' ? 'text-emerald-500' : 'text-slate-400';

        return (
          <motion.div
            key={vital.id}
            initial={onAnimate ? { opacity: 0, y: 20 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.07 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={cn(
              'relative overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer group'
            )}
          >
            <div className={cn('absolute top-0 left-0 right-0 h-1 bg-gradient-to-r opacity-80', colorAccentMap[vital.color])} />

            <div className="flex items-start justify-between mb-3">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', colorBgMap[vital.color])}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', statusBadge[vital.status])}>
                {statusLabel[vital.status]}
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wide">{vital.label}</div>
              <div className="flex items-end gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 leading-none">{vital.value}</span>
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-1">{vital.unit}</span>
              </div>
            </div>

            {vital.min && vital.max && (
              <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                <span>پایین: {vital.min}</span>
                <span className={cn('flex items-center gap-0.5', trendColor)}>
                  <TrendIcon className="w-3 h-3" />
                  {vital.trendValue}
                </span>
                <span>بالا: {vital.max}</span>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
