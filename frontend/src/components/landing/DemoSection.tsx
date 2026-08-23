'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Activity, Sparkles, ArrowDown, PlayCircle, ShieldCheck, Zap, MonitorSmartphone, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { DemoPatientPanel } from './demo/DemoPatientPanel';
import Link from 'next/link';

export default function DemoSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });

  const scrollToDemo = () => {
    const el = document.getElementById('patient-demo-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section
      id="patient-demo-section"
      ref={ref}
      className="relative py-14 sm:py-24 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white via-teal-50/40 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
      <div className="absolute top-20 -right-32 w-96 h-96 rounded-full bg-teal-200/30 dark:bg-teal-700/10 blur-3xl" />
      <div className="absolute bottom-20 -left-32 w-96 h-96 rounded-full bg-blue-200/30 dark:bg-blue-700/10 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-emerald-100/20 dark:bg-emerald-800/5 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-10 sm:mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-l from-teal-100 to-emerald-100 dark:from-teal-900/40 dark:to-emerald-900/40 border border-teal-200 dark:border-teal-800 shadow-sm mb-5"
          >
            <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span className="text-xs sm:text-sm font-black text-teal-800 dark:text-teal-200">
              نسخه آزمایشی تعاملی — بدون نیاز به ثبت‌نام
            </span>
          </motion.div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white leading-[1.15] tracking-tight mb-4 max-w-4xl mx-auto">
            پنل سالمندیار را همین حالا{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-l from-teal-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">امتحان کنید</span>
              <motion.svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 300 12"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={inView ? { pathLength: 1 } : {}}
                transition={{ delay: 0.4, duration: 1.2 }}
              >
                <motion.path
                  d="M3 8.5C60 2 120 2.5 180 5C240 7.5 270 6 297 3.5"
                  stroke="url(#underlineGrad)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  style={{ pathLength: inView ? 1 : 0 }}
                />
                <defs>
                  <linearGradient id="underlineGrad" x1="0" x2="1">
                    <stop offset="0%" stopColor="#14b8a6" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </motion.svg>
            </span>
          </h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-sm sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed mb-7"
          >
            بدون ثبت‌نام، بخشی از امکانات سالمندیار را به‌صورت آزمایشی تجربه کنید.
            از پایش علائم حیاتی گرفته تا کاردکس دارویی و هشدارهای هوشمند — همه چیز در یک پنل واقعی.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 max-w-3xl mx-auto mb-2"
          >
            {[
              { icon: MonitorSmartphone, label: 'پنل واقعی بیمار', hint: 'تجربه تعاملی', color: 'teal' },
              { icon: Activity, label: 'پایش علائم حیاتی', hint: 'نمودار زنده', color: 'rose' },
              { icon: ShieldCheck, label: 'کاملاً امن', hint: 'داده‌های Mock', color: 'emerald' },
              { icon: Zap, label: '۱۰۰٪ کلاینت‌ساید', hint: 'بدون Refresh', color: 'amber' },
            ].map((feat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -3, scale: 1.02 }}
                className="flex flex-col sm:flex-row items-center gap-2 p-2.5 sm:p-3 rounded-2xl bg-white/70 dark:bg-slate-800/60 border border-white dark:border-slate-700/50 backdrop-blur shadow-sm"
              >
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  feat.color === 'teal' ? 'bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400' :
                  feat.color === 'rose' ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400' :
                  feat.color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' :
                  'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'
                }`}>
                  <feat.icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </div>
                <div className="text-center sm:text-right min-w-0">
                  <div className="text-[11px] sm:text-xs font-black text-slate-800 dark:text-slate-100 whitespace-nowrap">{feat.label}</div>
                  <div className="text-[9px] sm:text-[10px] font-bold text-slate-400">{feat.hint}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.4 }}
            className="mt-7 flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-bold text-slate-400"
          >
            <ArrowDown className="w-4 h-4 animate-bounce" />
            <span>پنل تعاملی را پایین‌تر مشاهده کنید</span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.96 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ delay: 0.25, duration: 0.7, ease: 'easeOut' }}
        >
          <DemoPatientPanel />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7 }}
          className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
        >
          <Link href="/register" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto justify-center gap-2 rounded-2xl py-4 px-7 text-base font-black shadow-2xl shadow-teal-600/25 bg-gradient-to-l from-teal-600 via-emerald-500 to-teal-500 hover:from-teal-700 hover:via-emerald-600 hover:to-teal-600"
            >
              <PlayCircle className="w-5 h-5" />
              شروع واقعی و ثبت‌نام رایگان
            </Button>
          </Link>
          <Badge variant="outline" className="text-[11px] sm:text-xs font-bold py-2 px-4 rounded-2xl gap-1.5 bg-white/50 backdrop-blur border-slate-200 dark:border-slate-700">
            <Lock className="w-3.5 h-3.5" />
            بدون نیاز به کارت بانکی — ۳ روز تست رایگان
          </Badge>
        </motion.div>
      </div>
    </section>
  );
}

export function DemoEntryButton() {
  const scrollToDemo = () => {
    const el = document.getElementById('patient-demo-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <motion.button
      onClick={scrollToDemo}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className="group relative w-full mt-3 overflow-hidden rounded-2xl border border-teal-200 dark:border-teal-700/50 bg-gradient-to-l from-white via-teal-50/60 to-emerald-50 dark:from-slate-800 dark:via-teal-900/20 dark:to-emerald-900/20 p-4 sm:p-5 text-right shadow-lg shadow-teal-500/10"
    >
      <div className="absolute inset-0 bg-gradient-to-l from-teal-500/0 via-teal-500/10 to-emerald-500/0 -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
      <motion.div
        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ backgroundSize: '200% 200%' }}
        className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_30%_30%,#14b8a6,transparent_50%),radial-gradient(circle_at_70%_70%,#10b981,transparent_50%)]"
      />

      <div className="relative flex items-center gap-3 sm:gap-4">
        <motion.div
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(20,184,166,0.35)',
              '0 0 0 14px rgba(20,184,166,0)',
            ],
          }}
          transition={{ duration: 2.2, repeat: Infinity }}
          className="relative shrink-0"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-teal-500 via-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/30">
            <PlayCircle className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2.2} />
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
            className="absolute -inset-1 rounded-2xl border-2 border-dashed border-teal-400/40"
          />
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-1.5 mb-1">
            <h4 className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100 leading-tight">
              پیش از ثبت‌نام، پنل بیمار را امتحان کنید
            </h4>
            <Badge className="text-[9px] sm:text-[10px] px-2 py-0.5 bg-gradient-to-l from-teal-500 to-emerald-500 text-white border-none shadow-sm">
              <Sparkles className="w-2.5 h-2.5 ml-0.5" />
              تجربه تعاملی
            </Badge>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            بدون ثبت‌نام و بدون دردسر — فقط یک کلیک تا تجربه واقعی پنل سالمندیار شامل علائم حیاتی، کاردکس دارویی و نمودارها
          </p>
        </div>

        <motion.div
          animate={{ x: [-3, 3, -3] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="hidden sm:flex shrink-0 items-center gap-2 text-teal-700 dark:text-teal-300"
        >
          <span className="text-xs font-black">مشاهده دمو</span>
          <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-teal-200 dark:border-teal-700/50 flex items-center justify-center shadow-sm">
            <ArrowDown className="w-4 h-4 -rotate-90" />
          </div>
        </motion.div>
      </div>

      <div className="relative sm:hidden mt-3">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-black text-teal-700 dark:text-teal-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur px-3 py-1.5 rounded-xl border border-teal-200 dark:border-teal-700/50">
          <ArrowDown className="w-3.5 h-3.5" />
          برای مشاهده پنل لمس کنید
        </div>
      </div>
    </motion.button>
  );
}
