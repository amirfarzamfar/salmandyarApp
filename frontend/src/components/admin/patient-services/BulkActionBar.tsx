'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  X,
  CheckSquare,
  UserCheck,
  RefreshCw,
  Bell,
  Ban,
  CalendarClock,
  Loader2,
  AlertTriangle,
  ChevronDown,
  Send,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { patientServicesService } from '@/services/patient-services.service';
import { CareServiceStatus } from '@/types/patient-service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import PersianDatePicker from '@/components/admin/content/PersianDatePicker';

interface BulkActionBarProps {
  selectedCount: number;
  selectedIds: number[];
  onClear: () => void;
  onAssign: () => void;
  onCancel: () => void;
  onChangeStatus: (newStatus: CareServiceStatus) => void;
  onReschedule: (newDate: string, newTime: string) => void;
  onSendNotification: (title: string, message: string) => void;
}

const statusOptions = [
  { value: CareServiceStatus.Scheduled, label: 'برنامه‌ریزی شده', className: 'bg-yellow-100 text-yellow-800' },
  { value: CareServiceStatus.Pending, label: 'در انتظار', className: 'bg-orange-100 text-orange-800' },
  { value: CareServiceStatus.Assigned, label: 'اختصاص یافته', className: 'bg-blue-100 text-blue-800' },
  { value: CareServiceStatus.InProgress, label: 'در حال انجام', className: 'bg-cyan-100 text-cyan-800' },
  { value: CareServiceStatus.Completed, label: 'کامل شده', className: 'bg-green-100 text-green-800' },
  { value: CareServiceStatus.Cancelled, label: 'لغو شده', className: 'bg-red-100 text-red-800' },
];

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary' | 'secondary';
  onConfirm: () => void;
  isLoading?: boolean;
  children?: React.ReactNode;
  disabled?: boolean;
}

function ConfirmDialog({
  open,
  onClose,
  title,
  description,
  confirmLabel = 'تایید',
  cancelLabel = 'انصراف',
  variant = 'primary',
  onConfirm,
  isLoading,
  children,
  disabled,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && !isLoading && onClose()}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader className="text-right">
          <DialogTitle className="flex items-center gap-2">
            {variant === 'danger' && <AlertTriangle className="w-5 h-5 text-red-500" />}
            {title}
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-2">{description}</p>
        </DialogHeader>
        {children && <div className="py-2 space-y-3">{children}</div>}
        <DialogFooter className="flex gap-2 justify-end sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === 'danger' ? 'secondary' : variant === 'secondary' ? 'secondary' : 'primary'}
            className={cn(
              variant === 'danger' && 'bg-red-600 hover:bg-red-700 text-white shadow-md'
            )}
            onClick={onConfirm}
            disabled={isLoading || disabled}
          >
            {isLoading && <Loader2 className="w-4 h-4 ml-1.5 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function BulkActionBar({
  selectedCount,
  selectedIds,
  onClear,
  onAssign,
  onCancel,
  onChangeStatus,
  onReschedule,
  onSendNotification,
}: BulkActionBarProps) {
  const queryClient = useQueryClient();

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<CareServiceStatus | null>(null);

  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [newDate, setNewDate] = useState<string | null>(null);
  const [newTime, setNewTime] = useState('09:00');

  const [notifyDialogOpen, setNotifyDialogOpen] = useState(false);
  const [notifyTitle, setNotifyTitle] = useState('');
  const [notifyMessage, setNotifyMessage] = useState('');

  const bulkCancelMutation = useMutation({
    mutationFn: (ids: number[]) =>
      patientServicesService.bulkCancel({
        serviceIds: ids,
        cancelReason: cancelReason || 'لغو جمعی توسط ادمین',
      }),
    onSuccess: (result) => {
      toast.success(`${result.succeeded} مورد با موفقیت لغو شد`);
      if (result.failed > 0) toast.error(`${result.failed} مورد با خطا مواجه شد`);
      queryClient.invalidateQueries({ queryKey: ['patientServices'] });
      setCancelDialogOpen(false);
      setCancelReason('');
      onCancel();
    },
    onError: () => toast.error('خطا در عملیات لغو جمعی'),
  });

  const bulkStatusMutation = useMutation({
    mutationFn: ({ ids, status }: { ids: number[]; status: CareServiceStatus }) =>
      patientServicesService.bulkChangeStatus({
        serviceIds: ids,
        newStatus: status,
      }),
    onSuccess: (result) => {
      toast.success(`${result.succeeded} مورد با موفقیت تغییر وضعیت یافت`);
      if (result.failed > 0) toast.error(`${result.failed} مورد با خطا مواجه شد`);
      queryClient.invalidateQueries({ queryKey: ['patientServices'] });
      setStatusDialogOpen(false);
      setSelectedStatus(null);
      onChangeStatus(selectedStatus!);
    },
    onError: () => toast.error('خطا در تغییر وضعیت جمعی'),
  });

  const bulkRescheduleMutation = useMutation({
    mutationFn: ({ ids, date, time }: { ids: number[]; date: string; time: string }) =>
      patientServicesService.bulkReschedule({
        serviceIds: ids,
        newScheduledDate: date,
        newScheduledTime: time,
      }),
    onSuccess: (result) => {
      toast.success(`${result.succeeded} مورد با موفقیت زمان‌بندی مجدد شد`);
      if (result.failed > 0) toast.error(`${result.failed} مورد با خطا مواجه شد`);
      queryClient.invalidateQueries({ queryKey: ['patientServices'] });
      setRescheduleDialogOpen(false);
      setNewDate(null);
      setNewTime('09:00');
      onReschedule(newDate!, newTime);
    },
    onError: () => toast.error('خطا در زمان‌بندی مجدد جمعی'),
  });

  const bulkNotifyMutation = useMutation({
    mutationFn: ({ ids, title, message }: { ids: number[]; title: string; message: string }) =>
      patientServicesService.bulkSendNotification({
        serviceIds: ids,
        notificationTitle: title,
        notificationMessage: message,
      }),
    onSuccess: (result) => {
      toast.success(`${result.succeeded} اعلان با موفقیت ارسال شد`);
      if (result.failed > 0) toast.error(`${result.failed} مورد با خطا مواجه شد`);
      queryClient.invalidateQueries({ queryKey: ['patientServices'] });
      setNotifyDialogOpen(false);
      setNotifyTitle('');
      setNotifyMessage('');
      onSendNotification(notifyTitle, notifyMessage);
    },
    onError: () => toast.error('خطا در ارسال اعلان جمعی'),
  });

  if (selectedCount <= 0) return null;

  const actionBtnBase =
    'inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border text-sm font-medium transition-all disabled:opacity-50 disabled:pointer-events-none';

  return (
    <>
      <div className="sticky bottom-4 z-30 mx-auto max-w-4xl w-full px-4 animate-in slide-in-from-bottom duration-300">
        <div className="rounded-2xl border border-teal-300 bg-gradient-to-r from-teal-600 to-teal-500 shadow-xl shadow-teal-500/20 p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/20 text-white backdrop-blur-sm">
                <CheckSquare className="w-4 h-4" />
                <span className="text-sm font-bold">{selectedCount} مورد انتخاب شده</span>
              </div>
              <button
                type="button"
                onClick={onClear}
                className="text-white/80 hover:text-white text-sm flex items-center gap-1 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>پاک کردن</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onAssign}
                className={cn(actionBtnBase, 'bg-white text-teal-700 border-teal-100 hover:bg-teal-50')}
              >
                <UserCheck className="w-4 h-4" />
                تخصیص
              </button>

              <button
                type="button"
                onClick={() => setStatusDialogOpen(true)}
                className={cn(actionBtnBase, 'bg-white text-slate-700 border-slate-100 hover:bg-slate-50')}
              >
                <RefreshCw className="w-4 h-4" />
                تغییر وضعیت
              </button>

              <button
                type="button"
                onClick={() => setNotifyDialogOpen(true)}
                className={cn(actionBtnBase, 'bg-white text-blue-700 border-blue-100 hover:bg-blue-50')}
              >
                <Bell className="w-4 h-4" />
                ارسال اعلان
              </button>

              <button
                type="button"
                onClick={() => setRescheduleDialogOpen(true)}
                className={cn(actionBtnBase, 'bg-white text-orange-700 border-orange-100 hover:bg-orange-50')}
              >
                <CalendarClock className="w-4 h-4" />
                تغییر تاریخ
              </button>

              <button
                type="button"
                onClick={() => setCancelDialogOpen(true)}
                className={cn(actionBtnBase, 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100')}
              >
                <Ban className="w-4 h-4" />
                لغو
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        title="لغو خدمات انتخاب شده"
        description={`آیا از لغو ${selectedCount} خدمت انتخاب شده مطمئن هستید؟ این عملیات قابل بازگشت نیست.`}
        confirmLabel="بله، لغو شوند"
        variant="danger"
        isLoading={bulkCancelMutation.isPending}
        onConfirm={() => bulkCancelMutation.mutate(selectedIds)}
      >
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600">دلیل لغو (اختیاری)</label>
          <textarea
            rows={2}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="دلیل لغو خدمات را در صورت نیاز بنویسید..."
            className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/10 transition-all text-sm outline-none resize-none"
          />
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        title="تغییر وضعیت خدمات"
        description={`وضعیت جدید برای ${selectedCount} خدمت انتخاب شده را مشخص کنید.`}
        confirmLabel="اعمال تغییرات"
        isLoading={bulkStatusMutation.isPending}
        onConfirm={() => {
          if (selectedStatus != null) {
            bulkStatusMutation.mutate({ ids: selectedIds, status: selectedStatus });
          }
        }}
        disabled={selectedStatus == null}
      >
        <div className="grid grid-cols-2 gap-2">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSelectedStatus(opt.value)}
              className={cn(
                'p-3 rounded-xl border-2 text-sm font-semibold transition-all text-center',
                selectedStatus === opt.value
                  ? 'border-teal-500 ring-2 ring-teal-500/20 bg-teal-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white',
                opt.className
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={rescheduleDialogOpen}
        onClose={() => setRescheduleDialogOpen(false)}
        title="زمان‌بندی مجدد خدمات"
        description={`تاریخ و ساعت جدید برای ${selectedCount} خدمت انتخاب شده را وارد کنید.`}
        confirmLabel="اعمال زمان‌بندی"
        variant="secondary"
        isLoading={bulkRescheduleMutation.isPending}
        onConfirm={() => {
          if (newDate) {
            bulkRescheduleMutation.mutate({ ids: selectedIds, date: newDate, time: newTime });
          }
        }}
        disabled={!newDate}
      >
        <div className="grid grid-cols-2 gap-3">
          <PersianDatePicker
            value={newDate}
            onChange={setNewDate}
            placeholder="انتخاب تاریخ جدید..."
            label="تاریخ جدید"
            includeTime={false}
          />
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block">ساعت جدید</label>
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all text-sm outline-none"
            />
          </div>
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={notifyDialogOpen}
        onClose={() => setNotifyDialogOpen(false)}
        title="ارسال اعلان جمعی"
        description={`برای ${selectedCount} خدمت انتخاب شده اعلان ارسال کنید.`}
        confirmLabel="ارسال اعلان‌ها"
        isLoading={bulkNotifyMutation.isPending}
        onConfirm={() => {
          if (notifyTitle.trim() && notifyMessage.trim()) {
            bulkNotifyMutation.mutate({ ids: selectedIds, title: notifyTitle, message: notifyMessage });
          }
        }}
        disabled={!notifyTitle.trim() || !notifyMessage.trim()}
      >
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block flex items-center gap-1">
              <Send className="w-3.5 h-3.5 text-teal-500" />
              عنوان اعلان *
            </label>
            <input
              type="text"
              value={notifyTitle}
              onChange={(e) => setNotifyTitle(e.target.value)}
              placeholder="عنوان اعلان را وارد کنید..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all text-sm outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 block flex items-center gap-1">
              <Bell className="w-3.5 h-3.5 text-teal-500" />
              متن اعلان *
            </label>
            <textarea
              rows={3}
              value={notifyMessage}
              onChange={(e) => setNotifyMessage(e.target.value)}
              placeholder="متن کامل اعلان را بنویسید..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all text-sm outline-none resize-none"
            />
          </div>
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 w-full justify-center py-1.5">
            <Bell className="w-3.5 h-3.5 ml-1" />
            اعلان‌ها از طریق درون‌برنامه و پیامک ارسال می‌شوند
          </Badge>
        </div>
      </ConfirmDialog>
    </>
  );
}
