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
      'پانسمان در منزل توسط پرستاران تخصصی سالمندیار با استفاده از پانسمان‌های مدرن و مدرج درمانی. تعویض پانسمان زخم ساده، جراحی، سوختگی و زخم‌های مزمن با تجهیزات استریل.',
    heroImageUrl:
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=nurse%20doing%20wound%20care%20dressing%20elderly%20patient%20home%20sterile%20gloves%20healing%20medical&image_size=landscape_16_9',
    metaTitle: 'پانسمان در منزل | تعویض پانسمان زخم جراحی و ساده | سالمندیار',
    metaDescription:
      'خدمات پانسمان در منزل تهران و کرج توسط پرستار تخصصی. تعویض پانسمان زخم بعد از عمل، سوختگی و زخم‌های ساده با لوازم مدرن و استریل.',
    primaryKeyword: 'پانسمان در منزل',
    secondaryKeywords: ['تعویض پانسمان در منزل', 'پرستار پانسمان', 'خدمات پرستاری در منزل', 'درخواست پرستار در منزل'],
    primaryCtaText: 'درخواست پانسمان فوری',
    primaryCtaLink: '#guest-request-form',
    priceRangeText: 'قیمت‌گذاری بر اساس نوع و سطح زخم، تعداد تعویض در هفته و منطقه جغرافیایی',
    showInHomePage: true,
    isFeatured: true,
    displayOrder: 6,
    benefits: [
      {
        id: 1,
        title: 'پانسمان‌های مدرن و مدرج',
        description: 'استفاده از فوم، هیدروژل و پانسمان‌های اکتیو جهت تسریع التیام و کاهش درد.',
        iconName: 'HeartPulse',
        colorClass: 'bg-teal-100 text-teal-600',
        displayOrder: 1,
      },
      {
        id: 2,
        title: 'ثبت عکس و گزارش هر مرتبه',
        description: 'در هر پانسمان از زخم عکسبرداری و گزارش روند بهبود تهیه می‌شود.',
        iconName: 'Camera',
        colorClass: 'bg-blue-100 text-blue-600',
        displayOrder: 2,
      },
    ],
    targetPatients: [
      { id: 1, title: 'بعد از جراحی و بخیه', description: 'تعویض منظم پانسمان محل برش تا زمان ترکیدن بخیه‌ها', displayOrder: 1 },
      { id: 2, title: 'زخم‌های ساده و جزئی', description: 'بریدگی، خراشیدگی و سوختگی‌های درجه یک و دو', displayOrder: 2 },
    ],
    coverageAreas: [
      { id: 1, areaName: 'تهران (تمامی مناطق)', has24HourService: true, displayOrder: 1 },
      { id: 2, areaName: 'کرج و البرز', has24HourService: true, displayOrder: 2 },
    ],
    faqs: [
      {
        id: 1,
        question: 'هر چند وقت یک بار باید پانسمان زخم را تعویض کرد؟',
        answer:
          'بسته به نوع زخم و ترشح آن، معمولاً یک بار در روز یا یک روز در میان تعویض انجام می‌شود. پرستار بر اساس مشاهدات خود بهترین فاصله زمانی را تعیین می‌کند.',
        displayOrder: 1,
      },
      {
        id: 2,
        question: 'آیا تعویض پانسمان در منزل عوارضی دارد؟',
        answer:
          'با رعایت کامل پروتکل‌های بهداشتی و استریل توسط پرستار سالمندیار، ریسک عفونت به حداقل ممکن می‌رسد و در واقع به دلیل محیط تمیز خانگی، از درمانگاه ایمن‌تر عمل می‌کند.',
        displayOrder: 2,
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
    ],
    relatedServicesSlugs: ['bedsores-dressing-at-home', 'dressing-change-at-home', 'injection-at-home'],
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
      'پانسمان زخم بستر در منزل با پروتکل‌های جهانی درمان زخم‌های فشاری. پوشاکش زخم بستر درجه ۲، ۳ و ۴ با استفاده از پانسمان‌های مدرن فوم، آلژینات و هیدروکلوئید همراه با آموزش تعیین وضعیت برای خانواده.',
    heroImageUrl:
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=nurse%20treating%20bedsore%20pressure%20ulcer%20elderly%20bedridden%20patient%20home%20professional%20wound%20care&image_size=landscape_16_9',
    metaTitle: 'پانسمان زخم بستر در منزل | درمان زخم فشاری درجه ۲ تا ۴ | سالمندیار',
    metaDescription:
      'پانسمان تخصصی زخم بستر در منزل برای بیماران تخت بخواب سالمند. درمان زخم‌های درجه ۲ تا ۴ با پانسمان‌های مدرن و آموزش جلوگیری از پیشرفت به خانواده.',
    primaryKeyword: 'پانسمان زخم بستر در منزل',
    secondaryKeywords: ['درمان زخم بستر در منزل', 'پرستار پانسمان زخم بستر', 'خدمات پرستاری در منزل'],
    primaryCtaText: 'درخواست پانسمان زخم بستر',
    primaryCtaLink: '#guest-request-form',
    priceRangeText: 'قیمت‌گذاری بر اساس درجه زخم، متراژ، تعداد تعویض هفتگی و تجهیزات مدرن مصرفی',
    showInHomePage: true,
    isFeatured: true,
    displayOrder: 7,
    targetPatients: [
      { id: 1, title: 'سالمندان تخت بخواب دچار زخم بستر', description: 'پیشگیری و درمان در تمام مراحل', displayOrder: 1 },
      { id: 2, title: 'بیماران فلج مغزی یا نخاعی', description: 'مدیریت طولانی‌مدت زخم فشاری', displayOrder: 2 },
    ],
    coverageAreas: [
      { id: 1, areaName: 'تهران و حومه', has24HourService: true, displayOrder: 1 },
      { id: 2, areaName: 'کرج', has24HourService: true, displayOrder: 2 },
    ],
    faqs: [
      {
        id: 1,
        question: 'آیا زخم بستر درجه ۴ در منزل قابل درمان است؟',
        answer:
          'بله، با برنامه درمانی منظم، استفاده از پانسمان‌های مدرن و آموزش صحیح خانواده برای تغییر وضعیت بیمار، زخم بستر حتی در مراحل پیشرفته نیز قابل کنترل و التیام است.',
        displayOrder: 1,
      },
    ],
    seoSections: [
      {
        id: 1,
        heading: 'چرا پانسمان زخم بستر نیازمند تخصص است؟',
        content:
          'زخم بستر یا زخم فشاری یکی از پیچیده‌ترین انواع زخم در بیماران تخت بخواب است. درمان این نوع زخم صرفاً با تعویض گاز و سرما انجام نمی‌شود؛ بلکه نیازمند ارزیابی دقیق درجه زخم (مقیاس برادن)، انتخاب پانسمان مناسب بر اساس میزان ترشح و عمق زخم، آموزش صحیح خانواده برای تغییر وضعیت هر دو ساعت یک‌بار، رعایت رژیم غذایی سرشار از پروتئین و ویتامین و... دارد. پرستاران تخصصی زخم سالمندیار با گذراندن دوره‌های آموزشی مدون و سال‌ها تجربه عملی در بخش‌های سوختگی و ICU، می‌توانند روند درمان زخم بستر را به بهترین شکل در محیط خانه مدیریت نمایند و از گران‌تر شدن عارضه و نیاز به بستری مجدد در بیمارستان جلوگیری کنند.',
        displayOrder: 1,
      },
    ],
    relatedServicesSlugs: ['wound-dressing-at-home', 'dressing-change-at-home', 'elderly-care-at-home'],
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
      'تزریق سرم در منزل توسط پرستار متخصص مراقبت‌های ویژه. نصب کانولا، آهسته‌تزریق داروها، سرم آبرسانی، آنتی‌بیوتیک و سرم‌های دارویی با مانیتورینگ دقیق علائم حیاتی طول تزریق.',
    heroImageUrl:
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=professional%20nurse%20IV%20infusion%20intravenous%20drip%20elderly%20patient%20home%20setting%20sterile%20monitoring&image_size=landscape_16_9',
    metaTitle: 'تزریق سرم در منزل | پرستار سرم درمانی و کانولا | سالمندیار',
    metaDescription:
      'تزریق سرم در منزل تهران و کرج با پرستار متخصص ICU. نصب کانولا، تزریق آنتی‌بیوتیک وریدی، سرم آبرسانی و مانیتورینگ دقیق تا پایان تزریق.',
    primaryKeyword: 'تزریق سرم در منزل',
    secondaryKeywords: ['سرم درمانی در منزل', 'نصب کانولا در منزل', 'آهسته‌تزریق در منزل', 'خدمات پرستاری در منزل'],
    primaryCtaText: 'درخواست تزریق سرم',
    primaryCtaLink: '#guest-request-form',
    priceRangeText: 'قیمت‌گذاری بر اساس مدت زمان تزریق، نوع دارو، نیاز به مانیتورینگ و منطقه جغرافیایی',
    showInHomePage: true,
    isFeatured: false,
    displayOrder: 8,
    targetPatients: [
      { id: 1, title: 'بیماران کم‌آب بعد از تب یا اسهال', displayOrder: 1 },
      { id: 2, title: 'نیاز به آنتی‌بیوتیک وریدی طولانی‌مدت', displayOrder: 2 },
      { id: 3, title: 'بیماران نیازمند سرم تقویتی و ویتامین', displayOrder: 3 },
    ],
    coverageAreas: [
      { id: 1, areaName: 'تهران (تمامی مناطق ۲۲ گانه)', has24HourService: true, displayOrder: 1 },
      { id: 2, areaName: 'کرج و مناطق البرز', has24HourService: true, displayOrder: 2 },
    ],
    faqs: [
      {
        id: 1,
        question: 'آیا پرستار تا پایان تزریق سرم کنار بیمار می‌ماند؟',
        answer:
          'بله، در تمام موارد تزریق سرم وریدی و دارویی، پرستار تا پایان تزریق و پایدار شدن علائم حیاتی بیمار در کنار او می‌ماند و هر گاه لازم باشد سرعت قطره‌چکان را تنظیم می‌کند.',
        displayOrder: 1,
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
    ],
    relatedServicesSlugs: ['injection-at-home', 'home-nursing', 'elderly-care-at-home'],
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
      'خدمات تعویض پانسمان در منزل برای دوره‌های درمانی طولانی‌مدت. تعویض منظم پانسمان زخم بستر، زخم پای دیابتی، محل برش جراحی، PEG، تراکئوستومی و... طبق برنامه تعیین‌شده با پزشک.',
    heroImageUrl:
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=nurse%20changing%20wound%20dressing%20caregiver%20elderly%20patient%20home%20clean%20clinical%20procedure&image_size=landscape_16_9',
    metaTitle: 'تعویض پانسمان در منزل | دوره‌های منظم روزانه و هفتگی | سالمندیار',
    metaDescription:
      'تعویض پانسمان دوره‌ای در منزل برای بیماری‌های طولانی‌مدت. برنامه‌ریزی روزانه یا چند بار در هفته توسط پرستار ثابت و آشنا با بیمار.',
    primaryKeyword: 'تعویض پانسمان در منزل',
    secondaryKeywords: ['پرستار برای تعویض پانسمان', 'پانسمان دوره‌ای', 'خدمات پرستاری در منزل'],
    primaryCtaText: 'ثبت برنامه تعویض پانسمان',
    primaryCtaLink: '#guest-request-form',
    priceRangeText: 'قیمت‌گذاری ویژه برای بسته‌های ۷ یا ۱۴ روزه و جلسات مکرر',
    showInHomePage: true,
    isFeatured: false,
    displayOrder: 9,
    targetPatients: [
      { id: 1, title: 'بیماران PEG یا تراکئوستومی', description: 'تعویض منظم بانداژ و نازل', displayOrder: 1 },
      { id: 2, title: 'زخم‌های طولانی‌مدت و مزمن', description: 'برنامه درمانی ۶ تا ۸ هفته‌ای', displayOrder: 2 },
    ],
    coverageAreas: [
      { id: 1, areaName: 'تهران', has24HourService: false, displayOrder: 1 },
      { id: 2, areaName: 'کرج', has24HourService: false, displayOrder: 2 },
    ],
    seoSections: [
      {
        id: 1,
        heading: 'برنامه‌ریزی منظم برای تعویض پانسمان‌های طولانی‌مدت',
        content:
          'بسیاری از بیماران مبتلا به زخم‌های مزمن، تجهیزاتی مانند PEG (تغذیه از طریق معده)، کاتتر ادراری دائمی یا تراکئوستومی دارند. این افراد به یک برنامه منظم و قابل پیش‌بینی برای تعویض پانسمان و بازرسی محل دسترسی نیاز دارند. در سالمندیار، برای این دسته از بیماران بسته‌های خدماتی ویژه هفتگی یا ماهانه تعریف می‌شود که در آن یک پرستار ثابت و آشنا در ساعت و روز مشخصی به صورت هفتگی چند بار مراجعه می‌کند و علاوه بر تعویض استاندارد پانسمان، علائم حیاتی بیمار را نیز ثبت و به خانواده گزارش می‌دهد. این برنامه‌ریزی منظم، خیال خانواده را از جهت فراموشی یا تاخیر در تعویض به طور کامل راحت می‌کند و مانع بروز عوارض زودرس می‌گردد.',
        displayOrder: 1,
      },
    ],
    relatedServicesSlugs: ['wound-dressing-at-home', 'bedsores-dressing-at-home', 'home-nursing'],
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
      'خدمات پرستار سالمند در منزل شامل: همراهی روزانه، کمک به تغذیه، کمک به دفع، نظارت بر دارو، کنترل علائم حیاتی، تحریک ذهنی، پیاده‌روی همراه و گزارش منظم به خانواده.',
    heroImageUrl:
      'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=elderly%20caregiver%20nurse%20companion%20helping%20senior%20woman%20home%20happy%20warm%20loving%20support%20healthcare&image_size=landscape_16_9',
    metaTitle: 'پرستار سالمند در منزل | شیفت صبح، شب و ۲۴ ساعته | سالمندیار',
    metaDescription:
      'استخدام پرستار سالمند در منزل تهران و کرج با سوابق معتبر. شیفت صبح، شب، نیمه‌وقت و ۲۴ ساعته همراهی دائمی، کمک روزانه و نظارت بر دارو.',
    primaryKeyword: 'پرستار سالمند در منزل',
    secondaryKeywords: ['سالمندیار در منزل', 'مراقبت از سالمند در خانه', 'خدمات پرستاری در منزل', 'درخواست پرستار در منزل'],
    primaryCtaText: 'درخواست مصاحبه پرستار سالمند',
    primaryCtaLink: '#guest-request-form',
    priceRangeText: 'قیمت‌گذاری بر اساس نوع شیفت (روزانه، شبانه، ۲۴ ساعته)، سابقه پرستار و مدت قرارداد',
    showInHomePage: true,
    isFeatured: true,
    displayOrder: 10,
    benefits: [
      {
        id: 1,
        title: 'بررسی سوابق و مصاحبه حضوری',
        description: 'معرفی پرستار مناسب و امکان مصاحبه تلفنی یا حضوری قبل از شروع کار.',
        iconName: 'UserCheck',
        colorClass: 'bg-teal-100 text-teal-600',
        displayOrder: 1,
      },
      {
        id: 2,
        title: 'گزارش روزانه به خانواده',
        description: 'ارسال گزارش متنی و تصویری کوتاه از وضعیت روزانه سالمند برای فرزندان.',
        iconName: 'FileText',
        colorClass: 'bg-blue-100 text-blue-600',
        displayOrder: 2,
      },
    ],
    targetPatients: [
      { id: 1, title: 'سالمندان تنها ساکن آپارتمان', displayOrder: 1 },
      { id: 2, title: 'سالمندان مبتلا به آلزایمر یا زوال عقل اولیه', displayOrder: 2 },
      { id: 3, title: 'پس از سکته مغزی یا نقاهت جراحی', displayOrder: 3 },
    ],
    coverageAreas: [
      { id: 1, areaName: 'تهران و حومه', has24HourService: true, displayOrder: 1 },
      { id: 2, areaName: 'کرج و البرز', has24HourService: true, displayOrder: 2 },
      { id: 3, areaName: 'اصفهان مرکز', has24HourService: false, displayOrder: 3 },
    ],
    faqs: [
      {
        id: 1,
        question: 'آیا امکان تعویض پرستار در صورت نارضایتی وجود دارد؟',
        answer:
          'بله، تا ۴۸ ساعت اول امکان تعویض رایگان پرستار وجود دارد و در ادامه قرارداد نیز در صورت نیاز و با هماهنگی، جایگزین مناسب معرفی می‌گردد.',
        displayOrder: 1,
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
    ],
    relatedServicesSlugs: ['home-nursing', 'injection-at-home', 'iv-infusion-at-home'],
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
      'مجموعه جامع خدمات پرستاری در منزل شامل: ارزیابی اولیه وضعیت بیمار، برنامه‌ریزی مراقبت روزانه، تزریق، پانسمان، نظارت بر دارو، آموزش خانواده و پشتیبانی ۲۴ ساعته.',
    heroImageUrl:
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
    ],
    primaryCtaText: 'مشاوره رایگان برنامه مراقبت',
    primaryCtaLink: '#guest-request-form',
    priceRangeText: 'قیمت‌گذاری بر اساس سرویس موردنیاز و بسته هفتگی/ماهانه؛ پیشنهاد شخصی‌سازی شده برای هر بیمار',
    showInHomePage: true,
    isFeatured: true,
    displayOrder: 11,
    targetPatients: [
      { id: 1, title: 'بیماران مزمن سالمند با نیاز چند خدمت همزمان', displayOrder: 1 },
      { id: 2, title: 'خانواده‌هایی که نیاز به برنامه‌ریزی جامع دارند', displayOrder: 2 },
    ],
    coverageAreas: [
      { id: 1, areaName: 'تهران ۲۲ منطقه', has24HourService: true, displayOrder: 1 },
      { id: 2, areaName: 'کرج و البرز', has24HourService: true, displayOrder: 2 },
      { id: 3, areaName: 'اصفهان', has24HourService: false, displayOrder: 3 },
    ],
    seoSections: [
      {
        id: 1,
        heading: 'خدمات پرستاری در منزل؛ کلید یک مراقبت یکپارچه',
        content:
          'بسیاری از خانواده‌ها در یک مقطع، بیمار سالمند خود را با چند چالش همزمان روبرو می‌بینند: مثلاً هم نیاز به تزریق منظم انسولین دارند، هم به تعویض روزانه پانسمان زخم بستر و هم به یک همراهی روزانه برای کمک به فعالیت‌های روزمره. در این شرایط، درخواست تک‌تک خدمات جداگانه می‌تواند پیچیده و وقت‌گیر باشد. خدمات پرستاری در منزل، یک رویکرد یکپارچه است که در آن ابتدا یک پرستار ارشد برای ارزیابی در منزل به شما مراجعه می‌کند، سپس بر اساس نیاز واقعی بیمار، یک برنامه مراقبتی شخصی‌سازی شده شامل تمام خدمات لازم (تزریق، پانسمان، فیزیوتراپی خانگی، آموزش و...) تهیه می‌شود و در نهایت یک تیم منسجم یا یک پرستار ثابت مسئول اجرای آن برنامه می‌باشد. این روش باعث حفظ تداوم مراقبت، کاهش خطاها و صرفه‌جویی قابل ملاحظه در هزینه کلی خانواده می‌گردد.',
        displayOrder: 1,
      },
    ],
    relatedServicesSlugs: ['elderly-care-at-home', 'injection-at-home', 'wound-dressing-at-home', 'bedsores-dressing-at-home'],
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
