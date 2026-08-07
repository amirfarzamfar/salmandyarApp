import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Clock, Eye, ShieldCheck, CheckCircle2, BookOpen, Phone, MessageCircle, ArrowLeft, MessageSquare, BookMarked, Share2 } from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Breadcrumb from '@/components/seo/Breadcrumb';
import { ArticleSchema, FAQSchema } from '@/lib/seo/structured-data';
import { listArticles, getArticleBySlug, listServicesWithSeo } from '@/lib/content-api';
import type { Article } from '@/lib/types/content';

function formatDate(date?: string | Date) {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric', month: 'long', day: 'numeric'
    }).format(d);
  } catch { return ''; }
}

export async function generateStaticParams() {
  try {
    const result = await listArticles({ pageSize: 100 });
    return (result?.items || []).filter((a: any) => a.status === 'Published').map((a: any) => ({ slug: a.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};

  const images = article.featuredImageUrl || article.ogImageUrl ? [article.featuredImageUrl || article.ogImageUrl!] : [];
  return {
    title: article.metaTitle || article.title,
    description: article.metaDescription || article.excerpt || article.shortAnswer,
    keywords: [article.primaryKeyword || '', ...(article.secondaryKeywords || [])].filter(Boolean),
    alternates: { canonical: article.canonicalUrl || `/articles/${article.slug}` },
    openGraph: {
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.excerpt,
      type: 'article',
      url: `/articles/${article.slug}`,
      images,
      publishedTime: article.publishedAt,
      modifiedTime: article.lastUpdatedAt || article.publishedAt,
      authors: article.author ? [article.author.fullName] : undefined,
      tags: article.secondaryKeywords,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.excerpt,
      images: article.twitterImageUrl ? [article.twitterImageUrl] : images,
    },
  };
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug) as Article | undefined;
  if (!article || article.status !== 'Published') notFound();
  const art = article as Article;

  const [articlesResult, servicesSeoResult] = await Promise.all([
    art.categoryId ? listArticles({ categoryId: art.categoryId, pageSize: 4 }) : Promise.resolve(null),
    listServicesWithSeo(),
  ]);

  const approvedReview = art.medicalReviews?.find(r => r.isApproved || r.approved);
  const relatedArticles = (articlesResult?.items || []).filter((a: any) => a.id !== art.id && a.status === 'Published').slice(0, 3);
  const matchedServices = art.serviceDefinitionId ? (servicesSeoResult || []).filter(s => s.serviceDefinitionId === art.serviceDefinitionId) : [];
  const relatedServices = matchedServices.concat((servicesSeoResult || []).slice(0, Math.max(0, 3 - matchedServices.length))).slice(0, 3);
  const relatedDiseases: any[] = [];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <ArticleSchema article={art} />
      {art.faqs && art.faqs.length > 0 && <FAQSchema faqs={art.faqs} pageUrl={`/articles/${art.slug}`} />}
      <Navbar />
      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[
            { name: 'مجله سلامت', href: '/articles' },
            ...(art.category ? [{ name: art.category.name, href: `/articles/category/${art.category.slug}` }] : []),
            { name: art.title, href: `/articles/${art.slug}` },
          ]} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Article */}
            <article className="lg:col-span-8">
              {/* Article Header */}
              <header className="mb-8">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {art.category && (
                    <Link href={`/articles/category/${art.category?.slug}`} className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-100 hover:bg-teal-100 transition">
                      {art.category.name}
                    </Link>
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

                {/* Author & Meta */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 pb-6 sm:pb-8 border-b border-gray-100">
                  {art.author && (
                    <div className="flex items-center gap-3">
                      <Link href={`/authors/${art.author.slug}`} className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-teal-50 to-gray-100 flex-shrink-0 border border-gray-100 hover:border-teal-200 transition">
                        {art.author.profileImageUrl ? (
                          <img src={art.author.profileImageUrl} alt={art.author.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg font-black text-teal-600">{art.author.firstName[0]}</div>
                        )}
                      </Link>
                      <div>
                        <Link href={`/authors/${art.author.slug}`} className="font-bold text-gray-900 hover:text-teal-600 transition flex items-center gap-1">
                          {art.author.fullName}
                          {art.author.isMedicalReviewer && <ShieldCheck size={14} className="text-teal-500" />}
                        </Link>
                        <p className="text-xs text-gray-500">{art.author.title} • {art.author.specialization}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5"><Clock size={14} /> {art.estimatedReadingTimeMinutes || 5} دقیقه مطالعه</span>
                    <span className="flex items-center gap-1.5"><Eye size={14} /> {(art.viewCount || 0).toLocaleString('fa-IR')} بازدید</span>
                    <span>انتشار: {formatDate(art.publishedAt)}</span>
                    {art.lastUpdatedAt && (
                      <span className="text-teal-600 font-medium">آخرین بروزرسانی: {formatDate(art.lastUpdatedAt)}</span>
                    )}
                  </div>
                </div>
              </header>

              {/* Featured Image */}
              {art.featuredImageUrl && (
                <div className="mb-8 rounded-3xl overflow-hidden border border-gray-100 shadow-lg">
                  <img src={art.featuredImageUrl} alt={art.title} className="w-full aspect-[16/9] object-cover" />
                </div>
              )}

              {/* Short Answer - GEO/AEO */}
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

              {/* Excerpt */}
              {art.excerpt && (
                <div className="mb-8 pl-6 border-r-4 border-teal-500 pr-2">
                  <p className="text-lg text-gray-700 font-medium leading-loose italic">
                    {art.excerpt}
                  </p>
                </div>
              )}

              {/* Table of Contents (mock) */}
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

              {/* Article Content */}
              <div
                className="prose prose-lg max-w-none prose-headings:font-black prose-headings:text-gray-900 prose-h2:text-2xl prose-h3:mt-10 prose-h3:mb-4 prose-h3:text-xl prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline prose-p:text-gray-700 prose-p:leading-loose prose-ul:list-disc prose-ul:pr-5 prose-ol:pr-5 prose-li:text-gray-700 prose-li:leading-loose prose-blockquote:border-r-4 prose-blockquote:border-teal-500 prose-blockquote:not-italic"
                dangerouslySetInnerHTML={{ __html: art.content || '' }}
              />

              {/* Medical Review E-E-A-T */}
              {approvedReview && (approvedReview.medicalReviewer || approvedReview.reviewer) && (
                <div className="mt-10 p-6 rounded-3xl bg-gradient-to-br from-teal-50 via-white to-blue-50/50 border border-teal-200/40">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-teal-100 to-teal-50 flex-shrink-0 border-2 border-teal-200">
                      {(approvedReview.medicalReviewer || approvedReview.reviewer)?.profileImageUrl ? (
                        <img src={(approvedReview.medicalReviewer || approvedReview.reviewer)?.profileImageUrl || ''} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl font-black text-teal-600">{(approvedReview.medicalReviewer || approvedReview.reviewer)?.firstName?.[0] || 'م'}</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <ShieldCheck size={16} className="text-teal-600" />
                        <p className="font-black text-gray-900">محتوا تحت تأیید تیم پزشکی</p>
                      </div>
                      <p className="font-bold text-gray-800 mb-0.5">{(approvedReview.medicalReviewer || approvedReview.reviewer)?.fullName}</p>
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

              {/* Sources */}
              {art.sources && art.sources.length > 0 && (
                <div id="sources" className="mt-10 p-6 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="font-black text-gray-900 mb-4 flex items-center gap-2">
                    <BookMarked size={18} className="text-amber-500" />
                    منابع و سایتیشن‌ها
                  </p>
                  <ol className="space-y-2 pr-5 list-decimal">
                    {art.sources.map((src, idx) => (
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

              {/* FAQs */}
              {art.faqs && art.faqs.length > 0 && (
                <div id="faq" className="mt-10">
                  <p className="font-black text-2xl text-gray-900 mb-5 flex items-center gap-2">
                    <MessageSquare size={24} className="text-purple-500" />
                    سوالات متداول
                  </p>
                  <div className="space-y-3">
                    {art.faqs.map((faq, idx) => (
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

              {/* Tags */}
              {(art.tags && art.tags.length > 0) && (
                <div className="mt-10 pt-8 border-t border-gray-100">
                  <p className="text-sm font-bold text-gray-500 mb-3">برچسب‌ها:</p>
                  <div className="flex flex-wrap gap-2">
                    {art.tags.map(tag => (
                      <Link key={tag.id} href={`/articles/tag/${tag.slug}`} className="px-3 py-1.5 rounded-full text-xs font-bold bg-gray-50 text-gray-600 hover:bg-teal-50 hover:text-teal-700 border border-gray-100 transition">
                        #{tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Share */}
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

            {/* Sidebar */}
            <aside className="lg:col-span-4 space-y-6">
              {/* Sticky CTA */}
              <div className="sticky top-28 space-y-6">
                {/* Primary CTA Card */}
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
                    <a href="tel:02112345678" className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-teal-500/30 border border-teal-400/30 font-bold text-sm hover:bg-teal-500/50 transition">
                      <Phone size={16} />
                      ۰۲۱-۱۲۳۴۵۶۷۸
                    </a>
                  </div>
                </div>

                {/* Related Services */}
                {relatedServices.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-1 h-5 rounded-full bg-teal-500" />
                      خدمات مرتبط
                    </h3>
                    <div className="space-y-3">
                      {relatedServices.map(svc => (
                        <Link key={svc.id} href={`/services/${svc.slug}`} className="block p-3 rounded-xl bg-gray-50 hover:bg-teal-50 border border-transparent hover:border-teal-100 transition">
                          <p className="font-bold text-gray-900 mb-1 text-sm">{svc.serviceDefinition?.title}</p>
                          {svc.priceRangeText && <p className="text-xs text-teal-600 font-medium">{svc.priceRangeText}</p>}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Diseases */}
                {relatedDiseases.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-1 h-5 rounded-full bg-rose-500" />
                      بیماری‌های مرتبط
                    </h3>
                    <div className="space-y-3">
                      {relatedDiseases.map(d => (
                        <Link key={d.id} href={`/diseases/${d.slug}`} className="block p-3 rounded-xl bg-rose-50 hover:bg-rose-100/50 transition">
                          <p className="font-bold text-gray-900 mb-1 text-sm">{d.name}</p>
                          {d.icd10Code && <p className="text-xs text-gray-500">کد ICD-۱۰: {d.icd10Code}</p>}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Author Card */}
                {art.author && (
                  <div className="bg-white rounded-2xl p-6 border border-gray-100">
                    <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-1 h-5 rounded-full bg-amber-500" />
                      درباره نویسنده
                    </h3>
                    <div className="text-center">
                      <Link href={`/authors/${art.author.slug}`} className="inline-block mb-3">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto bg-gray-100 border-2 border-amber-100">
                          {art.author.profileImageUrl ? (
                            <img src={art.author.profileImageUrl} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl font-black text-teal-600">{art.author.firstName[0]}</div>
                          )}
                        </div>
                      </Link>
                      <Link href={`/authors/${art.author.slug}`} className="font-black text-gray-900 hover:text-teal-600 transition block">
                        {art.author.fullName}
                      </Link>
                      <p className="text-xs text-gray-500 mt-1 mb-2">{art.author.title}</p>
                      <p className="text-xs text-gray-600 mb-3">{art.author.specialization}</p>
                      {art.author.yearsOfExperience && (
                        <p className="text-xs font-bold text-teal-600 mb-4">+{art.author.yearsOfExperience} سال تجربه</p>
                      )}
                      <Link href={`/authors/${art.author.slug}`} className="inline-block w-full py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-bold transition">
                        مشاهده همه مقالات
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <section className="mt-20">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-3 border border-blue-100">
                    <ArrowLeft size={12} />
                    مطالعه بیشتر
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900">مقالات مرتبط</h2>
                </div>
                <Link href="/articles" className="text-sm font-bold text-teal-600 hover:text-teal-700">همه مقالات</Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {relatedArticles.map(artItem => (
                  <Link key={artItem.id} href={`/articles/${artItem.slug}`} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:border-teal-100 transition-all duration-300">
                    <div className="aspect-[16/10] overflow-hidden bg-gray-50">
                      {artItem.featuredImageUrl && (
                        <img src={artItem.featuredImageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        {artItem.category && <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">{artItem.category.name}</span>}
                        <span className="text-[10px] text-gray-400 flex items-center gap-0.5"><Clock size={10} /> {artItem.estimatedReadingTimeMinutes || 5} دقیقه</span>
                      </div>
                      <h4 className="font-black text-gray-900 group-hover:text-teal-700 transition leading-snug mb-2 line-clamp-2">
                        {artItem.title}
                      </h4>
                      <p className="text-xs text-gray-500 truncate">توسط {artItem.author?.fullName}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
