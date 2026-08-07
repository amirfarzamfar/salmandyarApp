import { Metadata } from 'next';
import Link from 'next/link';
import { Search, BookOpen, Clock, Eye, ShieldCheck, ChevronLeft, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Breadcrumb from '@/components/seo/Breadcrumb';
import { listGuides, listCategories, listArticles, listAuthors } from '@/lib/content-api';

export const metadata: Metadata = {
  title: 'راهنماهای پرستاری | آموزش‌های کاربردی گام به گام | سالمندیار',
  description: 'راهنماهای تصویری و گام به گام پرستاری در منزل: پانسمان زخم، مراقبت بعد از عمل، تغذیه سالمند، پیشگیری از سقوط و آموزش‌های کاربردی دیگر.',
  keywords: ['راهنمای پرستاری', 'آموزش پرستاری در منزل', 'راهنمای مراقبت', 'آموزش گام به گام', 'مراقبت از بیمار'],
  alternates: { canonical: '/guides' },
  openGraph: {
    title: 'راهنماهای پرستاری سالمندیار',
    description: 'آموزش‌های گام به گام پرستاری و مراقبت در منزل',
    type: 'website',
    url: '/guides',
  },
};

export default async function GuidesListPage() {
  const [guidesResult, categoriesResult, articlesResult, authorsResult] = await Promise.all([
    listGuides({ pageSize: 50 }),
    listCategories(),
    listArticles({ pageSize: 20 }),
    listAuthors(),
  ]);
  const guides = guidesResult?.items || [];
  const categories = categoriesResult || [];
  const latestArticles = articlesResult?.items || [];
  const authors = authorsResult || [];
  const sorted = [...guides].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));

  function formatDate(dateStr?: string) {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }).format(d);
    } catch { return ''; }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ name: 'راهنماهای پرستاری', href: '/guides' }]} />

          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold mb-4 border border-amber-100">
              <BookOpen size={14} />
              {sorted.length}+ راهنمای کاربردی گام به گام
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 leading-tight">
              راهنماهای تصویری و <span className="text-teal-600">گام به گام</span>
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
              یادگیری عملی و تصویری مراحل پرستاری و مراقبت در منزل با راهنماهای تخصصی تأیید شده پزشکی
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 mb-10 border border-gray-100 shadow-sm max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-8 relative">
                <Search className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="جستجو در راهنماها..."
                  className="w-full h-12 pr-12 pl-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10 transition"
                />
              </div>
              <div className="md:col-span-4">
                <button className="w-full h-12 rounded-xl bg-gradient-to-l from-teal-500 to-teal-600 text-white font-bold hover:shadow-lg hover:shadow-teal-500/20 transition">
                  جستجو در راهنماها
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {sorted.map(guide => (
              <Link
                key={guide.id}
                href={`/guides/${guide.slug}`}
                className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-teal-200 hover:shadow-xl hover:shadow-gray-100 transition-all duration-300 flex flex-col"
              >
                <div className="relative aspect-[16/10] bg-gradient-to-br from-amber-400 to-orange-500 overflow-hidden">
                  {guide.coverImageUrl && (
                    <img
                      src={guide.coverImageUrl}
                      alt={guide.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute top-3 right-3 flex gap-2">
                    {guide.isFeatured && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white text-[10px] font-bold shadow">پیشنهادی</span>
                    )}
                    {guide.isMedicalContent && (
                      <span className="px-2.5 py-1 rounded-full bg-teal-500 text-white text-[10px] font-bold shadow flex items-center gap-1">
                        <ShieldCheck size={12} /> پزشکی
                      </span>
                    )}
                    {guide.steps && guide.steps.length > 0 && (
                      <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur text-gray-800 text-[10px] font-bold shadow">
                        {guide.steps.length} مرحله
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-5 sm:p-6 flex flex-col flex-1">
                  {guide.category && (
                    <span className="text-[11px] font-bold text-teal-600 bg-teal-50 self-start px-2.5 py-0.5 rounded-full mb-3">
                      {guide.category.name}
                    </span>
                  )}
                  <h2 className="font-black text-lg sm:text-xl text-gray-900 group-hover:text-teal-700 transition leading-snug mb-3 line-clamp-2">
                    {guide.title}
                  </h2>
                  {guide.shortDescription && (
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-4 flex-1">
                      {guide.shortDescription}
                    </p>
                  )}
                      {guide.steps && guide.steps.length > 0 && (
                    <div className="mb-4 space-y-1.5">
                      {guide.steps.slice(0, 3).map((step: { order: number; title: string }) => (
                        <div key={step.order} className="flex items-center gap-2 text-xs text-gray-600">
                          <span className="w-5 h-5 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center font-black shrink-0">
                            {step.order}
                          </span>
                          <span className="truncate">{step.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-gray-500">
                      {guide.estimatedReadingTimeMinutes && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {guide.estimatedReadingTimeMinutes} دقیقه
                        </span>
                      )}
                      {guide.viewCount !== undefined && (
                        <span className="flex items-center gap-1">
                          <Eye size={12} />
                          {guide.viewCount.toLocaleString('fa-IR')}
                        </span>
                      )}
                    </div>
                    <span className="flex items-center gap-1 font-bold text-teal-600 group-hover:-translate-x-1 transition-transform">
                      مطالعه <ChevronLeft size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="bg-gradient-to-br from-amber-50 via-white to-teal-50 rounded-3xl p-8 sm:p-12 border border-amber-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4 leading-tight">
                  یادگیری تئوری کافی نیست، با ما <span className="text-teal-600">عمل کنید</span>
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  اگر به جای مطالعه تئوری، به آموزش عملی و همیاری نیاز دارید، پرستاران مجرب سالمندیار آماده هستند.
                </p>
                <ul className="space-y-2.5 mb-6">
                  {[
                    'آموزش حضوری و عملی مراقبت توسط پرستار متخصص',
                    'ارائه چک‌لیست کاغذی و دیجیتال برای خانواده',
                    'دسترسی تلفنی پرستار برای سؤالات احتمالی',
                    'گزارش تصویری و ویدیویی از آموزش‌ها',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-gray-700 font-medium">
                      <CheckCircle2 size={18} className="text-teal-600 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/portal/home-care/request"
                  className="inline-flex items-center gap-2 h-12 px-7 rounded-xl bg-gradient-to-l from-teal-500 to-teal-600 text-white font-bold hover:shadow-lg hover:shadow-teal-500/20 transition"
                >
                  درخواست آموزش حضوری
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-3xl bg-white border border-amber-100 shadow-sm text-center">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                    <BookOpen size={28} />
                  </div>
                  <div className="text-3xl font-black text-gray-900 mb-1">{sorted.length}+</div>
                  <div className="text-sm font-bold text-gray-600">راهنمای کاربردی</div>
                </div>
                <div className="p-5 rounded-3xl bg-white border border-teal-100 shadow-sm text-center">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mb-3">
                    <CheckCircle2 size={28} />
                  </div>
                  <div className="text-3xl font-black text-gray-900 mb-1">100%</div>
                  <div className="text-sm font-bold text-gray-600">تأیید پزشکی</div>
                </div>
                <div className="p-5 rounded-3xl bg-white border border-blue-100 shadow-sm text-center col-span-2">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                    <Eye size={28} />
                  </div>
                  <div className="text-3xl font-black text-gray-900 mb-1">
                    {sorted.reduce((sum, g) => sum + (g.viewCount || 0), 0).toLocaleString('fa-IR')}+
                  </div>
                  <div className="text-sm font-bold text-gray-600">کل بازدید از راهنماها</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
