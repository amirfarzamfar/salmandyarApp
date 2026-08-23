'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft, Shield, CheckCircle2, UserPlus, Sparkles, Gift } from 'lucide-react';
import Link from 'next/link';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerFeature?: string;
  progress?: number;
}

export function DemoRegisterModal({ open, onOpenChange, triggerFeature, progress = 0 }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden rounded-3xl border-white/60 bg-gradient-to-br from-white via-white to-teal-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 backdrop-blur-xl">
        <div className="relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-teal-200/40 to-transparent rounded-bl-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-blue-200/40 to-transparent rounded-tr-full blur-2xl" />

          <div className="relative p-6 sm:p-8">
            <DialogHeader className="text-right space-y-3">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className="mx-auto sm:mx-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-xl shadow-teal-500/25"
              >
                <Lock className="w-7 h-7 text-white" />
              </motion.div>

              <DialogTitle className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 leading-tight">
                {progress >= 50 ? (
                  <>
                    🎉 عالی بود! حالا نسخه واقعی را تجربه کنید
                  </>
                ) : triggerFeature ? (
                  <>
                    🔓 {triggerFeature} برای همه کاربران فعال است
                  </>
                ) : (
                  <>
                    ✨ آماده‌اید سالمندیار را برای واقعی امتحان کنید؟
                  </>
                )}
              </DialogTitle>

              <DialogDescription className="text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
                {progress >= 50 ? (
                  <>
                    شما بخش بزرگی از امکانات آزمایشی سالمندیار را تجربه کردید. برای دسترسی نامحدود به پنل واقعی بیمار، ثبت‌نام رایگان را تکمیل کنید.
                  </>
                ) : (
                  <>
                    این قابلیت در نسخه کامل سالمندیار فعال است. با ساخت حساب کاربری رایگان، به تمام امکانات پنل بیمار، پیام‌رسانی با پرستار و گزارش‌های جامع دسترسی پیدا کنید.
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-2"
            >
              {[
                { icon: Shield, title: 'حریم خصوصی', desc: 'اطلاعات شما کاملاً امن است' },
                { icon: Gift, title: '۳ روز رایگان', desc: 'بدون نیاز به کارت بانکی' },
                { icon: CheckCircle2, title: 'لغو در هر لحظه', desc: 'بدون هیچ تعهدی' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center text-center p-3 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 shadow-sm"
                >
                  <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-2">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div className="text-[11px] font-black text-slate-800 dark:text-slate-100">{item.title}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 flex flex-col sm:flex-row gap-3"
            >
              <Link href="/register" className="flex-1">
                <Button
                  size="lg"
                  className="w-full justify-center gap-2 rounded-2xl py-4 text-base font-black shadow-xl shadow-teal-600/25 bg-gradient-to-l from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
                  onClick={() => onOpenChange(false)}
                >
                  <UserPlus className="w-5 h-5" />
                  ثبت‌نام رایگان و شروع
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                onClick={() => onOpenChange(false)}
                className="justify-center rounded-2xl py-4 text-base font-bold"
              >
                ادامه در حالت آزمایشی
              </Button>
            </motion.div>

            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>حساب کاربری در کمتر از ۲ دقیقه ساخته می‌شود</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
