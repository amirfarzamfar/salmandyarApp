'use client';

import type { ReactNode } from 'react';
import {
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  FileCheck2,
  GraduationCap,
  MapPin,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { resolveApiUrl } from '@/lib/network';
import {
  CAREGIVER_DOCUMENT_TYPES,
  CaregiverProfileDocumentStatus,
  CaregiverProfileDto,
} from '@/services/caregiver-profile.service';

type Props = {
  profile: CaregiverProfileDto;
  isAdminMode?: boolean;
};

const formatDateTime = (value?: string) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('fa-IR');
};

const formatDate = (value?: string) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('fa-IR');
};

const formatValue = (value?: string | number | null) => {
  if (value === undefined || value === null || value === '') return '-';
  return String(value);
};

const initialsFromProfile = (profile: CaregiverProfileDto) => {
  const first = profile.firstName?.trim()?.[0] ?? '';
  const last = profile.lastName?.trim()?.[0] ?? '';
  return `${first}${last}` || 'PR';
};

const caregiverDocumentLabelMap = new Map<string, string>(
  CAREGIVER_DOCUMENT_TYPES.map((documentType) => [documentType.id, documentType.label]),
);

const getCaregiverDocumentLabel = (documentType: string) => {
  return caregiverDocumentLabelMap.get(documentType) ?? documentType;
};

export default function CaregiverProfileApprovedOverview({ profile, isAdminMode = false }: Props) {
  const approvedDocuments = profile.documents.filter((document) => document.status === CaregiverProfileDocumentStatus.Approved);
  const pendingDocuments = profile.documents.filter((document) => document.status === CaregiverProfileDocumentStatus.PendingReview);
  const correctiveDocuments = profile.documents.filter(
    (document) =>
      document.status === CaregiverProfileDocumentStatus.NeedsCorrection ||
      document.status === CaregiverProfileDocumentStatus.Rejected,
  );
  const profilePhoto =
    profile.personalPhotoUrl ||
    profile.documents.find((document) => document.documentType === 'ProfilePhoto')?.fileUrl;

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-[22px] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50 shadow-sm dark:border-emerald-900/60 dark:from-emerald-950/30 dark:via-slate-900 dark:to-teal-950/20 sm:rounded-[28px]">
        <div className="grid gap-4 p-4 sm:gap-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 flex-col items-start gap-4 sm:flex-row sm:items-center">
                {profilePhoto ? (
                  <img
                    src={resolveApiUrl(profilePhoto)}
                    alt={`${profile.firstName ?? 'پرسنل'} ${profile.lastName ?? ''}`}
                    className="h-14 w-14 shrink-0 rounded-2xl border border-white/70 object-cover shadow-sm sm:h-16 sm:w-16"
                  />
                ) : (
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-base font-black text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200 sm:h-16 sm:w-16 sm:text-lg">
                    {initialsFromProfile(profile)}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="border border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                      <CheckCircle2 className="ml-1 h-3.5 w-3.5" />
                      پروفایل تایید شده
                    </Badge>
                    {profile.registeredRole && (
                      <Badge variant="outline" className="border-slate-200 bg-white/70 text-slate-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200">
                        {profile.registeredRole}
                      </Badge>
                    )}
                  </div>
                  <h2 className="mt-2 break-words text-xl font-black text-slate-900 dark:text-white sm:text-2xl">
                    {`${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim() || 'پرسنل درمانی'}
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {isAdminMode
                      ? 'این نمای کلی برای شناخت سریع پرسنل، وضعیت تایید، توانمندی‌ها و مدارک کلیدی طراحی شده است.'
                      : 'پروفایل استخدامی شما توسط مدیریت تایید شده و خلاصه مشخصات ثبت‌شده در ادامه قابل مشاهده است.'}
                  </p>
                </div>
              </div>
              <div className="grid w-full gap-3 sm:grid-cols-2 lg:min-w-[240px] lg:max-w-[300px] lg:grid-cols-1">
                <StatPill label="وضعیت استخدام" value={profile.employmentStatusLabel} />
                <StatPill label="درصد تکمیل" value={`${profile.completionPercentage}%`} />
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="تاریخ ثبت نهایی" value={formatDateTime(profile.submittedAt)} />
              <StatCard label="تاییدکننده" value={formatValue(profile.reviewedByName)} />
              <StatCard label="تاریخ تایید" value={formatDateTime(profile.reviewedAt)} />
              <StatCard label="مدارک تاییدشده" value={`${approvedDocuments.length} مورد`} />
            </div>
          </div>

          <div className="rounded-[20px] border border-white/80 bg-white/75 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/60 sm:rounded-[24px]">
            <SectionTitle icon={<ShieldCheck className="h-4 w-4" />} title="وضعیت بررسی" />
            <div className="mt-4 space-y-3">
              <StatusRow label="در انتظار بررسی" value={`${pendingDocuments.length} مدرک`} tone="slate" />
              <StatusRow label="تایید شده" value={`${approvedDocuments.length} مدرک`} tone="emerald" />
              <StatusRow label="نیازمند اقدام" value={`${correctiveDocuments.length} مدرک`} tone="amber" />
            </div>
            {profile.reviewNote && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                <div className="mb-1 text-xs font-black">یادداشت مدیریت</div>
                {profile.reviewNote}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        <OverviewCard icon={<UserRound className="h-4 w-4" />} title="هویت و ارتباط">
          <InfoItem label="نام پدر" value={formatValue(profile.fatherName)} />
          <InfoItem label="تاریخ تولد" value={formatDate(profile.dateOfBirth)} />
          <InfoItem label="موبایل" value={formatValue(profile.mobileNumber)} />
          <InfoItem label="ایمیل" value={formatValue(profile.email)} />
          <InfoItem label="استان و شهر" value={[profile.province, profile.city].filter(Boolean).join(' - ') || '-'} />
          <InfoItem label="آدرس" value={formatValue(profile.fullAddress)} multiline />
        </OverviewCard>

        <OverviewCard icon={<BriefcaseBusiness className="h-4 w-4" />} title="شناخت حرفه‌ای">
          <InfoItem label="نوع همکاری" value={formatValue(profile.cooperationType)} />
          <InfoItem label="سابقه کار" value={profile.experienceYears !== undefined ? `${profile.experienceYears} سال` : '-'} />
          <InfoItem label="وضعیت اشتغال" value={formatValue(profile.currentEmploymentStatus)} />
          <InfoItem label="شماره نظام" value={formatValue(profile.nursingSystemNumber)} />
          <InfoItem label="آخرین محل کار" value={formatValue(profile.lastWorkplace)} />
          <InfoItem label="شعاع خدمت" value={profile.serviceRadiusKm ? `${profile.serviceRadiusKm} کیلومتر` : '-'} />
        </OverviewCard>

        <OverviewCard icon={<GraduationCap className="h-4 w-4" />} title="تحصیلات و توانمندی">
          <InfoItem label="مدرک تحصیلی" value={formatValue(profile.latestDegree)} />
          <InfoItem label="رشته" value={formatValue(profile.major)} />
          <InfoItem label="دانشگاه" value={formatValue(profile.university)} />
          <InfoItem label="سال فارغ‌التحصیلی" value={formatValue(profile.graduationYear)} />
          <InfoItem label="گواهینامه‌ها" value={profile.certificates.length > 0 ? `${profile.certificates.length} مورد` : 'ثبت نشده'} />
        </OverviewCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <OverviewCard icon={<MapPin className="h-4 w-4" />} title="پوشش خدمات و شیفت‌ها">
          <TagGroup
            label="شیفت‌های قابل انجام"
            items={profile.shiftPreferences}
            emptyText="ثبت نشده"
            tone="teal"
          />
          <TagGroup
            label="مناطق قابل پوشش"
            items={profile.serviceAreas.map((item) => `${item.province} - ${item.city}`)}
            emptyText="ثبت نشده"
            tone="slate"
          />
        </OverviewCard>

        <OverviewCard icon={<CheckCircle2 className="h-4 w-4" />} title="مهارت‌ها و شایستگی‌ها">
          <TagGroup label="مهارت‌های ثبت‌شده" items={[...profile.skills, ...profile.customSkills]} emptyText="ثبت نشده" tone="emerald" />
        </OverviewCard>
      </div>

      <OverviewCard icon={<FileCheck2 className="h-4 w-4" />} title="اسناد و شواهد استخدامی">
        <div className="grid gap-3 lg:grid-cols-2">
          {profile.documents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              هنوز مدرکی برای این پروفایل ثبت نشده است.
            </div>
          ) : (
            profile.documents.map((document) => (
              <a
                key={document.id}
                href={resolveApiUrl(document.fileUrl)}
                target="_blank"
                rel="noreferrer"
                className="block rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 transition hover:border-teal-200 hover:bg-teal-50/60 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-teal-900"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="break-words text-sm font-bold text-slate-800 dark:text-slate-100">
                          {getCaregiverDocumentLabel(document.documentType)}
                        </div>
                      </div>
                      <Badge className={cn('w-fit shrink-0 border self-start', getDocumentTone(document.status))}>
                        {document.statusLabel}
                      </Badge>
                    </div>
                    <div
                      className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs text-slate-500 dark:text-slate-400"
                      dir="ltr"
                      title={document.fileName}
                    >
                    {document.fileName}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                      <span className="break-words">{formatDateTime(document.reviewedAt ?? document.uploadedAt)}</span>
                    </div>
                  </div>
                </div>
              </a>
            ))
          )}
        </div>
      </OverviewCard>
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 text-sm font-black text-slate-800 dark:text-slate-100">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
        {icon}
      </div>
      {title}
    </div>
  );
}

function OverviewCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="rounded-[22px] border border-slate-200 bg-white/95 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/90 sm:rounded-[26px] sm:p-5">
      <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {icon}
        </div>
        <span className="break-words">{title}</span>
      </div>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/90 bg-white/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/60">
      <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-1 break-words text-sm font-black text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/60">
      <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-1 break-words text-sm font-black text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}

function StatusRow({ label, value, tone }: { label: string; value: string; tone: 'slate' | 'emerald' | 'amber' }) {
  const toneClassName =
    tone === 'emerald'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200'
      : tone === 'amber'
        ? 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200'
        : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300';

  return (
    <div className={cn('flex flex-col gap-1 rounded-2xl border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between', toneClassName)}>
      <span className="font-medium">{label}</span>
      <span className="font-black">{value}</span>
    </div>
  );
}

function InfoItem({ label, value, multiline = false }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40">
      <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{label}</div>
      <div className={cn('break-words text-sm font-bold text-slate-800 dark:text-slate-100', multiline && 'leading-7')}>{value}</div>
    </div>
  );
}

function TagGroup({
  label,
  items,
  emptyText,
  tone,
}: {
  label: string;
  items: string[];
  emptyText: string;
  tone: 'teal' | 'slate' | 'emerald';
}) {
  const toneClassName =
    tone === 'emerald'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200'
      : tone === 'teal'
        ? 'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200'
        : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300';

  return (
    <div>
      <div className="mb-2 text-xs font-black text-slate-500 dark:text-slate-400">{label}</div>
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          {emptyText}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <Badge key={`${label}-${item}`} className={cn('max-w-full border text-xs font-bold whitespace-normal break-words', toneClassName)}>
              {item}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function getDocumentTone(status: CaregiverProfileDocumentStatus) {
  switch (status) {
    case CaregiverProfileDocumentStatus.Approved:
      return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200';
    case CaregiverProfileDocumentStatus.NeedsCorrection:
      return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200';
    case CaregiverProfileDocumentStatus.Rejected:
      return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200';
    default:
      return 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300';
  }
}
