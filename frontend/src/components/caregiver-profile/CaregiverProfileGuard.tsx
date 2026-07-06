'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, BriefcaseBusiness, CheckCircle2, ShieldAlert, X } from 'lucide-react';
import { useUser } from '@/components/auth/UserContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { caregiverProfileService } from '@/services/caregiver-profile.service';

const caregiverRoles = new Set(['Nurse', 'AssistantNurse', 'ElderlyCareAssistant', 'Physiotherapist']);
const storageKey = 'caregiver-profile-remind-later-date';
const bannerDismissKey = 'caregiver-profile-banner-dismiss-date';

export function CaregiverProfileGuard() {
  const pathname = usePathname();
  const { user, loading } = useUser();
  const [open, setOpen] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  const isCaregiver = !!user?.role && caregiverRoles.has(user.role);
  const isWizardPage = pathname.startsWith('/nurse-portal/employment-profile');

  const statusQuery = useQuery({
    queryKey: ['caregiver-profile-status'],
    queryFn: caregiverProfileService.getMyStatus,
    enabled: isCaregiver && !loading,
    retry: false,
  });

  useEffect(() => {
    if (!isCaregiver || isWizardPage || !statusQuery.data) {
      setOpen(false);
      return;
    }

    const shouldOpen = !statusQuery.data.isCompleted;
    if (!shouldOpen) {
      setOpen(false);
      return;
    }

    const remindLaterDate = localStorage.getItem(storageKey);
    const today = new Date().toISOString().slice(0, 10);
    setOpen(remindLaterDate !== today);
  }, [isCaregiver, isWizardPage, statusQuery.data]);

  useEffect(() => {
    if (!isCaregiver || !statusQuery.data || statusQuery.data.isCompleted) {
      setIsBannerVisible(false);
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const dismissedAt = localStorage.getItem(bannerDismissKey);
    setIsBannerVisible(dismissedAt !== today);
  }, [isCaregiver, statusQuery.data]);

  const bannerTone = useMemo(() => {
    if (statusQuery.data?.isCompleted) return 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200';
    return 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200';
  }, [statusQuery.data?.isCompleted]);

  if (!isCaregiver || statusQuery.isLoading || !statusQuery.data) {
    return null;
  }

  return (
    <>
      {isBannerVisible && (
        <div className={cn('rounded-[28px] border px-4 py-4 shadow-sm md:px-5', bannerTone)}>
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px_auto] xl:items-center">
            <div className="flex min-w-0 items-start gap-3">
              <div className="mt-0.5 rounded-2xl bg-white/80 p-2.5 dark:bg-slate-900/40">
                {statusQuery.data.isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
              </div>
              <div className="min-w-0 space-y-1">
                <div className="text-sm font-black">وضعیت پروفایل استخدامی</div>
                <div className="text-xs leading-6 opacity-90">
                  {statusQuery.data.isCompleted
                    ? 'پروفایل شما ثبت شده و در چرخه بررسی مدیریت قرار دارد.'
                    : 'برای فعال شدن کامل حساب کاربری، اطلاعات استخدامی و مدارک را تکمیل کنید.'}
                </div>
                <div className="text-xs font-bold">وضعیت فعلی: {statusQuery.data.employmentStatusLabel}</div>
              </div>
            </div>
            <div className="min-w-0 space-y-2">
              <div className="flex items-center justify-between gap-3 text-xs font-bold">
                <span>درصد تکمیل</span>
                <span>{statusQuery.data.completionPercentage}%</span>
              </div>
              <Progress value={statusQuery.data.completionPercentage} className="h-2.5 bg-white/70 dark:bg-slate-900/50" />
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Link href="/nurse-portal/employment-profile" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-xs font-bold text-white dark:bg-white dark:text-slate-900">
                  <BriefcaseBusiness className="h-4 w-4" />
                  تکمیل/ویرایش پروفایل
                </Link>
              </div>
            </div>
            <div className="flex justify-end xl:self-start">
              <button
                type="button"
                onClick={() => {
                  localStorage.setItem(bannerDismissKey, new Date().toISOString().slice(0, 10));
                  setIsBannerVisible(false);
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/70 bg-white/70 text-slate-600 transition hover:bg-white dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:bg-slate-900"
                aria-label="بستن اعلان وضعیت پروفایل استخدامی"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl" dir="rtl">
          <DialogHeader className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <DialogTitle className="text-center text-2xl font-black">تکمیل پروفایل استخدامی</DialogTitle>
            <DialogDescription className="text-center text-sm leading-7 text-slate-600 dark:text-slate-300">
              برای فعال شدن حساب کاربری و شروع همکاری، لطفاً اطلاعات استخدامی خود را تکمیل کنید.
              تا زمان تکمیل اطلاعات و تایید مدارک توسط مدیریت، برخی امکانات پنل محدود خواهد بود.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
            <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-500">
              <span>پیشرفت فعلی</span>
              <span>{statusQuery.data.completionPercentage}%</span>
            </div>
            <Progress value={statusQuery.data.completionPercentage} />
          </div>
          <DialogFooter className="gap-3 sm:justify-between">
            <Button
              variant="outline"
              onClick={() => {
                localStorage.setItem(storageKey, new Date().toISOString().slice(0, 10));
                setOpen(false);
              }}
            >
              بعداً یادآوری کن
            </Button>
            <Link href="/nurse-portal/employment-profile" className="w-full sm:w-auto">
              <Button className="w-full">تکمیل پروفایل</Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
