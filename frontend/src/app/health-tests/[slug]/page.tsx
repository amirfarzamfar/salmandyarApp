import { Metadata, ResolvingMetadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import {
  HeartPulse,
  ArrowLeft,
  ShieldCheck,
  Users,
  FileText,
  Clock,
  Award,
  BookOpenCheck,
  HandHeart,
} from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Breadcrumb from '@/components/seo/Breadcrumb';
import CategoryFAQ from '@/components/content/CategoryFAQ';
import GuestRequestSection from '@/components/landing/GuestRequestSection';
import {
  HEALTH_TESTS,
  getHealthTestBySlug,
} from '@/lib/health-tests/tests';
import HealthTestFlow from '@/components/health-tests/HealthTestFlow';
import HealthTestCard from '@/components/health-tests/HealthTestCard';
import HealthTestCategorySection from '@/components/health-tests/HealthTestCategorySection';
import HealthTestsCTABanner from '@/components/health-tests/HealthTestsCTABanner';
import TrustSignalsBar from '@/components/health-tests/TrustSignalsBar';
import { Button } from '@/components/ui/Button';
import { FAQSchema } from '@/lib/seo/structured-data';
import type { FAQItem } from '@/lib/types/content';

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return HEALTH_TESTS.map(t => ({ slug: t.slug }));
}

export async function generateMetadata(
  props: { params: Params },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const params = await props.params;
  const test = getHealthTestBySlug(params.slug);
  if (!test) return {};

  const title =
    test.metaTitle ||
    `${test.title} | تست آنلاین رایگان سالمندیار`;
  const description =
    test.metaDescription ||
    `${test.shortDescription} — تست آنلاین رایگان و بدون ثبت‌نام در سالمندیار.`;
  const url = `/health-tests/${test.slug}`;

  const prevOpenGraph = ((await parent).openGraph ?? {}) as Record<string, unknown>;

  return {
    title,
    description,
    keywords: test.metaKeywords || [],
    alternates: { canonical: url },
    openGraph: {
      ...prevOpenGraph,
      title,
      description,
      url,
      type: 'article',
      locale: 'fa_IR',
      siteName: typeof prevOpenGraph.siteName === 'string' ? prevOpenGraph.siteName : 'سالمندیار',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
  };
}

export default async function HealthTestPage(props: { params: Params }) {
  const params = await props.params;
  const test = getHealthTestBySlug(params.slug);
  if (!test) notFound();

  const related = HEALTH_TESTS.filter(t => t.slug !== test.slug).slice(0, 3);
  const faqItems: FAQItem[] = (test.faqs || []).length
    ? (test.faqs as unknown as FAQItem[])
    : DEFAULT_TEST_FAQS(test);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <FAQSchema faqs={faqItems} pageUrl={`/health-tests/${test.slug}`} />
      <HealthTestPageSchema testId={test.id} />

      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { name: 'تست‌های سلامت', href: '/health-tests' },
              { name: test.title, href: `/health-tests/${test.slug}` },
            ]}
          />

          {/* Back link + badges */}
          <section className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/health-tests">
                  <ArrowLeft size={15} />
                  برگشت به همه تست‌ها
                </Link>
              </Button>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-600">
                <Clock size={12} />
                حدود {test.durationMinutes} دقیقه
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[11px] font-bold text-teal-700">
                <Award size={12} />
                {test.questions.length} سؤال تعاملی
              </span>
            </div>
            <div className="hidden sm:flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={13} /> رایگان
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users size={13} /> بدون ثبت نام
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FileText size={13} /> نتیجه فوری
              </span>
            </div>
          </section>

          {/* Trust Signals on mobile */}
          <section className="mb-8 sm:hidden">
            <TrustSignalsBar tone="default" />
          </section>

          {/* Test Flow (client) */}
          <HealthTestFlow slug={test.slug} />

          {/* Related Tests */}
          {related.length > 0 ? (
            <HealthTestCategorySection
              eyebrow="تست‌های پیشنهادی"
              title="این تست‌ها را هم انجام دهید"
              description="پس از تکمیل این تست، می‌توانید موارد زیر را هم برای تصویر کلی‌تر بررسی کنید."
              className="mt-16"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {related.map(rt => (
                  <HealthTestCard key={rt.id} test={rt} />
                ))}
              </div>
            </HealthTestCategorySection>
          ) : null}

          {/* More links: Articles / Tools / Services */}
          <HealthTestCategorySection
            eyebrow="بیشتر بخوانید"
            title="راهنمای خانواده‌ها برای مراقبت بهتر"
            description="از مقالات آموزشی، ابزارهای پرستاری و خدمات مراقبت در منزل سالمندیار استفاده کنید."
            className="mt-16"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
              <Link
                href="/articles"
                className="group rounded-3xl p-6 border-2 border-slate-100 bg-white hover:border-transparent hover:shadow-xl transition-all duration-500 overflow-hidden focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-sky-600 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition mb-4 ring-8 ring-teal-500/10">
                  <BookOpenCheck size={26} strokeWidth={2.3} />
                </div>
                <h3 className="font-black text-xl text-slate-900 mb-2">مجله سلامت سالمندیار</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4 min-h-[48px] line-clamp-2">
                  مقالات روزانه در زمینه سالمندی سالم، پیشگیری از بیماری‌ها و مراقبت درست از سالمند خانواده.
                </p>
                <span className="inline-flex items-center gap-1.5 font-bold text-teal-700 text-sm group-hover:-translate-x-1 transition">
                  مشاهده مقالات
                  <ArrowLeft size={14} />
                </span>
              </Link>

              <Link
                href="/tools"
                className="group rounded-3xl p-6 border-2 border-slate-100 bg-white hover:border-transparent hover:shadow-xl transition-all duration-500 overflow-hidden focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition mb-4 ring-8 ring-violet-500/10">
                  <HeartPulse size={26} strokeWidth={2.3} />
                </div>
                <h3 className="font-black text-xl text-slate-900 mb-2">ابزارهای سلامت</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4 min-h-[48px] line-clamp-2">
                  ماشین حساب BMI، قطره سرم، برادن اسکیل، محاسبه دوز دارو و چک لیست‌های پرستاری روزانه.
                </p>
                <span className="inline-flex items-center gap-1.5 font-bold text-violet-700 text-sm group-hover:-translate-x-1 transition">
                  مشاهده ابزارها
                  <ArrowLeft size={14} />
                </span>
              </Link>

              <Link
                href="/services"
                className="group rounded-3xl p-6 border-2 border-slate-100 bg-white hover:border-transparent hover:shadow-xl transition-all duration-500 overflow-hidden focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition mb-4 ring-8 ring-rose-500/10">
                  <HandHeart size={26} strokeWidth={2.3} />
                </div>
                <h3 className="font-black text-xl text-slate-900 mb-2">خدمات مراقبت در منزل</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4 min-h-[48px] line-clamp-2">
                  پرستار و مراقب معتمد در شیفت روزانه، شبانه‌روزی و نیم‌روزه؛ با مشاوره رایگان و تعهد کتبی.
                </p>
                <span className="inline-flex items-center gap-1.5 font-bold text-rose-700 text-sm group-hover:-translate-x-1 transition">
                  مشاهده خدمات
                  <ArrowLeft size={14} />
                </span>
              </Link>
            </div>
          </HealthTestCategorySection>

          {/* FAQ */}
          <CategoryFAQ
            sectionTitle={`سؤالات متداول درباره ${test.title}`}
            faqs={faqItems}
          />

          {/* CTA Banner */}
          <section className="mt-16 mb-14">
            <HealthTestsCTABanner
              id={`health-test-${test.slug}-cta`}
              title="اگر نگران وضعیت سلامت سالمند خانواده‌تان هستید، سالمندیار کنار شماست."
              description="تیم سالمندیار، با بیش از ۵۰۰ پرستار و مراقب حرفه‌ای و دارای مجوز، در کمتر از چند ساعت در اختیار خانواده‌ها قرار می‌گیرد."
            />
          </section>

          <section className="mt-4">
            <GuestRequestSection />
          </section>

          <section className="mt-10 text-center text-xs text-slate-400 leading-relaxed max-w-3xl mx-auto">
            این تست صرفاً جنبه آموزشی و غربالگری دارد و جایگزین مشاوره، تشخیص یا درمان پزشک متخصص نمی‌باشد.
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function DEFAULT_TEST_FAQS(test: ReturnType<typeof getHealthTestBySlug> & object): FAQItem[] {
  const t = test as { title: string; durationMinutes: number; questions: unknown[] };
  return [
    {
      id: 1,
      question: `${t.title} چقدر طول می‌کشد؟`,
      answer: `حدود ${t.durationMinutes} دقیقه؛ شامل ${
        Array.isArray(t.questions) ? t.questions.length : 'چند'
      } سؤال کوتاه که به‌صورت سوال‌به‌سؤال نمایش داده می‌شوند و به سرعت قابل پاسخ دادن هستند.`,
      displayOrder: 1,
    },
    {
      id: 2,
      question: 'آیا برای انجام این تست نیاز به ثبت نام و یا پرداخت هزینه دارم؟',
      answer:
        'خیر؛ کلیه تست‌های بخش سلامت سالمندیار کاملاً رایگان هستند و نیازی به وارد کردن شماره تماس یا ثبت نام برای شروع تست ندارید.',
      displayOrder: 2,
    },
    {
      id: 3,
      question: 'اگر نیمه راه تست را ببندم آیا پاسخ‌ها حفظ می‌شوند؟',
      answer:
        'بله؛ پاسخ‌های شما به‌صورت خودکار روی دستگاه خودتان (در حافظهٔ داخلی مرورگر) ذخیره می‌شوند و با بازگشت به همان صفحه، از همان جای قبلی ادامه می‌دهید.',
      displayOrder: 3,
    },
    {
      id: 4,
      question: 'آیا نتیجهٔ این تست تشخیص پزشکی محسوب می‌شود؟',
      answer:
        'خیر؛ این تست صرفاً ابزاری آموزشی و غربالگری است و هرگز جایگزین معاینه، تشخیص یا درمان پزشک و متخصص نمی‌شود. در صورت نگرانی، حتماً به پزشک مراجعه کنید.',
      displayOrder: 4,
    },
    {
      id: 5,
      question: 'آیا می‌توانم نتیجه را با پزشک یا خانواده به اشتراک بگذارم؟',
      answer:
        'بله؛ در صفحهٔ نتیجه امکان اشتراک‌گذاری از طریق واتساپ، تلگرام، اشتراک‌گذاری سیستم موبایل و کپی متن برای شما فراهم شده است.',
      displayOrder: 5,
    },
  ];
}

function HealthTestPageSchema({ testId }: { testId: string }) {
  const test = getHealthTestBySlug(testId) || getHealthTestBySlug('elderly-health');
  if (!test) return null;

  const data = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage' as const,
    name: test.title,
    description: test.shortDescription,
    url: `https://salmandyar.ir/health-tests/${test.slug}`,
    inLanguage: 'fa-IR',
    specialty: test.categories.join(', ') || 'Geriatrics',
    keywords: test.metaKeywords?.join(', ') || undefined,
    medicalAudience: ['caregivers', 'elderly', 'patients'],
    mainEntity: {
      '@type': 'MedicalTest' as const,
      name: test.title,
      alternateName: test.slug,
      healthCondition: test.categories.join(', ') || undefined,
      status: 'https://schema.org/Active',
    },
    isPartOf: {
      '@type': 'CollectionPage' as const,
      name: 'تست‌های سلامت سالمندیار',
      url: 'https://salmandyar.ir/health-tests',
    },
  };
  return (
    <Script
      id={`schema-health-test-${test.slug}`}
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
