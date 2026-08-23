import type {
  Article,
  Author,
  ContentCategory,
  ServiceSeoProfile,
  Disease,
  City,
  HealthTool,
  FAQItem,
  ContentTag,
  Guide,
} from '@/lib/types/content';

export const authors: Author[] = [
  {
    id: 1,
    firstName: 'نسرین',
    lastName: 'رضایی',
    fullName: 'نسرین رضایی',
    title: 'پرستار ارشد',
    specialization: 'پرستاری ویژه و مراقبت از سالمند',
    biography: 'پرستار ارشد با بیش از ۱۵ سال سابقه در بخش‌های ICU و مراقبت ویژه بیمارستان‌های تهران. مدرک کارشناسی ارشد پرستاری از دانشگاه علوم پزشکی تهران.',
    experienceSummary: 'متخصص مراقبت از بیماران کرونایی، سالمندان دچار آلزایمر و بیماران تخت بخواب.',
    yearsOfExperience: 15,
    profileImageUrl: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Professional%20nurse%20portrait%20iranian%20woman%20with%20headscarf%20friendly%20smile%20hospital%20background&image_size=square',
    medicalLicenseNumber: 'N-98-12345',
    email: 'n.rezaei@salmandyar.com',
    slug: 'nasrin-rezaei',
    isMedicalReviewer: true,
  },
  {
    id: 2,
    firstName: 'محمد',
    lastName: 'کریمی',
    fullName: 'محمد کریمی',
    title: 'دکتر عمومی',
    specialization: 'سلامت سالمندی و بیماری‌های مزمن',
    biography: 'پزشک عمومی با ۱۲ سال تجربه در مراقبت از بیماری‌های مزمن مثل دیابت و فشار خون بالا در منزل.',
    yearsOfExperience: 12,
    profileImageUrl: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=Professional%20doctor%20portrait%20iranian%20man%20friendly%20smile%20clinic%20background&image_size=square',
    medicalLicenseNumber: 'M-95-67890',
    slug: 'mohammad-karimi',
    isMedicalReviewer: true,
  },
  {
    id: 3,
    firstName: 'سارا',
    lastName: 'احمدی',
    fullName: 'سارا احمدی',
    title: 'کارشناس تغذیه بالینی',
    specialization: 'تغذیه در سالمندی و بعد از عمل',
    biography: 'کارشناس تغذیه بالینی با تمرکز بر برنامه‌های غذایی اختصاصی برای سالمندان و بیماران در حال نقاهت.',
    yearsOfExperience: 8,
    slug: 'sara-ahmadi',
    isMedicalReviewer: false,
  },
];

export const contentCategories: ContentCategory[] = [
  {
    id: 1,
    name: 'مراقبت از سالمند',
    slug: 'elderly-care',
    description: 'مقالات تخصصی در مورد مراقبت صحیح از سالمندان در منزل',
    displayOrder: 1,
    metaTitle: 'راهنمای جامع مراقبت از سالمند در منزل | سالمندیار',
    metaDescription: 'آموزش‌های تخصصی پرستاری در مورد مراقبت روزانه از سالمند، پیشگیری از سقوط، تغذیه مناسب و مدیریت دارو.',
    isActive: true,
    showInMenu: true,
  },
  {
    id: 2,
    name: 'بیماری‌های مزمن',
    slug: 'chronic-diseases',
    description: 'راهنمای مدیریت بیماری‌های مزمن مثل دیابت، فشار خون و آرتروز در منزل',
    displayOrder: 2,
    metaTitle: 'مدیریت بیماری‌های مزمن در منزل | سالمندیار',
    metaDescription: 'راهنمای پزشکی در مورد مدیریت دیابت، فشار خون بالا، نارسایی قلبی و سایر بیماری‌های مزمن در منزل.',
    isActive: true,
    showInMenu: true,
  },
  {
    id: 3,
    name: 'آموزش پرستاری',
    slug: 'nursing-guides',
    description: 'آموزش‌های گام به گام پرستاری در منزل',
    displayOrder: 3,
    metaTitle: 'آموزش‌های پرستاری در منزل | سالمندیار',
    metaDescription: 'آموزش‌های تصویری و متنی پرستاری مثل پانسمان زخم، تزریق، ساکشن و مراقبت از بیمار تخت بخواب.',
    isActive: true,
    showInMenu: true,
  },
  {
    id: 4,
    name: 'سلامت روان',
    slug: 'mental-health',
    description: 'سلامت روان سالمندان و خانواده‌ها',
    displayOrder: 4,
    isActive: true,
    showInMenu: true,
  },
  {
    id: 5,
    name: 'تغذیه سالم',
    slug: 'nutrition',
    description: 'برنامه‌های غذایی سالم برای سالمندان و بیماران',
    displayOrder: 5,
    isActive: true,
    showInMenu: true,
  },
  {
    id: 6,
    name: 'قبل و بعد از عمل',
    slug: 'surgery-care',
    description: 'مراقبت‌های قبل و بعد از جراحی در منزل',
    displayOrder: 6,
    parentId: 3,
    isActive: true,
    showInMenu: true,
  },
];

export const contentTags: ContentTag[] = [
  { id: 1, name: 'زخم بستر', slug: 'pressure-ulcer', description: 'پیشگیری و درمان زخم بستر' },
  { id: 2, name: 'آلزایمر', slug: 'alzheimer', description: 'مدیریت بیماری آلزایمر' },
  { id: 3, name: 'دیابت', slug: 'diabetes', description: 'مدیریت دیابت در منزل' },
  { id: 4, name: 'پانسمان', slug: 'wound-care', description: 'آموزش پانسمان صحیح' },
  { id: 5, name: 'فشار خون', slug: 'hypertension', description: 'کنترل فشار خون بالا' },
  { id: 6, name: 'سکته مغزی', slug: 'stroke', description: 'مراقبت پس از سکته مغزی' },
];

const now = new Date().toISOString();

export const articles: Article[] = [
  {
    id: 1,
    title: 'مراقبت کامل از بیمار سکته مغزی در منزل: راهنمای قدم به قدم',
    slug: 'stroke-patient-home-care',
    content: `<h2>سکته مغزی چیست؟</h2>
<p>سکته مغزی زمانی رخ می‌دهد که جریان خون به بخشی از مغز قطع یا کاهش یابد. پس از درمان اولیه در بیمارستان، مراقبت در منزل نقش تعیین‌کننده‌ای در بهبود بیمار دارد.</p>
<h2>مراحل مراقبت در منزل</h2>
<ol>
<li><strong>کنترل علائم حیاتی:</strong> روزانه فشار خون، قند خون و نبض را اندازه‌گیری کنید.</li>
<li><strong>فیزیوتراپی منظم:</strong> تمرینات حرکتی طبق برنامه پزشک را فراموش نکنید.</li>
<li><strong>تغذیه مناسب:</strong> رژیم غذایی کم نمک و کم چربی با سبزیجات فراوان.</li>
<li><strong>مراقبت روانی:</strong> بیمار را در فعالیت‌های روزانه مشارکت دهید.</li>
</ol>
<h2>چه زمانی باید به پزشک مراجعه کنیم؟</h2>
<ul>
<li>افزایش ناگهانی فشار خون</li>
<li>ضعف یا بی‌حسی جدید در یک طرف بدن</li>
<li>مشکل در صحبت کردن یا درک</li>
<li>سردرد شدید و ناگهانی</li>
</ul>`,
    shortAnswer:
      'مراقبت از بیمار سکته مغزی در منزل شامل کنترل منظم علائم حیاتی، فیزیوتراپی روزانه، تغذیه سالم و حمایت روانی است. مهم‌ترین نکته پیروی دقیق از برنامه درمانی و مراجعه منظم به پزشک متخصص است.',
    excerpt:
      'پس از سکته مغزی، مراقبت در منزل نقش کلیدی در بهبود بیمار دارد. از کنترل فشار خون گرفته تا تمرینات فیزیوتراپی، هر مرحله باید با دقت انجام شود.',
    estimatedReadingTimeMinutes: 8,
    featuredImageUrl:
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=elderly%20stroke%20patient%20home%20care%20nurse%20helping%20physical%20therapy%20warm%20lighting%20professional&image_size=landscape_16_9',
    ogImageUrl:
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=elderly%20stroke%20patient%20home%20care%20nurse%20helping%20physical%20therapy%20warm%20lighting%20professional&image_size=landscape_16_9',
    metaTitle: 'مراقبت از بیمار سکته مغزی در منزل | راهنمای کامل ۱۴۰۴ | سالمندیار',
    metaDescription:
      'آموزش کامل مراقبت از بیمار سکته مغزی در منزل: فیزیوتراپی، کنترل فشار خون، تغذیه مناسب و کاهش خطر سکته مجدد. تایید شده توسط متخصص سلامت.',
    primaryKeyword: 'مراقبت از بیمار سکته مغزی در منزل',
    secondaryKeywords: ['سکته مغزی', 'پرستاری در منزل', 'فیزیوتراپی پس از سکته'],
    status: 'Published',
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdatedAt: now,
    authorId: 1,
    author: authors[0],
    categoryId: 2,
    category: contentCategories[1],
    diseaseId: 1,
    viewCount: 1247,
    isFeatured: true,
    isMedicalContent: true,
    isFactChecked: true,
    tags: [contentTags[5]],
    medicalReviews: [
      {
        id: 1,
        medicalReviewer: authors[1],
        reviewNotes: 'محتوا از نظر پزشکی دقیق و بر اساس آخرین دستورالعمل‌ها است.',
        isApproved: true,
        reviewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    sources: [
      {
        id: 1,
        title: 'American Stroke Association Guidelines for Post-Stroke Care',
        url: 'https://www.stroke.org',
        publisher: 'American Heart Association',
        publicationYear: 2024,
      },
    ],
    faqs: [
      {
        id: 1,
        question: 'آیا پرستار در منزل برای بیمار سکته مغزی ضروری است؟',
        answer:
          'بله، بخصوص در ماه‌های اول پس از سکته، پرستار ماهر می‌تواند در انجام تمرینات، کنترل داروها و جلوگیری از عوارض مثل زخم بستر کمک شایانی کند.',
        displayOrder: 1,
      },
      {
        id: 2,
        question: 'بهترین رژیم غذایی برای بیمار سکته مغزی چیست؟',
        answer:
          'رژیم غذایی سرشار از میوه و سبزیجات، غلات کامل، ماهی‌های چرب ( امگا ۳ ) و کم نمک و کم چربی اشباع است. از غذاهای فرآوری شده اجتناب کنید.',
        displayOrder: 2,
      },
      {
        id: 3,
        question: 'چند بار در هفته فیزیوتراپی لازم است؟',
        answer:
          'در ماه‌های اول معمولاً ۳ تا ۵ جلسه در هفته توصیه می‌شود. سپس با بهبود بیمار، تعداد جلسات کاهش می‌یابد.',
        displayOrder: 3,
      },
    ],
  },
  {
    id: 2,
    title: 'پیشگیری و درمان زخم بستر در بیماران تخت بخواب',
    slug: 'pressure-ulcer-prevention-treatment',
    content: `<h2>زخم بستر چیست؟</h2>
<p>زخم بستر آسیبی پوستی است که در اثر فشار طولانی‌مدت به پوست رخ می‌دهد. بیماران تخت بخواب و سالمندان مبتلا به آلزایمر بیشتر در معرض خطر هستند.</p>
<h2>پیشگیری از زخم بستر</h2>
<ul>
<li>تغییر وضعیت بدن هر ۲ ساعت</li>
<li>استفاده از تشک طبی ضد زخم</li>
<li>رعایت بهداشت پوست و حفظ رطوبت متعادل</li>
<li>تغذیه مناسب با پروتئین کافی</li>
</ul>`,
    shortAnswer:
      'برای پیشگیری از زخم بستر باید هر ۲ ساعت وضعیت بیمار را تغییر دهید، از تشک طبی استفاده کنید و پوست را تمیز و مرطوب نگه دارید. در صورت ایجاد زخم، سریعاً با پزشک یا پرستار مشورت کنید.',
    excerpt:
      'زخم بستر یکی از شایع‌ترین عوارض در بیماران تخت بخواب است. با اقدامات ساده اما منظم می‌توان از بروز آن جلوگیری کرد.',
    estimatedReadingTimeMinutes: 6,
    featuredImageUrl:
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=nurse%20treating%20bed%20sore%20pressure%20ulcer%20elderly%20patient%20home%20medical%20professional%20clean&image_size=landscape_16_9',
    metaTitle: 'پیشگیری و درمان زخم بستر در منزل | راهنمای کامل | سالمندیار',
    metaDescription:
      'راهنمای تخصصی پیشگیری از زخم بستر در بیماران تخت بخواب و سالمندان. مراحل درمان صحیح زخم و انتخاب تشک طبی مناسب.',
    primaryKeyword: 'پیشگیری از زخم بستر',
    status: 'Published',
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdatedAt: now,
    authorId: 1,
    author: authors[0],
    categoryId: 3,
    category: contentCategories[2],
    viewCount: 892,
    isFeatured: true,
    isMedicalContent: true,
    isFactChecked: true,
    tags: [contentTags[0], contentTags[3]],
    faqs: [
      {
        id: 4,
        question: 'بهترین تشک برای جلوگیری از زخم بستر کدام است؟',
        answer:
          'تشک‌های هوایی باد شونده و تشک‌های ژل بهترین گزینه‌ها هستند. برای بیماران سنگین، تشک‌های با چگالی بالا توصیه می‌شود.',
        displayOrder: 1,
      },
    ],
  },
  {
    id: 3,
    title: 'مدیریت دیابت در سالمندان: راهنمای کامل برای خانواده',
    slug: 'diabetes-management-elderly',
    content: `<h2>دیابت در سالمندان</h2>
<p>دیابت نوع ۲ در سالمندان شایع‌تر است و می‌تواند عوارض جدی مانند آسیب کلیه، از بین رفتن بینایی و سکته داشته باشد.</p>
<h2>کنترل روزانه</h2>
<ul>
<li>اندازه‌گیری منظم قند خون ناشتا و بعد از غذا</li>
<li>تزریق منظم انسولین یا مصرف دارو طبق برنامه</li>
<li>بررسی روزانه پاها برای زخم یا عفونت</li>
</ul>`,
    shortAnswer:
      'مدیریت دیابت در سالمندان نیازمند اندازه‌گیری منظم قند خون، رژیم غذایی سالم، ورزش روزانه و مصرف دقیق داروها است. بررسی روزانه پاها و چشم‌پزشکی سالانه ضروری است.',
    excerpt:
      'قند خون کنترل نشده در سالمندان می‌تواند منجر به عوارض جدی شود. با یک برنامه مدیریتی دقیق می‌توان کیفیت زندگی را بهبود بخشید.',
    estimatedReadingTimeMinutes: 7,
    featuredImageUrl:
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=elderly%20diabetes%20blood%20sugar%20measurement%20nurse%20helping%20home%20care%20professional%20warm&image_size=landscape_16_9',
    metaTitle: 'مدیریت دیابت در سالمندان در منزل | راهنمای ۱۴۰۴ | سالمندیار',
    metaDescription:
      'راهنمای جامع کنترل دیابت نوع ۲ در سالمندان: اندازه‌گیری قند خون، رژیم غذایی، تزریق انسولین و جلوگیری از عوارض پا و چشم.',
    primaryKeyword: 'مدیریت دیابت در سالمندان',
    status: 'Published',
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdatedAt: now,
    authorId: 2,
    author: authors[1],
    categoryId: 2,
    category: contentCategories[1],
    viewCount: 1534,
    isFeatured: false,
    isMedicalContent: true,
    isFactChecked: true,
    tags: [contentTags[2]],
  },
  {
    id: 4,
    title: 'کاهش ریسک سقوط در سالمندان: ۱۰ نکته کاربردی در منزل',
    slug: 'fall-prevention-elderly-home',
    content: `<h2>چرا سالمندان بیشتر سقوط می‌کنند؟</h2>
<p>کاهش بینایی، ضعف ماهیچه‌ها، بیماری‌های داخلی و اثرات داروها از عوامل اصلی سقوط در سالمندان است.</p>`,
    excerpt:
      'سقوط از علل اصلی مراجعه سالمندان به اورژانس است. با تغییرات ساده در محیط منزل می‌توان ریسک سقوط را تا ۵۰ درصد کاهش داد.',
    estimatedReadingTimeMinutes: 5,
    featuredImageUrl:
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=safe%20elderly%20home%20grab%20bars%20bathroom%20fall%20prevention%20bright%20clean%20modern%20house&image_size=landscape_16_9',
    metaTitle: '۱۰ راهکار کاهش ریسک سقوط سالمندان در منزل | سالمندیار',
    metaDescription:
      'پیشگیری از سقوط سالمندان: نصب دستگیره حمام، نورپردازی مناسب، انتخاب کفش ایمن و ورزش‌های تعادلی. راهنمای کاربردی برای خانواده‌ها.',
    primaryKeyword: 'پیشگیری از سقوط سالمندان',
    status: 'Published',
    publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdatedAt: now,
    authorId: 1,
    author: authors[0],
    categoryId: 1,
    category: contentCategories[0],
    viewCount: 2100,
    isFeatured: true,
    isMedicalContent: false,
    isFactChecked: true,
  },
  {
    id: 5,
    title: 'پرستاری از بیمار آلزایمر: چالش‌ها و راهکارها',
    slug: 'alzheimer-patient-care',
    content: `<h2>بیماری آلزایمر چیست؟</h2>
<p>آلزایمر شایع‌ترین نوع زوال عقل است که با از دست دادن تدریجی حافظه و مهارت‌های ذهنی همراه است.</p>`,
    excerpt:
      'مراقبت از بیمار آلزایمر نیازمند صبر، دانش و برنامه‌ریزی است. ایجاد یک روتیمن ثابت و محیط امن، کلید موفقیت است.',
    estimatedReadingTimeMinutes: 10,
    featuredImageUrl:
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=caregiver%20nurse%20caring%20for%20elderly%20alzheimer%20patient%20gentle%20warm%20home%20environment%20professional&image_size=landscape_16_9',
    metaTitle: 'پرستاری از بیمار آلزایمر در منزل | راهنمای تخصصی | سالمندیار',
    metaDescription:
      'راهنمای کامل مراقبت از بیمار مبتلا به آلزایمر: مدیریت رفتارهای پرخاشگر، خلق‌وخوی متغیر، بهبود کیفیت خواب و تقویت حافظه.',
    primaryKeyword: 'مراقبت از بیمار آلزایمر',
    status: 'Published',
    publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdatedAt: now,
    authorId: 1,
    author: authors[0],
    categoryId: 1,
    category: contentCategories[0],
    viewCount: 1876,
    isFeatured: false,
    isMedicalContent: true,
    isFactChecked: true,
    tags: [contentTags[1]],
  },
  {
    id: 6,
    title: 'تغذیه مناسب برای سالمندان: ۷ اصل طلایی',
    slug: 'elderly-nutrition-guide',
    content: `<h2>تغذیه در سالمندی</h2>
<p>با افزایش سن، متابولیسم کاهش یافته و نیازهای غذایی تغییر می‌کند.</p>`,
    excerpt:
      'رژیم غذایی صحیح در سالمندی می‌تواند خطر بیماری‌های مزمن را کاهش داده و طول عمر را افزایش دهد.',
    estimatedReadingTimeMinutes: 6,
    featuredImageUrl:
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=healthy%20elderly%20nutrition%20food%20plate%20vegetables%20fruits%20fish%20nuts%20colorful%20clean%20professional&image_size=landscape_16_9',
    metaTitle: 'تغذیه صحیح برای سالمندان در منزل | راهنمای ۱۴۰۴ | سالمندیار',
    metaDescription:
      'اصلاح رژیم غذایی سالمندان: افزایش پروتئین، کلسیم و ویتامین D، کاهش نمک و شکر، اهمیت آب‌رسانی مناسب.',
    primaryKeyword: 'تغذیه سالمندان',
    status: 'Published',
    publishedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdatedAt: now,
    authorId: 2,
    author: authors[2],
    categoryId: 5,
    category: contentCategories[4],
    viewCount: 954,
    isFeatured: false,
    isMedicalContent: false,
    isFactChecked: true,
  },
];

export const serviceSeoProfiles: ServiceSeoProfile[] = [
  {
    id: 1,
    serviceDefinitionId: 6,
    serviceDefinition: {
      id: 6,
      code: 'ELDER',
      title: 'سالمندیار',
      description: 'مراقبت تخصصی از سالمند در منزل',
      category: 'PersonalCare',
    },
    slug: 'home-nursing-elderly-care',
    longDescription:
      'خدمات سالمند پرستاری حرفه‌ای در منزل توسط پرستاران مجرب و دلسوز سالمندیار. ما با ارائه خدمات روزانه و شبانه‌روزی، آرامش خانواده و عزیز شما را تضمین می‌کنیم.',
    heroImageUrl:
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=professional%20elderly%20home%20care%20nurse%20helping%20senior%20warm%20home%20environment%20happiness%20healthcare&image_size=landscape_16_9',
    ogImageUrl:
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=professional%20elderly%20home%20care%20nurse%20helping%20senior%20warm%20home%20environment%20happiness%20healthcare&image_size=landscape_16_9',
    metaTitle: 'سالمندیار در منزل | قیمت و بررسی خدمات پرستاری سالمند | سالمندیار',
    metaDescription:
      'خدمات پرستاری تخصصی سالمند در منزل تهران، کرج و شهرهای دیگر. پرستار مجرب، برنامه روزانه، نظارت دارویی و گزارش منظم به خانواده.',
    primaryKeyword: 'سالمندیار در منزل',
    secondaryKeywords: ['پرستار سالمند', 'مراقبت از سالمند', 'سالمندیار تهران'],
    primaryCtaText: 'درخواست پرستار سالمند',
    primaryCtaLink: '/portal/home-care/request',
    startingPrice: 1200000,
    priceRangeText: 'از ۱.۲ تا ۵ میلیون تومان بسته به شیفت و تعداد روز',
    showInHomePage: true,
    isFeatured: true,
    displayOrder: 1,
    benefits: [
      {
        id: 1,
        title: 'پرستاران با سابقه و تایید شده',
        description: 'تمامی پرستاران دارای مدارک معتبر و بررسی سوء پیشینه هستند.',
        iconName: 'ShieldCheck',
        colorClass: 'bg-teal-100 text-teal-600',
        displayOrder: 1,
      },
      {
        id: 2,
        title: 'گزارش‌دهی روزانه به خانواده',
        description: 'ارسال گزارش روزانه از وضعیت بیمار از طریق اپلیکیشن و پیامک.',
        iconName: 'FileText',
        colorClass: 'bg-blue-100 text-blue-600',
        displayOrder: 2,
      },
      {
        id: 3,
        title: 'کنترل دقیق داروها',
        description: 'تزریق و تجویز دقیق داروها طبق برنامه پزشک و جلوگیری از اشتباه دارویی.',
        iconName: 'Pill',
        colorClass: 'bg-green-100 text-green-600',
        displayOrder: 3,
      },
      {
        id: 4,
        title: 'شیفت‌های صبح، شب و ۲۴ ساعته',
        description: 'انعطاف‌پذیری کامل در انتخاب شیفت کاری متناسب با نیاز شما.',
        iconName: 'Clock',
        colorClass: 'bg-orange-100 text-orange-600',
        displayOrder: 4,
      },
    ],
    targetPatients: [
      { id: 1, title: 'سالمندان دچار آلزایمر و زوال عقل', description: 'نیاز به نظارت و همراهی ۲۴ ساعته', displayOrder: 1 },
      { id: 2, title: 'سالمندان بی‌حرکت و تخت بخواب', description: 'جلوگیری از زخم بستر و مراقبت کامل', displayOrder: 2 },
      { id: 3, title: 'سالمندان مبتلا به دیابت و فشار خون', description: 'کنترل منظم و رعایت رژیم درمانی', displayOrder: 3 },
      { id: 4, title: 'بعد از عمل جراحی یا سکته مغزی', description: 'مراقبت ویژه در دوره نقاهت', displayOrder: 4 },
    ],
    coverageAreas: [
      { id: 1, areaName: 'تمامی مناطق تهران', district: 'شمال، جنوب، شرق، غرب', has24HourService: true, displayOrder: 1 },
      { id: 2, areaName: 'کرج و حومه', district: 'مرکز، گوهردشت، گوهردشت', has24HourService: true, displayOrder: 2 },
      { id: 3, areaName: 'شهرکرد و اندیشه', has24HourService: false, displayOrder: 3 },
    ],
    testimonials: [
      {
        id: 1,
        clientFullName: 'خانم رضایی',
        clientRole: 'فرزند بیمار',
        rating: 5,
        content:
          'پرستار خانم رضایی واقعاً دلسوز و حرفه‌ای بود. مادرم در طول دوره مراقبت بسیار راحت بود و ما هم آرامش خیلی خوبی داشتیم.',
        highlight: 'آرامش خانواده',
        testimonialDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        isApproved: true,
        isFeatured: true,
      },
      {
        id: 2,
        clientFullName: 'آقای محمدی',
        clientRole: 'همسر بیمار',
        rating: 5,
        content:
          'با توجه به اینکه همسرم آلزایمر پیشرفته داشت، فکر نمی‌کردم بتوانم پرستار مناسبی پیدا کنم. سالمندیار بهترین انتخاب من بود.',
        testimonialDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        isApproved: true,
        isFeatured: true,
      },
    ],
    faqs: [
      {
        id: 1,
        question: 'حداقل مدت درخواست سالمندیار چقدر است؟',
        answer: 'حداقل ۵ روز برای شیفت‌های روزانه و ۳ روز برای شیفت ۲۴ ساعته است.',
        displayOrder: 1,
      },
      {
        id: 2,
        question: 'آیا می‌توانیم قبل از قرارداد با پرستار ملاقات کنیم؟',
        answer: 'بله، ما امکان معرفی و مصاحبه تلفنی یا حضوری پرستار را قبل از شروع کار فراهم می‌کنیم.',
        displayOrder: 2,
      },
      {
        id: 3,
        question: 'در صورت نارضایتی از پرستار چه می‌شود؟',
        answer: 'تا ۴۸ ساعت اول رایگان قابل تعویض پرستار است و در ادامه نیز در صورت نیاز جایگزین ارائه می‌شود.',
        displayOrder: 3,
      },
    ],
  },
  {
    id: 2,
    serviceDefinitionId: 2,
    serviceDefinition: {
      id: 2,
      code: 'WOUND',
      title: 'پانسمان',
      description: 'تعویض پانسمان زخم',
      category: 'Nursing',
    },
    slug: 'wound-care-dressing-at-home',
    longDescription:
      'خدمات پانسمان حرفه‌ای انواع زخم در منزل توسط پرستاران تخصصی سالمندیار. پانسمان زخم بستر، زخم دیابتی، سوختگی و زخم بعد از عمل.',
    heroImageUrl:
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=professional%20nurse%20wound%20care%20dressing%20change%20elderly%20patient%20home%20medical%20clean%20sterile&image_size=landscape_16_9',
    metaTitle: 'پانسمان در منزل | قیمت پانسمان زخم بستر و دیابتی | سالمندیار',
    metaDescription:
      'خدمات پانسمان تخصصی در منزل: زخم بستر، زخم پای دیابتی، سوختگی، تراکئوستومی و PEG. مراجعه فوری پرستار در تهران و کرج.',
    primaryKeyword: 'پانسمان در منزل',
    secondaryKeywords: ['پانسمان زخم بستر', 'پانسمان زخم دیابتی', 'پرستار پانسمان'],
    primaryCtaText: 'درخواست پانسمان فوری',
    primaryCtaLink: '/portal/home-care/request',
    startingPrice: 350000,
    priceRangeText: 'از ۳۵۰ هزار تومان به بالا بسته به نوع زخم',
    showInHomePage: true,
    isFeatured: true,
    displayOrder: 2,
    benefits: [
      {
        id: 1,
        title: 'تجهیزات استریل یکبار مصرف',
        description: 'استفاده از تمام لوازم استریل و طبق پروتکل‌های بهداشتی.',
        iconName: 'ShieldCheck',
        colorClass: 'bg-teal-100 text-teal-600',
        displayOrder: 1,
      },
      {
        id: 2,
        title: 'انواع پانسمان پیشرفته',
        description: 'استفاده از پانسمان‌های مدرن و مدرج درمانی برای تسریع بهبود.',
        iconName: 'Cross',
        colorClass: 'bg-blue-100 text-blue-600',
        displayOrder: 2,
      },
      {
        id: 3,
        title: 'آموزش به خانواده',
        description: 'آموزش کامل نگهداری زخم در فواصل بین مراجعات.',
        iconName: 'GraduationCap',
        colorClass: 'bg-green-100 text-green-600',
        displayOrder: 3,
      },
    ],
    targetPatients: [
      { id: 1, title: 'بیماران دچار زخم بستر درجه ۲ تا ۴', displayOrder: 1 },
      { id: 2, title: 'بیماران دیابتی با زخم پای', displayOrder: 2 },
      { id: 3, title: 'بعد از جراحی و بخیه', displayOrder: 3 },
    ],
    faqs: [
      {
        id: 1,
        question: 'چند بار در هفته باید پانسمان انجام شود؟',
        answer: 'بسته به نوع و عمق زخم، معمولاً روزانه یا یک روز در میان انجام می‌شود.',
        displayOrder: 1,
      },
    ],
  },
  {
    id: 3,
    serviceDefinitionId: 7,
    serviceDefinition: {
      id: 7,
      code: 'ICU',
      title: 'پرستار ICU در منزل',
      description: 'مراقبت‌های ویژه و ICU در منزل',
      category: 'Nursing',
    },
    slug: 'icu-home-care-nursing',
    longDescription:
      'خدمات پرستاری ICU در منزل برای بیماران نیازمند ونتیلاتور، تراکئوستومی، PEG و مراقبت‌های ویژه. پرستاران متخصص ICU با سابقه کار در بخش‌های بیمارستانی.',
    heroImageUrl:
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=ICU%20nurse%20home%20care%20ventilator%20patient%20medical%20equipment%20professional%20monitoring&image_size=landscape_16_9',
    metaTitle: 'ICU در منزل | پرستار ویژه ونتیلاتور و تراکئوستومی | سالمندیار',
    metaDescription:
      'مراقبت ویژه ICU در منزل: بیماران ونتیلاتور داری، تراکئوستومی، PEG، ساکشن. پرستاران ICU حرفه‌ای با تجهیزات کامل.',
    primaryKeyword: 'ICU در منزل',
    secondaryKeywords: ['پرستار ونتیلاتور', 'مراقبت تراکئوستومی'],
    primaryCtaText: 'درخواست مشاوره ICU',
    primaryCtaLink: '/portal/home-care/request',
    startingPrice: 3000000,
    priceRangeText: 'از ۳ میلیون تومان به بالا',
    showInHomePage: true,
    isFeatured: true,
    displayOrder: 3,
    benefits: [],
    targetPatients: [],
    faqs: [],
  },
  {
    id: 4,
    serviceDefinitionId: 1,
    serviceDefinition: {
      id: 1,
      code: 'INJECTION',
      title: 'تزریقات',
      description: 'تزریق عضلانی یا وریدی',
      category: 'Nursing',
    },
    slug: 'home-injection-service',
    longDescription:
      'انجام انواع تزریق عضلانی، زیرجلدی و وریدی در منزل توسط پرستاران مجرب و استریل. تزریق انسولین، ویتامین، آنتی‌بیوتیک و...',
    metaTitle: 'تزریق در منزل تهران | پرستار تزریق سریع | سالمندیار',
    metaDescription:
      'خدمات تزریق در منزل با کمترین زمان انتظار. تزریق انسولین، آنتی‌بیوتیک، ویتامین و تزریق وریدی. پرستار مجرب و تجهیزات کامل.',
    primaryKeyword: 'تزریق در منزل',
    startingPrice: 200000,
    showInHomePage: false,
    isFeatured: false,
    displayOrder: 4,
    benefits: [],
    targetPatients: [],
    faqs: [],
  },
];

export const diseases: Disease[] = [
  {
    id: 1,
    name: 'سکته مغزی',
    slug: 'stroke',
    shortDescription: 'سکته مغزی یا مغزی در اثر قطع جریان خون به مغز رخ می‌دهد.',
    definition:
      'سکته مغزی (Stroke) هنگامی رخ می‌دهد که عرضه خون به بخشی از مغز مختل شود. این اختلال منجر به مرگ سلول‌های مغزی در عرض چند دقیقه می‌شود.',
    causes: ['انسداد رگ خونی مغزی به دلیل لخته (سکته انسدادی)', 'پاریدگی رگ خونی مغز (سکته خونریزی دهنده)', 'فشار خون کنترل نشده', 'دیابت و چربی خون بالا'],
    symptoms: ['افتادگی یک طرفه صورت', 'ضعف یا بی‌حسی در بازوها و پاها', 'مشکل در گفتار یا درک حرف دیگران', 'سردرد شدید ناگهانی', 'مشکل در بینایی یک یا هر دو چشم', 'سرگیجه و از دست دادن تعادل'],
    riskFactors: ['فشار خون بالا', 'سیگار و قلیان', 'دیابت نوع ۲', 'چاقی و اضافه وزن', 'سابقه خانوادگی سکته', 'سن بالای ۵۵ سال', 'کلسترول خون بالا'],
    diagnosis: ['سی‌تی‌اسکن مغز', 'ام‌آر‌آی مغز', 'آزمایش خون', 'الکتروکاردیوگرام (ECG)', 'داپلر شریان‌های گردنی'],
    treatment: ['داروهای ضادلخته (ظرف طلای ۴.۵ ساعت)', 'جراحی آنژیوگرافی و آنژیوپلاستی', 'فیزیوتراپی پس از سکته', 'گفتاردرمانی', 'کاردرمانی', 'کنترل فشار خون و قند'],
    prevention: ['کنترل منظم فشار خون', 'ترک سیگار و قلیان', 'ورزش منظم و روزانه', 'رژیم غذایی سالم کم‌نمک', 'کنترل قند و کلسترول خون', 'معاینات دوره‌ای قلب و عروق'],
    homeCareInstructions:
      'در منزل باید به کنترل منظم فشار خون، انجام تمرینات فیزیوتراپی، تغذیه مناسب و مراقبت روانی توجه کرد.',
    icd10Code: 'I64',
    severityLevel: 90,
    requiresImmediateMedicalAttention: true,
    metaTitle: 'سکته مغزی؛ علائم، درمان و مراقبت در منزل | سالمندیار',
    metaDescription:
      'راهنمای جامع سکته مغزی: علائم هشدار دهنده، انواع سکته، درمان اولیه، مراقبت‌های پس از سکته در منزل و فیزیوتراپی.',
    primaryKeyword: 'سکته مغزی',
    faqs: [
      {
        id: 1,
        question: 'سکته مغزی درمان‌پذیر است؟',
        answer:
          'بله، اگر بیمار ظرف طلای ۴.۵ ساعت به بیمارستان مراجعه کند، داروهای ضادلخته به بهبود کامل کمک می‌کنند.',
        displayOrder: 1,
      },
    ],
  },
  {
    id: 2,
    name: 'آلزایمر',
    slug: 'alzheimer',
    shortDescription: 'بیماری آلزایمر شایع‌ترین نوع زوال عقل در سالمندان است.',
    definition:
      'آلزایمر یک بیماری مغزی پیشرونده است که باعث تخریب حافظه، مهارت‌های فکری و شخصیت می‌شود.',
    causes: ['رسوب آمیلوئید در مغز', 'مرگ تدریجی سلول‌های عصبی', 'عوامل ژنتیکی و خانوادگی', 'سن بالا (بیش از ۶۵ سال)', 'سابقه ضربه‌های مکرر به سر'],
    symptoms: ['از دست دادن حافظه کوتاه‌مدت', 'گیجی در مکان و زمان', 'تغییرات خلقی و رفتاری', 'مشکل در گفتار و یافتن کلمه', 'دشواری در انجام کارهای روزمره', 'کاهش قضاوت و تصمیم‌گیری'],
    riskFactors: ['سن بالاتر از ۶۵ سال', 'سابقه خانوادگی آلزایمر', 'ژنتیک APOE e4', 'سابقه ضربه به سر', 'سبک زندگی کم‌تحرک', 'دیابت و فشار خون بالا'],
    diagnosis: ['آزمایش‌های عصبی‌روانشناختی', 'ام‌آر‌آی مغز', 'اسکن PET مغز', 'آزمایش خون و کمبود ویتامین‌ها', 'بررسی تاریخچه بیماری'],
    treatment: ['داروهای مهارکننده کولین‌استراز (Donepezil)', 'Memantine', 'درمان شناختی رفتاری (CBT)', 'ورزش درمانی منظم', 'تمرینات حافظه و ذهنی'],
    prevention: ['ورزش روزانه و تحرک بدنی', 'تغذیه مدیترانه‌ای سالم', 'فعالیت ذهنی مداوم (خواندن، پازل)', 'کنترل فشار خون و قند', 'حفظ تعاملات اجتماعی فعال'],
    homeCareInstructions: 'ایجاد روتیمن ثابت، امن کردن محیط خانه، تمرینات حافظه و صبر زیاد.',
    icd10Code: 'G30',
    severityLevel: 70,
    requiresImmediateMedicalAttention: false,
    metaTitle: 'بیماری آلزایمر؛ علائم، مراحل و مراقبت در منزل | سالمندیار',
    metaDescription:
      'راهنمای جامع بیماری آلزایمر در سالمندان: علائم، مراحل پیشرفت، درمان دارویی، مراقبت روزانه و کمک به خانواده.',
    primaryKeyword: 'آلزایمر',
    faqs: [],
  },
  {
    id: 3,
    name: 'دیابت نوع ۲',
    slug: 'diabetes-type-2',
    shortDescription: 'دیابت نوع ۲ شایع‌ترین بیماری متابولیک در جهان است.',
    definition: 'دیابت نوع ۲ اختلال متابولیک است که در آن بدن به انسولین مقاومت می‌کند.',
    causes: ['مقاومت به انسولین در بافت‌ها', 'کاهش ترشح انسولین از پانکراس', 'ژنتیک و سابقه خانوادگی', 'چاقی و اضافه وزن', 'سبک زندگی کم‌تحرک'],
    symptoms: ['تشنگی شدید و مکرر', 'تکرر ادرار، مخصوصاً در شب', 'خستگی و ضعف مداوم', 'کاهش وزن ناگهانی و دلیل‌ناشناخته', 'تاری دید و تاری دید', 'تاخیر در التیام زخم‌ها'],
    riskFactors: ['شاخص توده بدنی بالای ۲۵', 'سابقه خانوادگی دیابت', 'سن بالای ۴۰ سال', 'فشار خون بالا', 'کلسترول و تری‌گلیسیرید بالا', 'سابقه دیابت بارداری'],
    diagnosis: ['آزمایش قند خون ناشتا', 'آزمایش تحمل گلوکز خوراکی (OGTT)', 'اندازه‌گیری هموگلوبین گلیکوزیله (HbA1c)', 'آزمایش قند خون تصادفی'],
    treatment: ['داروهای خوراکی کاهنده قند (متفورمین و ...)', 'تزریق انسولین', 'رژیم غذایی درمانی', 'ورزش منظم روزانه', 'کنترل منظم قند خون در خانه'],
    prevention: ['کاهش وزن و رسیدن به BMI نرمال', 'ورزش حداقل ۱۵۰ دقیقه در هفته', 'تغذیه سالم و کم‌کربوهیدرات تصفیه شده', 'ترک نوشیدنی‌های شیرین و شکر', 'معاینات دوره‌ای قند خون ناشتا'],
    icd10Code: 'E11',
    severityLevel: 60,
    requiresImmediateMedicalAttention: false,
    metaTitle: 'دیابت نوع ۲؛ علائم، درمان و مراقبت در منزل | سالمندیار',
    metaDescription:
      'مدیریت دیابت نوع ۲ در منزل: کنترل قند خون، رژیم غذایی، ورزش و جلوگیری از عوارض مثل زخم پای دیابتی.',
    primaryKeyword: 'دیابت نوع ۲',
    faqs: [],
  },
];

export const cities: City[] = [
  {
    id: 1,
    name: 'تهران',
    slug: 'tehran',
    province: 'تهران',
    shortDescription: 'خدمات پرستاری و مراقبت در منزل تمامی مناطق تهران',
    aboutRegion: 'تهران پایتخت و پرجمعیت‌ترین شهر ایران است. خدمات سالمندیار در تمامی مناطق ۲۲ گانه تهران فعال است.',
    coveredAreas: ['منطقه ۱', 'منطقه ۲', 'منطقه ۳', 'منطقه ۴', 'منطقه ۵', 'منطقه ۶', 'منطقه ۷', 'منطقه ۸', 'منطقه ۹', 'منطقه ۱۰', 'منطقه ۱۱', 'منطقه ۱۲', 'منطقه ۱۳', 'منطقه ۱۴', 'منطقه ۱۵', 'منطقه ۱۶', 'منطقه ۱۷', 'منطقه ۱۸', 'منطقه ۱۹', 'منطقه ۲۰', 'منطقه ۲۱', 'منطقه ۲۲', 'پردیس', 'اسلام‌شهر', 'شهریار'],
    phoneNumber: '09128718237',
    metaTitle: 'پرستار و سالمندیار در منزل تهران | قیمت خدمات | سالمندیار',
    metaDescription:
      'خدمات پرستاری و سالمندیار در منزل تهران: مراقبت از سالمند، پانسمان، تزریق، ICU در منزل. پرستار مجرب در کمتر از ۲ ساعت.',
    displayOrder: 1,
  },
  {
    id: 2,
    name: 'کرج',
    slug: 'karaj',
    province: 'البرز',
    shortDescription: 'خدمات پرستاری در منزل کرج و حومه',
    aboutRegion: 'کرج مرکز استان البرز و چهارمین شهر پرجمعیت ایران است.',
    coveredAreas: ['مرکز کرج', 'گوهردشت', 'ماهدشت', 'شهرستان کرج', 'کمال‌شهر', 'آزادشهر', 'مهردشت'],
    phoneNumber: '09128718237',
    metaTitle: 'پرستار در منزل کرج | سالمند پرستار و پانسمان | سالمندیار',
    metaDescription:
      'سالمندیار در کرج: ارائه پرستار مجرب برای مراقبت از سالمند، پانسمان زخم و خدمات پرستاری در منزل کرج.',
    displayOrder: 2,
  },
  {
    id: 3,
    name: 'اصفهان',
    slug: 'isfahan',
    province: 'اصفهان',
    shortDescription: 'خدمات پرستاری تخصصی در منزل اصفهان',
    metaTitle: 'پرستار در منزل اصفهان | خدمات پرستاری سالمندیار',
    metaDescription:
      'پنل پرستاران حرفه‌ای سالمندیار در اصفهان آماده ارائه خدمات پرستاری در منزل هستند.',
    displayOrder: 3,
  },
];

export const guides: Guide[] = [
  {
    id: 1,
    title: 'راهنمای کامل مراقبت قبل و بعد از عمل جراحی در منزل',
    slug: 'post-surgery-care-guide',
    shortDescription: 'مراحل ضروری مراقبت از بیمار بعد از عمل جراحی برای دوره نقاهت سریع و بدون عارضه در منزل.',
    shortAnswer: 'مراقبت بعد از عمل شامل کنترل درد، مراقبت از محل برش، خوردن و آشامیدن مناسب، تمرینات حرکتی و پیگیری منظم با پزشک است. رعایت دستورالعمل‌های پزشک و بهداشت صحیح از عوارض جلوگیری می‌کند.',
    estimatedReadingTimeMinutes: 12,
    coverImageUrl: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=post%20surgery%20home%20care%20nurse%20checking%20patient%20wound%20clean%20professional&image_size=landscape_16_9',
    ogImageUrl: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=post%20surgery%20home%20care%20nurse%20checking%20patient%20wound%20clean%20professional&image_size=landscape_16_9',
    metaTitle: 'راهنمای مراقبت قبل و بعد از عمل جراحی در منزل | سالمندیار',
    metaDescription: 'راهنمای گام به گام مراقبت از بیمار بعد از عمل جراحی: کنترل درد، پانسمان محل برش، تغذیه مناسب، تمرینات و جلوگیری از عوارض.',
    primaryKeyword: 'مراقبت بعد از عمل',
    secondaryKeywords: ['بعد از عمل جراحی', 'دوره نقاهت در منزل', 'مراقبت از محل برش'],
    authorId: 1,
    author: authors[0],
    categoryId: 6,
    category: contentCategories[5],
    serviceDefinitionId: 6,
    diseaseId: undefined,
    publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdatedAt: new Date().toISOString(),
    viewCount: 1820,
    isFeatured: true,
    isMedicalContent: true,
    steps: [
      { order: 1, title: 'آماده‌سازی خانه قبل از ترخیص', description: 'تمیز کردن اتاق، آماده کردن تخت مناسب، خرید لوازم ضروری و داروها.' },
      { order: 2, title: 'کنترل درد و تب', description: 'استفاده از داروها طبق برنامه پزشک، اندازه‌گیری منظم دما و گزارش درد شدید.' },
      { order: 3, title: 'مراقبت از محل برش و پانسمان', description: 'شستن دست‌ها قبل از لمس، تعویض پانسمان طبق برنامه و رصد علائم عفونت.' },
      { order: 4, title: 'تغذیه مناسب در دوره نقاهت', description: 'پروتئین کافی، میوه و سبزیجات، آب کافی و اجتناب از غذاهای چرب و تند.' },
      { order: 5, title: 'تمرینات حرکتی و فیزیوتراپی', description: 'انجام تمرینات طبق برنامه، اجتناب از حرکات سنگین و افزایش تدریجی تحرک.' },
      { order: 6, title: 'مراقبت روانی و خواب کافی', description: 'ایجاد آرامش، خواب منظم، مشارکت خانواده و جلوگیری از استرس.' },
    ],
    faqs: [
      {
        id: 1,
        question: 'چند روز بعد از عمل می‌توانم دوش بگیرم؟',
        answer: 'معمولاً پس از ۴۸ ساعت و با اجازه پزشک، اما باید از خیس شدن پانسمان جلوگیری کنید.',
        displayOrder: 1,
      },
      {
        id: 2,
        question: 'علائم عفونت محل برش چیست؟',
        answer: 'قرمزی زیاد، ترشح چرک، گرمای محل برش، تب بالای ۳۸.۵ و درد شدید غیرمعمول.',
        displayOrder: 2,
      },
    ],
  },
  {
    id: 2,
    title: 'آموزش پانسمان زخم بستر درجه ۲ و ۳ در منزل',
    slug: 'wound-dressing-step-by-step-guide',
    shortDescription: 'راهنمای تصویری پانسمان صحیح زخم بستر و انواع زخم مزمن با رعایت کامل پروتکل‌های بهداشتی.',
    estimatedReadingTimeMinutes: 10,
    coverImageUrl: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=nurse%20wound%20dressing%20sterile%20procedure%20home%20care%20professional%20clean&image_size=landscape_16_9',
    metaTitle: 'آموزش پانسمان زخم بستر در منزل | راهنمای تصویری | سالمندیار',
    metaDescription: 'یادگیری صحیح پانسمان زخم بستر درجه ۲ و ۳: تجهیزات لازم، مراحل کار، پانسمان‌های مدرن و جلوگیری از عفونت.',
    primaryKeyword: 'آموزش پانسمان زخم',
    authorId: 1,
    author: authors[0],
    categoryId: 3,
    isFeatured: true,
    isMedicalContent: true,
    viewCount: 1140,
    publishedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdatedAt: new Date().toISOString(),
    steps: [
      { order: 1, title: 'آماده‌سازی محیط و شستن دست‌ها', description: 'تمیز کردن میز، پوشیدن دستکش و ضدعفونی کردن کامل دست‌ها.' },
      { order: 2, title: 'برداشتن پانسمان قدیمی', description: 'باز کردن چسب به آرامی، پاک کردن با سرم فیزیولوژی و مشاهده وضعیت زخم.' },
      { order: 3, title: 'شستشو و تمیز کردن زخم', description: 'استفاده از سرم فیزیولوژی و گاز استریل بدون مالش شدید.' },
      { order: 4, title: 'انتخاب و قرار دادن پانسمان جدید', description: 'انتخاب پانسمان مناسب بر اساس نوع زخم، خیس بودن و عمق.' },
      { order: 5, title: 'ثبت و گزارش تغییرات', description: 'عکسبرداری، اندازه‌گیری و ثبت وضعیت زخم در هر بار پانسمان.' },
    ],
    faqs: [],
  },
  {
    id: 3,
    title: 'راهنمای خواب سالم برای سالمندان: ۱۰ نکته علمی',
    slug: 'elderly-sleep-guide',
    shortDescription: 'بهبود کیفیت خواب در سالمندان با روش‌های اثبات شده علمی بدون استفاده از داروهای خواب‌آور.',
    estimatedReadingTimeMinutes: 7,
    coverImageUrl: 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=peaceful%20elderly%20sleeping%20bedroom%20clean%20cozy%20warm%20night%20healthcare&image_size=landscape_16_9',
    metaTitle: 'راهنمای خواب سالم برای سالمندان | ۱۰ نکته طلایی | سالمندیار',
    metaDescription: 'تغییرات ساده در سبک زندگی، روتین شبانه و محیط تختخواب برای رسیدن به خواب عمیق و راحت در سالمندی.',
    primaryKeyword: 'خواب سالم سالمندان',
    authorId: 2,
    author: authors[1],
    categoryId: 1,
    isFeatured: false,
    isMedicalContent: false,
    viewCount: 965,
    publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdatedAt: new Date().toISOString(),
    steps: [
      { order: 1, title: 'ایجاد روتیین ثابت خواب و بیدار شدن', description: 'حتی در آخر هفته‌ها هم ساعت ثابت داشته باشید.' },
      { order: 2, title: 'بهینه‌سازی محیط اتاق خواب', description: 'تاریکی کامل، دمای ۱۸ تا ۲۲ درجه، تخت راحت و ساکت.' },
      { order: 3, title: 'اجتناب از چای، قهوه و غذای سنگین شب', description: 'حداقل ۴ ساعت قبل از خواب از این موارد دوری کنید.' },
      { order: 4, title: 'ورزش روزانه اما نه شب', description: 'پیاده‌روی صبحگاهی یا بعد از ظهر کمک زیادی می‌کند.' },
      { order: 5, title: 'مدیریت استرس و افکار قبل از خواب', description: 'تکنیک‌های تنفسی، مراقبه یا نوشتن دفتر خاطرات.' },
    ],
  },
];

export const healthTools: HealthTool[] = [
  {
    id: 1,
    name: 'ماشین حساب BMI',
    slug: 'bmi-calculator',
    shortDescription: 'محاسبه شاخص توده بدنی برای سالمندان و بزرگسالان با تفسیر اختصاصی',
    description:
      'ماشین حساب رایگان شاخص توده بدنی (BMI) با در نظر گرفتن تفاوت‌های فیزیولوژیکی سالمندان. محاسبه دقیق BMI بر اساس قد و وزن، تفسیر رنگی وضعیت وزنی، توصیه‌های عملی تغذیه‌ای و ورزشی متناسب با سن و اعلام ریسک‌های احتمالی بیماری‌های مرتبط با وزن.',
    toolType: 'Calculator',
    isFeatured: true,
    displayOrder: 1,
    canonicalUrl: '/tools/bmi-calculator',
    primaryKeyword: 'محاسبه bmi',
    secondaryKeywords: [
      'شاخص توده بدنی',
      'ماشین حساب bmi سالمندان',
      'محاسبه قد و وزن',
      'wizard bmi سالمند',
      'وضعیت وزنی سالمند',
      'converter بادی ماس ایندکس',
      'ابزار محاسبه ب ام آی',
      'تفسیر نتیجه BMI برای سالمندان',
    ],
    coverImageUrl: '/opengraph-image.svg',
    ogImageUrl: '/opengraph-image.svg',
    twitterImageUrl: '/twitter-image.svg',
    howToUse:
      '۱) قد خود را به سانتی‌متر وارد کنید. ۲) وزن خود را به کیلوگرم وارد کنید. ۳) گروه سنی و جمعیتی (سالمند، زن یا مرد بزرگسال) را از منو انتخاب کنید. نتیجه بلافاصله با رنگ، تفسیر متنی و توصیه‌های عملی نمایش داده می‌شود.',
    interpretationGuide:
      'برای بزرگسالان زیر ۶۰ سال: BMI کمتر از ۱۸.۵ (کمبود وزن)، ۱۸.۵ تا ۲۴.۹ (وزن نرمال)، ۲۵ تا ۲۹.۹ (اضافه وزن)، ۳۰ تا ۳۴.۹ (چاقی درجه ۱)، ۳۵ تا ۳۹.۹ (چاقی درجه ۲) و ۴۰ به بالا (چاقی مفرط). اما برای سالمندان بالای ۶۰ سال، مطالعات علمی نشان می‌دهد محدوده ایده‌آل BMI ۲۲ تا ۲۷ است؛ زیرا اندکی ذخیره چربی می‌تواند در برابر بیماری حاد و از دست دادن سریع توده عضلانی محافظ ایجاد کند.',
    disclaimers:
      'نتیجه این ابزار صرفاً جهت اطلاع عمومی و خودمراقبتی است و هرگز نباید جایگزین معاینه و مشاوره پزشک متخصص داخلی یا تغذیه شود. به‌خصوص اگر در محدوده چاقی درجه ۲ یا ۳ قرار دارید یا کمبود وزن چشمگیری دارید، هرچه سریع‌تر به پزشک مراجعه فرمایید. نتایج برای زنان باردار، ورزشکاران حرفه‌ای و افراد مبتلا به انسفالوپاتی ممکن است غیر دقیق باشد.',
    metaTitle: 'محاسبه BMI سالمندان و بزرگسالان | ماشین حساب شاخص توده بدنی | سالمندیار',
    metaDescription:
      'ماشین حساب رایگان و آنلاین BMI (شاخص توده بدنی) مخصوص سالمندان بالای ۶۰ سال و بزرگسالان با تفسیر اختصاصی، توصیه‌های عملی تغذیه و ریسک‌های بیماری‌های قلبی، دیابت و پوکی استخوان. بدون ثبت نام.',
    faqs: [
      {
        id: 1,
        question: 'BMI ایده‌آل برای سالمندان چند است؟',
        answer: 'بر اساس مطالعات علمی معتبر در سال‌های اخیر، محدوده BMI ایده‌آل برای افراد بالای ۶۰ سال ۲۲ تا ۲۷ است. این یعنی اندکی اضافه وزن نسبت به بزرگسالان جوان برای سالمندی مفید محسوب می‌شود و در برابر بیماری حاد، از دست دادن سریع توده عضلانی و پوکی استخوان محافظ ایجاد می‌کند.',
        displayOrder: 1,
      },
      {
        id: 2,
        question: 'آیا محاسبه BMI برای سالمندان با بزرگسالان تفاوت دارد؟',
        answer: 'بله، دارد. به‌دلیل کاهش توده عضلانی و افزایش نسبی چربی بدن با افزایش سن، همان عدد BMI در سالمند و جوان به معنای یک چیز نیست. به‌عنوان مثال BMI ۲۶ در جوان اضافه وزن است اما در سالمند در محدوده مطلوب قرار می‌گیرد.',
        displayOrder: 2,
      },
      {
        id: 3,
        question: 'اگر BMI من بالاتر از ۳۰ باشد چه باید بکنم؟',
        answer: 'BMI بالای ۳۰ نشان‌دهنده چاقی است. توصیه می‌کنیم ۱) ابتدا به پزشک متخصص داخلی مراجعه کنید و آزمایش‌های قند خون، چربی خون، فشار خون و تیرویید انجام دهید. ۲) با یک برنامه کاهش وزن تدریجی (۰.۵ تا ۱ کیلوگرم در هفته) و تحت نظر متخصص تغذیه حرکت کنید. ۳) ورزش منظم هوازی (پیاده‌روی روزانه حداقل ۴۵ دقیقه) را جدی بگیرید.',
        displayOrder: 3,
      },
      {
        id: 4,
        question: 'آیا ماشین حساب BMI سالمندیار رایگان است؟',
        answer: 'بله، این ابزار به صورت ۱۰۰٪ رایگان و بدون محدودیت در دسترس عموم قرار دارد. نیازی به ثبت نام، ورود به حساب کاربری یا پرداخت هیچ مبلغی نیست. تمام محاسبات در مرورگر شما انجام می‌شود و هیچ اطلاعاتی به سرور ما ارسال یا ذخیره نمی‌شود.',
        displayOrder: 4,
      },
      {
        id: 5,
        question: 'تفاوت BMI با BMR چیست؟',
        answer: 'BMI (Body Mass Index یا شاخص توده بدنی) وضعیت وزنی شما را نسبت به قدتان نشان می‌دهد. در مقابل BMR (Basal Metabolic Rate یا سوخت و ساز پایه) تعداد کالری‌ای است که بدن شما در حالت کامل استراحت برای حیات صرف می‌کند. در ابزارهای بعدی سالمندیار BMR نیز اضافه خواهد شد.',
        displayOrder: 5,
      },
    ],
  },
  {
    id: 2,
    name: 'امتیازبندی GCS',
    slug: 'gcs-calculator',
    shortDescription: 'محاسبه امتیاز کما گلاسکو برای ارزیابی سطح هوشیاری',
    description: 'ابزار محاسبه GCS (Glasgow Coma Scale) در بیماران آسیب دیده مغزی.',
    toolType: 'Calculator',
    metaTitle: 'محاسبه GCS کما گلاسکو | سالمندیار',
    metaDescription: 'محاسبه آنلاین امتیاز کما گلاسکو (GCS) بر اساس سه پارامتر چشم، گفتاری و حرکتی.',
  },
  {
    id: 3,
    name: 'ماشین حساب قطره سرم',
    slug: 'drip-rate-calculator',
    shortDescription: 'محاسبه سرعت قطره‌چکان سرم برای پرستاران',
    description: 'محاسبه دقیق سرعت قطره سرم بر اساس حجم، مدت زمان و نوع ست قطره‌چکان.',
    toolType: 'Calculator',
    metaTitle: 'محاسبه قطره سرم در منزل | سرعت قطرهچکان | سالمندیار',
    metaDescription: 'ماشین حساب قطره سرم برای پرستاران و خانواده‌ها. محاسبه دقیق قطره در دقیقه.',
  },
  {
    id: 4,
    name: 'چک لیست مراقبت روزانه بیمار',
    slug: 'daily-care-checklist',
    shortDescription: 'چک لیست کامل کارهای روزانه مراقبت از بیمار در منزل',
    description: 'لیست کارهای ضروری روزانه پرستار یا خانواده برای مراقبت صحیح از بیمار در منزل.',
    toolType: 'Checklist',
    metaTitle: 'چک لیست مراقبت روزانه از بیمار در منزل | سالمندیار',
    metaDescription: 'چک لیست قابل دانلود مراقبت روزانه از بیمار تخت بخواب و سالمند در منزل.',
  },
  {
    id: 5,
    name: 'ارزیابی ریسک زخم بستر برادن',
    slug: 'braden-scale-pressure-ulcer-risk',
    shortDescription: 'محاسبه ریسک زخم بستر با اسکیل برادن',
    description: 'محاسبه دقیق ریسک بروز زخم بستر با استفاده از معتبرترین اسکیل جهان (Braden Scale).',
    toolType: 'Assessment',
    metaTitle: 'محاسبه ریسک زخم بستر اسکیل برادن | سالمندیار',
    metaDescription: 'ارزیابی آنلاین ریسک زخم بستر با پرسشنامه برادن و پیشنهادهای مراقبتی.',
  },
  {
    id: 6,
    name: 'ماشین حساب محاسبات دارویی',
    slug: 'drug-dosage-calculator',
    shortDescription: '۱۳ محاسبه مختلف دارویی ICU برای پرستاران و پزشکان',
    description:
      'ماشین حساب جامع دارویی شامل محاسبه دوز هپارین، انسولین، دوپامین، دبوتامین، اپی نفرین، نوراپی نفرین، نیتروگلیسیرین، آمیودارون، لیدوکایین، پنتاپرازول، میدازولام، فنتانیل، اکتریوتاید، محاسبه عمومی دارو با تبدیل واحد، داروهای درصدی، قطرات سرم و تبدیل واحدهای جرمی. مناسب پرستاران ICU، اورژانس، CCU و NICU.',
    toolType: 'Calculator',
    isFeatured: true,
    displayOrder: 2,
    canonicalUrl: '/tools/drug-dosage-calculator',
    primaryKeyword: 'محاسبه دوز دارو',
    secondaryKeywords: [
      'ماشین حساب دارویی',
      'محاسبه قطره سرم',
      'محاسبه دوز دوپامین',
      'محاسبه هپارین',
      'محاسبه انسولین',
      'محاسبه دوز اپی نفرین',
      'محاسبه آمیودارون',
      'ابزار محاسبات دارویی پرستاری',
      'محاسبه دوز بر اساس وزن',
      'محاسبه درصد دارو',
      'تبدیل واحد دارویی',
      'mg to mcg',
      'سرعت انفوزیون',
      'محاسبه پمپ سرنگی',
    ],
    coverImageUrl: '/opengraph-image.svg',
    ogImageUrl: '/opengraph-image.svg',
    twitterImageUrl: '/twitter-image.svg',
    howToUse:
      'از تب (Tab) مورد نظر خود را انتخاب کنید: هپارین/انسولین، دوپامین/دبوتامین، اپی نفرین، نیتروگلیسیرین، آمیودارون، پنتاپرازول، میدازولام، فنتانیل، اکتریوتاید، محاسبه عمومی دارو، داروهای درصدی، قطرات سرم یا تبدیل واحدها. سپس مقادیر خواسته‌شده (دوز، حجم، وزن بیمار و...) را با دقت وارد کنید و روی دکمه محاسبه کلیک کنید. نتیجه شامل سرعت تزریق نهایی، جزئیات ورودی‌ها و فرمول محاسبه به همراه تایید دستی شما نمایش داده می‌شود.',
    interpretationGuide:
      'نتیجه نهایی بر اساس فرمول‌های استاندارد دارویی و واحدها محاسبه می‌شود و در صورت انتخاب میرای سرنگ پمپ بر حسب میلی‌لیتر در ساعت (ml/hr) و در صورت انتخاب میکروست بر حسب قطره در دقیقه (gtt/min) نمایش داده می‌شود. فاکتور قطره سرم برای ماکروست ۱۵ قطره در میلی‌لیتر و برای میکروست ۶۰ قطره در میلی‌لیتر در نظر گرفته شده است. برای داروهای درصدی فرمول کلی: درصد × ۱۰ = میلی‌گرم در هر میلی‌لیتر.',
    disclaimers:
      'این ابزار صرفاً کمک محاسباتی برای پزشکان و پرستاران مجرب می‌باشد و هرگز نباید جایگزین قضاوت بالینی، دستور پزشک و یا محاسبه دستی شود. لطفاً قبل از تزریق هر دارویی محاسبه را بار دیگر دستی بررسی کنید. اشتباه در محاسبات دارویی می‌تواند منجر به عوارض جبران‌ناپذیر یا مرگ بیمار شود. سازندگان و نگهدارندگان این ابزار مسئولیتی در قبال هرگونه استفاده نادرست یا اشتباه محاسباتی ندارند.',
    metaTitle: 'ماشین حساب محاسبات دارویی | ۱۳ محاسبه ICU | سالمندیار',
    metaDescription:
      'ابزار رایگان محاسبات دارویی برای پرستاران و پزشکان. محاسبه دوز هپارین، دوپامین، اپی نفرین، قطره سرم، داروهای درصدی، تبدیل واحد و پمپ سرنگی با فرمول استاندارد.',
    faqs: [
      {
        id: 1,
        question: 'چه تفاوتی بین ماکروست و میکروست دارد؟',
        answer: 'در ست‌های سرم (دست قطره‌چکان) فاکتور قطره تفاوت دارد: در ماکروست (Macroset یا ست معمولی) هر میلی‌لیتر تقریباً معادل ۱۵ قطره است (گاهی ۲۰ قطره در سی‌اس ام اس). در میکروست (Microset یا ست اطفال و دقیق) هر میلی‌لیتر دقیقاً معادل ۶۰ قطره می‌باشد و برای دوزهای دقیق کودکان، نوزادان و سالمندان بکار می‌رود. در این ابزار فاکتور ماکروست ۱۵ در نظر گرفته شده است.',
        displayOrder: 1,
      },
      {
        id: 2,
        question: 'آیا نتیجه این ابزار قابل اطمینان بالینی دارد؟',
        answer: 'این ابزار فقط یک کمک محاسباتی است و تمام فرمول‌ها بر اساس استانداردهای بین‌المللی پرستاری و داروسازی پیاده‌سازی شده‌اند اما به دلیل خطای احتمالی در ورود اطلاعات توسط کاربر، مسئولیت استفاده صرفاً با استفاده‌کننده (پزشک/پرستار) می‌باشد. همیشه پس از محاسبه با این ابزار، فرمول را یک بار دیگر دستی محاسبه کرده و با دستور جراح یا متخصص رعایت کنید.',
        displayOrder: 2,
      },
      {
        id: 3,
        question: 'محاسبه دوز دوپامین و دبوتامین چگونه انجام می‌شود؟',
        answer: 'برای این داروها دوز بر اساس میکروگرم به ازای هر کیلوگرم وزن بیمار در هر دقیقه (mcg/kg/min) وارد می‌شود. فرمول کلی: سرعت (ml/hr) = (دوز × وزن × ۶۰) ÷ (غلظت دارو در سرنگ × ۱۰۰۰). در تب اختصاصی دوپامین این محاسبه به‌صورت خودکار انجام می‌پذیرد.',
        displayOrder: 3,
      },
      {
        id: 4,
        question: 'کدام قسمت ابزار برای هر دارویی می‌توانستم استفاده کنم؟',
        answer: 'اگر داروی شما در لیست ۹ تب اول وجود دارد (هپارین، دوپامین، اپی، نیترو، آمیودارون، پنتاپرازول، میدازولام، فنتانیل، اکتریوتاید) همان تب اختصاصی را استفاده کنید. در غیر این صورت تب «محاسبه عمومی دارو» بهترین گزینه است و از هر نوع واحد و فرمول پشتیبانی می‌کند.',
        displayOrder: 4,
      },
      {
        id: 5,
        question: 'رابطه درصد دارو با میلی‌گرم در میلی‌لیتر چیست؟',
        answer: 'فرمول معیار: ۱٪ دارو = ۱ گرم دارو در ۱۰۰ میلی‌لیتر محلول = ۱۰۰۰ میلی‌گرم در ۱۰۰ میلی‌لیتر = ۱۰ میلی‌گرم در هر میلی‌لیتر. پس برای درصد دارو را در عدد ۱۰ ضرب کنید تا غلظت بر حسب میلی‌گرم در میلی‌لیتر به دست آید. مثلاً داروی ۵٪ = ۵۰ میلی‌گرم در هر میلی‌لیتر.',
        displayOrder: 5,
      },
      {
        id: 6,
        question: 'آیا این ابزار برای داروهای شیمی‌درمانی یا سرطان هم کاربرد دارد؟',
        answer: 'از این ابزار برای داروهای شیمی‌درمانی استفاده نکنید زیرا محاسبات این داروها بسیار حساس‌تر بوده و معمولاً بر اساس سطح بدن BSA یا پروتکل‌های متفاوت سیکل خاص هر بیمار انجام می‌شود و نیاز به محاسبه جداگانه توسط انکولوژیست و داروساز بالینی دارد.',
        displayOrder: 6,
      },
    ],
  },
];
