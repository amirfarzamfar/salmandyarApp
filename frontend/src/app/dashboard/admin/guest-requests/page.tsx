'use client';

import { useEffect, useMemo, useState } from 'react';
import { format as jalaliFormat, parse as jalaliParse, isValid as jalaliIsValid } from 'date-fns-jalali';
import { formatISO, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import {
  AlertCircle,
  ArrowLeftRight,
  Barcode,
  Bell,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Copy,
  FileSpreadsheet,
  Filter,
  Flag,
  Loader2,
  MessageSquareText,
  PhoneCall,
  Radio,
  Search,
  Send,
  Sparkles,
  StickyNote,
  UserPlus,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { guestRequestsService } from '@/services/guest-requests.service';
import {
  AssignGuestServiceRequestSupervisorDto,
  ConvertGuestServiceRequestToPatientDto,
  CreateGuestContactLogDto,
  CreateGuestFollowUpDto,
  DuplicatePatientCandidate,
  GuestContactChannel,
  GuestContactChannelLabels,
  GuestContactResult,
  GuestContactResultLabels,
  GuestFollowUpStatus,
  GuestFollowUpStatusLabels,
  GuestRequestDashboardStats,
  GuestRequestQueryParams,
  GuestServiceRequestDetails,
  GuestServiceRequestListItem,
  GuestServiceRequestPriority,
  GuestServiceRequestSource,
  GuestServiceRequestStatus,
  GuestRequestPriorityLabels,
  GuestRequestStatusLabels,
  PagedResponse,
  SmsTemplate,
  UpdateGuestFollowUpDto,
  UpdateGuestServiceRequestPriorityDto,
} from '@/types/guest-request';
import { userService, type UserListDto } from '@/services/user.service';

type TabKey = 'form' | 'contact' | 'followup' | 'sms' | 'timeline';

function fmtDate(value?: string | null) {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  } catch {
    return value;
  }
}

function priorityBadge(p: GuestServiceRequestPriority) {
  const map: Record<GuestServiceRequestPriority, string> = {
    [GuestServiceRequestPriority.Low]: 'bg-slate-100 text-slate-700 border-slate-200',
    [GuestServiceRequestPriority.Normal]: 'bg-sky-50 text-sky-700 border-sky-200',
    [GuestServiceRequestPriority.High]: 'bg-amber-50 text-amber-700 border-amber-200',
    [GuestServiceRequestPriority.Urgent]: 'bg-rose-50 text-rose-700 border-rose-200',
  };
  return `inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${map[p]}`;
}

function statusBadge(s: GuestServiceRequestStatus) {
  const critical = [GuestServiceRequestStatus.Rejected, GuestServiceRequestStatus.Cancelled];
  const ok = [GuestServiceRequestStatus.ConvertedToPatient, GuestServiceRequestStatus.Completed, GuestServiceRequestStatus.Eligible];
  const warn = [GuestServiceRequestStatus.NeedContact, GuestServiceRequestStatus.New];
  const neutral = [
    GuestServiceRequestStatus.UnderReview,
    GuestServiceRequestStatus.Contacted,
    GuestServiceRequestStatus.FollowUpScheduled,
    GuestServiceRequestStatus.AwaitingConversion,
    GuestServiceRequestStatus.Assigned,
  ];

  let cls = 'bg-slate-100 text-slate-700 border-slate-200';
  if (critical.includes(s)) cls = 'bg-rose-50 text-rose-700 border-rose-200';
  else if (ok.includes(s)) cls = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  else if (warn.includes(s)) cls = 'bg-amber-50 text-amber-700 border-amber-200';
  else if (neutral.includes(s)) cls = 'bg-blue-50 text-blue-700 border-blue-200';

  return `inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${cls}`;
}

export default function GuestRequestsAdminPage() {
  // ---------- list / filter state ----------
  const [loadingList, setLoadingList] = useState(true);
  const [pagedData, setPagedData] = useState<PagedResponse<GuestServiceRequestListItem> | null>(null);
  const [stats, setStats] = useState<GuestRequestDashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | GuestServiceRequestStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | GuestServiceRequestPriority>('all');

  // ---------- details state ----------
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<GuestServiceRequestDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('form');
  const [updating, setUpdating] = useState(false);

  // ---------- forms ----------
  const [note, setNote] = useState('');
  const [sms, setSms] = useState('');
  const [selectedSmsTemplate, setSelectedSmsTemplate] = useState<string>('');
  const [smsTemplates, setSmsTemplates] = useState<SmsTemplate[]>([]);
  const [caregivers, setCaregivers] = useState<UserListDto[]>([]);
  const [supervisors, setSupervisors] = useState<UserListDto[]>([]);
  const [selectedCaregiverId, setSelectedCaregiverId] = useState<string>('');
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<string>('');
  const [convertFirstName, setConvertFirstName] = useState('');
  const [convertLastName, setConvertLastName] = useState('');
  const [convertDob, setConvertDob] = useState('');
  const [convertDobJalali, setConvertDobJalali] = useState('');
  const [convertDiagnosis, setConvertDiagnosis] = useState('');
  const [convertStatus, setConvertStatus] = useState('Stable');
  const [convertCareLevel, setConvertCareLevel] = useState(2);
  const [convertAddress, setConvertAddress] = useState('');

  // ---------- contact log ----------
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactChannel, setContactChannel] = useState<GuestContactChannel>(GuestContactChannel.PhoneCall);
  const [contactResult, setContactResult] = useState<GuestContactResult>(GuestContactResult.Answered);
  const [contactDuration, setContactDuration] = useState<string>('');
  const [contactNotes, setContactNotes] = useState('');
  const [contactNextAction, setContactNextAction] = useState('');
  const [contactNextFollowAt, setContactNextFollowAt] = useState<string>('');
  const [contactNextFollowAtJalali, setContactNextFollowAtJalali] = useState('');
  const [contactNextFollowAtTime, setContactNextFollowAtTime] = useState('');

  // ---------- follow-up ----------
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [followUpType, setFollowUpType] = useState('پیگیری تلفنی');
  const [followUpDesc, setFollowUpDesc] = useState('');
  const [followUpScheduledAt, setFollowUpScheduledAt] = useState<string>('');
  const [followUpScheduledAtJalali, setFollowUpScheduledAtJalali] = useState('');
  const [followUpScheduledAtTime, setFollowUpScheduledAtTime] = useState('');
  const [followUpAssignTo, setFollowUpAssignTo] = useState<string>('');

  // ---------- Jalali ⇄ Gregorian helpers ----------
  const syncGregorianFromJalaliDate = (
    jalaliValue: string,
    hhmm: string | undefined,
    setGregorian: (v: string) => void
  ) => {
    const jStr = jalaliValue.trim();
    if (!jStr) { setGregorian(''); return; }
    try {
      const parsedDate = jalaliParse(jStr, 'yyyy/MM/dd', new Date());
      if (!jalaliIsValid(parsedDate)) { return; }
      if (hhmm !== undefined && hhmm) {
        const [h, m] = hhmm.split(':').map(Number);
        if (!Number.isNaN(h) && !Number.isNaN(m)) {
          parsedDate.setHours(h, m, 0, 0);
        }
      }
      const y = parsedDate.getFullYear();
      const mo = String(parsedDate.getMonth() + 1).padStart(2, '0');
      const d = String(parsedDate.getDate()).padStart(2, '0');
      const hh = String(parsedDate.getHours()).padStart(2, '0');
      const mm = String(parsedDate.getMinutes()).padStart(2, '0');
      setGregorian(hhmm !== undefined ? `${y}-${mo}-${d}T${hh}:${mm}` : `${y}-${mo}-${d}`);
    } catch {
      /* ignore invalid input */
    }
  };

  const syncJalaliFromGregorian = (
    gregIsoLike: string,
    hasTime: boolean,
    setJalali: (v: string) => void,
    setTime?: (v: string) => void
  ) => {
    if (!gregIsoLike) {
      setJalali('');
      if (hasTime && setTime) setTime('');
      return;
    }
    try {
      const dt = hasTime ? new Date(gregIsoLike) : parseISO(gregIsoLike);
      if (Number.isNaN(dt.valueOf())) { setJalali(''); if (hasTime && setTime) setTime(''); return; }
      setJalali(jalaliFormat(dt, 'yyyy/MM/dd'));
      if (hasTime && setTime) {
        setTime(`${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`);
      }
    } catch {
      setJalali('');
      if (hasTime && setTime) setTime('');
    }
  };

  const handleConvertDobJalaliChange = (value: string) => {
    setConvertDobJalali(value);
    syncGregorianFromJalaliDate(value, undefined, setConvertDob);
  };

  const handleContactNextFollowDate = (value: string) => {
    setContactNextFollowAtJalali(value);
    syncGregorianFromJalaliDate(value, contactNextFollowAtTime, setContactNextFollowAt);
  };
  const handleContactNextFollowTime = (value: string) => {
    setContactNextFollowAtTime(value);
    syncGregorianFromJalaliDate(contactNextFollowAtJalali, value, setContactNextFollowAt);
  };

  const handleFollowUpDate = (value: string) => {
    setFollowUpScheduledAtJalali(value);
    syncGregorianFromJalaliDate(value, followUpScheduledAtTime, setFollowUpScheduledAt);
  };
  const handleFollowUpTime = (value: string) => {
    setFollowUpScheduledAtTime(value);
    syncGregorianFromJalaliDate(followUpScheduledAtJalali, value, setFollowUpScheduledAt);
  };

  // ---------- duplicate detection ----------
  const [duplicates, setDuplicates] = useState<DuplicatePatientCandidate[]>([]);
  const [loadingDup, setLoadingDup] = useState(false);
  const [linkExistingId, setLinkExistingId] = useState<number | null>(null);

  // ---------- reject ----------
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // ---------- search debounce ----------
  useEffect(() => {
    const h = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(h);
  }, [search]);

  // ---------- load stats ----------
  useEffect(() => {
    const load = async () => {
      setLoadingStats(true);
      try {
        setStats(await guestRequestsService.getStats());
      } catch (e) {
        console.error(e);
        toast.error('دریافت آمار انجام نشد');
      } finally {
        setLoadingStats(false);
      }
    };
    void load();
  }, []);

  // ---------- load list (on filter/param change) ----------
  useEffect(() => {
    const load = async () => {
      setLoadingList(true);
      try {
        const params: GuestRequestQueryParams = {
          pageNumber,
          pageSize,
          searchQuery: debouncedSearch || undefined,
          status: statusFilter === 'all' ? undefined : statusFilter,
          priority: priorityFilter === 'all' ? undefined : priorityFilter,
          sortBy: 'createdAt',
          sortDescending: true,
        };
        const data = await guestRequestsService.getPaged(params);
        setPagedData(data);
        if (!selectedRequestId && data.items[0]) setSelectedRequestId(data.items[0].id);
      } catch (e) {
        console.error(e);
        toast.error('دریافت درخواست‌ها انجام نشد');
      } finally {
        setLoadingList(false);
      }
    };
    void load();
  }, [pageNumber, pageSize, debouncedSearch, statusFilter, priorityFilter]);

  // ---------- helpers list update ----------
  const refreshAfterAction = async (fresh: GuestServiceRequestDetails) => {
    setSelectedRequest(fresh);
    if (pagedData) {
      setPagedData({
        ...pagedData,
        items: pagedData.items.map((i) =>
          i.id === fresh.id
            ? {
                ...i,
                status: fresh.status,
                priority: fresh.priority,
                updatedAt: fresh.updatedAt,
                lastContactAt: fresh.lastContactAt,
                nextFollowUpAt: fresh.nextFollowUpAt,
                assignedSupervisorName: fresh.assignedSupervisorName,
                assignedCaregiverName: fresh.assignedCaregiverName,
                convertedCareRecipientId: fresh.convertedCareRecipientId,
              }
            : i,
        ),
      });
    }
    // refresh stats to reflect latest
    try {
      setStats(await guestRequestsService.getStats());
    } catch {
      /* ignore */
    }
  };

  // ---------- users ----------
  useEffect(() => {
    const load = async () => {
      try {
        const [cg, sp, smsRes] = await Promise.all([
          userService.getUsers({ pageNumber: 1, pageSize: 100, role: 'Nurse' }),
          userService.getUsers({ pageNumber: 1, pageSize: 100, role: 'Supervisor' }),
          guestRequestsService.getSmsTemplates(),
        ]);
        setCaregivers(cg.items);
        setSupervisors(sp.items);
        setSmsTemplates(smsRes);
      } catch (e) {
        console.error(e);
      }
    };
    void load();
  }, []);

  // ---------- load details ----------
  useEffect(() => {
    if (!selectedRequestId) return;
    const load = async () => {
      setDetailsLoading(true);
      try {
        const data = await guestRequestsService.getById(selectedRequestId);
        setSelectedRequest(data);
        setActiveTab('form');
        setNote('');
        setSms('');
        setSelectedSmsTemplate('');
        setSelectedCaregiverId('');
        setSelectedSupervisorId(data.assignedSupervisorId ?? '');
        setDuplicates([]);
        setLinkExistingId(null);
        setConvertFirstName('');
        setConvertLastName('');
        setConvertDob('');
        setConvertDiagnosis('');
        setConvertStatus('Stable');
        setConvertCareLevel(2);
        setConvertAddress('');
      } catch (e) {
        console.error(e);
        toast.error('دریافت جزئیات انجام نشد');
      } finally {
        setDetailsLoading(false);
      }
    };
    void load();
  }, [selectedRequestId]);

  // ---------- actions ----------
  const handleStatusUpdate = async (status: GuestServiceRequestStatus) => {
    if (!selectedRequest || updating) return;
    setUpdating(true);
    try {
      const updated = await guestRequestsService.updateStatus(selectedRequest.id, {
        status,
      });
      await refreshAfterAction(updated);
      toast.success('وضعیت به‌روزرسانی شد');
    } catch (e) {
      console.error(e);
      toast.error('به‌روزرسانی انجام نشد');
    } finally {
      setUpdating(false);
    }
  };

  const handlePriorityUpdate = async (priority: GuestServiceRequestPriority) => {
    if (!selectedRequest || updating) return;
    setUpdating(true);
    try {
      const payload: UpdateGuestServiceRequestPriorityDto = { priority };
      const updated = await guestRequestsService.updatePriority(selectedRequest.id, payload);
      await refreshAfterAction(updated);
      toast.success('اولویت به‌روزرسانی شد');
    } catch (e) {
      console.error(e);
      toast.error('به‌روزرسانی انجام نشد');
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignSupervisor = async () => {
    if (!selectedRequest || updating) return;
    setUpdating(true);
    try {
      const payload: AssignGuestServiceRequestSupervisorDto = {
        supervisorId: selectedSupervisorId || undefined,
      };
      const updated = await guestRequestsService.assignSupervisor(selectedRequest.id, payload);
      await refreshAfterAction(updated);
      toast.success('تخصیص کارشناس ثبت شد');
    } catch (e) {
      console.error(e);
      toast.error('اختصاص انجام نشد');
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignCaregiver = async () => {
    if (!selectedRequest || updating) return;
    setUpdating(true);
    try {
      const updated = await guestRequestsService.assignCaregiver(selectedRequest.id, {
        caregiverId: selectedCaregiverId || undefined,
      });
      await refreshAfterAction(updated);
      toast.success('اختصاص نیرو ثبت شد');
    } catch (e) {
      console.error(e);
      toast.error('اختصاص انجام نشد');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async () => {
    if (!selectedRequest || updating) return;
    const value = note.trim();
    if (!value) return;
    setUpdating(true);
    try {
      const updated = await guestRequestsService.addNote(selectedRequest.id, { note: value });
      await refreshAfterAction(updated);
      setNote('');
      toast.success('یادداشت ثبت شد');
    } catch (e) {
      console.error(e);
      toast.error('ثبت انجام نشد');
    } finally {
      setUpdating(false);
    }
  };

  const handlePickSmsTemplate = (key: string) => {
    setSelectedSmsTemplate(key);
    const t = smsTemplates.find((tpl) => tpl.key === key);
    if (t && !sms.trim()) setSms(t.body);
    else if (t) setSms(t.body);
  };

  const handleSendSms = async () => {
    if (!selectedRequest || updating) return;
    const message = sms.trim();
    if (!message) return;
    setUpdating(true);
    try {
      const updated = await guestRequestsService.sendSms(selectedRequest.id, {
        message,
        templateKey: selectedSmsTemplate || undefined,
      });
      await refreshAfterAction(updated);
      setSms('');
      setSelectedSmsTemplate('');
      toast.success('پیامک ارسال شد');
    } catch (e) {
      console.error(e);
      toast.error('ارسال انجام نشد');
    } finally {
      setUpdating(false);
    }
  };

  const handleCreateContact = async () => {
    if (!selectedRequest || updating) return;
    setUpdating(true);
    try {
      const payload: CreateGuestContactLogDto = {
        channel: contactChannel,
        result: contactResult,
        durationSeconds: contactDuration ? Number(contactDuration) || undefined : undefined,
        notes: contactNotes.trim() || undefined,
        nextAction: contactNextAction.trim() || undefined,
        nextFollowUpSuggestedAt: contactNextFollowAt ? new Date(contactNextFollowAt).toISOString() : undefined,
      };
      const updated = await guestRequestsService.createContactLog(selectedRequest.id, payload);
      await refreshAfterAction(updated);
      setShowContactModal(false);
      setContactChannel(GuestContactChannel.PhoneCall);
      setContactResult(GuestContactResult.Answered);
      setContactDuration('');
      setContactNotes('');
      setContactNextAction('');
      setContactNextFollowAt('');
      toast.success('تماس ثبت شد');
    } catch (e) {
      console.error(e);
      toast.error('ثبت تماس انجام نشد');
    } finally {
      setUpdating(false);
    }
  };

  const handleCreateFollowUp = async () => {
    if (!selectedRequest || updating) return;
    if (!followUpScheduledAt) {
      toast.error('زمان پیگیری الزامی است');
      return;
    }
    setUpdating(true);
    try {
      const payload: CreateGuestFollowUpDto = {
        scheduledAt: new Date(followUpScheduledAt).toISOString(),
        followUpType: followUpType.trim() || undefined,
        description: followUpDesc.trim() || undefined,
        assignedToUserId: followUpAssignTo || undefined,
      };
      const updated = await guestRequestsService.createFollowUp(selectedRequest.id, payload);
      await refreshAfterAction(updated);
      setShowFollowUpModal(false);
      setFollowUpType('پیگیری تلفنی');
      setFollowUpDesc('');
      setFollowUpScheduledAt('');
      setFollowUpAssignTo('');
      toast.success('پیگیری ثبت شد');
    } catch (e) {
      console.error(e);
      toast.error('ثبت پیگیری انجام نشد');
    } finally {
      setUpdating(false);
    }
  };

  const handleFollowUpDone = async (fuId: string, done: boolean) => {
    if (!selectedRequest || updating) return;
    setUpdating(true);
    try {
      const payload: UpdateGuestFollowUpDto = {
        status: done ? GuestFollowUpStatus.Done : GuestFollowUpStatus.Cancelled,
      };
      const updatedFu = await guestRequestsService.updateFollowUp(fuId, payload);
      const fresh = await guestRequestsService.getById(selectedRequest.id);
      if (fresh) await refreshAfterAction(fresh);
      toast.success(done ? 'پیگیری به عنوان انجام‌شده ثبت شد' : 'پیگیری لغو شد');
      void updatedFu;
    } catch (e) {
      console.error(e);
      toast.error('به‌روزرسانی انجام نشد');
    } finally {
      setUpdating(false);
    }
  };

  const handleLoadDuplicates = async () => {
    if (!selectedRequest) return;
    setLoadingDup(true);
    try {
      const res = await guestRequestsService.searchDuplicatePatients(selectedRequest.id);
      setDuplicates(res);
      if (res.length > 0) toast.success(`${res.length} بیمار مشابه یافت شد`);
      else toast('هیچ بیمار مشابهی یافت نشد', { icon: '🔎' });
    } catch (e) {
      console.error(e);
      toast.error('جست‌وجوی بیمار انجام نشد');
    } finally {
      setLoadingDup(false);
    }
  };

  const handleConvertToPatient = async () => {
    if (!selectedRequest || updating) return;
    if (selectedRequest.convertedCareRecipientId) return;

    if (linkExistingId && linkExistingId > 0) {
      setUpdating(true);
      try {
        const updated = await guestRequestsService.convertToPatient(selectedRequest.id, {
          existingCareRecipientId: linkExistingId,
          primaryDiagnosis: convertDiagnosis.trim() || 'بدون تشخیص ویژه',
          currentStatus: convertStatus.trim() || 'Stable',
          careLevel: Number(convertCareLevel) || 2,
        });
        await refreshAfterAction(updated);
        toast.success('درخواست به بیمار موجود متصل شد');
        return;
      } catch (e) {
        console.error(e);
        toast.error('اتصال به بیمار انجام نشد');
      } finally {
        setUpdating(false);
      }
      return;
    }

    const nameParts = (selectedRequest.contactName || '').trim().split(' ').filter(Boolean);
    const firstName = (convertFirstName.trim() || nameParts[0] || 'نام').trim();
    const lastName = (convertLastName.trim() || nameParts.slice(1).join(' ') || 'شخص').trim();
    if (!firstName || !lastName) {
      toast.error('نام و نام خانوادگی برای تبدیل الزامی است.');
      return;
    }

    let dobUtc: string | undefined;
    if (convertDob.trim()) {
      try {
        const raw = convertDob.trim();
        const dt = raw.includes('T') ? new Date(raw) : new Date(raw + 'T00:00:00Z');
        if (Number.isNaN(dt.getTime())) throw new Error('تاریخ نامعتبر');
        dobUtc = dt.toISOString();
      } catch {
        toast.error('تاریخ تولد نامعتبر است.');
        return;
      }
    }

    if (!dobUtc) {
      toast.error('تاریخ تولد الزامی است.');
      return;
    }

    const careLevelNum = Number(convertCareLevel);
    const safeCareLevel = careLevelNum >= 1 && careLevelNum <= 5 ? careLevelNum : 2;
    const address = (convertAddress.trim() || selectedRequest.city || '').trim() || undefined;
    const diagnosis = (convertDiagnosis.trim() || 'درخواست‌دهنده مراقبت از سالمند').trim();
    const status = (convertStatus.trim() || 'Stable').trim();

    setUpdating(true);
    try {
      const payload: ConvertGuestServiceRequestToPatientDto = {
        firstName,
        lastName,
        dateOfBirth: dobUtc,
        primaryDiagnosis: diagnosis,
        currentStatus: status,
        careLevel: safeCareLevel,
        address,
      };
      const updated = await guestRequestsService.convertToPatient(selectedRequest.id, payload);
      await refreshAfterAction(updated);
      toast.success('تبدیل به بیمار انجام شد');
    } catch (e) {
      console.error(e);
      toast.error('تبدیل انجام نشد');
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || updating) return;
    const reason = rejectReason.trim();
    if (!reason) {
      toast.error('علت رد الزامی است');
      return;
    }
    setUpdating(true);
    try {
      const updated = await guestRequestsService.reject(selectedRequest.id, { reason });
      await refreshAfterAction(updated);
      setShowRejectModal(false);
      setRejectReason('');
      toast.success('درخواست رد شد');
    } catch (e) {
      console.error(e);
      toast.error('رد درخواست انجام نشد');
    } finally {
      setUpdating(false);
    }
  };

  const copyTracking = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('کد پیگیری کپی شد');
    } catch {
      toast('کپی انجام نشد', { icon: '⚠️' });
    }
  };

  // ---------- derived ----------
  const items = pagedData?.items ?? [];
  const totalPages = pagedData?.totalPages ?? 1;

  const smsHistory = useMemo(
    () =>
      (selectedRequest?.timeline ?? [])
        .filter((t) => t.title.includes('پیامک') || t.description?.includes('پیامک'))
        .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()),
    [selectedRequest],
  );

  return (
    <div className="space-y-6">
      {/* ---------- Header ---------- */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">درخواست‌های بدون ثبت‌نام</h1>
          <p className="mt-2 text-sm text-gray-500">
            لندینگ‌ها را پیگیری کنید، تماس ثبت کنید، پیگیری برنامه‌ریزی کنید و در صورت نیاز به پرونده بیمار تبدیل کنید.
          </p>
        </div>
      </div>

      {/* ---------- Dashboard Metrics ---------- */}
      <section className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <StatCard
          label="کل درخواست‌ها"
          value={stats?.totalCount}
          loading={loadingStats}
          icon={<FileSpreadsheet className="h-4 w-4 text-slate-600" />}
          tone="slate"
          onClick={() => {
            setStatusFilter('all');
            setPriorityFilter('all');
          }}
        />
        <StatCard
          label="جدید"
          value={stats?.newCount}
          loading={loadingStats}
          icon={<Sparkles className="h-4 w-4 text-amber-600" />}
          tone="amber"
          onClick={() => setStatusFilter(GuestServiceRequestStatus.New)}
        />
        <StatCard
          label="در حال بررسی"
          value={stats?.underReviewCount}
          loading={loadingStats}
          icon={<ClipboardList className="h-4 w-4 text-blue-600" />}
          tone="blue"
          onClick={() => setStatusFilter(GuestServiceRequestStatus.UnderReview)}
        />
        <StatCard
          label="نیازمند تماس"
          value={stats?.needContactCount}
          loading={loadingStats}
          icon={<PhoneCall className="h-4 w-4 text-rose-600" />}
          tone="rose"
          onClick={() => setStatusFilter(GuestServiceRequestStatus.NeedContact)}
        />
        <StatCard
          label="پیگیری امروز"
          value={stats?.followUpTodayCount}
          loading={loadingStats}
          icon={<CalendarClock className="h-4 w-4 text-indigo-600" />}
          tone="indigo"
        />
        <StatCard
          label="پیگیری عقب‌افتاده"
          value={stats?.followUpOverdueCount}
          loading={loadingStats}
          icon={<AlertCircle className="h-4 w-4 text-rose-600" />}
          tone="rose"
        />
        <StatCard
          label="بدون مسئول"
          value={stats?.unassignedCount}
          loading={loadingStats}
          icon={<Users className="h-4 w-4 text-orange-600" />}
          tone="amber"
        />
        <StatCard
          label="اولویت بالا"
          value={stats?.highPriorityCount}
          loading={loadingStats}
          icon={<Flag className="h-4 w-4 text-rose-600" />}
          tone="rose"
          onClick={() => setPriorityFilter(GuestServiceRequestPriority.High)}
        />
        <StatCard
          label="واجد شرایط"
          value={stats?.eligibleCount}
          loading={loadingStats}
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
          tone="emerald"
          onClick={() => setStatusFilter(GuestServiceRequestStatus.Eligible)}
        />
        <StatCard
          label="در انتظار تبدیل"
          value={stats?.awaitingConversionCount}
          loading={loadingStats}
          icon={<ArrowLeftRight className="h-4 w-4 text-teal-600" />}
          tone="teal"
          onClick={() => setStatusFilter(GuestServiceRequestStatus.AwaitingConversion)}
        />
        <StatCard
          label="تبدیل‌شده"
          value={stats?.convertedCount}
          loading={loadingStats}
          icon={<UserPlus className="h-4 w-4 text-emerald-600" />}
          tone="emerald"
          onClick={() => setStatusFilter(GuestServiceRequestStatus.ConvertedToPatient)}
        />
        <StatCard
          label="ردشده"
          value={stats?.rejectedCount}
          loading={loadingStats}
          icon={<XCircle className="h-4 w-4 text-slate-600" />}
          tone="slate"
          onClick={() => setStatusFilter(GuestServiceRequestStatus.Rejected)}
        />
      </section>

      {/* ---------- Main layout: list + details ---------- */}
      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr),minmax(0,1.1fr)]">
        {/* LEFT: LIST */}
        <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-black text-gray-900">لیست درخواست‌ها</h2>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-[1fr,auto,auto] sm:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPageNumber(1);
                }}
                placeholder="جستجو: کد پیگیری، نام، موبایل..."
                className="w-full rounded-2xl border border-gray-200 bg-white py-2 pr-9 pl-3 text-sm outline-none focus:border-teal-500"
              />
            </div>
            <div className="relative inline-flex items-center">
              <Filter className="pointer-events-none absolute left-3 h-4 w-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value === 'all' ? 'all' : (Number(e.target.value) as GuestServiceRequestStatus));
                  setPageNumber(1);
                }}
                className="inline-flex items-center gap-1 rounded-2xl border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:border-teal-500"
              >
                <option value="all">همه وضعیت‌ها</option>
                {Object.entries(GuestRequestStatusLabels).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative inline-flex items-center">
              <Flag className="pointer-events-none absolute left-3 h-4 w-4 text-gray-500" />
              <select
                value={priorityFilter}
                onChange={(e) => {
                  setPriorityFilter(e.target.value === 'all' ? 'all' : (Number(e.target.value) as GuestServiceRequestPriority));
                  setPageNumber(1);
                }}
                className="inline-flex items-center gap-1 rounded-2xl border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:border-teal-500"
              >
                <option value="all">همه اولویت‌ها</option>
                {Object.entries(GuestRequestPriorityLabels).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Rows */}
          {loadingList ? (
            <div className="flex items-center justify-center py-14 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
            </div>
          ) : items.length === 0 ? (
            <div className="py-14 text-center text-sm text-gray-500">موردی یافت نشد.</div>
          ) : (
            <div className="mt-5 space-y-2">
              {items.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRequestId(r.id)}
                  className={`w-full rounded-2xl border p-3 text-right transition md:p-4 ${
                    selectedRequestId === r.id
                      ? 'border-teal-300 bg-teal-50/60 ring-2 ring-teal-100'
                      : 'border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-black text-slate-700 ring-1 ring-gray-200">
                          <Barcode className="h-3 w-3" />
                          {r.trackingCode}
                        </span>
                        <span className={priorityBadge(r.priority)}>
                          <Flag className="h-3 w-3" />
                          {GuestRequestPriorityLabels[r.priority]}
                        </span>
                        <span className={statusBadge(r.status)}>{GuestRequestStatusLabels[r.status]}</span>
                      </div>
                      <div className="mt-2 line-clamp-1 text-sm font-black text-gray-900">{r.contactName}</div>
                      <div className="mt-0.5 line-clamp-1 text-xs text-gray-500">
                        {r.contactMobile}
                        {r.city ? ` • ${r.city}` : ''}
                        {r.serviceType ? ` • ${r.serviceType}` : ''}
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-gray-500 md:grid-cols-3">
                        <div>
                          ثبت: <span className="font-bold text-gray-700">{fmtDate(r.createdAt)}</span>
                        </div>
                        <div>
                          مسئول:{' '}
                          <span className="font-bold text-gray-700">{r.assignedSupervisorName || '—'}</span>
                        </div>
                        <div className="col-span-2 md:col-span-1">
                          پیگیری بعدی:{' '}
                          <span className="font-bold text-gray-700">{fmtDate(r.nextFollowUpAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagedData && pagedData.totalCount > pageSize && (
            <div className="mt-5 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
              <div className="text-xs text-gray-500">
                مجموع {pagedData.totalCount} • صفحه {pagedData.pageNumber} از {pagedData.totalPages}
              </div>
              <div className="inline-flex items-center gap-1 rounded-2xl border border-gray-200 bg-white p-1">
                <button
                  type="button"
                  onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                  disabled={pageNumber <= 1}
                  className="rounded-xl px-2.5 py-1 text-xs font-bold text-gray-600 disabled:opacity-40 hover:bg-gray-100"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <span className="px-3 text-xs font-black text-gray-800">{pageNumber}</span>
                <button
                  type="button"
                  onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
                  disabled={pageNumber >= totalPages}
                  className="rounded-xl px-2.5 py-1 text-xs font-bold text-gray-600 disabled:opacity-40 hover:bg-gray-100"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: DETAILS */}
        <div className="rounded-3xl border border-gray-100 bg-white shadow-sm">
          {detailsLoading ? (
            <div className="flex min-h-[40rem] items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
            </div>
          ) : !selectedRequest ? (
            <div className="flex min-h-[40rem] items-center justify-center px-8 text-center text-sm text-gray-500">
              یک پرونده را از لیست انتخاب کنید.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {/* HEADER */}
              <div className="p-4 md:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-xs font-black text-white">
                        <Barcode className="h-3.5 w-3.5" />
                        کد پیگیری {selectedRequest.trackingCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => void copyTracking(selectedRequest.trackingCode)}
                        className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-bold text-gray-700 hover:bg-gray-50"
                      >
                        <Copy className="h-3 w-3" /> کپی
                      </button>
                      <span className={priorityBadge(selectedRequest.priority)}>
                        <Flag className="h-3 w-3" />
                        {GuestRequestPriorityLabels[selectedRequest.priority]}
                      </span>
                      <span className={statusBadge(selectedRequest.status)}>
                        {GuestRequestStatusLabels[selectedRequest.status]}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-700">
                      <div className="font-black text-gray-900">{selectedRequest.contactName}</div>
                      <a
                        href={`tel:${selectedRequest.contactMobile}`}
                        className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-3 py-1 text-xs font-black text-teal-700 hover:bg-teal-100"
                      >
                        <PhoneCall className="h-3.5 w-3.5" />
                        {selectedRequest.contactMobile}
                      </a>
                      {selectedRequest.city && (
                        <span className="text-xs text-gray-500">
                          شهر: <span className="font-bold text-gray-700">{selectedRequest.city}</span>
                        </span>
                      )}
                      {selectedRequest.serviceType && (
                        <span className="text-xs text-gray-500">
                          نوع خدمت: <span className="font-bold text-gray-700">{selectedRequest.serviceType}</span>
                        </span>
                      )}
                    </div>
                    <div className="mt-3 grid gap-2 text-xs text-gray-500 sm:grid-cols-2 md:grid-cols-4">
                      <span>ثبت: <b className="text-gray-800">{fmtDate(selectedRequest.createdAt)}</b></span>
                      <span>آخرین تماس: <b className="text-gray-800">{fmtDate(selectedRequest.lastContactAt)}</b></span>
                      <span>پیگیری بعدی: <b className="text-gray-800">{fmtDate(selectedRequest.nextFollowUpAt)}</b></span>
                      <span>تبدیل شده: <b className="text-gray-800">{selectedRequest.convertedAt ? fmtDate(selectedRequest.convertedAt) : '—'}</b></span>
                    </div>
                  </div>

                  {/* Quick actions */}
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:flex-col">
                    <select
                      value={selectedRequest.status}
                      onChange={(e) => void handleStatusUpdate(Number(e.target.value) as GuestServiceRequestStatus)}
                      disabled={updating}
                      className="min-w-[10rem] rounded-2xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-teal-500"
                    >
                      {Object.entries(GuestRequestStatusLabels).map(([k, v]) => (
                        <option key={k} value={k}>
                          وضعیت: {v}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedRequest.priority}
                      onChange={(e) => void handlePriorityUpdate(Number(e.target.value) as GuestServiceRequestPriority)}
                      disabled={updating}
                      className="min-w-[10rem] rounded-2xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-teal-500"
                    >
                      {Object.entries(GuestRequestPriorityLabels).map(([k, v]) => (
                        <option key={k} value={k}>
                          اولویت: {v}
                        </option>
                      ))}
                    </select>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      <button
                        type="button"
                        onClick={() => setShowContactModal(true)}
                        className="inline-flex items-center justify-center gap-1 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-xs font-black text-gray-800 hover:bg-gray-50"
                      >
                        <PhoneCall className="h-3.5 w-3.5" /> ثبت تماس
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowFollowUpModal(true)}
                        className="inline-flex items-center justify-center gap-1 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-xs font-black text-gray-800 hover:bg-gray-50"
                      >
                        <CalendarClock className="h-3.5 w-3.5" /> پیگیری
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('sms');
                          const el = document.getElementById('sms-box');
                          el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        className="inline-flex items-center justify-center gap-1 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-xs font-black text-gray-800 hover:bg-gray-50"
                      >
                        <Send className="h-3.5 w-3.5" /> پیامک
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowRejectModal(true)}
                        className="col-span-2 inline-flex items-center justify-center gap-1 rounded-2xl bg-rose-50 px-3 py-2 text-xs font-black text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100 sm:col-span-1"
                      >
                        <XCircle className="h-3.5 w-3.5" /> رد
                      </button>
                    </div>
                  </div>
                </div>

                {/* Assign row */}
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1 text-xs font-black text-gray-700">
                        <UserPlus className="h-3.5 w-3.5 text-blue-600" /> تخصیص کارشناس مسئول
                      </span>
                      <span className="text-[11px] text-gray-500">
                        فعلی: <b className="text-gray-800">{selectedRequest.assignedSupervisorName || '—'}</b>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedSupervisorId}
                        onChange={(e) => setSelectedSupervisorId(e.target.value)}
                        className="flex-1 rounded-2xl border border-gray-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-teal-500"
                      >
                        <option value="">بدون تخصیص</option>
                        {supervisors.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.firstName} {u.lastName}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={updating}
                        onClick={() => void handleAssignSupervisor()}
                        className="rounded-2xl bg-blue-600 px-3 py-1.5 text-xs font-black text-white disabled:opacity-60"
                      >
                        {updating ? <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin" /> : 'ثبت'}
                      </button>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1 text-xs font-black text-gray-700">
                        <Users className="h-3.5 w-3.5 text-emerald-600" /> اختصاص نیروی مراقبت
                      </span>
                      <span className="text-[11px] text-gray-500">
                        فعلی: <b className="text-gray-800">{selectedRequest.assignedCaregiverName || '—'}</b>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedCaregiverId}
                        onChange={(e) => setSelectedCaregiverId(e.target.value)}
                        className="flex-1 rounded-2xl border border-gray-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-teal-500"
                      >
                        <option value="">بدون تخصیص</option>
                        {caregivers.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.firstName} {u.lastName}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={updating}
                        onClick={() => void handleAssignCaregiver()}
                        className="rounded-2xl bg-emerald-600 px-3 py-1.5 text-xs font-black text-white disabled:opacity-60"
                      >
                        {updating ? <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin" /> : 'ثبت'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* TABS */}
              <div className="sticky top-0 z-10 flex gap-1 overflow-x-auto border-b border-gray-100 bg-white px-4 py-2 md:px-6">
                {[
                  { key: 'form' as TabKey, label: 'اطلاعات فرم', icon: <ClipboardList className="h-3.5 w-3.5" /> },
                  { key: 'contact' as TabKey, label: 'تاریخچه تماس', icon: <PhoneCall className="h-3.5 w-3.5" /> },
                  { key: 'followup' as TabKey, label: 'پیگیری‌ها', icon: <CalendarClock className="h-3.5 w-3.5" /> },
                  { key: 'sms' as TabKey, label: 'پیامک‌ها', icon: <Send className="h-3.5 w-3.5" /> },
                  { key: 'timeline' as TabKey, label: 'تایم‌لاین', icon: <Clock className="h-3.5 w-3.5" /> },
                ].map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setActiveTab(t.key)}
                    className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-2xl px-3 py-1.5 text-xs font-black transition ${
                      activeTab === t.key
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              <div className="p-4 md:p-6">
                {/* TAB: FORM */}
                {activeTab === 'form' && (
                  <div className="space-y-5">
                    {selectedRequest.renderedFormSections.length === 0 && (
                      <div className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-800 ring-1 ring-amber-200">
                        پاسخ‌های فرم برای این درخواست در دسترس نیست.
                      </div>
                    )}
                    {selectedRequest.renderedFormSections.map((section, idx) => (
                      <div key={`sec-${idx}`} className="rounded-2xl border border-gray-100 bg-white p-4">
                        <div className="mb-3 flex items-center gap-2 border-b border-dashed border-gray-100 pb-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[11px] font-black text-white">
                            {idx + 1}
                          </span>
                          <h3 className="text-sm font-black text-gray-900">
                            {section.title || `بخش ${idx + 1}`}
                          </h3>
                        </div>
                        <dl className="grid gap-3 sm:grid-cols-2">
                          {section.fields.map((f) => (
                            <div key={f.questionId} className="rounded-xl border border-gray-50 bg-gray-50/60 p-3">
                              <dt className="text-[11px] font-bold uppercase tracking-wide text-gray-500">
                                {f.questionText}
                              </dt>
                              <dd className="mt-1 break-words text-sm font-black text-gray-900">
                                {f.hasValue ? f.displayValue || '—' : <span className="font-normal text-gray-400">ثبت نشده</span>}
                              </dd>
                              {f.tags && f.tags.length > 0 && (
                                <dd className="mt-2 flex flex-wrap gap-1">
                                  {f.tags.map((t) => (
                                    <span
                                      key={t}
                                      className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600 ring-1 ring-gray-200"
                                    >
                                      #{t}
                                    </span>
                                  ))}
                                </dd>
                              )}
                            </div>
                          ))}
                        </dl>
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB: CONTACT LOG */}
                {activeTab === 'contact' && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-black text-gray-900">تاریخچه تماس با درخواست‌دهنده</h3>
                      <button
                        type="button"
                        onClick={() => setShowContactModal(true)}
                        className="inline-flex items-center gap-1 rounded-2xl bg-teal-600 px-3 py-1.5 text-xs font-black text-white"
                      >
                        <PhoneCall className="h-3.5 w-3.5" /> ثبت تماس جدید
                      </button>
                    </div>
                    {selectedRequest.contactLogs.length === 0 ? (
                      <EmptyState text="هنوز تماسی ثبت نشده است." />
                    ) : (
                      <div className="space-y-3">
                        {selectedRequest.contactLogs.map((c) => (
                          <div key={c.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-black ring-1 ring-gray-200">
                                  <Radio className="h-3 w-3 text-blue-600" />
                                  {GuestContactChannelLabels[c.channel]}
                                </span>
                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-black ring-1 ${
                                  c.result === GuestContactResult.Answered || c.result === GuestContactResult.Eligible
                                    ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                                    : c.result === GuestContactResult.NoAnswer || c.result === GuestContactResult.Busy || c.result === GuestContactResult.WrongNumber
                                      ? 'bg-rose-50 text-rose-700 ring-rose-200'
                                      : 'bg-amber-50 text-amber-700 ring-amber-200'
                                }`}>
                                  {GuestContactResultLabels[c.result]}
                                </span>
                                {typeof c.durationSeconds === 'number' && (
                                  <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-bold text-gray-600 ring-1 ring-gray-200">
                                    مدت: {c.durationSeconds} ثانیه
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] font-bold text-gray-500">{fmtDate(c.contactedAt)}</span>
                            </div>
                            {c.notes && <div className="mt-3 text-sm text-gray-700">{c.notes}</div>}
                            <div className="mt-3 grid gap-2 text-[11px] text-gray-500 sm:grid-cols-2">
                              <span>
                                ثبت‌شده توسط:{' '}
                                <b className="text-gray-800">{c.actorName || 'سیستم'}</b>
                              </span>
                              <span>
                                اقدام بعدی:{' '}
                                <b className="text-gray-800">{c.nextAction || '—'}</b>
                              </span>
                              <span>
                                زمان پیشنهادی پیگیری بعدی:{' '}
                                <b className="text-gray-800">{fmtDate(c.nextFollowUpSuggestedAt)}</b>
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB: FOLLOWUP */}
                {activeTab === 'followup' && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-black text-gray-900">پیگیری‌های زمان‌بندی‌شده</h3>
                      <button
                        type="button"
                        onClick={() => setShowFollowUpModal(true)}
                        className="inline-flex items-center gap-1 rounded-2xl bg-indigo-600 px-3 py-1.5 text-xs font-black text-white"
                      >
                        <CalendarClock className="h-3.5 w-3.5" /> ثبت پیگیری
                      </button>
                    </div>
                    {selectedRequest.followUps.length === 0 ? (
                      <EmptyState text="پیگیری‌ای برای این درخواست ثبت نشده است." />
                    ) : (
                      <div className="overflow-hidden rounded-2xl border border-gray-100">
                        <table className="min-w-full divide-y divide-gray-100 text-right text-xs">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 font-black text-gray-600">زمان</th>
                              <th className="px-3 py-2 font-black text-gray-600">وضعیت</th>
                              <th className="px-3 py-2 font-black text-gray-600">نوع</th>
                              <th className="px-3 py-2 font-black text-gray-600">مسئول</th>
                              <th className="px-3 py-2 font-black text-gray-600">توضیحات</th>
                              <th className="px-3 py-2 font-black text-gray-600">اقدام</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50 bg-white">
                            {selectedRequest.followUps.map((f) => (
                              <tr key={f.id}>
                                <td className="whitespace-nowrap px-3 py-2 font-bold text-gray-800">{fmtDate(f.scheduledAt)}</td>
                                <td className="whitespace-nowrap px-3 py-2">
                                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-black ring-1 ${
                                    f.status === GuestFollowUpStatus.Done
                                      ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                                      : f.status === GuestFollowUpStatus.Cancelled
                                        ? 'bg-slate-100 text-slate-700 ring-slate-200'
                                        : f.status === GuestFollowUpStatus.Overdue
                                          ? 'bg-rose-50 text-rose-700 ring-rose-200'
                                          : 'bg-amber-50 text-amber-700 ring-amber-200'
                                  }`}>
                                    {GuestFollowUpStatusLabels[f.status]}
                                  </span>
                                </td>
                                <td className="whitespace-nowrap px-3 py-2 text-gray-700">{f.followUpType || '—'}</td>
                                <td className="whitespace-nowrap px-3 py-2 text-gray-700">
                                  {f.assignedToUserName || f.createdByUserName}
                                </td>
                                <td className="px-3 py-2 text-gray-700">
                                  <div className="line-clamp-2">{f.description || '—'}</div>
                                  {f.resolutionNotes && (
                                    <div className="mt-1 rounded-md bg-emerald-50 p-1.5 text-[11px] text-emerald-800 ring-1 ring-emerald-200">
                                      نتیجه: {f.resolutionNotes}
                                    </div>
                                  )}
                                </td>
                                <td className="whitespace-nowrap px-3 py-2">
                                  {f.status === GuestFollowUpStatus.Pending || f.status === GuestFollowUpStatus.Overdue ? (
                                    <div className="inline-flex gap-1">
                                      <button
                                        type="button"
                                        onClick={() => void handleFollowUpDone(f.id, true)}
                                        className="rounded-xl bg-emerald-600 px-2 py-1 text-[11px] font-black text-white"
                                      >
                                        انجام شد
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => void handleFollowUpDone(f.id, false)}
                                        className="rounded-xl bg-slate-200 px-2 py-1 text-[11px] font-black text-slate-700"
                                      >
                                        لغو
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-[11px] text-gray-400">—</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB: SMS */}
                {activeTab === 'sms' && (
                  <div id="sms-box" className="space-y-5">
                    <div className="rounded-2xl border border-gray-100 bg-teal-50/50 p-4 ring-1 ring-teal-100">
                      <div className="mb-3 flex items-center gap-2">
                        <Send className="h-4 w-4 text-teal-700" />
                        <h3 className="text-sm font-black text-teal-900">ارسال پیامک اطلاع‌رسانی</h3>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {smsTemplates.filter((t) => t.key !== 'custom').map((t) => (
                          <button
                            key={t.key}
                            type="button"
                            onClick={() => handlePickSmsTemplate(t.key)}
                            className={`rounded-xl border p-2 text-right text-xs transition ${
                              selectedSmsTemplate === t.key
                                ? 'border-teal-500 bg-white ring-2 ring-teal-100'
                                : 'border-white bg-white hover:border-teal-200'
                            }`}
                          >
                            <div className="font-black text-gray-900">{t.name}</div>
                            <div className="mt-1 line-clamp-2 text-[11px] text-gray-600">{t.description}</div>
                          </button>
                        ))}
                      </div>
                      <div className="mt-4">
                        <textarea
                          value={sms}
                          onChange={(e) => setSms(e.target.value)}
                          rows={3}
                          placeholder="متن پیامک..."
                          className="w-full resize-none rounded-2xl border border-gray-200 bg-white p-3 text-sm outline-none focus:border-teal-500"
                        />
                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                          <div className="text-[11px] text-gray-500">
                            <Bell className="mr-1 inline h-3 w-3" />
                            ارسال به: <b className="text-gray-800">{selectedRequest.contactMobile}</b> • طول پیام:{' '}
                            <b className="text-gray-800">{sms.length}</b> کاراکتر
                          </div>
                          <button
                            type="button"
                            disabled={updating || !sms.trim()}
                            onClick={() => void handleSendSms()}
                            className="inline-flex items-center gap-1 rounded-2xl bg-teal-600 px-4 py-2 text-xs font-black text-white disabled:opacity-60"
                          >
                            {updating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                            ارسال پیامک
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-3 text-sm font-black text-gray-900">تاریخچه پیامک‌های ارسالی</h3>
                      {smsHistory.length === 0 ? (
                        <EmptyState text="پیامکی برای این درخواست ارسال نشده است." />
                      ) : (
                        <div className="space-y-3">
                          {smsHistory.map((t) => (
                            <div key={t.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2 text-xs font-black text-gray-800">
                                  <Send className="h-3.5 w-3.5 text-teal-600" />
                                  {t.title}
                                </div>
                                <span className="text-[11px] font-bold text-gray-500">{fmtDate(t.occurredAt)}</span>
                              </div>
                              <div className="mt-2 whitespace-pre-wrap text-sm leading-7 text-gray-700">{t.description}</div>
                              {t.actorName && (
                                <div className="mt-2 text-[11px] font-bold text-gray-500">ارسال‌شده توسط: {t.actorName}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB: TIMELINE */}
                {activeTab === 'timeline' && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-gray-900">تایم‌لاین فعالیت‌ها</h3>
                    {selectedRequest.timeline.length === 0 ? (
                      <EmptyState text="فعالیتی ثبت نشده است." />
                    ) : (
                      <ol className="relative space-y-3 border-r-2 border-gray-100 pr-5">
                        {selectedRequest.timeline
                          .slice()
                          .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
                          .map((t) => (
                            <li key={t.id} className="relative">
                              <span className="absolute -right-[31px] top-2 h-4 w-4 rounded-full bg-gradient-to-br from-teal-500 to-indigo-500 ring-4 ring-white" />
                              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="font-black text-gray-900">{t.title}</div>
                                  <span className="text-[11px] font-bold text-gray-500">{fmtDate(t.occurredAt)}</span>
                                </div>
                                <div className="mt-2 whitespace-pre-wrap text-sm leading-7 text-gray-700">{t.description}</div>
                                {t.actorName && (
                                  <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-gray-50 px-3 py-1 text-[11px] font-bold text-gray-600 ring-1 ring-gray-200">
                                    <Users className="h-3 w-3" /> {t.actorName}
                                  </div>
                                )}
                              </div>
                            </li>
                          ))}
                      </ol>
                    )}
                  </div>
                )}

                {/* Conversion block (always visible, after tabs) */}
                <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 ring-1 ring-emerald-200/60">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4 text-emerald-700" />
                      <h3 className="text-sm font-black text-emerald-900">تبدیل درخواست به بیمار</h3>
                    </div>
                    {!selectedRequest.convertedCareRecipientId && (
                      <button
                        type="button"
                        onClick={() => void handleLoadDuplicates()}
                        disabled={loadingDup}
                        className="inline-flex items-center gap-1 rounded-2xl bg-white px-3 py-1.5 text-xs font-black text-emerald-700 ring-1 ring-emerald-300 hover:bg-emerald-50 disabled:opacity-60"
                      >
                        {loadingDup ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Users className="h-3.5 w-3.5" />}
                        جست‌وجوی بیمار مشابه
                      </button>
                    )}
                  </div>
                  {selectedRequest.convertedCareRecipientId ? (
                    <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800 ring-1 ring-emerald-200">
                      این درخواست به بیمار با شناسه{' '}
                      <b className="mx-1 rounded-md bg-white px-1.5 py-0.5 ring-1 ring-emerald-200">
                        {selectedRequest.convertedCareRecipientId}
                      </b>
                      تبدیل/متصل شده است.
                      {selectedRequest.convertedAt && (
                        <div className="mt-1 text-[11px] text-emerald-700">تاریخ تبدیل: {fmtDate(selectedRequest.convertedAt)}</div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {duplicates.length > 0 && (
                        <div className="rounded-2xl bg-white p-3 ring-1 ring-amber-200">
                          <div className="mb-2 flex items-center gap-1 text-xs font-black text-amber-800">
                            <AlertCircle className="h-3.5 w-3.5" /> بیماران مشابه یافت‌شده — برای اتصال مستقیم، یکی را انتخاب کنید.
                          </div>
                          <div className="grid gap-2 md:grid-cols-2">
                            {duplicates.map((d) => (
                              <label
                                key={d.careRecipientId}
                                className={`flex cursor-pointer items-start gap-2 rounded-xl border p-3 text-xs ring-1 ${
                                  linkExistingId === d.careRecipientId
                                    ? 'border-amber-500 bg-amber-50 ring-amber-200'
                                    : 'border-gray-100 bg-white hover:border-amber-200'
                                }`}
                              >
                                <input
                                  type="radio"
                                  className="mt-1"
                                  name="linkExisting"
                                  checked={linkExistingId === d.careRecipientId}
                                  onChange={() => setLinkExistingId(d.careRecipientId)}
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="font-black text-gray-900">
                                    {d.firstName} {d.lastName}
                                    <span className="mr-2 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-black text-emerald-700 ring-1 ring-emerald-200">
                                      %{Math.round(d.matchScore * 100)}
                                    </span>
                                  </div>
                                  <div className="mt-1 text-gray-500">شناسه: {d.careRecipientId}</div>
                                  <div className="mt-1 text-[11px] text-gray-500">{d.matchReason}</div>
                                </div>
                              </label>
                            ))}
                          </div>
                          {linkExistingId && (
                            <button
                              type="button"
                              onClick={() => setLinkExistingId(null)}
                              className="mt-2 text-[11px] font-bold text-gray-500 hover:text-gray-700"
                            >
                              انصراف از اتصال و ساخت بیمار جدید
                            </button>
                          )}
                        </div>
                      )}

                      {!linkExistingId && (
                        <div className="grid gap-3 md:grid-cols-2">
                          <input
                            value={convertFirstName}
                            onChange={(e) => setConvertFirstName(e.target.value)}
                            placeholder="نام"
                            className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500"
                          />
                          <input
                            value={convertLastName}
                            onChange={(e) => setConvertLastName(e.target.value)}
                            placeholder="نام خانوادگی"
                            className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500"
                          />
                          <div className="space-y-1">
                            <input
                              type="text"
                              inputMode="numeric"
                              dir="ltr"
                              value={convertDobJalali}
                              onChange={(e) => handleConvertDobJalaliChange(e.target.value)}
                              onBlur={() => syncJalaliFromGregorian(convertDob, false, setConvertDobJalali)}
                              placeholder="1405/06/12"
                              className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500"
                            />
                            <p className="text-[10px] text-gray-400 px-1">تاریخ تولد شمسی (مثال: 1405/06/12)</p>
                          </div>
                          <select
                            value={convertCareLevel}
                            onChange={(e) => setConvertCareLevel(Number(e.target.value))}
                            className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500"
                          >
                            {[1, 2, 3, 4, 5].map((l) => (
                              <option key={l} value={l}>سطح مراقبت {l}</option>
                            ))}
                          </select>
                          <input
                            value={convertDiagnosis}
                            onChange={(e) => setConvertDiagnosis(e.target.value)}
                            placeholder="تشخیص اولیه (اختیاری)"
                            className="md:col-span-2 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500"
                          />
                          <input
                            value={convertAddress}
                            onChange={(e) => setConvertAddress(e.target.value)}
                            placeholder="آدرس (اختیاری)"
                            className="md:col-span-2 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500"
                          />
                        </div>
                      )}
                      <button
                        type="button"
                        disabled={updating}
                        onClick={() => void handleConvertToPatient()}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-black text-white disabled:opacity-60 md:w-auto"
                      >
                        {updating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
                        {linkExistingId ? 'اتصال به بیمار موجود' : 'ایجاد بیمار جدید و اتصال درخواست'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Note block */}
                <div className="mt-5 rounded-2xl border border-gray-100 bg-white p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-black text-gray-900">
                    <StickyNote className="h-4 w-4 text-amber-600" /> یادداشت داخلی
                  </div>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    placeholder="یادداشت برای تیم..."
                    className="w-full resize-none rounded-2xl border border-gray-200 bg-white p-3 text-sm outline-none focus:border-teal-500"
                  />
                  <button
                    type="button"
                    disabled={updating || !note.trim()}
                    onClick={() => void handleAddNote()}
                    className="mt-3 inline-flex items-center gap-1 rounded-2xl bg-slate-900 px-4 py-2 text-xs font-black text-white disabled:opacity-60"
                  >
                    {updating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <StickyNote className="h-3.5 w-3.5" />}
                    ثبت یادداشت
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* MODAL: Contact Log */}
      {showContactModal && selectedRequest && (
        <ModalShell onClose={() => setShowContactModal(false)} title="ثبت نتیجه تماس">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="کانال تماس">
              <select
                value={contactChannel}
                onChange={(e) => setContactChannel(Number(e.target.value) as GuestContactChannel)}
                className="input"
              >
                {Object.entries(GuestContactChannelLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </Field>
            <Field label="نتیجه تماس">
              <select
                value={contactResult}
                onChange={(e) => setContactResult(Number(e.target.value) as GuestContactResult)}
                className="input"
              >
                {Object.entries(GuestContactResultLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </Field>
            <Field label="مدت تماس (ثانیه)">
              <input
                type="number"
                min={0}
                value={contactDuration}
                onChange={(e) => setContactDuration(e.target.value)}
                placeholder="مثلاً ۱۸۰"
                className="input"
              />
            </Field>
            <Field label="اقدام بعدی">
              <input
                value={contactNextAction}
                onChange={(e) => setContactNextAction(e.target.value)}
                placeholder="مثلاً ارسال فرم پزشکی"
                className="input"
              />
            </Field>
            <Field label="زمان پیشنهادی پیگیری بعدی" full>
              <div className="grid gap-2 md:grid-cols-3">
                <div className="space-y-1 md:col-span-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    dir="ltr"
                    value={contactNextFollowAtJalali}
                    onChange={(e) => handleContactNextFollowDate(e.target.value)}
                    onBlur={() => syncJalaliFromGregorian(contactNextFollowAt, true, setContactNextFollowAtJalali, setContactNextFollowAtTime)}
                    placeholder="1405/06/12"
                    className="input w-full"
                  />
                  <p className="text-[10px] text-gray-400 px-1">تاریخ شمسی</p>
                </div>
                <div className="space-y-1">
                  <input
                    type="time"
                    dir="ltr"
                    value={contactNextFollowAtTime}
                    onChange={(e) => handleContactNextFollowTime(e.target.value)}
                    className="input w-full"
                  />
                  <p className="text-[10px] text-gray-400 px-1">ساعت</p>
                </div>
              </div>
            </Field>
            <Field label="یادداشت تماس" full>
              <textarea
                value={contactNotes}
                onChange={(e) => setContactNotes(e.target.value)}
                rows={3}
                placeholder="شرح مکالمه..."
                className="input resize-none"
              />
            </Field>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowContactModal(false)}
              className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-xs font-black text-gray-700"
            >
              انصراف
            </button>
            <button
              type="button"
              disabled={updating}
              onClick={() => void handleCreateContact()}
              className="rounded-2xl bg-teal-600 px-4 py-2 text-xs font-black text-white disabled:opacity-60"
            >
              {updating ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : 'ثبت تماس'}
            </button>
          </div>
        </ModalShell>
      )}

      {/* MODAL: Follow-up */}
      {showFollowUpModal && selectedRequest && (
        <ModalShell onClose={() => setShowFollowUpModal(false)} title="ثبت پیگیری جدید">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="زمان پیگیری" full>
              <div className="grid gap-2 md:grid-cols-3">
                <div className="space-y-1 md:col-span-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    dir="ltr"
                    value={followUpScheduledAtJalali}
                    onChange={(e) => handleFollowUpDate(e.target.value)}
                    onBlur={() => syncJalaliFromGregorian(followUpScheduledAt, true, setFollowUpScheduledAtJalali, setFollowUpScheduledAtTime)}
                    placeholder="1405/06/12"
                    className="input w-full"
                  />
                  <p className="text-[10px] text-gray-400 px-1">تاریخ شمسی</p>
                </div>
                <div className="space-y-1">
                  <input
                    type="time"
                    dir="ltr"
                    value={followUpScheduledAtTime}
                    onChange={(e) => handleFollowUpTime(e.target.value)}
                    className="input w-full"
                  />
                  <p className="text-[10px] text-gray-400 px-1">ساعت</p>
                </div>
              </div>
            </Field>
            <Field label="نوع پیگیری">
              <input
                value={followUpType}
                onChange={(e) => setFollowUpType(e.target.value)}
                placeholder="مثلاً پیگیری تلفنی"
                className="input"
              />
            </Field>
            <Field label="مسئول پیگیری">
              <select
                value={followUpAssignTo}
                onChange={(e) => setFollowUpAssignTo(e.target.value)}
                className="input"
              >
                <option value="">همان کاربر جاری</option>
                {[...supervisors, ...caregivers].map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.firstName} {u.lastName}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="توضیحات" full>
              <textarea
                value={followUpDesc}
                onChange={(e) => setFollowUpDesc(e.target.value)}
                rows={3}
                placeholder="وظیفه یا نکته موردنظر..."
                className="input resize-none"
              />
            </Field>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowFollowUpModal(false)}
              className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-xs font-black text-gray-700"
            >
              انصراف
            </button>
            <button
              type="button"
              disabled={updating}
              onClick={() => void handleCreateFollowUp()}
              className="rounded-2xl bg-indigo-600 px-4 py-2 text-xs font-black text-white disabled:opacity-60"
            >
              {updating ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : 'ثبت پیگیری'}
            </button>
          </div>
        </ModalShell>
      )}

      {/* MODAL: Reject */}
      {showRejectModal && selectedRequest && (
        <ModalShell onClose={() => setShowRejectModal(false)} title="رد درخواست">
          <div className="rounded-2xl bg-rose-50 p-3 text-xs text-rose-700 ring-1 ring-rose-200">
            در صورت رد، پرونده بسته می‌شود. درخواست‌دهنده می‌تواند دوباره فرم لندینگ را ثبت کند.
          </div>
          <div className="mt-3">
            <Field label="علت رد درخواست" full>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                placeholder="علت رد را به‌صورت واضح و قابل استناد بنویسید..."
                className="input resize-none"
              />
            </Field>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowRejectModal(false)}
              className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-xs font-black text-gray-700"
            >
              انصراف
            </button>
            <button
              type="button"
              disabled={updating}
              onClick={() => void handleReject()}
              className="rounded-2xl bg-rose-600 px-4 py-2 text-xs font-black text-white disabled:opacity-60"
            >
              {updating ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : 'تایید رد درخواست'}
            </button>
          </div>
        </ModalShell>
      )}
    </div>
  );
}

/* =========================
 * Small reusable components
 * ========================= */

function StatCard({
  label,
  value,
  loading,
  icon,
  tone,
  onClick,
}: {
  label: string;
  value: number | undefined;
  loading: boolean;
  icon: React.ReactNode;
  tone: 'slate' | 'amber' | 'blue' | 'rose' | 'emerald' | 'teal' | 'indigo' | 'orange';
  onClick?: () => void;
}) {
  const toneBg: Record<string, string> = {
    slate: 'bg-slate-50 ring-slate-100 text-slate-700',
    amber: 'bg-amber-50 ring-amber-100 text-amber-700',
    blue: 'bg-blue-50 ring-blue-100 text-blue-700',
    rose: 'bg-rose-50 ring-rose-100 text-rose-700',
    emerald: 'bg-emerald-50 ring-emerald-100 text-emerald-700',
    teal: 'bg-teal-50 ring-teal-100 text-teal-700',
    indigo: 'bg-indigo-50 ring-indigo-100 text-indigo-700',
    orange: 'bg-orange-50 ring-orange-100 text-orange-700',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 text-right shadow-sm transition hover:shadow-md disabled:cursor-default ${
        onClick ? '' : 'hover:bg-white'
      }`}
    >
      <div className="min-w-0">
        <div className="truncate text-xs font-bold text-gray-500">{label}</div>
        <div className="mt-1.5 text-2xl font-black text-gray-900">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          ) : (
            value ?? <span className="text-gray-400">0</span>
          )}
        </div>
      </div>
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${toneBg[tone]}`}>
        {icon}
      </div>
    </button>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 py-12 text-center text-sm text-gray-500">
      <MessageSquareText className="h-6 w-6 text-gray-300" />
      {text}
    </div>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? 'md:col-span-2' : ''}>
      <label className="mb-1 block text-[11px] font-black text-gray-600">{label}</label>
      {children}
      <style jsx>{`
        :global(.input) {
          width: 100%;
          border-radius: 1rem;
          border: 1px solid rgb(229 231 235);
          background: white;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          line-height: 1.5;
          outline: none;
        }
        :global(.input:focus) {
          border-color: rgb(20 184 166);
        }
      `}</style>
    </div>
  );
}

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white p-5 shadow-2xl md:p-6">
        <div className="mb-4 flex items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <h3 className="text-base font-black text-gray-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
