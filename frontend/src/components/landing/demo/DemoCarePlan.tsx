'use client';

import { motion } from 'framer-motion';
import { Check, Clock, Loader2, AlertCircle, Pill, Activity, Calendar, Utensils, PersonStanding, HandHeart } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DemoCareTask, DemoNotification } from './demo-data';
import { Bell, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';

const taskIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  medication: Pill,
  vitals: Activity,
  care: HandHeart,
  activity: PersonStanding,
  meal: Utensils,
};

const taskStatusBg: Record<string, string> = {
  done: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
  'in-progress': 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  pending: 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
  overdue: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800',
};

const taskStatusBadge: Record<string, string> = {
  done: 'bg-emerald-500 text-white',
  'in-progress': 'bg-blue-500 text-white',
  pending: 'bg-slate-400 text-white',
  overdue: 'bg-rose-500 text-white',
};

const taskStatusLabel: Record<string, string> = {
  done: 'انجام شد',
  'in-progress': 'در حال انجام',
  pending: 'در انتظار',
  overdue: 'تاخیر داشته',
};

const notificationColor: Record<string, string> = {
  success: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
  warning: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
  alert: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400',
  info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
};

const notificationIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  alert: AlertCircle,
  info: Info,
};

interface CarePlanProps {
  tasks: DemoCareTask[];
  completionPercent: number;
}

export function DemoCarePlan({ tasks, completionPercent }: CarePlanProps) {
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50 to-white dark:from-teal-900/20 dark:to-slate-800 border border-teal-100 dark:border-teal-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span className="text-sm font-black text-slate-800 dark:text-slate-100">پیشرفت مراقبت امروز</span>
          </div>
          <span className="text-xl font-black text-teal-700 dark:text-teal-400">{completionPercent}٪</span>
        </div>
        <div className="h-2.5 rounded-full bg-white dark:bg-slate-700 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercent}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-l from-teal-600 via-emerald-500 to-teal-500"
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>{tasks.filter(t => t.status === 'done').length} از {tasks.length} کار انجام شده</span>
          <span>{tasks.filter(t => t.status === 'in-progress').length} در حال انجام</span>
        </div>
      </div>

      <div className="space-y-2">
        {tasks.map((task, idx) => {
          const TaskIcon = taskIconMap[task.type];
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.06 }}
              className={cn(
                'flex items-start gap-3 p-3 rounded-2xl border transition-all hover:shadow-sm cursor-pointer',
                taskStatusBg[task.status]
              )}
            >
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center border border-white dark:border-slate-600">
                  {task.status === 'done' ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : task.status === 'in-progress' ? (
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                  ) : task.status === 'overdue' ? (
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                  ) : (
                    <TaskIcon className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <span className={cn('text-[9px] font-black px-1.5 py-0.5 rounded-full', taskStatusBadge[task.status])}>
                  {taskStatusLabel[task.status]}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h5 className="text-sm font-black text-slate-800 dark:text-slate-100 truncate">{task.title}</h5>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
                    <Clock className="w-3 h-3" />
                    {task.time}
                  </div>
                </div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">{task.caregiver}</p>
                {task.note && (
                  <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700/50 rounded-lg px-2 py-1 inline-block">
                    📝 {task.note}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

interface NotificationsProps {
  notifications: DemoNotification[];
}

export function DemoNotifications({ notifications }: NotificationsProps) {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-3">
      {unreadCount > 0 && (
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-black text-slate-700 dark:text-slate-200">اعلان‌های جدید</span>
          </div>
          <span className="text-[10px] font-black text-white bg-rose-500 px-2 py-0.5 rounded-full">
            {unreadCount} خوانده نشده
          </span>
        </div>
      )}

      <div className="space-y-2">
        {notifications.map((notif, idx) => {
          const Icon = notificationIcon[notif.type];
          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07 }}
              className={cn(
                'flex items-start gap-3 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 transition-all hover:shadow-sm',
                !notif.read && 'ring-2 ring-teal-200 dark:ring-teal-800/50'
              )}
            >
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', notificationColor[notif.type])}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <h5 className="text-sm font-black text-slate-800 dark:text-slate-100 truncate">{notif.title}</h5>
                  <span className="text-[10px] font-bold text-slate-400 shrink-0">{notif.time}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{notif.message}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
