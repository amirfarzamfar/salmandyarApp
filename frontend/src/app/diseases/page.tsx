import { Metadata } from 'next';
import Link from 'next/link';
import { Search, AlertTriangle, ShieldCheck, ChevronLeft } from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Breadcrumb from '@/components/seo/Breadcrumb';
import { listDiseases, listArticles, listServicesWithSeo } from '@/lib/content-api';

export const metadata: Metadata = {
  title: 'راهنمای بیماری‌ها | علائم، درمان و مراقبت در منزل | سالمندیار',
  description: 'راهنمای جامع پزشکی بیماری‌های شایع در سالمندان و بزرگسالان: علائم، علل، روش‌های درمان، پیشگیری و مراقبت در منزل. تأیید شده توسط تیم پزشکی سالمندیار.',
  keywords: ['بیماری‌ها', 'علائم بیماری', 'درمان بیماری', 'مراقبت در منزل', 'آلزایمر', 'سکته مغزی', 'دیابت'],
  alternates: { canonical: '/diseases' },
  openGraph: {
    title: 'راهنمای بیماری‌ها | سالمندیار',
    description: 'راهنمای جامع بیماری‌های شایع با تأیید پزشکی',
    type: 'website',
    url: '/diseases',
  },
};

export default async function DiseasesListPage() {
  const [diseasesResult, articlesResult, servicesSeo] = await Promise.all([
    listDiseases({ pageSize: 50 }),
    listArticles({ pageSize: 200 }),
    listServicesWithSeo(),
  ]);

  const sorted = [...(diseasesResult?.items || [])].sort((a, b) => (b.severityLevel || 0) - (a.severityLevel || 0));

  function severityColor(level: number) {
    if (level >= 80) return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'شدید' };
    if (level >= 60) return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'متوسط به بالا' };
    if (level >= 40) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'متوسط' };
    return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'خفیف' };
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ name: 'راهنمای بیماری‌ها', href: '/diseases' }]} />

          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 text-red-700 text-xs font-bold mb-4 border border-red-100">
              <ShieldCheck size={14} />
              {sorted.length} بیماری با محتوای تأیید پزشکی
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 leading-tight">
              راهنمای جامع <span className="text-teal-600">بیماری‌ها</span>
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
              اطلاعات علمی و به‌روز درباره بیماری‌های شایع، علائم هشداردهنده، روش‌های درمان و مراقبت‌های خانگی
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 mb-8 border border-gray-100 shadow-sm max-w-3xl mx-auto">
            <div className="relative">
              <Search className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="جستجو در بیماری‌ها..."
                className="w-full h-12 pr-12 pl-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10 transition text-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {sorted.map(disease => {
              const sev = severityColor(disease.severityLevel || 0);
              const relatedArticles = (articlesResult?.items || []).filter((a: any) => a.diseaseId === disease.id).length || 0;
              const relatedServices = (servicesSeo || []).filter(s =>
                s.targetPatients?.some(tp => tp.relatedDiseaseId === disease.id)
              ).length;

              return (
                <Link
                  key={disease.id}
                  href={`/diseases/${disease.slug}`}
                  className="group bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 hover:border-teal-200 hover:shadow-xl hover:shadow-gray-100 transition-all duration-300 flex flex-col"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${sev.bg} ${sev.text}`}>
                      <AlertTriangle size={28} />
                    </div>
                    <div className={`flex flex-col items-end gap-1`}>
                      {disease.icd10Code && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-500 font-mono">
                          ICD-10: {disease.icd10Code}
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${sev.bg} ${sev.text} border ${sev.border}`}>
                        شدت: {sev.label}
                      </span>
                      {disease.requiresImmediateMedicalAttention && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500 text-white flex items-center gap-1 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-white" /> فوری
                        </span>
                      )}
                    </div>
                  </div>

                  <h2 className="font-black text-xl text-gray-900 group-hover:text-teal-700 transition mb-2">
                    {disease.name}
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">
                    {disease.shortDescription || disease.definition}
                  </p>

                  <div className="space-y-2 mb-5 text-xs">
                    {disease.symptoms && disease.symptoms.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-gray-500 font-bold">علائم:</span>
                        {disease.symptoms.slice(0, 3).map((s, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px]">
                            {s.split('،')[0]}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{relatedArticles} مقاله</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span>{relatedServices} خدمت مرتبط</span>
                    </div>
                    <span className="flex items-center gap-1 text-sm font-bold text-teal-600 group-hover:-translate-x-1 transition-transform">
                      مشاهده <ChevronLeft size={16} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="bg-gradient-to-br from-teal-500 to-blue-600 rounded-3xl p-8 sm:p-12 text-white shadow-2xl shadow-teal-500/20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-black mb-4">
                  مشکوک به بیماری هستید؟ با متخصص مشورت کنید
                </h2>
                <p className="opacity-90 leading-relaxed mb-6">
                  تیم پرستاری و پزشکی سالمندیار آماده ارائه مشاوره تلفنی رایگان و ارجاع به متخصص مربوطه است.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/portal/home-care/request"
                    className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-white text-teal-700 font-bold hover:bg-gray-50 transition shadow-lg"
                  >
                    درخواست مشاوره رایگان
                  </Link>
                  <a
                    href="tel:02112345678"
                    className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-white/15 backdrop-blur text-white font-bold hover:bg-white/25 transition border border-white/20"
                  >
                    تماس فوری: ۰۲۱-۱۲۳۴۵۶۷۸
                  </a>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/20">
                  <div className="text-4xl font-black mb-1">{sorted.length}+</div>
                  <div className="text-sm opacity-90">بیماری پوشش داده شده</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/20">
                  <div className="text-4xl font-black mb-1">24/7</div>
                  <div className="text-sm opacity-90">پشتیبانی پزشکی</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/20">
                  <div className="text-4xl font-black mb-1">{(articlesResult?.items || []).length}+</div>
                  <div className="text-sm opacity-90">مقاله تأیید شده</div>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/20">
                  <div className="text-4xl font-black mb-1">100%</div>
                  <div className="text-sm opacity-90">تأیید پزشکی</div>
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
