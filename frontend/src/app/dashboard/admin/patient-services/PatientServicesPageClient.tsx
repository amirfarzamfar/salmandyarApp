"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, keepPreviousData, useQueryClient, useMutation } from "@tanstack/react-query";
import type {
  PagedResponse,
  PatientServiceStatisticsDto,
  PatientServiceListItemDto,
  CalendarEventDto,
  BulkServiceActionResult,
  ProviderAvailabilityDto,
  PatientServiceDetailDto,
} from "@/types/patient-service";
import { toast } from "react-hot-toast";
import { Plus, ClipboardList } from "lucide-react";
import { patientServicesService } from "@/services/patient-services.service";
import type { PatientServiceQueryFilters } from "@/types/patient-service";
import {
  CareServiceStatus,
  ServiceAssignmentStatus,
  ServiceNotificationRecipientType,
  ServiceNotificationChannel,
  ServicePriority,
  ServiceLocationType,
} from "@/types/patient-service";
import { Button } from "@/components/ui/Button";
import { StatsCards, type StatsFilterKey } from "@/components/admin/patient-services/StatsCards";
import { ServiceFilterBar } from "@/components/admin/patient-services/ServiceFilterBar";
import { ServiceListTable } from "@/components/admin/patient-services/ServiceListTable";
import { ViewSwitcher, type ViewMode } from "@/components/admin/patient-services/ViewSwitcher";
import ServiceDetailDrawer from "@/components/admin/patient-services/ServiceDetailDrawer";
import CreateServiceDrawer from "@/components/admin/patient-services/CreateServiceDrawer";
import AssignProviderDialog from "@/components/admin/patient-services/AssignProviderDialog";
import SimpleCalendarView from "@/components/admin/patient-services/SimpleCalendarView";
import BulkActionBar from "@/components/admin/patient-services/BulkActionBar";

const DEBOUNCE_MS = 300;
const DEFAULT_PAGE_SIZE = 10;

const emptyFilters: PatientServiceQueryFilters = {
  pageNumber: 1,
  pageSize: DEFAULT_PAGE_SIZE,
};

function useDebouncedValue<T>(value: T, delay: number = DEBOUNCE_MS): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

type StatsFilterMap = Record<StatsFilterKey, PatientServiceQueryFilters>;

const statsFilterMap: StatsFilterMap = {
  all: {},
  today: {
    fromDate: new Date().toISOString().slice(0, 10),
    toDate: new Date().toISOString().slice(0, 10),
  },
  pending: { status: CareServiceStatus.Pending },
  inProgress: { status: CareServiceStatus.InProgress },
  completed: { status: CareServiceStatus.Completed },
  cancelled: { status: CareServiceStatus.Cancelled },
  unassigned: {
    assignmentStatus: ServiceAssignmentStatus.Unassigned,
  },
  withNotification: { onlyWithNotification: true },
};

export default function PatientServicesPageClient() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<PatientServiceQueryFilters>(emptyFilters);
  const [rawSearch, setRawSearch] = useState<string>(filters.searchQuery ?? "");
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [activeStatsFilter, setActiveStatsFilter] = useState<StatsFilterKey>("all");
  const [appliedStatsFilter, setAppliedStatsFilter] = useState<PatientServiceQueryFilters>({});

  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);

  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [editingInitialData, setEditingInitialData] = useState<Partial<any> | null>(null);

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignContext, setAssignContext] = useState<{
    serviceId: number | null;
    serviceDefinitionId: number | null;
    scheduledDate: string | null;
    scheduledTime: string | null;
    durationMinutes: number | null;
  }>({
    serviceId: null,
    serviceDefinitionId: null,
    scheduledDate: null,
    scheduledTime: null,
    durationMinutes: null,
  });

  const debouncedSearch = useDebouncedValue(rawSearch);

  useEffect(() => {
    if (debouncedSearch !== (filters.searchQuery ?? "")) {
      setFilters((prev) => ({
        ...prev,
        searchQuery: debouncedSearch || null,
        pageNumber: 1,
      }));
    }
  }, [debouncedSearch, filters.searchQuery]);

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: ["patient-services-paged"] });
    void queryClient.invalidateQueries({ queryKey: ["patient-services-statistics"] });
    void queryClient.invalidateQueries({ queryKey: ["patient-services-calendar"] });
    void queryClient.invalidateQueries({ queryKey: ["patient-services-detail"] });
  };

  const handleStatsFilterChange = (key: StatsFilterKey) => {
    const next = key === activeStatsFilter ? "all" : key;
    setActiveStatsFilter(next);
    const patch = statsFilterMap[next];
    setAppliedStatsFilter(patch);
    setFilters((prev) => ({
      ...emptyFilters,
      ...patch,
      pageSize: prev.pageSize,
      searchQuery: prev.searchQuery,
    }));
  };

  const handleCreateNew = () => setCreateDrawerOpen(true);

  const handleOpenDetail = (svc: PatientServiceListItemDto) => {
    setSelectedServiceId(svc.id);
    setDetailDrawerOpen(true);
  };

  const handleCalendarEventClick = (serviceId: number) => {
    setSelectedServiceId(serviceId);
    setDetailDrawerOpen(true);
  };

  const handleOpenEditForService = (svc: PatientServiceListItemDto | PatientServiceDetailDto) => {
    const rawDate = (svc as any).scheduledDate;
    let normalizedScheduledDate: string | null = null;
    if (rawDate) {
      try {
        const d = new Date(rawDate);
        if (!isNaN(d.getTime())) {
          normalizedScheduledDate = d.toISOString();
        }
      } catch {
        normalizedScheduledDate = null;
      }
    }

    const rawStartTime = (svc as any).scheduledStartTime;
    let normalizedStartTime: string = '09:00';
    if (rawStartTime && typeof rawStartTime === 'string' && rawStartTime.includes(':')) {
      const parts = rawStartTime.split(':');
      if (parts.length >= 2) {
        const hh = String(parseInt(parts[0], 10)).padStart(2, '0');
        const mm = String(parseInt(parts[1], 10)).padStart(2, '0');
        normalizedStartTime = `${hh}:${mm}`;
      }
    }

    setEditingServiceId(svc.id);
    setEditingInitialData({
      careRecipientId: svc.careRecipientId,
      serviceDefinitionId: svc.serviceDefinitionId,
      customServiceName: (svc as any).customServiceName ?? '',
      performerId: (svc as any).performerId ?? null,
      scheduledDate: normalizedScheduledDate,
      scheduledStartTime: normalizedStartTime,
      durationMinutes: (svc as any).durationMinutes ?? 60,
      priority: (svc as any).priority ?? 0,
      locationType: (svc as any).locationType ?? 0,
      description: (svc as any).description ?? '',
      locationAddress: (svc as any).locationAddress ?? '',
    });
    setEditDrawerOpen(true);
    setDetailDrawerOpen(false);
  };

  const handleCreatedOrUpdated = () => {
    invalidateAll();
    setCreateDrawerOpen(false);
    setSelectedServiceIds([]);
  };

  const handleChangeStatusMutation = useMutation({
    mutationFn: async ({
      serviceId,
      newStatus,
      reason,
      notes,
    }: {
      serviceId: number;
      newStatus: CareServiceStatus;
      reason?: string;
      notes?: string;
    }) => patientServicesService.changeStatus(serviceId, { newStatus, reason, notes }),
    onSuccess: () => {
      toast.success("وضعیت خدمت با موفقیت تغییر کرد.");
      invalidateAll();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "خطا در تغییر وضعیت خدمت.");
    },
  });

  const handleChangeStatus = (serviceId: number, newStatus: CareServiceStatus) => {
    void handleChangeStatusMutation.mutateAsync({ serviceId, newStatus });
  };

  const handleOpenAssignForService = (svc: PatientServiceListItemDto) => {
    setAssignContext({
      serviceId: svc.id,
      serviceDefinitionId: svc.serviceDefinitionId,
      scheduledDate: svc.scheduledDate,
      scheduledTime: svc.scheduledStartTime ?? null,
      durationMinutes: null,
    });
    setAssignDialogOpen(true);
  };

  const handleChangeProviderFromDrawer = (serviceId: number) => {
    const current = (queryClient.getQueryData(["patientService", serviceId]) as any) ?? null;
    setAssignContext({
      serviceId,
      serviceDefinitionId: current?.serviceDefinitionId ?? null,
      scheduledDate: current?.scheduledDate ?? null,
      scheduledTime: current?.scheduledStartTime ?? null,
      durationMinutes: current?.durationMinutes ?? null,
    });
    setAssignDialogOpen(true);
  };

  const handleEditFromDrawer = (serviceId: number) => {
    const current = (queryClient.getQueryData(["patientService", serviceId]) as PatientServiceDetailDto | undefined) ?? null;
    if (!current) return;
    handleOpenEditForService(current);
  };

  const pagedQueryKey = useMemo(() => ["patient-services-paged", filters], [filters]);

  const statsQueryKey = useMemo(
    () => [
      "patient-services-statistics",
      {
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        careRecipientId: filters.careRecipientId,
        serviceDefinitionId: filters.serviceDefinitionId,
        performerId: filters.performerId,
      },
    ],
    [
      filters.fromDate,
      filters.toDate,
      filters.careRecipientId,
      filters.serviceDefinitionId,
      filters.performerId,
    ]
  );

  const calendarQueryKey = useMemo(
    () => [
      "patient-services-calendar",
      {
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        careRecipientId: filters.careRecipientId,
        serviceDefinitionId: filters.serviceDefinitionId,
        performerId: filters.performerId,
        status: filters.status,
        onlyUnassigned: filters.onlyUnassigned,
      },
    ],
    [
      filters.fromDate,
      filters.toDate,
      filters.careRecipientId,
      filters.serviceDefinitionId,
      filters.performerId,
      filters.status,
      filters.onlyUnassigned,
    ]
  );

  const statisticsQuery = useQuery<PatientServiceStatisticsDto>({
    queryKey: statsQueryKey,
    queryFn: () =>
      patientServicesService.getStatistics({
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        careRecipientId: filters.careRecipientId,
        serviceDefinitionId: filters.serviceDefinitionId,
        performerId: filters.performerId,
      }),
    staleTime: 30_000,
  });

  const pagedQuery = useQuery<PagedResponse<PatientServiceListItemDto>>({
    queryKey: pagedQueryKey,
    queryFn: () => patientServicesService.getPaged(filters),
    staleTime: 15_000,
    placeholderData: keepPreviousData,
  });

  const calendarRange = useMemo(() => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 2, 0);
    return {
      fromDate: from.toISOString().slice(0, 10),
      toDate: to.toISOString().slice(0, 10),
    };
  }, []);

  const calendarQuery = useQuery<CalendarEventDto[]>({
    queryKey: calendarQueryKey,
    queryFn: () =>
      patientServicesService.getCalendarEvents(
        filters.fromDate ?? calendarRange.fromDate,
        filters.toDate ?? calendarRange.toDate,
        {
          careRecipientId: filters.careRecipientId,
          serviceDefinitionId: filters.serviceDefinitionId,
          performerId: filters.performerId,
          status: filters.status,
          onlyUnassigned: filters.onlyUnassigned,
        }
      ),
    staleTime: 60_000,
    enabled: viewMode === "calendar",
  });

  const handleFilterChange = (next: PatientServiceQueryFilters) => {
    setActiveStatsFilter("all");
    setAppliedStatsFilter({});
    setFilters(next);
    if (next.searchQuery !== undefined && next.searchQuery !== rawSearch) {
      setRawSearch(next.searchQuery ?? "");
    }
  };

  const handleToggleSelection = (id: number) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleToggleAll = () => {
    const items = pagedQuery.data?.items ?? [];
    const allSelected =
      items.length > 0 && items.every((it) => selectedServiceIds.includes(it.id));
    if (allSelected) {
      const ids = new Set(items.map((it) => it.id));
      setSelectedServiceIds((prev) => prev.filter((id) => !ids.has(id)));
    } else {
      setSelectedServiceIds((prev) => {
        const set = new Set(prev);
        items.forEach((it) => set.add(it.id));
        return Array.from(set);
      });
    }
  };

  const handlePageChange = (pageNumber: number) => {
    setFilters((prev) => ({ ...prev, pageNumber }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setFilters((prev) => ({ ...prev, pageNumber: 1, pageSize }));
  };

  const handleRetry = () => {
    void pagedQuery.refetch();
    void statisticsQuery.refetch();
    void calendarQuery.refetch();
  };

  const bulkAssignMutation = useMutation<BulkServiceActionResult, any, { performerId: string }>({
    mutationFn: ({ performerId }) =>
      patientServicesService.bulkAssign({
        serviceIds: selectedServiceIds,
        performerId,
      }),
    onSuccess: (res) => {
      toast.success(`تخصیص گروهی انجام شد: ${res.succeeded} موفق از ${res.totalItems}`);
      invalidateAll();
      setSelectedServiceIds([]);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message ?? "خطا در تخصیص گروهی.");
    },
  });

  const bulkStatusMutation = useMutation<BulkServiceActionResult, any, CareServiceStatus>({
    mutationFn: (newStatus) =>
      patientServicesService.bulkChangeStatus({
        serviceIds: selectedServiceIds,
        newStatus,
      }),
    onSuccess: (res) => {
      toast.success(`تغییر وضعیت گروهی انجام شد: ${res.succeeded} موفق از ${res.totalItems}`);
      invalidateAll();
      setSelectedServiceIds([]);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message ?? "خطا در تغییر وضعیت گروهی.");
    },
  });

  const bulkCancelMutation = useMutation<BulkServiceActionResult, any, string>({
    mutationFn: (reason) =>
      patientServicesService.bulkCancel({
        serviceIds: selectedServiceIds,
        cancelReason: reason,
      }),
    onSuccess: (res) => {
      toast.success(`لغو گروهی انجام شد: ${res.succeeded} موفق از ${res.totalItems}`);
      invalidateAll();
      setSelectedServiceIds([]);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message ?? "خطا در لغو گروهی.");
    },
  });

  const bulkRescheduleMutation = useMutation<
    BulkServiceActionResult,
    any,
    { newDate: string; newTime: string }
  >({
    mutationFn: ({ newDate, newTime }) =>
      patientServicesService.bulkReschedule({
        serviceIds: selectedServiceIds,
        newScheduledDate: newDate,
        newScheduledTime: newTime,
      }),
    onSuccess: (res) => {
      toast.success(`تغییر زمان گروهی انجام شد: ${res.succeeded} موفق از ${res.totalItems}`);
      invalidateAll();
      setSelectedServiceIds([]);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message ?? "خطا در تغییر زمان گروهی.");
    },
  });

  const bulkNotificationMutation = useMutation<
    BulkServiceActionResult,
    any,
    { title: string; message: string }
  >({
    mutationFn: ({ title, message }) =>
      patientServicesService.bulkSendNotification({
        serviceIds: selectedServiceIds,
        notificationTitle: title,
        notificationMessage: message,
      }),
    onSuccess: (res) => {
      toast.success(`ارسال اعلان گروهی انجام شد: ${res.succeeded} موفق از ${res.totalItems}`);
      invalidateAll();
      setSelectedServiceIds([]);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message ?? "خطا در ارسال اعلان گروهی.");
    },
  });

  return (
    <div className="space-y-6 bg-gray-50/50 p-4 md:p-6 dark:bg-slate-950/40">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/20">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-black tracking-tight text-slate-900 sm:text-2xl dark:text-slate-50">
                مدیریت خدمات بیماران
              </h1>
              <p className="mt-1 max-w-3xl text-sm leading-7 text-slate-500 sm:text-[15px] dark:text-slate-400">
                ثبت، برنامه‌ریزی، تخصیص و پیگیری خدمات درمانی و پرستاری بیماران در کل سامانه
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ViewSwitcher mode={viewMode} onChange={setViewMode} />
          <Button
            onClick={handleCreateNew}
            className="gap-2 bg-teal-600 text-white shadow-lg shadow-teal-600/20 hover:bg-teal-700"
          >
            <Plus size={16} />
            ثبت خدمت جدید
          </Button>
        </div>
      </div>

      {selectedServiceIds.length > 0 && (
        <BulkActionBar
          selectedCount={selectedServiceIds.length}
          selectedIds={selectedServiceIds}
          onClear={() => setSelectedServiceIds([])}
          onAssign={() => {
            const first = pagedQuery.data?.items.find((s) => s.id === selectedServiceIds[0]);
            if (!first) {
              toast.error("ابتدا یک خدمت را به صورت تکی تخصیص دهید.");
              return;
            }
            const defaultProviderId = "PLACEHOLDER_PROVIDER";
            if (!window.confirm("تخصیص گروهی با خدمت‌دهنده پیش‌فرض؟ (در نسخه کامل از دیالوگ استفاده می‌شود)")) return;
            void bulkAssignMutation.mutateAsync({ performerId: defaultProviderId }).catch(() => {});
          }}
          onCancel={() => {
            const reason = window.prompt("دلیل لغو خدمات انتخاب‌شده را وارد کنید:", "لغو توسط ادمین");
            if (reason == null) return;
            void bulkCancelMutation.mutateAsync(reason).catch(() => {});
          }}
          onChangeStatus={(newStatus: CareServiceStatus) => {
            void bulkStatusMutation.mutateAsync(newStatus).catch(() => {});
          }}
          onReschedule={(newDate: string, newTime: string) => {
            void bulkRescheduleMutation.mutateAsync({ newDate, newTime }).catch(() => {});
          }}
          onSendNotification={(title: string, message: string) => {
            void bulkNotificationMutation.mutateAsync({ title, message }).catch(() => {});
          }}
        />
      )}

      <StatsCards
        statistics={statisticsQuery.data}
        isLoading={statisticsQuery.isLoading}
        activeFilter={activeStatsFilter}
        onFilterChange={handleStatsFilterChange}
      />

      <ServiceFilterBar
        filters={{
          ...filters,
          ...appliedStatsFilter,
          searchQuery: rawSearch,
        }}
        onChange={(next) =>
          handleFilterChange({
            ...next,
            searchQuery: next.searchQuery ?? undefined,
          })
        }
      />

      {viewMode === "list" ? (
        <ServiceListTable
          data={pagedQuery.data}
          isLoading={pagedQuery.isLoading}
          isError={pagedQuery.isError}
          error={pagedQuery.error as any}
          selectedIds={selectedServiceIds}
          onToggleSelection={handleToggleSelection}
          onToggleAll={handleToggleAll}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onRetry={handleRetry}
          onOpenDetail={handleOpenDetail}
          onOpenEdit={handleOpenEditForService}
        />
      ) : (
        <SimpleCalendarView
          events={calendarQuery.data ?? []}
          onEventClick={handleCalendarEventClick}
        />
      )}

      <CreateServiceDrawer
        open={createDrawerOpen}
        onClose={() => setCreateDrawerOpen(false)}
        onCreated={handleCreatedOrUpdated}
      />

      <CreateServiceDrawer
        open={editDrawerOpen}
        onClose={() => {
          setEditDrawerOpen(false);
          setEditingServiceId(null);
          setEditingInitialData(null);
        }}
        onCreated={handleCreatedOrUpdated}
        editingServiceId={editingServiceId ?? undefined}
        initialData={editingInitialData}
      />

      <ServiceDetailDrawer
        open={detailDrawerOpen}
        serviceId={selectedServiceId}
        onClose={() => {
          setDetailDrawerOpen(false);
          setSelectedServiceId(null);
        }}
        onChangeProvider={handleChangeProviderFromDrawer}
        onChangeStatus={handleChangeStatus}
        onEdit={handleEditFromDrawer}
      />

      <AssignProviderDialog
        open={assignDialogOpen}
        onClose={() => {
          setAssignDialogOpen(false);
          setAssignContext({
            serviceId: null,
            serviceDefinitionId: null,
            scheduledDate: null,
            scheduledTime: null,
            durationMinutes: null,
          });
          invalidateAll();
        }}
        serviceId={assignContext.serviceId}
        serviceDefinitionId={assignContext.serviceDefinitionId}
        scheduledDate={assignContext.scheduledDate}
        scheduledTime={assignContext.scheduledTime}
        durationMinutes={assignContext.durationMinutes}
        currentServiceId={assignContext.serviceId ?? undefined}
      />
    </div>
  );
}

export { ServicePriority, ServiceLocationType, ServiceNotificationRecipientType, ServiceNotificationChannel };
export type { ProviderAvailabilityDto };
