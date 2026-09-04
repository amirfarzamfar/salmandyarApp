import { Metadata } from 'next';
import Link from 'next/link';
import {
  HeartPulse,
  Sparkles,
  Award,
  ChevronLeft,
  Users,
  ShieldCheck,
  FileText,
  Activity,
  BookOpenCheck,
  HeartHandshake,
  Info,
  Scale,
} from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Breadcrumb from '@/components/seo/Breadcrumb';
import CategoryFAQ from '@/components/content/CategoryFAQ';
import type { FAQItem } from '@/lib/types/content';
import { HEALTH_TESTS, listFeaturedHealthTests } from '@/lib/health-tests/tests';
import HealthTestCard from '@/components/health-tests/HealthTestCard';
import FeaturedHealthTestCard from '@/components/health-tests/FeaturedHealthTestCard';
import HealthTestCategorySection from '@/components/health-tests/HealthTestCategorySection';
import TrustSignalsBar from '@/components/health-tests/TrustSignalsBar';
import HealthTestsCTABanner from '@/components/health-tests/HealthTestsCTABanner';
import { FAQSchema } from '@/lib/seo/structured-data';
import Script from 'next/script';
import { Button } from '@/components/ui/Button';
import GuestRequestSection from '@/components/landing/GuestRequestSection';

export const metadata: Metadata = {
  title: 'تست سلامت آنلاین رایگان | ارزیابی سلامت سالمندان | سالمندیار',
  description:
    'با تست‌های سلامت سالمندیار، وضعیت اولیه سلامت، حافظه، خطر سقوط، تغذیه، ایمنی منزل و نیاز به مراقبت سالمندان را به‌صورت آنلاین و رایگان بررسی کنید.',
  keywords: [
    'تست سلامت',
    'تست سلامت سالمند',
    'تست حافظه سالمند',
    'ارزیابی سلامت سالمند',
    'خطر سقوط سالمند',
    'تست تغذیه سالمند',
    'ایمنی منزل سالمند',
    'تست آنلاین سلامت',
    'تست رایگان سلامت',
    'ارزیابی نیاز به مراقبت',
    'سالمندیار',
  ],
  alternates: { canonical: '/health-tests' },
  openGraph: {
    title: 'تست‌های سلامت رایگان سالمندیار | ۶+ تست تعاملی',
    description:
      'در چند دقیقه، وضعیت سلامت خود یا سالمند خانواده را در حیطه‌های حافظه، تحرک، تغذیه، ایمنی منزل و نیاز به مراقبت ارزیابی کنید.',
    type: 'website',
    url: '/health-tests',
    locale: 'fa_IR',
    siteName: 'سالمندیار',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'تست سلامت آنلاین رایگان | سالمندیار',
    description:
      'تست‌های تعاملی سلامت سالمند: حافظه، سقوط، نیاز به مراقبت، تغذیه و ایمنی منزل. رایگان، بدون ثبت‌نام و نتیجه فوری.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const HUB_FAQS: FAQItem[] = [
  {
    id: 1,
    question: 'تست سلامت سالمند چیست؟',
    answer:
      'تست سلامت سالمند در سالمندیار مجموعه‌ای از سؤال‌های کوتاه و تعاملی است که در چند دقیقه به خانواده کمک می‌کند تصویر اولیه از وضعیت سلامت، حافظه، تحرک، تغذیه، ایمنی منزل و نیاز به مراقبت بدست بیاورد. این تست‌ها صرفاً ابزار غربالگری و آموزشی هستند.',
    displayOrder: 1,
  },
  {
    id: 2,
    question: 'آیا تست‌های سالمندیار رایگان هستند؟',
    answer:
      'بله؛ کلیه تست‌های بخش سلامت سالمندیار کاملاً رایگان و بدون پرداخت هزینه در دسترس هستند و برای شروع نیاز به ثبت نام یا ورود به حساب کاربری ندارید.',
    displayOrder: 2,
  },
  {
    id: 3,
    question: 'آیا برای انجام تست نیاز به ثبت نام دارم؟',
    answer:
      'خیر؛ انجام تست‌ها بدون ثبت نام و بدون درخواست اطلاعات شخصی امکان‌پذیر است. اگر مایل به دریافت گزارش کامل و مشاوره تخصصی باشید می‌توانید شماره تماس را به‌صورت اختیاری وارد کنید.',
    displayOrder: 3,
  },
  {
    id: 4,
    question: 'تست حافظه سالمند چه چیزی را بررسی می‌کند؟',
    answer:
      'تست حافظه سالمندیار به‌صورت غربالگری، حافظه کوتاه‌مدت، جهت‌یابی زمانی و مکانی، توانایی دنبال کردن گفتگو، و فراموشی‌های روزمره مانند پیدا کردن وسایل را بررسی می‌کند. این تست تشخیص پزشکی نیست و جهت ارجاع به متخصص کاربرد دارد.',
    displayOrder: 4,
  },
  {
    id: 5,
    question: 'آیا نتیجه تست پزشکی محسوب می‌شود؟',
    answer:
      'خیر؛ این تست‌ها صرفاً جنبه آموزشی و غربالگری دارند و هرگز جایگزین معاینه، تشخیص و درمان پزشک یا متخصص نمی‌شوند. در صورت نگرانی، ضروری است به پزشک یا مراکز تخصصی مراجعه شود.',
    displayOrder: 5,
  },
  {
    id: 6,
    question: 'چه زمانی باید سالمند توسط پزشک بررسی شود؟',
    answer:
      'اگر در طول تست به مواردی مانند فراموشی شدید، افت ناگهانی تعادل و سابقه سقوط، کاهش وزن ناخواسته، مشکل در بلع یا تغییرات شدید خلق و خوی برخوردید؛ یا اگر خانواده احساس می‌کنند سلامت روان یا جسمی سالمند دستخوش تغییر شده، پیشنهاد می‌شود در اسرع وقت به پزشک مراجعه نمایید.',
    displayOrder: 6,
  },
  {
    id: 7,
    question: 'آیا می‌توان نتیجه تست را با خانواده به اشتراک گذاشت؟',
    answer:
      'بله؛ در انتهای هر تست امکان اشتراک‌گذاری نتیجه از طریق واتساپ، تلگرام، اشتراک‌گذاری موبایل و کپی متن وجود دارد تا خانواده، پزشک یا پرستار معالج از نتیجه مطلع شوند.',
    displayOrder: 7,
  },
  {
    id: 8,
    question: 'اگر نتیجه نشان‌دهنده نیاز به مراقبت بود، چه کاری باید انجام دهم؟',
    answer:
      'در انتهای هر تست، بر اساس سطح ریسک، توصیه متناسبی ارائه می‌شود؛ از جمله مشاهده خدمات سالمندیار، مشاوره رایگان کارشناس یا درخواست فوری پرستار و مراقب در منزل که قابل پیگیری مستقیم از همان صفحه است.',
    displayOrder: 8,
  },
];

const HUB_PAGE_URL = '/health-tests';

export default function HealthTestsHubPage() {
  const orderedTests = listFeaturedHealthTests();
  const featured = orderedTests.find(t => t.featured) || orderedTests[0];
  const others = orderedTests.filter(t => t.id !== featured.id);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <FAQSchema faqs={HUB_FAQS} pageUrl={HUB_PAGE_URL} />
      <HealthTestsCollectionSchemaLd />

      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ name: 'تست‌های سلامت', href: '/health-tests' }]} />

          {/* Hero Section */}
          <section className="mb-12 text-center relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-rose-600 via-orange-500 to-amber-400 text-white p-8 sm:p-12 lg:p-16 shadow-2xl shadow-rose-500/20">
            <div className="absolute inset-0 opacity-20 pointer-events-none" aria-hidden="true">
              <div className="absolute top-8 left-8 w-48 h-48 rounded-full bg-white blur-3xl" />
              <div className="absolute bottom-8 right-8 w-64 h-64 rounded-full bg-yellow-200 blur-3xl" />
            </div>
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/25 backdrop-blur text-xs font-black mb-5">
                <Sparkles size={14} />
                {HEALTH_TESTS.length}+ تست سلامت کاملاً رایگان
              </div>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black mb-5 leading-tight">
                تست‌های سلامت <span className="text-yellow-100">رایگان سالمندیار</span>
              </h1>
              <p className="text-white/90 max-w-3xl mx-auto text-base sm:text-lg lg:text-xl leading-relaxed mb-3">
                وضعیت سلامت خود یا سالمند خانواده‌تان را در چند دقیقه بررسی کنید.
              </p>
              <p className="text-white/80 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed mb-8">
                با استفاده از تست‌های تعاملی سالمندیار، اطلاعات اولیه‌ای درباره سلامت، حافظه، خطر سقوط
                و نیاز به مراقبت به دست آورید.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 mb-9">
                <Button
                  size="lg"
                  asChild
                  className="rounded-full bg-white text-rose-700 hover:bg-white/95 shadow-xl shadow-black/10 ring-4 ring-white/20 border-0"
                >
                  <Link href={`/health-tests/${featured.slug}`}>
                    <HeartPulse size={19} strokeWidth={2.4} />
                    شروع ارزیابی سلامت
                    <ChevronLeft size={17} strokeWidth={2.4} />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  asChild
                  variant="outline"
                  className="rounded-full border-2 border-white/35 bg-white/10 text-white hover:bg-white/15 backdrop-blur"
                >
                  <a href="#tests-grid">
                    <Activity size={18} />
                    مشاهده همه تست‌ها
                  </a>
                </Button>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-bold">
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 backdrop-blur border border-white/20">
                  <ShieldCheck size={16} /> بدون نیاز به ثبت‌نام برای شروع
                </span>
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 backdrop-blur border border-white/20">
                  <Users size={16} /> طراحی‌شده برای خانواده‌ها
                </span>
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 backdrop-blur border border-white/20">
                  <FileText size={16} /> نتیجه فوری و قابل اشتراک‌گذاری
                </span>
              </div>
            </div>
          </section>

          {/* Trust Signals */}
          <section className="mb-12">
            <TrustSignalsBar tone="default" />
          </section>

          {/* Featured Test */}
          <HealthTestCategorySection
            eyebrow="ویژه"
            title="تست پیشنهادی سالمندیار"
            description="برای شروع سریع‌ترین و جامع‌ترین تست را انتخاب کنید: ارزیابی کلی سلامت سالمند در ۱۲ سؤال تعاملی."
            className="mb-10"
          >
            <FeaturedHealthTestCard slug={featured.slug} />
          </HealthTestCategorySection>

          {/* All Tests Grid */}
          <HealthTestCategorySection
            id="tests-grid"
            eyebrow="همه تست‌ها"
            title="تست‌های سلامت سالمندان"
            description="گامی کوتاه برای درک بهتر وضعیت سالمند خانواده. همه تست‌ها رایگان، بدون ثبت نام و دارای نتیجه فوری هستند."
            action={
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
                <Award size={14} /> مجموعاً {orderedTests.reduce((acc, t) => acc + t.questions.length, 0)} سؤال
              </span>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {others.map(test => (
                <HealthTestCard key={test.id} test={test} />
              ))}
              {/* The featured appears below in same grid too, to keep all 6 items accessible */}
              <HealthTestCard test={featured} />
            </div>
          </HealthTestCategorySection>

          {/* Secondary Category: General Health (placeholder grid of cards that forward users to Articles / Tools) */}
          <HealthTestCategorySection
            eyebrow="سلامت عمومی"
            title="منابع بیشتر برای خانواده و سالمند"
            description="در کنار تست‌های سلامت، از ابزارهای محاسباتی و مقالات آموزشی سالمندیار هم استفاده کنید."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {[
                {
                  title: 'ابزارهای سلامت سالمندیار',
                  description:
                    'مجموعه‌ای از ماشین‌حساب‌ها و چک لیست‌های پرستاری: BMI، قطره سرم، برادن اسکیل، محاسبه دوز دارو و چک لیست مراقبت روزانه.',
                  icon: Activity,
                  href: '/tools',
                  tag: '۶+ ابزار رایگان',
                  gradient: 'from-violet-500 to-fuchsia-600',
                },
                {
                  title: 'مجله سلامت سالمندیار',
                  description:
                    'مقالات آموزشی در زمینه مراقبت از سالمند، پذیرایی از بیمار، بیماری‌های شایع دوران سالمندی و سبک زندگی سالم.',
                  icon: BookOpenCheck,
                  href: '/articles',
                  tag: 'مقالات روزانه',
                  gradient: 'from-teal-500 to-sky-600',
                },
                {
                  title: 'خدمات مراقبت در منزل',
                  description:
                    'پرسش و پاسخ درباره خدمات پرستاری در منزل، شیفت روزانه/شبانه‌روزی، ویژیت نیم‌روزه و نحوه درخواست فوری پرستار.',
                  icon: HeartHandshake,
                  href: '/services',
                  tag: 'پشتیبانی ۲۴ ساعته',
                  gradient: 'from-rose-500 to-orange-500',
                },
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group relative rounded-3xl p-6 sm:p-7 border-2 border-slate-100 bg-white hover:border-transparent hover:shadow-xl transition-all duration-500 overflow-hidden focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                  aria-label={item.title}
                >
                  <div
                    className={`absolute inset-x-0 top-0 h-44 bg-gradient-to-br ${item.gradient} opacity-[0.07] group-hover:opacity-[0.12] transition duration-500`}
                    aria-hidden="true"
                  />
                  <div className="relative">
                    <div className="flex items-start justify-between gap-3 mb-5">
                      <div
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} text-white flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-[-3deg] transition-all duration-500 ring-8 ring-black/5`}
                      >
                        <item.icon size={30} strokeWidth={2.25} />
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border border-slate-200 bg-slate-50 text-slate-600">
                        <Sparkles size={11} /> {item.tag}
                      </span>
                    </div>
                    <h3 className="font-black text-xl sm:text-2xl text-slate-900 mb-2.5 leading-tight group-hover:text-slate-800">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed min-h-[64px] line-clamp-3 mb-4">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 group-hover:border-slate-200 transition">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        مرجع بیشتر بخوانید
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 font-black text-sm bg-gradient-to-l ${item.gradient} bg-clip-text text-transparent group-hover:-translate-x-1.5 group-hover:gap-2 transition-all duration-300`}
                      >
                        مشاهده
                        <ChevronLeft size={15} strokeWidth={2.5} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </HealthTestCategorySection>

          {/* SEO Content Section */}
          <HealthTestCategorySection
            eyebrow="راهنمای سلامت"
            title="تست سلامت سالمند؛ چرا و کی باید استفاده کنیم؟"
            description="مطالب زیر صرفاً جنبه آموزشی دارند و تصمیم‌گیری نهایی به عهده پزشک و خانواده است."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              <article className="rounded-3xl bg-white border border-slate-100 p-6 sm:p-7 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500 to-sky-600 text-white flex items-center justify-center shadow-lg shadow-teal-500/15">
                    <Info size={20} strokeWidth={2.4} />
                  </div>
                  <h3 className="font-black text-xl text-slate-900 leading-tight">تست سلامت سالمند چیست؟</h3>
                </div>
                <p className="text-sm sm:text-base leading-8 text-slate-700">
                  «تست سلامت سالمند» به مجموعه‌ای ابزارها و چک‌لیست‌های غربالگری گفته می‌شود که سعی
                  می‌دهد در عرض چند دقیقه، تصویری کلی از وضعیت سلامت جسمی و روانی فرد مسن، به
                  خانواده ارائه دهد. این تست‌ها می‌توانند حیطه‌هایی چون حافظه، تعادل و خطر سقوط،
                  مدیریت دارو، تغذیه، ایمنی منزل و توانایی انجام فعالیت‌های روزمره را پوشش دهند.
                  غربالگری‌های اولیه، خانواده را قادر می‌سازد تغییرات کوچک را زودتر مشاهده و در صورت
                  نیاز به مشاوره تخصصی اقدام نمایند.
                </p>
              </article>

              <article className="rounded-3xl bg-white border border-slate-100 p-6 sm:p-7 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/15">
                    <Scale size={20} strokeWidth={2.4} />
                  </div>
                  <h3 className="font-black text-xl text-slate-900 leading-tight">
                    چرا ارزیابی سلامت سالمند اهمیت دارد؟
                  </h3>
                </div>
                <p className="text-sm sm:text-base leading-8 text-slate-700">
                  با افزایش سن، احتمال بروز بیماری‌های مزمن، کاهش تدریجی حافظه و تحرک، و خطر سقوط
                  و ضایعات ناشی از آن، بیشتر می‌شود. بسیاری از تغییرات اولیه به‌تدریج و بی‌صدا پیش
                  می‌روند و خانواده تا زمان بروز یک حادثه مانند سقوط یا عفونت، از عمق موضوع خبر
                  ندارند. غربالگری منظم سلامت سالمند، به شناسایی زودهنگام مشکلات کمک می‌کند، فشار
                  مراقبتی خانواده را کاهش می‌دهد و در نهایت کیفیت زندگی و استقلال فرد مسن را حفظ
                  می‌نماید.
                </p>
              </article>

              <article className="rounded-3xl bg-white border border-slate-100 p-6 sm:p-7 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white flex items-center justify-center shadow-lg shadow-violet-500/15">
                    <Activity size={20} strokeWidth={2.4} />
                  </div>
                  <h3 className="font-black text-xl text-slate-900 leading-tight">
                    چه زمانی بهتر است وضعیت سالمند را بررسی کنیم؟
                  </h3>
                </div>
                <p className="text-sm sm:text-base leading-8 text-slate-700">
                  پیشنهاد می‌شود حداقل هر ۳ تا ۶ ماه یک بار وضعیت کلی سالمند خانواده در قالب یک
                  غربالگری کوتاه مرور شود. همچنین در مواقع زیر انجام تست می‌تواند بسیار مفید واقع
                  گردد: پس از ترخیص از بیمارستان یا پذیرایی؛ پس از سقوط یا سرخوردن؛ در صورت مشاهده
                  تغییرات آشکار در خلق‌وخو، خواب یا اشتها؛ هنگام افزایش تعداد داروها یا تغییر پروتکل
                  دارویی؛ و هنگامی که احساس می‌کنید استقلال روزمره سالمند نسبت به قبل کاهش یافته
                  است.
                </p>
              </article>

              <article className="rounded-3xl bg-white border border-slate-100 p-6 sm:p-7 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/15">
                    <ShieldCheck size={20} strokeWidth={2.4} />
                  </div>
                  <h3 className="font-black text-xl text-slate-900 leading-tight">
                    آیا نتیجه تست جایگزین تشخیص پزشک است؟
                  </h3>
                </div>
                <p className="text-sm sm:text-base leading-8 text-slate-700">
                  خیر؛ هیچ‌یک از تست‌ها و ابزارهای این بخش، معادل تشخیص پزشکی یا معاینه بالینی محسوب
                  نمی‌شوند. نتایج صرفاً برای ارتقای آگاهی خانواده و هدایت به سمت اقدامات درست مانند
                  مراجعه به پزشک، مشاوره با متخصص یا دریافت خدمات مراقبتی در منزل، طراحی شده‌اند. اگر
                  در هر یک از حیطه‌های تغذیه، تحرک، حافظه، خلق، درد یا دارو نگرانی دارید، حتماً
                  پزشک معالج را در جریان بگذارید و در صورت نیاز به مراکز تخصصی ارجاع شوید.
                </p>
              </article>
            </div>
          </HealthTestCategorySection>

          {/* FAQ */}
          <CategoryFAQ sectionTitle="سؤالات متداول درباره تست‌های سلامت سالمندیار" faqs={HUB_FAQS} />

          {/* CTA Banner */}
          <section className="mt-14 sm:mt-16 mb-14">
            <HealthTestsCTABanner
              id="health-tests-cta"
              title="اگر سالمند خانواده‌تان به حمایت روزانه یا مشاوره تخصصی نیاز دارد، سالمندیار کنار شماست."
              description="پرستار و مراقب معتمد سالمندیار با سابقه و دارای مجوز حرفه‌ای، در شیفت‌های روزانه، شبانه‌روزی و ویژیت نیم‌روزه در دسترس هستند."
            />
          </section>

          {/* Final CTA: Guest Request Section same as landing */}
          <section className="mt-4">
            <GuestRequestSection />
          </section>

          <section className="mt-10 text-center text-xs text-slate-400 leading-relaxed max-w-3xl mx-auto">
            تمامی محتوا و تست‌های این بخش صرفاً جنبه آموزشی و اطلاع‌رسانی دارند و هرگز جایگزین
            مشاوره، تشخیص یا درمان پزشک و متخصص نمی‌باشند.
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function HealthTestsCollectionSchemaLd() {
  const pagePath = HUB_PAGE_URL;
  const data = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage' as const,
    name: 'تست‌های سلامت سالمندیار | غربالگری آنلاین رایگان',
    description:
      'مجموعه‌ای جامع از تست‌های تعاملی سلامت برای سالمندان و خانواده شامل تست سلامت کلی، حافظه، خطر سقوط، نیاز به مراقبت، تغذیه و ایمنی منزل.',
    url: `https://salmandyar.ir${pagePath}`,
    inLanguage: 'fa-IR',
    numberOfItems: HEALTH_TESTS.length,
    hasPart: HEALTH_TESTS.map(test => ({
      '@type': 'MedicalWebPage' as const,
      name: test.title,
      description: test.shortDescription,
      url: `https://salmandyar.ir/health-tests/${test.slug}`,
      specialty: test.categories.join(', ') || 'Geriatrics',
      keywords: test.metaKeywords?.join(', ') || undefined,
      mainEntity: {
        '@type': 'MedicalTest' as const,
        name: test.title,
        alternateName: test.slug,
        healthCondition: test.categories.join(', ') || undefined,
      },
    })),
    isPartOf: {
      '@type': 'WebSite' as const,
      name: 'سالمندیار',
      url: 'https://salmandyar.ir',
    },
    publisher: {
      '@type': 'MedicalOrganization' as const,
      name: 'سالمندیار',
      url: 'https://salmandyar.ir',
      medicalSpecialty: ['Geriatrics', 'Nursing', 'Home Health Care'],
    },
  };

  return (
    <Script
      id="schema-health-tests-collection"
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
