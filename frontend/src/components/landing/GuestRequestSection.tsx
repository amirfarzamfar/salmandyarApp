'use client';

import { useState } from 'react';
import { Sparkles, ShieldCheck, Timer, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import GuestRequestWizard from '@/components/requests/GuestRequestWizard';

export default function GuestRequestSection() {
  const [open, setOpen] = useState(false);

  return (
    <section id="guest-request" className="relative overflow-hidden py-14 sm:py-20">
      <div className="absolute inset-0 bg-gradient-to-b from-teal-50/70 via-white to-white" />
      <div className="absolute -left-24 top-16 h-64 w-64 rounded-full bg-teal-200/40 blur-3xl" />
      <div className="absolute -right-24 bottom-16 h-64 w-64 rounded-full bg-blue-200/40 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-bold text-teal-700 shadow-sm ring-1 ring-teal-100 backdrop-blur">
              <Sparkles className="h-4 w-4" />
              ثبت درخواست در کمتر از یک دقیقه
            </div>

            <h2 className="text-2xl font-black leading-tight text-slate-900 sm:text-4xl">
              ثبت درخواست خدمت بدون نیاز به ثبت‌نام
            </h2>

            <p className="text-base leading-8 text-slate-600 sm:text-lg">
              مثل یک گفت‌وگو کوتاه با دستیار هوشمند. چند سؤال ضروری را مرحله‌به‌مرحله پاسخ دهید و درخواست شما با کد پیگیری ثبت می‌شود.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <FeatureBadge icon={<Timer className="h-5 w-5 text-teal-600" />} title="کمتر از ۱ دقیقه" desc="فقط سؤال‌های ضروری" />
              <FeatureBadge icon={<ShieldCheck className="h-5 w-5 text-blue-600" />} title="بدون ساخت حساب" desc="بدون دردسر ثبت‌نام" />
            </div>
          </div>

          <div className="rounded-3xl border border-white/60 bg-white/70 p-5 shadow-xl shadow-slate-900/5 backdrop-blur sm:p-7">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-black text-slate-900">شروع سریع</div>
                  <div className="mt-1 text-sm text-slate-500">
                    سؤال‌ها به‌صورت پویا از پنل ادمین بارگذاری می‌شوند.
                  </div>
                </div>
                <div className="hidden items-center gap-2 text-xs font-bold text-slate-500 sm:flex">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                  Smart Wizard
                </div>
              </div>

              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="w-full justify-center gap-2 rounded-2xl py-4 text-base font-black shadow-lg shadow-teal-600/20"
                  >
                    شروع ثبت درخواست
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-xl border-white/50 bg-white/80 backdrop-blur-xl sm:rounded-3xl">
                  <DialogHeader className="space-y-2 text-right">
                    <DialogTitle className="text-xl font-black text-slate-900">ثبت درخواست بدون ثبت‌نام</DialogTitle>
                    <DialogDescription className="text-sm text-slate-500">
                      پاسخ‌ها به‌صورت خودکار ذخیره می‌شوند و می‌توانید به مرحله قبل برگردید.
                    </DialogDescription>
                  </DialogHeader>
                  <GuestRequestWizard onCompleted={() => setOpen(false)} />
                </DialogContent>
              </Dialog>

              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                برای ثبت اولیه، فقط اطلاعاتی پرسیده می‌شود که برای اعزام صحیح نیرو ضروری است.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureBadge({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/70 bg-white/60 p-4 shadow-sm backdrop-blur">
      <div className="mt-0.5">{icon}</div>
      <div>
        <div className="text-sm font-black text-slate-900">{title}</div>
        <div className="mt-1 text-xs text-slate-500">{desc}</div>
      </div>
    </div>
  );
}

