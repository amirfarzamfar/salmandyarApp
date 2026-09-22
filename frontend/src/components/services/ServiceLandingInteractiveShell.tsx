'use client';

import { useEffect } from 'react';
import GuestRequestWizard from '@/components/requests/GuestRequestWizard';
import { track } from '@/lib/analytics';
import { ServiceSeoProfile } from '@/lib/types/content';
import { getServiceLandingBySlug } from '@/lib/content-api';
import { useMemo } from 'react';
import { HandHeart, Phone, BookOpen, ShieldCheck, CheckCircle2, Zap, Award, ArrowRight, Sparkles, BadgeCheck, Star } from 'lucide-react';
import Link from 'next/link';

interface ServiceLandingInteractiveShellProps {
  service: ServiceSeoProfile;
  allServices: ServiceSeoProfile[];
}

export default function ServiceLandingInteractiveShell({
  service,
  allServices,
}: ServiceLandingInteractiveShellProps) {
  useEffect(() => {
    try {
      track('service_page_view', {
        serviceSlug: service.slug,
        serviceDefinitionId: service.serviceDefinitionId,
        source: 'organic',
      });
    } catch {
      // Never break user experience
    }
  }, [service.slug, service.serviceDefinitionId]);

  const related = useMemo(() => {
    if (!service.relatedServicesSlugs || service.relatedServicesSlugs.length === 0) return [];
    return allServices.filter(s => service.relatedServicesSlugs?.includes(s.slug) && s.id !== service.id);
  }, [service, allServices]);

  const relatedFallback = useMemo(() => {
    if (related.length > 0) return related;
    return allServices
      .filter(s => s.id !== service.id && s.showInHomePage)
      .slice(0, 3);
  }, [related, allServices, service.id]);

  const sortedSections = useMemo(
    () => (service.seoSections || []).slice().sort((a, b) => a.displayOrder - b.displayOrder),
    [service.seoSections],
  );

  return (
    <>
      {/* SEO Sections: long-form educational content with H2/H3 hierarchy */}
      {sortedSections.length > 0 && (
        <section className="py-16 sm:py-20 border-t border-gray-100 bg-gradient-to-b from-white via-slate-50/40 to-white relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-40 left-20 w-72 h-72 rounded-full bg-teal-100/40 blur-3xl" />
            <div className="absolute bottom-40 right-10 w-80 h-80 rounded-full bg-emerald-100/40 blur-3xl" />
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="mb-14 text-center max-w-3xl mx-auto">
              <p className="text-xs font-black text-teal-600 uppercase tracking-widest mb-4 inline-flex items-center gap-1.5 bg-teal-50 border border-teal-100 px-4 py-2 rounded-full shadow-sm">
                <BookOpen size={14} />
                محتوای تخصصی و آموزشی
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-[1.15] mb-4">
                هر آنچه باید درباره
                <span className="mx-1.5 text-transparent bg-clip-text bg-gradient-to-l from-teal-600 to-emerald-600">
                  «{service.serviceDefinition?.title}»
                </span>
                بدانید
              </h2>
              <p className="text-gray-600 text-base sm:text-lg leading-[2] max-w-2xl mx-auto">
                در این بخش سعی کرده‌ایم تمام پرسش‌های رایج شما را به زبان ساده، دقیق و مستند به علم پزشکی پاسخ دهیم تا قبل از درخواست خدمات، انتخاب آگاهانه‌ای داشته باشید.
              </p>

              <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-100 text-xs font-bold text-gray-700 shadow-sm">
                  <ShieldCheck size={13} className="text-teal-600" /> تأیید تیم پزشکی
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-100 text-xs font-bold text-gray-700 shadow-sm">
                  <BadgeCheck size={13} className="text-emerald-600" /> منابع معتبر علمی
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-100 text-xs font-bold text-gray-700 shadow-sm">
                  <Star size={13} className="text-amber-500" /> به‌روز: {new Date().getFullYear()}
                </span>
              </div>
            </div>

            <div className="max-w-4xl mx-auto space-y-10 sm:space-y-14">
              {sortedSections.map((sec, secIndex) => {
                const isLastSection = secIndex === sortedSections.length - 1;
                const showCtaBannerAfter = !isLastSection && (secIndex === 1 || secIndex === Math.floor(sortedSections.length / 2));

                return (
                  <div key={sec.id}>
                    <article
                      className="relative p-7 sm:p-9 lg:p-10 rounded-[2rem] bg-white border border-gray-100 shadow-[0_10px_40px_-15px_rgba(15,23,42,0.08)] hover:shadow-[0_20px_60px_-15px_rgba(20,184,166,0.18)] hover:border-teal-100 transition-all duration-500 overflow-hidden group"
                    >
                      <div className="absolute top-0 right-0 w-52 h-52 rounded-full bg-gradient-to-br from-teal-50 to-slate-50 opacity-60 blur-2xl pointer-events-none -translate-y-1/3 translate-x-1/4 group-hover:opacity-100 transition-opacity duration-500" />

                      <div className="relative">
                        <div className="flex items-start justify-between mb-6">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100/60 text-[10px] sm:text-xs font-black text-teal-700 tracking-wider">
                            <span className="w-5 h-5 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 text-white flex items-center justify-center text-[10px] shadow-md shadow-teal-500/20">
                              {String(secIndex + 1).padStart(2, '۰').replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[+d])}
                            </span>
                            بخش {secIndex + 1} از {sortedSections.length}
                          </div>
                        </div>

                        {sec.headingLevel === 3 ? (
                          <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 mb-5 leading-[1.25] flex items-start gap-3">
                            <span className="mt-1.5 w-1.5 h-8 sm:h-10 rounded-full bg-gradient-to-b from-teal-500 to-emerald-500 flex-shrink-0 shadow-sm" />
                            {sec.heading}
                          </h3>
                        ) : (
                          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mb-6 leading-[1.2] flex items-start gap-3 sm:gap-4">
                            <span className="mt-2 w-1.5 sm:w-2 h-10 sm:h-14 rounded-full bg-gradient-to-b from-teal-600 via-teal-500 to-emerald-500 flex-shrink-0 shadow-md shadow-teal-500/30" />
                            {sec.heading}
                          </h2>
                        )}

                        <p className="text-gray-700 text-[15px] sm:text-[17px] leading-[2.2] sm:leading-[2.35] whitespace-pre-line text-justify">
                          {sec.content}
                        </p>

                        {sec.subsections && sec.subsections.length > 0 && (
                          <div className="mt-8 space-y-6 border-t border-dashed border-gray-100 pt-7">
                            {sec.subsections.map((sub, idx) => (
                              <div key={idx} className="relative pl-5 sm:pl-6 border-r-[3px] border-teal-100 pr-4 sm:pr-5 py-1">
                                <div className="absolute top-1.5 -right-[9px] w-4 h-4 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 ring-4 ring-white shadow-md" />
                                <h4 className="font-black text-lg sm:text-xl text-gray-900 mb-2.5 leading-snug">
                                  {sub.heading}
                                </h4>
                                <p className="text-gray-600 leading-[2.1] sm:leading-[2.25] text-[14.5px] sm:text-base">
                                  {sub.content}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-7 pt-6 border-t border-dashed border-gray-100 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs">
                            <span className="inline-flex items-center gap-1.5 text-gray-500">
                              <CheckCircle2 size={13} className="text-emerald-500" />
                              <span>منابع: پروتکل‌های MOHME • WHO • EWMA</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-teal-600">
                            <Sparkles size={13} />
                            مطالعه و استمرار در خواندن محتوا، به انتخاب بهتر شما کمک می‌کند
                          </div>
                        </div>
                      </div>
                    </article>

                    {/* Embedded CTA Banner Between Sections */}
                    {showCtaBannerAfter && (
                      <div className="my-10 sm:my-14">
                        <div className="relative overflow-hidden rounded-[2rem] p-7 sm:p-9 lg:p-10 bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-700 text-white shadow-2xl shadow-teal-700/25">
                          <div className="absolute inset-0 opacity-25 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 10% 10%, white 0%, transparent 45%), radial-gradient(circle at 90% 90%, white 0%, transparent 45%)' }} />
                          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
                          <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-emerald-300/20 blur-3xl" />

                          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
                            <div className="flex-1 lg:max-w-2xl">
                              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur border border-white/25 text-[10px] sm:text-xs font-black uppercase tracking-wider mb-4 sm:mb-5">
                                <Zap size={13} className="text-amber-300" />
                                پیشنهاد ویژه کاربران عزیز
                              </div>
                              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-[1.2] mb-3 sm:mb-4">
                                تا پایان مطالعه منتظر نمانید
                                <br className="hidden sm:block" />
                                همین حالا خدمت «{service.serviceDefinition?.title}» را درخواست کنید
                              </h3>
                              <p className="text-teal-50/90 text-base sm:text-lg leading-[2] mb-0">
                                مشاوره اولیه رایگان است؛ کارشناسان ما کمتر از ۳۰ دقیقه با شما تماس می‌گیرند و بهترین برنامه را متناسب با نیاز شما پیشنهاد می‌دهند.
                              </p>
                            </div>

                            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto lg:min-w-[240px]">
                              <Link href="#guest-request-form" className="group inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-white text-teal-700 font-black shadow-xl hover:shadow-2xl hover:scale-[1.03] active:scale-[0.99] transition-all duration-300 text-base sm:text-lg whitespace-nowrap">
                                <HandHeart size={20} />
                                {service.primaryCtaText || 'درخواست فوری خدمات'}
                                <ArrowRight size={17} className="transition-transform duration-300 group-hover:-translate-x-1" />
                              </Link>
                              <a href="tel:09128718237" className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/30 text-white font-black hover:bg-white/25 hover:border-white/40 transition-all duration-300 text-base sm:text-lg whitespace-nowrap">
                                <Phone size={20} />
                                تماس فوری با مشاور
                              </a>
                            </div>
                          </div>

                          <div className="relative mt-7 sm:mt-8 pt-6 sm:pt-7 border-t border-white/20 flex flex-wrap items-center gap-x-6 gap-y-3">
                            {[
                              'ارسال پرستار در کمتر از ۲ ساعت',
                              'مشاوره رایگان قبل از سفارش',
                              'تضمین کیفیت خدمات',
                            ].map((t, i) => (
                              <span key={i} className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-white/90">
                                <Award size={13} className="text-amber-300" />
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Process: How to Submit Request */}
      <section className="py-16 border-t border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center max-w-2xl mx-auto">
            <p className="text-xs font-black text-teal-600 uppercase tracking-wider mb-3 inline-block bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-full">
              فرآیند دریافت خدمت
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
              در ۴ مرحله ساده، پرستار مناسب خود را دریافت کنید
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { n: 1, t: 'ثبت درخواست آنلاین', d: 'فرم زیر را با اطلاعات پایه تکمیل کنید. ثبت‌نام لازم نیست.', icon: '📝' },
              { n: 2, t: 'تماس کارشناس', d: 'کارشناس ما ظرف ۳۰ دقیقه با شما تماس می‌گیرد و جزئیات را تأیید می‌کند.', icon: '📞' },
              { n: 3, t: 'ارسال پرستار متخصص', d: 'پرستار با کیت استریل و کد رهگیری در ساعت مقرر در منزل حاضر می‌شود.', icon: '🏥' },
              { n: 4, t: 'پشتیبانی تا پایان', d: 'گزارش‌دهی بعد از هر مراجعه و پشتیبانی ۲۴ ساعته تیم پزشکی.', icon: '🤝' },
            ].map(p => (
              <div
                key={p.n}
                className="relative p-6 rounded-3xl bg-white border border-gray-100 hover:border-teal-200 hover:shadow-xl transition-all group"
              >
                <div className="absolute top-4 right-4 w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 text-white font-black flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-110 transition">
                  {p.n}
                </div>
                <div className="text-4xl mb-4">{p.icon}</div>
                <h3 className="font-black text-xl text-gray-900 mb-2">{p.t}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inline Guest Request Wizard (id="#guest-request-form" for CTA anchoring) */}
      <section id="guest-request-form" className="relative py-10 sm:py-16 border-t border-gray-100 bg-gradient-to-br from-teal-50/60 via-white to-blue-50/30 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-teal-200/25 blur-3xl" />
          <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full bg-emerald-200/25 blur-3xl" />
        </div>
        <div className="container relative mx-auto px-3 sm:px-6 lg:px-8 min-w-0 w-full overflow-x-hidden">
          <div className="mb-6 sm:mb-10 text-center max-w-2xl mx-auto">
            <p className="text-[10.5px] sm:text-xs font-black text-teal-700 uppercase tracking-wider mb-2 sm:mb-3 inline-flex items-center gap-1 sm:gap-1.5 bg-white border border-teal-200 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full shadow-sm">
              🟢 بدون ثبت‌نام • ⚡ کمتر از ۲ دقیقه
            </p>
            <h2 className="text-xl sm:text-4xl font-black text-slate-900 leading-[1.2] mb-2 sm:mb-4">
              درخواست پرستار فوری برای
              <span className="block sm:inline mt-0.5 sm:mt-0 mx-1 text-transparent bg-clip-text bg-gradient-to-br from-teal-600 to-emerald-600">
                «{service.serviceDefinition?.title}»
              </span>
            </h2>
            <p className="text-slate-600 text-[13px] sm:text-[17px] leading-7 sm:leading-8 px-1 sm:px-0">
              فرم زیر را تکمیل کنید؛ کارشناسان سالمندیار در کوتاه‌ترین زمان با شما تماس می‌گیرند.
            </p>
          </div>

          <div className="w-full min-w-0 max-w-full overflow-x-hidden">
            <GuestRequestWizard
              serviceDefinitionId={service.serviceDefinitionId}
              source="organic"
              landingPage={`/services/${service.slug}`}
              serviceSlug={service.slug}
            />
          </div>
        </div>
      </section>

      {/* Related Services: Internal Linking */}
      {(relatedFallback.length > 0) && (
        <section className="py-16 border-t border-gray-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center max-w-2xl mx-auto">
              <p className="text-xs font-black text-teal-600 uppercase tracking-wider mb-3 inline-block bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-full">
                خدمات مرتبط
              </p>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
                ممکن است به این خدمات هم نیاز داشته باشید
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedFallback.map(s => (
                <a
                  key={s.id}
                  href={`/services/${s.slug}`}
                  className="group p-6 rounded-3xl bg-white border border-gray-100 hover:shadow-2xl hover:border-teal-100 hover:-translate-y-1 transition-all block"
                >
                  <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden bg-gradient-to-br from-teal-50 to-blue-50 mb-5">
                    {s.heroImageUrl && (
                      <img
                        src={s.heroImageUrl}
                        alt={s.serviceDefinition?.title || s.slug}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    )}
                  </div>
                  <p className="text-[10px] font-black text-teal-600 mb-2 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-teal-500" />
                    {s.primaryKeyword || s.serviceDefinition?.category || 'خدمات پرستاری'}
                  </p>
                  <h3 className="font-black text-xl text-gray-900 mb-2 group-hover:text-teal-700 transition leading-tight">
                    {s.serviceDefinition?.title || s.slug}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-4">
                    {s.longDescription || s.metaDescription}
                  </p>
                  <div className="flex items-center gap-1 font-bold text-teal-700 text-sm group-hover:gap-2 transition-all">
                    مشاهده خدمت
                    <span>←</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
