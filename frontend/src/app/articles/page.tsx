import { Metadata } from 'next';
import Link from 'next/link';
import { Search, Filter, Clock, Eye, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Breadcrumb from '@/components/seo/Breadcrumb';
import {
  listArticles,
  listCategories,
  listTags,
} from '@/lib/content-api';
import type { Article, ContentCategory, ContentTag } from '@/lib/types/content';

export const metadata: Metadata = {
  title: 'مجله سلامت سالمندیار | مقالات تخصصی پرستاری و مراقبت در منزل',
  description: 'آخرین مقالات تخصصی سلامت، مراقبت از بیمار در منزل، پرستاری سالمند، بیماری‌های شایع، راهنمای عملی مراقبتی با تأیید تیم پزشکی سالمندیار',
  keywords: ['مقالات سلامت', 'پرستاری در منزل', 'مراقبت از بیمار', 'مجله سلامت', 'آموزش مراقبت'],
  alternates: {
    canonical: '/articles',
  },
  openGraph: {
    title: 'مجله سلامت سالمندیار',
    description: 'مقالات تخصصی پرستاری و مراقبت در منزل با تأیید پزشکی',
    type: 'website',
    url: '/articles',
  },
};

function formatDate(dateStr?: string | Date) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }).format(d);
  } catch { return ''; }
}

export default async function ArticlesListPage() {
  const [articlesResult, categoriesResult, tagsResult] = await Promise.all([
    listArticles({ pageSize: 9 }),
    listCategories(),
    listTags(),
  ]);

  const published: Article[] = (articlesResult?.items || []).filter(
    (a: any) => !a.status || a.status === 'Published'
  );

  const allCategories: ContentCategory[] = categoriesResult || [];
  const categoriesWithCount = allCategories
    .filter((c: any) => !c.parentId)
    .map((c: any) => ({
      ...c,
      count: published.filter((a: any) => a.categoryId === c.id).length,
    }));

  const popularTags: ContentTag[] = (tagsResult || []).slice(0, 10);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ name: 'مجله سلامت', href: '/articles' }]} />

          {/* Header */}
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 text-teal-700 text-xs font-bold mb-4 border border-teal-100">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              {published.length} مقاله تخصصی
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 leading-tight">
              مجله سلامت <span className="text-teal-600">سالمندیار</span>
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
              مقالات علمی و تخصصی پرستاری و مراقبت در منزل، تأیید شده توسط تیم پزشکی سالمندیار
            </p>
          </div>

          {/* Search & Filters Bar */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 mb-8 border border-gray-100 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-7 relative">
                <Search className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="جستجو در مقالات..."
                  className="w-full h-12 pr-12 pl-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10 transition"
                />
              </div>
              <div className="md:col-span-3">
                <div className="relative">
                  <Filter className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400" size={18} />
                  <select className="w-full h-12 pr-12 pl-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-teal-500 outline-none appearance-none">
                    <option>همه دسته‌بندی‌ها</option>
                    {categoriesWithCount.map(c => (
                      <option key={c.id} value={c.slug}>{c.name} ({c.count})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="md:col-span-2">
                <button className="w-full h-12 rounded-xl bg-gradient-to-l from-teal-500 to-teal-600 text-white font-bold hover:shadow-lg hover:shadow-teal-500/20 transition">
                  جستجو
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Articles Grid */}
            <div className="lg:col-span-8 space-y-5">
              {published.map(article => (
                <Link
                  key={article.id}
                  href={`/articles/${article.slug}`}
                  className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-teal-200 hover:shadow-xl hover:shadow-gray-100 transition-all duration-300"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-5">
                    <div className="sm:col-span-2 relative overflow-hidden aspect-[4/3] sm:aspect-auto min-h-[200px] bg-gradient-to-br from-gray-50 to-gray-100">
                      {article.featuredImageUrl && (
                        <img
                          src={article.featuredImageUrl}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      )}
                      <div className="absolute top-3 right-3 flex flex-wrap gap-2">
                        {article.isFeatured && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white text-[10px] font-bold shadow">ویژه</span>
                        )}
                        {article.isMedicalContent && (
                          <span className="px-2.5 py-1 rounded-full bg-teal-500 text-white text-[10px] font-bold shadow flex items-center gap-1">
                            <ShieldCheck size={12} />
                            پزشکی
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="sm:col-span-3 p-5 sm:p-6 flex flex-col">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                      {article.category && (
                        <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2.5 py-0.5 rounded-full">
                          {article.category.name}
                        </span>
                      )}
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={12} />
                        {article.estimatedReadingTimeMinutes || 5} دقیقه مطالعه
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Eye size={12} />
                        {(article.viewCount || 0).toLocaleString('fa-IR')}
                      </span>
                    </div>
                      <h2 className="font-black text-lg sm:text-xl text-gray-900 group-hover:text-teal-700 transition leading-snug mb-2 line-clamp-2">
                      {article.title}
                    </h2>
                    {article.shortAnswer && (
                      <div className="mb-3 p-3 rounded-xl bg-gradient-to-br from-teal-50 to-white border border-teal-100/50">
                        <p className="text-xs font-bold text-teal-700 mb-1">پاسخ کوتاه</p>
                        <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">{article.shortAnswer}</p>
                      </div>
                    )}
                    {article.excerpt && (
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-auto">{article.excerpt}</p>
                    )}
                    <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                      {article.author && (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100">
                            {article.author.profileImageUrl ? (
                              <img src={article.author.profileImageUrl} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-teal-600">{article.author.firstName[0]}</div>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-800">{article.author.fullName}</p>
                            <p className="text-[10px] text-gray-400">{formatDate(article.publishedAt)}</p>
                          </div>
                        </div>
                      )}
                      <span className="text-sm font-bold text-teal-600 group-hover:text-teal-700">مطالعه مقاله →</span>
                    </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4 space-y-6">
              {/* Categories Widget */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-teal-500" />
                  دسته‌بندی مقالات
                </h3>
                <ul className="space-y-1">
                  <li>
                    <Link href="/articles" className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-teal-600 transition">
                      <span>همه مقالات</span>
                      <span className="text-xs text-gray-400">{published.length}</span>
                    </Link>
                  </li>
                  {categoriesWithCount.map(c => (
                    <li key={c.id}>
                      <Link href={`/articles/category/${c.slug}`} className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-teal-600 transition">
                        <span>{c.name}</span>
                        <span className="text-xs text-gray-400">{c.count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tags Widget */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-orange-500" />
                  برچسب‌های محبوب
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map(tag => (
                    <Link key={tag.id} href={`/articles/tag/${tag.slug}`} className="px-3 py-1.5 rounded-full text-xs font-bold bg-gray-50 text-gray-600 hover:bg-teal-50 hover:text-teal-600 border border-gray-100 hover:border-teal-200 transition">
                      #{tag.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-teal-600 to-teal-700 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 0%, transparent 40%)' }} />
                <div className="relative">
                  <p className="font-black text-xl mb-2">نیاز به مشاوره رایگان دارید؟</p>
                  <p className="text-sm text-teal-100 mb-4 leading-relaxed">
                    کارشناسان پرستاری سالمندیار ۲۴ ساعته پاسخگوی سوالات شما هستند.
                  </p>
                  <a href="tel:02112345678" className="block text-center py-3 rounded-xl bg-white text-teal-700 font-black hover:shadow-xl transition">
                    ۰۲۱-۱۲۳۴۵۶۷۸
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
