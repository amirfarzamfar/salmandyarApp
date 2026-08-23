'use client';

import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap, Trophy, Rocket, Star } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
  progress: number;
  discoveredCount: number;
  totalCount: number;
}

export function DemoProgressTracker({ progress, discoveredCount, totalCount }: Props) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(progress), 100);
    return () => clearTimeout(timer);
  }, [progress]);

  const milestoneIcon = (() => {
    if (progress >= 100) return Trophy;
    if (progress >= 60) return Rocket;
    if (progress >= 30) return Zap;
    return Sparkles;
  })();
  const Icon = milestoneIcon;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <motion.div
            animate={progress >= 100 ? { rotate: [0, 10, -10, 0] } : {}}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/20"
          >
            <Icon className="w-4 h-4 text-white" />
          </motion.div>
          <div>
            <div className="text-[11px] font-black text-slate-400 tracking-wide">پیشرفت آشنایی</div>
            <div className="text-sm font-black text-slate-800 dark:text-slate-100">
              امکانات کشف‌شده: <span className="text-teal-600 dark:text-teal-400">{discoveredCount}</span> از {totalCount}
            </div>
          </div>
        </div>

        <div className="text-left">
          <div className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 leading-none">
            <motion.span
              key={animatedProgress}
              initial={{ scale: 1.2, color: '#0d9488' }}
              animate={{ scale: 1, color: undefined }}
              transition={{ duration: 0.3 }}
            >
              {Math.round(animatedProgress)}
            </motion.span>
            <span className="text-lg text-slate-400 mr-0.5">٪</span>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Progress value={animatedProgress} className="h-2.5" />
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-[10px] font-bold">
            <Star className="w-2.5 h-2.5 text-amber-500 ml-1 fill-amber-500" />
            حالت آزمایشی
          </Badge>
          <span className="text-[10px] font-bold text-slate-400">
            {progress >= 100 ? 'تجربه کامل آزمایشی! 🎉' : progress >= 50 ? 'نیم راه را پیمودید ✨' : 'ادامه دهید تا بیشتر کشف کنید 👀'}
          </span>
        </div>
      </div>
    </div>
  );
}
