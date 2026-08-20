import { Metadata } from 'next';
import Link from 'next/link';
import { Phone, CheckCircle2, Star, MapPin, Clock, ShieldCheck, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Breadcrumb from '@/components/seo/Breadcrumb';
import { listServicesWithSeo, listArticles, listCities } from '@/lib/content-api';
import type { ServiceSeoProfile, ServiceBenefit, ServiceCoverageArea, ServiceTestimonial } from '@/lib/types/content';

export const metadata: Metadata = {
  title: 'خدمات پرستاری در منزل سالمندیار | مشاهده و درخواست خدمات',
  description: 'لیست کامل خدمات پرستاری در منزل سالمندیار: پرستار سالمند، پانسمان، تزریقات، ICU در منزل، فیزیوتراپی و... با بهترین قیمت و پرستاران مجرب',
  keywords: ['خدمات پرستاری', 'پرستار در منزل', 'پانسمان در منزل', 'تزریقات در منزل', 'ICU در منزل'],
  alternates: { canonical: '/services' },
  openGraph: {
    title: 'خدمات پرستاری در منزل سالمندیار',
    description: 'ارائه جامع‌ترین خدمات پرستاری و مراقبت در منزل توسط پرستاران دارای مجوز',
    type: 'website',
    url: '/services',
  },
};

export default async function ServicesListPage() {
  const [servicesResult, articlesResult, citiesResult] = await Promise.all([
    listServicesWithSeo(),
    listArticles({ pageSize: 20 }),
    listCities(),
  ]);
  const servicesSeo = servicesResult || [];
  const latestArticles = articlesResult?.items || [];
  const cities = citiesResult || [];
  const serviceSeoProfiles = servicesSeo;
  const featured = serviceSeoProfiles.filter(s => s.isFeatured || s.showInHomePage);
  const others = serviceSeoProfiles.filter(s => !s.isFeatured && !s.showInHomePage);
  const all = [...featured, ...others];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <Navbar />
      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ name: 'خدمات پرستاری', href: '/services' }]} />

          {/* Header */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 text-teal-700 text-xs font-bold mb-4 border border-teal-100">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              خدمات با مجوز وزارت بهداشت
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 leading-tight">
              خدمات <span className="text-teal-600">پرستاری و مراقبت در منزل</span>
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
              انتخاب هدفمند خدماتی که متناسب با شرایط بیمار یا سالمند شماست؛ با قیمت شفاف، تعهد به کیفیت و پشتیبانی ۲۴ ساعته
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {all.map(svc => (
              <ServiceCard key={svc.id} svc={svc} />
            ))}
          </div>

          {/* Trust Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 sm:p-8 rounded-3xl bg-white border border-gray-100 shadow-sm mb-16">
            <TrustItem icon={<ShieldCheck size={22} className="text-teal-500" />} title="+۵۰۰ پرستار" desc="دارای مجوز معتبر" />
            <TrustItem icon={<CheckCircle2 size={22} className="text-green-500" />} title="+۱۰,۰۰۰ مراقبت" desc="موفقیت‌آمیز تاکنون" />
            <TrustItem icon={<Clock size={22} className="text-blue-500" />} title="پشتیبانی ۲۴ ساعته" desc="۷ روز هفته" />
            <TrustItem icon={<Star size={22} className="text-amber-500" />} title="۴.۹ از ۵" desc="رضایت مشتریان" />
          </div>

          {/* How to Order */}
          <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-teal-50 via-white to-blue-50 border border-teal-100 relative overflow-hidden">
            <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-teal-200/30 blur-3xl" />
            <div className="relative">
              <div className="text-center mb-10">
                <p className="text-xs font-black text-teal-600 uppercase tracking-wider mb-2">نحوه سفارش خدمات</p>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">در ۳ مرحله ساده، پرستار خود را در منزل داشته باشید</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { n: 1, title: 'انتخاب خدمت مورد نیاز', desc: 'خدماتی که نیاز دارید را از این صفحه انتخاب کنید یا با ما تماس بگیرید.' },
                  { n: 2, title: 'هماهنگی سریع با کارشناس', desc: 'کارشناسان ما در کمتر از ۱۵ دقیقه با شما تماس می‌گیرند و اطلاعات لازم را می‌گیرند.' },
                  { n: 3, title: 'ارسال پرستار در سریع‌ترین زمان', desc: 'پرستار حرفه‌ای در کوتاه‌ترین زمان ممکن به منزل شما اعزام می‌شود.' },
                ].map(item => (
                  <div key={item.n} className="relative p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg transition group">
                    <div className="absolute -top-4 right-6 w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-teal-500/30 group-hover:scale-110 transition">
                      {item.n}
                    </div>
                    <h3 className="font-black text-lg text-gray-900 mb-2 mt-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/guest-request" className="px-8 py-4 rounded-2xl bg-gradient-to-l from-teal-600 to-teal-700 text-white font-black shadow-xl shadow-teal-600/20 hover:shadow-2xl hover:scale-105 transition flex items-center gap-2">
                  درخواست خدمات فوری
                  <ArrowLeft size={18} />
                </Link>
                <a href="tel:09128718237" className="px-8 py-4 rounded-2xl bg-white border-2 border-teal-200 text-teal-700 font-black hover:border-teal-500 hover:bg-teal-50 transition flex items-center gap-2">
                  <Phone size={18} />
                  تماس تلفنی فوری
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ServiceCard({ svc }: { svc: ServiceSeoProfile }) {
  const topBenefits: ServiceBenefit[] = (svc.benefits || []).slice(0, 3) as ServiceBenefit[];
  const coverageCount = ((svc.coverageAreas || []) as ServiceCoverageArea[]).length;
  const avgRating = ((svc.testimonials || []) as ServiceTestimonial[]).reduce((acc: number, t: ServiceTestimonial) => acc + (t.rating || 0), 0) / Math.max(1, ((svc.testimonials || []) as ServiceTestimonial[]).length) || 4.8;

  return (
    <Link
      href={`/services/${svc.slug}`}
      className="group relative flex flex-col bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-teal-200 hover:shadow-2xl hover:shadow-teal-100/40 transition-all duration-500"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-teal-50 via-gray-50 to-blue-50">
        {svc.heroImageUrl && (
          <img src={svc.heroImageUrl} alt={svc.serviceDefinition?.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent" />

        <div className="absolute top-4 right-4 flex gap-2">
          {svc.isFeatured && (
            <span className="px-3 py-1 rounded-full bg-gradient-to-l from-amber-500 to-orange-500 text-white text-xs font-bold shadow-lg shadow-orange-500/30">
              ✨ محبوب
            </span>
          )}
          {((svc.coverageAreas || []) as ServiceCoverageArea[]).some((c: ServiceCoverageArea) => c.has24HourService) && (
            <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur text-green-700 text-xs font-bold shadow">
              ۲۴ ساعته
            </span>
          )}
        </div>

        <div className="absolute bottom-4 right-4 left-4 flex items-center gap-2">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur text-xs text-gray-700 font-bold">
            <Star size={12} className="text-amber-500 fill-amber-500" />
            {avgRating.toFixed(1)} از ۵
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur text-xs text-gray-700 font-bold">
            <MapPin size={12} className="text-teal-500" />
            {coverageCount} منطقه
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-black text-xl text-gray-900 mb-2 group-hover:text-teal-700 transition">
          {svc.serviceDefinition?.title}
        </h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
          {svc.longDescription || svc.serviceDefinition?.description}
        </p>

        {/* Benefits preview */}
        {topBenefits.length > 0 && (
          <ul className="space-y-1.5 mb-5">
            {topBenefits.map(b => (
              <li key={b.id} className="flex items-start gap-2 text-sm text-gray-700">
                <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-1">{b.title}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Price */}
        <div className="mt-auto pt-5 border-t border-gray-100 flex items-end justify-between">
          <div>
            {svc.startingPrice ? (
              <>
                <p className="text-[11px] text-gray-500 mb-0.5">شروع قیمت</p>
                <p className="font-black text-lg text-teal-600" dir="ltr">{svc.startingPrice.toLocaleString('fa-IR')} <span className="text-xs font-medium">تومان</span></p>
              </>
            ) : svc.priceRangeText ? (
              <>
                <p className="text-[11px] text-gray-500 mb-0.5">محدوده قیمت</p>
                <p className="font-black text-base text-teal-600">{svc.priceRangeText}</p>
              </>
            ) : (
              <p className="font-bold text-sm text-gray-500">با تماس رایگان مشاوره بگیرید</p>
            )}
          </div>
          <span className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-gray-50 group-hover:bg-teal-50 text-gray-700 group-hover:text-teal-700 text-sm font-bold border border-gray-100 group-hover:border-teal-200 transition">
            اطلاعات بیشتر
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function TrustItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-3 sm:gap-4 p-2">
      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center flex-shrink-0">{icon}</div>
      <div>
        <p className="font-black text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
    </div>
  );
}
