import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Phone, Star, MapPin, CheckCircle2, ShieldCheck, MessageSquare, Clock, ArrowLeft, Award, HandHeart, UserCheck, Building, ChevronDown } from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Breadcrumb from '@/components/seo/Breadcrumb';
import { ServiceSchema } from '@/lib/seo/structured-data';
import { listServicesWithSeo, getServiceLandingBySlug, listArticles, listCities, getFaqs } from '@/lib/content-api';

export async function generateStaticParams() {
  const services = await listServicesWithSeo();
  if (!services || services.length === 0) return [];
  return services.map(s => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const svc = await getServiceLandingBySlug(slug);
  if (!svc) return {};

  return {
    title: svc.metaTitle || svc.serviceDefinition?.title,
    description: svc.metaDescription || svc.longDescription,
    keywords: [svc.primaryKeyword || '', ...(svc.secondaryKeywords || [])].filter(Boolean),
    alternates: { canonical: svc.canonicalUrl || `/services/${svc.slug}` },
    openGraph: {
      title: svc.metaTitle || svc.serviceDefinition?.title,
      description: svc.metaDescription || svc.longDescription,
      type: 'website',
      url: `/services/${svc.slug}`,
      images: svc.ogImageUrl || svc.heroImageUrl ? [svc.ogImageUrl || svc.heroImageUrl!] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: svc.metaTitle || svc.serviceDefinition?.title,
      description: svc.metaDescription || svc.longDescription,
      images: svc.twitterImageUrl || svc.heroImageUrl ? [svc.twitterImageUrl || svc.heroImageUrl!] : undefined,
    },
  };
}

export default async function ServiceLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [serviceResult, articlesResult, citiesResult] = await Promise.all([
    getServiceLandingBySlug(slug),
    listArticles({ pageSize: 20 }),
    listCities(),
  ]);
  const service = serviceResult;
  if (!service) notFound();

  const faqsFromService = service.faqs && service.faqs.length > 0 ? service.faqs : [];
  const faqsFromApi = service?.id ? await getFaqs('Service', service.id) : [];
  const faqs = faqsFromApi && faqsFromApi.length > 0 ? faqsFromApi : faqsFromService;

  const articles = articlesResult?.items || [];
  const coverageCities = citiesResult || [];
  const relatedArticles = articles.filter(a => a.serviceDefinitionId === service.serviceDefinitionId || a.status === 'Published').slice(0, 3);
  const has24Hour = (service.coverageAreas || []).some(c => c.has24HourService);
  const citiesList = coverageCities.filter(c => (service.coverageAreas || []).some(cc => cc.cityId === c.id || cc.areaName?.includes(c.name))).slice(0, 6);

  function formatDate(date?: string) {
    if (!date) return '';
    try { return new Intl.DateTimeFormat('fa-IR').format(new Date(date)); } catch { return ''; }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <ServiceSchema service={service} faqs={faqs} />
      <Navbar />

      <main>
        {/* Hero */}
        <section className="pt-32 pb-16 bg-gradient-to-br from-teal-50 via-white to-blue-50/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-teal-200/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-blue-200/20 blur-3xl pointer-events-none" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <Breadcrumb items={[{ name: 'خدمات پرستاری', href: '/services' }, { name: service.serviceDefinition?.title || '', href: `/services/${service.slug}` }]} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-600 text-white text-xs font-bold shadow-lg shadow-teal-600/20">
                    <ShieldCheck size={14} />
                    مجوز رسمی وزارت بهداشت
                  </span>
                  {service.isFeatured && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-l from-amber-500 to-orange-500 text-white text-xs font-bold shadow-lg shadow-orange-500/30">
                      <Award size={14} />
                      خدمت ویژه و پرطرفدار
                    </span>
                  )}
                  {has24Hour && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500 text-white text-xs font-bold shadow-lg shadow-green-500/20">
                      <Clock size={14} />
                      پشتیبانی ۲۴ ساعته
                    </span>
                  )}
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-[1.15] mb-6">
                  {service.serviceDefinition?.title}
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-l from-teal-600 to-teal-400">
                    در منزل با سالمندیار
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-8 max-w-2xl">
                  {service.longDescription || service.serviceDefinition?.description}
                </p>

                {/* Stats Mini */}
                <div className="grid grid-cols-3 gap-4 mb-8 max-w-lg">
                  <StatMini value={(service.viewCount || 8245).toLocaleString('fa-IR')} label="تعداد درخواست ماهانه" />
                  <StatMini value={(() => {
                    const avg = (service.testimonials || []).reduce((a, t) => a + (t.rating || 0), 0) / Math.max(1, (service.testimonials || []).length);
                    return avg ? avg.toFixed(1) : '۴.۹';
                  })()} label="رضایت مشتری" suffix="/۵" />
                  <StatMini value={(service.coverageAreas || []).length.toString()} label="منطقه تحت پوشش" />
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                  <Link href={service.primaryCtaLink || '/guest-request'} className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-l from-teal-600 to-teal-700 text-white font-black shadow-xl shadow-teal-600/25 hover:shadow-2xl hover:scale-[1.02] transition-all text-lg">
                    <HandHeart size={20} />
                    {service.primaryCtaText || 'درخواست فوری خدمات'}
                  </Link>
                  <a href="tel:02112345678" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white border-2 border-teal-200 text-teal-700 font-black hover:border-teal-500 hover:bg-teal-50 transition-all text-lg shadow-sm">
                    <Phone size={20} />
                    تماس فوری ۰۲۱-۱۲۳۴۵۶۷۸
                  </a>
                </div>

                {/* Trust Strip */}
                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-green-500" /> پرستاران دارای مجوز و بیمه شده</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-green-500" /> ارسال در کمتر از ۲ ساعت</span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-green-500" /> ضمانت کیفیت خدمات</span>
                </div>
              </div>

              {/* Hero Media & Price Card */}
              <div className="lg:col-span-5 space-y-5">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white aspect-[4/3] bg-gradient-to-br from-teal-100 to-blue-100">
                  {service.heroImageUrl && (
                    <img src={service.heroImageUrl} alt={service.serviceDefinition?.title} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-teal-900/40 via-transparent to-transparent" />
                  <div className="absolute top-5 right-5 px-4 py-3 rounded-2xl bg-white/95 backdrop-blur shadow-lg">
                    <p className="text-[10px] text-gray-500 mb-0.5">شروع قیمت از</p>
                    {service.startingPrice ? (
                      <p className="font-black text-xl text-teal-700" dir="ltr">{service.startingPrice.toLocaleString('fa-IR')} <span className="text-xs font-medium">تومان</span></p>
                    ) : service.priceRangeText ? (
                      <p className="font-black text-xl text-teal-700">{service.priceRangeText}</p>
                    ) : (
                      <p className="font-black text-lg text-teal-700">مشاوره رایگان</p>
                    )}
                  </div>
                  {service.videoPresentationUrl && (
                    <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white/95 backdrop-blur text-teal-600 flex items-center justify-center shadow-2xl hover:scale-110 transition">
                      <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" className="mr-[-3px]"><path d="M8 5v14l11-7z"/></svg>
                    </button>
                  )}
                </div>

                {service.priceRangeText && (
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200/50 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-2xl shadow-sm">💰</div>
                    <div>
                      <p className="text-xs text-amber-700 font-bold mb-0.5">قیمت‌گذاری شفاف</p>
                      <p className="font-black text-gray-900 text-lg">{service.priceRangeText}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Benefits Section */}
          {(service.benefits && service.benefits.length > 0) && (
            <section className="py-16 border-t border-gray-100">
              <SectionHeader eyebrow="مزایای این خدمت" title="چرا این خدمت را از سالمندیار بخواهیم؟" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {service.benefits.map(b => (
                  <div key={b.id} className="p-6 rounded-3xl bg-gradient-to-br from-white to-gray-50/50 border border-gray-100 hover:shadow-xl hover:border-teal-100 transition-all group">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg text-2xl ${b.colorClass || 'bg-gradient-to-br from-teal-100 to-teal-50 text-teal-600'}`}>
                      {b.iconName || '✨'}
                    </div>
                    <h3 className="font-black text-lg text-gray-900 mb-2 group-hover:text-teal-700 transition">{b.title}</h3>
                    {b.description && <p className="text-sm text-gray-600 leading-relaxed">{b.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Target Patients + Coverage */}
          <section className="py-16 border-t border-gray-100 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Who needs */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-50/70 via-white to-white border border-blue-100">
              <SectionHeader eyebrow="بیماران هدف" title="چه افرادی به این خدمت نیاز دارند؟" />
              {(service.targetPatients && service.targetPatients.length > 0) ? (
                <div className="space-y-3">
                  {service.targetPatients.map(tp => (
                    <div key={tp.id} className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-gray-100 hover:border-blue-200 transition">
                      <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/20">
                        <UserCheck size={18} />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 mb-0.5">{tp.title}</p>
                        {tp.description && <p className="text-sm text-gray-600 leading-relaxed">{tp.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600 leading-relaxed">این خدمت برای بیماران و سالمندی مناسب است که نیاز به مراقبت‌های منظم و پزشکی در منزل دارند.</p>
              )}
            </div>

            {/* Coverage Areas */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-50/70 via-white to-white border border-emerald-100">
              <SectionHeader eyebrow="مناطق تحت پوشش" title={`این خدمت در کدام مناطق ارائه می‌شود؟`} />
              {(service.coverageAreas && service.coverageAreas.length > 0) ? (
                <div>
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {(service.coverageAreas || []).map((ca, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 p-3 rounded-2xl bg-white border border-gray-100 hover:border-emerald-200 transition">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <MapPin size={14} className="text-emerald-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-sm text-gray-900 truncate">{ca.areaName}</p>
                          {ca.district && <p className="text-[10px] text-gray-500 truncate">{ca.district}</p>}
                        </div>
                        {ca.has24HourService && (
                          <span className="text-[9px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded">۲۴ ساعته</span>
                        )}
                      </div>
                    ))}
                  </div>
                  {citiesList.length > 0 && (
                    <div className="p-4 rounded-2xl bg-white border border-gray-100">
                      <p className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5"><Building size={14} className="text-emerald-600" /> شهرهای تحت پوشش:</p>
                      <div className="flex flex-wrap gap-2">
                        {citiesList.map(c => (
                          <Link key={c.id} href={`/cities/${c.slug}`} className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 transition">
                            {c.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-600 leading-relaxed">این خدمت در حال حاضر در تمام مناطق تهران و کرج ارائه می‌شود. برای اطمینان با کارشناسان ما تماس بگیرید.</p>
              )}
            </div>
          </section>

          {/* Testimonials */}
          {(service.testimonials && service.testimonials.length > 0) && (
            <section className="py-16 border-t border-gray-100">
              <SectionHeader eyebrow="تجربه مشتریان واقعی" title="مشتریان درباره این خدمت چه می‌گویند؟" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {service.testimonials.map(t => (
                  <div key={t.id} className="p-6 rounded-3xl bg-gradient-to-br from-white to-slate-50 border border-gray-100 hover:shadow-xl transition-all relative">
                    <div className="absolute top-5 left-5 text-5xl text-teal-100 font-serif leading-none">"</div>
                    <div className="relative">
                      <div className="flex items-center gap-1 mb-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={16} className={i < (t.rating || 5) ? 'text-amber-500 fill-amber-500' : 'text-gray-200'} />
                        ))}
                      </div>
                      <p className="text-gray-700 leading-loose mb-4 relative z-10">{t.content}</p>
                      {t.highlight && (
                        <p className="text-xs font-bold text-teal-700 bg-teal-50 p-2 rounded-lg mb-4">{t.highlight}</p>
                      )}
                      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-br from-teal-100 to-teal-50 flex-shrink-0">
                          {t.profileImageUrl ? (
                            <img src={t.profileImageUrl} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm font-black text-teal-600">{t.clientFullName?.[0] || 'م'}</div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 text-sm">{t.clientFullName}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">{t.clientRole}</p>
                            {t.testimonialDate && <p className="text-[10px] text-gray-400">{formatDate(t.testimonialDate)}</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* FAQs */}
          {faqs.length > 0 && (
            <section id="faq" className="py-16 border-t border-gray-100">
              <SectionHeader eyebrow="سوالات متداول" title="قبل از درخواست خدمات، این سوالات را بخوانید" />
              <div className="max-w-3xl mx-auto space-y-3">
                {faqs.map((faq, idx) => (
                  <details key={idx} className="group rounded-2xl bg-white border border-gray-100 hover:border-teal-200 open:shadow-lg open:border-teal-100 transition-all overflow-hidden">
                    <summary className="cursor-pointer p-5 sm:p-6 flex items-center justify-between gap-4 font-black text-gray-900 hover:bg-teal-50/30 transition marker:content-['']">
                      <span className="flex items-start gap-3 leading-relaxed">
                        <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-teal-50 text-teal-600 text-xs font-black flex items-center justify-center mt-0.5">Q{idx + 1}</span>
                        {faq.question}
                      </span>
                      <ChevronDown size={20} className="flex-shrink-0 text-gray-400 group-open:rotate-180 group-open:text-teal-500 transition" />
                    </summary>
                    <div className="px-5 sm:px-6 pb-6 pt-0 text-gray-700 leading-loose border-t border-gray-100 pt-4 pr-[52px]">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <section className="py-16 border-t border-gray-100">
              <SectionHeader eyebrow="مقالات آموزشی مرتبط" title="در مورد این خدمت بیشتر بخوانید" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {relatedArticles.map(art => (
                  <Link key={art.id} href={`/articles/${art.slug}`} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:border-teal-100 transition-all">
                    <div className="aspect-[16/10] overflow-hidden bg-gray-50">
                      {art.featuredImageUrl && (
                        <img src={art.featuredImageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2 text-[10px] text-gray-500">
                        <Clock size={11} /> {art.estimatedReadingTimeMinutes || 5} دقیقه مطالعه
                      </div>
                      <h4 className="font-black text-gray-900 group-hover:text-teal-700 transition leading-snug mb-2 line-clamp-2">
                        {art.title}
                      </h4>
                      <span className="text-xs font-bold text-teal-600">مطالعه مقاله ←</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Final CTA */}
          <section className="my-16 p-10 sm:p-16 rounded-[2.5rem] bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(circle at 20% 20%, white 0%, transparent 40%), radial-gradient(circle at 80% 80%, white 0%, transparent 40%)'}} />
            <div className="relative grid grid-cols-1 lg:grid-cols-12 items-center gap-10">
              <div className="lg:col-span-7">
                <p className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 text-white text-xs font-bold mb-5 backdrop-blur border border-white/20">
                  <MessageSquare size={13} />
                  ۷ روز هفته • ۲۴ ساعت پاسخگویی
                </p>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-5">
                  آماده‌ی درخواست خدمات هستید؟
                  <br />
                  در کمتر از ۲ ساعت پرستار در منزل شماست.
                </h2>
                <p className="text-teal-100 text-lg max-w-xl leading-relaxed mb-6">
                  نگران هزینه باشید. کارشناسان ما ابتدا با شما مشاوره رایگان می‌کنند و بر اساس نیاز واقعی شما، بهترین گزینه را پیشنهاد می‌دهند.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                  <Link href={service.primaryCtaLink || '/guest-request'} className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-teal-700 font-black shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all text-lg">
                    <HandHeart size={20} />
                    {service.primaryCtaText || 'درخواست فوری خدمات'}
                  </Link>
                  <a href="tel:02112345678" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-teal-500/30 border-2 border-teal-400/40 text-white font-black hover:bg-teal-500/50 transition-all text-lg backdrop-blur">
                    <Phone size={20} />
                    مشاوره رایگان تلفنی
                  </a>
                </div>
              </div>
              <div className="lg:col-span-5">
                <div className="p-6 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-xl">
                  <p className="font-black text-xl mb-5 flex items-center gap-2">
                    <ShieldCheck size={22} className="text-teal-200" />
                    تعهدات سالمندیار
                  </p>
                  <ul className="space-y-3">
                    {[
                      'ارسال پرستار با سوابق معتبر و دارای مجوز وزارت بهداشت',
                      'پشتیبانی ۲۴ ساعته تیم پزشکی هنگام ارائه خدمات',
                      'کنترل کیفیت دوره‌ای خدمات و ارزیابی پرستار',
                      'امکان جابجایی پرستار در صورت عدم رضایت',
                      'گزارش روزانه از وضعیت بیمار برای خانواده',
                    ].map(item => (
                      <li key={item} className="flex items-start gap-2.5">
                        <CheckCircle2 size={18} className="text-teal-300 flex-shrink-0 mt-0.5" />
                        <span className="text-sm leading-relaxed text-white/95">{item}</span>
                      </li>
                    ))}
                  </ul>
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

function SectionHeader({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <div className="mb-10 text-center max-w-2xl mx-auto">
      {eyebrow && (
        <p className="text-xs font-black text-teal-600 uppercase tracking-wider mb-3 inline-block bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-full">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">{title}</h2>
    </div>
  );
}

function StatMini({ value, label, suffix }: { value: string; label: string; suffix?: string }) {
  return (
    <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition">
      <p className="font-black text-2xl text-gray-900 leading-none">
        {value}
        {suffix && <span className="text-base text-gray-400 mr-0.5">{suffix}</span>}
      </p>
      <p className="text-[11px] text-gray-500 mt-1 leading-tight">{label}</p>
    </div>
  );
}
