'use client';

import { useEffect, useMemo, useState } from 'react';
import { homeCareService } from '@/services/home-care.service';
import { HomeCareRequestDetails, HomeCareRequestListItem, HomeCareRequestStatus } from '@/types/home-care';
import { ServiceCategory } from '@/types/service';
import { Loader2, MessageSquareMore, PhoneCall, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

const statusOptions = [
  { value: HomeCareRequestStatus.Submitted, label: 'ثبت‌شده' },
  { value: HomeCareRequestStatus.UnderSupervisorReview, label: 'بررسی سوپروایزر' },
  { value: HomeCareRequestStatus.ContactScheduled, label: 'تماس با بیمار' },
  { value: HomeCareRequestStatus.AwaitingDocuments, label: 'دریافت مدارک' },
  { value: HomeCareRequestStatus.MatchingCaregiver, label: 'یافتن نیروی مناسب' },
  { value: HomeCareRequestStatus.AwaitingPatientConfirmation, label: 'در انتظار تایید بیمار' },
  { value: HomeCareRequestStatus.InService, label: 'شروع خدمت' },
  { value: HomeCareRequestStatus.Completed, label: 'پایان خدمت' },
  { value: HomeCareRequestStatus.SatisfactionPending, label: 'ثبت رضایت' },
  { value: HomeCareRequestStatus.Cancelled, label: 'لغو درخواست' },
];

const serviceCategoryLabels: Record<ServiceCategory, string> = {
  [ServiceCategory.Nursing]: 'پرستاری',
  [ServiceCategory.Medical]: 'پزشکی',
  [ServiceCategory.Rehabilitation]: 'توانبخشی',
  [ServiceCategory.PersonalCare]: 'مراقبت شخصی',
  [ServiceCategory.Emergency]: 'اورژانس',
  [ServiceCategory.Other]: 'سایر',
};

export default function HomeCareRequestsAdminPage() {
  const [requests, setRequests] = useState<HomeCareRequestListItem[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<HomeCareRequestDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const metrics = useMemo(() => ({
    newRequests: requests.filter((request) => request.status === HomeCareRequestStatus.Submitted).length,
    unreadMessages: requests.reduce((sum, request) => sum + request.unreadMessages, 0),
    openCases: requests.filter((request) => ![HomeCareRequestStatus.Completed, HomeCareRequestStatus.Cancelled].includes(request.status)).length,
  }), [requests]);
  const groupedRequests = useMemo(() => {
    const groups = new Map<ServiceCategory, HomeCareRequestListItem[]>();
    requests.forEach((request) => {
      const current = groups.get(request.serviceCategory) ?? [];
      current.push(request);
      groups.set(request.serviceCategory, current);
    });
    return Array.from(groups.entries());
  }, [requests]);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const data = await homeCareService.getAllRequests();
        setRequests(data);
        if (data[0]) {
          setSelectedRequestId(data[0].id);
        }
      } catch (error) {
        console.error(error);
        toast.error('دریافت درخواست‌ها با مشکل مواجه شد');
      } finally {
        setLoading(false);
      }
    };

    void loadRequests();
  }, []);

  useEffect(() => {
    if (!selectedRequestId) {
      return;
    }

    const loadRequestDetails = async () => {
      try {
        setDetailsLoading(true);
        const data = await homeCareService.getRequestById(selectedRequestId);
        setSelectedRequest(data);
      } catch (error) {
        console.error(error);
        toast.error('دریافت جزئیات پرونده انجام نشد');
      } finally {
        setDetailsLoading(false);
      }
    };

    void loadRequestDetails();
  }, [selectedRequestId]);

  const handleStatusUpdate = async (status: HomeCareRequestStatus) => {
    if (!selectedRequest) {
      return;
    }

    try {
      setUpdating(true);
      const updated = await homeCareService.updateStatus(selectedRequest.id, { status });
      setSelectedRequest(updated);
      setRequests((current) => current.map((request) => request.id === updated.id ? { ...request, status: updated.status } : request));
      toast.success('وضعیت پرونده به‌روزرسانی شد');
    } catch (error) {
      console.error(error);
      toast.error('به‌روزرسانی وضعیت انجام نشد');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Communication Center - Home Care</h1>
        <p className="mt-2 text-sm text-gray-500">مدیریت درخواست‌های جدید، پیام‌های خوانده‌نشده، وضعیت پرونده و پیگیری ارتباطات بیماران.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard title="درخواست‌های جدید" value={metrics.newRequests} icon={<PhoneCall className="h-5 w-5 text-teal-600" />} />
        <MetricCard title="پیام‌های خوانده‌نشده" value={metrics.unreadMessages} icon={<MessageSquareMore className="h-5 w-5 text-blue-600" />} />
        <MetricCard title="پرونده‌های باز" value={metrics.openCases} icon={<ShieldCheck className="h-5 w-5 text-amber-600" />} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-black text-gray-900">صف درخواست‌ها</h2>
          {loading ? (
            <div className="py-12 text-center text-gray-500">در حال بارگذاری...</div>
          ) : requests.length === 0 ? (
            <div className="py-12 text-center text-gray-500">هنوز درخواستی ثبت نشده است.</div>
          ) : (
            <div className="space-y-5">
              {groupedRequests.map(([category, categoryRequests]) => (
                <div key={category} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                      {serviceCategoryLabels[category]}
                    </span>
                    <span className="text-xs text-gray-500">{categoryRequests.length} پرونده</span>
                  </div>
                  <div className="space-y-3">
                    {categoryRequests.map((request) => (
                      <button
                        key={request.id}
                        type="button"
                        onClick={() => setSelectedRequestId(request.id)}
                        className={`w-full rounded-3xl border p-4 text-right transition ${selectedRequestId === request.id ? 'border-teal-300 bg-teal-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-sm font-black text-gray-900">{request.trackingCode}</div>
                            <div className="mt-1 text-xs text-gray-500">{request.serviceTitle}</div>
                          </div>
                          {request.unreadMessages > 0 && (
                            <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700">
                              {request.unreadMessages} پیام
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
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
                  <p className="mt-1 text-sm text-gray-500">{selectedRequest.serviceTitle}</p>
                  <div className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                    {serviceCategoryLabels[selectedRequest.serviceCategory]}
                  </div>
                </div>
                <select
                  value={selectedRequest.status}
                  onChange={(event) => void handleStatusUpdate(Number(event.target.value) as HomeCareRequestStatus)}
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
                <InfoBlock label="بیمار/همراه" value={`${selectedRequest.contactFirstName} ${selectedRequest.contactLastName}`} />
                <InfoBlock label="شماره تماس" value={selectedRequest.contactMobile} />
                <InfoBlock label="کارشناس مسئول" value={selectedRequest.assignedSupervisorName || 'در حال تخصیص'} />
                <InfoBlock label="نیروی معرفی‌شده" value={selectedRequest.assignedCaregiverName || 'هنوز انتخاب نشده'} />
                <InfoBlock label="آدرس" value={selectedRequest.address || 'ثبت نشده'} />
                <InfoBlock label="پیام‌های گفتگو" value={String(selectedRequest.conversations[0]?.messages.length ?? 0)} />
              </div>

              <div>
                <h3 className="mb-3 text-lg font-black text-gray-900">تایم‌لاین پرونده</h3>
                <div className="space-y-3">
                  {selectedRequest.timeline.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-bold text-gray-900">{item.title}</div>
                        <div className="text-xs text-gray-500">
                          {new Intl.DateTimeFormat('fa-IR-u-ca-persian', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.occurredAt))}
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">{item.description}</div>
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
      <div className="mb-3 flex items-center gap-3">{icon}<span className="font-bold text-gray-700">{title}</span></div>
      <div className="text-3xl font-black text-gray-900">{value}</div>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
      <div className="text-xs font-bold text-gray-500">{label}</div>
      <div className="mt-2 text-sm font-medium text-gray-900">{value}</div>
    </div>
  );
}
