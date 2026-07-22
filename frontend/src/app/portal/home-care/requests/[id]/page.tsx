'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { homeCareService } from '@/services/home-care.service';
import { HomeCareConversation, HomeCareMessageType, HomeCareRequestDetails, HomeCareRequestStatus } from '@/types/home-care';
import { CheckCircle2, Clock3, FileUp, MessageSquare, PhoneCall, ShieldCheck, UserRound, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const timelineTemplate: Array<{ status: HomeCareRequestStatus; title: string }> = [
  { status: HomeCareRequestStatus.Submitted, title: 'ثبت درخواست' },
  { status: HomeCareRequestStatus.UnderSupervisorReview, title: 'بررسی سوپروایزر' },
  { status: HomeCareRequestStatus.ContactScheduled, title: 'تماس با بیمار' },
  { status: HomeCareRequestStatus.AwaitingDocuments, title: 'دریافت مدارک' },
  { status: HomeCareRequestStatus.MatchingCaregiver, title: 'پیدا کردن نیروی مناسب' },
  { status: HomeCareRequestStatus.AwaitingPatientConfirmation, title: 'تایید بیمار' },
  { status: HomeCareRequestStatus.InService, title: 'شروع خدمت' },
  { status: HomeCareRequestStatus.Completed, title: 'پایان خدمت' },
  { status: HomeCareRequestStatus.SatisfactionPending, title: 'ثبت رضایت' },
];

const statusLabels: Record<HomeCareRequestStatus, string> = {
  [HomeCareRequestStatus.Draft]: 'پیش‌نویس',
  [HomeCareRequestStatus.Submitted]: 'ثبت درخواست',
  [HomeCareRequestStatus.UnderSupervisorReview]: 'بررسی سوپروایزر',
  [HomeCareRequestStatus.ContactScheduled]: 'تماس با بیمار',
  [HomeCareRequestStatus.AwaitingDocuments]: 'در انتظار مدارک',
  [HomeCareRequestStatus.MatchingCaregiver]: 'در حال یافتن نیرو',
  [HomeCareRequestStatus.AwaitingPatientConfirmation]: 'در انتظار تایید بیمار',
  [HomeCareRequestStatus.InService]: 'خدمت در حال انجام',
  [HomeCareRequestStatus.Completed]: 'پایان خدمت',
  [HomeCareRequestStatus.SatisfactionPending]: 'ثبت رضایت',
  [HomeCareRequestStatus.Cancelled]: 'لغو شده',
};

const contactMethodLabels = {
  0: 'تماس',
  1: 'واتساپ',
  2: 'پیامک',
  3: 'چت داخل برنامه',
};

export default function HomeCareRequestDetailsPage() {
  const params = useParams<{ id: string }>();
  const [details, setDetails] = useState<HomeCareRequestDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);

  const activeConversation = useMemo<HomeCareConversation | null>(() => details?.conversations?.[0] ?? null, [details]);

  useEffect(() => {
    const loadRequest = async () => {
      try {
        const data = await homeCareService.getRequestById(params.id);
        setDetails(data);
      } catch (error) {
        console.error(error);
        toast.error('دریافت اطلاعات درخواست با مشکل مواجه شد');
      } finally {
        setLoading(false);
      }
    };

    void loadRequest();
  }, [params.id]);

  const handleSendMessage = async () => {
    if (!activeConversation || (!message.trim() && files.length === 0)) {
      return;
    }

    try {
      setSending(true);
      await homeCareService.sendMessage(activeConversation.id, message, HomeCareMessageType.Text, files);
      const refreshed = await homeCareService.getRequestById(params.id);
      setDetails(refreshed);
      setMessage('');
      setFiles([]);
    } catch (error) {
      console.error(error);
      toast.error('ارسال پیام انجام نشد');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!details) {
    return <div className="rounded-3xl bg-white p-8 text-center text-gray-500">پرونده درخواست یافت نشد.</div>;
  }

  return (
    <div className="space-y-6 pb-24">
      <section className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white shadow-lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm text-white/70">کد رهگیری</p>
            <h1 className="text-2xl font-black">{details.trackingCode}</h1>
            <p className="text-sm text-white/80">{details.serviceTitle}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <InfoPill icon={<Clock3 className="h-4 w-4" />} label="وضعیت پرونده" value={statusLabels[details.status]} />
            <InfoPill icon={<PhoneCall className="h-4 w-4" />} label="زمان تقریبی تماس" value={details.estimatedContactAt ? new Intl.DateTimeFormat('fa-IR-u-ca-persian', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(details.estimatedContactAt)) : 'به‌زودی'} />
            <InfoPill icon={<ShieldCheck className="h-4 w-4" />} label="کارشناس مسئول" value={details.assignedSupervisorName || 'در حال تخصیص'} />
            <InfoPill icon={<UserRound className="h-4 w-4" />} label="روش ارتباط ترجیحی" value={contactMethodLabels[details.preferredContactMethod] ?? 'تماس'} />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-black text-gray-900">تایم‌لاین حرفه‌ای پرونده</h2>
            <div className="space-y-5">
              {timelineTemplate.map((item, index) => {
                const event = details.timeline.find((timelineItem) => timelineItem.title.includes(item.title) || Number(details.status) >= Number(item.status));
                const completed = Number(details.status) >= Number(item.status);
                return (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${completed ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-400'}`}>
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      {index < timelineTemplate.length - 1 && <div className={`mt-2 h-12 w-0.5 ${completed ? 'bg-teal-200' : 'bg-gray-200'}`} />}
                    </div>
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-black text-gray-900">{item.title}</h3>
                        {event?.occurredAt && (
                          <span className="text-xs text-gray-500">
                            {new Intl.DateTimeFormat('fa-IR-u-ca-persian', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(event.occurredAt))}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm leading-7 text-gray-500">
                        {event?.description || 'هنوز برای این مرحله رویدادی ثبت نشده است.'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-black text-gray-900">خلاصه نیازهای ثبت‌شده</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {details.form?.questions.map((question) => {
                const answer = details.answers.find((item) => item.questionId === question.questionId);
                if (!answer) {
                  return null;
                }
                return (
                  <div key={question.questionId} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <div className="text-xs font-bold text-gray-500">{question.question}</div>
                    <div className="mt-2 text-sm text-gray-900">{formatAnswer(question, answer)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-teal-600" />
              <h2 className="text-xl font-black text-gray-900">ارتباط با مرکز مراقبت</h2>
            </div>
            <div className="mb-4 space-y-3 rounded-3xl bg-gray-50 p-4">
              <div className="text-sm text-gray-500">کارشناس مسئول</div>
              <div className="font-black text-gray-900">{details.assignedSupervisorName || 'به‌زودی تعیین می‌شود'}</div>
            </div>

            <div className="space-y-3 rounded-3xl border border-gray-100 bg-gray-50 p-4">
              <div className="max-h-80 space-y-3 overflow-y-auto">
                {activeConversation?.messages.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-2xl px-4 py-3 text-sm ${item.senderRoleLabel === 'بیمار/همراه' ? 'bg-teal-600 text-white' : 'bg-white text-gray-700'}`}
                  >
                    <div className="mb-1 text-xs font-bold opacity-80">{item.senderName} - {item.senderRoleLabel}</div>
                    <div>{item.content}</div>
                    {item.attachments.length > 0 && (
                      <div className="mt-2 space-y-1 text-xs">
                        {item.attachments.map((attachment) => (
                          <a key={attachment.id} href={attachment.fileUrl} target="_blank" className="block underline">
                            {attachment.originalFileName}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <textarea
                rows={4}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="پیام خود را برای مرکز مراقبت بنویسید..."
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-teal-500"
              />

              <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500">
                <FileUp className="h-4 w-4" />
                ارسال فایل، عکس یا مدرک پزشکی
                <input type="file" multiple className="hidden" onChange={(event) => setFiles(Array.from(event.target.files ?? []))} />
              </label>

              {files.length > 0 && (
                <div className="rounded-2xl bg-white p-3 text-xs text-gray-500">
                  {files.map((file) => file.name).join('، ')}
                </div>
              )}

              <button
                type="button"
                onClick={() => void handleSendMessage()}
                disabled={sending}
                className="w-full rounded-2xl bg-teal-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
              >
                {sending ? 'در حال ارسال...' : 'ارسال پیام'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm text-white/70">
        {icon}
        {label}
      </div>
      <div className="text-sm font-bold text-white">{value}</div>
    </div>
  );
}

function formatAnswer(question: NonNullable<HomeCareRequestDetails['form']>['questions'][number], answer: HomeCareRequestDetails['answers'][number]) {
  if (answer.selectedOptionId !== undefined) {
    return question.options.find((option) => option.id === answer.selectedOptionId)?.text ?? 'انتخاب شده';
  }
  if (answer.booleanResponse !== undefined) {
    return answer.booleanResponse ? 'بله' : 'خیر';
  }
  if (answer.numberResponse !== undefined) {
    return String(answer.numberResponse);
  }
  if (answer.textResponse) {
    return answer.textResponse;
  }
  if (answer.dateResponse) {
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', { dateStyle: 'medium' }).format(new Date(answer.dateResponse));
  }
  if (answer.jsonResponse) {
    try {
      const parsed = JSON.parse(answer.jsonResponse);
      return Array.isArray(parsed) ? parsed.join('، ') : JSON.stringify(parsed);
    } catch {
      return answer.jsonResponse;
    }
  }
  return 'بدون پاسخ';
}
