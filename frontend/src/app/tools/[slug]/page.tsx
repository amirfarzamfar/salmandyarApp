import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Calculator,
  ShieldCheck,
  ChevronLeft,
  Phone,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sparkles,
  Activity,
  ListChecks,
  Droplets,
  BedDouble,
  ClipboardList,
  Scale,
} from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Breadcrumb from '@/components/seo/Breadcrumb';
import { FAQSchema, DrugCalculatorsCollectionSchema, type DrugCalcSchemaItem } from '@/lib/seo/structured-data';
import BmiCalculatorTool from '@/components/tools/BmiCalculatorTool';
import GcsCalculatorTool from '@/components/tools/GcsCalculatorTool';
import DripRateCalculatorTool from '@/components/tools/DripRateCalculatorTool';
import BradenScaleTool from '@/components/tools/BradenScaleTool';
import DailyCareChecklistTool from '@/components/tools/DailyCareChecklistTool';
import DrugDosageCalculatorPageClient from '@/components/tools/DrugDosageCalculatorPageClient';
import DrugCalculatorSidebarNav from '@/components/tools/DrugCalculatorSidebarNav';
import DrugCalculatorBreadcrumb from '@/components/tools/DrugCalculatorBreadcrumb';
import type { HealthTool, FAQItem } from '@/lib/types/content';
import { listTools, getToolBySlug, listArticles, listServicesWithSeo, getFeaturedTools } from '@/lib/content-api';
import { DRUG_TAB_ORDER, getDrugContent } from '@/lib/data/drug-content';

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const tools = await listTools();
  if (!tools || tools.length === 0) return [];
  return tools.map(t => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);
  if (!tool) return {};

  if (slug === 'drug-dosage-calculator') {
    const allNames = DRUG_TAB_ORDER.map(t => getDrugContent(t).persianName);
    const allTitles = allNames.join('، ');
    const extraKeywords = [
      ...allNames.flatMap(n => [`محاسبه ${n}`, `${n} ابزار`, `${n} فرمول`]),
      ...DRUG_TAB_ORDER.flatMap(t => getDrugContent(t).units),
    ].filter(Boolean);
    const finalKeywords = [
      'محاسبات دارویی',
      'ماشین حساب دارویی',
      'محاسبه دوز دارو',
      'محاسبه انفوزیون',
      'ابزار ICU',
      'ابزار پرستاری',
      'محاسبه دوپامین',
      'محاسبه هپارین',
      'محاسبه اپی نفرین',
      'قطره سرم',
      'سرعت پمپ انفوزیون',
      'mcg/kg/min',
      allTitles,
      ...extraKeywords,
    ];

    return {
      title: 'ماشین حساب محاسبات دارویی | ۱۳ ابزار پرستاری و ICU',
      description: '۱۳ ماشین‌حساب دارویی اختصاصی برای دوپامین، هپارین، اپی نفرین، نیتروگلیسیرین، آمیودارون، پنتاپرازول، میدازولام، فنتانیل، اکتریوتاید، قطره سرم، داروهای درصدی، مبدل واحد و محاسبه عمومی. رایگان و بدون ثبت نام.',
      keywords: finalKeywords,
      alternates: { canonical: tool.canonicalUrl || '/tools/drug-dosage-calculator' },
      openGraph: {
        title: 'ماشین حساب محاسبات دارویی | ۱۳ ابزار اختصاصی ICU',
        description: 'مجموعه‌ای ۱۳ تایی از ماشین‌حساب‌های پرکاربرد دارویی پرستاری و اورژانس شامل دوپامین، هپارین، اپی نفرین، فنتانیل، میدازولام، قطره سرم و مبدل واحد با توضیح فرمول و پاسخ سوالات متداول.',
        type: 'website',
        url: tool.canonicalUrl || '/tools/drug-dosage-calculator',
        images: tool.ogImageUrl || tool.coverImageUrl ? [tool.ogImageUrl || tool.coverImageUrl || ''] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: 'ماشین حساب محاسبات دارویی | ۱۳ ابزار پرستاری',
        description: '۱۳ ماشین‌حساب دارویی رایگان برای پرستاران ICU و اورژانس همراه با توضیح فرمول و سوالات متداول.',
        images: tool.twitterImageUrl || tool.coverImageUrl ? [tool.twitterImageUrl || tool.coverImageUrl || ''] : undefined,
      },
    };
  }

  const extraKeywords = [tool.primaryKeyword || '', ...(tool.secondaryKeywords || [])].filter(Boolean);
  const finalKeywords = [tool.name, tool.shortDescription || '', ...extraKeywords].filter(Boolean);
  const canonical = tool.canonicalUrl || `/tools/${tool.slug}`;
  const ogImage = tool.ogImageUrl || tool.coverImageUrl;
  const twImage = tool.twitterImageUrl || tool.coverImageUrl;

  return {
    title: tool.metaTitle || `${tool.name} | ابزار رایگان سالمندیار`,
    description: tool.metaDescription || tool.shortDescription,
    keywords: finalKeywords,
    alternates: { canonical },
    openGraph: {
      title: tool.metaTitle,
      description: tool.metaDescription || tool.shortDescription,
      type: 'website',
      url: canonical,
      images: ogImage ? [ogImage] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: tool.metaTitle,
      description: tool.metaDescription || tool.shortDescription,
      images: twImage ? [twImage] : undefined,
    },
  };
}

function getDefaultFAQs(tool: HealthTool): FAQItem[] {
  return [
    {
      id: 1,
      question: `آیا ابزار ${tool.name} رایگان است؟`,
      answer: 'بله، تمام ابزارهای سالمندیار به صورت رایگان و بدون محدودیت در دسترس هستند و نیازی به ثبت نام یا پرداخت هیچ مبلغی نیست.',
      displayOrder: 1,
    },
    {
      id: 2,
      question: `آیا نتیجه ابزار ${tool.name} جایگزین مشاوره پزشک می‌شود؟`,
      answer: 'خیر، این ابزارها صرفاً جهت اطلاع عمومی و کمک به درک بهتر وضعیت هستند و هرگز نباید جایگزین مشاوره، تشخیص و درمان پزشک متخصص قرار گیرند.',
      displayOrder: 2,
    },
    {
      id: 3,
      question: 'آیا اطلاعات من در این ابزار ذخیره می‌شود؟',
      answer: 'نه، تمام محاسبات در مرورگر شما (طرف کاربر) انجام می‌شود و هیچ اطلاعاتی به سرور سالمندیار ارسال یا ذخیره نمی‌شود؛ حریم خصوصی شما کاملاً محفوظ است.',
      displayOrder: 3,
    },
  ];
}

function ToolIcon({ type }: { type: string }) {
  switch (type) {
    case 'Calculator': return <Calculator size={28} />;
    case 'Checklist': return <ListChecks size={28} />;
    case 'Assessment': return <ClipboardList size={28} />;
    default: return <Activity size={28} />;
  }
}

function renderTool(slug: string) {
  switch (slug) {
    case 'bmi-calculator': return <BmiCalculatorTool />;
    case 'drug-dosage-calculator': return <DrugDosageCalculatorPageClient />;
    case 'gcs-calculator': return <GcsCalculatorTool />;
    case 'drip-rate-calculator': return <DripRateCalculatorTool />;
    case 'braden-scale-pressure-ulcer-risk': return <BradenScaleTool />;
    case 'daily-care-checklist': return <DailyCareChecklistTool />;
    default:
      return (
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-dashed border-gray-200 text-center">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-teal-500 to-blue-600 text-white flex items-center justify-center mb-5 shadow-xl shadow-teal-500/20">
            <Sparkles size={40} />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-3">این ابزار به زودی فعال می‌شود</h3>
          <p className="text-gray-600 max-w-xl mx-auto leading-relaxed mb-6">
            تیم توسعه سالمندیار در حال فعال‌سازی کامل این ابزار با استانداردهای پزشکی معتبر است. در عین حال می‌توانید از ابزارهای فعال زیر استفاده کنید.
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {[
              { slug: 'bmi-calculator', label: 'محاسبه BMI', icon: <Scale size={15} /> },
              { slug: 'gcs-calculator', label: 'GCS کما گلاسکو', icon: <Brain size={15} /> },
              { slug: 'drip-rate-calculator', label: 'قطره سرم', icon: <Droplets size={15} /> },
              { slug: 'braden-scale-pressure-ulcer-risk', label: 'اسکیل برادن', icon: <BedDouble size={15} /> },
              { slug: 'daily-care-checklist', label: 'چک لیست مراقبت', icon: <ListChecks size={15} /> },
            ].filter(t => t.slug !== slug).map(t => (
              <Link
                key={t.slug}
                href={`/tools/${t.slug}`}
                className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-teal-50 text-teal-700 font-bold text-sm hover:bg-teal-100 transition border border-teal-100"
              >
                {t.icon} {t.label}
              </Link>
            ))}
          </div>
        </div>
      );
  }
}

function Brain({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.04Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.04Z" />
    </svg>
  );
}

export default async function ToolDetailPage({ params }: Params) {
  const { slug } = await params;
  const [toolResult, articlesResult, servicesResult, featuredResult] = await Promise.all([
    getToolBySlug(slug),
    listArticles({ pageSize: 20 }),
    listServicesWithSeo(),
    getFeaturedTools(4),
  ]);
  const tool = toolResult;
  if (!tool) notFound();
  const t: HealthTool = tool;

  const faqs = (t as HealthTool & { faqs?: FAQItem[] }).faqs || getDefaultFAQs(t);
  const relatedServices = servicesResult || [];
  const relatedArticles = articlesResult?.items || [];
  const relatedTools = (featuredResult || []).filter(ht => ht.slug !== t.slug);

  const isDrugCalc = slug === 'drug-dosage-calculator';

  const drugCalcSchemaItems: DrugCalcSchemaItem[] = isDrugCalc
    ? DRUG_TAB_ORDER.map(tab => {
        const c = getDrugContent(tab);
        return {
          slug: c.slug,
          persianName: c.persianName,
          englishName: c.englishName,
          genericName: c.genericName,
          category: c.category,
          seoDescription: c.seoDescription,
          pagePath: `/tools/drug-dosage-calculator#${tab}`,
          units: c.units,
          faqs: c.faqs.map(f => ({ question: f.question, answer: f.answer })),
        };
      })
    : [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {isDrugCalc ? (
        <DrugCalculatorsCollectionSchema items={drugCalcSchemaItems} pagePath="/tools/drug-dosage-calculator" />
      ) : (
        <FAQSchema faqs={faqs} pageUrl={`/tools/${t.slug}`} />
      )}
      <Navbar />

      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {isDrugCalc ? (
            <DrugCalculatorBreadcrumb
              basePageName={t.name}
              basePageHref={`/tools/${t.slug}`}
            />
          ) : (
            <Breadcrumb items={[
              { name: 'ابزارهای سلامت', href: '/tools' },
              { name: t.name, href: `/tools/${t.slug}` },
            ]} />
          )}

          <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl overflow-hidden mb-10 shadow-2xl">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_bottom_right,white,transparent_60%)]" />
            <div className="relative p-8 sm:p-12 lg:p-14">
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur text-white text-xs font-bold border border-white/25 flex items-center gap-1.5">
                  <ToolIcon type={t.toolType} />
                  {t.toolType === 'Calculator' ? 'ماشین حساب' : t.toolType === 'Checklist' ? 'چک لیست' : t.toolType === 'Assessment' ? 'ارزیابی' : t.toolType}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur text-white text-xs font-bold border border-white/25 flex items-center gap-1.5">
                  <ShieldCheck size={13} /> تأیید پزشکی
                </span>
                <span className="px-3 py-1 rounded-full bg-teal-400/30 backdrop-blur text-white text-xs font-bold border border-teal-300/40 flex items-center gap-1.5">
                  ۱۰۰٪ رایگان و بدون ثبت نام
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-5 leading-tight">
                    {t.name}
                  </h1>
                  {(t.shortDescription || t.description) && (
                    <p className="text-lg sm:text-xl text-white/85 leading-relaxed mb-8 max-w-3xl">
                      {t.description || t.shortDescription}
                    </p>
                  )}
                  {t.howToUse && (
                    <div className="flex flex-wrap items-start gap-3 p-4 rounded-2xl bg-white/10 backdrop-blur border border-white/20 max-w-2xl">
                      <div className="w-8 h-8 rounded-full bg-white/15 shrink-0 flex items-center justify-center">
                        <FileText size={15} className="text-white" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-white/80 mb-1 uppercase tracking-wider">نحوه استفاده</div>
                        <p className="text-sm text-white/90 leading-relaxed">{t.howToUse}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="lg:col-span-4">
                  <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20">
                    <div className="text-white/80 text-xs font-bold mb-3 uppercase tracking-wider">
                      ویژگی‌های این ابزار
                    </div>
                    <div className="space-y-2.5">
                      {[
                        'محاسبه فوری و لحظه‌ای',
                        'تفسیر متخصصانه نتیجه',
                        'پیشنهادهای عملی سلامت',
                        'بدون نیاز به ثبت نام',
                        'بدون ذخیره اطلاعات شخصی',
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-white/90">
                          <CheckCircle2 size={17} className="text-yellow-300 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-3xl p-0 sm:p-2 border border-gray-100 shadow-sm overflow-hidden">
                <div className="rounded-[22px] bg-gradient-to-br from-slate-50 to-white border border-gray-100 p-5 sm:p-8 lg:p-10">
                  {renderTool(t.slug)}
                </div>
              </div>

              {t.interpretationGuide && (
                <section className="bg-white rounded-3xl p-7 sm:p-8 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Sparkles size={24} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900">راهنمای تفسیر نتایج</h2>
                  </div>
                  <p className="text-gray-700 leading-loose">{t.interpretationGuide}</p>
                </section>
              )}

              {t.disclaimers && (
                <section className="bg-gradient-to-br from-amber-50 via-white to-red-50 rounded-3xl p-7 sm:p-8 border border-amber-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                      <AlertTriangle size={24} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900">سلب مسئولیت و توصیه مهم</h2>
                  </div>
                  <p className="text-gray-700 leading-loose">{t.disclaimers}</p>
                </section>
              )}

              {!isDrugCalc && (
                <section className="bg-white rounded-3xl p-7 sm:p-8 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <FileText size={24} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900">سوالات متداول درباره {t.name}</h2>
                  </div>
                  <div className="space-y-3">
                    {faqs.sort((a, b) => a.displayOrder - b.displayOrder).map((faq, i) => (
                      <details key={faq.id || i} className="group rounded-2xl bg-gray-50 border border-gray-100 p-5 open:bg-indigo-50/40 open:border-indigo-100 transition">
                        <summary className="flex items-center justify-between cursor-pointer font-bold text-gray-900 list-none">
                          <span className="flex items-center gap-3">
                            <span className="w-8 h-8 shrink-0 rounded-full bg-white border border-gray-200 group-open:bg-indigo-500 group-open:border-indigo-500 text-gray-500 group-open:text-white flex items-center justify-center text-sm font-black transition">
                              {faq.displayOrder || i + 1}
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
            </div>

            <div className="lg:col-span-4 space-y-5">
              {isDrugCalc && <DrugCalculatorSidebarNav />}
              <div className="bg-white rounded-3xl p-6 border-2 border-purple-100 shadow-sm sticky top-28">
                <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 -m-6 mb-5 p-6 rounded-t-3xl text-white">
                  <div className="flex items-center gap-2 text-xs font-bold opacity-90 mb-2">
                    <Activity size={14} /> نیاز به مشاوره بیشتر؟
                  </div>
                  <h3 className="text-xl font-black mb-3 leading-tight">
                    مشاوره رایگان پزشکی و پرستاری
                  </h3>
                  <p className="text-sm opacity-90 mb-4 leading-relaxed">
                    اگر در مورد نتیجه ابزار سؤالی دارید یا به راهنمایی بیشتر نیاز دارید، با تیم ما تماس بگیرید.
                  </p>
                </div>
                <div className="space-y-2.5 mb-5">
                  {[
                    'پاسخگویی ۲۴ ساعته ۷ روز هفته',
                    'تیم متخصص پزشکی و پرستاری',
                    'مشاوره کاملاً رایگان و بی‌درنگ',
                    'ارائه پیشنهاد درمانی مناسب وضعیت شما',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <CheckCircle2 size={17} className="text-purple-600 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2.5">
                  <Link
                    href="/portal/home-care/request"
                    className="block w-full h-12 rounded-xl bg-gradient-to-l from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-center leading-[3rem] hover:shadow-lg hover:shadow-purple-500/20 transition"
                  >
                    درخواست مشاوره رایگان
                  </Link>
                  <a
                    href="tel:09128718237"
                    className="block w-full h-12 rounded-xl bg-gray-50 text-gray-800 font-bold text-center leading-[3rem] border border-gray-200 hover:bg-gray-100 transition flex items-center justify-center gap-2"
                  >
                    <Phone size={16} /> ۰۹۱۲۸۷۱۸۲۳۷
                  </a>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <h4 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500" /> ابزارهای پیشنهادی دیگر
                </h4>
                <div className="space-y-2.5">
                  {relatedTools.slice(0, 4).map(ht => (
                    <Link
                      key={ht.id}
                      href={`/tools/${ht.slug}`}
                      className="flex items-center justify-between gap-3 p-3 rounded-2xl hover:bg-purple-50 border border-gray-100 transition group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${
                          ht.toolType === 'Calculator'
                            ? 'bg-blue-50 text-blue-600'
                            : ht.toolType === 'Checklist'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-purple-50 text-purple-600'
                        }`}>
                          <ToolIcon type={ht.toolType} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-gray-900 group-hover:text-purple-700 transition truncate">
                            {ht.name}
                          </div>
                          {ht.shortDescription && (
                            <div className="text-[11px] text-gray-500 truncate mt-0.5">
                              {ht.shortDescription}
                            </div>
                          )}
                        </div>
                      </div>
                      <ChevronLeft size={16} className="text-gray-400 group-hover:-translate-x-1 group-hover:text-purple-600 transition shrink-0" />
                    </Link>
                  ))}
                </div>
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <Link
                    href="/tools"
                    className="block text-center h-11 rounded-xl bg-gray-50 text-gray-800 font-bold text-sm leading-[2.75rem] hover:bg-gray-100 transition border border-gray-100"
                  >
                    مشاهده تمام ابزارها
                  </Link>
                </div>
              </div>

              {relatedArticles.length > 0 && (
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                  <h4 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-500" /> مقالات مرتبط
                  </h4>
                  <div className="space-y-3.5">
                    {relatedArticles.map(art => (
                      <Link
                        key={art.id}
                        href={`/articles/${art.slug}`}
                        className="flex gap-3 p-2 rounded-2xl hover:bg-teal-50 transition group"
                      >
                        {art.featuredImageUrl && (
                          <img
                            src={art.featuredImageUrl}
                            alt={art.title}
                            className="w-20 h-16 rounded-xl object-cover shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-sm text-gray-900 group-hover:text-teal-700 transition line-clamp-2 leading-snug">
                            {art.title}
                          </h5>
                          <div className="text-xs text-gray-500 mt-1.5">
                            {(art.estimatedReadingTimeMinutes || 5)} دقیقه مطالعه
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
