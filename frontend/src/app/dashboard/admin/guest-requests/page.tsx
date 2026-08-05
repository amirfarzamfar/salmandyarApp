'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Loader2, PhoneCall, Search, Send, Sparkles, StickyNote, UserPlus } from 'lucide-react';
import { guestRequestsService } from '@/services/guest-requests.service';
import {
  GuestServiceRequestDetails,
  GuestServiceRequestListItem,
  GuestServiceRequestStatus,
} from '@/types/guest-request';
import { userService, type UserListDto } from '@/services/user.service';

const statusOptions = [
  { value: GuestServiceRequestStatus.New, label: 'جدید' },
  { value: GuestServiceRequestStatus.UnderReview, label: 'در حال بررسی' },
  { value: GuestServiceRequestStatus.Contacted, label: 'تماس گرفته شد' },
  { value: GuestServiceRequestStatus.ConvertedToPatient, label: 'تبدیل به بیمار' },
  { value: GuestServiceRequestStatus.Assigned, label: 'اختصاص نیرو' },
  { value: GuestServiceRequestStatus.Completed, label: 'اتمام' },
  { value: GuestServiceRequestStatus.Cancelled, label: 'لغو' },
];

export default function GuestRequestsAdminPage() {
  const [requests, setRequests] = useState<GuestServiceRequestListItem[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<GuestServiceRequestDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | GuestServiceRequestStatus>('all');
  const [note, setNote] = useState('');
  const [sms, setSms] = useState('');
  const [caregivers, setCaregivers] = useState<UserListDto[]>([]);
  const [selectedCaregiverId, setSelectedCaregiverId] = useState<string>('');
  const [convertFirstName, setConvertFirstName] = useState('');
  const [convertLastName, setConvertLastName] = useState('');
  const [convertDob, setConvertDob] = useState('');
  const [convertDiagnosis, setConvertDiagnosis] = useState('');
  const [convertStatus, setConvertStatus] = useState('Stable');
  const [convertCareLevel, setConvertCareLevel] = useState(2);
  const [convertAddress, setConvertAddress] = useState('');

  const filteredRequests = useMemo(() => {
    return requests.filter((item) => {
      const query = search.trim();
      const matchesQuery =
        !query ||
        item.trackingCode.toLowerCase().includes(query.toLowerCase()) ||
        item.contactName.toLowerCase().includes(query.toLowerCase()) ||
        item.contactMobile.includes(query) ||
        (item.city || '').toLowerCase().includes(query.toLowerCase()) ||
        (item.serviceType || '').toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  const metrics = useMemo(() => {
    const newCount = requests.filter((r) => r.status === GuestServiceRequestStatus.New).length;
    const openCount = requests.filter((r) => ![GuestServiceRequestStatus.Completed, GuestServiceRequestStatus.Cancelled].includes(r.status)).length;
    return { newCount, openCount };
  }, [requests]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await guestRequestsService.getAll();
        setRequests(data);
        if (data[0]) setSelectedRequestId(data[0].id);
      } catch (error) {
        console.error(error);
        toast.error('دریافت درخواست‌ها انجام نشد');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  useEffect(() => {
    const loadCaregivers = async () => {
      try {
        const res = await userService.getUsers({ pageNumber: 1, pageSize: 50, role: 'Nurse' });
        setCaregivers(res.items);
      } catch (error) {
        console.error(error);
      }
    };
    void loadCaregivers();
  }, []);

  useEffect(() => {
    if (!selectedRequestId) return;

    const loadDetails = async () => {
      try {
        setDetailsLoading(true);
        const data = await guestRequestsService.getById(selectedRequestId);
        setSelectedRequest(data);
        setSelectedCaregiverId('');
        setNote('');
        setSms('');
        setConvertFirstName('');
        setConvertLastName('');
        setConvertDob('');
        setConvertDiagnosis('');
        setConvertStatus('Stable');
        setConvertCareLevel(2);
        setConvertAddress('');
      } catch (error) {
        console.error(error);
        toast.error('دریافت جزئیات انجام نشد');
      } finally {
        setDetailsLoading(false);
      }
    };

    void loadDetails();
  }, [selectedRequestId]);

  const handleStatusUpdate = async (status: GuestServiceRequestStatus) => {
    if (!selectedRequest) return;
    setUpdating(true);
    try {
      const updated = await guestRequestsService.updateStatus(selectedRequest.id, { status });
      setSelectedRequest(updated);
      setRequests((current) => current.map((item) => item.id === updated.id ? { ...item, status: updated.status } : item));
      toast.success('وضعیت به‌روزرسانی شد');
    } catch (error) {
      console.error(error);
      toast.error('به‌روزرسانی وضعیت انجام نشد');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async () => {
    if (!selectedRequest) return;
    const value = note.trim();
    if (!value) return;
    setUpdating(true);
    try {
      const updated = await guestRequestsService.addNote(selectedRequest.id, { note: value });
      setSelectedRequest(updated);
      setNote('');
      toast.success('یادداشت ثبت شد');
    } catch (error) {
      console.error(error);
      toast.error('ثبت یادداشت انجام نشد');
    } finally {
      setUpdating(false);
    }
  };

  const handleSendSms = async () => {
    if (!selectedRequest) return;
    const message = sms.trim();
    if (!message) return;
    setUpdating(true);
    try {
      const updated = await guestRequestsService.sendSms(selectedRequest.id, { message });
      setSelectedRequest(updated);
      setSms('');
      toast.success('پیامک ارسال شد');
    } catch (error) {
      console.error(error);
      toast.error('ارسال پیامک انجام نشد');
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignCaregiver = async () => {
    if (!selectedRequest) return;
    setUpdating(true);
    try {
      const updated = await guestRequestsService.assignCaregiver(selectedRequest.id, { caregiverId: selectedCaregiverId || undefined });
      setSelectedRequest(updated);
      toast.success('اختصاص نیرو ثبت شد');
    } catch (error) {
      console.error(error);
      toast.error('اختصاص نیرو انجام نشد');
    } finally {
      setUpdating(false);
    }
  };

  const handleConvertToPatient = async () => {
    if (!selectedRequest) return;
    if (selectedRequest.convertedCareRecipientId) return;

    const firstName = (convertFirstName || selectedRequest.contactName.split(' ')[0] || '').trim();
    const lastName = (convertLastName || selectedRequest.contactName.split(' ').slice(1).join(' ') || '').trim();
    if (!firstName || !lastName || !convertDob) {
      toast.error('نام، نام خانوادگی و تاریخ تولد الزامی است.');
      return;
    }

    setUpdating(true);
    try {
      const updated = await guestRequestsService.convertToPatient(selectedRequest.id, {
        firstName,
        lastName,
        dateOfBirth: convertDob,
        primaryDiagnosis: convertDiagnosis || '—',
        currentStatus: convertStatus,
        careLevel: convertCareLevel,
        address: convertAddress || selectedRequest.city || undefined,
      });
      setSelectedRequest(updated);
      toast.success('تبدیل به بیمار انجام شد');
    } catch (error) {
      console.error(error);
      toast.error('تبدیل به بیمار انجام نشد');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">درخواست‌های بدون ثبت‌نام</h1>
        <p className="mt-2 text-sm text-gray-500">ثبت‌های لندینگ را پیگیری کنید، پیامک ارسال کنید و در صورت نیاز به بیمار تبدیل کنید.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <MetricCard title="درخواست‌های جدید" value={metrics.newCount} icon={<Sparkles className="h-5 w-5 text-teal-600" />} />
        <MetricCard title="پرونده‌های باز" value={metrics.openCount} icon={<PhoneCall className="h-5 w-5 text-blue-600" />} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-black text-gray-900">لیست درخواست‌ها</h2>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="جستجو: کد، نام، موبایل..."
                  className="w-full rounded-2xl border border-gray-200 bg-white py-2 pr-9 pl-3 text-sm outline-none focus:border-teal-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value === 'all' ? 'all' : Number(e.target.value) as GuestServiceRequestStatus)}
                className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500"
              >
                <option value="all">همه وضعیت‌ها</option>
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="py-16 text-center text-gray-500">موردی یافت نشد.</div>
          ) : (
            <div className="mt-5 space-y-3">
              {filteredRequests.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedRequestId(item.id)}
                  className={`w-full rounded-3xl border p-4 text-right transition ${selectedRequestId === item.id ? 'border-teal-300 bg-teal-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-black text-gray-900">{item.trackingCode}</div>
                      <div className="mt-1 text-xs text-gray-500">{item.contactName} • {item.contactMobile}</div>
                      <div className="mt-1 text-xs text-gray-500">{item.city || '—'} • {item.serviceType || '—'}</div>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700">
                      {statusOptions.find((s) => s.value === item.status)?.label ?? item.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          {detailsLoading ? (
            <div className="flex min-h-[28rem] items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
            </div>
          ) : !selectedRequest ? (
            <div className="py-16 text-center text-gray-500">یک پرونده را انتخاب کنید.</div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col gap-3 border-b border-gray-100 pb-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-xl font-black text-gray-900">{selectedRequest.trackingCode}</h2>
                  <p className="mt-1 text-sm text-gray-500">{selectedRequest.contactName} • {selectedRequest.contactMobile}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span className="rounded-full bg-slate-100 px-3 py-1 font-bold text-slate-700">{selectedRequest.city || '—'}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 font-bold text-slate-700">{selectedRequest.serviceType || '—'}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 font-bold text-slate-700">{selectedRequest.urgency || '—'}</span>
                  </div>
                </div>
                <select
                  value={selectedRequest.status}
                  onChange={(event) => void handleStatusUpdate(Number(event.target.value) as GuestServiceRequestStatus)}
                  disabled={updating}
                  className="rounded-2xl border border-gray-200 px-4 py-2 text-sm outline-none focus:border-teal-500"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <InfoBlock label="زمان ثبت" value={new Intl.DateTimeFormat('fa-IR-u-ca-persian', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(selectedRequest.createdAt))} />
                <InfoBlock label="آخرین به‌روزرسانی" value={new Intl.DateTimeFormat('fa-IR-u-ca-persian', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(selectedRequest.updatedAt))} />
                <InfoBlock label="کارشناس" value={selectedRequest.assignedSupervisorName || '—'} />
                <InfoBlock label="نیروی اختصاصی" value={selectedRequest.assignedCaregiverName || '—'} />
              </div>

              <div className="rounded-3xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-black text-gray-900">تماس مستقیم</div>
                  <a
                    href={`tel:${selectedRequest.contactMobile}`}
                    className="inline-flex items-center gap-2 rounded-2xl bg-teal-600 px-4 py-2 text-xs font-black text-white shadow-sm"
                  >
                    <PhoneCall className="h-4 w-4" />
                    تماس
                  </a>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-3xl border border-gray-100 bg-white p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-black text-gray-900">
                    <StickyNote className="h-4 w-4 text-amber-600" />
                    یادداشت داخلی
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
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-xs font-black text-white disabled:opacity-60"
                  >
                    {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <StickyNote className="h-4 w-4" />}
                    ثبت یادداشت
                  </button>
                </div>

                <div className="rounded-3xl border border-gray-100 bg-white p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-black text-gray-900">
                    <Send className="h-4 w-4 text-teal-600" />
                    ارسال پیامک
                  </div>
                  <textarea
                    value={sms}
                    onChange={(e) => setSms(e.target.value)}
                    rows={3}
                    placeholder="متن پیامک..."
                    className="w-full resize-none rounded-2xl border border-gray-200 bg-white p-3 text-sm outline-none focus:border-teal-500"
                  />
                  <button
                    type="button"
                    disabled={updating || !sms.trim()}
                    onClick={() => void handleSendSms()}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 py-2 text-xs font-black text-white disabled:opacity-60"
                  >
                    {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    ارسال پیامک
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-gray-100 bg-white p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-black text-gray-900">
                  <UserPlus className="h-4 w-4 text-blue-600" />
                  اختصاص نیرو
                </div>
                <div className="grid gap-3 sm:grid-cols-[1fr,auto] sm:items-center">
                  <select
                    value={selectedCaregiverId}
                    onChange={(e) => setSelectedCaregiverId(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500"
                  >
                    <option value="">بدون اختصاص</option>
                    {caregivers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} • {user.phoneNumber}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={updating}
                    onClick={() => void handleAssignCaregiver()}
                    className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-2 text-xs font-black text-white disabled:opacity-60"
                  >
                    {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'ثبت'}
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-gray-100 bg-white p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-black text-gray-900">
                  <UserPlus className="h-4 w-4 text-emerald-600" />
                  تبدیل به بیمار
                </div>
                {selectedRequest.convertedCareRecipientId ? (
                  <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">
                    این درخواست به بیمار با شناسه {selectedRequest.convertedCareRecipientId} تبدیل شده است.
                  </div>
                ) : (
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
                    <input
                      type="date"
                      value={convertDob}
                      onChange={(e) => setConvertDob(e.target.value)}
                      className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500"
                    />
                    <select
                      value={convertCareLevel}
                      onChange={(e) => setConvertCareLevel(Number(e.target.value))}
                      className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500"
                    >
                      <option value={1}>سطح ۱</option>
                      <option value={2}>سطح ۲</option>
                      <option value={3}>سطح ۳</option>
                      <option value={4}>سطح ۴</option>
                      <option value={5}>سطح ۵</option>
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
                    <button
                      type="button"
                      disabled={updating}
                      onClick={() => void handleConvertToPatient()}
                      className="md:col-span-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-black text-white disabled:opacity-60"
                    >
                      {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'تبدیل به بیمار'}
                    </button>
                  </div>
                )}
              </div>

              <div>
                <h3 className="mb-3 text-lg font-black text-gray-900">تایم‌لاین</h3>
                <div className="space-y-3">
                  {selectedRequest.timeline.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-bold text-gray-900">{item.title}</div>
                        <div className="text-xs text-gray-500">
                          {new Intl.DateTimeFormat('fa-IR-u-ca-persian', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.occurredAt))}
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-700">{item.description}</div>
                      {item.actorName && <div className="mt-2 text-xs font-bold text-gray-500">{item.actorName}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function MetricCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-gray-500">{title}</div>
          <div className="mt-2 text-3xl font-black text-gray-900">{value}</div>
        </div>
        <div className="rounded-2xl bg-gray-50 p-3">{icon}</div>
      </div>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
      <div className="text-xs font-bold text-gray-500">{label}</div>
      <div className="mt-2 text-sm font-black text-gray-900">{value}</div>
    </div>
  );
}
