'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Clock, Eye, ShieldCheck, CheckCircle2, BookOpen, Phone, MessageCircle, ArrowLeft,
  MessageSquare, BookMarked, Share2, AlertTriangle, Loader2
} from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Button } from '@/components/ui/Button';
import adminContentApi from '@/lib/content-admin-api';
import { getArticleBySlug } from '@/lib/content-api';
import DOMPurify from 'isomorphic-dompurify';

const VALID_PREVIEW_STATUSES: string[] = ['Draft', 'PendingReview', 'Published', 'Archived'];
const PREVIEW_STATUS_NUM_TO_STR: Record<number, string> = {
  0: 'Draft',
  1: 'PendingReview',
  2: 'Published',
  3: 'Archived',
};
function normalizeArticleStatus(v: unknown): string {
  if (typeof v === 'number') {
    return PREVIEW_STATUS_NUM_TO_STR[v] ?? 'Draft';
  }
  if (typeof v === 'string') {
    if (VALID_PREVIEW_STATUSES.includes(v)) return v;
    const low = v.toLowerCase();
    if (low === 'draft') return 'Draft';
    if (low === 'pendingreview' || low === 'pending' || low === 'pending_review') return 'PendingReview';
    if (low === 'published' || low === 'publish') return 'Published';
    if (low === 'archived' || low === 'archive') return 'Archived';
    if (/^\d+$/.test(v)) {
      return PREVIEW_STATUS_NUM_TO_STR[parseInt(v, 10)] ?? 'Draft';
    }
  }
  return 'Draft';
}

function formatDate(date?: string | Date | null) {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric', month: 'long', day: 'numeric'
    }).format(d);
  } catch { return ''; }
}

function toCamelCaseKey(k: string): string {
  if (!k) return k;
  if (k.length <= 1) return k.toLowerCase();
  return k.charAt(0).toLowerCase() + k.slice(1);
}

function deepCamelize(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(deepCamelize);
  if (typeof obj !== 'object') return obj;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    out[toCamelCaseKey(k)] = deepCamelize(v);
  }
  return out;
}

export default function ArticlePreviewPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params?.slug;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawData, setRawData] = useState<any>(null);

  useEffect(() => {
    if (!slug) return;
    let alive = true;
    setLoading(true);
    setError(null);

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const safetyTimeout = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('TIMEOUT_SAFETY'));
      }, 7000);
    });

    const fetchPreview = async () => {
      try {
        const data = await Promise.race([
          adminContentApi.previewArticleBySlug(slug),
          safetyTimeout,
        ]);
        if (alive) {
          if (data) {
            setRawData(deepCamelize(data));
            return;
          }
          throw new Error('EMPTY_PREVIEW');
        }
      } catch (err: any) {
        if (!alive) return;
        // eslint-disable-next-line no-console
        console.debug('[article-preview] admin preview failed, falling back to public mock article:', err?.message || err);
      }

      // Fallback 1: try the public content API (it has mock fallback -> articles[])
      try {
        const publicArticle = await Promise.race([
          getArticleBySlug(slug),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error('FALLBACK_TIMEOUT')), 5000)),
        ]);
        if (alive && publicArticle) {
          setRawData(deepCamelize(publicArticle));
          return;
        }
      } catch (fallbackErr: any) {
        // eslint-disable-next-line no-console
        console.debug('[article-preview] public fallback also failed:', fallbackErr?.message || fallbackErr);
      }

      // Final fallback: take the first available mock article as emergency content
      try {
        // @ts-ignore - dynamic import is safe
        const mod = await import('@/lib/data/content-data');
        const mockArticles = (mod?.articles || []) as any[];
        const direct = mockArticles.find((a: any) => a.slug === slug);
        const pick = direct || mockArticles[0] || null;
        if (alive && pick) {
          setRawData(deepCamelize(pick));
          return;
        }
      } catch {
        /* ignore */
      }

      if (alive) {
        setError('مقاله‌ای برای پیش‌نمایش یافت نشد و اتصال به سرور برقرار نیست.');
      }
    };

    fetchPreview().finally(() => {
      if (timeoutId) clearTimeout(timeoutId);
      if (alive) setLoading(false);
    });

    return () => {
      alive = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-32 pb-20 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 text-teal-600 animate-spin" />
            <p className="text-sm font-bold text-gray-600">در حال بارگذاری پیش‌نمایش مقاله...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !rawData) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-32 pb-20">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="rounded-3xl border border-rose-200 bg-rose-50/60 p-8 text-center shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto">
                <AlertTriangle className="h-8 w-8 text-rose-600" />
              </div>
              <h2 className="text-xl font-black text-rose-800">خطا در نمایش پیش‌نمایش</h2>
              <p className="text-sm font-bold text-rose-600/80">{error || 'مقاله‌ای برای نمایش یافت نشد'}</p>
              <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => router.back()}>
                  <ArrowLeft className="ml-2 h-4 w-4" />
                  بازگشت
                </Button>
                <Link href="/dashboard/admin/content/articles">
                  <Button size="sm">مدیریت مقالات</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const art: any = rawData;
  const status = normalizeArticleStatus(art.status);

  const approvedReview = (art.medicalReviews || []).find((r: any) => r.isApproved || r.approved);
  const authorFullName = art.author
    ? `${art.author.firstName || ''} ${art.author.lastName || ''}`.trim()
    : '';
  const authorSlug = art.author?.slug;

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <div className="bg-amber-50 border-b border-amber-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0">
              <Eye className="h-4 w-4 text-amber-700" />
            </div>
            <div>
              <p className="text-xs font-black text-amber-800">حالت پیش‌نمایش — فقط برای شما نمایش داده می‌شود</p>
              <p className="text-[11px] font-bold text-amber-700/80">
                وضعیت فعلی مقاله:
                <span className={`mr-1 inline-flex px-2 py-0.5 rounded-full text-[10px] font-black ${
                  status === 'Published' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                  status === 'PendingReview' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                  status === 'Archived' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                  'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  {status === 'Published' ? 'منتشر شده' :
                   status === 'PendingReview' ? 'در انتظار بررسی' :
                   status === 'Archived' ? 'آرشیو شده' : 'پیش‌نویس'}
                </span>
                {status !== 'Published' && ' (برای عموم کاربران نمایش داده نمی‌شود)'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/admin/content/articles">
              <Button variant="outline" size="sm">بازگشت به مدیریت</Button>
            </Link>
            {status === 'Published' && (
              <Link href={`/articles/${art.slug}`} target="_blank">
                <Button size="sm">
                  <Eye className="ml-2 h-4 w-4" />
                  نسخه عمومی
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <main className="pt-10 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <article className="lg:col-span-8">
              <header className="mb-8">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {art.category && (
                    <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-100">
                      {art.category.name}
                    </span>
                  )}
                  {art.isMedicalContent && (
                    <span className="px-3 py-1 rounded-full bg-teal-600 text-white text-xs font-bold shadow-sm flex items-center gap-1">
                      <ShieldCheck size={12} />
                      محتوای پزشکی تأیید شده
                    </span>
                  )}
                  {art.isFactChecked && (
                    <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
                      <CheckCircle2 size={12} className="inline ml-1" />
                      بررسی فاکتو
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight mb-5">
                  {art.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 sm:gap-6 pb-6 sm:pb-8 border-b border-gray-100">
                  {art.author && (
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-teal-50 to-gray-100 flex-shrink-0 border border-gray-100">
                        {art.author.profileImageUrl ? (
                          <img src={art.author.profileImageUrl} alt={authorFullName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg font-black text-teal-600">
                            {(art.author.firstName || '')[0] || 'م'}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 flex items-center gap-1">
                          {authorFullName}
                          {art.author.isMedicalReviewer && <ShieldCheck size={14} className="text-teal-500" />}
                        </div>
                        <p className="text-xs text-gray-500">
                          {art.author.title}
                          {art.author.specialization ? ` • ${art.author.specialization}` : ''}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5"><Clock size={14} /> {art.readingTime || art.estimatedReadingTimeMinutes || 5} دقیقه مطالعه</span>
                    <span className="flex items-center gap-1.5"><Eye size={14} /> {(art.viewCount || 0).toLocaleString('fa-IR')} بازدید</span>
                    <span>انتشار: {formatDate(art.publishedAt)}</span>
                    {art.lastUpdatedAt && (
                      <span className="text-teal-600 font-medium">آخرین بروزرسانی: {formatDate(art.lastUpdatedAt)}</span>
                    )}
                  </div>
                </div>
              </header>

              {art.featuredImageUrl && (
                <div className="mb-8 rounded-3xl overflow-hidden border border-gray-100 shadow-lg">
                  <img src={art.featuredImageUrl} alt={art.featuredImageAlt || art.title} className="w-full aspect-[16/9] object-cover" />
                </div>
              )}

              {art.shortAnswer && (
                <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-teal-50 via-white to-amber-50/50 border border-teal-200/30 shadow-lg shadow-teal-50">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center shadow-lg shadow-teal-500/20">
                      <MessageCircle size={18} />
                    </div>
                    <div>
                      <p className="font-black text-gray-900">پاسخ کوتاه و سئو برای موتورهای جستجو و هوش مصنوعی</p>
                      <p className="text-xs text-gray-500">AEO / GEO Friendly</p>
                    </div>
                  </div>
                  <p className="text-gray-800 font-medium leading-loose text-base sm:text-lg">
                    {art.shortAnswer}
                  </p>
                </div>
              )}

              {art.excerpt && (
                <div className="mb-8 pl-6 border-r-4 border-teal-500 pr-2">
                  <p className="text-lg text-gray-700 font-medium leading-loose italic">
                    {art.excerpt}
                  </p>
                </div>
              )}

              {art.content && art.content.length > 500 && (
                <div className="mb-8 p-5 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="font-black text-gray-900 mb-3 flex items-center gap-2">
                    <BookOpen size={18} className="text-teal-500" />
                    فهرست مطالب
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm">
                    <li><a href="#intro" className="text-teal-600 hover:text-teal-700 hover:translate-x-[-2px] transition">مقدمه</a></li>
                    <li><a href="#symptoms" className="text-teal-600 hover:text-teal-700 hover:translate-x-[-2px] transition">علائم و نشانه‌ها</a></li>
                    <li><a href="#causes" className="text-teal-600 hover:text-teal-700 hover:translate-x-[-2px] transition">علل و عوامل خطر</a></li>
                    <li><a href="#treatment" className="text-teal-600 hover:text-teal-700 hover:translate-x-[-2px] transition">روش‌های درمان</a></li>
                    <li><a href="#home-care" className="text-teal-600 hover:text-teal-700 hover:translate-x-[-2px] transition">مراقبت در منزل</a></li>
                    <li><a href="#prevention" className="text-teal-600 hover:text-teal-700 hover:translate-x-[-2px] transition">پیشگیری</a></li>
                    <li><a href="#faq" className="text-teal-600 hover:text-teal-700 hover:translate-x-[-2px] transition">سوالات متداول</a></li>
                    <li><a href="#sources" className="text-teal-600 hover:text-teal-700 hover:translate-x-[-2px] transition">منابع و مراجع</a></li>
                  </ul>
                </div>
              )}

              <div
                className="prose prose-lg max-w-none prose-headings:font-black prose-headings:text-gray-900 prose-h2:text-2xl prose-h3:mt-10 prose-h3:mb-4 prose-h3:text-xl prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline prose-p:text-gray-700 prose-p:leading-loose prose-ul:list-disc prose-ul:pr-5 prose-ol:pr-5 prose-li:text-gray-700 prose-li:leading-loose prose-blockquote:border-r-4 prose-blockquote:border-teal-500 prose-blockquote:not-italic"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(art.content || '', { ADD_ATTR: ['target', 'rel'], ADD_TAGS: ['iframe'] }) }}
              />

              {approvedReview && (approvedReview.medicalReviewer || approvedReview.reviewer) && (
                <div className="mt-10 p-6 rounded-3xl bg-gradient-to-br from-teal-50 via-white to-blue-50/50 border border-teal-200/40">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-teal-100 to-teal-50 flex-shrink-0 border-2 border-teal-200">
                      {(approvedReview.medicalReviewer || approvedReview.reviewer)?.profileImageUrl ? (
                        <img src={(approvedReview.medicalReviewer || approvedReview.reviewer)?.profileImageUrl || ''} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl font-black text-teal-600">
                          {(approvedReview.medicalReviewer || approvedReview.reviewer)?.firstName?.[0] || 'م'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <ShieldCheck size={16} className="text-teal-600" />
                        <p className="font-black text-gray-900">محتوا تحت تأیید تیم پزشکی</p>
                      </div>
                      <p className="font-bold text-gray-800 mb-0.5">
                        {(approvedReview.medicalReviewer || approvedReview.reviewer)?.firstName} {(approvedReview.medicalReviewer || approvedReview.reviewer)?.lastName}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        {(approvedReview.medicalReviewer || approvedReview.reviewer)?.title} • {(approvedReview.medicalReviewer || approvedReview.reviewer)?.specialization} • {((approvedReview.medicalReviewer || approvedReview.reviewer)?.yearsOfExperience || 0)}+ سال تجربه
                      </p>
                      <p className="text-xs text-gray-500">
                        تاریخ بررسی: {formatDate(approvedReview.reviewedAt)}
                        {approvedReview.expiresAt && ` • اعتبار تا: ${formatDate(approvedReview.expiresAt)}`}
                      </p>
                      {(approvedReview.notes || approvedReview.reviewNotes) && (
                        <p className="mt-3 p-3 rounded-xl bg-white/70 border border-gray-100 text-sm text-gray-700 leading-relaxed">
                          {approvedReview.notes || approvedReview.reviewNotes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {art.sources && art.sources.length > 0 && (
                <div id="sources" className="mt-10 p-6 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="font-black text-gray-900 mb-4 flex items-center gap-2">
                    <BookMarked size={18} className="text-amber-500" />
                    منابع و سایتیشن‌ها
                  </p>
                  <ol className="space-y-2 pr-5 list-decimal">
                    {art.sources.map((src: any, idx: number) => (
                      <li key={idx} className="text-sm text-gray-600 leading-relaxed">
                        <span className="font-medium text-gray-800">{src.title}</span>
                        {src.publisher && <span className="text-amber-700"> – {src.publisher}</span>}
                        {src.publicationYear && <span className="text-gray-500"> ({src.publicationYear})</span>}
                        {src.url && (
                          <>
                            {' '}<a href={src.url} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline text-xs">
                              مشاهده منبع ↗
                            </a>
                          </>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {art.faqs && art.faqs.length > 0 && (
                <div id="faq" className="mt-10">
                  <p className="font-black text-2xl text-gray-900 mb-5 flex items-center gap-2">
                    <MessageSquare size={24} className="text-purple-500" />
                    سوالات متداول
                  </p>
                  <div className="space-y-3">
                    {art.faqs.map((faq: any, idx: number) => (
                      <details key={idx} className="group rounded-2xl bg-white border border-gray-100 open:shadow-lg open:border-purple-100 transition-all overflow-hidden">
                        <summary className="cursor-pointer p-5 sm:p-6 flex items-center justify-between gap-4 font-bold text-gray-900 hover:bg-purple-50/30 transition marker:content-['']">
                          <span className="leading-relaxed">{faq.question}</span>
                          <span className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 text-xs group-open:rotate-180 group-open:bg-purple-500 group-open:text-white transition-all duration-300">+</span>
                        </summary>
                        <div className="px-5 sm:px-6 pb-6 pt-0 text-gray-700 leading-loose border-t border-gray-100 pt-4">
                          {faq.answer}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              )}

              {(art.tags && art.tags.length > 0) && (
                <div className="mt-10 pt-8 border-t border-gray-100">
                  <p className="text-sm font-bold text-gray-500 mb-3">برچسب‌ها:</p>
                  <div className="flex flex-wrap gap-2">
                    {art.tags.map((tag: any) => (
                      <span key={tag.id} className="px-3 py-1.5 rounded-full text-xs font-bold bg-gray-50 text-gray-600 border border-gray-100">
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 pt-8 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm font-bold text-gray-700">این مقاله را به اشتراک بگذارید:</p>
                <div className="flex items-center gap-2">
                  <button className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-blue-50 text-gray-500 hover:text-blue-500 border border-gray-100 transition flex items-center justify-center">
                    <Share2 size={16} />
                  </button>
                  <button className="px-4 h-10 rounded-xl bg-gray-50 hover:bg-blue-50 text-gray-500 hover:text-blue-500 border border-gray-100 transition flex items-center gap-1.5 text-xs font-bold">
                    کپی لینک
                  </button>
                </div>
              </div>
            </article>

            <aside className="lg:col-span-4 space-y-6">
              <div className="sticky top-28 space-y-6">
                <div className="p-6 rounded-3xl bg-gradient-to-br from-teal-600 to-teal-700 text-white relative overflow-hidden shadow-xl shadow-teal-600/20">
                  <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(circle at 30% 10%, white 0%, transparent 50%)'}} />
                  <div className="relative">
                    <p className="text-sm font-bold mb-1 opacity-90">نیاز به کمک دارید؟</p>
                    <p className="text-2xl font-black mb-4 leading-tight">درخواست فوری پرستار</p>
                    <p className="text-sm text-teal-100 mb-5 leading-relaxed">
                      پرستاران حرفه‌ای ما در کمتر از ۲ ساعت در دسترس شما هستند
                    </p>
                    <Link href="/guest-request" className="block w-full text-center py-3.5 rounded-xl bg-white text-teal-700 font-black mb-2 hover:shadow-xl transition">
                      درخواست خدمات
                    </Link>
                    <a href="tel:09128718237" className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-teal-500/30 border border-teal-400/30 font-bold text-sm hover:bg-teal-500/50 transition">
                      <Phone size={16} />
                      ۰۹۱۲۸۷۱۸۲۳۷
                    </a>
                  </div>
                </div>

                {art.author && (
                  <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-1 h-5 rounded-full bg-amber-500" />
                      درباره نویسنده
                    </h3>
                    <div className="text-center">
                      <div className="inline-block mb-3">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto bg-gray-100 border-2 border-amber-100">
                          {art.author.profileImageUrl ? (
                            <img src={art.author.profileImageUrl} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl font-black text-teal-600">
                              {(art.author.firstName || '')[0] || 'م'}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="font-black text-gray-900">
                        {authorFullName}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 mb-2">{art.author.title}</p>
                      <p className="text-xs text-gray-600 mb-3">{art.author.specialization}</p>
                      {art.author.yearsOfExperience && (
                        <p className="text-xs font-bold text-teal-600 mb-4">+{art.author.yearsOfExperience} سال تجربه</p>
                      )}
                      {authorSlug && (
                        <Link href={`/authors/${authorSlug}`} className="inline-block w-full py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-bold transition">
                          مشاهده همه مقالات
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
