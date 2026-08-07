import { Metadata } from 'next';
import Link from 'next/link';
import { Search, ShieldCheck, Award, ChevronLeft, User, BookOpen, FileText, Stethoscope } from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Breadcrumb from '@/components/seo/Breadcrumb';
import { guides } from '@/lib/data/content-data';
import { listAuthors, listArticles } from '@/lib/content-api';

export const metadata: Metadata = {
  title: 'تیم پزشکی و نویسندگان | سالمندیار',
  description: 'آشنایی با تیم متخصص و نویسندگان سالمندیار: پرستاران ارشد، پزشکان عمومی و متخصصان تغذیه با سال‌ها تجربه در حوزه سلامت سالمندی.',
  keywords: ['نویسندگان', 'تیم پزشکی', 'پرستار متخصص', 'متخصص سلامت', 'Medical Reviewers'],
  alternates: { canonical: '/authors' },
  openGraph: {
    title: 'تیم پزشکی و نویسندگان سالمندیار',
    description: 'محتوای سالمندیار توسط تیمی از متخصصان و پزشکان تأیید شده نوشته و بازبینی می‌شود.',
    type: 'website',
    url: '/authors',
  },
};

export default async function AuthorsListPage() {
  const [authorsResult, articlesResult] = await Promise.all([
    listAuthors(),
    listArticles({ pageSize: 200 }),
  ]);
  const authors = authorsResult || [];
  const allArticles = articlesResult?.items || [];
  const reviewers = authors.filter(a => a.isMedicalReviewer);
  const writers = authors.filter(a => !a.isMedicalReviewer);
  const all = [...reviewers, ...writers];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ name: 'تیم پزشکی و نویسندگان', href: '/authors' }]} />

          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 text-teal-700 text-xs font-bold mb-4 border border-teal-100">
              <ShieldCheck size={14} />
              {all.length}+ متخصص و نویسنده فعال
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 leading-tight">
              تیم پزشکی و <span className="text-teal-600">نویسندگان سالمندیار</span>
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
              تمام محتوای علمی و پزشکی سالمندیار توسط تیمی مجرب از پرستاران، پزشکان و متخصصان تغذیه نوشته و بازبینی می‌شود.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 mb-10 border border-gray-100 shadow-sm max-w-3xl mx-auto">
            <div className="relative">
              <Search className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="جستجو در میان نویسندگان و متخصصان..."
                className="w-full h-12 pr-12 pl-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/10 transition text-base"
              />
            </div>
          </div>

          {reviewers.length > 0 && (
            <div className="mb-14">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-teal-500/20">
                  <Stethoscope size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900">تیم تأییدکننده پزشکی (Medical Reviewers)</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    متخصصانی که تمامی محتوای پزشکی سالمندیار را قبل از انتشار بازبینی و تأیید می‌کنند
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviewers.map(author => {
                  const articleCount = allArticles.filter(a => a.authorId === author.id).length;
                  const guideCount = guides.filter(g => g.authorId === author.id).length;
                  return (
                    <Link
                      key={author.id}
                      href={`/authors/${author.slug}`}
                      className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-teal-200 hover:shadow-xl hover:shadow-gray-100 transition-all duration-300"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3">
                        <div className="relative sm:col-span-1 aspect-[4/3] sm:aspect-auto bg-gradient-to-br from-teal-400 via-blue-500 to-indigo-600 overflow-hidden">
                          {author.profileImageUrl ? (
                            <img
                              src={author.profileImageUrl}
                              alt={author.fullName}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User size={60} className="text-white/70" />
                            </div>
                          )}
                          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow flex items-center gap-1">
                            <ShieldCheck size={12} /> Medical Reviewer
                          </div>
                        </div>
                        <div className="sm:col-span-2 p-5 sm:p-6 flex flex-col">
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {author.title && (
                              <span className="inline-block px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-100">
                                {author.title}
                              </span>
                            )}
                            {author.yearsOfExperience && (
                              <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100 flex items-center gap-1">
                                <Award size={11} /> {author.yearsOfExperience}+ سال تجربه
                              </span>
                            )}
                          </div>
                          <h3 className="font-black text-xl sm:text-2xl text-gray-900 group-hover:text-teal-700 transition leading-tight mb-1.5">
                            {author.fullName}
                          </h3>
                          {author.specialization && (
                            <p className="text-sm text-teal-700 font-bold mb-3">{author.specialization}</p>
                          )}
                          {author.biography && (
                            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-4 flex-1">
                              {author.biography}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-50">
                            <div className="flex items-center gap-3 text-xs">
                              <span className="flex items-center gap-1.5 text-gray-600 font-bold">
                                <BookOpen size={14} /> {articleCount} مقاله
                              </span>
                              <span className="flex items-center gap-1.5 text-gray-600 font-bold">
                                <FileText size={14} /> {guideCount} راهنما
                              </span>
                            </div>
                            <span className="flex items-center gap-1 font-bold text-teal-600 text-sm group-hover:-translate-x-1 transition-transform">
                              مشاهده صفحه <ChevronLeft size={15} />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {writers.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <Award size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900">نویسندگان محتوای تخصصی</h2>
                  <p className="text-sm text-gray-500 mt-0.5">تیمی از کارشناسان، محققان و فعالان حوزه سلامت</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {writers.map(author => {
                  const articleCount = allArticles.filter(a => a.authorId === author.id).length;
                  const guideCount = guides.filter(g => g.authorId === author.id).length;
                  return (
                    <Link
                      key={author.id}
                      href={`/authors/${author.slug}`}
                      className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-amber-200 hover:shadow-xl hover:shadow-gray-100 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4 p-5 sm:p-6 border-b border-gray-50">
                        <div className="relative w-20 h-20 rounded-3xl shrink-0 bg-gradient-to-br from-amber-400 to-orange-500 overflow-hidden border-2 border-white shadow-lg">
                          {author.profileImageUrl ? (
                            <img src={author.profileImageUrl} alt={author.fullName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><User size={32} className="text-white/90" /></div>
                          )}
                        </div>
                        <div className="min-w-0">
                          {author.title && (
                            <p className="text-[11px] font-bold text-amber-700 mb-1">{author.title}</p>
                          )}
                          <h3 className="font-black text-xl text-gray-900 group-hover:text-amber-700 transition truncate leading-tight">
                            {author.fullName}
                          </h3>
                          {author.specialization && (
                            <p className="text-xs text-gray-600 font-bold mt-0.5 truncate">{author.specialization}</p>
                          )}
                        </div>
                      </div>
                      <div className="p-5 sm:p-6">
                        {author.biography && (
                          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-4">
                            {author.biography}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5 text-xs font-bold text-gray-500">
                            <span>{articleCount + guideCount} اثر منتشر</span>
                          </div>
                          <span className="flex items-center gap-1 text-sm font-bold text-amber-700 group-hover:-translate-x-1 transition-transform">
                            مشاهده <ChevronLeft size={15} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-16 bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4 leading-tight">
                  می‌خواهید به تیم <span className="text-teal-600">نویسندگان سالمندیار</span> بپیوندید؟
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  اگر پزشک، پرستار، متخصص تغذیه یا فعال حوزه سلامت هستید و تمایل دارید با ما در تولید محتوای علمی، معتبر و رایگان برای مردم همکاری کنید، با ما در ارتباط باشید.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="mailto:hr@salmandyar.com"
                    className="inline-flex items-center justify-center h-12 px-7 rounded-xl bg-gradient-to-l from-teal-500 to-teal-600 text-white font-bold hover:shadow-lg hover:shadow-teal-500/20 transition"
                  >
                    ارسال رزومه
                  </a>
                  <a
                    href="tel:02112345678"
                    className="inline-flex items-center justify-center h-12 px-7 rounded-xl bg-gray-50 text-gray-800 font-bold border border-gray-200 hover:bg-gray-100 transition"
                  >
                    تماس با منابع انسانی
                  </a>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-3xl bg-teal-50 border border-teal-100 text-center">
                  <div className="text-3xl font-black text-teal-700 mb-1">{all.length}+</div>
                  <div className="text-sm font-bold text-teal-800/80">متخصص فعال</div>
                </div>
                <div className="p-5 rounded-3xl bg-blue-50 border border-blue-100 text-center">
                  <div className="text-3xl font-black text-blue-700 mb-1">{reviewers.length}+</div>
                  <div className="text-sm font-bold text-blue-800/80">تأییدکننده پزشکی</div>
                </div>
                <div className="p-5 rounded-3xl bg-amber-50 border border-amber-100 text-center">
                  <div className="text-3xl font-black text-amber-700 mb-1">{allArticles.length}+</div>
                  <div className="text-sm font-bold text-amber-800/80">مقاله منتشر شده</div>
                </div>
                <div className="p-5 rounded-3xl bg-rose-50 border border-rose-100 text-center">
                  <div className="text-3xl font-black text-rose-700 mb-1">100%</div>
                  <div className="text-sm font-bold text-rose-800/80">محتوای تأیید شده</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
