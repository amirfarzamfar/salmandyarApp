'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  X,
  UserCheck,
  Phone,
  Activity,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Wifi,
  WifiOff,
  User,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { patientServicesService } from '@/services/patient-services.service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { ProviderAvailabilityDto } from '@/types/patient-service';

interface AssignProviderDialogProps {
  open: boolean;
  onClose: () => void;
  serviceId: number | null;
  serviceDefinitionId: number | null;
  scheduledDate: string | null;
  scheduledTime: string | null;
  durationMinutes: number | null;
  currentServiceId?: number | null;
}

function WorkloadBar({ percentage }: { percentage: number }) {
  const color =
    percentage >= 90
      ? 'bg-red-500'
      : percentage >= 70
      ? 'bg-orange-500'
      : percentage >= 50
      ? 'bg-yellow-500'
      : 'bg-green-500';

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500">بار کاری</span>
        <span className={cn(
          'font-semibold',
          percentage >= 90 ? 'text-red-600' : percentage >= 70 ? 'text-orange-600' : 'text-gray-700'
        )}>
          {percentage}%
        </span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', color)}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

function ProviderCard({
  provider,
  onSelect,
  isLoading,
}: {
  provider: ProviderAvailabilityDto;
  onSelect: () => void;
  isLoading: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={isLoading}
      className={cn(
        'w-full text-right p-4 rounded-2xl border-2 transition-all group relative',
        provider.hasConflict
          ? 'border-yellow-200 bg-yellow-50/50 hover:border-yellow-400 hover:bg-yellow-50'
          : 'border-gray-200 bg-white hover:border-teal-400 hover:bg-teal-50/50',
        'disabled:opacity-60 disabled:cursor-not-allowed'
      )}
    >
      {provider.hasConflict && (
        <div className="absolute top-3 left-3">
          <Badge className="bg-yellow-500 text-white border-0" variant="default">
            <AlertTriangle className="w-3 h-3 ml-1" />
            تداخل زمانی
          </Badge>
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
          provider.hasConflict ? 'bg-yellow-100' : 'bg-teal-100'
        )}>
          <User className={cn('w-6 h-6', provider.hasConflict ? 'text-yellow-700' : 'text-teal-700')} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="font-bold text-gray-900 truncate">{provider.fullName}</h4>
            <div className="flex items-center gap-1 flex-shrink-0">
              {provider.isOnline ? (
                <span className="flex items-center gap-1 text-xs text-green-600">
                  <Wifi className="w-3 h-3" />
                  آنلاین
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <WifiOff className="w-3 h-3" />
                  آفلاین
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-[10px]">
              {provider.role}
            </Badge>
            {provider.phoneNumber && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Phone className="w-3 h-3" />
                {provider.phoneNumber}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 mb-3 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-teal-600" />
              <span>خدمات امروز: <b className="text-gray-800">{provider.todayServicesCount}</b></span>
            </div>
            {provider.inProgressServicesCount > 0 && (
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                <span>در حال انجام: <b className="text-gray-800">{provider.inProgressServicesCount}</b></span>
              </div>
            )}
          </div>

          <WorkloadBar percentage={provider.workloadPercentage} />

          {provider.hasConflict && provider.conflictDescription && (
            <p className="mt-2 text-xs text-yellow-700 bg-yellow-100/70 rounded-lg p-2">
              <AlertTriangle className="w-3.5 h-3.5 inline ml-1" />
              {provider.conflictDescription}
            </p>
          )}

          <div className="mt-3 pt-3 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="primary"
              size="sm"
              disabled={isLoading}
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 ml-1.5 animate-spin" />}
              <UserCheck className="w-3.5 h-3.5 ml-1.5" />
              اختصاص این خدمت‌دهنده
            </Button>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function AssignProviderDialog({
  open,
  onClose,
  serviceId,
  serviceDefinitionId,
  scheduledDate,
  scheduledTime,
  durationMinutes,
  currentServiceId,
}: AssignProviderDialogProps) {
  const queryClient = useQueryClient();

  const { data: providers = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['availableProviders', serviceDefinitionId, scheduledDate, scheduledTime, durationMinutes, currentServiceId],
    queryFn: () => {
      if (!serviceDefinitionId || !scheduledDate) return Promise.resolve([]);
      return patientServicesService.getAvailableProviders(
        serviceDefinitionId,
        scheduledDate,
        undefined,
        durationMinutes ?? undefined,
        currentServiceId ?? undefined
      );
    },
    enabled: open && !!serviceDefinitionId && !!scheduledDate,
  });

  const assignMutation = useMutation({
    mutationFn: ({ id, performerId }: { id: number; performerId: string }) =>
      patientServicesService.assignProvider(id, { performerId, sendNotification: true }),
    onSuccess: () => {
      toast.success('خدمت‌دهنده با موفقیت اختصاص داده شد');
      queryClient.invalidateQueries({ queryKey: ['patientService', serviceId] });
      queryClient.invalidateQueries({ queryKey: ['patientServices'] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'خطا در اختصاص خدمت‌دهنده');
    },
  });

  const handleSelect = (provider: ProviderAvailabilityDto) => {
    if (!serviceId) {
      toast.error('شناسه خدمت معتبر نیست');
      return;
    }
    if (provider.hasConflict) {
      const confirmed = window.confirm(
        'این خدمت‌دهنده تداخل زمانی دارد. آیا مطمئن هستید که می‌خواهید اختصاص دهید؟'
      );
      if (!confirmed) return;
    }
    assignMutation.mutate({ id: serviceId, performerId: provider.userId });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !isLoading && !assignMutation.isPending && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 bg-white" dir="rtl">
        <DialogHeader className="px-6 py-4 border-b border-gray-200 bg-gradient-to-l from-teal-50 to-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <DialogTitle className="text-right">
                <h2 className="text-lg font-bold text-gray-900">انتخاب خدمت‌دهنده</h2>
                <p className="text-xs text-gray-500 mt-0.5 font-normal">
                  پرستارهای و خدمت‌دهنده‌های در دسترس برای این خدمت
                </p>
              </DialogTitle>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading || assignMutation.isPending}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {isLoading || isFetching ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl border border-gray-200 animate-pulse"
                >
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-gray-200 rounded w-1/3" />
                      <div className="h-4 bg-gray-200 rounded w-1/4" />
                      <div className="h-2 bg-gray-200 rounded w-full mt-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : providers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <UserCheck className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-sm mb-1">خدمت‌دهنده‌ای در دسترس پیدا نشد</p>
              <p className="text-xs text-gray-400 mb-4">
                لطفاً تاریخ یا نوع خدمت را تغییر دهید
              </p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <Loader2 className="w-4 h-4 ml-1.5" />
                بارگذاری مجدد
              </Button>
            </div>
          ) : (
            providers.map((provider) => (
              <ProviderCard
                key={provider.userId}
                provider={provider}
                onSelect={() => handleSelect(provider)}
                isLoading={assignMutation.isPending}
              />
            ))
          )}
        </div>

        {providers.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between sticky bottom-0">
            <p className="text-xs text-gray-500">
              مجموعاً <b className="text-gray-700">{providers.length}</b> نفر در دسترس
              {providers.filter((p) => p.hasConflict).length > 0 && (
                <span className="mr-2 text-yellow-600">
                  ({providers.filter((p) => p.hasConflict).length} نفر با تداخل زمانی)
                </span>
              )}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              {isFetching ? (
                <Loader2 className="w-4 h-4 ml-1.5 animate-spin" />
              ) : null}
              به‌روزرسانی لیست
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
