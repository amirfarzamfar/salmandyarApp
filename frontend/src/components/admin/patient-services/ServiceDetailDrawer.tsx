'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  X,
  User,
  Calendar,
  Clock,
  MapPin,
  UserCheck,
  Bell,
  Activity,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Play,
  Send,
  RefreshCw,
  ArrowLeftRight,
  Pencil,
} from 'lucide-react';
import { patientServicesService } from '@/services/patient-services.service';
import {
  CareServiceStatus,
  ServicePriority,
  ServiceLocationType,
  ServiceActivityType,
  ServiceNotificationStatus,
  type PatientServiceDetailDto,
} from '@/types/patient-service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface ServiceDetailDrawerProps {
  open: boolean;
  serviceId: number | null;
  onClose: () => void;
  onChangeProvider: (serviceId: number) => void;
  onChangeStatus: (serviceId: number, newStatus: CareServiceStatus) => void;
  onEdit?: (serviceId: number) => void;
}

const statusMap: Record<CareServiceStatus, { label: string; className: string }> = {
  [CareServiceStatus.Draft]: { label: 'پیشنویس', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  [CareServiceStatus.Scheduled]: { label: 'برنامه‌ریزی شده', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  [CareServiceStatus.Pending]: { label: 'در انتظار', className: 'bg-orange-100 text-orange-800 border-orange-200' },
  [CareServiceStatus.Assigned]: { label: 'اختصاص یافته', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  [CareServiceStatus.Accepted]: { label: 'پذیرفته شده', className: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  [CareServiceStatus.InProgress]: { label: 'در حال انجام', className: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  [CareServiceStatus.Completed]: { label: 'کامل شده', className: 'bg-green-100 text-green-800 border-green-200' },
  [CareServiceStatus.Cancelled]: { label: 'لغو شده', className: 'bg-red-100 text-red-800 border-red-200' },
  [CareServiceStatus.NoShow]: { label: 'مراجعه نشد', className: 'bg-purple-100 text-purple-800 border-purple-200' },
  [CareServiceStatus.Expired]: { label: 'منقضی شده', className: 'bg-slate-100 text-slate-800 border-slate-200' },
};

const getStatusInfo = (status: CareServiceStatus) =>
  statusMap[status] ?? statusMap[CareServiceStatus.Scheduled] ?? { label: 'نامشخص', className: 'bg-gray-100 text-gray-700 border-gray-200' };

const getPriorityInfo = (p: ServicePriority) =>
  priorityMap[p] ?? priorityMap[ServicePriority.Normal] ?? { label: 'عادی', className: 'bg-slate-100 text-slate-700' };

const getNotificationStatusInfo = (s: ServiceNotificationStatus) =>
  notificationStatusMap[s] ?? notificationStatusMap[ServiceNotificationStatus.Draft] ?? { label: 'نامشخص', className: 'bg-gray-100 text-gray-600' };

const priorityMap: Record<ServicePriority, { label: string; className: string }> = {
  [ServicePriority.Normal]: { label: 'عادی', className: 'bg-slate-100 text-slate-700' },
  [ServicePriority.Important]: { label: 'مهم', className: 'bg-orange-100 text-orange-700' },
  [ServicePriority.Urgent]: { label: 'فوری', className: 'bg-red-100 text-red-700' },
};

const locationMap: Record<ServiceLocationType, string> = {
  [ServiceLocationType.PatientHome]: 'منزل بیمار',
  [ServiceLocationType.MedicalCenter]: 'مرکز درمانی',
  [ServiceLocationType.Other]: 'سایر',
};

const activityIconMap: Partial<Record<ServiceActivityType, React.ComponentType<{ className?: string }>>> = {
  [ServiceActivityType.Created]: Activity,
  [ServiceActivityType.StatusChanged]: RefreshCw,
  [ServiceActivityType.Assigned]: UserCheck,
  [ServiceActivityType.ProviderChanged]: ArrowLeftRight,
  [ServiceActivityType.ScheduleUpdated]: Calendar,
  [ServiceActivityType.NotificationSent]: Bell,
  [ServiceActivityType.DetailsUpdated]: RefreshCw,
  [ServiceActivityType.Cancelled]: AlertCircle,
  [ServiceActivityType.Completed]: CheckCircle2,
  [ServiceActivityType.Started]: Play,
  [ServiceActivityType.Accepted]: CheckCircle2,
  [ServiceActivityType.Declined]: AlertCircle,
  [ServiceActivityType.NoShow]: AlertCircle,
  [ServiceActivityType.PriorityChanged]: AlertCircle,
  [ServiceActivityType.NoteAdded]: Activity,
};

const notificationStatusMap: Record<ServiceNotificationStatus, { label: string; className: string }> = {
  [ServiceNotificationStatus.NotCreated]: { label: 'ایجاد نشده', className: 'bg-gray-100 text-gray-600' },
  [ServiceNotificationStatus.Draft]: { label: 'پیشنویس', className: 'bg-slate-100 text-slate-700' },
  [ServiceNotificationStatus.Scheduled]: { label: 'زمان‌بندی شده', className: 'bg-blue-100 text-blue-700' },
  [ServiceNotificationStatus.Sent]: { label: 'ارسال شده', className: 'bg-yellow-100 text-yellow-700' },
  [ServiceNotificationStatus.Delivered]: { label: 'تحویل داده شده', className: 'bg-teal-100 text-teal-700' },
  [ServiceNotificationStatus.Read]: { label: 'خوانده شده', className: 'bg-green-100 text-green-700' },
  [ServiceNotificationStatus.Failed]: { label: 'خطا در ارسال', className: 'bg-red-100 text-red-700' },
};

interface SectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ title, icon: Icon, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-teal-600" />
          <span className="font-semibold text-sm text-gray-800">{title}</span>
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
      </button>
      {open && <div className="p-4 space-y-3">{children}</div>}
    </div>
  );
}

function InfoRow({ label, value, action }: { label: string; value: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500 min-w-[100px]">{label}</span>
      <div className="flex-1 text-right">
        <div className="text-sm font-medium text-gray-800">{value}</div>
      </div>
      {action}
    </div>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse bg-gray-200 rounded-lg', className)} />;
}

export default function ServiceDetailDrawer({
  open,
  serviceId,
  onClose,
  onChangeProvider,
  onChangeStatus,
  onEdit,
}: ServiceDetailDrawerProps) {
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['patientService', serviceId],
    queryFn: () => patientServicesService.getById(serviceId!),
    enabled: open && serviceId != null,
  });

  const detail = data as PatientServiceDetailDto | undefined;

  const startMutation = useMutation({
    mutationFn: (id: number) => patientServicesService.start(id),
    onSuccess: () => {
      toast.success('خدمت با موفقیت شروع شد');
      queryClient.invalidateQueries({ queryKey: ['patientService', serviceId] });
    },
    onError: () => toast.error('خطا در شروع خدمت'),
  });

  const completeMutation = useMutation({
    mutationFn: (id: number) => patientServicesService.complete(id),
    onSuccess: () => {
      toast.success('خدمت با موفقیت تکمیل شد');
      queryClient.invalidateQueries({ queryKey: ['patientService', serviceId] });
    },
    onError: () => toast.error('خطا در تکمیل خدمت'),
  });

  const sendNotificationMutation = useMutation({
    mutationFn: (dto: { careServiceId: number; title: string; message: string; recipientType: number }) =>
      patientServicesService.createNotification(dto),
    onSuccess: () => {
      toast.success('اعلان با موفقیت ارسال شد');
      queryClient.invalidateQueries({ queryKey: ['patientService', serviceId] });
    },
    onError: () => toast.error('خطا در ارسال اعلان'),
  });

  const handleSendQuickNotification = () => {
    if (!detail) return;
    sendNotificationMutation.mutate({
      careServiceId: detail.id,
      title: 'یادآوری خدمت',
      message: `خدمت ${detail.serviceDefinitionTitle} برای ${detail.patientFullName} در ${detail.scheduledDate} برنامه‌ریزی شده است.`,
      recipientType: 1,
    });
  };

  const formatDate = (iso?: string | null) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return d.toLocaleDateString('fa-IR') + ' ' + d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  };

  const canStart = detail && (detail.status === CareServiceStatus.Pending || detail.status === CareServiceStatus.Assigned || detail.status === CareServiceStatus.Accepted || detail.status === CareServiceStatus.Scheduled);
  const canComplete = detail && detail.status === CareServiceStatus.InProgress;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300" dir="rtl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-l from-teal-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">جزئیات خدمت</h2>
              {detail && (
                <p className="text-xs text-gray-500 mt-0.5">کد خدمت: #{detail.id}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {isLoading || isFetching ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : !detail ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <AlertCircle className="w-12 h-12 mb-3 opacity-50" />
              <p>اطلاعات خدمت در دسترس نیست</p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-gray-100">
                <Badge className={cn(getStatusInfo(detail.status).className, 'border')} variant="outline">
                  {getStatusInfo(detail.status).label}
                </Badge>
                <Badge className={getPriorityInfo(detail.priority).className} variant="secondary">
                  {getPriorityInfo(detail.priority).label}
                </Badge>
              </div>

              <Section title="اطلاعات بیمار" icon={User}>
                <InfoRow label="نام بیمار" value={detail.patientFullName} />
                <InfoRow label="سن" value={`${detail.patientAge} سال`} />
                <InfoRow label="کد بیمار" value={detail.patientCode || '—'} />
                <InfoRow label="شماره تماس" value={detail.patientPhone || '—'} />
                <InfoRow
                  label="وضعیت"
                  value={<Badge variant="outline">{detail.patientStatus}</Badge>}
                />
              </Section>

              <Section title="اطلاعات خدمت" icon={Calendar}>
                <InfoRow label="نوع خدمت" value={detail.customServiceName || detail.serviceDefinitionTitle} />
                <InfoRow label="توضیحات" value={detail.description || '—'} />
                <InfoRow label="تاریخ" value={formatDate(detail.scheduledDate)} />
                <InfoRow label="ساعت" value={detail.scheduledStartTime ? detail.scheduledStartTime.slice(0, 5) : '—'} />
                <InfoRow label="مدت زمان" value={detail.durationMinutes ? `${detail.durationMinutes} دقیقه` : '—'} />
                <InfoRow
                  label="وضعیت"
                  value={<Badge className={cn(getStatusInfo(detail.status).className, 'border')} variant="outline">{getStatusInfo(detail.status).label}</Badge>}
                />
                <InfoRow
                  label="اولویت"
                  value={<Badge className={getPriorityInfo(detail.priority).className} variant="secondary">{getPriorityInfo(detail.priority).label}</Badge>}
                />
                <InfoRow label="محل انجام" value={locationMap[detail.locationType]} />
                {detail.locationAddress && <InfoRow label="آدرس" value={detail.locationAddress} />}
              </Section>

              <Section title="خدمت‌دهنده اختصاص داده شده" icon={UserCheck}>
                {detail.performerFullName ? (
                  <>
                    <InfoRow label="نام" value={detail.performerFullName} />
                    <InfoRow label="نقش" value={detail.performerRole || '—'} />
                    <InfoRow label="شماره تماس" value={detail.performerPhone || '—'} />
                    <InfoRow label="زمان تخصیص" value={formatDate(detail.assignedAt)} />
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onChangeProvider(detail.id)}
                        className="w-full"
                      >
                        <RefreshCw className="w-4 h-4 ml-1.5" />
                        تغییر خدمت‌دهنده
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="py-4 text-center">
                    <AlertCircle className="w-10 h-10 mx-auto mb-2 text-orange-500" />
                    <p className="text-sm text-gray-600 mb-3">هنوز خدمت‌دهنده‌ای به این خدمت اختصاص داده نشده است</p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onChangeProvider(detail.id)}
                    >
                      <UserCheck className="w-4 h-4 ml-1.5" />
                      اختصاص خدمت‌دهنده
                    </Button>
                  </div>
                )}
              </Section>

              <Section title="اعلان‌ها" icon={Bell}>
                {detail.notifications && detail.notifications.length > 0 ? (
                  <div className="space-y-3">
                    {detail.notifications.map((n) => (
                      <div key={n.id} className="p-3 rounded-lg border border-gray-100 bg-gray-50">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-800">{n.title}</div>
                            <div className="text-xs text-gray-600 mt-0.5">{n.message}</div>
                          </div>
                          <Badge
                            className={cn(getNotificationStatusInfo(n.status).className, 'flex-shrink-0')}
                            variant="secondary"
                          >
                            {getNotificationStatusInfo(n.status).label}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
                          <span>گیرنده: {n.recipientDisplayName}</span>
                          <span>{formatDate(n.readAt || n.deliveredAt || n.sentAt || n.createdAtUtc)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-3 text-center text-sm text-gray-500">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    اعلانی ثبت نشده است
                  </div>
                )}
                <div className="pt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleSendQuickNotification}
                    disabled={sendNotificationMutation.isPending}
                    className="w-full"
                  >
                    {sendNotificationMutation.isPending ? (
                      <Loader2 className="w-4 h-4 ml-1.5 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 ml-1.5" />
                    )}
                    ارسال اعلان سریع
                  </Button>
                </div>
              </Section>

              <Section title="گزارش فعالیت‌ها" icon={Activity} defaultOpen={false}>
                {detail.activityLogs && detail.activityLogs.length > 0 ? (
                  <div className="relative mr-2 border-r-2 border-gray-200 space-y-4 py-1">
                    {detail.activityLogs.map((log) => {
                      const Icon = activityIconMap[log.activityType] || Activity;
                      return (
                        <div key={log.id} className="relative pr-5">
                          <div className="absolute -right-3.5 top-0 w-7 h-7 rounded-full bg-white border-2 border-teal-400 flex items-center justify-center">
                            <Icon className="w-3.5 h-3.5 text-teal-600" />
                          </div>
                          <div className="p-3 rounded-lg border border-gray-100 bg-white">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="text-sm font-semibold text-gray-800">{log.title}</div>
                                {log.description && (
                                  <div className="text-xs text-gray-600 mt-1">{log.description}</div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-2 text-xs text-gray-500 pt-2 border-t border-gray-50">
                              <span>توسط {log.actorName} ({log.actorRole})</span>
                              <span>{formatDate(log.createdAtUtc)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-3 text-center text-sm text-gray-500">
                    فعالیتی ثبت نشده است
                  </div>
                )}
              </Section>
            </>
          )}
        </div>

        {detail && (
          <div className="border-t border-gray-200 bg-gray-50 px-5 py-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              {canStart && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    startMutation.mutate(detail.id);
                    onChangeStatus(detail.id, CareServiceStatus.InProgress);
                  }}
                  disabled={startMutation.isPending}
                >
                  {startMutation.isPending ? <Loader2 className="w-4 h-4 ml-1.5 animate-spin" /> : <Play className="w-4 h-4 ml-1.5" />}
                  شروع خدمت
                </Button>
              )}
              {canComplete && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    completeMutation.mutate(detail.id);
                    onChangeStatus(detail.id, CareServiceStatus.Completed);
                  }}
                  disabled={completeMutation.isPending}
                >
                  {completeMutation.isPending ? <Loader2 className="w-4 h-4 ml-1.5 animate-spin" /> : <CheckCircle2 className="w-4 h-4 ml-1.5" />}
                  تکمیل خدمت
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onChangeProvider(detail.id)}
              >
                <UserCheck className="w-4 h-4 ml-1.5" />
                {detail.performerFullName ? 'تغییر خدمت‌دهنده' : 'اختصاص خدمت‌دهنده'}
              </Button>
              {onEdit && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onEdit(detail.id)}
                >
                  <Pencil className="w-4 h-4 ml-1.5" />
                  ویرایش اطلاعات
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSendQuickNotification}
                disabled={sendNotificationMutation.isPending}
              >
                <Bell className="w-4 h-4 ml-1.5" />
                ارسال اعلان
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
