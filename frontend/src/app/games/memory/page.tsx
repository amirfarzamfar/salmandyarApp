import { Metadata } from 'next';
import Script from 'next/script';
import {
  Activity,
  Brain,
  ChevronLeft,
  Clock,
  HeartPulse,
  Home,
  Leaf,
  Lightbulb,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
} from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Breadcrumb from '@/components/seo/Breadcrumb';
import { Button } from '@/components/ui/Button';
import { MemoryGame } from '@/components/games/memory/MemoryGame';
import GuestRequestSection from '@/components/landing/GuestRequestSection';
import { FAQSchema } from '@/lib/seo/structured-data';
import type { FAQItem } from '@/lib/types/content';
import { cn } from '@/lib/utils';

const PAGE_PATH = '/games/memory';
const CANONICAL = PAGE_PATH;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://salmandyar.com';

export const metadata: Metadata = {
  title: 'بازی تقویت حافظه سالمندان؛ حافظه ی خود را تقویت کنید| سالمندیار',
  description:
    'بازی حافظه سالمندیار، رایگان و بدون ثبت‌نام. با تصاویر بزرگ و رابط کاربری ساده، هر روز چند دقیقه تمرین حافظه، توجه و یادآوری برای سالمندان؛ مناسب موبایل و تبلت.',
  keywords: [
    'بازی حافظه سالمندان',
    'تقویت حافظه سالمند',
    'بازی سالمندان',
    'بازی فکری سالمندان',
    'آلزایمر',
    'دمانس',
    'بازی رایگان سالمندان',
    'تمرین حافظه در خانه',
    'فعالیت‌های فکری برای سالمند',
    'سالمندیار',
  ],
  alternates: { canonical: CANONICAL },
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    url: PAGE_PATH,
    siteName: 'سالمندیار',
    title: 'بازی تقویت حافظه سالمندان | سالمندیار',
    description:
      'بازی حافظه سالمندان؛ ۵ مرحله تصویری ساده برای تمرین حافظه دیداری، توجه و یادآوری سالمندان. رایگان، بدون ثبت‌نام و مناسب موبایل.',
    images: [
      {
        url: '/opengraph-image.svg',
        width: 1200,
        height: 630,
        type: 'image/svg+xml',
        alt: 'بازی تقویت حافظه سالمندیار',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'بازی حافظه سالمندان | سالمندیار',
    description:
      'با بازی سالمندیار، روزی چند دقیقه تمرین حافظه و توجه برای سالمند خانواده. رایگان و بدون ثبت‌نام.',
    creator: '@salmandyar',
    images: [
      {
        url: '/twitter-image.svg',
        width: 1200,
        height: 675,
        type: 'image/svg+xml',
        alt: 'بازی حافظه سالمندیار',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

const MEMORY_GAME_FAQS: FAQItem[] = [
  {
    id: 1,
    question: 'بازی تقویت حافظه سالمندیار رایگان است؟',
    answer:
      'بله؛ بازی تقویت حافظه سالمندیار به‌صورت کاملاً رایگان در دسترس است و برای شروع، ثبت‌نام یا ورود به حساب کاربری لازم نیست.',
    displayOrder: 1,
  },
  {
    id: 2,
    question: 'آیا برای انجام این بازی نیاز به تایپ کردن متن دارم؟',
    answer:
      'خیر؛ تمام مراحل بازی با کلیک یا لمس روی تصاویر و گزینه‌ها انجام می‌شود و سالمندی که با کیبورد آشنایی ندارد یا مشکل بینایی دارد، هم می‌تواند بازی را انجام دهد.',
    displayOrder: 2,
  },
  {
    id: 3,
    question: 'این بازی برای چه کسانی مناسب است؟',
    answer:
      'این بازی برای افراد مسن سالم، سالمندانی که می‌خواهند فعالانه مغز خود را تمرین دهند، و همچنین خانواده‌ای که می‌خواهند با سالمندشان فعالیت مشترک و لذت‌بخش داشته باشند، طراحی شده است.',
    displayOrder: 3,
  },
  {
    id: 4,
    question: 'آیا نتیجه این بازی معیاری برای تشخیص آلزایمر است؟',
    answer:
      'خیر؛ امتیاز این بازی صرفاً یک معیار عملکردی درون بازی است و هیچ‌گاه معادل ارزیابی بالینی، مشاوره یا تشخیص پزشک و متخصص مغز و اعصاب نمی‌باشد.',
    displayOrder: 4,
  },
  {
    id: 5,
    question: 'چند بار در هفته پیشنهاد می‌شود این بازی انجام شود؟',
    answer:
      'پیشنهاد می‌شود روزی ۱۰ تا ۱۵ دقیقه و در اکثر روزهای هفته به‌صورت منظم انجام شود؛ تداوم تمرین، بیش از طول مدت یک جلسه، در حفظ آمادگی ذهنی مؤثر است.',
    displayOrder: 5,
  },
  {
    id: 6,
    question: 'آیا برای سالمندان مبتلا به آلزایمر یا دمانس هم مناسب است؟',
    answer:
      'بله؛ بازی تا حد امکان کوتاه، بدون عجله و با تصاویر آشنا طراحی شده است، اما باید با ملاحظات بالینی همراه باشد و در مراحل پیشرفته دمانس، فعالیت با همراهی خانواده و یا پرستار توصیه می‌شود.',
    displayOrder: 6,
  },
];

export default function MemoryGameLandingPage() {
  const hero = (
    <section className="mb-12 text-center relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-teal-600 via-emerald-500 to-amber-400 text-white p-8 sm:p-12 lg:p-16 shadow-2xl shadow-teal-500/20">
      <div className="absolute inset-0 opacity-20 pointer-events-none" aria-hidden>
        <div className="absolute top-8 left-8 w-48 h-48 rounded-full bg-white blur-3xl" />
        <div className="absolute bottom-8 right-8 w-64 h-64 rounded-full bg-yellow-200 blur-3xl" />
      </div>
      <div className="relative">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/25 backdrop-blur text-xs font-black mb-5">
          <Sparkles size={14} />
          بازی رایگان و تعاملی برای تقویت حافظه
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black mb-5 leading-tight">
          بازی تقویت حافظه <span className="text-yellow-100">سالمندان</span>
        </h1>
        <p className="text-white/95 max-w-3xl mx-auto text-lg sm:text-xl lg:text-2xl leading-relaxed mb-3 font-bold">
          هر روز چند دقیقه برای تمرکز و حافظه تمرین کن ❤️
        </p>
        <p className="text-white/85 max-w-2xl mx-auto text-sm sm:text-base lg:text-lg leading-relaxed mb-8">
          یک بازی ساده و آرام برای سالمندان، با تصاویر بزرگ و رابط کاربری آسان.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mb-9">
          <Button
            asChild
            size="lg"
            className="rounded-full bg-white text-teal-700 hover:bg-white/95 shadow-xl shadow-black/10 ring-4 ring-white/20 border-0"
          >
            <a href="#game" aria-label="شروع بازی رایگان حافظه سالمندیار">
              <HeartPulse size={20} strokeWidth={2.3} />
              شروع بازی رایگان
              <ChevronLeft size={17} strokeWidth={2.3} />
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-full border-2 border-white/35 bg-white/10 text-white hover:bg-white/15 backdrop-blur"
          >
            <a href="#content">
              <Activity size={18} />
              درباره بازی و فوایدش بخوانید
            </a>
          </Button>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-black">
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 backdrop-blur border border-white/20">
            <ShieldCheck size={16} /> بدون ثبت‌نام
          </span>
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 backdrop-blur border border-white/20">
            <Sparkles size={16} /> رایگان
          </span>
          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 backdrop-blur border border-white/20">
            <Smartphone size={16} /> مناسب موبایل
          </span>
        </div>
      </div>
    </section>
  );

  return (
    <div id="top" className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <MemoryGameStructuredData />
      <FAQSchema faqs={MEMORY_GAME_FAQS} pageUrl={PAGE_PATH} />

      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <Breadcrumb
            items={[
              { name: 'بازی‌ها', href: '/games' },
              { name: 'بازی تقویت حافظه سالمندان', href: PAGE_PATH },
            ]}
          />

          {hero}

          <section aria-labelledby="mg-how-heading" className="mb-14">
            <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
              <TrustCard
                icon={<Clock size={22} strokeWidth={2.3} />}
                title="۵ مرحله کوتاه"
                desc="هر جلسه حدود ۵ تا ۱۰ دقیقه طول می‌کشد و خسته‌کننده نیست."
                tone="teal"
              />
              <TrustCard
                icon={<Home size={22} strokeWidth={2.3} />}
                title="اجرای آسان در خانه"
                desc="به‌تنهایی یا با همراهی خانواده، روی موبایل، تبلت و لپ‌تاپ قابل اجرا."
                tone="violet"
              />
              <TrustCard
                icon={<Users size={22} strokeWidth={2.3} />}
                title="تصاویر آشنا و بزرگ"
                desc="میوه، حیوانات خانگی، گل، خانه و چای؛ با کپشن واضح و خوانا."
                tone="amber"
              />
            </div>
          </section>

          <section id="game" className="mb-14" aria-label="محیط بازی تقویت حافظه">
            <MemoryGame />
          </section>

          <section className="mb-14" aria-label="ثبت سریع درخواست خدمات مراقبتی">
            <GuestRequestSection />
          </section>

          <section id="content" className="grid gap-5 sm:gap-6 md:grid-cols-2 mb-16">
            <ContentCard
              eyebrow="معرفی بازی"
              headingId="h2-what"
              title="بازی تقویت حافظه سالمندان چیست؟"
              tone="teal"
              icon={<Brain size={22} strokeWidth={2.3} />}
            >
              <p>
                بازی تقویت حافظه سالمندیار مجموعه‌ای کوتاه و تصویری از تمرین‌های ذهنی است که هدفش
                فعال‌سازی آرام و منظم حافظه دیداری، توجه متمرکز و یادآوری اطلاعات ساده در محیطی آرام
                و بدون استرس است. این بازی بر پایهٔ تصاویر و مفاهیم آشنا برای افراد مسن طراحی شده؛
                مانند میوه، حیوانات خانگی، گل، خانه و چای.
              </p>
              <p>
                تصاویر بزرگ، کپشن خوانا، دکمه‌های درشت و عدم عجله در زمان پاسخ، از ویژگی‌های اصلی
                این تجربه هستند تا سالمند احساس اعتماد به نفس کند و همراهی خانواده هم برای او لذت‌بخش
                بماند.
              </p>
              <p>
                این بازی هیچ‌گونه محتوای ترسناک یا رقابتی خسته‌کننده ندارد و صرفاً جنبه تمرینی و سرگرمی
                سازنده دارد.
              </p>
            </ContentCard>

            <ContentCard
              eyebrow="فواید تمرین منظم"
              headingId="h2-benefit"
              title="آیا بازی‌های حافظه برای سالمندان مفید هستند؟"
              tone="violet"
              icon={<Activity size={22} strokeWidth={2.3} />}
            >
              <p>
                مطالعات در حوزهٔ سالمندی روان‌شناختی نشان می‌دهد که فعالیت‌های ذهنی منظم و لذت‌بخش،
                مانند بازی‌های کلمه‌ای، تصویری و حل پازل ساده، می‌توانند در کنار رژیم غذایی سالم، خواب
                کافی و تحرک بدنی، نقش حفظ‌کننده‌ای برای آمادگی شناختی ایفا کنند.
              </p>
              <p>
                هدف اصلی از بازی‌های حافظه، «فعال نگه داشتن» مغز در یک چرخهٔ بی‌خطر و لذت‌بخش است؛ نه
                ارائه ادعای درمان یا پیشگیری قطعی از بیماری‌ها. انجام روزانهٔ ۱۰ تا ۱۵ دقیقه چنین
                فعالیتی، حس مشارکت و موفقیت روزمره را در سالمند تقویت می‌کند.
              </p>
              <p>
                در کنار این موارد، انجام مشترک بازی با اعضای خانواده، حس تنهایی را کاهش می‌دهد و ارتباط
                عاطفی عمیق‌تری بین نسل‌ها فراهم می‌سازد.
              </p>
            </ContentCard>

            <ContentCard
              eyebrow="ملاحظات بالینی"
              headingId="h2-dementia"
              title="بازی مناسب سالمندان مبتلا به آلزایمر و دمانس"
              tone="rose"
              icon={<HeartPulse size={22} strokeWidth={2.3} />}
            >
              <p>
                سالمندان مبتلا به آلزایمر یا سایر انواع دمانس، اغلب از فعالیت‌های ساختاریافته، کوتاه و
                تصویری بهره می‌برند؛ به‌ویژه اگر تصاویر مربوط به خاطرات و مفاهیم آشنا روزمره باشند.
                فعالیت‌هایی که بدون نیاز به تایپ و با لمس ساده روی تصاویر انجام می‌شوند، از استرس ناشی
                از استفاده از فناوری می‌کاهند.
              </p>
              <p>
                در این بازی، زمان پاسخ‌دهی محدود به صورت «عجله‌آمیز» تنظیم نشده و امکان تکرار چرخهٔ بازی
                بدون محدودیت وجود دارد. با این حال، در مراحل متوسط تا پیشرفته دمانس، انجام این فعالیت
                باید در کنار توصیه‌های پزشک معالج و با همراهی خانواده یا پرستار حرفه‌ای صورت پذیرد.
              </p>
              <p>
                اگر در طول بازی خستگی، سردرگمی یا بی‌قراری در سالمند مشاهده شد، بهتر است جلسه کوتاه
                شود و با فعالیتی آرام‌تر مثل گوش دادن به موسیقی یا صحبت گرم ادامه یابد.
              </p>
            </ContentCard>

            <ContentCard
              eyebrow="پیشنهادهای عملی"
              headingId="h2-activities"
              title="فعالیت‌های ساده برای تقویت توجه و حافظه سالمندان"
              tone="amber"
              icon={<Lightbulb size={22} strokeWidth={2.3} />}
            >
              <p>
                علاوه بر بازی‌های تصویری، فعالیت‌های روزمره ساده هم می‌توانند هم‌راه خوبی در حفظ آمادگی
                ذهنی باشند؛ مثل مرتب‌کردن میوه‌ها بر اساس رنگ یا اندازه، یادآوری لیست خرید بدون نوشتن،
                نگاه کردن به عکس‌های قدیمی و گفتگو درباره خاطرات، گوش دادن به آشنای محبوب و ساختن
                داستان کوتاه روی آن.
              </p>
              <p>
                پیاده‌روی کوتاه روزانه، ورزش‌های نرم کششی، نوشیدن کافی آب و تغذیه غنی از میوه، سبزیجات،
                غلات کامل و چربی‌های مفید، روی آمادگی جسمی و ذهنی اثر مستقیم دارند.
              </p>
              <p>
                مهم‌تر از همه، معاشرت منظم با دوستان و خانواده، خواندن کتاب روزانه و انجام کارهای دستی
                ساده مثل باغبانی کوچک، بافتنی یا آشپزی ساده، همگی به‌عنوان فعالیت‌های چندوجهی برای تقویت
                حافظه و سالمندی فعال معرفی شده‌اند.
              </p>
            </ContentCard>

            <ContentCard
              eyebrow="راهنمای خانواده"
              headingId="h2-howto"
              title="چگونه با سالمند در خانه تمرین کنیم؟"
              tone="sky"
              icon={<Leaf size={22} strokeWidth={2.3} />}
              className="md:col-span-2"
            >
              <p>
                تمرین منظم با سالمند، فقط تمرین مغز نیست؛ بلکه فرصتی برای ارتباط گرم و ایجاد لحظهٔ مشترک
                است. برای اجرای درست و مؤثر، ابتدا روزی یک ساعت مناسب و منظم انتخاب کنید؛ زمانی که
                سالمند خواب کافی داشته و گرسنه یا خسته نباشد. محیط را از صداهای مزاحم مانند تلویزیون با
                بلندی بالا پاک کنید و نور مناسبی داشته باشد.
              </p>
              <p>
                هنگام بازی، تا حد امکان کنار او بنشینید و او را تشویق کنید؛ حتی اگر در چند مرحله اشتباه
                کند، کلمات منفی و قضاوت‌کننده پرهیز کنید. بیان مثبت مثل «آفرین که خوب به خاطر آوردی» یا
                «نگران نباش، دفعه بعد بهتر می‌شود» بسیار تأثیرگذارتر از نقد و مقایسه است.
              </p>
              <p>
                در آخر، سعی کنید این چرخه را به مدتی کوتاه اما منظم تبدیل کنید؛ مثلاً ۱۰ الی ۱۵ دقیقه در
                اکثر روزهای هفته. مداومت در تمرین و همراهی صبورانه خانواده، مهم‌ترین عامل در حفظ روند
                رضایت‌بخش است.
              </p>
            </ContentCard>
          </section>

          <section className="rounded-3xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 p-6 sm:p-8 mb-16" aria-label="هشدار عدم جایگزینی تشخیص پزشکی">
            <div className="flex items-start gap-3 sm:gap-4">
              <span className="inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-amber-500 text-white shrink-0 shadow-lg shadow-amber-500/20">
                <ShieldCheck size={24} strokeWidth={2.3} />
              </span>
              <div className="space-y-2 sm:space-y-3 text-amber-950">
                <h3 className="font-black text-xl sm:text-2xl leading-tight">
                  این بازی ابزار تشخیص یا درمان آلزایمر نیست و نتیجه آن جایگزین ارزیابی پزشک یا متخصص
                  نمی‌شود.
                </h3>
                <p className="text-sm sm:text-base leading-8">
                  اگر در خانواده کاهش تدریجی حافظه، سردرگمی در زمان و مکان، تغییر در خلق و خو یا افت فعالیت‌های
                  روزمره را مشاهده کردید، پیشنهاد می‌شود در اسرع وقت به پزشک معالج یا متخصص مغز و اعصاب
                  مراجعه نمایید و از خوددرمانی و اکتفا به ابزارهای این‌چنینی خودداری کنید.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-16" aria-labelledby="faq-heading">
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-teal-500 text-white shadow-lg shadow-teal-500/20">
                <Sparkles size={22} strokeWidth={2.3} />
              </span>
              <div>
                <h2 id="faq-heading" className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  سؤالات متداول درباره بازی حافظه سالمندیار
                </h2>
                <p className="mt-1 text-sm sm:text-base text-slate-600">
                  اگر سؤال دیگری دارید، می‌توانید با پشتیبانی سالمندیار تماس بگیرید.
                </p>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-100 bg-white shadow-sm divide-y divide-slate-100">
              {MEMORY_GAME_FAQS.map(faq => (
                <details
                  key={faq.id}
                  className="group p-5 sm:p-6 open:bg-slate-50/40"
                >
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                    <span className="font-black text-base sm:text-lg text-slate-900 leading-snug">
                      {faq.question}
                    </span>
                    <span
                      className="mt-0.5 inline-flex items-center justify-center w-9 h-9 rounded-2xl bg-slate-100 text-slate-600 group-open:bg-teal-100 group-open:text-teal-700 transition shrink-0"
                      aria-hidden
                    >
                      <ChevronLeft size={17} strokeWidth={2.6} className="rotate-90 group-open:-rotate-90 transition" />
                    </span>
                  </summary>
                  <p className="mt-3 text-sm sm:text-base text-slate-700 leading-8">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          <section className="text-center text-xs sm:text-sm text-slate-500 leading-relaxed max-w-3xl mx-auto">
            تمامی محتوا و بازی‌های این بخش صرفاً جنبه آموزشی، اطلاع‌رسانی و سرگرمی سازنده دارند و هرگز
            جایگزین مشاوره، تشخیص یا درمان پزشک و متخصص نمی‌باشند.
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function TrustCard({
  icon,
  title,
  desc,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  tone: 'teal' | 'violet' | 'amber';
}) {
  const tones = {
    teal: 'from-teal-500 to-emerald-600',
    violet: 'from-violet-500 to-fuchsia-600',
    amber: 'from-amber-500 to-orange-600',
  } as const;
  return (
    <article className="rounded-3xl border border-slate-100 bg-white p-5 sm:p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'w-12 h-12 rounded-2xl text-white inline-flex items-center justify-center shadow-lg ring-8 ring-black/5 shrink-0 bg-gradient-to-br',
            tones[tone],
          )}
        >
          {icon}
        </div>
        <div>
          <h3 className="font-black text-lg sm:text-xl text-slate-900 leading-tight mb-1.5">
            {title}
          </h3>
          <p className="text-sm sm:text-base text-slate-600 leading-7">{desc}</p>
        </div>
      </div>
    </article>
  );
}

function ContentCard({
  eyebrow,
  title,
  headingId,
  tone,
  icon,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  headingId: string;
  tone: 'teal' | 'violet' | 'rose' | 'amber' | 'sky';
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const tones = {
    teal: 'from-teal-500 to-emerald-600 ring-teal-500/10',
    violet: 'from-violet-500 to-fuchsia-600 ring-violet-500/10',
    rose: 'from-rose-500 to-orange-500 ring-rose-500/10',
    amber: 'from-amber-500 to-orange-600 ring-amber-500/10',
    sky: 'from-sky-500 to-cyan-600 ring-sky-500/10',
  } as const;
  return (
    <article className={cn('rounded-3xl border border-slate-100 bg-white p-6 sm:p-7 shadow-sm', className)}>
      <div className="flex items-center gap-3 mb-4">
        <div
          className={cn(
            'w-11 h-11 rounded-2xl bg-gradient-to-br text-white flex items-center justify-center shadow-lg ring-8',
            tones[tone],
          )}
        >
          {icon}
        </div>
        <div>
          <div className="text-[11px] font-black uppercase tracking-widest text-slate-400">
            {eyebrow}
          </div>
        </div>
      </div>
      <h2 id={headingId} className="text-xl sm:text-2xl font-black text-slate-900 leading-tight mb-3">
        {title}
      </h2>
      <div className="space-y-3 text-sm sm:text-base leading-8 text-slate-700">{children}</div>
    </article>
  );
}

function MemoryGameStructuredData() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage' as const,
    name: 'بازی تقویت حافظه سالمندیار',
    headline:
      'بازی تصویری ساده برای تمرین حافظه، توجه و یادآوری سالمندان؛ رایگان، بدون ثبت‌نام و مناسب موبایل.',
    description:
      'بازی حافظه سالمندیار در ۵ مرحله کوتاه و تصویری، با تصاویر بزرگ و رابط کاربری آرام، تجربه‌ای سازنده برای تمرین ذهنی سالمندان فراهم می‌کند.',
    url: `${SITE_URL}${PAGE_PATH}`,
    mainEntityOfPage: `${SITE_URL}${PAGE_PATH}`,
    inLanguage: 'fa-IR',
    specialty: 'Geriatrics',
    medicalAudience: ['patients', 'caregivers', 'elderly'],
    keywords: [
      'بازی حافظه سالمندان',
      'تقویت حافظه سالمند',
      'بازی فکری سالمندان',
      'تمرین ذهنی سالمند',
      'آلزایمر',
      'دمانس',
    ],
    isPartOf: {
      '@type': 'WebSite' as const,
      name: 'سالمندیار',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'MedicalOrganization' as const,
      name: 'سالمندیار',
      url: SITE_URL,
      medicalSpecialty: ['Geriatrics', 'Home Health Care', 'Nursing'],
    },
  };
  return (
    <Script
      id="schema-memory-game-webpage"
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
