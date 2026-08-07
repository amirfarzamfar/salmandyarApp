import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { User, Award, ShieldCheck, BookOpen, FileText, Mail, Phone, ArrowLeft, Calendar, BadgeCheck, MessageSquareHeart, ExternalLink } from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Breadcrumb from '@/components/seo/Breadcrumb';
import { guides } from '@/lib/data/content-data';
import type { Author } from '@/lib/types/content';
import { AuthorSchema } from '@/lib/seo/structured-data';
import { listAuthors, getAuthorBySlug, listArticles } from '@/lib/content-api';

export async function generateStaticParams() {
  const authors = await listAuthors();
  if (!authors || authors.length === 0) return [];
  return authors.filter(a => a.slug).map(a => ({ slug: a.slug as string }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author) return {};

  const title = `${author.fullName}${author.title ? ' · ' + author.title : ''} | تیم پزشکی سالمندیار`;
  const desc = author.biography
    ? `${author.fullName}، ${author.specialization || author.title || 'متخصص حوزه سلامت'} با ${author.yearsOfExperience || 'سال‌ها'} سال تجربه در تیم پزشکی و نویسندگان سالمندیار.`
    : `${author.fullName} از تیم پزشکی و نویسندگان سالمندیار.`;

  return {
    title,
    description: desc,
    keywords: [author.fullName, author.specialization || '', 'نویسنده سالمندیار', 'تیم پزشکی سالمندیار'].filter(Boolean),
    alternates: { canonical: `/authors/${slug}` },
    openGraph: {
      title,
      description: desc,
      type: 'profile',
      url: `/authors/${slug}`,
      firstName: author.firstName,
      lastName: author.lastName,
      ...(author.title && { role: author.title }),
    },
  };
}

export default async function AuthorDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [authorResult, articlesResult, allAuthorsResult] = await Promise.all([
    getAuthorBySlug(slug),
    listArticles({ pageSize: 100 }),
    listAuthors(),
  ]);
  const author = authorResult;
  if (!author) notFound();
  const a: Author = author;
  const allAuthors = allAuthorsResult || [];

  const authorArticles = (articlesResult?.items || []).filter(ar => ar.authorId === a.id);
  const authorGuides = guides.filter(g => g.authorId === a.id);
  const contentCount = authorArticles.length + authorGuides.length;

  const personLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: a.fullName,
    givenName: a.firstName,
    familyName: a.lastName,
    ...(a.title && { jobTitle: a.title }),
    ...(a.specialization && { specialty: a.specialization }),
    ...(a.profileImageUrl && { image: a.profileImageUrl }),
    ...(a.email && { email: a.email }),
    ...(a.medicalLicenseNumber && { licenseNumber: a.medicalLicenseNumber }),
    worksFor: { '@type': 'Organization', name: 'سالمندیار', url: '/' },
    url: `/authors/${a.slug}`,
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Script id="schema-person" type="application/ld+json" strategy="afterInteractive">{JSON.stringify(personLd)}</Script>
      {AuthorSchema({ author: a })}

      <Navbar />
      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { name: 'تیم پزشکی و نویسندگان', href: '/authors' },
              { name: a.fullName, href: `/authors/${a.slug}` },
            ]}
          />

          <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 text-white mb-12 shadow-2xl shadow-indigo-500/20">
            <div className="absolute inset-0 opacity-15 pointer-events-none">
              <div className="absolute -top-20 -left-10 w-80 h-80 rounded-full bg-white blur-3xl" />
              <div className="absolute -bottom-32 -right-20 w-[420px] h-[420px] rounded-full bg-yellow-300 blur-3xl" />
            </div>
            <div className="relative p-7 sm:p-10 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-4 text-center lg:text-right">
                <div className="relative inline-block">
                  <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-[2.5rem] shrink-0 bg-white/20 backdrop-blur border-4 border-white/40 shadow-2xl overflow-hidden mx-auto">
                    {a.profileImageUrl ? (
                      <img src={a.profileImageUrl} alt={a.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><User size={72} className="text-white/80" /></div>
                    )}
                  </div>
                  {a.isMedicalReviewer && (
                    <div className="absolute -bottom-2 -left-2 px-3 py-1.5 rounded-2xl bg-emerald-500 text-white text-[11px] font-black shadow-xl flex items-center gap-1 border-2 border-white">
                      <ShieldCheck size={14} /> Medical Reviewer
                    </div>
                  )}
                </div>
              </div>
              <div className="lg:col-span-8 min-w-0">
                <div className="flex flex-wrap gap-2 mb-3.5">
                  {a.title && (
                    <span className="inline-block px-3 py-1 rounded-full bg-white/15 border border-white/25 backdrop-blur text-xs font-bold">
                      {a.title}
                    </span>
                  )}
                  {a.yearsOfExperience && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/25 backdrop-blur text-xs font-bold">
                      <Award size={12} /> {a.yearsOfExperience}+ سال تجربه عملی
                    </span>
                  )}
                  {a.medicalLicenseNumber && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/25 backdrop-blur text-xs font-bold">
                      <BadgeCheck size={12} /> پروانه: {a.medicalLicenseNumber}
                    </span>
                  )}
                </div>
                <h1 className="text-4xl sm:text-5xl font-black mb-2 leading-tight">{a.fullName}</h1>
                {a.specialization && (
                  <p className="text-lg sm:text-xl font-bold text-yellow-200 mb-5">{a.specialization}</p>
                )}
                {a.biography && (
                  <p className="text-white/90 text-base sm:text-lg leading-relaxed mb-6 max-w-3xl">
                    {a.biography}
                  </p>
                )}
                {a.experienceSummary && (
                  <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4 mb-6 max-w-3xl">
                    <div className="flex items-start gap-2.5">
                      <MessageSquareHeart size={18} className="text-yellow-200 mt-0.5 shrink-0" />
                      <p className="text-sm sm:text-base leading-relaxed text-white/90">
                        <strong className="text-white">حوزه‌های تخصصی: </strong>
                        {a.experienceSummary}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-3">
                  {a.email && (
                    <a
                      href={`mailto:${a.email}`}
                      className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-white text-indigo-700 font-bold hover:bg-yellow-100 hover:text-indigo-800 transition shadow"
                    >
                      <Mail size={16} /> ارسال ایمیل
                    </a>
                  )}
                  <a
                    href="/portal/home-care/request"
                    className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-white/15 border border-white/30 backdrop-blur text-white font-bold hover:bg-white/25 transition"
                  >
                    <Phone size={16} /> درخواست مشاوره با این متخصص
                  </a>
                </div>
              </div>
            </div>
            <div className="relative border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/15 text-center">
              <div className="p-5 sm:p-6">
                <div className="text-4xl font-black mb-1">{contentCount}</div>
                <div className="text-xs sm:text-sm text-white/80 font-bold">مطلب منتشر شده</div>
              </div>
              <div className="p-5 sm:p-6">
                <div className="text-4xl font-black mb-1">{authorArticles.length}</div>
                <div className="text-xs sm:text-sm text-white/80 font-bold">مقاله تخصصی</div>
              </div>
              <div className="p-5 sm:p-6">
                <div className="text-4xl font-black mb-1">{authorGuides.length}</div>
                <div className="text-xs sm:text-sm text-white/80 font-bold">راهنمای عملی</div>
              </div>
              <div className="p-5 sm:p-6">
                <div className="text-4xl font-black mb-1">
                  {(authorArticles.reduce((s, ar) => s + (ar.estimatedReadingTimeMinutes || 0), 0) / 60).toFixed(1)}
                  <span className="text-xl">س</span>
                </div>
                <div className="text-xs sm:text-sm text-white/80 font-bold">محتوای خوانا</div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-10">
              {(authorArticles.length > 0 || authorGuides.length > 0) && (
                <section className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm">
                  <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-1">محتواهای منتشر شده توسط این نویسنده</h2>
                      <p className="text-sm text-gray-500">لیست مقالات و راهنماهای نوشته شده توسط {a.fullName}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                        <BookOpen size={13} /> {authorArticles.length} مقاله
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
                        <FileText size={13} /> {authorGuides.length} راهنما
                      </span>
                    </div>
                  </div>

                  {authorArticles.length > 0 && (
                    <div className="mb-8">
                      <h3 className="flex items-center gap-2 font-black text-lg text-blue-700 mb-4">
                        <BookOpen size={18} /> مقالات تخصصی
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {authorArticles.map(article => (
                          <Link
                            key={article.id}
                            href={`/articles/${article.slug}`}
                            className="group rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-white to-blue-50 border border-blue-100 hover:border-blue-200 hover:shadow-lg transition-all flex gap-4 items-start"
                          >
                            <div className="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg">
                              <BookOpen size={26} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                                {article.estimatedReadingTimeMinutes && (
                                  <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 font-bold">
                                    <Calendar size={11} /> {article.estimatedReadingTimeMinutes} دقیقه خوانش
                                  </span>
                                )}
                                {article.isMedicalContent && (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold">
                                    تأیید پزشکی
                                  </span>
                                )}
                              </div>
                              <h4 className="font-black text-base sm:text-lg text-gray-900 group-hover:text-blue-700 leading-tight mb-1.5 line-clamp-2">
                                {article.title}
                              </h4>
                              <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                                {article.excerpt}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {authorGuides.length > 0 && (
                    <div>
                      <h3 className="flex items-center gap-2 font-black text-lg text-amber-700 mb-4">
                        <FileText size={18} /> راهنماهای عملی
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {authorGuides.map(guide => (
                          <Link
                            key={guide.id}
                            href={`/guides/${guide.slug}`}
                            className="group rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-white to-amber-50 border border-amber-100 hover:border-amber-200 hover:shadow-lg transition-all flex gap-4 items-start"
                          >
                            <div className="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg">
                              <FileText size={26} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                                {guide.steps && guide.steps.length > 0 && (
                                  <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 font-bold">
                                    <ExternalLink size={11} /> {guide.steps.length} مرحله عملی
                                  </span>
                                )}
                                {guide.isMedicalContent && (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold">
                                    تأیید پزشکی
                                  </span>
                                )}
                              </div>
                              <h4 className="font-black text-base sm:text-lg text-gray-900 group-hover:text-amber-700 leading-tight mb-1.5 line-clamp-2">
                                {guide.title}
                              </h4>
                              <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                                {guide.shortDescription}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {contentCount === 0 && (
                    <div className="p-10 rounded-2xl bg-gray-50 border border-dashed border-gray-200 text-center">
                      <p className="text-gray-500">هنوز مطلبی توسط این نویسنده منتشر نشده است.</p>
                    </div>
                  )}
                </section>
              )}
            </div>

            <aside className="lg:col-span-4 space-y-6">
              <div className="sticky top-28 space-y-6">
                <section className="bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-500 text-white rounded-3xl overflow-hidden shadow-xl shadow-teal-500/20 p-6 sm:p-7">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck size={18} />
                    <h3 className="font-black text-lg">آیا به مشاوره پزشکی نیاز دارید؟</h3>
                  </div>
                  <p className="text-sm text-white/90 leading-relaxed mb-5">
                    تیم پرستاری و پزشکی سالمندیار آماده پاسخگویی و ارائه خدمات پرستاری در منزل در ۲۴ ساعت شبانه‌روز هستند.
                  </p>
                  <div className="space-y-2.5">
                    <Link
                      href="/portal/home-care/request"
                      className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-2xl bg-white text-teal-700 font-black hover:bg-yellow-50 transition shadow"
                    >
                      <Phone size={16} /> درخواست فوری خدمات
                    </Link>
                    <a
                      href="tel:02112345678"
                      className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-2xl bg-white/15 backdrop-blur border border-white/30 text-white font-black hover:bg-white/25 transition"
                    >
                      تماس تلفنی ۰۲۱-۱۲۳۴۵۶۷۸
                    </a>
                  </div>
                </section>

                <section className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                  <h3 className="font-black text-xl text-gray-900 mb-4">سایر نویسندگان تیم</h3>
                  <div className="space-y-3">
                    {allAuthors
                      .filter(ot => ot.id !== a.id)
                      .slice(0, 3)
                      .map(ot => (
                        <Link
                          key={ot.id}
                          href={`/authors/${ot.slug}`}
                          className="group flex items-center gap-3 p-2.5 rounded-2xl hover:bg-gray-50 transition"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 overflow-hidden border-2 border-white shadow">
                            {ot.profileImageUrl ? (
                              <img src={ot.profileImageUrl} alt={ot.fullName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><User size={22} className="text-white" /></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-black text-sm text-gray-900 group-hover:text-indigo-700 truncate">
                              {ot.fullName}
                            </div>
                            <div className="text-xs text-gray-500 truncate">{ot.title || ot.specialization}</div>
                          </div>
                          <ArrowLeft size={15} className="text-gray-400 group-hover:text-indigo-600 group-hover:-translate-x-0.5 transition" />
                        </Link>
                      ))}
                  </div>
                </section>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
