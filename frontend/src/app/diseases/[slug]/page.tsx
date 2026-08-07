import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  AlertTriangle,
  ShieldCheck,
  HeartPulse,
  Pill,
  Stethoscope,
  ChevronLeft,
  Clock,
  Phone,
  FileText,
  Sparkles,
  Target,
  CheckCircle2,
  User,
  Calendar,
} from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Breadcrumb from '@/components/seo/Breadcrumb';
import { DiseaseSchema, FAQSchema } from '@/lib/seo/structured-data';
import { listDiseases, getDiseaseBySlug, listArticles, listServicesWithSeo, listAuthors } from '@/lib/content-api';
import type { Disease } from '@/lib/types/content';

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  try {
    const result = await listDiseases({ pageSize: 100 });
    return (result?.items || []).map((d: any) => ({ slug: d.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const disease = await getDiseaseBySlug(slug);
  if (!disease) return { title: 'بیماری یافت نشد' };
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://salmandyar.com';
  return {
    title: disease.metaTitle || `${disease.name}؛ علائم، درمان و مراقبت در منزل`,
    description: disease.metaDescription || disease.shortDescription,
    keywords: [
      disease.primaryKeyword || disease.name,
      disease.name,
      'علائم ' + disease.name,
      'درمان ' + disease.name,
      ...(disease.symptoms || []).slice(0, 3),
    ].filter(Boolean),
    alternates: { canonical: `/diseases/${disease.slug}` },
    openGraph: {
      title: disease.metaTitle,
      description: disease.metaDescription || disease.shortDescription,
      type: 'article',
      url: `/diseases/${disease.slug}`,
      images: disease.ogImageUrl ? [disease.ogImageUrl] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: disease.metaTitle,
      description: disease.metaDescription,
      images: disease.ogImageUrl ? [disease.ogImageUrl] : undefined,
    },
  };
}

export default async function DiseaseDetailPage({ params }: Params) {
  const { slug } = await params;
  const [diseaseResult, articlesResult, servicesSeo, authorsList] = await Promise.all([
    getDiseaseBySlug(slug),
    listArticles({ pageSize: 200 }),
    listServicesWithSeo(),
    listAuthors(),
  ]);

  const disease = diseaseResult;
  if (!disease) notFound();
  const d: Disease = disease;

  const relatedArticles = (articlesResult?.items || []).filter((a: any) => a.diseaseId === d.id || a.tags?.some((t: any) => t.slug === d.slug)).slice(0, 4);
  const relatedServices = (servicesSeo || []).filter(s =>
    (s.targetPatients || []).some(tp => tp.relatedDiseaseId === d.id) ||
    (s.faqs || []).some(f => f.answer.includes(d.name))
  ).slice(0, 3);

  const medicalReviewer = d.medicalReviewer || (authorsList || []).find((a: any) => a.isMedicalReviewer);

  function severityColor(level: number) {
    if (level >= 80) return { bar: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700', label: 'شدید', pct: Math.min(level, 100) };
    if (level >= 60) return { bar: 'bg-orange-500', bg: 'bg-orange-50', text: 'text-orange-700', label: 'متوسط به بالا', pct: Math.min(level, 100) };
    if (level >= 40) return { bar: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700', label: 'متوسط', pct: Math.min(level, 100) };
    return { bar: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-700', label: 'خفیف', pct: Math.min(level, 100) };
  }

  const sev = severityColor(d.severityLevel || 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <DiseaseSchema disease={d} />
      {d.faqs && d.faqs.length > 0 && <FAQSchema faqs={d.faqs} pageUrl={`/diseases/${d.slug}`} />}
      <Navbar />

      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[
            { name: 'راهنمای بیماری‌ها', href: '/diseases' },
            { name: d.name, href: `/diseases/${d.slug}` },
          ]} />

          <div className="relative bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 rounded-3xl overflow-hidden mb-10 shadow-2xl">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_left,white,transparent_60%)]" />
            <div className="relative p-8 sm:p-12 lg:p-14">
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${sev.bg} ${sev.text}`}>
                  شدت بیماری: {sev.label}
                </span>
                {d.icd10Code && (
                  <span className="px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-bold border border-white/20 font-mono">
                    ICD-10: {d.icd10Code}
                  </span>
                )}
                {d.requiresImmediateMedicalAttention && (
                  <span className="px-3 py-1 rounded-full bg-red-500 text-white text-xs font-bold flex items-center gap-1 animate-pulse">
                    <AlertTriangle size={12} /> نیاز به مراجعه فوری
                  </span>
                )}
                <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 text-xs font-bold border border-teal-400/30 flex items-center gap-1">
                  <ShieldCheck size={12} /> محتوای تأیید پزشکی
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-5 leading-tight">
                    {d.name}
                  </h1>
                  <p className="text-lg sm:text-xl text-white/80 leading-relaxed mb-8 max-w-3xl">
                    {d.definition || d.shortDescription}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/portal/home-care/request"
                      className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-white text-teal-700 font-bold hover:bg-gray-50 transition shadow-xl"
                    >
                      درخواست مراقبت تخصصی
                    </Link>
                    <a
                      href="tel:02112345678"
                      className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-white/10 backdrop-blur text-white font-bold hover:bg-white/20 transition border border-white/20"
                    >
                      <Phone size={18} /> مشاوره رایگان
                    </a>
                  </div>
                </div>
                <div className="lg:col-span-4">
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-white/80 mb-1.5 font-bold">
                        <span>شدت بیماری</span>
                        <span>{sev.pct}%</span>
                      </div>
                      <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full ${sev.bar} rounded-full transition-all duration-1000`} style={{ width: `${sev.pct}%` }} />
                      </div>
                    </div>
                    {d.severityLevel !== undefined && (
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                          <div className="text-white/60 text-xs mb-1">شدت</div>
                          <div className="font-black text-white">{sev.label}</div>
                        </div>
                        <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                          <div className="text-white/60 text-xs mb-1">رفتار</div>
                          <div className="font-black text-white">{d.requiresImmediateMedicalAttention ? 'فوری' : 'مدیریت‌پذیر'}</div>
                        </div>
                      </div>
                    )}
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
                    <AlertTriangle size={24} />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900">علائم شایع {d.name}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(d.symptoms || []).map((s, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50/40 border border-blue-100/50 hover:bg-blue-50 transition">
                      <CheckCircle2 size={20} className="text-blue-600 mt-0.5 shrink-0" />
                      <p className="text-sm text-gray-800 leading-relaxed font-medium">{s}</p>
                    </div>
                  ))}
                  {(!d.symptoms || d.symptoms.length === 0) && (
                    <p className="text-gray-500">اطلاعات علائم وارد نشده است.</p>
                  )}
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                      <HeartPulse size={22} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900">علل اصلی بیماری</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {(d.causes || []).map((c, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Target size={22} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900">عوامل خطرزا</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {(d.riskFactors || []).map((r, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Stethoscope size={22} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900">روش‌های تشخیص</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {(d.diagnosis || []).map((dg, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                        <span>{dg}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                      <Pill size={22} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900">روش‌های درمان</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {(d.treatment || []).map((t, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              <section className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-7 sm:p-8 border border-emerald-100">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-white text-emerald-600 flex items-center justify-center shadow-sm">
                    <Sparkles size={24} />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900">راه‌های پیشگیری</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(d.prevention || []).map((p, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-white/60 border border-white hover:bg-white transition">
                      <CheckCircle2 size={20} className="text-emerald-600 mt-0.5 shrink-0" />
                      <p className="text-sm text-gray-800 leading-relaxed font-medium">{p}</p>
                    </div>
                  ))}
                </div>
              </section>

              {d.homeCareInstructions && (
                <section className="bg-white rounded-3xl p-7 sm:p-8 border-2 border-teal-100 shadow-sm relative overflow-hidden">
                  <div className="absolute -top-8 -left-8 w-40 h-40 bg-teal-100/40 rounded-full blur-3xl" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-teal-500 text-white flex items-center justify-center shadow-lg shadow-teal-500/20">
                        <FileText size={24} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-gray-900">راهنمای مراقبت در منزل</h2>
                        <p className="text-sm text-gray-500">توصیه‌های پرستاران سالمندیار</p>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-loose text-base">{d.homeCareInstructions}</p>
                  </div>
                </section>
              )}

              {d.faqs && d.faqs.length > 0 && (
                <section className="bg-white rounded-3xl p-7 sm:p-8 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <FileText size={24} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900">سوالات متداول درباره {d.name}</h2>
                  </div>
                  <div className="space-y-3">
                    {d.faqs.sort((a, b) => a.displayOrder - b.displayOrder).map(faq => (
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
              )}

              {medicalReviewer && (
                <section className="bg-gradient-to-r from-teal-600 to-blue-700 rounded-3xl p-7 sm:p-8 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_bottom_right,white,transparent_60%)]" />
                  <div className="relative grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                    <div className="sm:col-span-3 flex sm:justify-center">
                      {medicalReviewer.profileImageUrl ? (
                        <img
                          src={medicalReviewer.profileImageUrl}
                          alt={medicalReviewer.fullName}
                          className="w-28 h-28 rounded-3xl object-cover border-4 border-white/20 shadow-xl"
                        />
                      ) : (
                        <div className="w-28 h-28 rounded-3xl bg-white/20 flex items-center justify-center">
                          <User size={40} />
                        </div>
                      )}
                    </div>
                    <div className="sm:col-span-9">
                      <div className="text-xs opacity-80 font-bold mb-1 uppercase tracking-wider">
                        بررسی و تأیید پزشکی
                      </div>
                      <h3 className="text-2xl font-black mb-1">
                        {medicalReviewer.title} {medicalReviewer.fullName}
                      </h3>
                      <div className="opacity-90 mb-3 text-sm">
                        {medicalReviewer.specialization}
                        {medicalReviewer.yearsOfExperience ? ` • ${medicalReviewer.yearsOfExperience} سال تجربه` : ''}
                        {medicalReviewer.medicalLicenseNumber ? ` • شماره پروانه: ${medicalReviewer.medicalLicenseNumber}` : ''}
                      </div>
                      {medicalReviewer.biography && (
                        <p className="opacity-90 leading-relaxed text-sm line-clamp-2 mb-4">{medicalReviewer.biography}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20">
                          <ShieldCheck size={14} /> محتوای ویرایش شده پزشکی
                        </span>
                        {d.icd10Code && (
                          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 font-mono">
                            <Calendar size={14} /> کد ICD-10: {d.icd10Code}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </div>

            <div className="lg:col-span-4 space-y-5">
              <div className="bg-white rounded-3xl p-6 border-2 border-teal-100 shadow-sm sticky top-28">
                <div className="bg-gradient-to-br from-teal-500 to-blue-600 -m-6 mb-5 p-6 rounded-t-3xl text-white">
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold opacity-90">
                    <ShieldCheck size={14} /> نیاز به مراقبت دارید؟
                  </div>
                  <h3 className="text-xl font-black mb-3 leading-tight">
                    مراقبت تخصصی {d.name} در منزل
                  </h3>
                  <p className="text-sm opacity-90 mb-4 leading-relaxed">
                    پرستاران متخصص سالمندیار، مراقبت کامل از بیمار {d.name} را در منزل انجام می‌دهند.
                  </p>
                </div>
                <div className="space-y-2.5 mb-5">
                  <div className="flex items-center gap-2.5 text-sm text-gray-700">
                    <CheckCircle2 size={18} className="text-teal-600 shrink-0" />
                    پرستاران دارای مجوز و تایید شده وزارت بهداشت
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-700">
                    <CheckCircle2 size={18} className="text-teal-600 shrink-0" />
                    شیفت‌های صبح، شب و ۲۴ ساعته
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-700">
                    <CheckCircle2 size={18} className="text-teal-600 shrink-0" />
                    گزارش روزانه از وضعیت بیمار
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-700">
                    <CheckCircle2 size={18} className="text-teal-600 shrink-0" />
                    امکان جایگزینی پرستار تا ۴۸ ساعت
                  </div>
                </div>
                <div className="space-y-2.5">
                  <Link
                    href="/portal/home-care/request"
                    className="block w-full h-12 rounded-xl bg-gradient-to-l from-teal-500 to-teal-600 text-white font-bold text-center leading-[3rem] hover:shadow-lg hover:shadow-teal-500/20 transition"
                  >
                    درخواست مراقبت
                  </Link>
                  <a
                    href="tel:02112345678"
                    className="block w-full h-12 rounded-xl bg-gray-50 text-gray-800 font-bold text-center leading-[3rem] border border-gray-200 hover:bg-gray-100 transition flex items-center justify-center gap-2"
                  >
                    <Phone size={16} /> ۰۲۱-۱۲۳۴۵۶۷۸
                  </a>
                </div>
              </div>

              {relatedServices.length > 0 && (
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                  <h4 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-500" /> خدمات مرتبط
                  </h4>
                  <div className="space-y-3">
                    {relatedServices.map(srv => (
                      <Link
                        key={srv.id}
                        href={`/services/${srv.slug}`}
                        className="flex items-center justify-between p-3 rounded-2xl hover:bg-teal-50 border border-gray-100 transition group"
                      >
                        <div>
                          <div className="font-bold text-sm text-gray-900 group-hover:text-teal-700 transition">
                            {srv.serviceDefinition?.title}
                          </div>
                          {srv.priceRangeText && (
                            <div className="text-xs text-gray-500 mt-0.5">{srv.priceRangeText}</div>
                          )}
                        </div>
                        <ChevronLeft size={18} className="text-gray-400 group-hover:-translate-x-1 group-hover:text-teal-600 transition" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {relatedArticles.length > 0 && (
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                  <h4 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> مقالات مرتبط
                  </h4>
                  <div className="space-y-3.5">
                    {relatedArticles.map(art => (
                      <Link
                        key={art.id}
                        href={`/articles/${art.slug}`}
                        className="flex gap-3 p-2 rounded-2xl hover:bg-amber-50 transition group"
                      >
                        {art.featuredImageUrl && (
                          <img
                            src={art.featuredImageUrl}
                            alt={art.title}
                            className="w-20 h-16 rounded-xl object-cover shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-sm text-gray-900 group-hover:text-amber-700 transition line-clamp-2 leading-snug">
                            {art.title}
                          </h5>
                          <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
                            <Clock size={12} />
                            <span>{art.estimatedReadingTimeMinutes || 5} دقیقه</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
