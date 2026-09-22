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
</ul>
<h2>درمان و پانسمان حرفه‌ای زخم بستر</h2>
<p>اگر زخم بستر در مراحل اولیه یا پیشرفته ایجاد شده باشد، پانسمان صحیح و منظم توسط پرستار متخصص ضروری است. خانواده‌هایی که نمی‌توانند به صورت تخصصی این کار را انجام دهند، می‌توانند از خدمات <a href="/services/bedsores-dressing-at-home">پانسمان زخم بستر در منزل</a> توسط پرستاران دارای مجوز وزارت بهداشت استفاده کنند تا عفونت و پیشرفت زخم پیشگیری شود.</p>`,
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
</ul>
<h2>تزریق انسولین و داروها به صورت ایمن در منزل</h2>
<p>بسیاری از سالمندان برای تزریق انسولین یا ویتامین‌ها به کمک خانواده یا خودشان نیاز دارند. اگر انجام تزریق برای بیمار یا خانواده دشوار است، بهترین راه استفاده از خدمات <a href="/services/injection-at-home">تزریقات در منزل</a> توسط پرستار متخصص و دارای مجوز است تا از عوارض نامناسب تزریق مثل عفونت یا آسیب بافتی پیشگیری شود.</p>`,
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
        iconName: 'HeartPulse',
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
      description: 'مراقبت‌های ویژه و ICU در منزل برای بیماران بحرانی',
      category: 'Nursing',
    },
    slug: 'icu-home-care-nursing',
    longDescription:
      'خدمات پرستاری ICU در منزل برای بیماران نیازمند ونتیلاتور مکانیکی، تراکئوستومی، PEG (تغذیه از طریق معده)، ساکشن ترشحات و مراقبت‌های ویژه شبانه‌روزی. پرستاران متخصص ICU با سابقه کار حداقل ۵ سال در بخش‌های مراقبت‌های ویژه بیمارستان‌های آموزشی و با تجهیزات کامل پایش، به صورت ۲۴ ساعته یا شیفت‌های ۱۲ ساعته در منزل شما حضور می‌یابند.',
    heroImageUrl:
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=ICU%20nurse%20home%20care%20ventilator%20patient%20medical%20equipment%20professional%20monitoring&image_size=landscape_16_9',
    ogImageUrl:
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=ICU%20nurse%20home%20care%20ventilator%20patient%20medical%20equipment%20professional%20monitoring&image_size=landscape_16_9',
    metaTitle: 'ICU در منزل | پرستار ویژه ونتیلاتور و تراکئوستومی | سالمندیار',
    metaDescription:
      'مراقبت ویژه ICU در منزل برای بیماران ونتیلاتوردار، تراکئوستومی، PEG و ساکشن. پرستاران ICU حرفه‌ای با سابقه بیمارستانی و تجهیزات کامل مانیتورینگ ۲۴ ساعته.',
    primaryKeyword: 'ICU در منزل',
    secondaryKeywords: ['پرستار ونتیلاتور در منزل', 'مراقبت تراکئوستومی در منزل', 'نصب و نگهداری PEG در منزل', 'ساکشن در منزل', 'پرستار مراقبت‌های ویژه'],
    primaryCtaText: 'درخواست مشاوره تخصصی ICU',
    primaryCtaLink: '#guest-request-form',
    startingPrice: 3000000,
    priceRangeText: 'از ۳ میلیون تومان برای ۲۴ ساعت با دو پرستار شیفت ۱۲ ساعته؛ بسته ماهانه با تخفیف ویژه',
    showInHomePage: true,
    isFeatured: true,
    displayOrder: 3,
    benefits: [
      {
        id: 1,
        title: 'پرستاران با سابقه ICU بیمارستانی',
        description: 'حداقل ۵ سال سابقه مستمر در بخش‌های مراقبت‌های ویژه داخلی و جراحی.',
        iconName: 'ShieldCheck',
        colorClass: 'bg-teal-100 text-teal-600',
        displayOrder: 1,
      },
      {
        id: 2,
        title: 'مانیتورینگ ۲۴ ساعته ۵ پارامتر',
        description: 'ECG، فشار خون تهاجمی/غیرتهاجمی، SpO2، دمای مرکزی، CO2 بازدمی.',
        iconName: 'Activity',
        colorClass: 'bg-red-100 text-red-600',
        displayOrder: 2,
      },
      {
        id: 3,
        title: 'پشتیبانی تلفنی پزشک متخصص',
        description: 'مشاوره تلفنی ۲۴ ساعته با متخصص بیهوشی و مراقبت‌های ویژه.',
        iconName: 'PhoneCall',
        colorClass: 'bg-blue-100 text-blue-600',
        displayOrder: 3,
      },
      {
        id: 4,
        title: 'آموزش کامل خانواده برای شرایط اضطراری',
        description: 'آموزش عملی اقدامات اولیه اورژانس مانند ماساژ قلبی، ساکشن و اکسیژن درمانی.',
        iconName: 'GraduationCap',
        colorClass: 'bg-amber-100 text-amber-600',
        displayOrder: 4,
      },
    ],
    targetPatients: [
      { id: 1, title: 'بیماران وابسته به ونتیلاتور مکانیکی', description: 'بعد از ترخیص از ICU یا شرایط نهایی بیماری‌های نورولوژیک', displayOrder: 1 },
      { id: 2, title: 'بیماران تراکئوستومی شده', description: 'نیازمند ساکشن منظم و تعویض کانولا', displayOrder: 2 },
      { id: 3, title: 'بیماران GCS پایین بعد از سکته یا ضربه مغزی', description: 'مراقبت‌های ویژه نورولوژیک در خانه', displayOrder: 3 },
      { id: 4, title: 'بیماران نارسایی قلبی یا ریوی مرحله پایانی', description: 'مراقبت‌های تسکینی و پشتیبانی تنفسی', displayOrder: 4 },
    ],
    coverageAreas: [
      { id: 1, areaName: 'تهران کل (تمامی ۲۲ منطقه)', has24HourService: true, displayOrder: 1 },
      { id: 2, areaName: 'کرج و مناطق البرز', has24HourService: true, displayOrder: 2 },
    ],
    testimonials: [
      {
        id: 1,
        clientFullName: 'آقای محمدی',
        clientRole: 'فرزند بیمار ونتیلاتوردار',
        rating: 5,
        content:
          'بعد از ۳ ماه بستری پدرم در بخش ICU بیمارستان، در نهایت با کمک تیم سالمندیار توانستیم تجهیزات ونتیلاتور و تیم پرستار ICU را به خانه ببریم. پرستاران حرفه‌ای، منظم و فوق‌العاده متعهد بودند و خیال ما کاملاً راحت بود.',
        highlight: 'انتقال بیمار بحرانی از بیمارستان به خانه',
        testimonialDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        isApproved: true,
        isFeatured: true,
      },
    ],
    faqs: [
      {
        id: 1,
        question: 'آیا انتقال بیمار ونتیلاتوردار از بیمارستان به خانه امکان‌پذیر است؟',
        answer:
          'بله، این کار با هماهنگی کامل با پزشک معالج، آماده‌سازی تجهیزات (ونتیلاتور قابل حمل، اکسیژن مایع، مانیتور و آمبولانس تجهیز یافته ICU) و همراهی پرستار متخصص در طول مسیر، کاملاً امکان‌پذیر و استاندارد است. تیم سالمندیار در هماهنگی این فرآیند به صورت کامل همراه خانواده است.',
        displayOrder: 1,
      },
      {
        id: 2,
        question: 'چه تجهیزاتی برای راه‌اندازی ICU در منزل لازم است؟',
        answer:
          'حداقل شامل: ونتیلاتور مکانیکی قابل حمل، مانیتور ۵ پارامتر، پالس اکسیمتر، اکسیژن متراکم‌ساز یا اکسیژن مایع، دستگاه ساکشن، پولس اکسیمتر، کلکتور ادراری، کیت استریل تعویض تراکئوستومی و PEG، بستر طبی الکتریکی دو حرکته و تشک هوایی ضد زخم بستر است. تامین و اجاره این تجهیزات توسط تیم سالمندیار انجام می‌شود.',
        displayOrder: 2,
      },
    ],
    seoSections: [
      {
        id: 1,
        heading: 'ICU در منزل چیست و چه زمانی یک گزینه درست است؟',
        content:
          'ICU در منزل یا Home Intensive Care Unit به مجموعه‌ای از خدمات پرستاری و پزشکی تخصصی گفته می‌شود که هدف آن، تکرار شرایط و استانداردهای بخش مراقبت‌های ویژه بیمارستان، در محیط امن و آرام خانه بیمار است. این مدل ارائه خدمات، حدود ۴ دهه است در کشورهای توسعه‌یافته مانند آمریکا، آلمان و ژاپن رایج است و در ایران نیز با بهبود زیرساخت‌های تجهیزات پزشکی قابل حمل و آموزش پرستاران متخصص، در سال‌های اخیر رشد چشمگیری داشته است. مهم‌ترین دلیلی که خانواده‌ها به دنبال راه‌اندازی ICU در خانه هستند، آرامش عاطفی بیمار در کنار اعضای خانواده است. تحقیقات منتشرشده در نشریه معتبر Journal of Critical Care نشان می‌دهد که بیماران بحرانی که در محیط خانه تحت مراقبت‌های ویژه قرار می‌گیرند، به طور میانگین سطح استرس کمتری، تعداد روزهای وابستگی به ونتیلاتور کمتری و نزول روانی پایین‌تری نسبت به بیماران بستری دائمی در ICU بیمارستان تجربه می‌کنند. همچنین هزینه کلی بستری در خانه، برای دوره‌های طولانی‌تر از یک ماه، حدود ۴۰ تا ۵۰ درصد کمتر از هزینه مشابه در بیمارستان‌های خصوصی است. بر اساس دستورالعمل‌های انجمن علمی مراقبت‌های ویژه ایران، بهترین زمان برای تصمیم‌گیری در مورد انتقال به ICU خانگی، زمانی است که وضعیت بالینی بیمار در ICU بیمارستان حداقل ۱۰ روز ثابت و پایدار بوده و پزشک معالج عبارت «مناسب برای ترخیص با مراقبت ویژه در خانه» را در نسخه و خلاصه بیمارستان ثبت کند.',
        displayOrder: 1,
      },
      {
        id: 2,
        heading: 'انواع خدمات ارائه‌شده در چارچوب ICU خانگی سالمندیار',
        content:
          'طیف خدمات ICU در منزل سالمندیار بسیار گسترده و بر اساس نیاز بالینی فردی بیمار برنامه‌ریزی می‌گردد. نخستین و پیچیده‌ترین خدمت، مدیریت ونتیلاتور مکانیکی است؛ شامل: تنظیم پارامترهای تهویه مطبوع بر اساس دستور پزشک (مثل حالت‌های AC، SIMV، PSV و CPAP)، ساکشن منظم ترشحات از مسیر هوایی تراکئوستومی یا لوله تراشه، کنترل دقیق حجم جریان هوا، فشار الهام (PIP)، PEEP و CO2 بازدمی (EtCO2)، و تعویض منظم فیلترها و مدار تنفسی. دوم، مراقبت از کانولای تراکئوستومی (Tracheostomy Care) شامل: تمیز کردن روزانه اطراف سوراخ استوم با نرمال‌سالین و پوویدن‌ید، تعویض فیکساسیون کانولا، تعویض کانولای داخل و خارج در فواصل زمانی مشخص و ساکشن استریل مسیر هوایی عمیق. سوم، مدیریت و نگهداری از PEG یا گاستروستومی پوستی که برای تغذیه بلندمدت بیماران ناهوشیار استفاده می‌شود: شامل شستشوی روزانه محل PEG با آب استریل، کنترل نشت غذا یا مایع اطراف استوم، تزریق غذا و دارو با سرعت و حجم صحیح، فلاشینگ منظم لوله با آب ۵ الی ۱۰ سی‌سی قبل و بعد از هر تغذیه و کنترل وزن روزانه بیمار. چهارم، مانیتورینگ پیوسته علائم حیاتی با دستگاه پایش ۵ پارامتری که شامل ثبت ۱۲ ساعته نمودار فشار خون تهاجمی از طریق خط آرتری، ضربان قلب و ریتم ECG، اشباع اکسیژن خون محیطی و مرکزی، دمای رکتال یا اورینال، و فشار داخل حباب پیمانه‌ای CVP است. پنجم، انجام پروتکل‌های پیشگیری از عوارض ICU شامل: تغییر وضعیت بدن هر ۲ ساعت برای جلوگیری از زخم بستر، تمرینات حرکتی منفعل (Passive Range of Motion) برای اندام‌ها به منظور جلوگیری از انقباض عضلانی، پروفیلاکسی ترومبوز وریدی عمیق با جوراب الاستیک و ماساژ پاها، و در نهایت مراقبت‌های چشم برای بیماران ناهوشیار که نمی‌توانند پلک بزنند. ششم، مدیریت خون‌دهی داخل وریدی، انفوزیون داروهای داخل وریدی مانند داروهای فشار خون، سدیم بی‌کربنات، کوره‌ای و آنتی‌بیوتیک‌ها با پمپ سرنگی حجمی و کنترل دقیق میلی‌لیتر بر ساعت.',
        displayOrder: 2,
      },
      {
        id: 3,
        heading: 'تیم انسانی و تجهیزات مورد نیاز برای ICU در منزل',
        content:
          'راه‌اندازی موفق ICU در منزل به دو عامل کلیدی بستگی دارد: تیم پرستاری متخصص و تجهیزات پزشکی استاندارد و سرویس‌دهی دوره‌ای. در بخش نیروی انسانی، تیم پایدار ICU خانگی در سالمندیار حداقل شامل دو پرستار شاغل به صورت شیفت ۱۲ ساعته (یک نفر شیفت روز و یک نفر شیفت شب)، یک سرپرست پرستار متخصص ICU که به صورت سرزده هر ۲۴ ساعت یک بار بازدید می‌کند و یک مشاور پزشک متخصص بیهوشی و مراقبت‌های ویژه است که هر هفته یک بار ویزیت حضوری یا تلفنی دارد. پرستاران شاغل در ICU خانگی باید حداقل شرایط زیر را داشته باشند: داشتن مدرک کارشناسی یا کارشناسی‌ارشد پرستاری، داشتن گواهینامه معتبر دوره‌های ALS (Advanced Life Support) و BLS از سازمان‌های معتبر، سابقه کاری مستمر حداقل ۵ سال در بخش‌های ICU بیمارستان‌های درجه یک کشور، و گذراندن دوره تخصصی «مراقبت‌های ویژه در محیط خانه» از کمیته علمی سالمندیار. در حوزه تجهیزات پزشکی، استاندارد طلایی برای یک اتاق ICU در منزل شامل موارد زیر است: دستگاه ونتیلاتور مکانیکی قابل حمل با قابلیت تهویه تهاجمی و غیرتهاجمی (Preferable brands: Hamilton, Dräger, Resmed)، دستگاه مانیتور ۵ یا ۶ پارامتری با قابلیت ثبت دیجیتال نمودار و تولید گزارش متنی، دستگاه پمپ سرنگی تک‌کاناله یا چندکاناله برای انفوزیون دقیق داروهای قلبی، دستگاه اکسیژن متراکم‌ساز ۱۰ لیتری به همراه سیلندر اکسیژن ۴۰ لیتری پشتیبان برای مواقع قطعی برق، دستگاه ساکشن پیستونی یا دیافراگمی با ظرفیت مناسب برای ساکشن عمیق مسیر هوایی، بستر طبی برقی دو حرکته یا سه حرکته با قابلیت Trendelenburg و Anti-Trendelenburg، تشک هوایی ضد زخم بستر طبقه یکم (Alternating Pressure Mattress) با سیستم کمپرسور جداگانه، پولس اکسیمتر انگشتی قابل حمل، کلکتور ادراری یکبار مصرف و کانولای ادراری Foley دو لوله، و در نهایت کیت زایمان اورژانس یا Crash Cart کوچک شامل داروهای اصلی قلبی و تنفسی، آمپول آدرنالین، آتروپین، لیدوکائین و بانداژ استریل. در سالمندیار، تامین، نصب، آموزش و سرویس دوره‌ای تمامی این تجهیزات بر عهده تیم مهندسی پزشکی ما بوده و هرگونه خرابی ناگهانی، ظرف حداکثر ۴ ساعت جبران می‌شود.',
        displayOrder: 3,
      },
      {
        id: 4,
        heading: 'مراحل راه‌اندازی ICU در منزل و نکات رعایت‌شدنی',
        content:
          'فرآیند راه‌اندازی ICU در منزل در سالمندیار طبق ۵ مرحله استاندارد و مستند طراحی شده است تا ایمنی بیمار در بالاترین سطح ممکن حفظ گردد. مرحله اول: ارزیابی بالینی و مهندسی اولیه. در این مرحله، پس از تماس خانواده، یک تیم متشکل از یک پرستار ارشد ICU و یک کارشناس مهندسی پزشکی، به صورت حضوری یا تصویری، وضعیت بالینی بیمار، مساحت و امکانات فضای منزل (موجودی برق ۲۲۰ ولت پایدار، سیستم گرمایش و سرمایش مناسب، سرویس بهداشتی در دسترس و امکان جداسازی یک اتاق برای بیمار) را ارزیابی می‌کنند و گزارش پیشنهادی شامل لیست تجهیزات لازم، ترکیب تیم پرستاری و تخمین هزینه ماهانه را به خانواده و پزشک معالج ارائه می‌دهند. مرحله دوم: هماهنگی انتقال (در صورت نیاز). اگر بیمار هنوز در ICU بیمارستان بستری است، تیم سالمندیار با هماهنگی کامل با پزشک معالج، رزرو آمبولانس مجهز ICU، آماده‌سازی زودهنگام تجهیزات در منزل و برنامه‌ریزی دقیق زمان انتقال، جابجایی ایمن بیمار را مدیریت می‌کند؛ طی این فرآیند همیشه یک پرستار متخصص همراه بیمار در آمبولانس حضور دارد. مرحله سوم: نصب و راه‌اندازی فیزیکی. در این مرحله، تیم مهندسی پزشکی تجهیزات را در اتاق مشخص‌شده نصب، سیم‌کشی و کالیبره می‌کند و سپس یک تست شبیه‌سازی قطعی برق و خرابی ونتیلاتور را برای اطمینان از عملکرد صحیح دستگاه پشتیبان (BVM، اورسوز، بک آپ) اجرا می‌کند. مرحله چهارم: جلسه آموزشی عملی برای خانواده. در این جلسه ۴ الی ۶ ساعته که قبل از شروع رسمی خدمات برگزار می‌شود، حداقل دو عضو خانواده به صورت عملی با نحوه عملکرد دستگاه‌های اصلی، اقدامات اولیه در موقع ایست قلبی (BLS)، ساکشن ساده مسیر هوایی، نحوه تماس اضطراری با سرپرست و پزشک، و رعایت پروتکل‌های بهداشتی هنگام ورود به اتاق بیمار آشنا می‌شوند و در پایان آزمون کتبی و عملی را می‌گذرانند. مرحله پنجم: شروع رسمی خدمات و پیگیری روزانه. پس از شروع شیفت اول پرستار، سرپرست پرستاری روزانه یک گزارش مکتوب کوتاه شامل علائم حیاتی حداکثری و حداقلی، میزان ورودی و خروجی مایعات، تغییرات در پارامترهای ونتیلاتور و وضعیت سطح هوشیاری را از طریق پیامک و ایمیل برای خانواده و پزشک معالج ارسال می‌کند. همچنین هر هفته یک جلسه کنفرانس تلفنی تصویری بین خانواده، سرپرست پرستار و پزشک معالج برای بازبینی روند درمان برگزار می‌گردد. نکته کلیدی در تمام این مراحل، حفظ استرلیلیت فضای بیمار است؛ ورود افراد کمتر از ۳ نفر در روز، استفاده از ماسک N95 و دستکش هنگام ورود به اتاق، و ضدعفونی روزانه سطوح با محلول هیپوکلریت ۱٪، از الزامات غیرقابل چشم‌پوشی پروتکل سالمندیار است.',
        displayOrder: 4,
      },
    ],
    relatedServicesSlugs: ['24h-patient-monitoring', 'home-nursing', 'iv-infusion-at-home', 'bedsores-dressing-at-home'],
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
  {
    id: 5,
    serviceDefinitionId: 1,
    serviceDefinition: {
      id: 1,
      code: 'INJECTION',
      title: 'تزریقات در منزل',
      description: 'انجام انواع تزریق با پروتکل استریل در منزل',
      category: 'Nursing',
    },
    slug: 'injection-at-home',
    longDescription:
      'خدمات تزریقات در منزل توسط پرستاران مجرب و دارای مجوز سالمندیار؛ تزریق آمپول، انسولین، ویتامین، آنتی‌بیوتیک و تزریق سرم با رعایت کامل پروتکل‌های بهداشتی و استریل.',
    heroImageUrl:
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=professional%20nurse%20preparing%20injection%20home%20setting%20elderly%20patient%20safe%20sterile%20gloves%20medical%20care&image_size=landscape_16_9',
    ogImageUrl:
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=professional%20nurse%20preparing%20injection%20home%20setting%20elderly%20patient%20safe%20sterile%20gloves%20medical%20care&image_size=landscape_16_9',
    metaTitle: 'تزریقات در منزل | پرستار برای تزریق آمپول و سرم در منزل | سالمندیار',
    metaDescription:
      'تزریقات در منزل تهران، کرج و اصفهان توسط پرستار مجرب. تزریق آمپول، انسولین، ویتامین، آنتی‌بیوتیک و تزریق سرم در منزل با پروتکل استریل و مشاوره رایگان.',
    primaryKeyword: 'تزریقات در منزل',
    secondaryKeywords: [
      'پرستار برای تزریقات در منزل',
      'تزریق آمپول در منزل',
      'خدمات پرستاری در منزل',
      'درخواست پرستار در منزل',
      'تزریق سرم در منزل',
    ],
    primaryCtaText: 'درخواست پرستار تزریق',
    primaryCtaLink: '#guest-request-form',
    priceRangeText: 'قیمت‌گذاری بر اساس نوع تزریق، تعداد دفعات و منطقه جغرافیایی؛ مشاوره رایگان قبل از درخواست',
    showInHomePage: true,
    isFeatured: true,
    displayOrder: 5,
    benefits: [
      {
        id: 1,
        title: 'تزریق بدون درد و با تکنیک صحیح',
        description: 'استفاده از تکنیک‌های روز دنیا برای کاهش درد و بروز کمترین عوارض پس از تزریق.',
        iconName: 'Syringe',
        colorClass: 'bg-teal-100 text-teal-600',
        displayOrder: 1,
      },
      {
        id: 2,
        title: 'کیت استریل یکبار مصرف',
        description: 'تمام سرنگ، سوژه، دستکش و الکل به صورت یکبار مصرف و استریل بوده و کنار در خانه دور انداخته می‌شود.',
        iconName: 'ShieldCheck',
        colorClass: 'bg-blue-100 text-blue-600',
        displayOrder: 2,
      },
      {
        id: 3,
        title: 'مشاوره پس از تزریق',
        description: 'آموزش نکات لازم به بیمار و خانواده در مورد نشانه‌های عوارض احتمالی و اقدامات لازم.',
        iconName: 'MessageSquare',
        colorClass: 'bg-green-100 text-green-600',
        displayOrder: 3,
      },
      {
        id: 4,
        title: 'تنظیم برنامه دفعات تزریق',
        description: 'برای دوره‌های درمانی چند هفته‌ای، برنامه ریزی منظم و یادآوری تزریق‌ها برای بیمار.',
        iconName: 'CalendarClock',
        colorClass: 'bg-orange-100 text-orange-600',
        displayOrder: 4,
      },
    ],
    targetPatients: [
      { id: 1, title: 'سالمندان نیازمند تزریق منظم انسولین', description: 'کنترل دقیق دیابت بدون مراجعه حضوری به مطب', displayOrder: 1 },
      { id: 2, title: 'بیماران تحت درمان آنتی‌بیوتیک تزریقی', description: 'تزریق‌های روزانه یا دو بار در روز دوره آنتی‌بیوتیک درمانی', displayOrder: 2 },
      { id: 3, title: 'افراد کم‌تحرک یا تخت بخواب', description: 'عدم نیاز به جابجایی بیمار و مراجعه مطب برای تزریق', displayOrder: 3 },
      { id: 4, title: 'کمبود ویتامین و تقویت کننده', description: 'تزریق ویتامین B12، D، مگنز و ترکیبات تقویتی تجویز شده توسط پزشک', displayOrder: 4 },
      { id: 5, title: 'بیماران پس از جراحی یا ترخیص', description: 'ادامه دوره تزریقی داروها طبق نسخه پزشک در دوران نقاهت', displayOrder: 5 },
    ],
    coverageAreas: [
      { id: 1, areaName: 'تمامی مناطق تهران', district: 'شمال، جنوب، شرق، غرب، ۲۲ منطقه', has24HourService: true, displayOrder: 1 },
      { id: 2, areaName: 'کرج و مناطق البرز', district: 'مرکز، گوهردشت، مهردشت، کامال‌شهر', has24HourService: true, displayOrder: 2 },
      { id: 3, areaName: 'اصفهان مرکز', district: 'مناطق ۱ تا ۱۲ اصفهان', has24HourService: false, displayOrder: 3 },
    ],
    testimonials: [
      {
        id: 1,
        clientFullName: 'آقای حسینی',
        clientRole: 'فرزند بیمار دیابتی',
        rating: 5,
        content:
          'پدرم از سن ۷۰ سالگی دیابت نوع دو داشت و هر روز صبح و شب به انسولین نیاز داشت. قبلاً خودم تزریق می‌کردم ولی از اینکه گاهی کبودی ایجاد می‌شد نگران بودم. با درخواست پرستار از سالمندیار، هر روز صبح به موقع می‌آمدند و تزریق را به بهترین شکل انجام می‌دادند. تکرار کم کبودی و گزارش دقیق قند خون بعد از تزریق باعث خیال راحت ما شد.',
        highlight: 'رعایت دقیق زمان تزریق انسولین',
        testimonialDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        isApproved: true,
        isFeatured: true,
      },
    ],
    faqs: [
      {
        id: 1,
        question: 'تزریقات در منزل دقیقاً چیست و چه تفاوتی با تزریق در مطب دارد؟',
        answer:
          'تزریقات در منزل به خدماتی گفته می‌شود که در آن پرستار دارای مجوز، با携带 کیت کامل استریل به منزل بیمار مراجعه کرده و انواع تزریق عضلانی، زیرجلدی، داخل وریدی و انسولین را طبق نسخه پزشک انجام می‌دهد. تفاوت اصلی با مطب، عدم نیاز به جابجایی بیمار، رعایت فاصله اجتماعی و حفظ آرامش محیط خانگی است. همچنین برای سالمندان و بیماران کم‌تحرک، رفت و آمد به مطب ممکن است با استرس و ریسک سقوط همراه باشد که با خدمات در منزل این چالش کاملاً برطرف می‌گردد.',
        displayOrder: 1,
      },
      {
        id: 2,
        question: 'چه خدماتی در چارچوب تزریقات در منزل قابل ارائه است؟',
        answer:
          'تمام تزریق‌هایی که توسط پرستار مجاز و طبق پروتکل قابل انجام هستند شامل: تزریق عضلانی (مثلاً آنتی‌بیوتیک‌ها و ویتامین B12)، تزریق زیرجلدی (انسولین، هپارین و هورمون‌ها)، تزریق داخل وریدی (سریم درمانی و داروهای وریدی)، تزریق آمپول‌های تجویز شده توسط پزشک، و تزریق سرم در منزل می‌باشد. همچنین تنظیم و نصب سر و مسیر وریدی و عوض کردن آن نیز در همین چارچوب انجام می‌پذیرد.',
        displayOrder: 2,
      },
      {
        id: 3,
        question: 'آیا برای انجام تزریق در منزل، ارائه نسخه پزشک الزامی است؟',
        answer:
          'بله، برای تمام تزریق‌های دارویی (به استثنای موارد تجویز شده توسط تیم پزشکی سالمندیار در چارچوب مراقبت‌های روزانه) ارائه نسخه معتبر پزشک الزامی است. پرستار در هنگام مراجعه ابتدا نسخه را از نظر نام دارو، دوز، روش تزریق و دفعات تزریق بررسی می‌کند و در صورت مغایرت با داروی تحویلی، قبل از هر کاری با پزشک معالج یا خانواده هماهنگی لازم را انجام می‌دهد. این پروتکل برای جلوگیری از هرگونه اشتباه دارویی و حفظ ایمنی بیمار است.',
        displayOrder: 3,
      },
      {
        id: 4,
        question: 'چه زمانی افراد به خدمات پرستار برای تزریقات در منزل نیاز پیدا می‌کنند؟',
        answer:
          'نیاز به دریافت خدمات تزریق در منزل معمولاً در موارد زیر ظاهر می‌شود: ابتدا بیمارانی که دوره آنتی‌بیوتیک تزریقی طولانی دارند و هر روز یا چند بار در روز به تزریق نیاز دارند؛ دوم سالمندانی که به دلیل ضعف جسمی یا مشکلات قلبی و عروقی نمی‌توانند به مطب یا درمانگاه مراجعه کنند؛ سوم بیماران تخت بخواب یا کم‌تحرک که جابجایی آن‌ها با ریسک عوارضی مثل سقوط یا خستگی شدید همراه است. همچنین بیماران پس از جراحی و دوران نقاهت، افراد مبتلا به دیابت که نیاز به تزریق منظم انسولین دارند و خانواده‌هایی که تجربه کافی برای تزریق ایمن به بیمار را ندارند، می‌توانند از این خدمات استفاده کنند.',
        displayOrder: 4,
      },
      {
        id: 5,
        question: 'مزایای دریافت خدمات تزریق در منزل نسبت به مراجعه حضوری چیست؟',
        answer:
          'مزایای اصلی عبارتند از: اول صرفه‌جویی در زمان و هزینه رفت و آمد؛ دوم حفظ آرامش بیمار در محیط آشنا که باعث کاهش درد دردناک تزریق می‌شود؛ سوم کاهش ریسک عفونت‌های بیمارستانی و تماس با بیماران دیگر؛ چهارم امکان مشاهده و آموزش اعضای خانواده در حین انجام تزریق توسط پرستار؛ پنجم پشتیبانی تلفنی ۲۴ ساعته پس از تزریق در صورت بروز هرگونه علامت نگران‌کننده. تحقیقات نشان می‌دهد که انجام تزریق در محیط خانگی برای سالمندان باعث کاهش سطح استرس و بهبود پاسخ بدن به دارو می‌گردد.',
        displayOrder: 5,
      },
      {
        id: 6,
        question: 'چه کسی باید تزریق را در منزل انجام دهد و چه مدارکی لازم است؟',
        answer:
          'تزریق در منزل باید حتماً توسط پرستار دارای مدرک معتبر دانشگاهی و مجوز رسمی از سازمان نظام پرستاری انجام شود. پرستاران تیم سالمندیار علاوه بر مدارک رسمی، دوره‌های آموزشی ویژه تزریق ایمن در محیط خانه، مدیریت عوارض حاد و پروتکل‌های بهداشتی را گذرانده‌اند. همچنین قبل از ارسال، سوابق کاری و اخلاقی پرستار به دقت بررسی و تایید می‌گردد. هنگام درخواست، بیمار یا خانواده باید نسخه معتبر پزشک، کارت بیمه (در صورت نیاز) و مدارک شناسایی را آماده داشته باشند.',
        displayOrder: 6,
      },
      {
        id: 7,
        question: 'نکات ایمنی مهم قبل و بعد از تزریق چیست؟',
        answer:
          'قبل از تزریق: حتماً فضای منزل تمیز باشد، از پرستار بخواهید دستکش جدید بپوشد و محل تزریق را با الکل به درستی استریل کند؛ همچنین نسخه پزشک و داروی با تاریخ انقضا معتبر آماده باشد. بعد از تزریق: به مدت ۵ الی ۱۰ دقیقه روی محل تزریق با گاز فشار ملایم بیاورید، دستورالعمل پرستار در مورد ماساژ دادن یا ندادن محل را رعایت کنید؛ در صورت بروز علائمی مانند تنگی نفس، کهیر، تورم زیاد محل تزریق یا سرگیجه شدید، فوراً با پشتیبانی سالمندیار یا مرکز درمانگاهی مجاور تماس بگیرید. تا ۲۴ ساعت بعد از تزریق عضلانی، از حرکات شدید بازو یا لگن (بسته به محل تزریق) اجتناب کنید و به درستی آب بنوشید.',
        displayOrder: 7,
      },
      {
        id: 8,
        question: 'هنگام ثبت درخواست خدمات پرستاری در منزل چه اطلاعاتی لازم است؟',
        answer:
          'برای ثبت سریع و دقیق درخواست، اطلاعات زیر را آماده کنید: نام کامل بیمار، سن و جنسیت، نوع خدمت مورد نیاز (تزریق آمپول، تزریق انسولین، تزریق سرم در منزل و...)، نام دارو و دوز و دفعات تجویز شده توسط پزشک، تاریخ و ساعت مورد نظر برای اولین مراجعه، آدرس دقیق با کد پستی و شهر، شماره تماس درخواست‌کننده، هرگونه سابقه حساسیت دارویی که بیمار دارد. ارائه اطلاعات دقیق باعث می‌شود پرستار به موقع و با کیت مناسب به منزل مراجعه کند و زمان انتظار برای شروع خدمت به حداقل برسد.',
        displayOrder: 8,
      },
    ],
    seoSections: [
      {
        id: 1,
        heading: 'تزریقات در منزل چیست و چرا این روزها محبوبیت دارد؟',
        content:
          'تزریقات در منزل یکی از پرکاربردترین خدمات پرستاری در منزل است که در آن پرستار دارای مجوز، با تمام تجهیزات لازم از جمله سرنگ استریل، سوژه، دستکش استریل، سرم فیزیولوژی، الکل و گاز به منزل یا محل سکونت بیمار مراجعه می‌کند و انواع تزریق عضلانی، زیرجلدی و وریدی را طبق دستورالعمل پزشک انجام می‌دهد. در سال‌های اخیر، به دلایل متعددی شامل افزایش جمعیت سالمند در شهرهای بزرگ ایران، ترافیک سنگین، طولانی شدن زمان انتظار در مطب‌ها و درمانگاه‌ها، و حساسیت بیشتر مردم در مورد بهداشت و ایمنی پس از همه‌گیری کووید-۱۹، تقاضا برای درخواست پرستار در منزل به شکل چشمگیری افزایش یافته است. سالمندیار با بهره‌گیری از شبکه‌ای از پرستاران دارای سابقه و تایید شده، سعی در ارائه خدمات تزریق آمپول در منزل، انسولین، ویتامین، آنتی‌بیوتیک و تزریق سرم در منزل با بالاترین سطح استانداردهای بهداشتی را دارد.',
        displayOrder: 1,
      },
      {
        id: 2,
        heading: 'چه زمانی افراد به خدمات تزریقات در منزل نیاز دارند؟',
        content:
          'نیاز به استفاده از خدمات پرستار برای تزریقات در منزل معمولاً در شرایط بالینی و زندگی خاصی ظاهر می‌شود. اولین مورد، بیماران مبتلا به بیماری‌های مزمن و طولانی‌مدت است؛ برای مثال بیماران دیابتی نوع یک یا نوع دو پیشرفته که روزانه چند بار به تزریق انسولین نیاز دارند و انجام آن توسط خانواده با ریسک اشتباه دوز یا تزریق ناصحیح همراه است. دوم، بیمارانی که دوره درمانی آنتی‌بیوتیک تزریقی طولانی دارند؛ به‌طور معمول این دوره‌ها ۷ تا ۱۴ روز طول می‌کشند و مراجعه روزانه چندین بار به مطب برای بیمار و خانواده بسیار وقت‌گیر و خسته‌کننده است. سوم، سالمندان کم‌تحرک یا بیماران تخت بخواب که جابجایی آن‌ها حتی برای مسافت کوتاه، با خستگی شدید، درد و ریسک سقوط همراه است. چهارم، بیماران پس از ترخیص از بیمارستان که نیاز به تزریق منظم داروهای ضادلخته، ضد درد یا آنتی‌بیوتیک در دوران نقاهت دارند. همچنین افرادی که سابقه واکنش آلرژیک شدید به دارو دارند و یا خانواده‌هایی که تجربه کافی برای تزریق با تکنیک ایمن به بیمار سالمند یا کودک خود را ندارند، می‌توانند با خیال راحت از خدمات تزریق در منزل سالمندیار بهره ببرند.',
        displayOrder: 2,
      },
      {
        id: 3,
        heading: 'چه خدماتی در زمینه تزریقات قابل ارائه در منزل است؟',
        content:
          'طیف خدمات قابل ارائه در چارچوب تزریقات در منزل بسیار گسترده است و بر اساس نیاز بالینی بیمار توسط تیم پرستاری سالمندیار برنامه‌ریزی می‌گردد. در ابتدا و رایج‌ترین مورد، تزریق آمپول در منزل است که شامل تزریق عضلانی انواع ویتامین‌ها (مانند B12، D3، ویتامین C و ترکیبات مولتی‌ویتامین)، آنتی‌بیوتیک‌های عضلانی، هورمون‌ها و داروهای ضددرد می‌شود. دوم، تزریق زیرجلدی که پرکاربردترین آن تزریق انسولین برای بیماران دیابتی است؛ همچنین هپارین و داروهای انعقاد خون نیز در این دسته قرار می‌گیرند. سوم، تزریق داخل وریدی و تزریق سرم در منزل که شامل نصب و تنظیم سر و مسیر وارید، تزریق داروهای وریدی از طریق سر و مسیر، آهسته‌تزریق (IV Push) و تزریق سرم‌های آبرسانی و دارویی می‌باشد. چهارم، نصب و نگهداری از کانولا یا کاتتر محیطی که برای بیمارانی که به تزریق وریدی مکرر نیاز دارند انجام می‌شود تا از سوراخ شدن مکرر رگ جلوگیری شود. پنجم، آموزش صحیح تزریق انسولین یا داروهای دیگر به خود بیمار یا سرپرست خانواده، به همراه چک لیست ویدیویی و مکتوب جهت اجرای دقیق و بدون اشتباه. در نهایت، کنترل و ثبت علائم حیاتی قبل و بعد از تزریق و در صورت نیاز گزارش وضعیت به پزشک معالج، بخشی از خدمات تکمیلی پرستاری در منزل است که در سالمندیار به صورت استاندارد ارائه می‌گردد.',
        displayOrder: 3,
      },
      {
        id: 4,
        heading: 'مزایای دریافت خدمات تزریق در منزل برای بیمار و خانواده',
        content:
          'دریافت خدمات تزریقات در منزل دارای مزایای چند گانه‌ای است که تجربه بیمار و خانواده را به شدت بهبود می‌بخشد. مهم‌ترین مزیت، حفظ آرامش و آسایش بیمار در محیط خانگی است؛ تحقیقات بالینی نشان می‌دهد که انجام تزریق در محیطی آشنا و بدون هیاهوی مطب و درمانگاه، باعث کاهش قابل توجه استرس و درد ادراک‌شده توسط بیمار به‌خصوص سالمندان می‌شود. دوم، صرفه‌جویی عظیم در زمان و هزینه رفت و آمد؛ برای خانواده‌ای که در محدوده‌ای دور از مطب زندگی می‌کنند یا بیمار مشکل حرکتی دارد، یک مراجعه حضوری می‌تواند چند ساعت زمان و هزینه قابل توجهی از زمان کاری خانواده را مصرف کند. سوم، کاهش ریسک تماس با بیماران دیگر و ابتلا به عفونت‌های ثانویه؛ این مورد برای بیماران سالمند و کسانی که سیستم ایمنی ضعیفی دارند، از اهمیت حیاتی برخوردار است. چهارم، امکان مشاهده و آموزش عملی به خانواده در حین انجام تزریق توسط پرستار مجرب است؛ یعنی خانواده علاوه بر دریافت خدمت، مهارت‌های ایمن تزریق را برای مواقع ضروری نیز یاد می‌گیرند. پنجم، نظارت و پشتیبانی پس از تزریق؛ پرستار سالمندیار تا زمانی که از ایمنی بیمار پس از تزریق مطمئن نشده، محیط را ترک نمی‌کند و همچنین در صورت بروز هرگونه عارضه در ساعات بعد، پشتیبانی تلفنی تیم پزشکی در دسترس است. در نهایت، برنامه‌ریزی منظم برای دوره‌های درمانی طولانی مانند دوره آنتی‌بیوتیک ۱۰ روزه باعث می‌شود خانواده نگران فراموش کردن زمان تزریق نباشند و این وظیفه به طور کامل بر عهده تیم سالمندیار باشد.',
        displayOrder: 4,
      },
      {
        id: 5,
        heading: 'چه کسی می‌تواند تزریق را در منزل انجام دهد و معیارهای انتخاب پرستار',
        content:
          'انجام تزریق در محیط منزل نباید به صورت خودسرانه و توسط افراد غیرمتخصص انجام شود؛ زیرا تزریق نادرست می‌تواند منجر به عوارض جدی از جمله عفونت محل تزریق، نکروز بافت (مرگ بافت در محل)، آسیب عصبی، بروز آبسه، واکنش‌های آلرژیک درمان‌نشده و حتی خطرناک و همچنین اشتباه در دوز دارو شود. بنابراین این خدمت باید حتماً توسط پرستار دارای مدرک رسمی کارشناسی یا کارشناسی‌ارشد پرستاری از دانشگاه‌های معتبر کشور، و دارای کارت فعالیت معتبر از سازمان نظام پرستاری ارائه شود. در تیم سالمندیار، معیارهای پذیرش پرستار در بخش تزریقات بسیار سخت‌گیرانه تعریف شده است. ابتدا مدارک تحصیلی و نظام‌پرستاری به دقت بررسی می‌شود؛ دوم، سابقه کاری حداقل ۳ سال در بخش‌های مراقبت‌های ویژه، سوختگی، اورژانس یا بخش‌های تخصصی بیمارستانی الزامی است. سوم، گذراندن دوره‌های آموزشی ویژه «تزریق ایمن در محیط خانه و مدیریت عوارض حاد» و سپس رفع آزمون تئوری و عملی از جانب کمیته پزشکی سالمندیار لازم است. چهارم، بررسی سوابق اخلاقی و رفتاری و همچنین ارزیابی مهارت‌های ارتباطی با بیمار سالمند و خانواده انجام می‌گیرد. در نهایت، پرستاران به صورت دوره‌ای هر سه ماه یک بار از نظر مهارت تکنیک تزریق، مدیریت عوارض و دانش به‌روز دارویی ارزیابی می‌شوند تا بالاترین سطح کیفیت برای مراجعه به منزل بیمار حفظ شود.',
        displayOrder: 5,
      },
      {
        id: 6,
        heading: 'نکات ایمنی ضروری قبل، حین و بعد از تزریق در منزل',
        content:
          'رعایت نکات ایمنی در تمام مراحل انجام تزریق در منزل باعث حفظ سلامتی بیمار و جلوگیری از بروز عوارض غیرضروری می‌گردد. در مرحله قبل از تزریق: خانواده باید مکان مناسب روشن، تمیز و دارای میز یا سطوح مناسب برای قرار دادن لوازم را آماده کنند؛ داروها باید با دوز و تاریخ انقضا صحیح از مطب یا داروخانه تهیه شده و در دمای مناسب نگهداری شده باشند؛ همچنین نسخه معتبر پزشک آماده ارائه به پرستار باشد. بیمار باید قبل از تزریق آب کافی بنوشد، لباس راحت بپوشد و در صورت نیاز به توالت مراجعه کرده باشد. در مرحله حین تزریق: پرستار حتماً با ماسک و دستکش استریل جدید عمل کند، قبل و بعد از لمس بیمار دست‌های خود را با ضدعفونی‌کننده بشوید، محل تزریق را با الکل ۷۰ درصد به صورت دایره‌ای و به اندازه کافی بزرگ استریل کرده و اجازه دهد خود به خود خشک شود (به مدت ۳۰ ثانیه). همچنین پرستار باید قبل از تزریق، نام دارو، دوز، تاریخ انقضا و روش تزریق را با نسخه مقایسه کند (قاعده پنج بار بررسی یا Five Rights در پرستاری). در مرحله بعد از تزریق: پرستار محل تزریق را با گاز استریل به مدت چند ثانیه فشار ملایمی می‌آورد و سرنگ و سوژه را در جعبه نمونه‌برداری یا سوزن‌دان مخصوص دور می‌اندازد تا از آسیب تصادفی جلوگیری شود. سپس بیمار به مدت ۱۰ تا ۱۵ دقیقه باید در حالت نشسته یا دراز کشیده استراحت کند؛ در صورت بروز علائمی مانند سرگیجه، تاری دید، کهیر، تورم لب‌ها یا زبان، تنگی نفس، اضطراب شدید یا درد غیرقابل تحمل در محل تزریق، باید فوراً به پشتیبانی تلفنی سالمندیار اطلاع داده شود. تا ۲۴ ساعت بعد از تزریق عضلانی در ناحیه بازو یا ران، از فعالیت بدنی سنگین و حرکات شدید پرهیز کنید و به درستی هیدراته بمانید.',
        displayOrder: 6,
      },
      {
        id: 7,
        heading: 'اطلاعات لازم هنگام ثبت درخواست و فرآیند تامین پرستار',
        content:
          'برای اینکه فرآیند درخواست پرستار در منزل سریع، دقیق و بدون اتلاف وقت انجام شود، خانواده هنگام ثبت فرم درخواست باید اطلاعات لازم را به صورت کامل و دقیق وارد نمایند. اطلاعات اصلی شامل: نام و نام خانوادگی کامل بیمار، سن دقیق، جنسیت، تشخیص پزشکی کوتاه (در صورت وجود)، عنوان خدمت (تزریق آمپول در منزل، تزریق انسولین، تزریق سرم در منزل و...)، نام دقیق دارو، دوز تجویز شده و دفعات تزریق در روز یا هفته؛ تاریخ و ساعت دلخواه برای اولین مراجعه پرستار، شهر و آدرس دقیق همراه با جاذبه شناسایی و کد پستی، نام و شماره موبایل درخواست‌کننده (که در طول مراجعه قابل دسترس باشد) و در نهایت سابقه بیماری‌های زمینه‌ای مانند فشار خون، دیابت، بیماری‌های قلبی و همچنین سابقه هرگونه حساسیت دارویی یا غذایی مهم. پس از ثبت درخواست، کارشناس تیم سالمندیار ظرف مدت کوتاهی (حداکثر ۳۰ دقیقه) با شما تماس می‌گیرد و اطلاعات را تایید می‌کند؛ در صورت نیاز مافوق، هماهنگی با پزشک معالج انجام شده و پرستار مناسبی بر اساس موقعیت جغرافیایی و تخصص، برای ساعت مورد نظر تخصیص داده می‌شود. پرستار قبل از مراجعه، یک بار دیگر با تماس تلفنی از حضور بیمار در منزل مطلع می‌شود و سپس با کیت کامل و کد رهگیری به منزل می‌رسد. پس از اتمام خدمت، یک رسید دیجیتالی شامل امضا خانواده و گزارش کوتاه بالینی برای شما ارسال می‌گردد و در صورت نیاز، بازدیدهای بعدی نیز در تقویم سیستم رزرو می‌شود.',
        displayOrder: 7,
      },
      {
        id: 8,
        heading: 'هزینه خدمات تزریقات در منزل چگونه تعیین می‌شود؟',
        content:
          'قیمت‌گذاری خدمات تزریقات در منزل در سالمندیار کاملاً شفاف و بر اساس معیارهای مشخص و عادلانه انجام می‌شود. بدیهی است که تعیین یک رقم ثابت و واحد برای تمام موارد از نظر اقتصادی و فنی درست نیست؛ زیرا عوامل متعددی در میزان تلاش پرستار، هزینه لوازم مصرفی و زمان سفر تاثیر مستقیم دارد. مهم‌ترین عوامل تعیین هزینه عبارتند از: اول نوع تزریق (عضلانی، زیرجلدی، وریدی یا تزریق سرم در منزل با نصب و کنترل طولانی‌مدت)؛ دوم تعداد دفعات مراجعه در روز یا هفته (برای دوره‌های طولانی‌مدت تخفیف‌های ویژه تعریف می‌شود)؛ سوم منطقه جغرافیایی و زمان تقریبی سفر پرستار از مرکز به منزل شما؛ چهارم ساعت مراجعه (ساعات کاری عادی، ساعات تعطیل آخر هفته یا شیفت شب ۲۴ ساعته)؛ پنجم لوازم و داروهای مصرفی خاص که شامل کانولا، کاتتر، سوزن‌های ویژه، بسته استریل و... می‌شود. برای اطلاع دقیق از هزینه، بهترین راه ثبت درخواست اولیه و مشاوره رایگان تلفنی با کارشناسان سالمندیار است؛ تا بتوانند بر اساس نیاز واقعی شما، برآورد دقیق و شفافی را قبل از ارسال پرستار ارائه دهند. مهم آن است که هیچ هزینه‌ای به صورت پیش‌پرداخت از شما دریافت نمی‌شود و مبلغ پس از انجام کامل خدمت و رضایت خانواده، تسویه می‌گردد.',
        displayOrder: 8,
      },
      {
        id: 9,
        heading: 'مناطق تحت پوشش خدمات و زمان پاسخگویی',
        content:
          'سالمندیار در حال حاضر خدمات تزریقات در منزل را به صورت رسمی و با شبکه پرستاران فعال در سه کلان‌شهر بزرگ تهران، کرج و اصفهان ارائه می‌دهد. در شهر تهران، تمامی مناطق ۱ تا ۲۲ شهرداری و همچنین شهرهای پیرامونی مانند پردیس، اسلام‌شهر، شهریار و ملارد تحت پوشش قرار دارند؛ در بیشتر مناطق تهران، زمان پاسخگویی فوری از زمان ثبت درخواست تا حضور پرستار در منزل، کمتر از دو ساعت می‌باشد. در شهر کرج و استان البرز، مناطق مرکزی کرج، گوهردشت، مهردشت، کامال‌شهر، آزادشهر و ناحیه‌های اطراف شامل خدمات ۲۴ ساعته می‌شوند و زمان میانگین مراجعه حدود ۲ تا ۳ ساعت است. در شهر اصفهان، مناطق مرکزی ۱ تا ۱۲ از Coverage 24 ساعته برخوردار می‌باشند و برای سایر نواحی، زمان مراجعه با هماهنگی قبلی تعیین می‌گردد. برای درخواست‌های غیرفوری و برنامه‌ریزی شده (مانند تزریق روزانه انسولین یا دوره درمانی ۱۰ روزه)، پرستار در ساعت دقیق تعیین‌شده در روزهای مورد نظر حاضر می‌شود و صحت زمان‌بندی با پیامک یادآور به خانواده اطلاع داده می‌شود. برای مناطقی که در حال حاضر خارج از پوشش رسمی قرار دارند، کارشناسان سالمندیار با بررسی موردی امکان ارسال پرستار یا راهنمایی مناسب را ارائه می‌دهند.',
        displayOrder: 9,
      },
    ],
    relatedServicesSlugs: ['iv-infusion-at-home', 'wound-dressing-at-home', 'home-nursing', 'elderly-care-at-home'],
  },
  {
    id: 6,
    serviceDefinitionId: 2,
    serviceDefinition: {
      id: 2,
      code: 'WOUND',
      title: 'پانسمان در منزل',
      description: 'انجام پانسمان انواع زخم با پروتکل مدرن',
      category: 'Nursing',
    },
    slug: 'wound-dressing-at-home',
    longDescription:
      'پانسمان در منزل توسط پرستاران تخصصی سالمندیار با استفاده از پانسمان‌های مدرن و پروتکل‌های جهانی. تعویض پانسمان زخم ساده، زخم بعد از جراحی، سوختگی درجه ۱ تا ۳، زخم پای دیابتی و زخم‌های وریدی با تجهیزات استریل یکبار مصرف.',
    heroImageUrl:
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=nurse%20doing%20wound%20care%20dressing%20elderly%20patient%20home%20sterile%20gloves%20healing%20medical&image_size=landscape_16_9',
    ogImageUrl:
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=nurse%20doing%20wound%20care%20dressing%20elderly%20patient%20home%20sterile%20gloves%20healing%20medical&image_size=landscape_16_9',
    metaTitle: 'پانسمان در منزل | تعویض پانسمان زخم جراحی و ساده | سالمندیار',
    metaDescription:
      'خدمات پانسمان در منزل تهران و کرج توسط پرستار تخصصی. تعویض پانسمان زخم بعد از عمل، سوختگی، زخم پای دیابتی و زخم‌های ساده با لوازم مدرن و استریل.',
    primaryKeyword: 'پانسمان در منزل',
    secondaryKeywords: ['تعویض پانسمان در منزل', 'پرستار پانسمان در منزل', 'پانسمان زخم جراحی در منزل', 'پانسمان سوختگی در منزل', 'خدمات پرستاری در منزل'],
    primaryCtaText: 'درخواست پانسمان فوری',
    primaryCtaLink: '#guest-request-form',
    priceRangeText: 'قیمت‌گذاری بر اساس نوع و سطح زخم، میزان ترشح، تعداد تعویض در هفته و منطقه جغرافیایی. تخفیف ویژه بسته‌های ۵ و ۱۰ جلسه‌ای.',
    showInHomePage: true,
    isFeatured: true,
    displayOrder: 6,
    benefits: [
      {
        id: 1,
        title: 'پانسمان‌های مدرن و مدرج درمانی',
        description: 'استفاده از فوم، هیدروژل، آلژینات و پانسمان‌های اکتیو جهت تسریع التیام، کاهش درد و جلوگیری از جای زخم.',
        iconName: 'HeartPulse',
        colorClass: 'bg-teal-100 text-teal-600',
        displayOrder: 1,
      },
      {
        id: 2,
        title: 'ثبت عکس و گزارش هر جلسه',
        description: 'در هر پانسمان از زخم عکس‌برداری و گزارش روند بهبود با اندازه‌گیری دقیق تهیه و برای پزشک ارسال می‌شود.',
        iconName: 'Camera',
        colorClass: 'bg-blue-100 text-blue-600',
        displayOrder: 2,
      },
      {
        id: 3,
        title: 'کیت استریل تخصصی همراه',
        description: 'حضور پرستار با بهترین برندهای لوازم مصرفی (Tegaderm، Mepilex، Alginate) بدون نیاز به خرید خانگی.',
        iconName: 'BriefcaseMedical',
        colorClass: 'bg-rose-100 text-rose-600',
        displayOrder: 3,
      },
    ],
    targetPatients: [
      { id: 1, title: 'بعد از جراحی و بخیه پوستی', description: 'تعویض منظم پانسمان محل برش تا زمان ترکیدن بخیه‌ها و بررسی نشت عفونت', displayOrder: 1 },
      { id: 2, title: 'زخم‌های ساده و جزئی', description: 'بریدگی عمیق، خراشیدگی وسیع و سوختگی‌های درجه یک و دو', displayOrder: 2 },
      { id: 3, title: 'زخم پای دیابتی و زخم وریدی پا', description: 'مدیریت تخصصی زخم‌های مزمن با پانسمان‌های مدرن و کنترل قند خون همزمان', displayOrder: 3 },
      { id: 4, title: 'بیماران بعد از سوختگی', description: 'تعویض منظم پانسمان سوختگی درجه دو تا سه و کنترل عفونت', displayOrder: 4 },
    ],
    coverageAreas: [
      { id: 1, areaName: 'تهران (تمامی مناطق ۲۲ گانه)', has24HourService: true, displayOrder: 1 },
      { id: 2, areaName: 'کرج و مناطق البرز', has24HourService: true, displayOrder: 2 },
    ],
    testimonials: [
      {
        id: 1,
        clientFullName: 'آقای مرادی',
        clientRole: 'همسر بیمار',
        rating: 5,
        content:
          'همسرم بعد از جراحی آپاندیسیت دچار عفونت زخم جراحی شد و روزی یک بار نیاز به پانسمان تخصصی داشت. پرستار سالمندیار با یک پروتکل بسیار تمیز و مدرن زخم رو در ۷ جلسه کاملاً التیام بخشید. واقعاً دستش طلا.',
        highlight: 'التیام زخم جراحی عفونی آپاندیسیت در ۷ جلسه',
        testimonialDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        isApproved: true,
        isFeatured: true,
      },
    ],
    faqs: [
      {
        id: 1,
        question: 'هر چند وقت یک بار باید پانسمان زخم را تعویض کرد؟',
        answer:
          'بسته به نوع زخم و میزان ترشح آن متفاوت است؛ زخم‌های کم‌ترشح مثل زخم جراحی تمیز معمولاً هر ۴۸ تا ۷۲ ساعت یک بار، زخم‌های پرترشح مثل زخم عفونی یا سوختگی معمولاً روزانه و در برخی موارد دو بار در روز تعویض می‌شوند. پرستار بر اساس مشاهدات بالینی بهترین فاصله زمانی را تعیین می‌کند.',
        displayOrder: 1,
      },
      {
        id: 2,
        question: 'آیا تعویض پانسمان در منزل عوارضی دارد؟',
        answer:
          'با رعایت کامل پروتکل‌های بهداشتی و استریل توسط پرستار سالمندیار، ریسک عفونت به حداقل ممکن می‌رسد و در واقع به دلیل محیط تمیز خانگی و عدم تماس با بیماران دیگر، نسبت به درمانگاه و بیمارستان ایمن‌تر عمل می‌کند.',
        displayOrder: 2,
      },
      {
        id: 3,
        question: 'آیا جای زخم با پانسمان مدرن کمتر دیده می‌شود؟',
        answer:
          'بله؛ استفاده از پانسمان‌های مدرن هیدروکلوئید و سیلیکونی (مانند Mepiform و Dermatix) در فاز التیام باعث می‌شود که بافت اسکار یا جای زخم نازک‌تر و کم‌رنگ‌تر به وجود آید و در بسیاری از موارد با گذشت زمان تقریباً نامرئی می‌شود.',
        displayOrder: 3,
      },
    ],
    seoSections: [
      {
        id: 1,
        heading: 'اهمیت پانسمان در منزل برای روند بهبودی',
        content:
          'پانسمان صحیح زخم مهم‌ترین عامل در تسریع التیام و جلوگیری از عفونت است. زمانی که زخم در محیط تمیز خانگی و توسط پرستار متخصص انجام می‌پذیرد، روند بهبودی به طور متوسط ۳۰ تا ۴۰ درصد سریع‌تر از شرایط عادی پیش می‌رود. پانسمان در منزل مخصوصاً برای سالمندان و افرادی که مشکل حرکتی دارند، گزینه‌ای ایده‌آل است؛ زیرا هر بار رفت و آمد به مطب می‌تواند با استرس و خستگی اضافی همراه باشد که بر سیستم ایمنی بدن تاثیر منفی می‌گذارد. سالمندیار با اعمال پروتکل‌های استاندارد جهانی، انواع زخم‌های ساده تا متوسط را در منزل شما پانسمان کرده و روند بهبود را با ثبت عکس و گزارش هر مرحله در اختیار خانواده و پزشک معالج قرار می‌دهد.',
        displayOrder: 1,
      },
      {
        id: 2,
        heading: 'تفاوت پانسمان سنتی با پانسمان مدرن و تاثیر آن بر التیام',
        content:
          'بسیاری از خانواده هنوز از پانسمان‌های سنتی شامل گاز معمولی، بانداژ و سرما استفاده می‌کنند که علیرغم ارزان بودن، عوارض و کند بودن روند بهبودی زیادی را به همراه دارند. در پانسمان سنتی (Traditional Dry Dressing)، زخم در محیط خشک نگه داشته می‌شود و لایه شناور (Scab) روی آن ایجاد می‌گردد؛ این لایه ظاهراً از زخم محافظت می‌کند اما در واقع باعث می‌شود بافت گرانولاسیون (بافت تازه التیام‌یافته) به صورت کندتر و درشت‌تر رشد کند و در نهایت جای زخم بزرگ‌تر و واضح‌تری بر جای می‌گذارد. همچنین گاز معمولی به ترشحات زخم چسبیده و در هنگام تعویض، آسیب‌های دوباره‌ای به لایه‌های تازه پوست وارد می‌کند و درد قابل توجهی برای بیمار ایجاد می‌کند. در مقابل، پانسمان‌های مدرن (Modern Moist Wound Therapy) ابداع شده‌اند که بر اساس اصل «زخم مرطوب التیام می‌یابد» ساخته شده‌اند. این نوع پانسمان‌ها رطوبت زخم را در یک سطح ایده‌آل نگه می‌دارند، لایه میانی نچسب دارند که به بافت زخم نمی‌چسبد، ترشحات اضافی را جذب کرده و همزمان از ورود میکروب‌ها و باکتری‌ها جلوگیری می‌کنند. در این روش التیام زخم تقریباً بدون درد بوده و بافت اسکار یا جای زخم، نازک‌تر و کم‌رنگ‌تری خواهد بود. پرستاران سالمندیار با توجه به نوع زخم (ترشح‌زا یا خشک، عفونی یا تمیز، عمیق یا سطحی) بهترین نوع پانسمان مدرن را انتخاب و مصرف می‌کنند تا روند التیام در کمترین زمان ممکن تحقق یابد.',
        displayOrder: 2,
      },
      {
        id: 3,
        heading: 'مدیریت زخم پای دیابتی در منزل با پروتکل‌های تخصصی',
        content:
          'زخم پای دیابتی یکی از شایع‌ترین و در عین حال خطرناک‌ترین عوارض دیابت ملیتوس است که اگر به موقع و با روش صحیح درمان نشود، می‌تواند منجر به عفونت گسترده و در نهایت قطع عضو (آمپوتاسیون) گردد. طبق آمار انجمن دیابت ایران، سالانه حدود ۱۵ هزار نفر از بیماران دیابتی در ایران به دلیل عوارض زخم پای دیابتی، اندام خود را از دست می‌دهند که حدود ۸۵ درصد این موارد با مراقبت زودهنگام و پانسمان درست قابل پیشگیری هستند. مدیریت تخصصی زخم پای دیابتی در منزل شامل مجموعه‌ای از اقدامات همزمان است که باید طبق پروتکل IWGDF (گروه بین‌المللی کار بر روی زخم پای دیابتی) انجام شود. اول، کنترل دقیق قند خون ناشتا و بعد از غذا؛ چون قند خون بالا محیط مناسبی برای رشد باکتری‌ها فراهم می‌کند و روند التیام را کند می‌کند. دوم، پوشش کف پا با کفش‌های دیابتی نرم و پوشاک بدون درز؛ بزرگترین عامل ایجاد زخم پای دیابتی، فشار مکرر روی نقاط خاص کف پا به دلیل عصب‌شناسی دیابتیک (Diabetic Neuropathy) است. سوم، پانسمان تخصصی زخم با استفاده از پانسمان‌های نانو‌نقره (نانوسیلور) در صورت عفونت و پانسمان‌های فوم ضخیم در زخم‌های پرترشح بدون عفونت. چهارم، برداشتن منظم پوسته‌های اطراف ناخن (Debridement) که محل جمع شدن باکتری‌ها هستند. پنجم، آموزش روزانه بررسی کف پا توسط خود بیمار با آینه یا توسط خانواده برای تشخیص زودهنگام تاول‌ها، بریدگی‌ها یا تغییر رنگ پوست. در تیم سالمندیار، پرستاران متخصص زخم پای دیابتی با گذراندن دوره‌های آموزشی تخصصی، تمام این پروتکل‌ها را به صورت استاندارد در منزل بیمار اجرا می‌کنند و روند درمان را هر دو هفته یک بار برای پزشک متخصص عروق یا اندوکرینولوژیست گزارش می‌دهند تا در صورت نیاز تغییراتی در روش درمان اعمال گردد.',
        displayOrder: 3,
      },
      {
        id: 4,
        heading: 'نشانه‌های عفونت زخم که خانواده باید بداند',
        content:
          'یکی از مهم‌ترین بخش آموزش خانواده در خصوص زخم، آگاهی از نشانه‌های عفونت زخم است تا بتوانند در صورت بروز هر یک از این علائم، سریعاً به تیم پرستاری اطلاع دهند و از گسترش عفونت به جلوگیری کنند. نشانه‌های عفونت زخم طبق دستورالعمل WHO شامل موارد زیر است: اول، افزایش درد و سوزش در محل زخم که در ۲۴ تا ۴۸ ساعت اخیر تشدید شده است؛ معمولاً درد زخم تمیز با گذشت زمان کاهش پیدا می‌کند و هرگونه افزایش ناگهانی درد، نشان‌دهنده عفونت یا جمع شدن خون زیر پانسمان (هماتوم) است. دوم، قرمزی و گرمای بیش از حد در پوست اطراف زخم؛ اگر این قرمزی بیش از ۲ سانتی‌متر از لبه زخم به اطراف گسترش پیدا کرده باشد، احتمال ابتلا به سلولیت (عفونت لایه‌های زیرپوستی) بسیار بالاست. سوم، ترشح چرکی زرد یا سبز رنگ با بوی نامطبوع؛ ترشح شفاف یا زرد کم‌رنگ در ابتدای التیام طبیعی است، اما هرگونه ترشح کدر، چرکی و دارای بوی قوی، نشانه عفونت باکتریایی است. چهارم، تورم و ورم ملایم اطراف زخم به همراه حس کشیدگی در پوست؛ این تورم معمولاً با افزایش درد و قرمزی همراه است. پنجم، تب بیش از ۳۸ درجه سانتی‌گراد که با علائم دیگری مثل لرز، بدن‌درد و بی‌اشتهایی همراه باشد؛ در این حالت احتمال گسترش عفونت به خون (سپسیس) وجود دارد و باید فوراً اقدامات لازم صورت پذیرد. ششم، عدم پیشرفت التیام؛ اگر زخم تمیز بعد از ۱۰ تا ۱۴ روز هیچ تغییری در اندازه یا عمق نداشته باشد، معمولاً به دلیل عفونت بی‌علامت یا جریان خون نامناسب به ناحیه زخم است. خانواده‌ها باید بدانند که پانسمان فقط در جلسات درخواستی انجام می‌شود و در فواصل بین دو جلسه، وظیفه نظارت بر زخم و اطلاع‌رسانی سریع در صورت بروز هر کدام از این علائم بر عهده خانواده است. پرستاران سالمندیار در اولین جلسه، تمام این نشانه‌ها را به صورت عملی و همراه با تصاویر آموزشی برای خانواده آموزش می‌دهند تا بتوانند در مواقع ضروری سریعاً واکنش نشان دهند.',
        displayOrder: 4,
      },
    ],
    relatedServicesSlugs: ['bedsores-dressing-at-home', 'dressing-change-at-home', 'injection-at-home', 'iv-infusion-at-home', 'home-nursing'],
  },
  {
    id: 7,
    serviceDefinitionId: 2,
    serviceDefinition: {
      id: 2,
      code: 'WOUND',
      title: 'پانسمان زخم بستر',
      description: 'درمان و پانسمان تخصصی زخم بستر درجه ۲ تا ۴',
      category: 'Nursing',
    },
    slug: 'bedsores-dressing-at-home',
    longDescription:
      'پانسمان زخم بستر در منزل با پروتکل‌های جهانی درمان زخم‌های فشاری توسط پرستاران متخصص زخم سالمندیار. پانسمان زخم بستر درجه ۲، ۳ و ۴ با استفاده از پانسمان‌های مدرن فوم، آلژینات، هیدروکلوئید و هیدروژل همراه با آموزش جامع جلوگیری از پیشرفت به خانواده و تیم مراقبت.',
    heroImageUrl:
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=nurse%20treating%20bedsore%20pressure%20ulcer%20elderly%20bedridden%20patient%20home%20professional%20wound%20care&image_size=landscape_16_9',
    ogImageUrl:
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=nurse%20treating%20bedsore%20pressure%20ulcer%20elderly%20bedridden%20patient%20home%20professional%20wound%20care&image_size=landscape_16_9',
    metaTitle: 'پانسمان زخم بستر در منزل | درمان زخم فشاری درجه ۲ تا ۴ | سالمندیار',
    metaDescription:
      'پانسمان تخصصی زخم بستر در منزل برای بیماران تخت بخواب سالمند. درمان زخم‌های درجه ۲ تا ۴ با پانسمان‌های مدرن فوم و آلژینات و آموزش جلوگیری از تشدید به خانواده.',
    primaryKeyword: 'پانسمان زخم بستر در منزل',
    secondaryKeywords: ['درمان زخم بستر در منزل', 'پرستار پانسمان زخم بستر', 'درجه‌بندی زخم فشاری', 'جلوگیری از زخم بستر در بیماران تخت بخواب', 'خدمات پرستاری در منزل'],
    primaryCtaText: 'درخواست پانسمان زخم بستر',
    primaryCtaLink: '#guest-request-form',
    priceRangeText: 'قیمت‌گذاری بر اساس درجه زخم (۱ تا ۴)، متراژ زخم، وجود عفونت، تعداد تعویض هفتگی و نوع پانسمان مدرن مصرفی؛ بسته‌های ۱۰ و ۲۰ جلسه‌ای با تخفیف ویژه',
    showInHomePage: true,
    isFeatured: true,
    displayOrder: 7,
    benefits: [
      {
        id: 1,
        title: 'انجام شستشو و دبریدمِن استریل',
        description: 'استفاده از نرمال‌سالین، سرم فیزیولوژیک گرم‌شده و تکنیک‌های بدون آسیب رساندن به بافت گرانولاسیون.',
        iconName: 'Droplets',
        colorClass: 'bg-red-100 text-red-600',
        displayOrder: 1,
      },
      {
        id: 2,
        title: 'ثبت عکس و اندازه‌گیری در هر جلسه',
        description: 'ضبط طول، عرض و عمق زخم + عکس‌برداری با دستکش استریل برای ارزیابی روند بهبود.',
        iconName: 'Camera',
        colorClass: 'bg-blue-100 text-blue-600',
        displayOrder: 2,
      },
      {
        id: 3,
        title: 'آموزش جامع تغییر وضعیت به خانواده',
        description: 'آموزش تکنیک ۳۰ درجه چرخش، استفاده از بالشتک و تشک هوایی و کاهش فشار نقطه‌ای.',
        iconName: 'GraduationCap',
        colorClass: 'bg-green-100 text-green-600',
        displayOrder: 3,
      },
    ],
    targetPatients: [
      { id: 1, title: 'سالمندان تخت بخواب دچار زخم بستر درجه ۲ تا ۴', description: 'کنترل عفونت و التیام تدریجی با پروتکل مدرن', displayOrder: 1 },
      { id: 2, title: 'بیماران فلج مغزی یا نخاعی', description: 'مدیریت طولانی‌مدت زخم فشاری نواحی عصبی و ساکروم', displayOrder: 2 },
      { id: 3, title: 'بیماران بعد از ICU با زخم زایمان', description: 'ادامه برنامه درمانی و پیشگیری از بدتر شدن زخم', displayOrder: 3 },
    ],
    coverageAreas: [
      { id: 1, areaName: 'تهران و حومه (پردیس، اسلام‌شهر، شهریار)', has24HourService: true, displayOrder: 1 },
      { id: 2, areaName: 'کرج و گوهردشت', has24HourService: true, displayOrder: 2 },
    ],
    testimonials: [
      {
        id: 1,
        clientFullName: 'خانم کریمی',
        clientRole: 'دختر بیمار',
        rating: 5,
        content:
          'مادرم ۸۲ ساله بعد از سکته مغزی کاملاً تخت بخواب شده بود و زخم بستر درجه ۳ در ناحیه ساکروم داشت. با پانسمان منظم پرستار سالمندیار در ۱۰ هفته کامل التیام پیدا کرد. آموزش‌های خانواده واقعاً ضروری بود.',
        highlight: 'التیام کامل زخم بستر درجه ۳ در ۱۰ هفته',
        testimonialDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        isApproved: true,
        isFeatured: true,
      },
    ],
    faqs: [
      {
        id: 1,
        question: 'آیا زخم بستر درجه ۴ در منزل قابل درمان است؟',
        answer:
          'بله، با برنامه درمانی منظم، استفاده از پانسمان‌های مدرن، دبریدمِن منظم بافت نکروز، کنترل عفونت و آموزش صحیح خانواده برای تغییر وضعیت بیمار، زخم بستر حتی در مراحل پیشرفته درجه ۴ نیز قابل کنترل و التیام تدریجی است. در موارد پیشرفته با هماهنگی پزشک متخصص جراح پلاستیک همکاری انجام می‌شود.',
        displayOrder: 1,
      },
      {
        id: 2,
        question: 'چند بار در هفته برای پانسمان زخم بستر باید مراجعه انجام شود؟',
        answer:
          'زخم بستر درجه ۱ معمولاً نیازی به پانسمان مکرر ندارد و فقط با تغییر وضعیت و کرم مرطوب‌کننده کنترل می‌شود؛ درجه ۲ معمولاً ۲ تا ۳ بار در هفته، درجه ۳ معمولاً هر ۴۸ ساعت و درجه ۴ معمولاً روزانه یا یک روز در میان نیاز به تعویض پانسمان دارد.',
        displayOrder: 2,
      },
    ],
    seoSections: [
      {
        id: 1,
        heading: 'چرا پانسمان زخم بستر نیازمند تخصص ویژه است؟',
        content:
          'زخم بستر یا زخم فشاری یکی از پیچیده‌ترین انواع زخم در بیماران تخت بخواب است. درمان این نوع زخم صرفاً با تعویض گاز و سرما انجام نمی‌شود؛ بلکه نیازمند ارزیابی دقیق درجه زخم (مقیاس برادن)، انتخاب پانسمان مناسب بر اساس میزان ترشح و عمق زخم، آموزش صحیح خانواده برای تغییر وضعیت هر دو ساعت یک‌بار، رعایت رژیم غذایی سرشار از پروتئین و ویتامین و... دارد. پرستاران تخصصی زخم سالمندیار با گذراندن دوره‌های آموزشی مدون و سال‌ها تجربه عملی در بخش‌های سوختگی و ICU، می‌توانند روند درمان زخم بستر را به بهترین شکل در محیط خانه مدیریت نمایند و از گران‌تر شدن عارضه و نیاز به بستری مجدد در بیمارستان جلوگیری کنند.',
        displayOrder: 1,
      },
      {
        id: 2,
        heading: 'درجه‌بندی زخم بستر و انتخاب پانسمان مناسب',
        content:
          'زخم بستر بر اساس مقیاس NPUAP به چهار درجه طبقه‌بندی می‌شود. درجه ۱ شامل تغییر رنگ قرمز در پوست بدون شکستگی لایه سطحی است که با کاهش فشار و کرم مرطوب‌کننده کنترل می‌شود. درجه ۲ با ایجاد تاول و شکستگی لایه‌های سطحی پوست مشخص می‌شود و پانسمان‌های هیدروکلوئید بهترین گزینه هستند. درجه ۳ شامل گسترش زخم تا لایه چربی زیر پوست و وجود ترشح زیاد است که نیاز به پانسمان‌های آلژینات و فوم ضخیم دارد. درجه ۴ که عمیق‌ترین مرحله است، زخم تا سطح استخوان و تاندون‌ها گسترش می‌یابد و ممکن است عفونت و نکروز بافت داشته باشد؛ در این مرحله علاوه بر دبریدمن (برداشتن بافت مرده) و پانسمان‌های مدرن، نیاز به هماهنگی با پزشک و مصرف آنتی‌بیوتیک هم وجود دارد. مهم‌ترین اشتباه خانواده در درمان زخم بستر استفاده مداوم از سرما و گاز معمولی برای همه مراحل است که نه تنها به بهبودی کمک نمی‌کند، بلکه با چسبیدن گاز به بافت جدید در هر تعویض، آسیب‌های تازه‌ای ایجاد و روند التیام را کند می‌کند.',
        displayOrder: 2,
      },
      {
        id: 3,
        heading: 'پیشگیری از پیشرفت زخم با تغییر وضعیت و تجهیزات کمکی',
        content:
          'طبق دستورالعمل‌های بین‌المللی، ۸۰ درصد موفقیت در درمان زخم بستر به پیشگیری از افزایش فشار و رفع عوامل خطر بستگی دارد و فقط ۲۰ درصد به خود پانسمان تعلق می‌گیرد. مهم‌ترین روش پیشگیری، تغییر منظم وضعیت بیمار طبق تکنیک ۳۰ درجه است؛ به جای چرخش کامل ۹۰ درجه که خودش باعث افزایش فشار روی استخوان ران می‌شود، بیمار را فقط ۳۰ درجه روی پهلو می‌چرخانند و از پشت با بالشتک مربعی یا اسفنجی (Wedge Pillow) حمایت می‌کنند. این کار فشار روی ساکروم را تا ۶۰ درصد کاهش می‌دهد. برای بیماران تخت بخواب دائمی، استفاده از تشک هوایی متناوب (Alternating Pressure) با کمپرسور جداگانه الزامی است؛ این تشک به طور منظم سلول‌های هوا را خالی و پر می‌کند و فشار روی نقاط مختلف بدن را توزیع می‌کند. همچنین استفاده از بالشتک‌های ژل روی صندلی چرخدار، کاهش تماس طولانی‌مدت پوست با ادرار و مدفوع با کاتتر ادراری و پوشک‌های فوق جاذب، و تغذیه با پروتئین کافی (حداقل ۱.۵ گرم به ازای هر کیلو وزن) همگی در جلوگیری از بدتر شدن زخم و کمک به التیام موثر هستند.',
        displayOrder: 3,
      },
      {
        id: 4,
        heading: 'پروتکل استاندارد پانسمان زخم بستر در سالمندیار',
        content:
          'پروتکل ۸ مرحله‌ای سالمندیار برای پانسمان زخم بستر تضمین‌کننده کیفیت یکنواخت در تمام جلسات است. مرحله اول آماده‌سازی محیط تمیز و نور مناسب، شستشوی دست ۴۰ ثانیه‌ای طبق پروتکل WHO و پوشیدن دستکش استریل و ماسک است. مرحله دوم برداشتن پانسمان قدیمی با احتیاط؛ اگر گاز به بافت چسبیده باشد با سرم فیزیولوژیک گرم نرم می‌کنیم تا از آسیب به گرانولاسیون جدید جلوگیری شود. مرحله سوم شستشوی زخم با سرم گرم به روش سرنگی و به صورت دایره‌ای از مرکز به اطراف است. مرحله چهارم دبریدمن ملایم بافت نکروز و برداشتن سلول‌های مرده بدون آسیب به بافت سالم است. مرحله پنجم اندازه‌گیری طول، عرض و عمق زخم با کالیپر و ثبت عکس برای مقایسه در جلسات بعدی است. مرحله ششم انتخاب پانسمان اولیه متناسب با میزان ترشح (آلژینات برای ترشح زیاد، هیدروژل برای زخم خشک، فوم برای ترشح متوسط) و سپس اعمال لایه نهایی نچسب و محافظ است. مرحله هفتم ثبت و فیکس کردن پانسمان با نوارهای نازک کاغذی بدون آسیب به پوست اطراف است. در پایان مرحله هشتم آموزش خانواده در مورد تغییر وضعیت هر دو ساعت، نشانه‌های عفونت و مراقبت‌های روزانه انجام و گزارش کتبی جلسه برای پزشک ارسال می‌گردد.',
        displayOrder: 4,
      },
    ],
    relatedServicesSlugs: ['wound-dressing-at-home', 'dressing-change-at-home', 'elderly-care-at-home', 'home-nursing', '24h-patient-monitoring'],
  },
  {
    id: 8,
    serviceDefinitionId: 1,
    serviceDefinition: {
      id: 1,
      code: 'INJECTION',
      title: 'تزریق سرم در منزل',
      description: 'نصب و کنترل سرم‌درمانی با پروتکل‌های وریدی',
      category: 'Nursing',
    },
    slug: 'iv-infusion-at-home',
    longDescription:
      'تزریق سرم در منزل توسط پرستار متخصص مراقبت‌های ویژه سالمندیار. نصب کانولا وریدی شماره ۱۸ تا ۲۴، آهسته‌تزریق داروها، سرم آبرسانی، آنتی‌بیوتیک و سرم‌های دارویی با مانیتورینگ دقیق علائم حیاتی (فشار خون، نبض، دما و اشباع اکسیژن) در طول کل تزریق و ۱۵ دقیقه پس از پایان آن.',
    heroImageUrl:
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=professional%20nurse%20IV%20infusion%20intravenous%20drip%20elderly%20patient%20home%20setting%20sterile%20monitoring&image_size=landscape_16_9',
    ogImageUrl:
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=professional%20nurse%20IV%20infusion%20intravenous%20drip%20elderly%20patient%20home%20setting%20sterile%20monitoring&image_size=landscape_16_9',
    metaTitle: 'تزریق سرم در منزل | پرستار سرم درمانی و کانولا | سالمندیار',
    metaDescription:
      'تزریق سرم در منزل تهران و کرج با پرستار متخصص ICU. نصب کانولا، تزریق آنتی‌بیوتیک وریدی، سرم آبرسانی و مانیتورینگ دقیق تا پایان تزریق.',
    primaryKeyword: 'تزریق سرم در منزل',
    secondaryKeywords: ['سرم درمانی در منزل', 'نصب کانولا در منزل', 'آهسته‌تزریق در منزل', 'سرم ویتامینه در منزل', 'خدمات پرستاری در منزل'],
    primaryCtaText: 'درخواست تزریق سرم',
    primaryCtaLink: '#guest-request-form',
    priceRangeText: 'قیمت‌گذاری بر اساس مدت زمان تزریق، نوع دارو، حجم سرم، نیاز به مانیتورینگ پایدار و منطقه جغرافیایی. تخفیف ویژه برای بسته‌های ۵ تا ۱۰ روزه روزانه.',
    showInHomePage: true,
    isFeatured: false,
    displayOrder: 8,
    benefits: [
      {
        id: 1,
        title: 'مانیتورینگ علائم حیاتی طول تزریق',
        description: 'ثبت فشار خون، نبض، اشباع O2 و دما هر ۱۵ دقیقه یک بار و گزارش آن به خانواده و پزشک.',
        iconName: 'Activity',
        colorClass: 'bg-sky-100 text-sky-600',
        displayOrder: 1,
      },
      {
        id: 2,
        title: 'نصب کانولا با یک بار سوراخ کردن',
        description: 'استفاده از کاتترهای وریدی شفاف Vialon (BD) با زاویه ۱۵ درجه برای حداقل شدن درد و احتمال خون‌ریزی.',
        iconName: 'Syringe',
        colorClass: 'bg-indigo-100 text-indigo-600',
        displayOrder: 2,
      },
      {
        id: 3,
        title: 'کیت استریل یکبار مصرف',
        description: 'استفاده از دستکش استریل، اسپری الکل، Tourniquet یکبار مصرف و گاز استریل جداگانه برای هر بیمار.',
        iconName: 'ShieldCheck',
        colorClass: 'bg-emerald-100 text-emerald-600',
        displayOrder: 3,
      },
    ],
    targetPatients: [
      { id: 1, title: 'بیماران کم‌آب بعد از تب یا اسهال ویروسی', description: 'سرم آبرسانی سریع با Dextrose و NaCl ۰.۹٪', displayOrder: 1 },
      { id: 2, title: 'نیاز به آنتی‌بیوتیک وریدی طولانی‌مدت', description: 'ادامه دوره درمانی خارج از بیمارستان بدون نیاز به بستری', displayOrder: 2 },
      { id: 3, title: 'بیماران نیازمند سرم تقویتی و ویتامین', description: 'سرم‌های مگنز، سلنیوم، ویتامین گروه B و آهسته‌تزریق درماتولوژی', displayOrder: 3 },
      { id: 4, title: 'بیماران شیمی‌درمانی پس از ترخیص', description: 'آهسته‌تزریق داروهای شیمی‌درمانی و ضد تهوع در محیط خانه', displayOrder: 4 },
    ],
    coverageAreas: [
      { id: 1, areaName: 'تهران (تمامی مناطق ۲۲ گانه)', has24HourService: true, displayOrder: 1 },
      { id: 2, areaName: 'کرج و مناطق البرز', has24HourService: true, displayOrder: 2 },
    ],
    testimonials: [
      {
        id: 1,
        clientFullName: 'آقای محمدی',
        clientRole: 'پسر بیمار',
        rating: 5,
        content:
          'پدرم ۷۶ ساله بعد از آنفولانزا دچار کم‌آبی شد و یا نمی‌تونست آب بنوشه. پرستار سالمندیار با تجهیزات کامل آمد و کانولا رو با یک بار سوزن زدن نصب کرد و تا پایان تزریق کنارش بود. واقعاً لازمه برای سالمندان از اورژانس استفاده نکرد و تزریق رو در منزل انجام داد.',
        highlight: 'تزریق سرم آبرسانی برای سالمند کم‌آب بعد از آنفولانزا',
        testimonialDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        isApproved: true,
        isFeatured: true,
      },
    ],
    faqs: [
      {
        id: 1,
        question: 'آیا پرستار تا پایان تزریق سرم کنار بیمار می‌ماند؟',
        answer:
          'بله، در تمام موارد تزریق سرم وریدی و دارویی، پرستار تا پایان تزریق و حداقل ۱۵ دقیقه پس از آن (برای پایش واکنش‌های آلرژیک به دارو) در کنار بیمار می‌ماند و هر ۱۵ دقیقه یک بار علائم حیاتی (فشار خون، نبض، اشباع O2، دما) را ثبت می‌کند.',
        displayOrder: 1,
      },
      {
        id: 2,
        question: 'آیا برای سالمندان وریدگیر دشوار، امکان استفاده از کاتتر ثابت (Cannula Stayfix) وجود دارد؟',
        answer:
          'بله، برای بیمارانی که دوره درمانی طولانی (بیش از ۵ روز) دارند، از کانولاهای ثابت با فیکس چسب مخصوص (Fixomull) و کاور شفاف استفاده می‌شود تا چندین روز بدون نیاز به سوراخ کردن مجدد در محل باقی بماند و از ریسک عفونت و آسیب به ورید جلوگیری شود.',
        displayOrder: 2,
      },
    ],
    seoSections: [
      {
        id: 1,
        heading: 'تزریق سرم در منزل؛ کمتر شناخته‌شده ولی پرکاربرد',
        content:
          'بسیاری از بیماران به ویژه در فصول گرم سال و پس از ابتلا به بیماری‌های ویروسی مثل آنفولانزا و گاستروانتریت، دچار کم‌آبی جدی می‌شوند که تزریق سرم آبرسانی برای رفع سریع آن مفید است. همچنین دوره‌های درمانی آنتی‌بیوتیک وریدی، سرم‌های ویتامینه و تقویتی (مانند سرمی مگنز، سلنیوم و ترکیبی)، سرم‌های ضد درد و داروهای شیمی‌درمانی خاص، همگی می‌توانند با نظارت پرستار متخصص در منزل انجام شوند. مزیت اصلی این روش، اجتناب از رکود طولانی در اورژانس بیمارستان و به حداقل رساندن تماس بیمار سالمند با محیط‌های پر از میکروب است. همچنین سطح استرس بیمار در محیط خانه به مراتب پایین‌تر بوده و اعضای خانواده نیز در اطمینان کامل از نظر کنترل دما و محکم بودن کانولا هستند.',
        displayOrder: 1,
      },
      {
        id: 2,
        heading: 'انواع سرم‌های قابل تزریق در منزل و موارد کاربرد',
        content:
          'طبق دستورالعمل وزارت بهداشت، بسیاری از سرم‌های دارویی و آبرسانی که نیازی به مانیتورینگ تهاجمی ندارند، مجاز به انجام در محیط خانه هستند. سرم‌های آبرسانی شامل سرم Nacl ۰.۹٪ یا اسمی، سرم دکستروز ۵٪ و ۱۰٪، سرم ترکیبی رینگر لاکتات (Ringer Lactate) و سرم‌های هیپرتونیک برای کم‌آبی شدید هستند؛ این نوع سرماها معمولاً برای جبران کم‌آبی ناشی از تب طولانی، اسهال و استفراغ مکرر، گرما‌زدگی، یا کاهش خون‌ریزی خفیف استفاده می‌شوند. سرم‌های دارویی شامل آنتی‌بیوتیک‌های وریدی مانند سفتریاکسون، وانکومایسین، آمیکاسین و... است که برای عفونت‌های مزمن (مثل ادراری، تنفسی یا پوست و نرم) نیاز به تزریق مداوم ۷ تا ۱۴ روزه دارند. سرم‌های ویتامینه و تقویتی مثل Magnesium Sulfate، Selen، ترکیبات B Complex، ویتامین C، سرم‌های ضد درد مانند پتاسیم، Tramadol، Ketorolac و سرم‌های هیدراتاسیون پوست و ضد پیری (آهسته‌تزریق‌های درماتولوژی) همگی در صورت تجویز پزشک، کاملاً قابل انجام در منزل توسط پرستار متخصص هستند. نکته بسیار مهم این است که تزریق داروهای دارای ریسک واکنش آنافیلاکسی مانند بوسولفان، داروهای شیمی‌درمانی خاص، و داروهای ضد انعقاد با کنترل INR، حتماً باید همراه با مانیتورینگ پیوسته ECG و وجود کیت اورژانس (آدرنالین، هیدروکورتیزون) در خانه انجام شود که در تیم سالمندیار به صورت استاندارد در تمام جلسات وجود دارد.',
        displayOrder: 2,
      },
      {
        id: 3,
        heading: 'نکات ایمنی در تزریق سرم در منزل برای سالمندان',
        content:
          'بیماران سالمند به دلیل شکنندگی بیشتر وریدها، بیماری‌های قلبی و عروقی زمینه‌ای، و اختلالات انعقادی خون، مستعد ابتلا به عوارض بیشتری در طول تزریق سرم هستند و رعایت نکات ایمنی در آن‌ها بسیار حساس‌تر از افراد جوان است. اول از همه، قبل از شروع تزریق، پرستار باید پروفایل دارویی کامل بیمار را بررسی کند و از عدم تداخل داروی تجویز شده با سایر داروهای روزانه بیمار (خصوصاً داروهای ضد فشار خون، ضد دیابت و ضد انعقاد مانند وارفارین و آسپرین) اطمینان حاصل نماید. دوم، برای سالمندان دچار نارسایی قلبی یا کلیوی، سرعت تزریق سرم (نرخ قطره در دقیقه) باید به شدت کنترل شود؛ در مواردی که دستور پزشک صریح ندارد، نرخ ۲۰ تا ۴۰ قطره در دقیقه حداکثر توصیه می‌شود تا از ادم ریوی یا افزایش فشار وریدی مرکزی جلوگیری شود. سوم، انتخاب مناسب‌ترین ورید برای کانولا؛ برای سالمندان معمولاً وریدهای ساعد فوقانی (Cephalic و Basilic) ترجیح داده می‌شوند و هرگز از وریدهای پا (به دلیل افزایش ریسک ترومبوز وریدی عمقی) و وریدهای مفصلی مچ دست (به دلیل ریسک پارگی) استفاده نمی‌شود. چهارم، استفاده از فیکساسیون استاندارد کانولا با سیلکون پد نچسب (Tegaderm) و پوشش کامل محل سوراخ تا ۲۴ ساعت پس از جابجایی کانولا، همراه با نظافت مکرر محل با الکل. پنجم، مانیتورینگ دقیق علائم عوارض حین تزریق شامل: تورم و درد سرد در محل کانولا (نشانه Extravasation)، تنگی نفس، خس خس سینه، کهیر پوستی، تورم لب‌ها یا تغییر سطح هوشیاری؛ در صورت بروز هر یک از این علائم باید فوراً تزریق قطع، کانولا خارج، محل را با گرم کردن کنترل و در صورت نیاز به بیمارستان منتقل کرد. پرستاران سالمندیار همگی دوره‌های ۱۶ ساعته تزریق سرم در سالمندان را با مدارک معتبر گذرانده‌اند و در هر جلسه علاوه بر کیت استاندارد تزریق، کیت واکنش‌های جانبی شامل آدرنالین ۱:۱۰۰۰، کلرفنیرامین، هیدروکورتیزون و اکسیژن ۵ لیتر همراه خود دارند.',
        displayOrder: 3,
      },
      {
        id: 4,
        heading: 'پروتکل استاندارد تزریق سرم در منزل در تیم سالمندیار',
        content:
          'تمام جلسات تزریق سرم در منزل طبق پروتکل ۷ مرحله‌ای استاندارد سالمندیار انجام می‌پذیرد تا ایمنی ۱۰۰٪ بیمار تأمین شود. مرحله اول: تأیید پیش از مراجعه؛ تیم پشتیبانی سالمندیار با تماس تلفنی ۱ ساعته قبل از مراجعه، دستورالعمل نوشتاری پزشک (با ذکر نام دارو، دوز، حجم سرم و سرعت تزریق) را تأیید کرده و از وجود محل مناسب (تخت یا مبل قابل تنظیم ارتفاع، پریز برق نزدیک و روشنایی مناسب) در منزل اطمینان حاصل می‌کند. مرحله دوم: آماده‌سازی محیط و تجهیزات پس از ورود پرستار؛ شستشوی دست با صابون ضدعفونی‌کننده طبق ۱۱ مرحله WHO، پوشیدن روپوش، ماسک و دستکش استریل، پخش تشک یکبار مصرف زیر بازوی بیمار، کنترل تاریخ انقضای تمام لوازم مصرفی (کانولا، سرم، سوزن، الکل اسپری) و تست حساسیت پوستی قبل از تزریق داروهای پر ریسک آلرژی. مرحله سوم: نصب کانولا وریدی؛ بستن تورنیکت در ۵ تا ۷ سانتی‌متر بالای محل انتخابی، استریل کردن سطح پوست به صورت دایره‌ای ۵ سانتی‌متری با الکل ۷۰٪ یا کلرهگزیدین، تزریق با زاویه ۱۵ تا ۳۰ درجه و مشاهده برگشت خون در محفظه کانولا، فرودادن زاویه و هل دادن کاتتر به داخل ورید، بازکردن تورنیکت و اتصال لوله به سرنگ شستشو با Nacl ۰.۹٪. مرحله چهارم: اتصال و کنترل اولیه؛ اتصال ست سرم به کانولا، باز کردن شیر قطره‌چکان، تنظیم سرعت قطره طبق دستور پزشک و کنترل نشت خون یا تورم در محل کانولا برای ۵ دقیقه اول. مرحله پنجم: مانیتورینگ پیوسته در طول تزریق؛ ثبت علائم حیاتی (فشار خون، نبض، دما، SpO2) هر ۱۵ دقیقه، بررسی محور بصری محل کانولا از نظر قرمزی و تورم، و پرسش مداوم از بیمار از نظر تهوع، سرگیجه، گزندگی و درد. مرحله ششم: پایان تزریق و خروج کانولا؛ بستن شیر قطره‌چکان، تزریق ۵ تا ۱۰ سی‌سی Nacl برای فالاش کامل محفظه کانولا (Flush)، فشردن ملایم محل با گاز استریل، کشیدن سریع کانولا موازی پوست، فشار ۳ تا ۵ دقیقه‌ای برای جلوگیری از خون‌ریزی زیر جلدی (Hematoma) و در نهایت پوشاندن محل با گاز و چسب نچسب. مرحله هفتم: گزارش‌گیری و پیگیری؛ پرستار در پایان گزارش کامل شامل: زمان شروع و پایان، نوع و حجم سرم، دوز دارو، علائم حیاتی در طول تزریق، و هرگونه عارضه یا واکنش را به صورت مکتوب در چارت بیمار ثبت می‌کند و ۲۴ ساعت بعد نیز تماس تلفنی پیگیری از خانواده برای اطمینان از عدم بروز عوارض دیررس انجام می‌شود.',
        displayOrder: 4,
      },
    ],
    relatedServicesSlugs: ['injection-at-home', 'home-nursing', 'elderly-care-at-home', '24h-patient-monitoring'],
  },
  {
    id: 9,
    serviceDefinitionId: 2,
    serviceDefinition: {
      id: 2,
      code: 'WOUND',
      title: 'تعویض پانسمان',
      description: 'تعویض منظم و دوره‌ای انواع پانسمان',
      category: 'Nursing',
    },
    slug: 'dressing-change-at-home',
    longDescription:
      'خدمات تعویض پانسمان در منزل برای دوره‌های درمانی طولانی‌مدت توسط پرستاران متخصص زخم سالمندیار. تعویض منظم پانسمان زخم بستر، زخم پای دیابتی، محل برش جراحی، PEG، تراکئوستومی، کاتتر ادراری دائمی و... طبق برنامه تعیین‌شده با پزشک و رعایت پروتکل‌های استریل جهانی.',
    heroImageUrl:
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=nurse%20changing%20wound%20dressing%20caregiver%20elderly%20patient%20home%20clean%20clinical%20procedure&image_size=landscape_16_9',
    ogImageUrl:
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=nurse%20changing%20wound%20dressing%20caregiver%20elderly%20patient%20home%20clean%20clinical%20procedure&image_size=landscape_16_9',
    metaTitle: 'تعویض پانسمان در منزل | دوره‌های منظم روزانه و هفتگی | سالمندیار',
    metaDescription:
      'تعویض پانسمان دوره‌ای در منزل برای بیماری‌های طولانی‌مدت. برنامه‌ریزی روزانه یا چند بار در هفته توسط پرستار ثابت و آشنا با بیمار.',
    primaryKeyword: 'تعویض پانسمان در منزل',
    secondaryKeywords: ['پرستار برای تعویض پانسمان', 'پانسمان دوره‌ای در منزل', 'تعویض منظم PEG و تراکئوستومی', 'برنامه درمانی پانسمان', 'خدمات پرستاری در منزل'],
    primaryCtaText: 'ثبت برنامه تعویض پانسمان',
    primaryCtaLink: '#guest-request-form',
    priceRangeText: 'قیمت‌گذاری ویژه برای بسته‌های ۷ یا ۱۴ روزه و جلسات مکرر؛ با انتخاب پرستار ثابت برای کل دوره درمان تا ۲۵ درصد تخفیف.',
    showInHomePage: true,
    isFeatured: false,
    displayOrder: 9,
    benefits: [
      {
        id: 1,
        title: 'پرستار ثابت برای کل دوره درمان',
        description: 'اختصاص یک پرستار آشنا با سابقه بیمار برای تمام جلسات تعویض پانسمان تا کیفیت حداکثری حفظ شود.',
        iconName: 'UserPlus',
        colorClass: 'bg-rose-100 text-rose-600',
        displayOrder: 1,
      },
      {
        id: 2,
        title: 'برنامه‌ریزی هفتگی کاملاً منظم',
        description: 'ارسال پیامک یادآوری ۲ ساعته قبل از هر جلسه و گزارش کتبی بعد از پایان هر تعویض.',
        iconName: 'CalendarClock',
        colorClass: 'bg-amber-100 text-amber-600',
        displayOrder: 2,
      },
      {
        id: 3,
        title: 'کامل‌ترین لوازم مصرفی همراه پرستار',
        description: 'حضور با انواع پانسمان‌های مدرن (فوم، آلژینات، هیدروژل) و لوازم استریل بدون نیاز به خرید خانگی.',
        iconName: 'BriefcaseMedical',
        colorClass: 'bg-violet-100 text-violet-600',
        displayOrder: 3,
      },
    ],
    targetPatients: [
      { id: 1, title: 'بیماران PEG یا تراکئوستومی دائمی', description: 'تعویض منظم بانداژ و نازل و بازرسی محل سوراخ استومی', displayOrder: 1 },
      { id: 2, title: 'زخم‌های طولانی‌مدت و مزمن', description: 'برنامه درمانی ۶ تا ۸ هفته‌ای تعویض منظم پانسمان زخم پای دیابتی و وریدی', displayOrder: 2 },
      { id: 3, title: 'بیماران بعد از جراحی بزرگ', description: 'تعویض منظم پانسمان برش تا زمان برداشتن بخیه‌های پوستی', displayOrder: 3 },
      { id: 4, title: 'بیماران با کاتتر ادراری دائمی', description: 'تعویض کاتتر فولی هر ۴ تا ۶ هفته و مراقبت روزانه آن', displayOrder: 4 },
    ],
    coverageAreas: [
      { id: 1, areaName: 'تهران (تمامی مناطق)', has24HourService: false, displayOrder: 1 },
      { id: 2, areaName: 'کرج و محدوده‌های البرز', has24HourService: false, displayOrder: 2 },
    ],
    testimonials: [
      {
        id: 1,
        clientFullName: 'خانم احمدی',
        clientRole: 'همسر بیمار',
        rating: 5,
        content:
          'همسرم بعد از جراحی بای پس عروق، PEG داشت و نیاز به تعویض منظم روزانه پانسمان بود. سالمندیار پرستار خانم ثابت معرفی کرد که ۶ هفته هر روز ساعت ۹ صبح می‌آمد و خیلی منظم و محترمانه با ما رفتار می‌کرد. واقعاً برنامه‌ریزی این تیم بی‌نظیر است.',
        highlight: 'تعویض منظم ۶ هفته‌ای پانسمان PEG پس از جراحی',
        testimonialDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        isApproved: true,
        isFeatured: true,
      },
    ],
    faqs: [
      {
        id: 1,
        question: 'آیا می‌توان برای مدت طولانی (مثل ۳ ماه) یک پرستار ثابت برای تعویض روزانه درخواست کرد؟',
        answer:
          'بله، برای دوره‌های درمانی طولانی‌مدت، سالمندیار امکان تخصیص یک پرستار ثابت با انعقاد قرارداد هفتگی یا ماهانه را فراهم می‌کند؛ همچنین در این حالت ۲۰ تا ۳۰ درصد تخفیف ویژه در حق الزحمه اعمال می‌شود.',
        displayOrder: 1,
      },
      {
        id: 2,
        question: 'آیا لوازم مصرفی (پانسمان، گاز و چسب) توسط خانواده تأمین می‌شود یا توسط پرستار؟',
        answer:
          'در حالت پیش‌فرض، پرستار سالمندیار همراه خود تمام لوازم استاندارد و یکبار مصرف (گاز استریل، پانسمان مدرن متناسب با نوع زخم، چسب نچسب، گانت و ماسک) را به همراه خواهد داشت و هزینه آن در تعرفه لحاظ شده است؛ البته در صورت تمایل خانواده هم می‌توانند این موارد را تأمین نمایند.',
        displayOrder: 2,
      },
    ],
    seoSections: [
      {
        id: 1,
        heading: 'برنامه‌ریزی منظم برای تعویض پانسمان‌های طولانی‌مدت',
        content:
          'بسیاری از بیماران مبتلا به زخم‌های مزمن، تجهیزاتی مانند PEG (تغذیه از طریق معده)، کاتتر ادراری دائمی یا تراکئوستومی دارند. این افراد به یک برنامه منظم و قابل پیش‌بینی برای تعویض پانسمان و بازرسی محل دسترسی نیاز دارند. در سالمندیار، برای این دسته از بیماران بسته‌های خدماتی ویژه هفتگی یا ماهانه تعریف می‌شود که در آن یک پرستار ثابت و آشنا در ساعت و روز مشخصی به صورت هفتگی چند بار مراجعه می‌کند و علاوه بر تعویض استاندارد پانسمان، علائم حیاتی بیمار را نیز ثبت و به خانواده گزارش می‌دهد. این برنامه‌ریزی منظم، خیال خانواده را از جهت فراموشی یا تاخیر در تعویض به طور کامل راحت می‌کند و مانع بروز عوارض زودرس می‌گردد.',
        displayOrder: 1,
      },
      {
        id: 2,
        heading: 'اهمیت رعایت پروتکل استریل در تعویض پانسمان در خانه',
        content:
          'یکی از مهم‌ترین تفاوت‌های تعویض پانسمان توسط پرستار متخصص و توسط خانواده، رعایت دقیق پروتکل‌های استریل و دستورالعمل‌های جهانی است. طبق گزارش مرکز کنترل بیماری آمریکا (CDC)، حدود ۳۰ درصد عفونت‌های زخم پس از ترخیص از بیمارستان، ناشی از روش‌های غیر بهداشتی تعویض پانسمان در خانه توسط خانواده است. پرستار متخصص طبق پروتکل استاندارد، قبل از شروع کار، دست‌ها را حداقل ۴۰ ثانیه با صابون ضدعفونی‌کننده می‌شوید و سپس دستکش استریل غیرپودری پوشیده، تشک یکبار مصرف زیر ناحیه مورد نظر گسترش می‌دهد و از تکنیک بدون لمس (No-Touch Technique) برای برداشتن پانسمان قدیمی استفاده می‌کند؛ یعنی هرگز با دستکش ناخالصی به لایه داخلی پانسمان تماس پیدا نمی‌کند. همچنین پرستار همیشه از روش شستشوی سرنگی با سرم فیزیولوژیک گرم به جای پاک کردن با پنبه استفاده می‌کند؛ چون پاک کردن سایشی با پنبه یا گاز، به بافت‌های تازه گرانوله شده آسیب می‌زند و روند التیام را کند می‌کند. نادیده گرفتن این موارد ساده، منجر به بروز عفونت‌های پوستی، سپسیس (عفونت خون) و در نهایت نیاز به بستری مجدد در بیمارستان می‌شود؛ بنابراین برای تعویض دوره‌ای پانسمان‌ها، خصوصاً در سالمندان با سیستم ایمنی ضعیف، حتماً باید از پرستار متخصص و دارای مدارک معتبر استفاده کرد.',
        displayOrder: 2,
      },
      {
        id: 3,
        heading: 'انواع پانسمان‌های پرکاربرد در تعویض دوره‌ای و کاربرد هر کدام',
        content:
          'در تعویض دوره‌ای پانسمان در منزل، انواع مختلفی از پانسمان‌های مدرن بر اساس نوع زخم و نیاز بیمار استفاده می‌شود که با پانسمان‌های سنتی (گاز معمولی و سرما) تفاوت‌های زیادی دارند. پانسمان‌های هیدروکلوئید (Hydrocolloid) شامل لایه چسبناکی از پکتین و کربوکسی‌متیل سلولز هستند و برای زخم‌های کم‌ترشح یا درجه دو زخم بستر مناسب‌اند؛ این نوع پانسمان ۳ تا ۷ روز بدون نیاز به تعویض باقی می‌مانند و رطوبت زخم را در سطح متعادل نگه می‌دارند. پانسمان‌های فوم (Foam) معمولاً از جنس پلی‌یورتان هستند و برای زخم‌های با ترشح متوسط تا زیاد مثل زخم‌های وریدی پا و زخم بستر درجه سه استفاده می‌شوند؛ این پانسمان‌ها قابلیت جذب ۱۰ تا ۲۰ برابر وزن خود را دارند و از پانسمان‌های آلژینات برای جلبک‌های بنفش (Alginate) که از جلبک قهوه‌ای بدست می‌آیند برای زخم‌های بسیار پرترشح مانند زخم‌های استومی استفاده می‌شود و باید هر ۱ تا ۳ روز یک بار تعویض شوند. پانسمان‌های هیدروژل (Hydrogel) برای زخم‌های خشک و لایه‌دار با نکروز مناسب‌اند و باعث نرم شدن بافت مرده و دبریدمِن خودکار زخم می‌شوند. انتخاب نوع پانسمان باید توسط پرستار متخصص با توجه به نوع زخم، میزان ترشح، عمق و وجود یا عدم وجود عفونت انجام شود؛ هرگز نباید یک نوع پانسمان را برای همه زخم‌ها به صورت یکنواخت به کار برد. در سالمندیار، پرستاران قبل از هر تعویض، زخم را از نظر اندازه، رنگ، بوی نامطبوع، لکه‌های سبز و وجود ترشح چرکی ارزیابی می‌کنند و در صورت تغییر مشخصات زخم، نوع پانسمان را نیز به‌روز می‌کنند.',
        displayOrder: 3,
      },
      {
        id: 4,
        heading: 'نشانه‌های هشدار دهنده در طول دوره تعویض پانسمان که باید سریعاً به پزشک اطلاع داد',
        content:
          'در طول دوره درمان و تعویض منظم پانسمان، برخی نشانه‌ها نشان‌دهنده عفونت یا بدتر شدن روند بیماری هستند که باید سریعاً به پزشک معالج اطلاع داده و یا در صورت نیاز به بیمارستان منتقل گردد. اول از همه، قرمزی گسترده و گرمای بیش از حد پوست اطراف زخم (بیش از ۲ سانتی‌متر از لبه زخم) که معمولاً با درد همراه است، نشانه ابتلا به سلولیت (عفونت لایه‌های زیرپوستی) است و باید سریعاً با آنتی‌بیوتیک سیستمیک درمان شود. دوم، بوی بسیار بد و تنفنده از زخم همراه با ترشح چرکی زرد یا سبز رنگ (به خصوص اگر لکه‌های سبز تیره با رنگ خاص Pseudomonas Aeruginosa داشته باشد) نشان‌دهنده عفونت باکتریایی جدی است که نیاز به نمونه‌گیری برای کشت و آنتی‌بیوگرام دارد. سوم، تورم و لکه‌های خونریزی در اطراف زخم که در جلسات اخیر گسترش پیدا کرده‌اند؛ ممکن است نشان‌دهنده اختلال انعقاد خون یا ترومبوز وریدی عمقی باشد. چهارم، تب بیش از ۳۸.۵ درجه سانتی‌گراد در بیمار که با سایر علائم تنفسی یا ادراری همراه نیست؛ معمولاً نشان‌دهنده عفونت ثانویه ناشی از زخم است. پنجم، تغییر وضعیت عمومی بیمار مانند بی‌اشتهایی شدید، خواب‌آلودگی زیاد یا بی‌قرازی که در سالمندان دچار زخم بستر ممکن است پیش‌درآمد سپسیس باشد. در تیم سالمندیار، پرستار در هر جلسه، تمام این علائم را در چارت اختصاصی بیمار ثبت می‌کند و در صورت مشاهده هر یک از نشانه‌های هشدار، بلافاصله با پزشک معالج هماهنگ می‌شود و خانواده را در جریان اقدامات بعدی قرار می‌دهد. این مدیریت هوشمند و سریع، از بروز عوارض جبران‌ناپذیر در سالمندان که دچار بیماری‌های زمینه‌ای هستند، جلوگیری می‌کند.',
        displayOrder: 4,
      },
    ],
    relatedServicesSlugs: ['wound-dressing-at-home', 'bedsores-dressing-at-home', 'home-nursing', 'iv-infusion-at-home'],
  },
  {
    id: 10,
    serviceDefinitionId: 6,
    serviceDefinition: {
      id: 6,
      code: 'ELDER',
      title: 'پرستار سالمند در منزل',
      description: 'همراهی و مراقبت روزانه از سالمند در خانه',
      category: 'PersonalCare',
    },
    slug: 'elderly-care-at-home',
    longDescription:
      'خدمات پرستار سالمند در منزل سالمندیار با کادر مجرب و دارای مدرک رسمی از دانشگاه علوم پزشکی. شامل: همراهی روزانه، کمک به تغذیه، کمک به دفع، نظارت بر مصرف دارو، کنترل منظم علائم حیاتی، تحریک ذهنی، پیاده‌روی همراه و گزارش منظم به خانواده.',
    heroImageUrl:
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=elderly%20caregiver%20nurse%20companion%20helping%20senior%20woman%20home%20happy%20warm%20loving%20support%20healthcare&image_size=landscape_16_9',
    ogImageUrl:
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=elderly%20caregiver%20nurse%20companion%20helping%20senior%20woman%20home%20happy%20warm%20loving%20support%20healthcare&image_size=landscape_16_9',
    metaTitle: 'پرستار سالمند در منزل | شیفت صبح، شب و ۲۴ ساعته | سالمندیار',
    metaDescription:
      'استخدام پرستار سالمند در منزل تهران و کرج با سوابق معتبر و کارت ملی پزشکی. شیفت صبح، شب، نیمه‌وقت و ۲۴ ساعته همراهی دائمی، کمک روزانه و نظارت بر دارو.',
    primaryKeyword: 'پرستار سالمند در منزل',
    secondaryKeywords: ['سالمندیار در منزل', 'مراقبت از سالمند در خانه', 'خدمات پرستاری در منزل', 'درخواست پرستار در منزل', 'استخدام پرستار سالمند'],
    primaryCtaText: 'درخواست مصاحبه پرستار سالمند',
    primaryCtaLink: '#guest-request-form',
    priceRangeText: 'قیمت‌گذاری بر اساس نوع شیفت (روزانه ۸ ساعت، شبانه، ۲۴ ساعته)، سابقه و مدرک پرستار، نوع نیاز بیمار و مدت قرارداد. تخفیف ویژه قراردادهای ۱ ماهه و ۳ ماهه.',
    showInHomePage: true,
    isFeatured: true,
    displayOrder: 10,
    benefits: [
      {
        id: 1,
        title: 'بررسی سوابق و مصاحبه حضوری',
        description: 'معرفی پرستار مناسب با حداقل ۳ سال تجربه سالمندی و امکان مصاحبه تلفنی یا حضوری قبل از شروع کار.',
        iconName: 'UserCheck',
        colorClass: 'bg-teal-100 text-teal-600',
        displayOrder: 1,
      },
      {
        id: 2,
        title: 'گزارش روزانه تصویری به خانواده',
        description: 'ارسال گزارش متنی و تصویری کوتاه از وضعیت روزانه سالمند (خوردن، خواب، خلق) برای فرزندان خارج از شهر.',
        iconName: 'FileText',
        colorClass: 'bg-blue-100 text-blue-600',
        displayOrder: 2,
      },
      {
        id: 3,
        title: 'جایگزین رایگان ۴۸ ساعته',
        description: 'در صورت بیماری یا مرخصی پرستار، معرفی جایگزین با مشخصات مشابه بدون هزینه اضافی برای خانواده.',
        iconName: 'RefreshCw',
        colorClass: 'bg-green-100 text-green-600',
        displayOrder: 3,
      },
    ],
    targetPatients: [
      { id: 1, title: 'سالمندان تنها ساکن آپارتمان بدون همراه', description: 'همراهی ۲۴ ساعته یا شیفت‌های روزانه برای جلوگیری از سقوط و تنهایی', displayOrder: 1 },
      { id: 2, title: 'سالمندان مبتلا به آلزایمر یا زوال عقل اولیه', description: 'مدیریت رفتارهای پرخاشگر، کمک به فعالیت‌های روزانه و پایش گم‌شدگی', displayOrder: 2 },
      { id: 3, title: 'پس از سکته مغزی یا نقاهت جراحی', description: 'کمک به انجام تمرینات توان‌بخشی، کمک به رفت‌وآمد و کنترل منظم دارو', displayOrder: 3 },
      { id: 4, title: 'سالمندان مبتلا به دیابت و فشار خون بالا', description: 'کنترل روزانه قند خون و فشار خون و مدیریت رژیم غذایی', displayOrder: 4 },
    ],
    coverageAreas: [
      { id: 1, areaName: 'تهران و حومه (شهریار، اسلام‌شهر، پردیس)', has24HourService: true, displayOrder: 1 },
      { id: 2, areaName: 'کرج و البرز (گوهردشت، ملرد، کن)', has24HourService: true, displayOrder: 2 },
      { id: 3, areaName: 'اصفهان مرکز', has24HourService: false, displayOrder: 3 },
    ],
    testimonials: [
      {
        id: 1,
        clientFullName: 'خانم رضایی',
        clientRole: 'دختر سالمند',
        rating: 5,
        content:
          'من در شیراز زندگی می‌کنم و مادرم تنها در تهران بود. بعد از سقوط و شکستگی لگنش، از سالمندیار پرستار ۲۴ ساعته درخواست کردم. خانم پرستار واقعاً مانند یک دختر با مادرم رفتار می‌کرد؛ من هر روز گزارش تصویری می‌گرفتم و خیال من راحت بود. تجربه بی‌نظیری بود.',
        highlight: 'همراهی ۲۴ ساعته سالمند تنها ساکن تهران توسط فرزند در شیراز',
        testimonialDate: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
        isApproved: true,
        isFeatured: true,
      },
    ],
    faqs: [
      {
        id: 1,
        question: 'آیا امکان تعویض پرستار در صورت نارضایتی وجود دارد؟',
        answer:
          'بله، تا ۴۸ ساعت اول شروع کار امکان تعویض رایگان پرستار وجود دارد و در ادامه قرارداد نیز در صورت نیاز و با هماهنگی، جایگزین مناسب با مشخصات مشابه (سن، جنسیت، تجربه) معرفی می‌گردد.',
        displayOrder: 1,
      },
      {
        id: 2,
        question: 'سوابق پرستار سالمند چگونه تأیید می‌شود؟',
        answer:
          'تمام پرستاران سالمندیار دارای مدرک معتبر رسمی از دانشگاه علوم پزشکی هستند. سوابق کاری آن‌ها با تماس با کارفرمایان قبلی تأیید می‌گردد، پس‌زمینه قضایی و حکمی آن‌ها استخراج می‌شود و همچنین دوره‌های ویژه مراقبت از آلزایمر و سالمند را با موفقیت گذرانده‌اند.',
        displayOrder: 2,
      },
      {
        id: 3,
        question: 'پرمستار سالمند در شیفت ۲۴ ساعته چه فعالیت‌هایی را انجام می‌دهد؟',
        answer:
          'پرستار در شیفت ۲۴ ساعته مسئول کمک به انجام تمام فعالیت‌های روزمره زندگی (ADL) شامل: کمک به استحمام و بهداشت شخصی، کمک به تغذیه و تهیه غذای مناسب، کمک به دفع و توالت، پیاده‌روی یا تمرینات توان‌بخشی، کنترل منظم دارو و علائم حیاتی، تحریک ذهنی با بازی‌ها و سرگرمی‌ها و نظارت شبانه بر ایمنی بیمار است.',
        displayOrder: 3,
      },
    ],
    seoSections: [
      {
        id: 1,
        heading: 'نقش پرستار سالمند در حفظ کیفیت زندگی',
        content:
          'پرستار سالمند صرفاً یک خدمت‌دهنده نیست؛ بلکه مانند عضوی از خانواده رفتار کرده و هدف اصلی اش حفظ کرامت، آسایش و شادی روزمره سالمند است. وظایف یک پرستار سالمند متنوع است: از کمک به وظایف شخصی مانند استحمام، لباس‌پوشی و تغذیه گرفته تا کمک به رفت‌وآمد، کنترل منظم داروها، ثبت فشار خون و قند خون، انجام تمرینات ساده فیزیوتراپی و تحریک ذهنی از طریق بازی‌های حافظه یا گفت‌وگو. در خانواده‌هایی که فرزندان به دلیل کار و زندگی در شهرهای دیگر نمی‌توانند هر روز کنار پدر و مادر خود باشند، استخدام پرستار سالمند در منزل باعث آرامش فکری طرفین شده و از افزایش چشمگیر ریسک سقوط، استرس و افسردگی در سالمند جلوگیری می‌کند. در نهایت، پرستار ماهر می‌تواند علائم هشداردهنده و زودرس بیماری‌ها را تشخیص دهد و به خانواده پیشنهاد مراجعه به پزشک پیش از پیشرفت بیماری بدهد.',
        displayOrder: 1,
      },
      {
        id: 2,
        heading: 'نکات مهم در انتخاب پرستار سالمند مناسب و معتبر',
        content:
          'انتخاب پرستار مناسب برای خانواده و سالمند، تصمیمی بسیار حساس است و باید با دقت کافی انجام شود تا از بروز مشکلات بعدی جلوگیری گردد. اول از همه، باید مدارک تحصیلی و کاری پرستار را بررسی کنید؛ پرستار سالمند باید حداقل دارای دیپلم پرستاری یا پیراپزشکی از دانشگاه علوم پزشکی و ترجیحاً مدرک مهارت ویژه مراقبت از سالمندان (Geriatric Care) و آلزایمر باشد. دوم، سوابق کاری و مراجع قبلی باید با تماس تلفنی یا حضوری تأیید گردد؛ از کارفرمایان قبلی بپرسید که آیا پرستار منظم، صبور و حرفه‌ای بوده و آیا مشکلی از نظر سرقت یا بدرفتاری وجود داشته است. سوم، رعایت هوش هیجانی (EQ) برای پرستار سالمند مهم‌تر از دانش فنی است؛ سالمندان به خصوص مبتلایان به زوال عقل، حساس‌تر و گاهی بداخلاق هستند و پرستار باید بتواند با آرامش و صبر بالای با آن‌ها رفتار کند و در موقعیت‌های سخت مثل نپذیرفتن غذا یا کمک به استحمام، حوصله خود را از دست ندهد. چهارم، جنسیت پرستار را با توجه به میل سالمند انتخاب کنید؛ بعضی از سالمندان مرد، با پرستار مرد راحت‌تر هستند و بالعکس. پنجم، قبل از شروع رسمی کار، یک دوره تستی ۳ یا ۷ روزه برای آشنایی سالمند با پرستار برنامه‌ریزی کنید تا از سازگاری طرفین اطمینان حاصل شود. در تیم سالمندیار، تمام این موارد به صورت استاندارد قبل از معرفی پرستار به خانواده بررسی می‌شود و خانواده می‌توانند قبل از شروع قرارداد، پرستار را از طریق مصاحبه تلفنی یا حضوری با حضور سالمند، مورد ارزیابی قرار دهند.',
        displayOrder: 2,
      },
      {
        id: 3,
        heading: 'مدیریت رفتارهای چالش‌برانگیز در سالمندان دچار زوال عقل',
        content:
          'یکی از چالش‌های اصلی همراهی سالمندان مبتلا به آلزایمر یا زوال عقل، مدیریت رفتارهای چالش‌برانگیز مانند پرخاشگری کلامی یا فیزیکی، اصرار برای بیرون رفتن در وسط شب (Gets)، گم‌کردن وسایل و اتهام دزدی، نپذیرفتن کمک برای تغذیه یا استحمام، و گریه و بی‌قرازی مداوم است. پرستار سالمند آموزش‌دیده، با استفاده از تکنیک‌های اعتبارسنجی (Validation Therapy) و تکنیک‌های حواس‌پرتی (Distraction) این رفتارها را مدیریت می‌کند و هرگز از بحث و مجادله با سالمند یا عصبانیت استفاده نمی‌کند. برای مثال در زمان استحمام که سالمند مقاومت می‌کند، به جای اجبار به استحمام فوری، پرستار ابتدا با صحبت در مورد موضوع دلخواه سالمند (مثل گذشته، بچه‌ها و...) محیط را آرام می‌کند، سپس به تدریج همراه با موسیقی ملایم و حفظ حرمت کامل، به کمک استحمام می‌پردازد. برای مدیریت رفتار Geth در شب، پرستار از قرار دادن تابلوهای یادآور در اطراف درب، افزایش نورپردازی شبانه در مسیر سرویس بهداشتی و ایجاد برنامه‌ی پیاده‌روی کوتاه بعد از ظهر برای کاهش بی‌قرازی شبانه استفاده می‌کند. همچنین پرستار آموزش دیده است که در صورت حمله پرخاشگری ناگهانی، خود را امن نگه دارد، بلافاصله فاصله گرفته و تلاش کند با شیطنت یا پیشنهاد خوراکی یا نوشیدنی دلخواه، حالت تهیج سالمند را پایین بیاورد و هرگز سرزنش یا قضاوت نکند. این تکنیک‌های تخصصی نه تنها استرس سالمند را به شدت کاهش می‌دهد، بلکه رضایت شغلی و سلامت روانی پرستار را نیز بالا نگه می‌دارد و تضمین می‌کند که همراهی برای هر دو طرف لذت‌بخش باشد.',
        displayOrder: 3,
      },
      {
        id: 4,
        heading: 'مراقبت از ایمنی خانه در برابر سقوط و حوادث سالمندان',
        content:
          'طبق آمار سازمان بهداشت جهانی، سالمندان بالای ۶۵ سال هر ساله حداقل یک بار در خانه سقوط می‌کنند و ۲۰ تا ۳۰ درصد از این سقوط‌ها منجر به آسیب‌های جدی مثل شکستگی لگن یا ضربه به سر می‌شود و هزینه درمان آن از هزینه‌های سالانه مراقبت سالمند بیشتر است. بنابراین یکی از مهم‌ترین وظایف پرستار سالمند در روزهای اول حضور در خانه، ارزیابی جامع ایمنی خانه و پیشنهاد اصلاحات کوچک اما حیاتی است. این اصلاحات شامل موارد زیر می‌شود: نصب دستگیره‌های حمام و توالت در ارتفاع مناسب در کنار وان و توالت؛ قرار دادن پوشش‌های ضد لغزش زیر فرش حمام و آشپزخانه؛ حذف سیم‌های برق و وسایل اضافی از راه‌روی‌های اصلی تخت تا سرویس بهداشتی؛ نصب نورهای شبانه فعال با سنسور حرکت در راهروها و بالش در؛ تنظیم ارتفاع تخت در سطح مناسب (زانو خم شده و پاها روی زمین هنگام نشستن از لبه تخت)؛ نصب نرده‌های پلاستیکی کنار تخت برای جلوگیری از افتادن هنگام خواب؛ قراردادن تلفن همراه یا گوشی بیزر در دسترس آسان روی میز کنار تخت؛ و بهینه‌سازی میزان نور روشنایی در آشپزخانه و سرویس بهداشتی. پرستار همچنین به سالمند آموزش می‌دهد که هنگام بلند شدن از تخت یا صندلی، ابتدا ۳۰ ثانیه بنشیند و سرگیجه را کنترل کند، سپس ۳۰ ثانیه بایستد و در نهایت حرکت کند (قاعده سه بار ۳۰ ثانیه) که به شدت ریسک سقوط ناشی از افت فشار خون ایستادگی (Orthostatic Hypotension) را کاهش می‌دهد. همچنین پرستار به صورت روزانه کفش‌های سالمند را از نظر لغزنده بودن کف بررسی می‌کند و از پوشیدن جوراب یا دمپایی بدون پوشش کف ضد لغزش جلوگیری می‌کند. در تیم سالمندیار، پرستار در اولین هفته حضور، گزارش کامل ارزیابی ایمنی خانه را تهیه و به خانواده ارائه می‌دهد و در صورت تمایل، کمک به خرید و نصب تجهیزات ایمنی از نمایندگان معتبر را نیز بر عهده می‌گیرد.',
        displayOrder: 4,
      },
    ],
    relatedServicesSlugs: ['home-nursing', 'injection-at-home', 'iv-infusion-at-home', 'physiotherapy-at-home', 'patient-companion'],
  },
  {
    id: 11,
    serviceDefinitionId: 6,
    serviceDefinition: {
      id: 6,
      code: 'ELDER',
      title: 'خدمات پرستاری در منزل',
      description: 'مجموعه کلی مراقبت‌ها و پرستاری در محیط خانگی',
      category: 'Nursing',
    },
    slug: 'home-nursing',
    longDescription:
      'مجموعه جامع خدمات پرستاری در منزل سالمندیار شامل: ارزیابی اولیه وضعیت بیمار توسط متخصص، برنامه‌ریزی شخصی‌سازی شده مراقبت روزانه، تزریق و سرم درمانی، پانسمان زخم و زخم بستر، نظارت دقیق بر مصرف دارو، آموزش جامع خانواده و پشتیبانی تلفنی ۲۴ ساعته.',
    heroImageUrl:
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=comprehensive%20home%20nursing%20care%20professional%20nurse%20elderly%20patient%20warm%20home%20medical%20checkup%20happy&image_size=landscape_16_9',
    ogImageUrl:
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=comprehensive%20home%20nursing%20care%20professional%20nurse%20elderly%20patient%20warm%20home%20medical%20checkup%20happy&image_size=landscape_16_9',
    metaTitle: 'خدمات پرستاری در منزل | مجموعه کامل سالمندیار | تهران کرج',
    metaDescription:
      'خدمات جامع پرستاری در منزل برای سالمندان و بیماران. ارزیابی بالینی اولیه، برنامه‌ریزی درمان، تزریق، پانسمان، آموزش خانواده و پشتیبانی ۲۴ ساعته.',
    primaryKeyword: 'خدمات پرستاری در منزل',
    secondaryKeywords: [
      'درخواست پرستار در منزل',
      'پرستار در منزل تهران',
      'سالمندیار در منزل',
      'پرستار بیمار در منزل',
      'مراقبت جامع از بیمار در منزل',
    ],
    primaryCtaText: 'مشاوره رایگان برنامه مراقبت',
    primaryCtaLink: '#guest-request-form',
    priceRangeText: 'قیمت‌گذاری بر اساس سرویس موردنیاز و بسته هفتگی/ماهانه؛ پیشنهاد شخصی‌سازی شده برای هر بیمار با در نظر گرفتن وضعیت اقتصادی خانواده.',
    showInHomePage: true,
    isFeatured: true,
    displayOrder: 11,
    benefits: [
      {
        id: 1,
        title: 'ارزیابی اولیه رایگان توسط مربی پرستاری',
        description: 'مراجعه رایگان مربی پرستاری ارشد برای بررسی کامل وضعیت بیمار و تهیه برنامه مراقبتی شخصی‌سازی.',
        iconName: 'ClipboardCheck',
        colorClass: 'bg-indigo-100 text-indigo-600',
        displayOrder: 1,
      },
      {
        id: 2,
        title: 'تیم چندتخصصی هماهنگ',
        description: 'دسترسی همزمان به پرستار بالینی، کارشناس تغذیه سالمندی، فیزیوتراپیست و مشاور روانشناس در یک بسته یکپارچه.',
        iconName: 'Users',
        colorClass: 'bg-rose-100 text-rose-600',
        displayOrder: 2,
      },
      {
        id: 3,
        title: 'پشتیبانی تلفنی ۲۴ ساعته ۷ روز هفته',
        description: 'دسترسی ۲۴ ساعته به مشاور پرستاری برای پاسخ به سوالات اضطراری خانواده، حتی در تعطیلات رسمی.',
        iconName: 'PhoneCall',
        colorClass: 'bg-emerald-100 text-emerald-600',
        displayOrder: 3,
      },
    ],
    targetPatients: [
      { id: 1, title: 'بیماران مزمن سالمند با نیاز چند خدمت همزمان', description: 'مراقبت یکپارچه شامل تزریق، پانسمان، فیزیوتراپی و نظارت دارویی', displayOrder: 1 },
      { id: 2, title: 'خانواده‌هایی که نیاز به برنامه‌ریزی جامع دارند', description: 'تهیه نقشه راه درمانی سه ماهه و شش ماهه با هدف بهبود کیفیت زندگی', displayOrder: 2 },
      { id: 3, title: 'بیماران ترخیص شده از بیمارستان و ICU', description: 'ادامه پروتکل درمانی دقیق در محیط خانه همراه با بازرسی منظم از روند بهبودی', displayOrder: 3 },
    ],
    coverageAreas: [
      { id: 1, areaName: 'تهران ۲۲ منطقه', has24HourService: true, displayOrder: 1 },
      { id: 2, areaName: 'کرج و البرز', has24HourService: true, displayOrder: 2 },
      { id: 3, areaName: 'اصفهان مرکز', has24HourService: false, displayOrder: 3 },
    ],
    testimonials: [
      {
        id: 1,
        clientFullName: 'آقای حسینی',
        clientRole: 'سرپرست خانواده',
        rating: 5,
        content:
          'پدرم بعد از بای پس عروق کرونر از بیمارستان ترخیص شد ولی به چند سرویس همزمان نیاز داشت: تزریق دارو، پانسمان زخم جراحی، فیزیوتراپی تنفسی و نظارت روزانه. سالمندیار یک تیم سه نفره برای ما برنامه‌ریزی کرد که کاملاً هماهنگ با هم مراجعه می‌کردند. کل روند نقاهت خیلی سریعتر از چیزی که پزشک پیش‌بینی کرده بود پیش رفت. واقعاً ممنونم از زحمات تیم.',
        highlight: 'مراقبت یکپارچه پس از بای پس عروق با تیم چند تخصصی',
        testimonialDate: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(),
        isApproved: true,
        isFeatured: true,
      },
    ],
    faqs: [
      {
        id: 1,
        question: 'خدمات پرستاری جامع در منزل شامل چه مواردی است؟',
        answer:
          'این بسته به صورت شخصی‌سازی شده برای هر بیمار تعریف می‌شود؛ به طور معمول شامل ارزیابی اولیه و برنامه‌ریزی، تزریق‌ها و سرم درمانی، پانسمان انواع زخم، کنترل منظم علائم حیاتی و دارو، آموزش خانواده، هماهنگی با پزشک معالج، مشاوره تغذیه و فیزیوتراپی خانگی در صورت نیاز است.',
        displayOrder: 1,
      },
      {
        id: 2,
        question: 'آیا هزینه‌ی خدمات پرستاری در منزل توسط بیمه پرداخت می‌شود؟',
        answer:
          'بخشی از خدمات تزریق و پانسمان طبق تعرفه‌های مصوب سازمان بیمه، قابل ارائه فاکتور رسمی برای جبران هزینه از طریق بیمه‌های درمانی (تامین اجتماعی، خدمات درمانی و بیمه‌های تکمیلی) می‌باشد. تیم مالی سالمندیار در صورت نیاز خانواده در تهیه مدارک لازم برای استرداد هزینه کمک می‌کند.',
        displayOrder: 2,
      },
    ],
    seoSections: [
      {
        id: 1,
        heading: 'خدمات پرستاری در منزل؛ کلید یک مراقبت یکپارچه و هماهنگ',
        content:
          'بسیاری از خانواده‌ها در یک مقطع، بیمار سالمند خود را با چند چالش همزمان روبرو می‌بینند: مثلاً هم نیاز به تزریق منظم انسولین و فشار خون دارند، هم به تعویض روزانه پانسمان زخم بستر و هم به یک همراهی روزانه برای کمک به فعالیت‌های روزمره و تمرینات توان‌بخشی. در این شرایط، درخواست تک‌تک خدمات جداگانه از چند مرکز مختلف، می‌تواند پیچیده، وقت‌گیر و مستعد خطا باشد؛ چون تیم‌های مختلف با هم هماهنگی ندارند، اطلاعات بیمار بین آن‌ها تقسیم می‌شود و خانواده باید خودش وظیفه هماهنگی بین تیم‌ها را بر عهده بگیرد که منجر به استرس فراوان می‌شود. خدمات پرستاری جامع در منزل، یک رویکرد یکپارچه و مدرن است که در آن ابتدا یک پرستار ارشد یا مربی پرستاری برای ارزیابی کامل و رایگان در منزل به شما مراجعه می‌کند، سپس بر اساس نیاز واقعی بیمار و خواسته خانواده، یک برنامه مراقبتی شخصی‌سازی شده شامل تمام خدمات لازم (تزریق، پانسمان، فیزیوتراپی خانگی، آموزش خانواده، مشاوره تغذیه و روانشناسی) تهیه می‌شود و در نهایت یک تیم منسجم با یک نفر مسئول هماهنگی (Case Manager) مسئول اجرای دقیق آن برنامه در طول ماه‌ها می‌باشد. این روش باعث حفظ تداوم مراقبت، کاهش خطاهای دارویی و پانسمانی، صرفه‌جویی قابل ملاحظه در هزینه کلی خانواده و در نهایت تسریع روند بهبودی بیمار می‌گردد.',
        displayOrder: 1,
      },
      {
        id: 2,
        heading: '۵ گام اصلی طراحی برنامه پرستاری جامع در منزل',
        content:
          'طراحی برنامه پرستاری جامع در سالمندیار بر اساس مدل ۵ گام استاندارد بین‌المللی NANDA انجام می‌شود تا از جامعیت و علمی بودن برنامه اطمینان حاصل گردد. گام اول: ارزیابی جامع (Assessment). در این مرحله مربی پرستاری ارشد با مراجعه حضوری به منزل، مصاحبه با بیمار و اعضای خانواده، بررسی پرونده پزشکی بیمار (شرایط قبلی، داروها، سابقه بستری)، معاینه بالینی اولیه (فشار خون، نبض، دما، اشباع اکسیژن، وزن و قد)، و بازرسی محیط خانه از نظر ایمنی، اطلاعات لازم را جمع‌آوری کرده و یک چارت ۳۰ صفحه‌ای در سیستم سگمنت سالمندیار برای بیمار باز می‌کند. گام دوم: تشخیص پرستاری (Nursing Diagnosis). بر اساس داده‌های جمع‌آوری شده، پرستار ارشد ۳ تا ۵ تشخیص اولویت‌بندی شده پرستاری تعریف می‌کند؛ برای مثال «ریسک سقوط مرتبط با اختلال تعادل» یا «سوء تغذیه کمتر از نیاز بدن مرتبط با کاهش اشتها» یا «عدم رعایت رژیم دارویی مرتبط با فراموشی». گام سوم: تعیین اهداف قابل اندازه‌گیری (Planning). برای هر تشخیص، اهداف کوتاه مدت (۱ تا ۲ هفته) و بلند مدت (۱ تا ۳ ماه) به صورت عددی و قابل اندازه‌گیری تعریف می‌شود؛ برای مثال هدف «کاهش حداقل ۵۰ درصد تعداد دفعات فراموشی مصرف دارو تا پایان هفته دوم» یا «افزایش وزن ۲ کیلویی تا پایان ماه اول با رعایت رژیم پرکالری». گام چهارم: اجرای دقیق برنامه (Implementation). در این مرحله تیم پرستاری شامل پرستار ثابت بیمار، تکنسین تزریق، متخصص پانسمان و فیزیوتراپیست به صورت منظم طبق برنامه تعیین شده مراجعه می‌کنند و تمام اقدامات بالینی و آموزشی را دقیقاً طبق پروتکل اجرا می‌کنند. گام پنجم: ارزیابی مجدد و اصلاح برنامه (Evaluation). هر هفته یک بار، مسئول پرونده (Case Manager) پیشرفت بیمار را نسبت به اهداف تعریف شده ارزیابی می‌کند؛ اگر اهداف محقق شده‌اند به اهداف بعدی حرکت می‌کنیم و اگر محقق نشده‌اند، علت را بررسی کرده و برنامه را بر اساس نیاز جدید بیمار اصلاح می‌کنیم. این چرخه ۵ گامی به صورت مداوم در طول کل دوره مراقبت تکرار می‌شود و تضمین می‌کند که مراقبت همیشه متناسب با نیاز واقعی لحظه‌ای بیمار باشد.',
        displayOrder: 2,
      },
      {
        id: 3,
        heading: 'اهمیت آموزش خانواده در موفقیت پرستاری در منزل',
        content:
          'طبق گزارش سازمان جهانی بهداشت، موفقیت درمان و مراقبت در منزل تا ۷۰ درصد به میزان دانش و توانایی خانواده در انجام مراقبت‌های روزانه بستگی دارد و تنها ۳۰ درصد به اقدامات تخصصی تیم پرستاری. به همین دلیل، آموزش جامع و عملی خانواده یکی از اصلی‌ترین ارکان خدمات پرستاری جامع سالمندیار محسوب می‌شود و در هر بسته خدمات لحاظ گردیده است. آموزش خانواده در سالمندیار به چهار صورت انجام می‌شود: اول، آموزش‌های حضوری در جلسات اولیه و حین اقدامات بالینی؛ برای مثال پرستار هنگام تعویض پانسمان، به عضو خانواده انتخابی مراحل صحیح را به صورت عملی آموزش می‌دهد و از او نیز می‌خواهد که یک بار زیر نظر خودش تمرین کند تا از یادگیری عملی مطمئن شویم. دوم، ارائه جزوات آموزشی تصویری فارسی ساده و روان برای هر موضوع (راهنمای کمک به استحمام سالمند، راهنمای مدیریت دارو، راهنمای کمک به خوردن سالمند مبتلا به سکته مغزی و...) که می‌توانند به صورت فیزیکی یا دیجیتال (فایل PDF یا ویدیو کوتاه) در اختیار خانواده قرار بگیرند. سوم، برگزاری جلسات آنلاین آموزشی یک‌ساعته برای کل خانواده هر دو هفته یک بار؛ در این جلسات که توسط مربی پرستاری ارشد برگزار می‌شود، دغدغه‌ها و سوالات جدید خانواده مورد بحث و پاسخ قرار می‌گیرد و تکنیک‌های جدید آموزشی داده می‌شود. چهارم، پیگیری‌های تلفنی منظم توسط کارشناس خانواده؛ یک بار در هفته، مسئول خانواده با اعضای خانواده تماس می‌گیرد و از میزان پیشرفت، مشکلات جدید و رضایت از خدمات مطلع می‌شود و در صورت نیاز جلسه آموزشی تکمیلی برنامه‌ریزی می‌کند. موضوعات اصلی آموزش در خانواده عبارتند از: تکنیک صحیح بلند کردن و جابجایی بیمار بدون آسیب به کمر پرستار و ستون فقرات بیمار، مدیریت صحیح رژیم دارویی و استفاده از جعبه دارو (Pill Box) برای جلوگیری از فراموشی یا مصرف بیش از حد، کمک به تغذیه بیماران دچار مشکل بلع (Dysphagia) با استفاده از تکنیک چین سر و تکه‌های کوچک غذا، شناسایی سریع علائم اورژانسی (مانند درد قفسه سینه، سکته مغزی، کما هیپوگلیسمی) و اقدامات اولیه قبل از رسیدن تیم امداد، و در نهایت مراقبت‌های روانی و ایجاد فضای آرام و سرزنده برای سالمند در خانه. برخورداری از خانواده آموزش‌دیده، نه تنها روند بهبودی بیمار را سرعت می‌بخشد، بلکه از بروز بسیاری از عوارض قابل پیشگیری که منجر به بستری مجدد در بیمارستان می‌شوند، جلوگیری می‌کند.',
        displayOrder: 3,
      },
      {
        id: 4,
        heading: 'مدیریت دارویی در منزل و جلوگیری از خطاهای دارویی در سالمندان',
        content:
          'یکی از خطرناک‌ترین چالش‌های مراقبت از بیماران سالمند در خانه، خطاهای دارویی است. طبق آمار آمریکا، حدود ۱.۳ میلیون نفر در سال به دلیل خطای دارویی به اورژانس بیمارستان مراجعه می‌کنند و حدود ۲۰ تا ۳۰ درصد از بستری‌های سالمندان ناشی از مصرف اشتباه دارو است که خوشبختانه تا ۸۰ درصد این موارد قابل پیشگیری هستند. در خدمات پرستاری جامع سالمندیار، مدیریت دارویی به صورت چندلایه انجام می‌شود تا خطا تقریباً صفر گردد. لایه اول: مرتب‌سازی داروها در جعبه دارو (Pill Organizer) چند روزه توسط پرستار. پرستار در هر جلسه، تمام داروهای روزانه و فواصل مصرف را بررسی کرده و در جعبه دارو بر اساس روز و ساعت مرتب می‌کند؛ برای سالمندان مبتلا به زوال عقل از جعبه‌های دارویی دارای قفل و آلارم استفاده می‌شود که فقط در زمان تعیین شده باز می‌شود. لایه دوم: کنترل مکرر توسط پرستار در جلسات مراجعه. پرستار در هر مراجعه، جعبه دارو را از نظر خالی یا ناخالی بودن سلول‌ها بررسی می‌کند تا از فراموشی یا مصرف دو برابری جلوگیری شود. لایه سوم: استفاده از اپلیکیشن هوشمند یادآوری دارو برای خانواده و بیمار. خانواده می‌توانند از طریق اپلیکیشن اختصاصی سالمندیار، لیست کامل داروها را مشاهده کنند، آلارم‌های مصرف دارو را فعال کنند و هر بار که دارو مصرف شد را در سیستم ثبت کنند. لایه چهارم: کنترل تداخلات دارویی. تیم داروساز سالمندیار به صورت دوره‌ای (هر ماه) لیست کامل داروهای بیمار را از نظر تداخل دارویی خطرناک با هرکدام از داروهای جدیدی که توسط پزشک تجویز شده بررسی می‌کند و در صورت وجود تداخل، با پزشک معالج هماهنگ می‌نماید. لایه پنجم: تهیه گزارش دوره‌ای برای پزشک. هر دو هفته یک بار، چارت مصرف دارو همراه با عوارض احتمالی گزارش شده (مانند خشکی دهان، خواب‌آلودگی زیاد، سرگیجه) برای پزشک معالج ارسال می‌شود تا در صورت نیاز در نسخه دارویی تغییراتی اعمال گردد. همچنین پرستار به خانواده آموزش می‌دهد که در صورت مشاهده هر گونه تغییر رفتار یا علامت ناخوشایند پس از شروع داروی جدید، فوراً با تیم هماهنگ کنند و هرگز خودسرانه دارو را قطع یا دوز آن را تغییر ندهند. این مدیریت چند لایه، تضمین می‌کند که سالمند داروهای خود را در زمان، دوز و فرم صحیح مصرف کند و خانواده از این بابت کاملاً آسوده خاطر باشند.',
        displayOrder: 4,
      },
    ],
    relatedServicesSlugs: ['elderly-care-at-home', 'injection-at-home', 'wound-dressing-at-home', 'bedsores-dressing-at-home', 'iv-infusion-at-home', 'physiotherapy-at-home'],
  },
  {
    id: 12,
    serviceDefinitionId: 8,
    serviceDefinition: {
      id: 8,
      code: 'PHYSIO',
      title: 'فیزیوتراپی در منزل',
      description: 'تمرینات توانبخشی و فیزیوتراپی تخصصی در محیط خانه',
      category: 'Rehabilitation',
    },
    slug: 'physiotherapy-at-home',
    longDescription:
      'خدمات فیزیوتراپی و توانبخشی در منزل توسط کارشناسان مجرب حوزه فیزیوتراپی شامل: ارزیابی عملکرد، طراحی برنامه تمرینات اختصاصی، ماساژ درمانی، الکتروتراپی، لیزر درمانی و بازتوانی حرکتی پس از سکته، جراحی و شکستگی.',
    heroImageUrl:
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=physiotherapist%20working%20elderly%20patient%20home%20rehabilitation%20exercise%20professional%20warm%20medical%20care&image_size=landscape_16_9',
    ogImageUrl:
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=physiotherapist%20working%20elderly%20patient%20home%20rehabilitation%20exercise%20professional%20warm%20medical%20care&image_size=landscape_16_9',
    metaTitle: 'فیزیوتراپی در منزل | توانبخشی و بازآموزی حرکتی | سالمندیار',
    metaDescription:
      'فیزیوتراپی در منزل برای سالمندان و بیماران پس از سکته، جراحی، شکستگی و آرتروز. برنامه تمرینات اختصاصی، ماساژ درمانی و تجهیزات توانبخشی.',
    primaryKeyword: 'فیزیوتراپی در منزل',
    secondaryKeywords: ['توانبخشی در منزل', 'فیزیوتراپیست در منزل', 'ماساژ درمانی در منزل', 'کاینزیوتراپی منزل', 'بازآموزی پس از سکته'],
    primaryCtaText: 'درخواست جلسه فیزیوتراپی',
    primaryCtaLink: '#guest-request-form',
    priceRangeText: 'قیمت‌گذاری بر اساس نوع درمان، مدت جلسه، تعداد جلسات هفتگی و منطقه جغرافیایی',
    showInHomePage: true,
    isFeatured: true,
    displayOrder: 12,
    benefits: [
      {
        id: 1,
        title: 'طراحی برنامه تمرینات اختصاصی',
        description: 'برنامه درمانی بر اساس نوع بیماری، سابقه و هدف بازگشت به فعالیت.',
        iconName: 'Activity',
        colorClass: 'bg-green-100 text-green-600',
        displayOrder: 1,
      },
      {
        id: 2,
        title: 'تجهیزات حرفه‌ای همراه',
        description: 'دستگاه‌های الکتروتراپی، لیزر، اولتراسوند و مکعب‌های درمانی در هر جلسه.',
        iconName: 'HeartPulse',
        colorClass: 'bg-teal-100 text-teal-600',
        displayOrder: 2,
      },
      {
        id: 3,
        title: 'آموزش خانواده برای ادامه',
        description: 'آموزش عملی تمرینات نگهدارنده برای خانواده تا بین جلسات نیز ادامه پیدا کند.',
        iconName: 'GraduationCap',
        colorClass: 'bg-blue-100 text-blue-600',
        displayOrder: 3,
      },
      {
        id: 4,
        title: 'گزارش تصویری پیشرفت',
        description: 'ثبت میزان بهبود و حرکات در هر جلسه و اطلاع‌رسانی به پزشک معالج.',
        iconName: 'LineChart',
        colorClass: 'bg-amber-100 text-amber-600',
        displayOrder: 4,
      },
    ],
    targetPatients: [
      { id: 1, title: 'بیماران پس از سکته مغزی', description: 'بازآموزی راه رفتن و حرکات دست و بازو', displayOrder: 1 },
      { id: 2, title: 'پس از عمل ارتوپدی و شکستگی', description: 'بازتوانی کامل مفاصل پس از ترکیدن گچ', displayOrder: 2 },
      { id: 3, title: 'سالمندان مبتلا به آرتروز زانو', description: 'تمرینات تقویتی و کاهش درد مفاصل', displayOrder: 3 },
      { id: 4, title: 'بیماران پارکینسون یا ام اس', description: 'حفظ و بهبود دامنه حرکتی و تعادل', displayOrder: 4 },
    ],
    coverageAreas: [
      { id: 1, areaName: 'تمامی مناطق تهران', has24HourService: false, displayOrder: 1 },
      { id: 2, areaName: 'کرج و البرز', has24HourService: false, displayOrder: 2 },
      { id: 3, areaName: 'اصفهان مرکز', has24HourService: false, displayOrder: 3 },
    ],
    testimonials: [
      {
        id: 1,
        clientFullName: 'خانم نادری',
        clientRole: 'فرزند بیمار',
        rating: 5,
        content:
          'پدرم ۷۵ ساله بعد از عمل تعویض مفصل زانو دچار مشکل راه رفتن شده بود. جلسات منظم فیزیوتراپی سالمندیار در عرض ۲ ماه دوباره به راه رفتن عادی و حتی پیاده‌روی روزانه کمک کرد. فیزیوتراپیست واقعاً صبور و مطلع بود.',
        highlight: 'بازگشت کامل به فعالیت روزانه',
        testimonialDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        isApproved: true,
        isFeatured: true,
      },
    ],
    faqs: [
      {
        id: 1,
        question: 'چند جلسه فیزیوتراپی معمولاً لازم است؟',
        answer:
          'بسته به نوع بیماری و میزان آسیب؛ به طور میانگین ۱۰ تا ۲۰ جلسه هفتگی یا روزمره توصیه می‌شود. در اولین جلسه، فیزیوتراپیست پیش‌بینی دقیق تعداد جلسات را ارائه می‌دهد.',
        displayOrder: 1,
      },
      {
        id: 2,
        question: 'آیا بین جلسات باید تمرینات را ادامه دهیم؟',
        answer:
          'بله، فیزیوتراپیست در پایان هر جلسه تمرینات خانه با تعداد دفعات و تصویر را به خانواده آموزش می‌دهد. اجرای منظم این تمرینات بین جلسات، سرعت بهبود را دو تا سه برابر می‌کند.',
        displayOrder: 2,
      },
    ],
    seoSections: [
      {
        id: 1,
        heading: 'فیزیوتراپی در منزل چیست و چه زمانی لازم می‌شود؟',
        content:
          'فیزیوتراپی در منزل یکی از شاخه‌های تخصصی توانبخشی است که در آن کارشناس فیزیوتراپیست با همراهی کیت کامل تجهیزات، به منزل یا محل سکونت بیمار مراجعه کرده و مراحل ارزیابی، درمان و آموزش را در آسایش محیط خانه انجام می‌دهد. این شیوه ارائه خدمات برای سالمندان، بیماران تخت بخواب یا افرادی که پس از سکته مغزی، جراحی قلب، شکستگی استخوان، تعویض مفصل زانو و ران یا ابتلا به بیماری‌های عصبی مثل پارکینسون و ام اس نمی‌توانند به کلینیک فیزیوتراپی مراجعه نمایند، طراحی شده است. بر اساس آمار سازمان بهداشت جهانی، حدود ۶۵ درصد از بیماران سالمند پس از ترخیص از بیمارستان، به دلیل عدم دسترسی به حمل و نقل مناسب یا ترس از سقوط در مسیر، جلسات فیزیوتراپی را نادیده می‌گیرند که این مسئله منجر به کاهش دامنه حرکتی دائمی، افزایش درد مفاصل و افت کیفیت زندگی می‌شود. خدمات فیزیوتراپی در منزل سالمندیار با هدف رفع این موانع، امکان بازتوانی کامل و پیوسته را در محیطی امن و آشنا برای بیمار فراهم می‌آورد.',
        displayOrder: 1,
      },
      {
        id: 2,
        heading: 'انواع خدمات قابل ارائه در چارچوب فیزیوتراپی در منزل',
        content:
          'طیف خدمات فیزیوتراپی در منزل بسیار وسیع و بر اساس نیاز بالینی بیمار برنامه‌ریزی می‌گردد. اولین و پرکاربردترین نوع، کاینزیوتراپی یا تمرینات درمانی فعال است که شامل تمرینات تقویتی عضلات، کشش‌های هماهنگ، تمرینات تعادلی و بازآموزی راه رفتن با کمک واکر یا عصا می‌باشد. دوم، الکتروتراپی که با استفاده از دستگاه‌های TENS، NMES و اولتراسوند درمانی به کاهش درد مزمن مفاصل، بهبود گردش خون در بافت‌ها و جلوگیری از تحلیل عضلات بعد از بی‌حرکتی طولانی کمک می‌کند. سوم، ماساژ درمانی عمیق (Swedish & Deep Tissue) که برای رفع گرفتگی عضلات پس از سکته، کاهش اسپاسم در بیماران نخاعی و آرامش عضلات قفسه سینه در بیماران تنفسی به کار می‌رود. چهارم، لیزر درمانی کم‌توان (LLLT) که در درمان التهاب‌های تاندون (Tendinitis)، آرتروز زانو و زگیل مفصل شانه بسیار کارا است. پنجم، کاردرمانی و بازآموزی فعالیت‌های زندگی روزمره (ADL) که به بیمار یاد می‌دهد چگونه با کمک وسیله کمکی، لباس بپوشد، غذا بخورد و به توالت برود. در نهایت، تهیه و آموزش استفاده از وسایل کمکی مانند واکر، عصای سه‌پایه، بریس مچ پا و بالشتک‌های ارتودنسی نیز توسط تیم فیزیوتراپی سالمندیار در قالب همین خدمات ارائه می‌گردد.',
        displayOrder: 2,
      },
      {
        id: 3,
        heading: 'مزایای انجام فیزیوتراپی در خانه نسبت به کلینیک',
        content:
          'انجام جلسات فیزیوتراپی در منزل دارای مزایای علمی اثبات‌شده‌ای است که بر روند بهبودی بیمار تاثیر مستقیم می‌گذارد. مهم‌ترین مزیت، انتقال حداقلی انرژی بیمار برای رفت‌وآمد است؛ برای سالمند ۷۰ ساله‌ای که بعد از سکته مغزی راه رفتن با آن سختی همراه است، رفتن یک بار در هفته به کلینیک می‌تواند تمام ذخیره انرژی روزانه‌اش را جلب کرده و منجر به خستگی بیش از حد و کاهش کیفیت تمرینات در همان جلسه شود. دوم، رعایت روال عادی روزانه بیمار در محیط آشنا باعث کاهش سطح استرس و اضطراب شده و تحمل تمرینات سخت را بهبود می‌بخشد. سوم، امکان مشاهده و آموزش عملی توسط خانواده در جریان جلسه است؛ یعنی فرزند یا همسر بیمار علاوه بر حضور در جلسه، تکنیک صحیح انجام تمرینات نگهدارنده را به صورت عملی می‌آموزد و در فواصل بین جلسات (مثلاً یک روز در میان) به بیمار کمک می‌کند که این مسئله سرعت بهبود را حدود ۴۰ درصد افزایش می‌دهد. چهارم، امکان ارزیابی دقیق محیط خانه از نظر ایمنی است؛ فیزیوتراپیست می‌تواند ارتفاع تخت، وجود سرسره‌های لغزنده، جایگاه دستگیره‌ها و مبل راحتی را بررسی کند و پیشنهاد اصلاحات ساختاری کوچکی دهد که احتمال سقوط بیمار را تا ۶۰ درصد کاهش می‌دهد. پنجم، انعطاف در زمان‌بندی جلسات بر اساس ساعت استراحت، وعده دارو و میل بیمار است که در کلینیک‌های پرتردد امکان‌پذیر نیست.',
        displayOrder: 3,
      },
      {
        id: 4,
        heading: 'فرآیند ارائه خدمات فیزیوتراپی در سالمندیار',
        content:
          'پس از تماس اولیه یا ثبت درخواست الکترونیکی، تیم پذیرش سالمندیار ابتدا مشخصات کلی بیمار (سن، تشخیص پزشکی، سابقه بیماری‌های زمینه‌ای، نوع نیاز درمانی و آدرس دقیق) را دریافت می‌کند. سپس در زمان هماهنگ‌شده، یک فیزیوتراپیست متخصص با مدارک معتبر دانشگاهی و سابقه کاری حداقل ۵ سال به منزل مراجعه کرده و جلسه ارزیابی اولیه (Initial Assessment) را به مدت ۶۰ الی ۹۰ دقیقه انجام می‌دهد. در این جلسه، دامنه حرکتی مفاصل، قدرت عضلانی، میزان درد (با استفاده از مقیاس VAS)، میزان تعادل و وضعیت راه رفتن ثبت شده و یک هدف کوتاه‌مدت و بلندمدت درمانی تعیین می‌گردد. بر اساس این ارزیابی، یک بسته درمانی ۶ تا ۱۲ جلسه‌ای با فراوانی ۲ یا ۳ بار در هفته طراحی و به خانواده ارائه می‌شود. در هر جلسه درمانی (حدود ۴۵ دقیقه)، ابتدا ماساژ گرم‌کننده و الکتروتراپی انجام شده و سپس تمرینات فعال با نظارت دقیق فیزیوتراپیست اجرا می‌گردد. در پایان هر جلسه، چند تمرین ساده ۱۰ تا ۱۵ دقیقه‌ای برای تکرار در منزل به همراه فیلم یا تصویر آموزشی در اختیار خانواده قرار می‌گیرد و پیشرفت بیمار در هر جلسه با معیارهای کمی (مثل تعداد تکرار حرکت، مدت زمان ایستادن بدون تکیه‌گاه و...) اندازه‌گیری و ثبت می‌شود. پس از اتمام بسته درمانی، یک جلسه پیگیری ۲ هفته‌ای برای حفظ بهره‌وری و ارزیابی پایداری نتایج، به صورت رایگان انجام می‌گیرد.',
        displayOrder: 4,
      },
    ],
    relatedServicesSlugs: ['home-nursing', 'elderly-care-at-home', '24h-patient-monitoring', 'patient-companion'],
  },
  {
    id: 13,
    serviceDefinitionId: 9,
    serviceDefinition: {
      id: 9,
      code: 'COMPANION',
      title: 'همراهی بیمار در منزل',
      description: 'همراهی ساعتی، روزانه و شبانه بیماران و سالمندان',
      category: 'PersonalCare',
    },
    slug: 'patient-companion',
    longDescription:
      'خدمات همراهی بیمار در منزل برای پوشش نیازهای روزانه بیمار در دوره نقاهت پس از جراحی یا در مراحل پیشرفته بیماری‌های مزمن؛ شامل همراهی در سفر به پزشک، کمک به غذا خوردن، نظارت بر دارو، همراهی پیاده‌روی و رفع نیازهای دفعی با حفظ کرامت بیمار.',
    heroImageUrl:
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=caregiver%20companion%20nurse%20supporting%20elderly%20man%20home%20warm%20loving%20home%20environment%20professional%20healthcare&image_size=landscape_16_9',
    ogImageUrl:
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=caregiver%20companion%20nurse%20supporting%20elderly%20man%20home%20warm%20loving%20home%20environment%20professional%20healthcare&image_size=landscape_16_9',
    metaTitle: 'همراهی بیمار در منزل | پرستار همراه نقاهت و جراحی | سالمندیار',
    metaDescription:
      'خدمات همراهی بیمار در منزل و در سفر به مطب؛ کمک روزانه، نظارت دقیق بر دارو، همراهی پیاده‌روی و حفظ آسایش بیمار در دوران نقاهت پس از عمل.',
    primaryKeyword: 'همراهی بیمار در منزل',
    secondaryKeywords: ['پرستار همراه بیمار', 'مراقبت نقاهت در منزل', 'همراهی سالمند در سفر به پزشک', 'پرستار مراقبت روزانه'],
    primaryCtaText: 'درخواست همراهی بیمار',
    primaryCtaLink: '#guest-request-form',
    priceRangeText: 'قیمت‌گذاری بر اساس مدت شیفت (ساعتی، روزانه، شبانه، ۲۴ ساعته) و تجربه پرستار همراه',
    showInHomePage: true,
    isFeatured: true,
    displayOrder: 13,
    benefits: [
      {
        id: 1,
        title: 'همراهی دلسوز و حرفه‌ای',
        description: 'پرستاران همراه با مهارت‌های ارتباطی بالا و تجربه کار با سالمندان و بیماران مزمن.',
        iconName: 'HeartHandshake',
        colorClass: 'bg-purple-100 text-purple-600',
        displayOrder: 1,
      },
      {
        id: 2,
        title: 'انعطاف در زمان و مدت شیفت',
        description: 'شیفت‌های ساعتی ۴ ساعته، نیمه‌روز، روزانه، شبانه و ۲۴ ساعته بسته به نیاز خانواده.',
        iconName: 'Clock',
        colorClass: 'bg-teal-100 text-teal-600',
        displayOrder: 2,
      },
      {
        id: 3,
        title: 'هیجان و حرکت برای بیمار',
        description: 'گفتگو، بازی‌های ذهنی ساده، پخش موزیک دلخواه و فعال نگه داشتن بیمار از نظر ذهنی.',
        iconName: 'Smile',
        colorClass: 'bg-amber-100 text-amber-600',
        displayOrder: 3,
      },
    ],
    targetPatients: [
      { id: 1, title: 'بیماران پس از ترخیص از بیمارستان', description: 'مراقبت شبانه‌روزی در اولین هفته نقاهت', displayOrder: 1 },
      { id: 2, title: 'سالمندان تنها ساکن خانه', description: 'همراهی ساعتی روزانه برای جلوگیری از تنهایی', displayOrder: 2 },
      { id: 3, title: 'مراحل اولیه زوال عقل و آلزایمر', description: 'نظارت دقیق و پیشگیری از گم‌شدگی یا تصادفات', displayOrder: 3 },
    ],
    coverageAreas: [
      { id: 1, areaName: 'تهران کل', has24HourService: true, displayOrder: 1 },
      { id: 2, areaName: 'کرج و البرز', has24HourService: true, displayOrder: 2 },
    ],
    faqs: [
      {
        id: 1,
        question: 'آیا همراه بیمار می‌تواند با بیمار به سفر یا مطب برود؟',
        answer:
          'بله، همراهی در سفر بین‌شهری، مراجعه به مطب، انجام آزمایش و حتی سفر کوتاه تفریحی جزو وظایف پرستار همراه است و بر اساس تعداد ساعت یا روز اضافی، قیمت‌گذاری می‌گردد.',
        displayOrder: 1,
      },
    ],
    seoSections: [
      {
        id: 1,
        heading: 'اهمیت همراهی حرفه‌ای بیمار در دوره نقاهت',
        content:
          'بسیاری از خانواده‌ها تصور می‌کنند که پس از ترخیص از بیمارستان، مهم‌ترین نیاز بیمار فقط صرفاً اجرای دستورات پزشکی است؛ در حالی که تحقیقات نشان می‌دهد مهم‌ترین عامل در سرعت بخشیدن به بهبودی، حضور یک همراه دلسوز، هوشیار و آموزش‌دیده در کنار بیمار در طول ۲۴ ساعت است. دوره نقاهت پس از جراحی قلب، مغز و اعصاب، ارتوپدی یا حتی یک عفونت شدید ریوی، مملو از نوسانات جسمی و روانی است که بیمار سالمند به تنهایی قابق مدیریت آن‌ها نیست. یک همراه بیمار حرفه‌ای علاوه بر کمک به وظایف جسمی، می‌تواند با گفتگوهای هدفمند، مشارکت دادن بیمار در تصمیمات ساده روزانه و ایجاد هیجان‌های مثبت، روند روحی وی را بهبود بخشد و از افسردگی پس از بیماری جلوگیری کند. در سالمندیار، تمامی پرستاران همراه دوره‌های آموزشی روانشناسی ارتباطی با سالمند، مدیریت استرس بیمار پس از جراحی و کمک به فعالیت‌های روزمره با حفظ حداکثر استقلال و کرامت بیمار را گذرانده‌اند.',
        displayOrder: 1,
      },
      {
        id: 2,
        heading: 'وظایف اصلی یک پرستار همراه در خانه و بیرون',
        content:
          'پرستار همراه، کارشناسی ارشد یا کاردانی پرستاری ندارد؛ بلکه یک متخصص مراقبت شخصی با سابقه بالا است که وظایف او بیشتر در حوزه فعالیت‌های زندگی روزانه، نظارت و حمایت عاطفی می‌باشد. اولین وظیفه، کمک به وظایف شخصی مثل استحمام در حمام یا تخت، تعویض لباس، کمک به مسواک‌زدن و اصلاح صورت و کمک به رفتن به سرویس بهداشتی یا استفاده از پاتوی تخت است. دوم، کمک به تغذیه؛ آماده کردن وعده‌های غذایی سبک طبق رژیم پزشک، کمک به خوردن غذا برای بیمارانی که قدرت دست independant ندارند و یادآوری نوشتن منظم مایعات روزانه. سوم، نظارت دقیق بر مصرف دارو؛ اگرچه تجویز و تنظیم دارو وظیفه پرستار تحصیل‌کرده است، اما همراه بیمار مطابق برنامه‌ریزی شده توسط پزشک، از فراموشی مصرف دارو جلوگیری می‌کند و در صورت عدم مصرف به موقع، خانواده را مطلع می‌سازد. چهارم، همراهی در بیرون از خانه؛ پیاده‌روی کوتاه در پارک نزدیک، مراجعه به مطب، انجام انجام آزمایش خون یا عکس‌برداری، خرید ضروریات روزانه و حتی مراجعه به دورهمی خانوادگی. پنجم، انجام فعالیت‌های تفریحی و ذهنی؛ خواندن کتاب مجله دلخواه، پخش موزیک سنتی یا کلاسیک، بازی بازی‌های فکری ساده مثل پازل و شطرنج، تماشای فیلم یا سریال موردعلاقه و گفتگو درباره خاطرات گذشته با هدف فعال نگه داشتن ذهن بیمار. ششم و مهم‌تر از همه، شناسایی و گزارش به موقع تغییرات غیرمعمول در وضعیت جسمانی بیمار مثل تپش قلب، سرگیجه، تنگی نفس یا درد ناگهانی به خانواده و تیم پزشکی.',
        displayOrder: 2,
      },
      {
        id: 3,
        heading: 'تفاوت همراه بیمار با پرستار مجرب در خانه',
        content:
          'یکی از سوالات متداول خانواده هنگام درخواست خدمات، تفاوت «همراهی بیمار» با «پرستار در منزل» است. به زبان ساده، پرستار در منزل وظایف پزشکی و تخصصی مثل تزریق، پانسمان، ساکشن، نصب کانولا، پایش دقیق علائم حیاتی و انجام ECG را انجام می‌دهد و حتماً باید مدرک دانشگاهی پرستاری و کارت فعالیت معتبر از سازمان نظام پرستاری داشته باشد. اما همراه بیمار، بر انجام وظایف غیرپزشکی و حمایتی تمرکز دارد و در کنار بیمار جهت تسریع بهبودی، جلوگیری از تنهایی و کاهش استرس خانواده حضور می‌یابد. در عمل، خیلی از خانواده‌ها بسته درمانی «پرستار همراه + پرستار تحصیل‌کرده» را به صورت ترکیبی انتخاب می‌کنند؛ یعنی همراه بیمار در طول ۲۴ ساعت در کنار بیمار حضور دارد و یک بار در روز یا چند بار در هفته پرستار تخصصی برای انجام تزریق، پانسمان و ارزیابی بالینی به منزل مراجعه می‌کند. این ترکیب، تعادل مناسبی بین کیفیت مراقبت، ایمنی و هزینه برای خانواده ایجاد می‌کند و خیال خانواده را از هر دو جنبه پزشکی و حمایتی راحت می‌سازد.',
        displayOrder: 3,
      },
      {
        id: 4,
        heading: 'چگونه یک همراه بیمار مناسب را انتخاب کنیم؟',
        content:
          'انتخاب همراه بیمار مناسب، یکی از حساس‌ترین تصمیم‌های خانواده در دوران بیماری است و نباید صرفاً بر اساس هزینه انجام شود. مهم‌ترین معیار، سابقه کاری مرتبط و حداقل ۲ سال تجربه مستند در کار با بیماران سالمند یا نقاهت از عمل است؛ پرستار همراه بدون تجربه کافی در مواجهه با رفتارهای پرخاشگرانه بیماران آلزایمر یا سکته، نمی‌تواند پاسخگوی نیاز باشد. دوم، وجود معرف یا رفرنس معتبر از خانواده‌های قبلی که سابقه همکاری با آن فرد را داشته‌اند؛ در سالمندیار، قبل از معرفی هر همراه بیمار، سوابق کاری قبلی با تماس تلفنی با کارفرمایان قبلی ارزیابی و تایید می‌گردد. سوم، مهارت‌های ارتباطی و رفتاری؛ همراه بیمار باید لبخند روی لب داشته باشد، حوصله بالایی برای تکرار سوالات ساده سالمند داشته باشد و در مواجهه با خشم یا ناامیدی بیمار، کنترل خوی را از دست ندهد. چهارم، سازگاری فرهنگی و اجتماعی؛ مثلاً اگر بیمار زبان محلی خاصی صحبت می‌کند یا از یک فرهنگ مذهبی خاص پیروی می‌کند، همراه بیمار باید حداقل آشنایی اولیه با آن فرهنگ و زبان داشته باشد تا تعامل دو طرف روان باشد. در نهایت، امکان مصاحبه حضوری یا تلفنی همراه بیمار قبل از شروع کار، باید توسط آژانس فراهم شود تا خانواده و خود بیمار (در صورت توان ذهنی) در تصمیم‌گیری مشارکت داشته باشند.',
        displayOrder: 4,
      },
    ],
    relatedServicesSlugs: ['elderly-care-at-home', 'home-nursing', '24h-patient-monitoring', 'post-surgery-care-guide'],
  },
  {
    id: 14,
    serviceDefinitionId: 10,
    serviceDefinition: {
      id: 10,
      code: 'MONITOR',
      title: 'پایش ۲۴ ساعته بیمار',
      description: 'نظارت مداوم شبانه‌روزی علائم حیاتی و وضعیت بیمار',
      category: 'Nursing',
    },
    slug: '24h-patient-monitoring',
    longDescription:
      'پایش ۲۴ ساعته بیمار در منزل توسط پرستاران تخصصی با نظارت مداوم بر علائم حیاتی (فشار خون، ضربان قلب، دمای بدن، اشباع اکسیژن خون SpO2)، ثبت دقیق تغییرات، مدیریت اورژانسی و گزارش لحظه‌ای به پزشک معالج و خانواده در شرایط حساس.',
    heroImageUrl:
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=nurse%20monitoring%20elderly%20patient%20vital%20signs%2024h%20home%20care%20oximeter%20blood%20pressure%20monitor%20professional%20warm&image_size=landscape_16_9',
    ogImageUrl:
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=nurse%20monitoring%20elderly%20patient%20vital%20signs%2024h%20home%20care%20oximeter%20blood%20pressure%20monitor%20professional%20warm&image_size=landscape_16_9',
    metaTitle: 'پایش ۲۴ ساعته بیمار در منزل | مانیتورینگ علائم حیاتی | سالمندیار',
    metaDescription:
      'پایش ۲۴ ساعته علائم حیاتی بیمار در منزل برای شرایط بحرانی پس از سکته، جراحی قلب و نارسایی قلبی. مانیتورینگ SpO2، فشار خون، ECG و گزارش لحظه‌ای.',
    primaryKeyword: 'پایش ۲۴ ساعته بیمار در منزل',
    secondaryKeywords: ['مانیتورینگ شبانه‌روزی بیمار', 'نظارت بر علائم حیاتی در منزل', 'مراقبت شبانه', 'مراقبت ۲۴ ساعته بیمار'],
    primaryCtaText: 'درخواست تیم پایش ۲۴ ساعته',
    primaryCtaLink: '#guest-request-form',
    priceRangeText: 'قیمت‌گذاری برای ۲۴ ساعت با دو پرستار شیفت ۱۲ ساعته یا یک پرستار با استراحت؛ تجهیزات پایش به صورت رایگان در اختیار قرار می‌گیرد.',
    showInHomePage: true,
    isFeatured: true,
    displayOrder: 14,
    benefits: [
      {
        id: 1,
        title: 'تجهیزات مانیتورینگ حرفه‌ای',
        description: 'دستگاه اندازه‌گیری SpO2، فشار خون دیجیتال، ECG پذیرا و دماسنج دقیق در هر شیفت.',
        iconName: 'Activity',
        colorClass: 'bg-red-100 text-red-600',
        displayOrder: 1,
      },
      {
        id: 2,
        title: 'گزارش‌گیری ساعتی و نمودار',
        description: 'ثبت نمودار روند فشار خون، قند و SpO2 برای ارائه به پزشک در هر مراجعه.',
        iconName: 'FileText',
        colorClass: 'bg-blue-100 text-blue-600',
        displayOrder: 2,
      },
      {
        id: 3,
        title: 'پاسخگویی سریع در بحران',
        description: 'پروتکل مدیریت اولیه اورژانسی تا زمان رسیدن تیم آمبولانس یا پزشک.',
        iconName: 'AlertTriangle',
        colorClass: 'bg-amber-100 text-amber-600',
        displayOrder: 3,
      },
    ],
    targetPatients: [
      { id: 1, title: '۴۸ ساعت اول پس از ترخیص از ICU', description: 'پایش مداوم جهت رفع نگرانی خانواده', displayOrder: 1 },
      { id: 2, title: 'نارسایی قلبی یا ریوی پیشرفته', description: 'کنترل SpO2 و فشار خون در طول شب', displayOrder: 2 },
      { id: 3, title: 'بیماران تب‌دار مشکوک به عفونت', description: 'کنترل مداوم دما و تشخیص علائم تشدید سریع', displayOrder: 3 },
    ],
    coverageAreas: [
      { id: 1, areaName: 'تهران ۲۲ منطقه', has24HourService: true, displayOrder: 1 },
      { id: 2, areaName: 'کرج و البرز', has24HourService: true, displayOrder: 2 },
    ],
    faqs: [
      {
        id: 1,
        question: 'چند نفر پرستار برای پایش ۲۴ ساعته به منزل می‌آیند؟',
        answer:
          'برای حفظ هوشیاری و کیفیت کار، دو پرستار در قالب دو شیفت ۱۲ ساعته (روز و شب) مسئولیت پایش را بر عهده می‌گیرند. در موارد خاص و با درخواست خانواده، یک پرستار با امکان استراحت ۴ ساعته در منزل نیز ارائه می‌شود.',
        displayOrder: 1,
      },
    ],
    seoSections: [
      {
        id: 1,
        heading: 'چرا پایش ۲۴ ساعته در بیماری‌های بحرانی حیاتی است؟',
        content:
          'پایش ۲۴ ساعته یا Continuous Monitoring، یکی از ضروریات مدیریت بیماران دچار شرایط بحرانی یا پرخطر در خانه است. بیش از ۷۰ درصد موارد تشدید ناگهانی بیماری‌های قلبی، تنفسی و مغزی در سالمندان، در ساعات نیمه‌شب و هنگام خواب رخ می‌دهد و در صورت عدم تشخیص به موقع می‌تواند منجر به مرگ یا ناتوانی دائمی شود. برای مثال، در بیماران دچار نارسایی قلبی کلاس ۴، کاهش ناگهانی اشباع اکسیژن خون (SpO2) زیر ۹۰ درصد در طول خواب، می‌تواند هشدار دهنده ادم ریه باشد که در صورت عدم تشخیص ظرف ۲۰ دقیقه منجر به ایست قلبی می‌شود. یا در بیماران پس از عمل جراحی بزرگ، افزایش ناگهانی دمای بدن بالای ۳۸.۵ در شب سوم پس از عمل می‌تواند نشان‌دهنده عفونت زخم جراحی یا سپسیس باشد. خدمات پایش ۲۴ ساعته بیمار در منزل سالمندیار با هدف رفع این خلا، نظارت بی‌وقف بر علائم حیاتی بیمار را در طول شب و روز بر عهده گرفته و در صورت مشاهده هرگونه انحراف از محدوده نرمال، سریعاً خانواده و پزشک معالج را مطلع می‌سازد.',
        displayOrder: 1,
      },
      {
        id: 2,
        heading: 'چه علائم حیاتی در طول ۲۴ ساعت پایش می‌شوند؟',
        content:
          'تیم پایش سالمندیار با استفاده از دستگاه‌های استاندارد و کالیبره، هر ۲ الی ۴ ساعت یک بار (و در شرایط بحرانی هر ۳۰ دقیقه) علائم حیاتی زیر را اندازه‌گیری و در نمودار اختصاصی بیمار ثبت می‌کند: اول، فشار خون سیستولیک و دیاستولیک و نبض به روش کاف فشار خون دیجیتال اتوماتیک؛ این اندازه‌گیری در ساعات خاصی مانند قبل و بعد از داروهای قلبی، با دقت بیشتری تکرار می‌شود. دوم، اشباع اکسیژن خون (SpO2) و تعداد تنفس در دقیقه با استفاده از پالس اکسیمتر انگشتی؛ برای بیماران دچار کووید طولانی‌مدت، نارسایی قلبی ناشی از آمفیزم یا بیماران تحت ونتیلاتور غیرتهاجمی، این پارامتر مهم‌ترین شاخص پزشکی محسوب می‌شود. سوم، دمای بدن با دماسنج دیجیتال زیرزبانی یا تماسی؛ کنترل دما در بیماران دچار عفونت ادراری، زخم بستر عفونی و یا تب نامعلوم بسیار ضروری است. چهارم، ضربان قلب و ریتم قلبی به صورت دوره‌ای با گوش‌پزشکی و در صورت نیاز ECG یک‌کاناله (ECG portable) که ناهنجاری‌های ریحمی مانند فیبریلاسیون دهلیزی را تشخیص می‌دهد. پنجم، قند خون ناشتا و بعد از غذا برای بیماران دیابتی بستری در خانه و نیازمند انسولین. در نهایت، میزان ورودی و خروجی مایعات بدن (مقدار آب خوراکی، سرم وریدی و همچنین ادرار و مدفوع) برای بیماران دچار نارسایی کلیه یا کبد به دقت ثبت و گزارش می‌گردد.',
        displayOrder: 2,
      },
      {
        id: 3,
        heading: 'پروتکل‌های اقدام فوری در شرایط بحرانی',
        content:
          'تیم پایش ۲۴ ساعته سالمندیار صرفاً مشاهده و ثبت نمی‌کند؛ بلکه در چارچوب پروتکل‌های استاندارد بین‌المللی BLS (Basic Life Support) و بر اساس دستورالعمل کتبی پزشک معالج، اقدامات اولیه نجات‌دهنده را تا زمان رسیدن تیم آمبولانس یا پزشک اجرا می‌کند. این پروتکل‌ها شامل موارد زیر است: اول، مدیریت آیروی راه هوایی؛ در صورت گرفتگی حلق با ترشح یا مواد غذایی، مانور هایملیک و در صورت نیاز ساکشن فوری انجام می‌شود. دوم، اکسیژن‌درمانی با ریتم ۴ الی ۶ لیتر در دقیقه با استفاده از ماسک یا کانولای بینی برای بیمارانی که از قبل پزشک اکسیژن تجویز کرده است. سوم، کنترل شوک فوری در صورت افت فشار خون شدید (کمربندی پایین‌ها، کنترل سر دراز کشیده و اکسیژن). چهارم، تجویز داروهای اورژانسی تجویز شده توسط پزشک مثل گلیسیرین تری‌نیترات زیرزبانی در صورت درد قفسه سینه (آنژین)، و یا کورتیزون تزریقی برای بیماران آسمی. پنجم، انجام CPR (احیای قلبی ریوی) پایه در صورت ایست ناگهانی قلبی تا رسیدن تیم اورژانس ۱۱۵. در کنار این اقدامات پزشکی، پرستار مسئول پایش همزمان تماس تلفنی سریع با آمبولانس، اطلاع‌رسانی دقیق وضعیت بیمار به اپراتور و آماده‌سازی مدارک پزشکی بیمار (نتایج آزمایش‌ها، نسخه‌ها و کارت بیمه) برای تحویل سریع به تیم پیشگیرنده است. در پایان هر رویداد بحرانی، یک گزارش کامل از علائم اولیه، اقدامات انجام شده و نتیجه نهایی، کتبی در اختیار خانواده و پزشک معالج قرار می‌گیرد.',
        displayOrder: 3,
      },
      {
        id: 4,
        heading: 'مناسب‌ترین زمان برای استفاده از پایش ۲۴ ساعته',
        content:
          'خدمات پایش ۲۴ ساعته برای همه نوع بیمار ضروری نیست و بر اساس توصیه پزشک معالج و ارزیابی کارشناس سالمندیار در صورت وجود حداقل یک یا چند مورد زیر، پیشنهاد می‌شود: اول، ۴۸ تا ۷۲ ساعت اول پس از ترخیص از بخش مراقبت‌های ویژه (ICU) بیمارستان؛ این دوره، بحرانی‌ترین بازه زمانی در مسیر بهبودی بیمار است و ۴۰ درصد عوارض تاخیری پس از ترخیص در همین ۳ روز اول رخ می‌دهد. دوم، بیماران مبتلا به نارسایی مزمن قلبی NYHA کلاس ۳ و ۴ که دچار تنگی نفس در حالت استراحت، ادم پا و کاهش تحمل فعالیت هستند. سوم، بیماران مبتلا به بیماری‌های پیشرفته ریوی مثل COPD شدید، فیبروز ریه و آمفیزم که نیاز به اکسیژن‌درمانی طولانی‌مدت یا NIV (ونتیلاسیون غیرتهاجمی) شبانه دارند. چهارم، بیماران مبتلا به زوال عقل پیشرفته که قادر به بیان درد و ناراحتی خود نیستند؛ در این افراد، افزایش ناگهانی ضربان قلب یا افت اشباع اکسیژن ممکن است تنها نشانه‌ای از بیماری در حال رشد باشد. پنجم، بیماران مسن ترخیص‌یافته از بیمارستان به دلیل عفونت شدید (مانند ذات‌الریه یا عفونت ادراری) که هنوز دوره کامل آنتی‌بیوتیک وریدی را طی می‌کنند و احتمال عود تب و سپسیس وجود دارد. در نهایت، خانواده‌هایی که تنها عضو مراقبت‌کننده آن‌ها یک نفر است و نمی‌تواند در طول شب بیدار بماند یا استراحت کافی خود را از دست می‌دهد، می‌تواند از سرویس پایش ۲۴ ساعته برای حفظ سلامت خود نیز استفاده کند؛ زیرا خستگی خانوادگی عامل مهمی در بروز خطاهای مراقبتی است.',
        displayOrder: 4,
      },
    ],
    relatedServicesSlugs: ['icu-home-care-nursing', 'home-nursing', 'patient-companion', 'iv-infusion-at-home'],
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
