import {
  HeartPulse,
  Brain,
  Footprints,
  HandHeart,
  UtensilsCrossed,
  Home,
} from 'lucide-react';
import type { HealthTest } from './types';

export const HEALTH_TESTS: HealthTest[] = [
  {
    id: 'elderly-health',
    slug: 'elderly-health',
    title: 'تست سلامت کلی سالمند',
    metaTitle: 'تست سلامت کلی سالمند آنلاین رایگان | سالمندیار',
    metaDescription:
      'در حدود ۵ دقیقه، وضعیت کلی سلامت سالمند خانواده‌تان را ارزیابی کنید: حافظه، تحرک، دارو، تغذیه و ایمنی منزل. رایگان، بدون ثبت‌نام و نتایج قابل فهم.',
    metaKeywords: [
      'تست سلامت سالمند',
      'ارزیابی سلامت سالمند',
      'آزمایش سلامت سالمند',
      'چک لیست سلامت سالمند',
      'ارزیابی جامع سالمند',
    ],
    shortDescription:
      'بررسی کلی و جامع وضعیت حافظه، تحرک، تغذیه، ایمنی و مدیریت دارو برای شناسایی زودهنگام نیاز به مراقبت.',
    durationMinutes: 5,
    icon: HeartPulse,
    accentGradientFrom: 'from-rose-500',
    accentGradientTo: 'to-orange-500',
    categories: ['elderly-general'],
    featured: true,
    stages: [
      { kind: 'start', title: 'شروع', startQuestionIndex: 0, endQuestionIndexExclusive: 3 },
      { kind: 'awareness', title: 'شناخت', startQuestionIndex: 3, endQuestionIndexExclusive: 7 },
      { kind: 'evaluation', title: 'بررسی', startQuestionIndex: 7, endQuestionIndexExclusive: 12 },
      { kind: 'result', title: 'نتیجه', startQuestionIndex: 12, endQuestionIndexExclusive: 12 },
    ],
    questions: [
      {
        id: 'eh-q1',
        categoryTag: 'mobility',
        text: 'در یک روز معمولی، سالمند چگونه راه می‌رود؟',
        description: 'به‌طور متوسط و بدون کمک گرفتن از دیوار یا چیزهای دیگر.',
        options: [
          { id: 'a', label: 'راحت و بدون کمک', score: 5 },
          { id: 'b', label: 'آهسته یا کمی احتیاط می‌کند', score: 4 },
          { id: 'c', label: 'با عصا یا وسیله کمکی', score: 3 },
          { id: 'd', label: 'با کمک فرد دیگر', score: 2 },
          { id: 'e', label: 'تقریباً ناتوان از راه رفتن', score: 1 },
        ],
      },
      {
        id: 'eh-q2',
        categoryTag: 'memory',
        text: 'آیا به یاد آوردن رویدادهای اخیر برایش دشوار است؟',
        description: 'مثل جایی که وسایل را گذاشته، یا برنامه روز.',
        options: [
          { id: 'a', label: 'تقریباً هرگز نه', score: 5 },
          { id: 'b', label: 'گاهی گاهی فراموشی‌های کوچک', score: 4 },
          { id: 'c', label: 'چند بار در هفته مشکل دارد', score: 3 },
          { id: 'd', label: 'تقریباً هر روز', score: 2 },
          { id: 'e', label: 'نمی‌تواند رویدادهای همین روز را بیاد بیاورد', score: 1 },
        ],
      },
      {
        id: 'eh-q3',
        categoryTag: 'medication',
        text: 'داروهای روزانه خود را به‌درستی و در زمان درست مصرف می‌کند؟',
        description: 'بدون فراموشی یا مقدار اشتباه.',
        options: [
          { id: 'a', label: 'همیشه بدون نیاز به یادآوری', score: 5 },
          { id: 'b', label: 'کم کم نیاز به یادآوری دارد', score: 4 },
          { id: 'c', label: 'لازم است کسی یادآوری کند', score: 3 },
          { id: 'd', label: 'کسی باید به او کمک کند درست مصرف کند', score: 2 },
          { id: 'e', label: 'کاملاً به دیگران وابسته است', score: 1 },
        ],
      },
      {
        id: 'eh-q4',
        categoryTag: 'nutrition',
        text: 'اشتها و میل به خوردن غذا چگونه است؟',
        options: [
          { id: 'a', label: 'عالی و متعادل', score: 5 },
          { id: 'b', label: 'اکثراً خوب، گاهی کم اشتها', score: 4 },
          { id: 'c', label: 'باید تشویق شود غذا بخورد', score: 3 },
          { id: 'd', label: 'به ندرت و کم کم غذا می‌خورد', score: 2 },
          { id: 'e', label: 'کمتر از دو وعده کامل در روز', score: 1 },
        ],
      },
      {
        id: 'eh-q5',
        categoryTag: 'daily_living',
        text: 'برای لباس‌پوشیدن و حمام کردن چه‌قدر مستقل است؟',
        options: [
          { id: 'a', label: 'کاملاً مستقل', score: 5 },
          { id: 'b', label: 'کم کم در موارد خاص کمک نیاز دارد', score: 4 },
          { id: 'c', label: 'برای حمام یا لباس‌پوشیدن کمک لازم است', score: 3 },
          { id: 'd', label: 'اکثر مراحل را دیگران انجام می‌دهند', score: 2 },
          { id: 'e', label: 'کاملاً وابسته', score: 1 },
        ],
      },
      {
        id: 'eh-q6',
        categoryTag: 'mobility',
        text: 'در ۶ ماه گذشته تجربه سقوط یا سرخوردن داشته؟',
        options: [
          { id: 'a', label: 'اصلاً خیر', score: 5 },
          { id: 'b', label: 'یک‌بار سر خوردن بدون آسیب', score: 4 },
          { id: 'c', label: 'یک‌بار سقوط بدون آسیب جدی', score: 3 },
          { id: 'd', label: 'دو بار یا بیشتر سقوط', score: 2 },
          { id: 'e', label: 'سقوط منجر به آسیب یا بستری', score: 1 },
        ],
      },
      {
        id: 'eh-q7',
        categoryTag: 'home_safety',
        text: 'حمام و راهروهای خانه دارای نور کافی و دستگیره ایمنی هستند؟',
        options: [
          { id: 'a', label: 'همه موارد مناسب هستند', score: 5 },
          { id: 'b', label: 'اکثراً مناسب است، جزئیات کم دارد', score: 4 },
          { id: 'c', label: 'نور کافی ولی دستگیره کم است', score: 3 },
          { id: 'd', label: 'هم نور کم و هم دستگیره ندارند', score: 2 },
          { id: 'e', label: 'فرش سر خورده و محیط ناامن', score: 1 },
        ],
      },
      {
        id: 'eh-q8',
        categoryTag: 'mood',
        text: 'در یک هفته معمولی، چقدر احساس خوشحالی، انرژی و اشتیاق دارد؟',
        options: [
          { id: 'a', label: 'اکثر روزها خوشحال و با انرژی', score: 5 },
          { id: 'b', label: 'گاهی بی‌حال ولی به سرعت بهتر می‌شود', score: 4 },
          { id: 'c', label: 'چند روز در هفته بی‌حال و کم‌رو', score: 3 },
          { id: 'd', label: 'اکثر روزها بی‌انگیزه یا غمگین', score: 2 },
          { id: 'e', label: 'کمتر در تعامل با دیگران است و بی‌علاقه', score: 1 },
        ],
      },
      {
        id: 'eh-q9',
        categoryTag: 'senses',
        text: 'بینایی و شنوایی برای برقراری ارتباط چگونه است؟',
        options: [
          { id: 'a', label: 'عالی یا با عینک/سمعک مناسب', score: 5 },
          { id: 'b', label: 'اخیراً کمی ضعیف‌تر شده', score: 4 },
          { id: 'c', label: 'گاهی در گفتگو یا دیدن TV مشکل دارد', score: 3 },
          { id: 'd', label: 'به سختی می‌شنود یا می‌بیند', score: 2 },
          { id: 'e', label: 'تقریباً ناتوان از دیدن یا شنیدن', score: 1 },
        ],
      },
      {
        id: 'eh-q10',
        categoryTag: 'memory',
        text: 'یادآوری نام نزدیکان و وقایع مهم گذشته چگونه است؟',
        options: [
          { id: 'a', label: 'به خوبی سال‌های قبل را به یاد می‌آورد', score: 5 },
          { id: 'b', label: 'نام‌ها را کم کم اشتباه می‌گوید', score: 4 },
          { id: 'c', label: 'با چند سوال به یاد می‌آورد', score: 3 },
          { id: 'd', label: 'نام بعضی بستگان را فراموش کرده', score: 2 },
          { id: 'e', label: 'به سختی افراد را می‌شناسد', score: 1 },
        ],
      },
      {
        id: 'eh-q11',
        categoryTag: 'medication',
        text: 'تعداد داروهای روزانه چند عدد است؟',
        description: 'شامل قرص، کپسول و قطره‌های روتین (بدون مصرف موقت).',
        options: [
          { id: 'a', label: 'هیچ یا ۱ تا ۲ عدد', score: 5 },
          { id: 'b', label: '۳ تا ۴ عدد', score: 4 },
          { id: 'c', label: '۵ تا ۶ عدد', score: 3 },
          { id: 'd', label: '۷ تا ۹ عدد', score: 2 },
          { id: 'e', label: '۱۰ عدد یا بیشتر', score: 1 },
        ],
      },
      {
        id: 'eh-q12',
        categoryTag: 'daily_living',
        text: 'آیا قادر است مدیریت خانه (خرید، صورت‌حساب‌ها و تلفن) را به‌تنهایی انجام دهد؟',
        options: [
          { id: 'a', label: 'کاملاً بدون مشکل', score: 5 },
          { id: 'b', label: 'کم کم برای خرید یا محاسبه نیاز به کمک دارد', score: 4 },
          { id: 'c', label: 'باید کسی همراهی کند', score: 3 },
          { id: 'd', label: 'اکثر امور را دیگران انجام می‌دهند', score: 2 },
          { id: 'e', label: 'کاملاً غیرقابل انجام', score: 1 },
        ],
      },
    ],
    scoring: {
      thresholds: { low: 49, mid: 74 },
    },
    recommendations: {
      low: {
        level: 'low',
        title: 'وضعیت مطلوب؛ ادامه همین سبک زندگی',
        description:
          'براساس پاسخ‌ها، وضعیت کلی سالمند خانواده در محدوده مطلوبی قرار دارد. پیشنهاد می‌کنیم این تست را هر ۳ تا ۶ ماه تکرار کنید تا تغییرات کوچک را زودتر متوجه شوید.',
        primaryCtaLabel: 'آشنایی با خدمات پیشگیرانه سالمندیار',
        primaryCtaHref: '/services',
      },
      medium: {
        level: 'medium',
        title: 'نیازمند توجه و نظارت دوره‌ای',
        description:
          'ممکن است مراقبت و نظارت دوره‌ای برای سالمند شما مفید باشد. مراقبتی روزانه یا ویژیت نیم‌روزه می‌تواند به حفظ استقلال و کیفیت زندگی کمک کند.',
        primaryCtaLabel: 'مشاهده خدمات مراقبت در منزل',
        primaryCtaHref: '/services',
      },
      high: {
        level: 'high',
        title: 'به حمایت و مراقبت بیشتری نیاز دارد',
        description:
          'به نظر می‌رسد سالمند شما ممکن است به حمایت بیشتری در زندگی روزمره، مدیریت دارو یا ایمنی منزل نیاز داشته باشد. مشاوره رایگان تیم سالمندیار می‌تواند به انتخاب سطح مناسب کمک کند.',
        primaryCtaLabel: 'درخواست مشاوره رایگان و فوری پرستار',
        primaryCtaHref: '/portal/home-care/request',
      },
    },
    relatedLinks: [
      { label: 'خدمات مراقبت در منزل', href: '/services' },
      { label: 'مقاله مراقبت از سالمند آلزایمر', href: '/articles' },
    ],
    faqs: [
      {
        id: 1,
        question: 'نتیجه این تست پزشکی محسوب می‌شود؟',
        answer:
          'خیر؛ این تست صرفاً ابزاری آموزشی و غربالگری است و هرگز جایگزین معاینه، تشخیص و درمان پزشک یا متخصص نمی‌شود.',
        displayOrder: 1,
      },
      {
        id: 2,
        question: 'آیا داده‌های این تست ذخیره می‌شود؟',
        answer:
          'پاسخ‌ها فقط روی دستگاه خود شما (در مرورگر) و برای تکمیل تست نگه داشته می‌شوند و به سرور سالمندیار ارسال نمی‌شوند.',
        displayOrder: 2,
      },
    ],
  },

  {
    id: 'memory',
    slug: 'memory',
    title: 'تست حافظه و عملکرد شناختی',
    metaTitle: 'تست حافظه سالمند آنلاین رایگان | ارزیابی شناختی',
    metaDescription:
      'تست غربالگری حافظه سالمند برای بررسی سریع عملکرد شناختی، جهت‌یابی و حافظه کوتاه‌مدت. بدون ثبت‌نام، رایگان و نتایج قابل فهم.',
    shortDescription:
      'بررسی اولیه حافظه کوتاه‌مدت و بلندمدت، جهت‌یابی زمان و مکان، و مهارت‌های شناختی روزمره.',
    durationMinutes: 3,
    icon: Brain,
    accentGradientFrom: 'from-violet-500',
    accentGradientTo: 'to-fuchsia-600',
    categories: ['elderly-cognitive'],
    questions: [
      {
        id: 'm-q1',
        categoryTag: 'memory',
        text: 'آیا نام روز و ماه جاری را بدون فکر کردن زیاد می‌گوید؟',
        options: [
          { id: 'a', label: 'همیشه درست', score: 4 },
          { id: 'b', label: 'گاهی در روز یا ماه اشتباه می‌کند', score: 3 },
          { id: 'c', label: 'باید یادآوری شود', score: 2 },
          { id: 'd', label: 'تقریباً نمی‌تواند', score: 1 },
        ],
      },
      {
        id: 'm-q2',
        categoryTag: 'memory',
        text: 'چقدر وسایل روزمره‌اش مثل عینک یا کلید را پیدا می‌کند؟',
        options: [
          { id: 'a', label: 'معمولاً می‌داند کجاست', score: 4 },
          { id: 'b', label: 'گاهی جست‌وجو می‌کند ولی پیدا می‌کند', score: 3 },
          { id: 'c', label: 'خودش پیدا نمی‌کند', score: 2 },
          { id: 'd', label: 'چند بار در روز گم می‌کند', score: 1 },
        ],
      },
      {
        id: 'm-q3',
        categoryTag: 'memory',
        text: 'آیا داستان یا خبر تازه را به‌صورت معنادار نقل می‌کند؟',
        options: [
          { id: 'a', label: 'به خوبی و با جزئیات', score: 4 },
          { id: 'b', label: 'کم کم تکرار می‌کند', score: 3 },
          { id: 'c', label: 'جزئیات را فراموش می‌کند', score: 2 },
          { id: 'd', label: 'تقریباً نمی‌تواند نقل کند', score: 1 },
        ],
      },
      {
        id: 'm-q4',
        categoryTag: 'memory',
        text: 'چند بار اخیراً در آشپزی یا برق/گاز فراموشی کرده؟',
        options: [
          { id: 'a', label: 'اصلاً خیر', score: 4 },
          { id: 'b', label: 'خیلی کم', score: 3 },
          { id: 'c', label: 'چند بار ماه گذشته', score: 2 },
          { id: 'd', label: 'چند بار در هفته اخیر', score: 1 },
        ],
      },
      {
        id: 'm-q5',
        categoryTag: 'memory',
        text: 'افراد آشنا را چقدر می‌شناسد؟',
        options: [
          { id: 'a', label: 'همه بستگان و همسایه‌ها', score: 4 },
          { id: 'b', label: 'فقط نزدیکان', score: 3 },
          { id: 'c', label: 'گاهی در تشخیص اشتباه می‌کند', score: 2 },
          { id: 'd', label: 'کمی سختی در شناخت دارد', score: 1 },
        ],
      },
      {
        id: 'm-q6',
        categoryTag: 'memory',
        text: 'در یک گفتگوی طولانی، چقدر تمرکز و دنبال سؤال می‌ماند؟',
        options: [
          { id: 'a', label: 'کاملاً دنبال می‌کند', score: 4 },
          { id: 'b', label: 'گاهی تمرکزش پخش می‌شود', score: 3 },
          { id: 'c', label: 'باید سؤال تکرار شود', score: 2 },
          { id: 'd', label: 'به سختی با گفتگو همراه می‌شود', score: 1 },
        ],
      },
    ],
    scoring: {
      thresholds: { low: 49, mid: 74 },
    },
    recommendations: {
      low: {
        level: 'low',
        title: 'عملکرد شناختی در محدوده مطلوب',
        description:
          'فعالیت‌های ذهنی روزمره مثل مطالعه، بازی فکری و تعامل اجتماعی می‌تواند تداوم این وضعیت را کمک کند.',
        primaryCtaLabel: 'مقالات تندرستی ذهنی سالمندان',
        primaryCtaHref: '/articles',
      },
      medium: {
        level: 'medium',
        title: 'برای اطمینان بیشتر مشاوره خوب است',
        description:
          'بررسی منظم حافظه و حضور در فعالیت‌های فکری، همراه با مشاوره متخصص، می‌تواند در این مرحله مفید باشد.',
        primaryCtaLabel: 'آشنایی با خدمات سالمندیار',
        primaryCtaHref: '/services',
      },
      high: {
        level: 'high',
        title: 'توصیه می‌شود به‌سرعت با متخصص مشورت شود',
        description:
          'برخی پاسخ‌ها نشان می‌دهد بهتر است عملکرد شناختی سالمند بیشتر بررسی شود. در صورت تمایل می‌توانید از مشاوره رایگان تیم سالمندیار استفاده کنید.',
        primaryCtaLabel: 'درخواست مشاوره فوری پرستار',
        primaryCtaHref: '/portal/home-care/request',
      },
    },
  },

  {
    id: 'fall-risk',
    slug: 'fall-risk',
    title: 'تست ارزیابی خطر سقوط سالمند',
    metaTitle: 'تست خطر سقوط سالمند | غربالگری سریع آنلاین رایگان',
    metaDescription:
      'خطر سقوط سالمند را بر اساس تعادل، سرعت راه رفتن، نیاز به وسیله کمکی و سابقه سقوط تخمین بزنید. بدون ثبت‌نام.',
    shortDescription:
      'تخمین سریع خطر سقوط بر اساس تعادل، سابقه سقوط، مصرف دارو و محیط خانه.',
    durationMinutes: 3,
    icon: Footprints,
    accentGradientFrom: 'from-amber-500',
    accentGradientTo: 'to-rose-500',
    categories: ['elderly-mobility'],
    questions: [
      {
        id: 'f-q1',
        categoryTag: 'mobility',
        text: 'در یک‌تایی و بدون گرفتن، چند ثانیه ایستاده می‌ماند؟',
        options: [
          { id: 'a', label: 'بیش از ۱۰ ثانیه بدون مشکل', score: 4 },
          { id: 'b', label: 'حدود ۵ تا ۱۰ ثانیه', score: 3 },
          { id: 'c', label: 'کمتر از ۵ ثانیه یا احتیاط زیاد', score: 2 },
          { id: 'd', label: 'بدون کمک نمی‌تواند بایستد', score: 1 },
        ],
      },
      {
        id: 'f-q2',
        categoryTag: 'mobility',
        text: 'سرعت راه رفتن در مسیر صاف چگونه است؟',
        options: [
          { id: 'a', label: 'عادی و با ثبات', score: 4 },
          { id: 'b', label: 'کمی آهسته‌تر از قبل', score: 3 },
          { id: 'c', label: 'خیلی آهسته و با تکان', score: 2 },
          { id: 'd', label: 'به سختی حرکت می‌کند', score: 1 },
        ],
      },
      {
        id: 'f-q3',
        categoryTag: 'mobility',
        text: 'آیا در شش ماه گذشته سقوط داشته؟',
        options: [
          { id: 'a', label: 'خیر', score: 4 },
          { id: 'b', label: 'یک‌بار بدون آسیب', score: 3 },
          { id: 'c', label: 'دو بار یا بیشتر بدون آسیب', score: 2 },
          { id: 'd', label: 'حداقل یک‌بار با آسیب/بستری', score: 1 },
        ],
      },
      {
        id: 'f-q4',
        categoryTag: 'medication',
        text: 'آیا داروهایی که خواب‌آور یا افت فشار خون ایجاد می‌کنند مصرف می‌کند؟',
        options: [
          { id: 'a', label: 'نمی‌داند یا خیر', score: 4 },
          { id: 'b', label: 'شاید یکی دو مورد', score: 3 },
          { id: 'c', label: 'بله، چند مورد تحت نظر پزشک', score: 2 },
          { id: 'd', label: 'بله و گاهی سرگیجه یا خواب‌آلودگی زیاد', score: 1 },
        ],
      },
      {
        id: 'f-q5',
        categoryTag: 'mobility',
        text: 'برای بالا و پایین رفتن از چند پله چه‌قدر مشکل دارد؟',
        options: [
          { id: 'a', label: 'کاملاً بدون مشکل', score: 4 },
          { id: 'b', label: 'کم کم به دستگیره یا عصا نیاز دارد', score: 3 },
          { id: 'c', label: 'باید فرد دیگر همراه و کمک کند', score: 2 },
          { id: 'd', label: 'تقریباً غیرممکن است', score: 1 },
        ],
      },
      {
        id: 'f-q6',
        categoryTag: 'home_safety',
        text: 'فرش‌ها، سنگفرش و مسیر حرکت در خانه چگونه است؟',
        options: [
          { id: 'a', label: 'صاف، ثابت و سر خورده ندارند', score: 4 },
          { id: 'b', label: 'اکثراً خوب، چند قسمت نازک', score: 3 },
          { id: 'c', label: 'چند فرش سر خورده یا چراغ کم', score: 2 },
          { id: 'd', label: 'اغلب مسیر ناامن و تاریک', score: 1 },
        ],
      },
    ],
    scoring: {
      thresholds: { low: 49, mid: 74 },
    },
    recommendations: {
      low: {
        level: 'low',
        title: 'خطر سقوط در محدوده پایین',
        description: 'ادامه رعایت نکات ایمنی منزل و معاینات دوره‌ای پیشنهاد می‌شود.',
        primaryCtaLabel: 'مقاله ایمنی منزل برای سالمندان',
        primaryCtaHref: '/articles',
      },
      medium: {
        level: 'medium',
        title: 'نیازمند تدابیر ایمنی و نظارت بیشتر',
        description: 'اصلاح مسیر خانه، دستگیره حمام، نوار لغزنده و همراهی هنگام راه رفتن می‌تواند بسیار کمک کند.',
        primaryCtaLabel: 'مشاهده خدمات مراقبت روزانه',
        primaryCtaHref: '/services',
      },
      high: {
        level: 'high',
        title: 'خطر سقوط بالا؛ اقدام فوری توصیه می‌شود',
        description:
          'به نظر می‌رسد نیازمند تدابیر فوری ایمنی، نوارهای پشتیبان، نورپردازی و حضور همدم در منزل است.',
        primaryCtaLabel: 'درخواست مشاوره فوری و همدم روزانه',
        primaryCtaHref: '/portal/home-care/request',
      },
    },
  },

  {
    id: 'care-needs',
    slug: 'care-needs',
    title: 'تست نیاز به مراقبت و کمک روزانه',
    metaTitle: 'تست نیاز به مراقبت سالمند | میزان حمایت روزانه چقدر؟',
    metaDescription:
      'به کمک این تست، میزان نیاز سالمند به کمک در فعالیت‌های روزمره (حمام، تغذیه، دارو، خانه) را تخمین بزنید.',
    shortDescription:
      'ارزیابی استقلال در فعالیت‌های اساسی زندگی روزمره (ADL) و ابزاری (IADL).',
    durationMinutes: 4,
    icon: HandHeart,
    accentGradientFrom: 'from-teal-500',
    accentGradientTo: 'to-sky-600',
    categories: ['elderly-care'],
    questions: [
      {
        id: 'c-q1',
        categoryTag: 'daily_living',
        text: 'حمام کردن و پاکی بدن را چقدر مستقل انجام می‌دهد؟',
        options: [
          { id: 'a', label: 'کاملاً خودش', score: 4 },
          { id: 'b', label: 'کمک کم برای ورود/خروج از حمام', score: 3 },
          { id: 'c', label: 'باید بدنش را کسی بشوید', score: 2 },
          { id: 'd', label: 'کاملاً وابسته', score: 1 },
        ],
      },
      {
        id: 'c-q2',
        categoryTag: 'daily_living',
        text: 'لباس‌پوشیدن و بستن دکمه، زیپ و بند کفش چگونه است؟',
        options: [
          { id: 'a', label: 'کاملاً مستقل', score: 4 },
          { id: 'b', label: 'کم کم برای دکمه یا بند کفش', score: 3 },
          { id: 'c', label: 'اکثر لباس را دیگران می‌پوشانند', score: 2 },
          { id: 'd', label: 'کاملاً وابسته', score: 1 },
        ],
      },
      {
        id: 'c-q3',
        categoryTag: 'daily_living',
        text: 'رفتن به دستشویی و پاکی آن چقدر به کمک نیاز دارد؟',
        options: [
          { id: 'a', label: 'کاملاً مستقل', score: 4 },
          { id: 'b', label: 'تنها برای بلند شدن یا نشستن کمک', score: 3 },
          { id: 'c', label: 'باید همراه باشد', score: 2 },
          { id: 'd', label: 'کاملاً وابسته یا با تشت', score: 1 },
        ],
      },
      {
        id: 'c-q4',
        categoryTag: 'nutrition',
        text: 'خوردن غذا و نوشیدنی چگونه است؟',
        options: [
          { id: 'a', label: 'خودش غذا می‌خورد و درست انتخاب می‌کند', score: 4 },
          { id: 'b', label: 'کم کم برای برش یا ریختن کمک می‌خواهد', score: 3 },
          { id: 'c', label: 'باید کنارش بنشینند و کمکی کنند', score: 2 },
          { id: 'd', label: 'تقریباً باید تغذیه شود', score: 1 },
        ],
      },
      {
        id: 'c-q5',
        categoryTag: 'daily_living',
        text: 'جابجایی از تخت به صندلی و برعکس چگونه است؟',
        options: [
          { id: 'a', label: 'کاملاً مستقل', score: 4 },
          { id: 'b', label: 'کم کم به وسیله یا دست کمک', score: 3 },
          { id: 'c', label: 'باید کسی کمک کند', score: 2 },
          { id: 'd', label: 'با کمک هم یا lift مخصوص', score: 1 },
        ],
      },
      {
        id: 'c-q6',
        categoryTag: 'medication',
        text: 'مدیریت داروهای روزانه چگونه است؟',
        options: [
          { id: 'a', label: 'خودش جعبه دارو چیده و مصرف می‌کند', score: 4 },
          { id: 'b', label: 'کسی یادآوری می‌کند', score: 3 },
          { id: 'c', label: 'باید کسی درست کند و تحویل بدهد', score: 2 },
          { id: 'd', label: 'کسی باید کمک کند مصرف کند', score: 1 },
        ],
      },
      {
        id: 'c-q7',
        categoryTag: 'daily_living',
        text: 'برای خرید، پرداخت قبض و امور خانه چقدر مستقل است؟',
        options: [
          { id: 'a', label: 'همه کارها را خودش', score: 4 },
          { id: 'b', label: 'خرید سنگین را دیگران انجام می‌دهند', score: 3 },
          { id: 'c', label: 'باید همراه و کمک مالی کند', score: 2 },
          { id: 'd', label: 'کل امور را دیگران انجام می‌دهند', score: 1 },
        ],
      },
    ],
    scoring: {
      thresholds: { low: 49, mid: 74 },
    },
    recommendations: {
      low: {
        level: 'low',
        title: 'استقلال خوب؛ فقط نظارت دوره‌ای کافی است',
        description:
          'برای حفظ استقلال، بازدیدهای دوره‌ای همدم یا پرستار می‌تواند خیال خانواده را راحت کند.',
        primaryCtaLabel: 'دیدن بسته‌های ویژیت نیم‌روزه',
        primaryCtaHref: '/services',
      },
      medium: {
        level: 'medium',
        title: 'مراقبت روزانه یا چند ساعت در روز مفید است',
        description:
          'حضور پرستار یا مراقب در شیفت روزانه می‌تواند کیفیت زندگی را بهبود و فشار خانواده را کاهش دهد.',
        primaryCtaLabel: 'مشاهده شیفت‌های روزانه مراقبت در منزل',
        primaryCtaHref: '/services',
      },
      high: {
        level: 'high',
        title: 'نیاز به حضور مداوم یا شبانه‌روزی',
        description:
          'به احتمال زیاد سالمند شما برای فعالیت‌های روزمره به کمک مداوم نیاز دارد. مشاوره رایگان سالمندیار می‌تواند سطح مناسب را انتخاب کند.',
        primaryCtaLabel: 'درخواست مشاوره فوری پرستار ۲۴ ساعته',
        primaryCtaHref: '/portal/home-care/request',
      },
    },
  },

  {
    id: 'nutrition',
    slug: 'nutrition',
    title: 'تست وضعیت تغذیه سالمند',
    metaTitle: 'تست تغذیه سالمند | ارزیابی سریع انرژی و وزن',
    metaDescription:
      'وضعیت تغذیه سالمند را از نظر اشتها، وزن، تنوع غذا، مشکل جویدن و دریافت مایعات بررسی کنید.',
    shortDescription:
      'ارزیابی سریع کمبود وزن ناخواسته، اشتها، تنوع وعده‌های غذایی و مشکلات بلع.',
    durationMinutes: 3,
    icon: UtensilsCrossed,
    accentGradientFrom: 'from-lime-500',
    accentGradientTo: 'to-emerald-600',
    categories: ['elderly-nutrition'],
    questions: [
      {
        id: 'n-q1',
        categoryTag: 'nutrition',
        text: 'در ۳ ماه گذشته، وزنش چگونه تغییر کرده؟',
        options: [
          { id: 'a', label: 'بدون تغییر یا کمی بالا', score: 4 },
          { id: 'b', label: 'کمتر از ۲ کیلوگرم کاهش', score: 3 },
          { id: 'c', label: 'حدود ۲ تا ۵ کیلوگرم کاهش', score: 2 },
          { id: 'd', label: 'بیش از ۵ کیلوگرم کاهش یا بسیار ناگهانی', score: 1 },
        ],
      },
      {
        id: 'n-q2',
        categoryTag: 'nutrition',
        text: 'طیف غذاها و تنوع وعده‌ها چگونه است؟',
        options: [
          { id: 'a', label: 'شامل گوشت/حبوبات، سبزی، میوه، لبنیات و غلات', score: 4 },
          { id: 'b', label: 'اکثراً تنوع دارد', score: 3 },
          { id: 'c', label: 'همیشه چند غذا یکسان و کم تنوع', score: 2 },
          { id: 'd', label: 'تقریباً فقط سوپ یا نرم‌غذا', score: 1 },
        ],
      },
      {
        id: 'n-q3',
        categoryTag: 'nutrition',
        text: 'در طول روز چه‌قدر آب و مایع مفید می‌نوشد؟',
        options: [
          { id: 'a', label: 'حداقل ۶ تا ۸ لیوان', score: 4 },
          { id: 'b', label: 'حدود ۴ تا ۶ لیوان', score: 3 },
          { id: 'c', label: 'کمتر از ۴ لیوان', score: 2 },
          { id: 'd', label: 'باید تشویق شود مایع بنوشد', score: 1 },
        ],
      },
      {
        id: 'n-q4',
        categoryTag: 'nutrition',
        text: 'جویدن غذا سخت و بلعیدن چگونه است؟',
        options: [
          { id: 'a', label: 'هیچ مشکلی ندارد', score: 4 },
          { id: 'b', label: 'فقط برای غذاهای خیلی سخت', score: 3 },
          { id: 'c', label: 'باید غذا نرم یا رنده شود', score: 2 },
          { id: 'd', label: 'هنگام بلع گلو می‌گیرد یا سرفه می‌کند', score: 1 },
        ],
      },
      {
        id: 'n-q5',
        categoryTag: 'nutrition',
        text: 'علت اصلی کم خوردن اگر وجود دارد چیست؟',
        options: [
          { id: 'a', label: 'اشتها خوب و دلیل خاصی نیست', score: 4 },
          { id: 'b', label: 'دندان یا گلو گاهی درد می‌کند', score: 3 },
          { id: 'c', label: 'دل‌درد، تهوع یا یبوست زیاد', score: 2 },
          { id: 'd', label: 'کم اشتهای مداوم و دل‌بستگی', score: 1 },
        ],
      },
      {
        id: 'n-q6',
        categoryTag: 'nutrition',
        text: 'چقدر به تنهایی قادر به آماده کردن وعده غذای کامل است؟',
        options: [
          { id: 'a', label: 'کاملاً مستقل', score: 4 },
          { id: 'b', label: 'کم کم برای خرید یا برش مواد', score: 3 },
          { id: 'c', label: 'باید آماده تحویل بگیرند یا کسی بپزد', score: 2 },
          { id: 'd', label: 'کاملاً به دیگران وابسته است', score: 1 },
        ],
      },
    ],
    scoring: {
      thresholds: { low: 49, mid: 74 },
    },
    recommendations: {
      low: {
        level: 'low',
        title: 'وضعیت تغذیه در محدوده مطلوب',
        description: 'ادامه وعده‌های منظم و تنوع‌دار همراه با بررسی دوره‌ای وزن پیشنهاد می‌شود.',
        primaryCtaLabel: 'مقالات تغذیه سالمندان',
        primaryCtaHref: '/articles',
      },
      medium: {
        level: 'medium',
        title: 'برنامه غذایی و نظارت هفتگی مفید خواهد بود',
        description:
          'برنامه غذایی مناسب سن و بیماری‌ها همراه با نظارت پرستار در روزهای مشخص می‌تواند به جذب بهتر کمک کند.',
        primaryCtaLabel: 'مشاهده خدمات پرستاری شامل برنامه تغذیه',
        primaryCtaHref: '/services',
      },
      high: {
        level: 'high',
        title: 'ممکن است به ارزیابی تخصصی تغذیه نیاز باشد',
        description:
          'کاهش وزن ناگهانی یا مشکل در بلع، نیازمند بررسی سریع توسط پزشک یا متخصص تغذیه است. در صورت تمایل همدم مراقبت روزانه می‌تواند به درست کردن غذا و تغذیه کمک کند.',
        primaryCtaLabel: 'درخواست مشاوره رایگان با کارشناس',
        primaryCtaHref: '/portal/home-care/request',
      },
    },
  },

  {
    id: 'home-safety',
    slug: 'home-safety',
    title: 'تست ایمنی منزل برای سالمند',
    metaTitle: 'چک لیست ایمنی منزل سالمند | سالمندیار',
    metaDescription:
      'ایمنی حمام، پله‌ها، نورپردازی، لوازم برقی و مبلمان منزل از نظر سالمند را با این تست بررسی کنید.',
    shortDescription:
      'چک لیست ایمنی سراسری منزل برای کاهش خطر سقوط، سوختگی و حوادث دیگر.',
    durationMinutes: 3,
    icon: Home,
    accentGradientFrom: 'from-indigo-500',
    accentGradientTo: 'to-blue-600',
    categories: ['elderly-home'],
    questions: [
      {
        id: 'h-q1',
        categoryTag: 'home_safety',
        text: 'مسیر حرکت بین اتاق‌ها عاری از فرش سرخورده، سیم و وسایل است؟',
        options: [
          { id: 'a', label: 'کاملاً تمیز و عاری از مانع', score: 4 },
          { id: 'b', label: 'اکثر مسیرها خوب، یک دو مورد جزئی', score: 3 },
          { id: 'c', label: 'چند مانع یا فرش سر خورده', score: 2 },
          { id: 'd', label: 'اغلب مسیر دارای مانع', score: 1 },
        ],
      },
      {
        id: 'h-q2',
        categoryTag: 'home_safety',
        text: 'حمام و دستشویی دارای دستگیره و پاشنه لغزنده هستند؟',
        options: [
          { id: 'a', label: 'همه موارد موجود است', score: 4 },
          { id: 'b', label: 'فقط یکی از دو دستگیره یا پاشنه', score: 3 },
          { id: 'c', label: 'هیچ‌کدام ندارند ولی حمام کمی خطر دارد', score: 2 },
          { id: 'd', label: 'حمام بسیار لغزنده و بدون دستگیره', score: 1 },
        ],
      },
      {
        id: 'h-q3',
        categoryTag: 'home_safety',
        text: 'پله‌ها دارای نردبان، دستگیره و نور مناسب هستند؟',
        options: [
          { id: 'a', label: 'همه موارد کامل', score: 4 },
          { id: 'b', label: 'نور یا دستگیره کمی ضعیف', score: 3 },
          { id: 'c', label: 'نردبان یا نور کم و چوب نازک', score: 2 },
          { id: 'd', label: 'بدون دستگیره، نور کم و ناامن', score: 1 },
        ],
      },
      {
        id: 'h-q4',
        categoryTag: 'home_safety',
        text: 'لوله گاز، شیرآلات و وسایل گرمایشی دوره‌ای بررسی می‌شوند؟',
        options: [
          { id: 'a', label: 'بله، توسط کارشناس هر سال', score: 4 },
          { id: 'b', label: 'گاهی توسط خود خانواده', score: 3 },
          { id: 'c', label: 'بیش از دو سال نیست بررسی شده', score: 2 },
          { id: 'd', label: 'هیچ‌گاه توسط متخصص بررسی نشده', score: 1 },
        ],
      },
      {
        id: 'h-q5',
        categoryTag: 'home_safety',
        text: 'آیا دزدگیر، اعلان حریق یا دتکتور گاز نصب است؟',
        options: [
          { id: 'a', label: 'حداقل دو مورد نصب و فعال', score: 4 },
          { id: 'b', label: 'یک مورد نصب و فعال', score: 3 },
          { id: 'c', label: 'نصب شده ولی فعال یا سالم نیست', score: 2 },
          { id: 'd', label: 'هیچ‌کدام ندارند', score: 1 },
        ],
      },
      {
        id: 'h-q6',
        categoryTag: 'home_safety',
        text: 'کلید، تلفن، آبخوری و دفترچه دارو در دسترس راحت هستند؟',
        options: [
          { id: 'a', label: 'همه در نزدیکی تخت و مبل اصلی در دسترس', score: 4 },
          { id: 'b', label: 'اکثر موارد در دسترس', score: 3 },
          { id: 'c', label: 'باید چند قدم راه برود', score: 2 },
          { id: 'd', label: 'در دسترس راحت نیستند', score: 1 },
        ],
      },
      {
        id: 'h-q7',
        categoryTag: 'home_safety',
        text: 'نورپردازی راهرو و اطراف تخت برای شب چگونه است؟',
        options: [
          { id: 'a', label: 'چراغ خواب یا سنسور حرکتی مناسب', score: 4 },
          { id: 'b', label: 'چراغ کم نور دارد', score: 3 },
          { id: 'c', label: 'باید مسیر را لمسی بیابد', score: 2 },
          { id: 'd', label: 'کاملاً تاریک و ناامن', score: 1 },
        ],
      },
    ],
    scoring: {
      thresholds: { low: 49, mid: 74 },
    },
    recommendations: {
      low: {
        level: 'low',
        title: 'خانه تا حد زیادی ایمن است',
        description: 'بررسی سالانه نرده‌ها، شیرآلات و سنسورها برای حفظ ایمنی پیشنهاد می‌شود.',
        primaryCtaLabel: 'مقاله کامل راه‌اندازی خانه سالمندی',
        primaryCtaHref: '/articles',
      },
      medium: {
        level: 'medium',
        title: 'اصلاحات ایمنی ساده می‌تواند خطر را کاهش دهد',
        description:
          'نصب دستگیره حمام، پاشنه لغزنده، چراغ سنسوری و نردبان پله را در اولویت قرار دهید. همدم روزانه می‌تواند به چک کردن ایمنی روزانه کمک کند.',
        primaryCtaLabel: 'مشاهده خدمات بازدید دوره‌ای و ایمن‌سازی منزل',
        primaryCtaHref: '/services',
      },
      high: {
        level: 'high',
        title: 'نیاز به ایمن‌سازی فوری و نظارت',
        description:
          'برخی موارد خانه خطرساز هستند؛ پیشنهاد می‌شود قبل از هر کاری برای دستگیره، نور، سنسور گاز و آتش و نرده اقدام کنید. در صورت تمایل، حضور مداوم پرستار در منزل می‌تواند خیال خانواده را راحت کند.',
        primaryCtaLabel: 'درخواست مشاوره فوری برای مراقبت در منزل',
        primaryCtaHref: '/portal/home-care/request',
      },
    },
  },
];

export function getHealthTestBySlug(slug: string): HealthTest | undefined {
  return HEALTH_TESTS.find(t => t.slug === slug);
}

export function listFeaturedHealthTests(): HealthTest[] {
  return HEALTH_TESTS.filter(t => t.featured).concat(
    HEALTH_TESTS.filter(t => !t.featured),
  );
}
