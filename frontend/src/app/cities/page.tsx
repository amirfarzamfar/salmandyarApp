import { Metadata } from 'next';
import Link from 'next/link';
import { Search, MapPin, Phone, ShieldCheck, ChevronLeft, Building2 } from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Breadcrumb from '@/components/seo/Breadcrumb';
import { listCities, listServicesWithSeo } from '@/lib/content-api';

export const metadata: Metadata = {
  title: 'شهرهای تحت پوشش | پرستار در منزل سراسر کشور | سالمندیار',
  description: 'خدمات پرستاری و سالمندیار در منزل تهران، کرج، اصفهان و شهرهای بزرگ کشور. پرستار مجرب، دارای مجوز وزارت بهداشت با پشتیبانی ۲۴ ساعته.',
  keywords: ['پرستار در منزل', 'سالمندیار تهران', 'پرستار کرج', 'خدمات پرستاری سراسر کشور', 'شهرهای تحت پوشش'],
  alternates: { canonical: '/cities' },
  openGraph: {
    title: 'شهرهای تحت پوشش سالمندیار',
    description: 'خدمات پرستاری و مراقبت در منزل در شهرهای بزرگ ایران',
    type: 'website',
    url: '/cities',
  },
};

export default async function CitiesListPage() {
  const [citiesResult, servicesResult] = await Promise.all([listCities(), listServicesWithSeo()]);
  const cities = citiesResult || [];
  const serviceSeoProfiles = servicesResult || [];
  const sorted = [...cities].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ name: 'شهرهای تحت پوشش', href: '/cities' }]} />

          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-4 border border-blue-100">
              <MapPin size={14} />
              {sorted.length} شهر تحت پوشش فعال
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 leading-tight">
              پرستار و سالمندیار <span className="text-teal-600">در شهرهای ایران</span>
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
              انتخاب شهر خودتان را کنید و در کمتر از ۲ ساعت پرستار مجرب در منزل خودتان داشته باشید
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 mb-10 border border-gray-100 shadow-sm max-w-3xl mx-auto">
            <div className="relative">
              <Search className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="جستجو در شهرها..."
                className="w-full h-12 pr-12 pl-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10 transition text-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {sorted.map(city => {
              const areasCount = (city.coveredAreas || []).length;
              const relatedServices = serviceSeoProfiles.filter(s =>
                (s.coverageAreas || []).some(ca => ca.areaName.includes(city.name))
              ).length;

              return (
                <div
                  key={city.id}
                  className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-teal-200 hover:shadow-xl hover:shadow-gray-100 transition-all duration-300"
                >
                  <Link
                    href={`/cities/${city.slug}`}
                    className="block"
                  >
                    <div className="relative h-44 sm:h-48 bg-gradient-to-br from-teal-500 via-blue-500 to-indigo-600 overflow-hidden cursor-pointer">
                      {city.coverImageUrl && (
                        <img
                          src={city.coverImageUrl}
                          alt={city.name}
                          className="w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                      <div className="absolute inset-0 p-6 flex flex-col justify-end">
                        <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center mb-3">
                          <Building2 size={28} className="text-white" />
                        </div>
                        <h2 className="text-3xl font-black text-white mb-0.5 group-hover:translate-y-[-2px] transition-transform">
                          {city.name}
                        </h2>
                        {city.province && (
                          <p className="text-sm text-white/80">استان {city.province}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                  <div className="p-6">
                    <Link href={`/cities/${city.slug}`} className="block">
                      <p className="text-sm text-gray-600 leading-relaxed mb-5 line-clamp-2 min-h-[48px]">
                        {city.shortDescription || city.aboutRegion}
                      </p>
                      <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
                        <div className="flex items-center gap-2 text-gray-600 p-3 rounded-xl bg-gray-50">
                          <MapPin size={16} className="text-teal-600 shrink-0" />
                          <span className="font-bold">{areasCount || 0}+</span>
                          <span className="text-xs text-gray-500">منطقه</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 p-3 rounded-xl bg-gray-50">
                          <ShieldCheck size={16} className="text-teal-600 shrink-0" />
                          <span className="font-bold">{relatedServices || serviceSeoProfiles.length}+</span>
                          <span className="text-xs text-gray-500">خدمت</span>
                        </div>
                      </div>
                    </Link>
                    {city.phoneNumber && (
                      <a
                        href={`tel:${city.phoneNumber.replace(/\D/g, '')}`}
                        className="flex items-center justify-center gap-2 h-11 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-bold text-sm mb-3 hover:bg-teal-50 hover:border-teal-200 hover:text-teal-700 transition"
                      >
                        <Phone size={16} />
                        {city.phoneNumber}
                      </a>
                    )}
                    <Link href={`/cities/${city.slug}`} className="block">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500">مراجعه سریع</span>
                        <span className="flex items-center gap-1 text-sm font-bold text-teal-600 group-hover:-translate-x-1 transition-transform">
                          مشاهده خدمات <ChevronLeft size={16} />
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold mb-4 border border-amber-100">
                  <ShieldCheck size={14} /> شهر شما در لیست نیست؟
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-4 leading-tight">
                  خدمات پرستاری را در شهر خودتان درخواست دهید
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  حتی اگر شهر شما در لیست بالا نباشد، با تیم پشتیبانی سالمندیار تماس بگیرید تا امکان ارائه خدمات در منطقه شما بررسی شود.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="tel:09128718237"
                    className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-gradient-to-l from-teal-500 to-teal-600 text-white font-bold hover:shadow-lg hover:shadow-teal-500/20 transition gap-2"
                  >
                    <Phone size={18} /> تماس با پشتیبانی
                  </a>
                  <Link
                    href="/portal/home-care/request"
                    className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-gray-50 text-gray-800 font-bold border border-gray-200 hover:bg-gray-100 transition"
                  >
                    ثبت درخواست خدمات
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-teal-50 border border-teal-100 text-center">
                  <div className="text-3xl font-black text-teal-700 mb-1">500+</div>
                  <div className="text-xs font-bold text-teal-600">پرستار فعال</div>
                </div>
                <div className="p-5 rounded-2xl bg-blue-50 border border-blue-100 text-center">
                  <div className="text-3xl font-black text-blue-700 mb-1">{sorted.length}+</div>
                  <div className="text-xs font-bold text-blue-600">شهر فعال</div>
                </div>
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100 text-center col-span-2 sm:col-span-1">
                  <div className="text-3xl font-black text-amber-700 mb-1">24/7</div>
                  <div className="text-xs font-bold text-amber-600">پشتیبانی</div>
                </div>
                <div className="p-5 rounded-2xl bg-purple-50 border border-purple-100 text-center col-span-2 sm:col-span-1">
                  <div className="text-3xl font-black text-purple-700 mb-1">10K+</div>
                  <div className="text-xs font-bold text-purple-600">درخواست موفق</div>
                </div>
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 text-center col-span-2 sm:col-span-2">
                  <div className="text-3xl font-black text-emerald-700 mb-1">98%</div>
                  <div className="text-xs font-bold text-emerald-600">رضایت مشتریان</div>
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
