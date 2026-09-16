'use client';

import { useEffect } from 'react';
import GuestRequestWizard from '@/components/requests/GuestRequestWizard';
import { track } from '@/lib/analytics';
import { ServiceSeoProfile } from '@/lib/types/content';
import { getServiceLandingBySlug } from '@/lib/content-api';
import { useMemo } from 'react';

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

  return (
    <>
      {/* SEO Sections: long-form educational content with H2/H3 hierarchy */}
      {service.seoSections && service.seoSections.length > 0 && (
        <section className="py-16 border-t border-gray-100 bg-gradient-to-b from-white via-slate-50/30 to-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center max-w-2xl mx-auto">
              <p className="text-xs font-black text-teal-600 uppercase tracking-wider mb-3 inline-block bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-full">
                محتوای تخصصی و آموزشی
              </p>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
                هر آنچه باید درباره «{service.serviceDefinition?.title}» بدانید
              </h2>
            </div>

            <div className="max-w-4xl mx-auto space-y-10">
              {service.seoSections
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map(sec => (
                  <article
                    key={sec.id}
                    className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-teal-50 transition-all"
                  >
                    {sec.headingLevel === 3 ? (
                      <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-4 leading-tight">
                        {sec.heading}
                      </h3>
                    ) : (
                      <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-5 leading-tight">
                        {sec.heading}
                      </h2>
                    )}
                    <p className="text-gray-700 text-[15px] sm:text-base leading-[2.1] whitespace-pre-line">
                      {sec.content}
                    </p>
                    {sec.subsections && sec.subsections.length > 0 && (
                      <div className="mt-6 space-y-5 border-t border-gray-100 pt-6">
                        {sec.subsections.map((sub, idx) => (
                          <div key={idx}>
                            <h4 className="font-black text-lg text-gray-800 mb-2">{sub.heading}</h4>
                            <p className="text-gray-600 leading-[2]">{sub.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
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
