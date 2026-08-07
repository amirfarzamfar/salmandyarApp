import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Phone,
  ShieldCheck,
  ChevronLeft,
  Clock,
  CheckCircle2,
  Building2,
  FileText,
  HeartPulse,
  Sparkles,
} from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Breadcrumb from '@/components/seo/Breadcrumb';
import { LocalBusinessSchema, FAQSchema } from '@/lib/seo/structured-data';
import { listCities, getCityBySlug, listArticles, listServicesWithSeo } from '@/lib/content-api';
import type { City, FAQItem } from '@/lib/types/content';

type Params = { params: { slug: string } };

export async function generateStaticParams() {
  const citiesResult = await listCities();
  return (citiesResult || []).map(c => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const city = await getCityBySlug(params.slug);
  if (!city) return { title: 'شهر یافت نشد' };

  return {
    title: city.metaTitle || `پرستار و سالمندیار در منزل ${city.name} | قیمت خدمات | سالمندیار`,
    description: city.metaDescription || city.shortDescription,
    keywords: [
      `پرستار در منزل ${city.name}`,
      `سالمندیار ${city.name}`,
      `پرستار در ${city.name}`,
      'خدمات پرستاری',
      'مراقبت در منزل',
    ].filter(Boolean),
    alternates: { canonical: `/cities/${city.slug}` },
    openGraph: {
      title: city.metaTitle,
      description: city.metaDescription || city.shortDescription,
      type: 'website',
      url: `/cities/${city.slug}`,
      images: city.ogImageUrl ? [city.ogImageUrl] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: city.metaTitle,
      description: city.metaDescription,
      images: city.ogImageUrl ? [city.ogImageUrl] : undefined,
    },
  };
}

export default async function CityDetailPage({ params }: Params) {
  const [cityResult, articlesResult, servicesResult] = await Promise.all([
    getCityBySlug(params.slug),
    listArticles({ pageSize: 50 }),
    listServicesWithSeo(),
  ]);
  const city = cityResult;
  if (!city) notFound();
  const c: City = city;
  const localArticles = articlesResult?.items || [];
  const localServices = servicesResult || [];
  const articles = localArticles;
  const serviceSeoProfiles = localServices;

  const localFAQs: FAQItem[] = [
    {
      id: 1,
      question: `پرستار در منزل ${c.name} چقدر زمان نیاز دارد؟`,
      answer: `معمولاً پس از ثبت درخواست، پرستار در کمتر از ۲ تا ۴ ساعت در ${c.name} به آدرس شما اعزام می‌شود. برای موارد اورژانسی، این زمان کمتر خواهد بود.`,
      displayOrder: 1,
    },
    {
      id: 2,
      question: `هزینه پرستار در منزل ${c.name} چقدر است؟`,
      answer: `هزینه پرستار در ${c.name} بسته به نوع خدمت، ساعات کاری و تجربه پرستار متفاوت است. برای اطلاع از قیمت دقیق با کارشناسان سالمندیار تماس بگیرید.`,
      displayOrder: 2,
    },
    {
      id: 3,
      question: `آیا پرستاران در تمام مناطق ${c.name} خدمات ارائه می‌دهند؟`,
      answer: `بله، تیم پرستاری سالمندیار در ${c.coveredAreas && c.coveredAreas.length > 0 ? c.coveredAreas.length + ' منطقه' : 'تمامی مناطق'} ${c.name} فعال است و خدمات ارائه می‌دهد.`,
      displayOrder: 3,
    },
    {
      id: 4,
      question: `آیا امکان مشاهده مدارک پرستار قبل از آغاز کار وجود دارد؟`,
      answer: `بله، تمام پرستاران دارای مدارک معتبر وزارت بهداشت هستند و پیش از شروع کار، مدارک آن‌ها به شما ارائه خواهد شد.`,
      displayOrder: 4,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <LocalBusinessSchema city={c} />
      <FAQSchema faqs={localFAQs} pageUrl={`/cities/${c.slug}`} />
      <Navbar />

      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[
            { name: 'شهرهای تحت پوشش', href: '/cities' },
            { name: c.name, href: `/cities/${c.slug}` },
          ]} />

          <div className="relative rounded-3xl overflow-hidden mb-10 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-teal-600" />
            {c.coverImageUrl && (
              <img
                src={c.coverImageUrl}
                alt={c.name}
                className="absolute inset-0 w-full h-full object-cover opacity-30"
              />
            )}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_60%)]" />
            <div className="relative p-8 sm:p-12 lg:p-14">
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur text-white text-xs font-bold border border-white/25 flex items-center gap-1.5">
                  <Building2 size={13} />
                  {c.province ? `استان ${c.province}` : 'مرکز استان'}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur text-white text-xs font-bold border border-white/25 flex items-center gap-1.5">
                  <MapPin size={13} />
                  {(c.coveredAreas || []).length || 22}+ منطقه تحت پوشش
                </span>
                <span className="px-3 py-1 rounded-full bg-teal-400/30 backdrop-blur text-white text-xs font-bold border border-teal-300/40 flex items-center gap-1.5">
                  <ShieldCheck size={13} /> خدمات تایید شده وزارت بهداشت
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
                <div className="lg:col-span-8">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-5 leading-tight">
                    پرستار و سالمندیار در منزل <span className="text-yellow-300">{c.name}</span>
                  </h1>
                  <p className="text-lg sm:text-xl text-white/85 leading-relaxed mb-8 max-w-3xl">
                    {c.shortDescription || c.aboutRegion || `ارائه کلیه خدمات پرستاری و مراقبت در منزل در تمام مناطق ${c.name} با کادر مجرب و دارای مجوز`}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/portal/home-care/request"
                      className="inline-flex items-center gap-2 h-13 px-7 rounded-2xl bg-white text-teal-700 font-black hover:bg-gray-50 transition shadow-2xl text-lg py-3"
                    >
                      درخواست فوری پرستار در {c.name}
                    </Link>
                    <a
                      href={`tel:${c.phoneNumber ? c.phoneNumber.replace(/\D/g, '') : '02112345678'}`}
                      className="inline-flex items-center gap-2 h-13 px-7 rounded-2xl bg-white/15 backdrop-blur-md text-white font-black hover:bg-white/25 transition border border-white/30 text-lg py-3"
                    >
                      <Phone size={20} />
                      {c.phoneNumber || '۰۲۱-۱۲۳۴۵۶۷۸'}
                    </a>
                  </div>
                </div>
                <div className="lg:col-span-4">
                  <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20">
                    <div className="text-white/80 text-xs font-bold mb-2 uppercase tracking-wider">
                      آمار خدمات در {c.name}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                        <div className="text-3xl font-black text-white mb-0.5">500+</div>
                        <div className="text-xs text-white/80">پرستار فعال</div>
                      </div>
                      <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                        <div className="text-3xl font-black text-white mb-0.5">24/7</div>
                        <div className="text-xs text-white/80">سرویس دهی</div>
                      </div>
                      <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                        <div className="text-3xl font-black text-white mb-0.5">2h</div>
                        <div className="text-xs text-white/80">زمان اعزام</div>
                      </div>
                      <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                        <div className="text-3xl font-black text-white mb-0.5">98%</div>
                        <div className="text-xs text-white/80">رضایت</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <section className="bg-white rounded-3xl p-7 sm:p-8 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">مناطق تحت پوشش در {c.name}</h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      تمامی مناطق و محله‌های {c.name} در محدوده خدمات سالمندیار
                    </p>
                  </div>
                </div>
                {c.coveredAreas && c.coveredAreas.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                    {c.coveredAreas.map((area, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 px-3.5 py-3 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 hover:from-blue-100 hover:to-indigo-100 transition group"
                      >
                        <MapPin size={14} className="text-blue-500 shrink-0 group-hover:text-blue-700 transition" />
                        <span className="text-sm font-bold text-gray-700 truncate">{area}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                      <div key={i} className="flex items-center gap-2.5 text-sm text-gray-700 font-medium p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <CheckCircle2 size={16} className="text-teal-600 shrink-0" />
                        <span>منطقه {i} و محله‌های پیرامونی</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="bg-white rounded-3xl p-7 sm:p-8 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                    <HeartPulse size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">خدمات پرستاری در {c.name}</h2>
                    <p className="text-sm text-gray-500 mt-0.5">
                      انتخاب خدمت مورد نیاز برای دریافت سریع خدمات در {c.name}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {serviceSeoProfiles.filter(s => s.showInHomePage).slice(0, 6).map(srv => (
                    <Link
                      key={srv.id}
                      href={`/services/${srv.slug}`}
                      className="group flex items-start gap-4 p-5 rounded-2xl hover:bg-teal-50 border border-gray-100 hover:border-teal-200 transition"
                    >
                      <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 group-hover:bg-teal-500 group-hover:text-white transition">
                        <Sparkles size={22} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-gray-900 group-hover:text-teal-700 transition mb-1">
                          {srv.serviceDefinition?.title}
                        </h3>
                        {srv.priceRangeText && (
                          <p className="text-xs text-gray-500 mb-2">{srv.priceRangeText}</p>
                        )}
                        {srv.startingPrice && (
                          <div className="text-sm font-black text-teal-700">
                            از {srv.startingPrice.toLocaleString('fa-IR')} تومان
                          </div>
                        )}
                      </div>
                      <ChevronLeft size={18} className="text-gray-400 group-hover:-translate-x-1 group-hover:text-teal-600 transition shrink-0 mt-1" />
                    </Link>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Link
                    href="/services"
                    className="inline-flex items-center gap-2 h-12 px-7 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-bold hover:bg-gray-100 transition"
                  >
                    مشاهده تمام خدمات <ChevronLeft size={18} />
                  </Link>
                </div>
              </section>

              {c.aboutRegion && (
                <section className="bg-gradient-to-br from-slate-50 to-white rounded-3xl p-7 sm:p-8 border border-gray-100">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <FileText size={24} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900">درباره {c.name}</h2>
                  </div>
                  <p className="text-gray-700 leading-loose">{c.aboutRegion}</p>
                </section>
              )}

              <section className="bg-white rounded-3xl p-7 sm:p-8 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <FileText size={24} />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900">سوالات متداول ساکنین {c.name}</h2>
                </div>
                <div className="space-y-3">
                  {localFAQs.sort((a, b) => a.displayOrder - b.displayOrder).map(faq => (
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

              <section className="bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-600 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_bottom_left,white,transparent_60%)]" />
                <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-white text-xs font-bold mb-4 border border-white/25">
                      <Clock size={13} /> آماده ارائه خدمات ۲۴ ساعته در {c.name}
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black mb-4 leading-tight">
                      همین حالا درخواست پرستار در {c.name} را ثبت کنید
                    </h2>
                    <p className="opacity-90 leading-relaxed mb-6">
                      پرستاران متخصص و دارای مجوز سالمندیار، آماده ارائه خدمات پرستاری و سالمندیار در تمام مناطق {c.name} هستند.
                    </p>
                    <div className="space-y-2.5 mb-7">
                      {[
                        'اعزام پرستار در کمتر از ۲ ساعت در تمامی مناطق ' + c.name,
                        'امکان مصاحبه تلفنی با پرستار پیش از آغاز کار',
                        'گزارش‌دهی منظم از وضعیت بیمار به خانواده',
                        'تعهد کتبی و پشتیبانی ۲۴ ساعته در طول خدمت',
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <CheckCircle2 size={20} className="text-yellow-300 mt-0.5 shrink-0" />
                          <span className="text-sm leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link
                        href="/portal/home-care/request"
                        className="inline-flex items-center justify-center h-13 px-7 rounded-2xl bg-white text-teal-700 font-black hover:bg-gray-50 transition shadow-2xl py-3"
                      >
                        ثبت درخواست خدمات
                      </Link>
                      <a
                        href={`tel:${c.phoneNumber ? c.phoneNumber.replace(/\D/g, '') : '02112345678'}`}
                        className="inline-flex items-center justify-center gap-2 h-13 px-7 rounded-2xl bg-white/15 backdrop-blur-md text-white font-black hover:bg-white/25 transition border border-white/30 py-3"
                      >
                        <Phone size={18} />
                        تماس فوری: {c.phoneNumber || '۰۲۱-۱۲۳۴۵۶۷۸'}
                      </a>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {serviceSeoProfiles.slice(0, 4).map(srv => (
                      <Link
                        key={srv.id}
                        href={`/services/${srv.slug}`}
                        className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/20 transition group"
                      >
                        <div className="text-white/80 text-xs mb-1.5">خدمات</div>
                        <h4 className="font-black text-white mb-1 group-hover:text-yellow-300 transition">
                          {srv.serviceDefinition?.title}
                        </h4>
                        {srv.startingPrice && (
                          <div className="text-xs font-bold text-yellow-200">
                            از {srv.startingPrice.toLocaleString('fa-IR')} تومان
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            <div className="lg:col-span-4 space-y-5">
              <div className="bg-white rounded-3xl p-6 border-2 border-teal-100 shadow-sm sticky top-28">
                <div className="bg-gradient-to-br from-teal-500 via-blue-600 to-indigo-700 -m-6 mb-5 p-6 rounded-t-3xl text-white">
                  <div className="flex items-center gap-2 text-xs font-bold opacity-90 mb-2">
                    <ShieldCheck size={14} /> تماس سریع {c.name}
                  </div>
                  <h3 className="text-xl font-black mb-4 leading-tight">
                    ثبت درخواست سریع خدمات در {c.name}
                  </h3>
                  <p className="text-sm opacity-90 mb-5 leading-relaxed">
                    فرم را پر کنید یا با شماره زیر تماس بگیرید، کارشناس ما سریعاً با شما ارتباط می‌گیرد.
                  </p>
                </div>
                <div className="space-y-3 mb-5">
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center shrink-0">
                      <Phone size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-gray-500 mb-0.5">شماره تماس {c.name}</div>
                      <a href={`tel:${c.phoneNumber ? c.phoneNumber.replace(/\D/g, '') : '02112345678'}`} className="font-black text-gray-900 hover:text-teal-700 transition block truncate">
                        {c.phoneNumber || '۰۲۱-۱۲۳۴۵۶۷۸'}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                      <Clock size={18} />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">ساعات پاسخگویی</div>
                      <div className="font-black text-gray-900">۲۴ ساعت شبانه‌روز - ۷ روز هفته</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <Link
                    href="/portal/home-care/request"
                    className="block w-full h-13 rounded-xl bg-gradient-to-l from-teal-500 to-blue-600 text-white font-black text-center leading-[3.25rem] hover:shadow-lg hover:shadow-teal-500/20 transition py-3"
                  >
                    ثبت درخواست خدمت
                  </Link>
                  <a
                    href={`tel:${c.phoneNumber ? c.phoneNumber.replace(/\D/g, '') : '02112345678'}`}
                    className="block w-full h-12 rounded-xl bg-gray-50 text-gray-800 font-bold text-center leading-[3rem] border border-gray-200 hover:bg-gray-100 transition flex items-center justify-center gap-2"
                  >
                    <Phone size={16} />
                    تماس فوری
                  </a>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <h4 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  مقالات پیشنهادی برای ساکنین {c.name}
                </h4>
                <div className="space-y-3.5">
                  {articles.slice(0, 4).map(art => (
                    <Link
                      key={art.id}
                      href={`/articles/${art.slug}`}
                      className="flex gap-3 p-2 rounded-2xl hover:bg-blue-50 transition group"
                    >
                      {art.featuredImageUrl && (
                        <img
                          src={art.featuredImageUrl}
                          alt={art.title}
                          className="w-20 h-16 rounded-xl object-cover shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-sm text-gray-900 group-hover:text-blue-700 transition line-clamp-2 leading-snug">
                          {art.title}
                        </h5>
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
                          <Clock size={12} />
                          <span>{art.estimatedReadingTimeMinutes || 5} دقیقه مطالعه</span>
                        </div>
                      </div>
                    </Link>
                  ))}
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
