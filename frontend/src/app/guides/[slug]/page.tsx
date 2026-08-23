import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  ShieldCheck,
  ChevronLeft,
  Clock,
  Eye,
  Phone,
  CheckCircle2,
  Sparkles,
  User,
  ListChecks,
  Share2,
} from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Breadcrumb from '@/components/seo/Breadcrumb';
import { FAQSchema, ArticleSchema } from '@/lib/seo/structured-data';
import { listGuides, getGuideBySlug, listArticles, listServicesWithSeo } from '@/lib/content-api';
import type { Guide, ContentTag } from '@/lib/types/content';
import DOMPurify from 'isomorphic-dompurify';

type Params = { params: { slug: string } };

export async function generateStaticParams() {
  const guidesResult = await listGuides({ pageSize: 100 });
  return (guidesResult?.items || []).map(g => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const guide = await getGuideBySlug(params.slug);
  if (!guide) return { title: 'راهنما یافت نشد' };
  return {
    title: guide.metaTitle || guide.title,
    description: guide.metaDescription || guide.shortDescription,
    keywords: [
      guide.primaryKeyword || guide.title,
      guide.title,
      ...(guide.secondaryKeywords || []),
    ].filter(Boolean),
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: {
      title: guide.metaTitle,
      description: guide.metaDescription || guide.shortDescription,
      type: 'article',
      url: `/guides/${guide.slug}`,
      images: guide.ogImageUrl ? [guide.ogImageUrl] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.metaTitle,
      description: guide.metaDescription,
      images: guide.ogImageUrl ? [guide.ogImageUrl] : undefined,
    },
  };
}

export default async function GuideDetailPage({ params }: Params) {
  const [guideResult, articlesResult, servicesResult] = await Promise.all([
    getGuideBySlug(params.slug),
    listArticles({ pageSize: 20 }),
    listServicesWithSeo(),
  ]);
  const guide = guideResult;
  if (!guide) notFound();
  const g: Guide = guide;
  const articles = articlesResult?.items || [];
  const serviceSeoProfiles = servicesResult || [];

  const relatedArticles = articles.filter(a =>
    a.categoryId === g.categoryId || a.tags?.some(t => g.tags?.some((gt: ContentTag) => gt.id === t.id))
  ).slice(0, 3);
  const relatedServices = serviceSeoProfiles.filter(s =>
    s.serviceDefinitionId === g.serviceDefinitionId
  ).slice(0, 3);

  function formatDate(dateStr?: string) {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }).format(d);
    } catch { return ''; }
  }

  const author = g.author;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <FAQSchema faqs={g.faqs || []} pageUrl={`/guides/${g.slug}`} />
      <Navbar />

      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[
            { name: 'راهنماهای پرستاری', href: '/guides' },
            { name: g.title, href: `/guides/${g.slug}` },
          ]} />

          <div className="relative bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 rounded-3xl overflow-hidden mb-10 shadow-2xl">
            {g.coverImageUrl && (
              <img
                src={g.coverImageUrl}
                alt={g.title}
                className="absolute inset-0 w-full h-full object-cover opacity-30"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="relative p-8 sm:p-12 lg:p-14">
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur text-white text-xs font-bold border border-white/25 flex items-center gap-1.5">
                  <ListChecks size={13} /> راهنمای گام به گام
                </span>
                {g.category && (
                  <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur text-white text-xs font-bold border border-white/25">
                    {g.category.name}
                  </span>
                )}
                {g.isMedicalContent && (
                  <span className="px-3 py-1 rounded-full bg-teal-400/30 backdrop-blur text-white text-xs font-bold border border-teal-300/40 flex items-center gap-1.5">
                    <ShieldCheck size={13} /> محتوای تأیید پزشکی
                  </span>
                )}
                {g.steps && g.steps.length > 0 && (
                  <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur text-white text-xs font-bold border border-white/25">
                    {g.steps.length} مرحله عملی
                  </span>
                )}
              </div>

              <div className="max-w-4xl">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-5 leading-tight">
                  {g.title}
                </h1>
                {g.shortDescription && (
                  <p className="text-lg sm:text-xl text-white/85 leading-relaxed mb-8 max-w-3xl">
                    {g.shortDescription}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-5 text-sm text-white/90">
                  {author && (
                    <div className="flex items-center gap-2.5">
                      {author.profileImageUrl ? (
                        <img src={author.profileImageUrl} alt={author.fullName} className="w-10 h-10 rounded-2xl border-2 border-white/40 object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center"><User size={18} /></div>
                      )}
                      <div>
                        <div className="font-black text-white leading-none">{author.fullName}</div>
                        {author.title && <div className="text-xs opacity-80 mt-0.5">{author.title}</div>}
                      </div>
                    </div>
                  )}
                  {g.estimatedReadingTimeMinutes && (
                    <span className="flex items-center gap-1.5">
                      <Clock size={16} /> زمان مطالعه: {g.estimatedReadingTimeMinutes} دقیقه
                    </span>
                  )}
                  {g.viewCount !== undefined && (
                    <span className="flex items-center gap-1.5">
                      <Eye size={16} /> {g.viewCount.toLocaleString('fa-IR')} بازدید
                    </span>
                  )}
                  {g.publishedAt && (
                    <span>انتشار: {formatDate(g.publishedAt)}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              {g.shortAnswer && (
                <section className="bg-gradient-to-br from-emerald-50 via-teal-50 to-amber-50 rounded-3xl p-6 sm:p-8 border-2 border-emerald-100 relative overflow-hidden">
                  <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-200/30 rounded-full blur-3xl" />
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-200/30 rounded-full blur-3xl" />
                  <div className="relative">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow-sm border border-emerald-100 text-emerald-700 text-xs font-bold mb-4">
                      <Sparkles size={13} /> پاسخ کوتاه و سریع
                    </div>
                    <p className="text-lg text-gray-800 leading-loose font-medium">
                      {g.shortAnswer}
                    </p>
                  </div>
                </section>
              )}

              {g.steps && g.steps.length > 0 && (
                <section className="bg-white rounded-3xl p-7 sm:p-8 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
                      <ListChecks size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-gray-900">مراحل عملی (گام به گام)</h2>
                      <p className="text-sm text-gray-500 mt-0.5">
                        دنبال کردن دقیق این مراحل را به خانواده و پرستار توصیه می‌کنیم
                      </p>
                    </div>
                  </div>
                  <div className="space-y-5">
                    {[...g.steps].sort((a, b) => a.order - b.order).map(step => (
                      <div key={step.order} className="group relative">
                        <div className="flex items-start gap-4 sm:gap-5 p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:from-amber-50 hover:to-white hover:border-amber-200 transition">
                          <div className="w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20 font-black text-xl">
                            {step.order}
                          </div>
                          <div className="flex-1 min-w-0 pt-1">
                            <h3 className="font-black text-lg sm:text-xl text-gray-900 group-hover:text-amber-700 transition mb-2">
                              {step.title}
                            </h3>
                            {step.description && (
                              <p className="text-gray-700 leading-loose text-sm sm:text-base">
                                {step.description}
                              </p>
                            )}
                          </div>
                          <CheckCircle2 size={24} className="text-gray-300 group-hover:text-amber-500 shrink-0 mt-1 transition" />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {g.content && (
                <section className="bg-white rounded-3xl p-7 sm:p-8 border border-gray-100 shadow-sm">
                  <h2 className="text-2xl font-black text-gray-900 mb-6">توضیحات تکمیلی</h2>
                  <div
                    className="prose prose-slate max-w-none prose-lg prose-headings:font-black prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-8 prose-p:text-gray-700 prose-p:leading-loose prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-ul:space-y-2 prose-ol:space-y-2"
                    dir="rtl"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(g.content || '', { ADD_ATTR: ['target', 'rel'], ADD_TAGS: ['iframe'] }) }}
                  />
                </section>
              )}

              {g.faqs && g.faqs.length > 0 && (
                <section className="bg-white rounded-3xl p-7 sm:p-8 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <BookOpen size={24} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900">سوالات متداول</h2>
                  </div>
                  <div className="space-y-3">
                    {g.faqs.sort((a, b) => a.displayOrder - b.displayOrder).map(faq => (
                      <details key={faq.id} className="group rounded-2xl bg-gray-50 border border-gray-100 p-5 open:bg-indigo-50/40 open:border-indigo-100 transition">
                        <summary className="flex items-center justify-between cursor-pointer font-bold text-gray-900 list-none">
                          <span className="flex items-center gap-3">
                            <span className="w-8 h-8 shrink-0 rounded-full bg-white border border-gray-200 group-open:bg-indigo-500 group-open:border-indigo-500 text-gray-500 group-open:text-white flex items-center justify-center text-sm font-black transition">
                              {faq.displayOrder}
                            </span>
                            <span className="leading-relaxed">{faq.question}</span>
                          </span>
                          <ChevronLeft size={20} className="text-gray-400 group-open:-rotate-90 transition shrink-0" />
                        </summary>
                        <div className="pr-11 pt-4 mt-3 border-t border-gray-200/60">
                          <p className="text-gray-700 leading-loose">{faq.answer}</p>
                        </div>
                      </details>
                    ))}
                  </div>
                </section>
              )}

              <section className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="font-bold text-gray-700">این راهنما را دوستان خود نیز ببینند:</div>
                  <div className="flex items-center gap-2">
                    {['تلگرام', 'واتساپ', 'توییتر', 'لینک'].map(sm => (
                      <button
                        key={sm}
                        className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-sm font-bold hover:bg-teal-50 hover:border-teal-200 hover:text-teal-700 transition"
                      >
                        <Share2 size={15} /> {sm}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            <div className="lg:col-span-4 space-y-5">
              <div className="bg-white rounded-3xl p-6 border-2 border-amber-100 shadow-sm sticky top-28">
                <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 -m-6 mb-5 p-6 rounded-t-3xl text-white">
                  <div className="flex items-center gap-2 text-xs font-bold opacity-90 mb-2">
                    <ShieldCheck size={14} /> نیاز به همراهی متخصص؟
                  </div>
                  <h3 className="text-xl font-black mb-3 leading-tight">
                    آموزش حضوری و نظارت پرستار
                  </h3>
                  <p className="text-sm opacity-90 mb-4 leading-relaxed">
                    برای اطمینان از انجام صحیح کار، پرستار متخصص در منزل شما آموزش دهد.
                  </p>
                </div>
                <ul className="space-y-2.5 mb-5">
                  {[
                    'آموزش حضوری مراحل کار توسط پرستار',
                    'نظارت بر اولین بار انجام کار',
                    'ارائه چک‌لیست قابل چاپ',
                    'دسترسی تلفنی برای سؤالات بعدی',
                  ].map((t, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <CheckCircle2 size={18} className="text-amber-600 mt-0.5 shrink-0" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
                <div className="space-y-2.5">
                  <Link
                    href="/portal/home-care/request"
                    className="block w-full h-12 rounded-xl bg-gradient-to-l from-amber-500 to-orange-500 text-white font-bold text-center leading-[3rem] hover:shadow-lg hover:shadow-orange-500/20 transition"
                  >
                    درخواست آموزش حضوری
                  </Link>
                  <a
                    href="tel:09128718237"
                    className="block w-full h-12 rounded-xl bg-gray-50 text-gray-800 font-bold text-center leading-[3rem] border border-gray-200 hover:bg-gray-100 transition flex items-center justify-center gap-2"
                  >
                    <Phone size={16} /> ۰۹۱۲۸۷۱۸۲۳۷
                  </a>
                </div>
              </div>

              {relatedServices.length > 0 && (
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                  <h4 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> خدمات مرتبط
                  </h4>
                  <div className="space-y-3">
                    {relatedServices.map(srv => (
                      <Link
                        key={srv.id}
                        href={`/services/${srv.slug}`}
                        className="flex items-center justify-between p-3 rounded-2xl hover:bg-amber-50 border border-gray-100 transition group"
                      >
                        <div>
                          <div className="font-bold text-sm text-gray-900 group-hover:text-amber-700 transition">
                            {srv.serviceDefinition?.title}
                          </div>
                          {srv.priceRangeText && (
                            <div className="text-xs text-gray-500 mt-0.5">{srv.priceRangeText}</div>
                          )}
                        </div>
                        <ChevronLeft size={18} className="text-gray-400 group-hover:-translate-x-1 group-hover:text-amber-600 transition" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {relatedArticles.length > 0 && (
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                  <h4 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-500" /> مقالات مرتبط
                  </h4>
                  <div className="space-y-3.5">
                    {relatedArticles.map(art => (
                      <Link
                        key={art.id}
                        href={`/articles/${art.slug}`}
                        className="flex gap-3 p-2 rounded-2xl hover:bg-teal-50 transition group"
                      >
                        {art.featuredImageUrl && (
                          <img
                            src={art.featuredImageUrl}
                            alt={art.title}
                            className="w-20 h-16 rounded-xl object-cover shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-sm text-gray-900 group-hover:text-teal-700 transition line-clamp-2 leading-snug">
                            {art.title}
                          </h5>
                          <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
                            <Clock size={12} />
                            <span>{art.estimatedReadingTimeMinutes || 5} دقیقه</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
