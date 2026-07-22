'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { homeCareService } from '@/services/home-care.service';
import { HomeCareRequestListItem, HomeCareRequestStatus } from '@/types/home-care';
import { MessageSquare, PlusCircle, Clock3, ChevronLeft, ClipboardList } from 'lucide-react';

const statusLabels: Record<HomeCareRequestStatus, string> = {
  [HomeCareRequestStatus.Draft]: 'پیش‌نویس',
  [HomeCareRequestStatus.Submitted]: 'ثبت‌شده',
  [HomeCareRequestStatus.UnderSupervisorReview]: 'در حال بررسی',
  [HomeCareRequestStatus.ContactScheduled]: 'تماس برنامه‌ریزی شده',
  [HomeCareRequestStatus.AwaitingDocuments]: 'در انتظار مدارک',
  [HomeCareRequestStatus.MatchingCaregiver]: 'در حال یافتن نیرو',
  [HomeCareRequestStatus.AwaitingPatientConfirmation]: 'در انتظار تایید شما',
  [HomeCareRequestStatus.InService]: 'خدمت در حال انجام',
  [HomeCareRequestStatus.Completed]: 'پایان‌یافته',
  [HomeCareRequestStatus.SatisfactionPending]: 'در انتظار رضایت‌سنجی',
  [HomeCareRequestStatus.Cancelled]: 'لغو شده',
};

export default function PortalHomeCarePage() {
  const [requests, setRequests] = useState<HomeCareRequestListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const data = await homeCareService.getMyRequests();
        setRequests(data);
      } catch (error) {
        console.error('Failed to load home care requests', error);
      } finally {
        setLoading(false);
      }
    };

    void loadRequests();
  }, []);

  return (
    <div className="space-y-6 pb-24">
      <section className="rounded-3xl bg-gradient-to-r from-teal-600 to-cyan-600 p-6 text-white shadow-lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm text-white/80">ارتباط با مرکز مراقبت</p>
            <h1 className="text-2xl font-black">درخواست خدمات مراقبت در منزل</h1>
            <p className="max-w-2xl text-sm leading-7 text-white/85">
              درخواست جدید ثبت کنید، وضعیت پرونده را مرحله‌به‌مرحله ببینید، مدارک ارسال کنید و با مرکز مراقبت در ارتباط بمانید.
            </p>
          </div>
          <Link
            href="/portal/home-care/request"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-teal-700 transition hover:bg-teal-50"
          >
            <PlusCircle className="h-5 w-5" />
            ثبت درخواست جدید
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-3 text-teal-700">
            <ClipboardList className="h-5 w-5" />
            <span className="font-bold">پرونده‌های فعال</span>
          </div>
          <p className="text-3xl font-black text-gray-900">
            {requests.filter((request) => ![HomeCareRequestStatus.Completed, HomeCareRequestStatus.Cancelled].includes(request.status)).length}
          </p>
        </div>
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-3 text-blue-700">
            <MessageSquare className="h-5 w-5" />
            <span className="font-bold">پیام‌های خوانده‌نشده</span>
          </div>
          <p className="text-3xl font-black text-gray-900">
            {requests.reduce((sum, request) => sum + request.unreadMessages, 0)}
          </p>
        </div>
        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-3 text-amber-700">
            <Clock3 className="h-5 w-5" />
            <span className="font-bold">در انتظار تماس</span>
          </div>
          <p className="text-3xl font-black text-gray-900">
            {requests.filter((request) => request.estimatedContactAt).length}
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-900">تاریخچه درخواست‌ها</h2>
            <p className="mt-1 text-sm text-gray-500">تمام پرونده‌های درخواست، وضعیت، کد رهگیری و ارتباطات از این بخش قابل پیگیری است.</p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-500">در حال بارگذاری...</div>
        ) : requests.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center text-gray-500">
            هنوز درخواستی ثبت نشده است.
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Link
                key={request.id}
                href={`/portal/home-care/requests/${request.id}`}
                className="flex flex-col gap-4 rounded-3xl border border-gray-100 p-5 transition hover:border-teal-200 hover:bg-teal-50/40 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-teal-800">{request.serviceTitle}</span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">{statusLabels[request.status]}</span>
                    {request.unreadMessages > 0 && (
                      <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700">
                        {request.unreadMessages} پیام جدید
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-black text-gray-900">{request.trackingCode}</h3>
                  <p className="text-sm text-gray-500">
                    تماس: {request.contactName} - {request.contactMobile}
                  </p>
                  <p className="text-sm text-gray-500">
                    ثبت: {new Intl.DateTimeFormat('fa-IR-u-ca-persian', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(request.createdAt))}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-500">
                  {request.estimatedContactAt && (
                    <span>
                      تماس تقریبی: {new Intl.DateTimeFormat('fa-IR-u-ca-persian', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(request.estimatedContactAt))}
                    </span>
                  )}
                  <ChevronLeft className="h-5 w-5 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
