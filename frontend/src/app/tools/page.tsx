import { Metadata } from 'next';
import Link from 'next/link';
import { Calculator, CheckSquare, Brain, Sparkles, ShieldCheck, Users, ArrowLeft, FileText, Pill, Activity, Clock, Zap, Award, ChevronLeft, TrendingUp, HeartPulse } from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Breadcrumb from '@/components/seo/Breadcrumb';
import { HealthTool } from '@/lib/types/content';
import { listTools, getFeaturedTools, listArticles, listServicesWithSeo } from '@/lib/content-api';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'ابزارهای سلامت رایگان | سالمندیار',
  description: 'مجموعه‌ای از ابزارهای رایگان و کاربردی سلامت برای سالمندان، خانواده و پرستاران: محاسبه BMI، محاسبات دارویی، GCS، قطره سرم، ریسک زخم بستر برادن و چک لیست مراقبت روزانه.',
  keywords: [
    'ابزار سلامت',
    'ماشین حساب BMI',
    'محاسبه دوز دارو',
    'ماشین حساب دارویی',
    'محاسبه GCS',
    'قطره سرم',
    'برادن اسکیل',
    'چک لیست مراقبت',
    'محاسبه هپارین',
    'محاسبه دوپامین',
    'ابزار پرستاری',
    'ابزار سالمندی',
    'ماشین حساب قطره سرم',
    'محاسبات ICU',
  ],
  alternates: { canonical: '/tools' },
  openGraph: {
    title: 'ابزارهای سلامت رایگان سالمندیار | ۶+ ابزار پزشکی',
    description: 'ابزارهای رایگان پزشکی و پرستاری برای محاسبه سریع BMI، دوز دارو، GCS، قطره سرم و چک لیست مراقبت روزانه بیمار و سالمند.',
    type: 'website',
    url: '/tools',
  },
};

const styleByType: Record<HealthTool['toolType'], { from: string; to: string; icon: any; label: string; dot: string; ring: string; shadow: string; badge: string }> = {
  Calculator: {
    from: 'from-blue-500',
    to: 'to-cyan-600',
    icon: Calculator,
    label: 'ماشین حساب پزشکی',
    dot: 'bg-cyan-500',
    ring: 'ring-cyan-500/20',
    shadow: 'shadow-cyan-500/10',
    badge: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  },
  Checklist: {
    from: 'from-emerald-500',
    to: 'to-green-600',
    icon: CheckSquare,
    label: 'چک لیست عملی',
    dot: 'bg-emerald-500',
    ring: 'ring-emerald-500/20',
    shadow: 'shadow-emerald-500/10',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  Assessment: {
    from: 'from-fuchsia-500',
    to: 'to-purple-600',
    icon: Brain,
    label: 'ارزیابی بالینی',
    dot: 'bg-fuchsia-500',
    ring: 'ring-fuchsia-500/20',
    shadow: 'shadow-fuchsia-500/10',
    badge: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
  },
  Converter: {
    from: 'from-indigo-500',
    to: 'to-blue-600',
    icon: Calculator,
    label: 'مبدل واحد',
    dot: 'bg-indigo-500',
    ring: 'ring-indigo-500/20',
    shadow: 'shadow-indigo-500/10',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  Tracker: {
    from: 'from-rose-500',
    to: 'to-red-600',
    icon: Activity,
    label: 'ردیاب سلامت',
    dot: 'bg-rose-500',
    ring: 'ring-rose-500/20',
    shadow: 'shadow-rose-500/10',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
  },
};

const DEFAULT_STYLE = styleByType.Calculator;

// Icon override for specific slugs (better UX than default per type)
const iconBySlug: Record<string, any> = {
  'bmi-calculator': TrendingUp,
  'drug-dosage-calculator': Pill,
  'gcs-calculator': Brain,
  'drip-rate-calculator': Activity,
  'braden-scale-pressure-ulcer-risk': ShieldCheck,
  'daily-care-checklist': CheckSquare,
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
            <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
              <div>
                <h2 className="font-black text-2xl sm:text-3xl text-gray-900 mb-1.5 flex items-center gap-2.5">
                  <Award size={26} className="text-purple-600" />
                  همه ابزارهای سلامت
                </h2>
                <p className="text-sm text-gray-500 font-medium">{tools.length} ابزار فعال · همه رایگان و بدون ثبت نام</p>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-gray-500">
                <Clock size={14} /> میانگین زمان استفاده: کمتر از ۲ دقیقه
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {tools.map(tool => {
                const style = styleByType[tool.toolType] || DEFAULT_STYLE;
                const SpecificIcon = iconBySlug[tool.slug];
                const Icon = SpecificIcon || style.icon;
                const isFeatured = !!tool.isFeatured;
                const tags = tool.secondaryKeywords?.slice(0, 2) || [];

                return (
                  <Link
                    key={tool.id}
                    href={`/tools/${tool.slug}`}
                    className="group relative bg-white rounded-3xl p-6 sm:p-7 border-2 hover:border-transparent transition-all duration-500 overflow-hidden"
                    style={{ borderColor: isFeatured ? 'transparent' : undefined }}
                  >
                    {/* Featured Gradient Border Effect */}
                    {isFeatured && (
                      <div className="absolute inset-0 p-[2px] rounded-3xl pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity">
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500" />
                      </div>
                    )}

                    {/* Card Background Overlay */}
                    <div className={`absolute inset-x-0 top-0 h-44 bg-gradient-to-br ${style.from} ${style.to} opacity-[0.08] group-hover:opacity-[0.14] transition duration-500`} />

                    <div className="relative">
                      <div className="flex items-start justify-between gap-4 mb-5">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${style.from} ${style.to} text-white flex items-center justify-center shadow-xl ${style.shadow} group-hover:scale-110 group-hover:rotate-[-3deg] transition-all duration-500 ring-8 ${style.ring}`}>
                          <Icon size={30} strokeWidth={2.25} />
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          {isFeatured && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-l from-amber-500 to-orange-500 text-white text-[10px] font-black shadow-lg shadow-orange-500/20">
                              <Zap size={12} fill="currentColor" /> ویژه
                            </span>
                          )}
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${style.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                            {style.label}
                          </span>
                        </div>
                      </div>

                      <h3 className="font-black text-xl sm:text-2xl text-gray-900 mb-2.5 leading-tight group-hover:text-slate-900">
                        {tool.name}
                      </h3>

                      <p className="text-sm text-gray-600 leading-relaxed mb-4 min-h-[48px] line-clamp-2">
                        {tool.description || tool.shortDescription}
                      </p>

                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {tags.map((tag, i) => (
                            <span key={i} className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-gray-50 text-gray-600 border border-gray-100 hover:bg-gray-100 transition">
                              #{tag.replace(/\s+/g, '')}
                            </span>
                          ))}
                        </div>
                      )}

                      {tool.howToUse && (
                        <p className="text-xs text-gray-500 leading-relaxed mb-5 bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100 line-clamp-3">
                          <span className="font-bold text-gray-700 block mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                            <FileText size={12} /> راهنمای استفاده
                          </span>
                          {tool.howToUse}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 group-hover:border-gray-200 transition">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">رایگان</span>
                          <span className="w-1 h-1 rounded-full bg-gray-200" />
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">بدون ثبت نام</span>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 font-black text-sm bg-gradient-to-l ${style.from} ${style.to} bg-clip-text text-transparent group-hover:-translate-x-1.5 group-hover:gap-2 transition-all duration-300`}>
                          استفاده کنید
                          <ChevronLeft size={15} strokeWidth={2.5} />
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
                <h2 className="text-3xl sm:text-4xl font-black mb-4 leading-tight flex items-center gap-3">
                  <HeartPulse size={32} className="text-rose-400" />
                  تست‌های سلامت سالمند
                </h2>
                <p className="text-white/80 leading-relaxed text-base sm:text-lg">
                  کنار ابزارهای محاسباتی، می‌توانید از تست‌های تعاملی سلامت سالمندیار برای غربالگری
                  حافظه، خطر سقوط، تغذیه، ایمنی منزل و نیاز به مراقبت استفاده کنید.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Button
                    variant="primary"
                    size="lg"
                    asChild
                    className="bg-gradient-to-l from-rose-600 to-orange-500 hover:from-rose-700 hover:to-orange-600 border-0 rounded-full shadow-lg shadow-rose-500/20"
                  >
                    <Link href="/health-tests">
                      <Sparkles size={17} />
                      شروع تست‌های سلامت
                      <ChevronLeft size={16} strokeWidth={2.4} />
                    </Link>
                  </Button>
                  <span className="inline-flex items-center gap-1.5 text-sm text-white/70 px-3 py-1.5 rounded-full bg-white/10 border border-white/15">
                    رایگان · بدون ثبت نام · نتیجه فوری
                  </span>
                </div>
              </div>
              <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                {['تست حافظه سالمند', 'تست خطر سقوط', 'تست تغذیه', 'ایمنی منزل سالمند'].map(name => (
                  <div key={name} className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500/30 to-orange-500/30 border border-white/10 flex items-center justify-center">
                      <Activity size={16} className="text-rose-200" />
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
