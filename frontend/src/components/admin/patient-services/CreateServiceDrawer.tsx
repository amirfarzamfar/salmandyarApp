'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  X,
  PlusCircle,
  User,
  Calendar,
  Clock,
  MapPin,
  UserCheck,
  Bell,
  ChevronDown,
  ChevronUp,
  Loader2,
  Repeat,
  Search,
  StickyNote,
  RefreshCw,
} from 'lucide-react';
import { patientServicesService } from '@/services/patient-services.service';
import { patientService } from '@/services/patient.service';
import { serviceCatalogService } from '@/services/service-catalog.service';
import {
  ServicePriority,
  ServiceLocationType,
  ServiceRecurrenceType,
  ServiceNotificationRecipientType,
  type CreatePatientServiceDto,
} from '@/types/patient-service';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import PersianDatePicker from '@/components/admin/content/PersianDatePicker';

interface CreateServiceDrawerProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  editingServiceId?: number | null;
  initialData?: Partial<FormData> | null;
}

type FormData = {
  careRecipientId: number | null;
  serviceDefinitionId: number | null;
  customServiceName: string;
  performerId: string | null;
  scheduledDate: string | null;
  scheduledStartTime: string;
  durationMinutes: number;
  priority: ServicePriority;
  locationType: ServiceLocationType;
  description: string;
  locationAddress: string;
  createNotification: boolean;
  notificationTitle: string;
  notificationMessage: string;
  notificationRecipientType: ServiceNotificationRecipientType;
  scheduleEnabled: boolean;
  scheduleStartDate: string | null;
  scheduleStartTime: string;
  scheduleDurationMinutes: number;
  scheduleRecurrenceType: ServiceRecurrenceType;
  scheduleOccurrencesCount: number | null;
  scheduleEndDate: string | null;
};

const priorityOptions = [
  { value: ServicePriority.Normal, label: 'عادی' },
  { value: ServicePriority.Important, label: 'مهم' },
  { value: ServicePriority.Urgent, label: 'فوری' },
];

const locationOptions = [
  { value: ServiceLocationType.PatientHome, label: 'منزل بیمار' },
  { value: ServiceLocationType.MedicalCenter, label: 'مرکز درمانی' },
  { value: ServiceLocationType.Other, label: 'سایر' },
];

const durationOptions = [30, 60, 90, 120];

const recurrenceOptions = [
  { value: ServiceRecurrenceType.None, label: 'بدون تکرار' },
  { value: ServiceRecurrenceType.Daily, label: 'روزانه' },
  { value: ServiceRecurrenceType.Weekly, label: 'هفتگی' },
  { value: ServiceRecurrenceType.Monthly, label: 'ماهانه' },
];

const recipientOptions = [
  { value: ServiceNotificationRecipientType.Patient, label: 'بیمار' },
  { value: ServiceNotificationRecipientType.PatientFamily, label: 'خانواده بیمار' },
  { value: ServiceNotificationRecipientType.Nurse, label: 'پرستار' },
  { value: ServiceNotificationRecipientType.Caregiver, label: 'مراقب' },
  { value: ServiceNotificationRecipientType.Supervisor, label: 'سرپرست' },
  { value: ServiceNotificationRecipientType.All, label: 'همه' },
];

interface FieldProps {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

function Field({ label, icon: Icon, required, error, children, className }: FieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
        {Icon && <Icon className="h-3.5 w-3.5 text-teal-500" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function SelectField<T extends string | number>({
  value,
  onChange,
  options,
  placeholder,
  searchable = false,
  disabled = false,
}: {
  value: T | null;
  onChange: (v: T | null) => void;
  options: { value: T; label: string; subtext?: string }[];
  placeholder: string;
  searchable?: boolean;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = searchable
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()) || (o.subtext || '').toLowerCase().includes(search.toLowerCase()))
    : options;

  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={cn(
          'w-full flex items-center justify-between px-4 py-2.5 rounded-2xl border border-gray-200 bg-white focus:ring-4 focus:ring-teal-500/10 transition-all text-sm text-right',
          !disabled && 'hover:border-teal-400 focus:border-teal-500',
          disabled && 'opacity-60 cursor-not-allowed bg-gray-50',
        )}
      >
        <span className={selected ? 'text-gray-800 font-medium' : 'text-gray-400'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform', open && 'rotate-180')} />
      </button>
      {open && !disabled && (
        <div className="absolute z-30 mt-2 w-full rounded-2xl border border-gray-200 bg-white shadow-lg max-h-64 overflow-hidden">
          {searchable && (
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="جستجو..."
                  className="w-full pr-9 pl-3 py-2 rounded-xl bg-gray-50 border border-gray-100 text-sm focus:outline-none focus:border-teal-400"
                />
              </div>
            </div>
          )}
          <div className="overflow-y-auto max-h-48">
            {filtered.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-400">یافت نشد</div>
            ) : (
              filtered.map((o) => (
                <button
                  key={String(o.value)}
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                    setSearch('');
                  }}
                  className={cn(
                    'w-full px-4 py-2.5 text-right text-sm hover:bg-teal-50 border-b border-gray-50 last:border-0 transition-colors',
                    selected?.value === o.value && 'bg-teal-50 text-teal-700 font-semibold'
                  )}
                >
                  <div>{o.label}</div>
                  {o.subtext && <div className="text-xs text-gray-400 mt-0.5">{o.subtext}</div>}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreateServiceDrawer({ open, onClose, onCreated, editingServiceId, initialData }: CreateServiceDrawerProps) {
  const queryClient = useQueryClient();
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const isEditMode = Boolean(editingServiceId);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      careRecipientId: null,
      serviceDefinitionId: null,
      customServiceName: '',
      performerId: null,
      scheduledDate: null,
      scheduledStartTime: '09:00',
      durationMinutes: 60,
      priority: ServicePriority.Normal,
      locationType: ServiceLocationType.PatientHome,
      description: '',
      locationAddress: '',
      createNotification: false,
      notificationTitle: '',
      notificationMessage: '',
      notificationRecipientType: ServiceNotificationRecipientType.Patient,
      scheduleEnabled: false,
      scheduleStartDate: null,
      scheduleStartTime: '09:00',
      scheduleDurationMinutes: 60,
      scheduleRecurrenceType: ServiceRecurrenceType.None,
      scheduleOccurrencesCount: null,
      scheduleEndDate: null,
      ...(initialData ?? {}),
    },
  });

  React.useEffect(() => {
    if (!open) return;
    if (initialData) {
      reset({
        careRecipientId: null,
        serviceDefinitionId: null,
        customServiceName: '',
        performerId: null,
        scheduledDate: null,
        scheduledStartTime: '09:00',
        durationMinutes: 60,
        priority: ServicePriority.Normal,
        locationType: ServiceLocationType.PatientHome,
        description: '',
        locationAddress: '',
        createNotification: false,
        notificationTitle: '',
        notificationMessage: '',
        notificationRecipientType: ServiceNotificationRecipientType.Patient,
        scheduleEnabled: false,
        scheduleStartDate: null,
        scheduleStartTime: '09:00',
        scheduleDurationMinutes: 60,
        scheduleRecurrenceType: ServiceRecurrenceType.None,
        scheduleOccurrencesCount: null,
        scheduleEndDate: null,
        ...(initialData ?? {}),
      } as FormData);
    } else {
      reset({
        careRecipientId: null,
        serviceDefinitionId: null,
        customServiceName: '',
        performerId: null,
        scheduledDate: null,
        scheduledStartTime: '09:00',
        durationMinutes: 60,
        priority: ServicePriority.Normal,
        locationType: ServiceLocationType.PatientHome,
        description: '',
        locationAddress: '',
        createNotification: false,
        notificationTitle: '',
        notificationMessage: '',
        notificationRecipientType: ServiceNotificationRecipientType.Patient,
        scheduleEnabled: false,
        scheduleStartDate: null,
        scheduleStartTime: '09:00',
        scheduleDurationMinutes: 60,
        scheduleRecurrenceType: ServiceRecurrenceType.None,
        scheduleOccurrencesCount: null,
        scheduleEndDate: null,
      });
    }
  }, [open, initialData, reset]);

  const watchCreateNotification = watch('createNotification');
  const watchScheduleRecurrence = watch('scheduleRecurrenceType');

  const { data: patients = [] } = useQuery({
    queryKey: ['patients-all'],
    queryFn: () => patientService.getAll(),
    enabled: open,
  });

  const { data: serviceDefs = [] } = useQuery({
    queryKey: ['service-definitions-all'],
    queryFn: () => serviceCatalogService.getAll(),
    enabled: open,
  });

  const patientOptions = patients.map((p) => ({
    value: p.id,
    label: `${p.firstName} ${p.lastName}`,
    subtext: `کد: ${p.id} | سن: ${p.age}`,
  }));

  const serviceOptions = serviceDefs.map((s: any) => ({
    value: s.id,
    label: s.title || s.name,
    subtext: s.code ? `کد: ${s.code}` : undefined,
  }));

  const createMutation = useMutation({
    mutationFn: (dto: CreatePatientServiceDto) => patientServicesService.create(dto),
    onSuccess: () => {
      toast.success('خدمت با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: ['patient-services-paged'] });
      queryClient.invalidateQueries({ queryKey: ['patient-services-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['patient-services-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['patientService'] });
      onCreated();
      handleClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'خطا در ایجاد خدمت');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: number; dto: any }) => patientServicesService.update(payload.id, payload.dto),
    onSuccess: () => {
      toast.success('خدمت با موفقیت ویرایش شد');
      queryClient.invalidateQueries({ queryKey: ['patient-services-paged'] });
      queryClient.invalidateQueries({ queryKey: ['patient-services-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['patient-services-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['patientService'] });
      onCreated();
      handleClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'خطا در ویرایش خدمت');
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: (dto: any) => patientServicesService.createSchedule(dto),
    onSuccess: () => {
      toast.success('برنامه‌ریزی خدمت با موفقیت ایجاد شد');
      queryClient.invalidateQueries({ queryKey: ['patient-services-paged'] });
      queryClient.invalidateQueries({ queryKey: ['patient-services-statistics'] });
      queryClient.invalidateQueries({ queryKey: ['patient-services-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['patientService'] });
      onCreated();
      handleClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'خطا در ایجاد برنامه‌ریزی');
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: FormData) => {
    if (!isEditMode && !data.careRecipientId) {
      toast.error('لطفاً بیمار را انتخاب کنید');
      return;
    }
    if (!data.serviceDefinitionId) {
      toast.error('لطفاً نوع خدمت را انتخاب کنید');
      return;
    }
    if (!data.scheduledDate) {
      toast.error('لطفاً تاریخ را انتخاب کنید');
      return;
    }

    if (isEditMode && editingServiceId) {
      const dto = {
        id: editingServiceId,
        dto: {
          serviceDefinitionId: data.serviceDefinitionId,
          customServiceName: data.customServiceName || null,
          scheduledDate: data.scheduledDate,
          scheduledStartTime: data.scheduledStartTime,
          scheduledEndTime: null,
          durationMinutes: data.durationMinutes,
          priority: data.priority,
          locationType: data.locationType,
          description: data.description,
          notes: '',
          locationAddress: data.locationAddress || null,
        },
      };
      updateMutation.mutate(dto);
    } else if (data.scheduleEnabled) {
      const dto: any = {
        careRecipientId: data.careRecipientId,
        serviceDefinitionId: data.serviceDefinitionId,
        customServiceName: data.customServiceName || null,
        startDate: data.scheduleStartDate || data.scheduledDate,
        startTime: data.scheduleStartTime,
        durationMinutes: data.scheduleDurationMinutes,
        recurrenceType: data.scheduleRecurrenceType,
        occurrencesCount: data.scheduleOccurrencesCount,
        endDate: data.scheduleEndDate,
        priority: data.priority,
        locationType: data.locationType,
        locationAddress: data.locationAddress || null,
        description: data.description,
        createNotifications: data.createNotification,
      };
      scheduleMutation.mutate(dto);
    } else {
      const dto: CreatePatientServiceDto = {
        careRecipientId: data.careRecipientId!,
        serviceDefinitionId: data.serviceDefinitionId,
        customServiceName: data.customServiceName || null,
        performerId: data.performerId,
        scheduledDate: data.scheduledDate,
        scheduledStartTime: data.scheduledStartTime,
        durationMinutes: data.durationMinutes,
        priority: data.priority,
        locationType: data.locationType,
        description: data.description,
        locationAddress: data.locationAddress || null,
        createNotification: data.createNotification,
        notificationTitle: data.createNotification ? data.notificationTitle : undefined,
        notificationMessage: data.createNotification ? data.notificationMessage : undefined,
        notificationRecipientType: data.createNotification ? data.notificationRecipientType : undefined,
      };
      createMutation.mutate(dto);
    }
  };

  const isLoading = createMutation.isPending || scheduleMutation.isPending || updateMutation.isPending;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative z-10 w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300" dir="rtl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-l from-teal-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center">
              {isEditMode ? <RefreshCw className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {isEditMode ? 'ویرایش خدمت' : 'ایجاد خدمت جدید'}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {isEditMode ? 'اطلاعات خدمت را ویرایش کنید' : 'اطلاعات خدمت را تکمیل کنید'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="بیمار" icon={User} required={!isEditMode} className="md:col-span-2" error={errors.careRecipientId?.message}>
              <SelectField
                value={watch('careRecipientId')}
                onChange={(v) => setValue('careRecipientId', v as any, { shouldValidate: true })}
                options={patientOptions as any}
                placeholder={isEditMode ? 'غیرقابل ویرایش — بیمار ثابت است' : 'جستجو و انتخاب بیمار...'}
                searchable
                disabled={isEditMode}
              />
            </Field>

            <Field label="نوع خدمت" icon={Calendar} required className="md:col-span-2" error={errors.serviceDefinitionId?.message}>
              <SelectField
                value={watch('serviceDefinitionId')}
                onChange={(v) => setValue('serviceDefinitionId', v as any, { shouldValidate: true })}
                options={serviceOptions as any}
                placeholder="انتخاب نوع خدمت..."
                searchable
              />
            </Field>

            <Field label="نام سفارشی خدمت" icon={StickyNote} className="md:col-span-2">
              <input
                type="text"
                {...register('customServiceName')}
                placeholder="اختیاری - نام دلخواه برای خدمت"
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all text-sm outline-none"
              />
            </Field>

            <Field label="تاریخ خدمت" icon={Calendar} required>
              <PersianDatePicker
                value={watch('scheduledDate')}
                onChange={(v) => setValue('scheduledDate', v, { shouldValidate: true })}
                placeholder="۱۴۰۳/۰۱/۰۱"
                includeTime={false}
              />
            </Field>

            <Field label="ساعت شروع" icon={Clock} required>
              <input
                type="time"
                {...register('scheduledStartTime')}
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all text-sm outline-none"
              />
            </Field>

            <Field label="مدت زمان (دقیقه)" icon={Clock} required>
              <div className="grid grid-cols-4 gap-2">
                {durationOptions.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setValue('durationMinutes', d)}
                    className={cn(
                      'py-2 rounded-xl border text-sm font-medium transition-all',
                      watch('durationMinutes') === d
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-gray-200 hover:border-teal-300 text-gray-600'
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="اولویت" required>
              <div className="grid grid-cols-3 gap-2">
                {priorityOptions.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setValue('priority', p.value)}
                    className={cn(
                      'py-2 rounded-xl border text-sm font-medium transition-all',
                      watch('priority') === p.value
                        ? p.value === ServicePriority.Urgent
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : p.value === ServicePriority.Important
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-gray-200 hover:border-teal-300 text-gray-600'
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="خدمت‌دهنده" icon={UserCheck}>
              <SelectField
                value={watch('performerId')}
                onChange={(v) => setValue('performerId', v as any)}
                options={[]}
                placeholder="انتخاب خدمت‌دهنده (اختیاری)"
              />
            </Field>

            <Field label="محل انجام" icon={MapPin} required>
              <div className="grid grid-cols-3 gap-2">
                {locationOptions.map((l) => (
                  <button
                    key={l.value}
                    type="button"
                    onClick={() => setValue('locationType', l.value)}
                    className={cn(
                      'py-2 rounded-xl border text-sm font-medium transition-all',
                      watch('locationType') === l.value
                        ? 'border-teal-500 bg-teal-50 text-teal-700'
                        : 'border-gray-200 hover:border-teal-300 text-gray-600'
                    )}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="آدرس محل" icon={MapPin} className="md:col-span-2">
              <input
                type="text"
                {...register('locationAddress')}
                placeholder="آدرس دقیق انجام خدمت"
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all text-sm outline-none"
              />
            </Field>

            <Field label="توضیحات" className="md:col-span-2">
              <textarea
                {...register('description')}
                rows={3}
                placeholder="توضیحات مربوط به خدمت..."
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all text-sm outline-none resize-none"
              />
            </Field>
          </div>

          <div className="p-4 rounded-2xl border border-teal-100 bg-teal-50/50 space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-teal-600" />
                <span className="text-sm font-semibold text-gray-800">ایجاد اعلان برای خدمت</span>
              </div>
              <button
                type="button"
                onClick={() => setValue('createNotification', !watchCreateNotification)}
                className={cn(
                  'relative w-12 h-6 rounded-full transition-colors',
                  watchCreateNotification ? 'bg-teal-500' : 'bg-gray-300'
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all',
                    watchCreateNotification ? 'right-0.5' : 'right-6'
                  )}
                />
              </button>
            </label>

            {watchCreateNotification && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-teal-100">
                <Field label="عنوان اعلان" required className="md:col-span-2">
                  <input
                    type="text"
                    {...register('notificationTitle')}
                    placeholder="مثلاً: یادآوری انجام خدمت"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all text-sm outline-none"
                  />
                </Field>
                <Field label="متن اعلان" required className="md:col-span-2">
                  <textarea
                    {...register('notificationMessage')}
                    rows={2}
                    placeholder="متن کامل اعلان..."
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all text-sm outline-none resize-none"
                  />
                </Field>
                <Field label="گیرنده" required className="md:col-span-2">
                  <SelectField
                    value={watch('notificationRecipientType')}
                    onChange={(v) => setValue('notificationRecipientType', v as any)}
                    options={recipientOptions as any}
                    placeholder="انتخاب گیرنده اعلان..."
                  />
                </Field>
              </div>
            )}
          </div>

          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setScheduleOpen(!scheduleOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4 text-teal-600" />
                <span className="font-semibold text-sm text-gray-800">برنامه‌ریزی تکرارشونده</span>
              </div>
              {scheduleOpen ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {scheduleOpen && (
              <div className="p-4 space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-700">فعال کردن برنامه‌ریزی تکرارشونده</span>
                  <button
                    type="button"
                    onClick={() => setValue('scheduleEnabled', !watch('scheduleEnabled'))}
                    className={cn(
                      'relative w-12 h-6 rounded-full transition-colors',
                      watch('scheduleEnabled') ? 'bg-teal-500' : 'bg-gray-300'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all',
                        watch('scheduleEnabled') ? 'right-0.5' : 'right-6'
                      )}
                    />
                  </button>
                </label>

                {watch('scheduleEnabled') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <Field label="تاریخ شروع" icon={Calendar} required>
                      <PersianDatePicker
                        value={watch('scheduleStartDate')}
                        onChange={(v) => setValue('scheduleStartDate', v)}
                        placeholder="انتخاب تاریخ شروع..."
                        includeTime={false}
                      />
                    </Field>

                    <Field label="ساعت شروع" icon={Clock} required>
                      <input
                        type="time"
                        {...register('scheduleStartTime')}
                        className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all text-sm outline-none"
                      />
                    </Field>

                    <Field label="مدت (دقیقه)" icon={Clock} required>
                      <div className="grid grid-cols-4 gap-2">
                        {durationOptions.map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => setValue('scheduleDurationMinutes', d)}
                            className={cn(
                              'py-2 rounded-xl border text-sm font-medium transition-all',
                              watch('scheduleDurationMinutes') === d
                                ? 'border-teal-500 bg-teal-50 text-teal-700'
                                : 'border-gray-200 hover:border-teal-300 text-gray-600'
                            )}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </Field>

                    <Field label="الگوی تکرار" required>
                      <SelectField
                        value={watch('scheduleRecurrenceType')}
                        onChange={(v) => setValue('scheduleRecurrenceType', v as any)}
                        options={recurrenceOptions as any}
                        placeholder="انتخاب تکرار..."
                      />
                    </Field>

                    {watchScheduleRecurrence !== ServiceRecurrenceType.None && (
                      <>
                        <Field label="تعداد دفعات">
                          <input
                            type="number"
                            min={1}
                            {...register('scheduleOccurrencesCount', { valueAsNumber: true })}
                            placeholder="اختیاری"
                            className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all text-sm outline-none"
                          />
                        </Field>
                        <Field label="تا تاریخ">
                          <PersianDatePicker
                            value={watch('scheduleEndDate')}
                            onChange={(v) => setValue('scheduleEndDate', v)}
                            placeholder="اختیاری"
                            includeTime={false}
                          />
                        </Field>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </form>

        <div className="border-t border-gray-200 bg-gray-50 px-5 py-4">
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              type="button"
              onClick={handleClose}
              disabled={isLoading}
            >
              انصراف
            </Button>
            <Button
              variant="primary"
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                void handleSubmit(onSubmit)(e);
              }}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="w-4 h-4 ml-1.5 animate-spin" />}
              {isEditMode ? <RefreshCw className="w-4 h-4 ml-1.5" /> : <PlusCircle className="w-4 h-4 ml-1.5" />}
              {isEditMode ? 'ذخیره تغییرات' : 'ایجاد خدمت'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
