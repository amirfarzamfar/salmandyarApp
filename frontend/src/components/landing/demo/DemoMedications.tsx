'use client';

import { motion } from 'framer-motion';
import { Check, Clock, AlertTriangle, Bell, Pill } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DemoMedication, DemoKardexEntry } from './demo-data';
import { useState } from 'react';

const statusStyles: Record<string, string> = {
  taken: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  missed: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

const statusLabel: Record<string, string> = {
  taken: 'مصرف شده',
  pending: 'در انتظار',
  missed: 'فراموش شده',
};

const colorBorderMap: Record<string, string> = {
  teal: 'border-r-4 border-r-teal-500',
  blue: 'border-r-4 border-r-blue-500',
  amber: 'border-r-4 border-r-amber-500',
  rose: 'border-r-4 border-r-rose-500',
  violet: 'border-r-4 border-r-violet-500',
};

const alertTypeColor: Record<string, string> = {
  allergy: 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400',
  interaction: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400',
  overdose: 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400',
  missed: 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400',
};

const alertTypeLabel: Record<string, string> = {
  allergy: 'حساسیت',
  interaction: 'تداخل دارویی',
  overdose: 'مقادیر بیش از حد',
  missed: 'فراموشی مصرف',
};

interface MedicationsProps {
  medications: DemoMedication[];
}

export function DemoMedications({ medications }: MedicationsProps) {
  const [activeMedId, setActiveMedId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {medications.map((med, idx) => {
        const remainingPct = Math.round((med.remaining / med.total) * 100);
        const isExpanded = activeMedId === med.id;
        return (
          <motion.div
            key={med.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.06 }}
            layout
            onClick={() => setActiveMedId(isExpanded ? null : med.id)}
            className={cn(
              'rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden cursor-pointer transition-shadow hover:shadow-md',
              colorBorderMap[med.color]
            )}
          >
            <div className="p-4 flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center text-2xl shrink-0">
                {med.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h4 className="font-black text-slate-800 dark:text-slate-100 truncate">{med.name}</h4>
                  <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', statusStyles[med.status])}>
                    {statusLabel[med.status]}
                  </span>
                  {med.hasAlert && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                      <Bell className="w-3 h-3" />
                      هشدار
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 flex flex-wrap gap-x-3 gap-y-1">
                  <span className="font-bold">{med.dosage}</span>
                  <span>{med.frequency}</span>
                  <span>ساعت: {med.time.join(' ، ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${remainingPct}%` }}
                      transition={{ duration: 0.8, delay: idx * 0.08 + 0.3 }}
                      className={cn('h-full rounded-full',
                        remainingPct < 30 ? 'bg-rose-500' : remainingPct < 60 ? 'bg-amber-500' : 'bg-emerald-500'
                      )}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {med.remaining} از {med.total}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0 hidden sm:block">
                <div className="text-[10px] font-bold text-slate-400">دوز بعدی</div>
                <div className="text-sm font-black text-slate-700 dark:text-slate-200">{med.nextDose}</div>
              </div>
            </div>

            {med.hasAlert && isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-slate-100 dark:border-slate-700"
              >
                <div className="p-3 bg-amber-50/60 dark:bg-amber-900/10 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-xs font-bold text-amber-800 dark:text-amber-300 leading-relaxed">{med.alertMessage}</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

interface KardexProps {
  entries: DemoKardexEntry[];
}

export function DemoMedicationKardex({ entries }: KardexProps) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12 gap-2 px-3 py-2 text-[10px] font-black text-slate-400 border-b border-slate-100 dark:border-slate-700 hidden sm:grid">
        <div className="col-span-2">تاریخ</div>
        <div className="col-span-3">دارو</div>
        <div className="col-span-1">دوز</div>
        <div className="col-span-2">مسیر</div>
        <div className="col-span-2">پرستار</div>
        <div className="col-span-2">وضعیت</div>
      </div>

      {entries.map((entry, idx) => (
        <motion.div
          key={entry.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.08 }}
          className="grid grid-cols-2 sm:grid-cols-12 gap-2 p-3 rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-xs"
        >
          <div className="col-span-2 sm:col-span-2">
            <div className="sm:hidden text-[10px] font-bold text-slate-400 mb-0.5">تاریخ</div>
            <div className="font-bold text-slate-700 dark:text-slate-200">{entry.date}</div>
            <div className="text-slate-400">{entry.time}</div>
          </div>
          <div className="col-span-2 sm:col-span-3">
            <div className="sm:hidden text-[10px] font-bold text-slate-400 mb-0.5">دارو</div>
            <div className="font-black text-slate-800 dark:text-slate-100 flex items-center gap-1">
              <Pill className="w-3 h-3 text-teal-500" />
              {entry.medication}
            </div>
            {entry.hasAlert && entry.alertType && (
              <div className={cn('mt-1 inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md border', alertTypeColor[entry.alertType])}>
                <AlertTriangle className="w-3 h-3" />
                {entry.alertText || alertTypeLabel[entry.alertType]}
              </div>
            )}
          </div>
          <div className="col-span-2 sm:col-span-1">
            <div className="sm:hidden text-[10px] font-bold text-slate-400 mb-0.5">دوز</div>
            <div className="font-bold text-slate-600 dark:text-slate-300">{entry.dosage}</div>
          </div>
          <div className="col-span-2 sm:col-span-2">
            <div className="sm:hidden text-[10px] font-bold text-slate-400 mb-0.5">مسیر</div>
            <div className="font-medium text-slate-600 dark:text-slate-300">{entry.route}</div>
          </div>
          <div className="col-span-2 sm:col-span-2">
            <div className="sm:hidden text-[10px] font-bold text-slate-400 mb-0.5">پرستار</div>
            <div className="font-medium text-slate-500 dark:text-slate-400">{entry.nurse}</div>
          </div>
          <div className="col-span-2 sm:col-span-2">
            <div className="sm:hidden text-[10px] font-bold text-slate-400 mb-0.5">وضعیت</div>
            {entry.administered ? (
              <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                <Check className="w-3 h-3" />
                ثبت شده
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400 px-2 py-0.5 rounded-full">
                <Clock className="w-3 h-3" />
                ثبت نشد
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
