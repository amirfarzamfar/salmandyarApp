import Link from 'next/link';
import {
  Heart,
  Activity,
  Brain,
  UtensilsCrossed,
  Stethoscope,
  Users,
  Pill,
  ShieldCheck,
  BookOpen,
  Dumbbell,
  Clock,
  Droplets,
  ArrowRight,
  ArrowLeft,
  Eye,
  Shield,
  Phone,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Article, ContentCategory } from '@/lib/types/content';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Breadcrumb from '@/components/seo/Breadcrumb';
import CategoryFAQ from '@/components/content/CategoryFAQ';
import {
  getCategoryContent,
  type CategoryContentProfile,
  type CategoryTopic,
} from '@/lib/data/category-content';
import { listServicesWithSeo } from '@/lib/content-api';

const ICON_MAP: Record<CategoryTopic['iconName'], LucideIcon> = {
  Heart,
  Activity,
  Brain,
  UtensilsCrossed,
  Stethoscope,
  Users,
  Pill,
  ShieldCheck,
  BookOpen,
  Dumbbell,
  Clock,
  Droplets,
};

function formatDate(date?: string | Date) {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(d);
  } catch {
    return '';
  }
}

function encodePrompt(prompt: string): string {
  try {
    return encodeURIComponent(prompt);
  } catch {
    return '';
  }
}

interface CategoryLandingPageProps {
  category: ContentCategory;
  articles: Article[];
  allCategories: ContentCategory[];
}

export default async function CategoryLandingPage({
  category,
  articles,
  allCategories,
}: CategoryLandingPageProps) {
  const content: CategoryContentProfile | undefined = getCategoryContent(category.slug);

  if (!content) {
    return null;
  }

  const [services] = await Promise.all([listServicesWithSeo()]);

  const featured = articles.find(a => a.isFeatured) || articles[0];
  const restArticles = articles.filter(a => a.id !== featured?.id);

  const illustrationUrl = `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodePrompt(
    content.hero.illustrationPrompt
  )}&image_size=landscape_4_3`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white text-slate-900">
      <Navbar />

      <main className="pt-28 pb-16 sm:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <Breadcrumb
            items={[
              { name: 'مجله سلامت', href: '/articles' },
              { name: category.name, href: `/articles/category/${category.slug}` },
            ]}
          />

          {/* HERO */}
          <section className="relative mt-6 sm:mt-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-50 via-white to-white border border-teal-100/60 shadow-sm">
              <div className="absolute inset-0 opacity-60 pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 10% 20%, rgba(20, 184, 166, 0.12) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(59, 130, 246, 0.08) 0%, transparent 45%)',
                }}
                aria-hidden="true"
              />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 p-6 sm:p-10 lg:p-12 relative">
                <div className="lg:col-span-7 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-600/10 text-teal-700 text-xs sm:text-sm font-bold mb-4 border border-teal-600/15 w-fit">
                    <Sparkles size={14} className="text-teal-600" aria-hidden="true" />
                    <span>{content.hero.eyebrow}</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.4rem] font-black text-gray-900 mb-5 sm:mb-6 leading-[1.15] tracking-tight">
                    {content.hero.h1}
                  </h1>
                  <p className="text-base sm:text-lg text-gray-600 leading-8 sm:leading-9 mb-7 max-w-2xl">
                    {content.hero.subtitle}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 mb-7">
                    <Link
                      href={content.hero.ctaHref}
                      className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-2xl bg-gradient-to-l from-teal-600 to-teal-700 text-white font-bold hover:shadow-xl hover:shadow-teal-600/20 hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-teal-500/20"
                    >
                      {content.hero.ctaText}
                      <ArrowLeft size={18} className="mr-1" aria-hidden="true" />
                    </Link>
                    <Link
                      href="/articles"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-300 transition focus:outline-none focus:ring-4 focus:ring-gray-200"
                    >
                      <span>همه مقالات</span>
                    </Link>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BookOpen size={18} className="text-teal-600 flex-shrink-0" aria-hidden="true" />
                      <span>
                        <strong className="text-gray-900 ml-1">{articles.length}</strong>
                        مقاله تخصصی
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Shield size={18} className="text-emerald-600 flex-shrink-0" aria-hidden="true" />
                      <span>{content.hero.trustedBadgeText}</span>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-5 relative">
                  <div className="relative rounded-3xl overflow-hidden shadow-xl shadow-gray-200/60 ring-1 ring-white border border-gray-100 aspect-[4/3] lg:aspect-auto lg:h-full bg-gradient-to-br from-teal-100 to-blue-50">
                    <img
                      src={illustrationUrl}
                      alt={content.hero.h1}
                      className="w-full h-full object-cover"
                      loading="eager"
                      decoding="async"
                    />
                    <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur rounded-2xl px-4 py-3 shadow-lg border border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <ShieldCheck size={18} aria-hidden="true" />
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-gray-900">محتوای مسئولانه</p>
                          <p className="text-[11px] text-gray-500">بدون جایگزینی مشاوره پزشکی</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* INTRODUCTION + HIGHLIGHTS */}
          <section className="mt-14 sm:mt-18 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-3 mb-5">
                <span className="w-1.5 h-10 rounded-full bg-teal-500" aria-hidden="true" />
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
                  {content.introduction.heading}
                </h2>
              </div>
              <div className="space-y-4 sm:space-y-5 text-gray-700 leading-8 sm:leading-9 text-[15px] sm:text-base">
                {content.introduction.paragraphs.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-2 text-xs sm:text-sm text-gray-500 p-3 sm:p-4 rounded-2xl bg-amber-50 border border-amber-100/80">
                <Shield size={16} className="text-amber-600 flex-shrink-0" aria-hidden="true" />
                <p className="leading-7">
                  محتوای این بخش جنبه آموزشی دارد و جایگزین مشاوره مستقیم با پزشک یا پرستار مجرب نمی‌شود. در صورت بروز علائم نگران‌کننده، حتماً به مراکز درمانی معتبر مراجعه کنید.
                </p>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="grid sm:grid-cols-3 lg:grid-cols-1 gap-3 h-fit">
                {content.introduction.highlights.map((h, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-gradient-to-br from-white to-slate-50 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <p className="text-xs text-gray-500 font-bold mb-1">{h.label}</p>
                    <p className="text-2xl font-black text-teal-700 mb-1.5 leading-tight">{h.value}</p>
                    <p className="text-sm text-gray-600 leading-7">{h.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* TOPICS GRID */}
          <section className="mt-16 sm:mt-20">
            <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-10 rounded-full bg-sky-500" aria-hidden="true" />
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
                    {content.topicsSectionTitle}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    روی هر موضوع برای مطالعه بیشتر کلیک کنید
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {content.topics.map(topic => {
                const Icon = ICON_MAP[topic.iconName] || BookOpen;
                return (
                  <Link
                    key={topic.id}
                    href={topic.href}
                    className="group relative p-5 sm:p-6 rounded-2xl bg-white border border-gray-100 hover:border-teal-200 hover:shadow-xl hover:shadow-teal-50/30 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                  >
                    <div
                      className="absolute -left-8 -top-8 w-24 h-24 rounded-full bg-gradient-to-br from-teal-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-hidden="true"
                    />
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-teal-500/15">
                        <Icon size={22} aria-hidden="true" />
                      </div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h3 className="font-black text-gray-900 text-lg group-hover:text-teal-700 transition leading-snug">
                          {topic.title}
                        </h3>
                        {topic.count > 0 && (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-100 flex-shrink-0">
                            {topic.count} مقاله
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 leading-7 mb-4 line-clamp-3">
                        {topic.description}
                      </p>
                      <div className="flex items-center gap-1 text-sm font-bold text-teal-600 group-hover:text-teal-700">
                        <span>مطالعه بیشتر</span>
                        <ArrowLeft
                          size={16}
                          className="mr-1 group-hover:-translate-x-1 transition-transform"
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* ARTICLES SECTION */}
          <section className="mt-16 sm:mt-20">
            <div className="flex items-end justify-between gap-4 mb-8 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="w-1.5 h-10 rounded-full bg-fuchsia-500" aria-hidden="true" />
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
                    مقالات تخصصی «{category.name}»
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    انتخابی از بهترین و کاربردی‌ترین مقالات این بخش
                  </p>
                </div>
              </div>
              <Link
                href="/articles"
                className="inline-flex items-center gap-2 text-sm font-bold text-teal-600 hover:text-teal-700 px-3 py-1.5 rounded-xl hover:bg-teal-50 transition"
              >
                <span>مشاهده همه مقالات</span>
                <ArrowLeft size={16} aria-hidden="true" />
              </Link>
            </div>

            {articles.length === 0 ? (
              <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-br from-slate-50 to-white border border-dashed border-gray-200 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-4">
                  <BookOpen size={28} aria-hidden="true" />
                </div>
                <h3 className="font-black text-gray-800 text-lg mb-2">مقاله‌ای منتشر نشده است</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto leading-8">
                  به‌زودی مقالات تخصصی در این دسته‌بندی منتشر می‌شود. می‌توانید مقالات سایر بخش‌ها را مطالعه کنید.
                </p>
                <Link
                  href="/articles"
                  className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 transition"
                >
                  رفتن به صفحه همه مقالات
                  <ArrowLeft size={15} aria-hidden="true" />
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {featured && (
                  <Link
                    href={`/articles/${featured.slug}`}
                    className="group block rounded-3xl overflow-hidden bg-gradient-to-br from-gray-50 via-white to-white border border-gray-100 hover:border-teal-200 hover:shadow-2xl hover:shadow-teal-100/30 transition-all duration-300"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12">
                      <div className="lg:col-span-5 relative aspect-[16/10] lg:aspect-auto min-h-[240px] overflow-hidden bg-gray-100">
                        {featured.featuredImageUrl ? (
                          <img
                            src={featured.featuredImageUrl}
                            alt={featured.featuredImageAlt || featured.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            loading="lazy"
                            width={800}
                            height={600}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-teal-100 to-sky-100" />
                        )}
                        <div className="absolute top-3 right-3 flex flex-wrap gap-2">
                          <span className="px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold shadow-sm flex items-center gap-1">
                            <Sparkles size={12} aria-hidden="true" />
                            مقاله ویژه
                          </span>
                          {featured.isMedicalContent && (
                            <span className="px-3 py-1 rounded-full bg-teal-600 text-white text-xs font-bold shadow-sm flex items-center gap-1">
                              <ShieldCheck size={12} aria-hidden="true" />
                              پزشکی
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col">
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                          {featured.category && (
                            <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-100">
                              {featured.category.name}
                            </span>
                          )}
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock size={13} aria-hidden="true" />
                            {featured.estimatedReadingTimeMinutes || 5} دقیقه مطالعه
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Eye size={13} aria-hidden="true" />
                            {(featured.viewCount || 0).toLocaleString('fa-IR')} بازدید
                          </span>
                        </div>
                        <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 mb-3 group-hover:text-teal-700 transition leading-snug">
                          {featured.title}
                        </h3>
                        {featured.shortAnswer && (
                          <div className="mb-4 p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-teal-50 to-white border border-teal-100/50">
                            <p className="text-xs font-black text-teal-700 mb-1 flex items-center gap-1.5">
                              <ShieldCheck size={14} aria-hidden="true" />
                              پاسخ مستقیم
                            </p>
                            <p className="text-sm text-gray-700 leading-7">
                              {featured.shortAnswer}
                            </p>
                          </div>
                        )}
                        {featured.excerpt && (
                          <p className="text-gray-600 leading-8 mb-auto line-clamp-3">
                            {featured.excerpt}
                          </p>
                        )}
                        <div className="mt-5 pt-5 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
                          {featured.author && (
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                {featured.author.profileImageUrl ? (
                                  <img
                                    src={featured.author.profileImageUrl}
                                    alt={featured.author.fullName}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-sm font-black text-teal-600">
                                    {featured.author.firstName?.[0] || '?'}
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-gray-900 leading-tight">
                                  {featured.author.fullName}
                                </p>
                                <p className="text-[11px] text-gray-500 leading-tight">
                                  {formatDate(featured.publishedAt)}
                                </p>
                              </div>
                            </div>
                          )}
                          <span className="text-sm font-bold text-teal-600 group-hover:text-teal-700 flex items-center gap-1">
                            مطالعه مقاله
                            <ArrowLeft size={16} aria-hidden="true" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )}

                {restArticles.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                    {restArticles.map(article => (
                      <Link
                        key={article.id}
                        href={`/articles/${article.slug}`}
                        className="group flex flex-col rounded-3xl overflow-hidden bg-white border border-gray-100 hover:border-teal-200 hover:shadow-xl hover:shadow-gray-200/40 transition-all duration-300"
                      >
                        <div className="relative aspect-[16/10] overflow-hidden bg-gray-100 flex-shrink-0">
                          {article.featuredImageUrl ? (
                            <img
                              src={article.featuredImageUrl}
                              alt={article.featuredImageAlt || article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                              loading="lazy"
                              width={500}
                              height={320}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-50" />
                          )}
                          <div className="absolute top-3 right-3 flex flex-wrap gap-1.5">
                            {article.isFeatured && (
                              <span className="px-2 py-1 rounded-full bg-amber-500 text-white text-[10px] font-bold shadow-sm">
                                ویژه
                              </span>
                            )}
                            {article.isMedicalContent && (
                              <span className="px-2 py-1 rounded-full bg-teal-600 text-white text-[10px] font-bold shadow-sm flex items-center gap-1">
                                <ShieldCheck size={10} aria-hidden="true" />
                                پزشکی
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="p-5 sm:p-6 flex flex-col flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="text-[11px] font-bold text-teal-600 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-100">
                              {category.name}
                            </span>
                            <span className="text-[11px] text-gray-400 flex items-center gap-1">
                              <Clock size={11} aria-hidden="true" />
                              {article.estimatedReadingTimeMinutes || 5} دقیقه
                            </span>
                          </div>
                          <h3 className="font-black text-gray-900 text-base sm:text-lg group-hover:text-teal-700 transition leading-snug mb-2 line-clamp-2">
                            {article.title}
                          </h3>
                          {article.excerpt && (
                            <p className="text-sm text-gray-600 leading-7 mb-4 line-clamp-3 flex-1">
                              {article.excerpt}
                            </p>
                          )}
                          <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                            <span className="text-[11px] text-gray-500">
                              {formatDate(article.publishedAt)}
                            </span>
                            <span className="text-xs font-bold text-teal-600 group-hover:text-teal-700 flex items-center gap-1">
                              مطالعه
                              <ArrowLeft size={13} aria-hidden="true" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>

          <CategoryFAQ sectionTitle={content.faqSectionTitle} faqs={content.faqs} />

          {/* INTERNAL LINKING */}
          <section className="mt-16 sm:mt-20 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Related categories */}
            {content.relatedCategories.length > 0 && (
              <div className="lg:col-span-4">
                <div className="h-full p-6 rounded-3xl bg-white border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-5">
                    <span className="w-1 h-8 rounded-full bg-teal-500" aria-hidden="true" />
                    <h3 className="font-black text-gray-900">بخش‌های مرتبط</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {content.relatedCategories.map(rel => {
                      const cat = allCategories.find(c => c.slug === rel.slug);
                      return (
                        <li key={rel.slug}>
                          <Link
                            href={`/articles/category/${rel.slug}`}
                            className="block p-3.5 rounded-2xl bg-slate-50 hover:bg-teal-50 border border-transparent hover:border-teal-200 transition"
                          >
                            <p className="text-sm font-bold text-gray-900">{cat?.name || rel.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5 leading-6">{rel.anchorText}</p>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            )}

            {/* Related services */}
            {content.relatedServices.length > 0 && (
              <div className="lg:col-span-4">
                <div className="h-full p-6 rounded-3xl bg-gradient-to-br from-white to-teal-50/30 border border-teal-100/60 shadow-sm">
                  <div className="flex items-center gap-2 mb-5">
                    <span className="w-1 h-8 rounded-full bg-emerald-500" aria-hidden="true" />
                    <h3 className="font-black text-gray-900">خدمات مرتبط</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {content.relatedServices.map(rel => {
                      const svc = services.find(s => s.slug === rel.slug);
                      const href = svc ? `/services/${svc.slug}` : '/services';
                      return (
                        <li key={rel.slug}>
                          <Link
                            href={href}
                            className="block p-3.5 rounded-2xl bg-white hover:bg-teal-50 border border-gray-100 hover:border-teal-200 transition"
                          >
                            <p className="text-sm font-bold text-teal-700">{rel.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5 leading-6">{rel.description}</p>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            )}

            {/* Related diseases + tools */}
            {(content.relatedDiseases.length > 0 || content.relatedTools.length > 0) && (
              <div className="lg:col-span-4 space-y-6">
                {content.relatedDiseases.length > 0 && (
                  <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-5">
                      <span className="w-1 h-8 rounded-full bg-rose-500" aria-hidden="true" />
                      <h3 className="font-black text-gray-900">راهنمای بیماری‌ها</h3>
                    </div>
                    <ul className="space-y-2.5">
                      {content.relatedDiseases.map(d => (
                        <li key={d.slug}>
                          <Link
                            href={`/diseases/${d.slug}`}
                            className="block p-3.5 rounded-2xl bg-slate-50 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition"
                          >
                            <p className="text-sm font-bold text-gray-900">{d.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5 leading-6">{d.anchorText}</p>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {content.relatedTools.length > 0 && (
                  <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-5">
                      <span className="w-1 h-8 rounded-full bg-sky-500" aria-hidden="true" />
                      <h3 className="font-black text-gray-900">ابزارهای کاربردی</h3>
                    </div>
                    <ul className="space-y-2.5">
                      {content.relatedTools.map(t => (
                        <li key={t.slug}>
                          <Link
                            href={`/tools/${t.slug === 'calculators' ? '' : t.slug}`}
                            className="block p-3.5 rounded-2xl bg-slate-50 hover:bg-sky-50 border border-transparent hover:border-sky-200 transition"
                          >
                            <p className="text-sm font-bold text-gray-900">{t.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5 leading-6">{t.description}</p>
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Link
                          href="/tools"
                          className="block p-3.5 rounded-2xl text-center text-xs font-bold text-sky-700 hover:bg-sky-50 transition"
                        >
                          مشاهده همه ابزارها
                          <ArrowRight size={12} className="inline mr-1" aria-hidden="true" />
                        </Link>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* FINAL CTA */}
          <section className="mt-16 sm:mt-20">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-teal-700 via-teal-600 to-emerald-600 shadow-xl shadow-teal-600/20">
              <div
                className="absolute inset-0 opacity-20"
                aria-hidden="true"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 90% 10%, rgba(255,255,255,0.8) 0%, transparent 45%), radial-gradient(circle at 10% 90%, rgba(255,255,255,0.6) 0%, transparent 45%)',
                }}
              />
              <div className="relative p-8 sm:p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-3 leading-tight">
                    {content.finalCta.heading}
                  </h2>
                  <p className="text-teal-50/90 leading-8 sm:leading-9 text-base sm:text-lg max-w-3xl">
                    {content.finalCta.description}
                  </p>
                </div>
                <div className="lg:col-span-4 flex flex-wrap gap-3 lg:justify-end">
                  <Link
                    href={content.finalCta.primaryButton.href}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-teal-700 font-black hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-white/30"
                  >
                    {content.finalCta.primaryButton.text}
                    <ArrowLeft size={18} aria-hidden="true" />
                  </Link>
                  {content.finalCta.secondaryButton && (
                    <a
                      href={content.finalCta.secondaryButton.href}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/25 text-white font-black backdrop-blur-sm transition focus:outline-none focus:ring-4 focus:ring-white/20"
                    >
                      <Phone size={16} aria-hidden="true" />
                      {content.finalCta.secondaryButton.text}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
