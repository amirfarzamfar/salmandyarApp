import Link from 'next/link';
import { ArrowLeft, Clock, Eye, CheckCircle2, ShieldCheck } from 'lucide-react';
import { getFeaturedArticles } from '@/lib/content-api';
import type { Article } from '@/lib/types/content';

function formatDate(dateStr?: string | Date) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    return '';
  }
}

export default async function RecentArticlesSection() {
  const articles = await getFeaturedArticles(4);
  const featuredArticles = articles?.length ? articles : [];
  const featured = featuredArticles[0];
  const rest = featuredArticles.slice(1, 4);

  if (!featured) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-b from-white to-slate-50 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 text-teal-700 text-xs font-bold mb-4 border border-teal-100">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              مجله سلامت سالمندیار
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-tight">
              آخرین مقالات <span className="text-teal-600">تخصصی سلامت</span>
            </h2>
            <p className="text-gray-600 max-w-xl leading-relaxed">
              مقالات علمی و تخصصی مراقبت در منزل، تأیید شده توسط تیم پزشکی و پرستاری سالمندیار
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-sm">
              <ShieldCheck size={16} className="text-teal-500" />
              <span>تأیید علمی مقالات</span>
            </div>
            <Link href="/articles" className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm bg-gray-900 text-white hover:bg-gray-800 transition shadow-lg shadow-gray-900/10">
              همه مقالات
              <ArrowLeft size={16} />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <FeaturedCard article={featured} />
          <div className="lg:col-span-5 flex flex-col gap-5">
            {rest.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-white rounded-2xl border border-gray-100">
          <Badge icon={<CheckCircle2 size={20} className="text-teal-500" />} title="تأیید پزشکی" desc="بررسی توسط متخصص" />
          <Badge icon={<Clock size={20} className="text-orange-500" />} title="بروزرسانی منظم" desc="محتوای روزانه" />
          <Badge icon={<Eye size={20} className="text-blue-500" />} title="۱۲,۰۰۰+" desc="بازدید ماهانه" />
          <Badge icon={<ShieldCheck size={20} className="text-purple-500" />} title="منابع معتبر" desc="بر اساس منابع علمی" />
        </div>
      </div>
    </section>
  );
}

function FeaturedCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="lg:col-span-7 group relative rounded-3xl overflow-hidden bg-white border border-gray-100 hover:border-teal-200 hover:shadow-2xl hover:shadow-teal-100/50 transition-all duration-500 min-h-[450px] flex flex-col"
    >
      <div className="relative overflow-hidden aspect-[16/9] bg-gradient-to-br from-teal-50 to-gray-100">
        {article.featuredImageUrl && (
          <img
            src={article.featuredImageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        <div className="absolute top-4 right-4 flex gap-2 flex-wrap">
          {article.isFeatured && (
            <span className="px-3 py-1.5 rounded-full bg-gradient-to-l from-amber-500 to-orange-500 text-white text-xs font-bold shadow-lg shadow-orange-500/30">
              ✨ مقاله ویژه
            </span>
          )}
          {article.isMedicalContent && (
            <span className="px-3 py-1.5 rounded-full bg-teal-500 text-white text-xs font-bold shadow-lg shadow-teal-500/30 backdrop-blur">
              <ShieldCheck size={12} className="inline ml-1" />
              محتوای پزشکی
            </span>
          )}
          {article.category && (
            <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur text-gray-700 text-xs font-bold">
              {article.category.name}
            </span>
          )}
        </div>

        <div className="absolute bottom-0 right-0 left-0 p-6 text-white">
          <h3 className="text-2xl sm:text-3xl font-black mb-3 leading-tight group-hover:text-teal-100 transition line-clamp-2">
            {article.title}
          </h3>
          <div className="flex items-center gap-4 text-xs text-white/90">
            {article.author && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white/20 border border-white/30 overflow-hidden">
                  {article.author.profileImageUrl ? (
                    <img src={article.author.profileImageUrl} alt={article.author.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold">{article.author.fullName?.[0]}</div>
                  )}
                </div>
                <span className="font-medium">{article.author.fullName}</span>
              </div>
            )}
            <span className="w-1 h-1 rounded-full bg-white/50" />
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {article.estimatedReadingTimeMinutes} دقیقه مطالعه
            </span>
            <span className="w-1 h-1 rounded-full bg-white/50" />
            <span>{formatDate(article.publishedAt)}</span>
          </div>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        {article.shortAnswer && (
          <div className="mb-4 p-4 rounded-2xl bg-gradient-to-br from-teal-50 to-white border border-teal-100">
            <p className="text-xs font-bold text-teal-700 mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 size={14} />
              پاسخ کوتاه
            </p>
            <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{article.shortAnswer}</p>
          </div>
        )}
        {article.excerpt && (
          <p className="text-gray-600 leading-relaxed line-clamp-2 mb-auto">{article.excerpt}</p>
        )}
        <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-50">
          <span className="text-sm font-bold text-teal-600 group-hover:text-teal-700 inline-flex items-center gap-1.5">
            ادامه مطلب
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          </span>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Eye size={14} />
            {article.viewCount?.toLocaleString('fa-IR')} بازدید
          </div>
        </div>
      </div>
    </Link>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group relative flex gap-4 p-4 rounded-2xl bg-white border border-gray-100 hover:border-teal-200 hover:bg-gradient-to-br hover:from-white hover:to-teal-50/30 hover:shadow-xl hover:shadow-gray-100 transition-all duration-300"
    >
      <div className="relative flex-shrink-0 w-32 h-32 sm:w-40 sm:h-32 rounded-2xl overflow-hidden bg-gray-100">
        {article.featuredImageUrl && (
          <img
            src={article.featuredImageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        )}
        {article.isMedicalContent && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center shadow-lg">
            <ShieldCheck size={14} />
          </div>
        )}
      </div>

      <div className="flex flex-col min-w-0 flex-1 py-1">
        <div className="flex items-center gap-2 mb-2">
          {article.category && (
            <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2.5 py-0.5 rounded-full">
              {article.category.name}
            </span>
          )}
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock size={12} />
            {article.estimatedReadingTimeMinutes || 5} دقیقه
          </span>
        </div>

        <h4 className="font-bold text-gray-900 group-hover:text-teal-700 transition leading-snug line-clamp-2 mb-2">
          {article.title}
        </h4>

        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-auto">
          {article.excerpt || article.shortAnswer}
        </p>

        <div className="mt-2 flex items-center justify-between">
          {article.author && (
            <span className="text-xs text-gray-500 truncate">
              توسط <span className="text-gray-700 font-medium">{article.author.fullName}</span>
            </span>
          )}
          <span className="text-xs text-gray-400 whitespace-nowrap mr-2">{formatDate(article.publishedAt)}</span>
        </div>
      </div>
    </Link>
  );
}

function Badge({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="font-bold text-gray-900 text-sm leading-tight">{title}</p>
        <p className="text-xs text-gray-500 truncate">{desc}</p>
      </div>
    </div>
  );
}
