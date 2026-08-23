'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Pill, BarChart3, Calendar, Plus, Lock, MessageSquare, Folder, FileText, Sparkles, ChevronRight, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DemoFeature } from './demo-data';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  activity: Activity,
  pill: Pill,
  chart: BarChart3,
  calendar: Calendar,
  plus: Plus,
  message: MessageSquare,
  folder: Folder,
  file: FileText,
};

interface Props {
  features: DemoFeature[];
  discovered: Set<string>;
  onFeatureClick: (feature: DemoFeature) => void;
  onUnlockClick?: () => void;
}

export function DemoFeaturesGrid({ features, discovered, onFeatureClick, onUnlockClick }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {features.map((feature, idx) => {
        const Icon = iconMap[feature.icon] || Activity;
        const isDiscovered = discovered.has(feature.id);
        const isUnlocked = feature.unlocked;

        return (
          <motion.button
            key={feature.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            whileHover={isUnlocked ? { scale: 1.03, y: -3 } : { scale: 1.01 }}
            whileTap={isUnlocked ? { scale: 0.97 } : { scale: 0.99 }}
            onClick={() => onFeatureClick(feature)}
            className={cn(
              'group relative text-right p-4 rounded-2xl border transition-all duration-300 overflow-hidden',
              isUnlocked
                ? 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:shadow-lg hover:border-teal-200 dark:hover:border-teal-700'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 cursor-pointer'
            )}
          >
            {isUnlocked && isDiscovered && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-2 right-2"
              >
                <Trophy className="w-4 h-4 text-amber-500 drop-shadow-sm" />
              </motion.div>
            )}

            <div className="flex items-center gap-2 mb-3">
              <motion.div
                whileHover={isUnlocked ? { rotate: [0, -8, 8, 0] } : {}}
                transition={{ duration: 0.4 }}
                className={cn(
                  'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                  isUnlocked
                    ? 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-500/20'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                )}
              >
                {isUnlocked ? <Icon className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              </motion.div>

              {!isUnlocked && (
                <div className="flex-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    قفل شده
                  </span>
                </div>
              )}
              {isUnlocked && isDiscovered && (
                <span className="text-[9px] font-black text-teal-600 dark:text-teal-400 flex items-center gap-0.5 bg-teal-50 dark:bg-teal-900/30 px-1.5 py-0.5 rounded-md">
                  <Sparkles className="w-2.5 h-2.5" />
                  کشف شد
                </span>
              )}
            </div>

            <h4 className={cn(
              'text-sm font-black mb-1 leading-tight',
              isUnlocked ? 'text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'
            )}>
              {feature.title}
            </h4>
            <p className={cn(
              'text-[11px] leading-relaxed line-clamp-2',
              isUnlocked ? 'text-slate-500 dark:text-slate-400' : 'text-slate-400 dark:text-slate-500'
            )}>
              {isUnlocked ? feature.description : feature.unlockMessage}
            </p>

            <div className="mt-3 flex items-center justify-between">
              <span className={cn(
                'text-[10px] font-bold flex items-center gap-0.5',
                isUnlocked ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'
              )}>
                {isUnlocked ? (
                  <>
                    تجربه کنید
                    <ChevronRight className="w-3 h-3 transition-transform group-hover:-translate-x-0.5" />
                  </>
                ) : (
                  <>
                    ثبت‌نام لازم است
                    <ChevronRight className="w-3 h-3" />
                  </>
                )}
              </span>
              <span className={cn(
                'text-[9px] font-black px-1.5 py-0.5 rounded-md',
                isUnlocked
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
              )}>
                +{feature.progressReward}%
              </span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
