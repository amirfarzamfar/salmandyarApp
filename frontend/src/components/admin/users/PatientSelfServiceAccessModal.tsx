'use client';

import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { Clock3, History, RefreshCw, ShieldCheck, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { UserListDto, userService } from '@/services/user.service';
import DatePicker from 'react-multi-date-picker';
import DateObject from 'react-date-object';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import TimePicker from 'react-multi-date-picker/plugins/time_picker';
import {
  PatientSelfServiceAccessAuditEntry,
  PatientSelfServiceAccessSummary,
  PatientSelfServiceFeatureKey,
  UpdatePatientSelfServiceAccessDto
} from '@/types/patient-self-service';

interface Props {
  user: UserListDto | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const featureLabels: Record<PatientSelfServiceFeatureKey, { title: string; description: string }> = {
  VitalSigns: {
    title: 'ثبت علائم حیاتی',
    description: 'ثبت فشار خون، دما، نبض و سایر علائم حیاتی توسط خود بیمار یا سالمند'
  },
  MedicationKardex: {
    title: 'ثبت کاردکس دارویی',
    description: 'ثبت وضعیت مصرف دارو و تایید دوزهای برنامه‌ریزی‌شده در پنل بیمار/سالمند'
  }
};

const defaultFormState = (): UpdatePatientSelfServiceAccessDto => ({
  isEnabled: false,
  availableFromDate: '',
  availableToDate: '',
  dailyAccessStartTime: '',
  dailyAccessEndTime: '',
  features: [
    { featureKey: 'VitalSigns', isEnabled: false },
    { featureKey: 'MedicationKardex', isEnabled: false }
  ]
});

const formatIranDateInput = (value?: string | null) => {
  if (!value) {
    return '';
  }

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tehran',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  const parts = formatter.formatToParts(new Date(value));
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  return year && month && day ? `${year}-${month}-${day}` : '';
};

const formatTehranDateValue = (date: Date) => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tehran',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  return formatter.format(date);
};

const pad2 = (value: number) => value.toString().padStart(2, '0');

const parseTimeToDateObject = (value?: string | null) => {
  if (!value) {
    return null;
  }

  const normalized = value.trim();
  const [hourRaw, minuteRaw] = normalized.split(':');
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }

  const dateObject = new DateObject({ calendar: persian, locale: persian_fa });
  dateObject.setHour(hour);
  dateObject.setMinute(minute);
  dateObject.setSecond(0);
  return dateObject;
};

const extractTimeFromDateObject = (date: any) => {
  const hour = typeof date?.hour === 'number' ? date.hour : null;
  const minute = typeof date?.minute === 'number' ? date.minute : null;

  if (hour === null || minute === null) {
    return '';
  }

  return `${pad2(hour)}:${pad2(minute)}`;
};

const toPayloadValue = (value?: string | null) => {
  if (!value || !value.trim()) {
    return null;
  }

  return value;
};

const addDaysToDateValue = (value: string, days: number) => {
  const base = value ? new Date(`${value}T00:00:00Z`) : new Date();
  base.setUTCDate(base.getUTCDate() + days);
  return base.toISOString().slice(0, 10);
};

export function PatientSelfServiceAccessModal({ user, isOpen, onClose, onSaved }: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [summary, setSummary] = useState<PatientSelfServiceAccessSummary | null>(null);
  const [audit, setAudit] = useState<PatientSelfServiceAccessAuditEntry[]>([]);
  const [showAllAudit, setShowAllAudit] = useState(false);
  const [form, setForm] = useState<UpdatePatientSelfServiceAccessDto>(defaultFormState);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fullName = useMemo(() => {
    if (!user) {
      return '';
    }

    return `${user.firstName} ${user.lastName}`.trim();
  }, [user]);

  const syncFormFromSummary = (nextSummary: PatientSelfServiceAccessSummary | null) => {
    if (!nextSummary) {
      setForm(defaultFormState());
      return;
    }

    setForm({
      isEnabled: nextSummary.isEnabled,
      availableFromDate: formatIranDateInput(nextSummary.accessStartAtUtc),
      availableToDate: formatIranDateInput(nextSummary.accessEndAtUtc),
      dailyAccessStartTime: nextSummary.dailyAccessStartTime ?? '',
      dailyAccessEndTime: nextSummary.dailyAccessEndTime ?? '',
      features: nextSummary.features.map((feature) => ({
        featureKey: feature.featureKey,
        isEnabled: feature.isEnabled
      }))
    });
  };

  const loadData = async () => {
    if (!user) {
      return;
    }

    try {
      setLoading(true);
      setLoadError(null);
      const accessSummary = await userService.getSelfServiceAccess(user.id);
      let auditTrail: PatientSelfServiceAccessAuditEntry[] = [];

      try {
        auditTrail = await userService.getSelfServiceAccessAudit(user.id);
      } catch (auditError) {
        // Audit history is non-blocking; the access form should still open.
        auditTrail = [];
      }

      setSummary(accessSummary);
      setAudit(auditTrail);
      setShowAllAudit(false);
      syncFormFromSummary(accessSummary);
    } catch (error: any) {
      setSummary(null);
      setAudit([]);
      setShowAllAudit(false);
      syncFormFromSummary(null);

      setLoadError(extractApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      loadData();
    }
  }, [isOpen, user]);

  const updateFeature = (featureKey: PatientSelfServiceFeatureKey, isEnabled: boolean) => {
    setForm((current) => ({
      ...current,
      features: current.features.map((feature) =>
        feature.featureKey === featureKey ? { ...feature, isEnabled } : feature
      )
    }));
  };

  const handleSave = async () => {
    if (!user) {
      return;
    }

    try {
      setSaving(true);

      const payload: UpdatePatientSelfServiceAccessDto = {
        ...form,
        availableFromDate: toPayloadValue(form.availableFromDate),
        availableToDate: toPayloadValue(form.availableToDate),
        dailyAccessStartTime: toPayloadValue(form.dailyAccessStartTime),
        dailyAccessEndTime: toPayloadValue(form.dailyAccessEndTime)
      };

      const updated = await userService.updateSelfServiceAccess(user.id, payload);
      const auditTrail = await userService.getSelfServiceAccessAudit(user.id);

      setSummary(updated);
      setAudit(auditTrail);
      syncFormFromSummary(updated);
      toast.success('دسترسی ثبت اطلاعات با موفقیت ذخیره شد.');
      onSaved();
    } catch (error: any) {
      const message = error?.response?.data?.error || 'ذخیره تنظیمات دسترسی ناموفق بود.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !user) {
    return null;
  }

  const visibleAudit = showAllAudit ? audit : audit.slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-[2rem] bg-white p-5 shadow-2xl md:p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute left-4 top-4 rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">مدیریت دسترسی ثبت اطلاعات</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {fullName} - {user.role}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {summary && (
              <>
                <StatusBadge active={summary.isEnabled} activeLabel="فعال" inactiveLabel="غیرفعال" />
                <StatusBadge
                  active={summary.isCurrentlyWithinWindow}
                  activeLabel="داخل بازه مجاز"
                  inactiveLabel={summary.isExpired ? 'منقضی‌شده' : 'خارج از بازه'}
                />
              </>
            )}
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              بروزرسانی
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-500">در حال دریافت اطلاعات...</div>
        ) : loadError ? (
          <div className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
            {loadError}
          </div>
        ) : (
          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.95fr)]">
            <div className="space-y-6">
              <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
                <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">تنظیمات دسترسی</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      فعال‌سازی کلی، فیچرها و بازه مجاز ثبت برای بیمار یا سالمند
                    </p>
                  </div>

                  <label className="inline-flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
                    <input
                      type="checkbox"
                      checked={form.isEnabled}
                      onChange={(event) => setForm((current) => ({ ...current, isEnabled: event.target.checked }))}
                      className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    فعال بودن دسترسی کلی
                  </label>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {form.features.map((feature) => {
                    const label = featureLabels[feature.featureKey];
                    const currentFeatureState = summary?.features.find(
                      (item) => item.featureKey === feature.featureKey
                    );

                    return (
                      <div key={feature.featureKey} className="rounded-3xl border border-slate-200 bg-white p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="font-bold text-slate-900">{label.title}</h4>
                            <p className="mt-2 text-sm leading-6 text-slate-500">{label.description}</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={feature.isEnabled}
                            onChange={(event) => updateFeature(feature.featureKey, event.target.checked)}
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                          />
                        </div>

                        {currentFeatureState?.message && (
                          <p className="mt-3 rounded-2xl bg-slate-50 px-3 py-2 text-xs leading-6 text-slate-600">
                            {currentFeatureState.message}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <Field label="از تاریخ">
                    <DatePicker
                      value={
                        form.availableFromDate
                          ? new DateObject({ date: form.availableFromDate, format: 'YYYY-MM-DD' })
                          : ''
                      }
                      onChange={(date: { isValid?: boolean; toDate?: () => Date } | null) => {
                        if (!date || !date.isValid || !date.toDate) {
                          setForm((current) => ({ ...current, availableFromDate: '' }));
                          return;
                        }

                        setForm((current) => ({ ...current, availableFromDate: formatTehranDateValue(date.toDate!()) }));
                      }}
                      calendar={persian}
                      locale={persian_fa}
                      format="YYYY/MM/DD"
                      calendarPosition="bottom-right"
                      inputClass="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-50"
                      containerClassName="w-full"
                      placeholder="انتخاب تاریخ شروع"
                    />
                  </Field>

                  <Field label="تا تاریخ">
                    <DatePicker
                      value={
                        form.availableToDate ? new DateObject({ date: form.availableToDate, format: 'YYYY-MM-DD' }) : ''
                      }
                      onChange={(date: { isValid?: boolean; toDate?: () => Date } | null) => {
                        if (!date || !date.isValid || !date.toDate) {
                          setForm((current) => ({ ...current, availableToDate: '' }));
                          return;
                        }

                        setForm((current) => ({ ...current, availableToDate: formatTehranDateValue(date.toDate!()) }));
                      }}
                      calendar={persian}
                      locale={persian_fa}
                      format="YYYY/MM/DD"
                      calendarPosition="bottom-right"
                      inputClass="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-50"
                      containerClassName="w-full"
                      placeholder="انتخاب تاریخ پایان"
                    />
                  </Field>

                  <Field label="شروع بازه روزانه">
                    <DatePicker
                      value={parseTimeToDateObject(form.dailyAccessStartTime)}
                      onChange={(date: any) => {
                        if (!date) {
                          setForm((current) => ({ ...current, dailyAccessStartTime: '' }));
                          return;
                        }

                        setForm((current) => ({ ...current, dailyAccessStartTime: extractTimeFromDateObject(date) }));
                      }}
                      disableDayPicker
                      calendar={persian}
                      locale={persian_fa}
                      format="HH:mm"
                      calendarPosition="bottom-right"
                      plugins={[<TimePicker key="time" hideSeconds position="bottom" />]}
                      inputClass="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-50"
                      containerClassName="w-full"
                      placeholder="انتخاب ساعت شروع"
                    />
                  </Field>

                  <Field label="پایان بازه روزانه">
                    <DatePicker
                      value={parseTimeToDateObject(form.dailyAccessEndTime)}
                      onChange={(date: any) => {
                        if (!date) {
                          setForm((current) => ({ ...current, dailyAccessEndTime: '' }));
                          return;
                        }

                        setForm((current) => ({ ...current, dailyAccessEndTime: extractTimeFromDateObject(date) }));
                      }}
                      disableDayPicker
                      calendar={persian}
                      locale={persian_fa}
                      format="HH:mm"
                      calendarPosition="bottom-right"
                      plugins={[<TimePicker key="time" hideSeconds position="bottom" />]}
                      inputClass="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-50"
                      containerClassName="w-full"
                      placeholder="انتخاب ساعت پایان"
                    />
                  </Field>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        isEnabled: true,
                        availableToDate: addDaysToDateValue(current.availableToDate ?? '', 7)
                      }))
                    }
                    className="rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-700 transition hover:bg-teal-100"
                  >
                    تمدید ۷ روزه
                  </button>

                  <button
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, isEnabled: false }))}
                    className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
                  >
                    لغو دسترسی
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-2xl bg-teal-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
                  </button>
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="rounded-3xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2 text-slate-900">
                  <Clock3 className="h-5 w-5 text-teal-600" />
                  <h3 className="font-bold">وضعیت فعلی</h3>
                </div>

                {summary ? (
                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <InfoRow label="پیام وضعیت" value={summary.statusMessage || 'فعال و قابل استفاده'} />
                    <InfoRow label="شروع دسترسی" value={summary.accessStartAtUtc ? formatDisplayDateTime(summary.accessStartAtUtc) : 'بدون محدودیت'} />
                    <InfoRow label="پایان دسترسی" value={summary.accessEndAtUtc ? formatDisplayDateTime(summary.accessEndAtUtc) : 'بدون محدودیت'} />
                    <InfoRow
                      label="ساعت مجاز روزانه"
                      value={
                        summary.dailyAccessStartTime && summary.dailyAccessEndTime
                          ? `${toPersianDigits(summary.dailyAccessStartTime)} تا ${toPersianDigits(summary.dailyAccessEndTime)}`
                          : 'بدون محدودیت'
                      }
                    />
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-slate-500">هنوز تنظیمی برای این کاربر ثبت نشده است.</p>
                )}
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2 text-slate-900">
                  <History className="h-5 w-5 text-teal-600" />
                  <h3 className="font-bold">تاریخچه تغییرات</h3>
                </div>

                <div className="mt-4 space-y-3">
                  {audit.length === 0 ? (
                    <p className="text-sm text-slate-500">هنوز لاگی برای این کاربر ثبت نشده است.</p>
                  ) : (
                    visibleAudit.map((entry) => (
                      <div key={entry.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-bold text-slate-800">{translateAuditAction(entry.action)}</div>
                          <div className="text-xs text-slate-500">{formatDisplayDateTime(entry.createdAt)}</div>
                        </div>
                        <div className="mt-2 text-xs text-slate-500">انجام‌دهنده: {entry.performedBy?.trim?.() ?? entry.performedBy}</div>
                      </div>
                    ))
                  )}
                </div>

                {audit.length > 3 && (
                  <button
                    type="button"
                    onClick={() => setShowAllAudit((current) => !current)}
                    className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    {showAllAudit ? 'کمتر' : 'بیشتر'}
                  </button>
                )}
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function StatusBadge({
  active,
  activeLabel,
  inactiveLabel
}: {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
}) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
      }`}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
      <span className="text-slate-500">{label}</span>
      <span className="text-left font-medium text-slate-800">{value}</span>
    </div>
  );
}

function formatDisplayDateTime(value: string) {
  return new Date(value).toLocaleString('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function translateAuditAction(action: string) {
  switch (action) {
    case 'PatientSelfServiceConfigured':
      return 'پیکربندی اولیه دسترسی';
    case 'PatientSelfServiceUpdated':
      return 'بروزرسانی دسترسی';
    case 'PatientSelfServiceRevoked':
      return 'لغو دسترسی';
    default:
      return action;
  }
}

function toPersianDigits(value: string) {
  return value.replace(/[0-9]/g, (digit) => String.fromCharCode(digit.charCodeAt(0) + 1728));
}

function extractApiErrorMessage(error: any) {
  const status: number | undefined = error?.response?.status;
  const data = error?.response?.data;

  const candidates = [
    data?.error,
    data?.message,
    data?.detail,
    data?.title,
    typeof data === 'string' ? data : null,
  ].filter(Boolean) as string[];

  if (candidates.length > 0) {
    return candidates[0];
  }

  if (status === 403) {
    return 'شما مجوز مدیریت این بخش را ندارید.';
  }

  if (status === 401) {
    return 'نشست شما منقضی شده است. دوباره وارد شوید.';
  }

  if (status === 404) {
    return 'برای این کاربر پرونده بیمار/سالمند متصل پیدا نشد.';
  }

  if (status && status >= 500) {
    return 'خطای سرور رخ داده است. لاگ بک‌اند را بررسی کنید.';
  }

  if (!status) {
    return 'ارتباط با سرور برقرار نشد. مطمئن شوید بک‌اند در حال اجراست و آدرس API درست است.';
  }

  return 'دریافت اطلاعات دسترسی با خطا مواجه شد.';
}
