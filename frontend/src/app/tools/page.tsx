import { Metadata } from 'next';
import Link from 'next/link';
import { Calculator, CheckSquare, Brain, Sparkles, ShieldCheck, Users, ArrowLeft, FileText } from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Breadcrumb from '@/components/seo/Breadcrumb';
import { HealthTool } from '@/lib/types/content';
import { listTools, getFeaturedTools, listArticles, listServicesWithSeo } from '@/lib/content-api';

export const metadata: Metadata = {
  title: 'ابزارهای سلامت رایگان | سالمندیار',
  description: 'مجموعه‌ای از ابزارهای رایگان و کاربردی سلامت برای سالمندان و خانواده‌ها: محاسبه BMI، GCS، قطره سرم، ریسک زخم بستر و چک لیست مراقبت.',
  keywords: ['ابزار سلامت', 'ماشین حساب BMI', 'محاسبه GCS', 'قطره سرم', 'برادن اسکیل', 'چک لیست مراقبت'],
  alternates: { canonical: '/tools' },
  openGraph: {
    title: 'ابزارهای سلامت رایگان سالمندیار',
    description: 'ابزارهای رایگان پزشکی برای محاسبه سریع و چک لیست مراقبت روزانه.',
    type: 'website',
    url: '/tools',
  },
};

const styleByType: Record<HealthTool['toolType'], { from: string; to: string; icon: any; label: string; dot: string }> = {
  Calculator: {
    from: 'from-blue-400',
    to: 'to-cyan-600',
    icon: Calculator,
    label: 'ماشین حساب پزشکی',
    dot: 'bg-cyan-500',
  },
  Checklist: {
    from: 'from-emerald-400',
    to: 'to-green-600',
    icon: CheckSquare,
    label: 'چک لیست عملی',
    dot: 'bg-emerald-500',
  },
  Assessment: {
    from: 'from-fuchsia-500',
    to: 'to-purple-600',
    icon: Brain,
    label: 'ارزیابی بالینی',
    dot: 'bg-fuchsia-500',
  },
  Converter: {
    from: 'from-indigo-400',
    to: 'to-blue-600',
    icon: Calculator,
    label: 'مبدل واحد',
    dot: 'bg-indigo-500',
  },
  Tracker: {
    from: 'from-rose-400',
    to: 'to-red-600',
    icon: Brain,
    label: 'ردیاب سلامت',
    dot: 'bg-rose-500',
  },
};

export default async function ToolsListPage() {
  const [toolsResult, featuredResult, articlesResult, servicesResult] = await Promise.all([
    listTools(),
    getFeaturedTools(4),
    listArticles({ pageSize: 20 }),
    listServicesWithSeo(),
  ]);
  const tools = toolsResult || [];
  const featuredTools = featuredResult || [];
  const latestArticles = articlesResult?.items || [];
  const servicesSeo = servicesResult || [];
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ name: 'ابزارهای سلامت', href: '/tools' }]} />

          <section className="mb-12 text-center relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 text-white p-10 sm:p-16 shadow-2xl shadow-purple-500/20">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white blur-3xl" />
              <div className="absolute bottom-10 right-10 w-52 h-52 rounded-full bg-cyan-300 blur-3xl" />
            </div>
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 backdrop-blur text-xs font-bold mb-5">
                <Sparkles size={14} />
                {tools.length}+ ابزار کاملاً رایگان
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-5 leading-tight">
                ابزارهای سلامت <span className="text-yellow-300">رایگان و تأیید شده پزشکی</span>
              </h1>
              <p className="text-white/85 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed mb-8">
                محاسبه سریع شاخص‌های مهم سلامت، ارزیابی ریسک بیماری‌ها و چک لیست‌های کاربردی پرستاری
                برای سالمندان و خانواده‌ها. بدون ثبت نام، بدون هزینه.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-bold">
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 backdrop-blur border border-white/20">
                  <ShieldCheck size={16} /> تأیید شده توسط تیم پزشکی
                </span>
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 backdrop-blur border border-white/20">
                  <Users size={16} /> ۱۰ هزار استفاده ماهانه
                </span>
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 backdrop-blur border border-white/20">
                  <FileText size={16} /> نتایج قابل استخراج
                </span>
              </div>
            </div>
          </section>

          <section className="mb-14">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {tools.map(tool => {
                const style = styleByType[tool.toolType];
                const Icon = style.icon;
                return (
                  <Link
                    key={tool.id}
                    href={`/tools/${tool.slug}`}
                    className="group relative bg-white rounded-3xl p-6 sm:p-7 border-2 border-gray-100 hover:border-transparent hover:shadow-2xl hover:shadow-gray-200/60 transition-all duration-500 overflow-hidden"
                  >
                    <div
                      className={`absolute inset-x-0 top-0 h-40 bg-gradient-to-br ${style.from} ${style.to} opacity-[0.08] group-hover:opacity-[0.12] transition`}
                    />
                    <div className="relative">
                      <div className="flex items-start justify-between gap-4 mb-5">
                        <div
                          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${style.from} ${style.to} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}
                        >
                          <Icon size={30} />
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 text-gray-700 text-[11px] font-bold border border-gray-100`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                          {style.label}
                        </span>
                      </div>
                      <h3 className="font-black text-xl sm:text-2xl text-gray-900 group-hover:text-gray-900 mb-2.5 leading-tight">
                        {tool.name}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">
                        {tool.description || tool.shortDescription}
                      </p>
                      {tool.howToUse && (
                        <p className="text-xs text-gray-500 leading-relaxed mb-5 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                          {tool.howToUse}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                        <span className="text-[11px] font-bold text-gray-500">بدون ثبت نام · رایگان</span>
                        <span className="inline-flex items-center gap-1 font-black text-sm text-slate-800 group-hover:-translate-x-1 transition-transform">
                          استفاده کنید <ArrowLeft size={15} />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="mb-14 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-8 sm:p-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-fuchsia-500/10 blur-3xl" />
            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7">
                <h2 className="text-3xl sm:text-4xl font-black mb-4 leading-tight">
                  ابزارهای جدید به‌زودی اضافه می‌شوند
                </h2>
                <p className="text-white/80 leading-relaxed text-base sm:text-lg">
                  تیم مهندسی و پزشکی سالمندیار در حال توسعه ابزارهای بیشتری برای کمک به شماست.
                  اگر ابزار خاصی مد نظر دارید به ما اطلاع دهید.
                </p>
              </div>
              <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                {['محاسبه غلظت دارو', 'چک لیست پانسمان', 'سنجش فشار خون', 'تنظیم دارو روزانه'].map(name => (
                  <div key={name} className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                      <Sparkles size={16} className="text-yellow-300" />
                    </div>
                    <span className="text-sm font-bold text-white/90">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-white rounded-3xl p-7 sm:p-10 border border-gray-100 shadow-sm">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
              بیشتر بیاموزید با مقالات آموزشی سالمندیار
            </h2>
            <p className="text-gray-600 mb-7">
              در کنار استفاده از ابزارها، مقالات جامع و تأیید شده ما را بخوانید.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {latestArticles.slice(0, 3).map(article => (
                <Link
                  key={article.id}
                  href={`/articles/${article.slug}`}
                  className="rounded-3xl overflow-hidden border border-gray-100 hover:border-teal-200 hover:shadow-lg transition-all group bg-white"
                >
                  <div className="aspect-[16/9] bg-gradient-to-br from-teal-100 via-sky-100 to-blue-100 relative overflow-hidden">
                    {article.featuredImageUrl && (
                      <img
                        src={article.featuredImageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    )}
                  </div>
                  <div className="p-5">
                    <h4 className="font-black text-lg text-gray-900 group-hover:text-teal-700 transition line-clamp-2 mb-2 leading-tight">
                      {article.title}
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                      {article.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
