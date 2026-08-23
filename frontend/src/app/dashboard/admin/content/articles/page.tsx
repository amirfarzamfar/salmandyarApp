'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import {
  Plus,
  Eye,
  Search,
  Filter,
  Pencil,
  Trash2,
  Download,
  BarChart3,
  FileText,
  FileEdit,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import {
  articles as mockArticles,
  contentCategories,
  authors,
} from '@/lib/data/content-data';
import adminContentApi, { type ArticleItem } from '@/lib/content-admin-api';
import type { Article, ArticleStatus } from '@/lib/types/content';

const mapApiArticleToUiArticle = (a: ArticleItem): Article => ({
  id: a.id,
  title: a.title,
  slug: a.slug,
  status: (a.status as ArticleStatus) || 'Draft',
  excerpt: a.excerpt ?? undefined,
  content: '',
  shortAnswer: undefined,
  featuredImageUrl: a.featuredImageUrl ?? undefined,
  ogImageUrl: undefined,
  metaTitle: undefined,
  metaDescription: undefined,
  canonicalUrl: undefined,
  primaryKeyword: undefined,
  secondaryKeywords: undefined,
  estimatedReadingTimeMinutes: a.estimatedReadingTimeMinutes ?? undefined,
  viewCount: a.viewCount ?? undefined,
  isFeatured: a.isFeatured,
  isMedicalContent: a.isMedicalContent,
  isFactChecked: a.isFactChecked,
  publishedAt: a.publishedAt ?? a.createdAt,
  lastUpdatedAt: a.updatedAt ?? undefined,
  authorId: a.authorId,
  categoryId: a.categoryId,
  diseaseId: a.diseaseId ?? undefined,
  serviceDefinitionId: a.serviceDefinitionId ?? undefined,
  author: a.author
    ? {
        id: a.author.id,
        firstName: a.author.firstName,
        lastName: a.author.lastName,
        fullName: `${a.author.firstName} ${a.author.lastName}`,
        title: a.author.title ?? undefined,
        specialization: a.author.title ?? undefined,
        biography: undefined,
        experienceSummary: undefined,
        yearsOfExperience: undefined,
        profileImageUrl: undefined,
        medicalLicenseNumber: undefined,
        email: undefined,
        slug: undefined,
        isMedicalReviewer: !!a.author.title,
      }
    : undefined,
  category: a.category
    ? {
        id: a.category.id,
        name: a.category.name,
        slug: a.category.slug,
        description: undefined,
        parentId: undefined,
        displayOrder: 0,
        isActive: true,
        showInMenu: false,
      }
    : undefined,
});

export default function ArticlesAdminPage() {
  const [articles, setArticles] = useState<Article[]>(mockArticles);
  const [loading, setLoading] = useState(true);
  const [serverTotal, setServerTotal] = useState<number>(mockArticles.length);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [medicalReviewFilter, setMedicalReviewFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const loadArticles = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const params: {
        page?: number; pageSize?: number; search?: string; categoryId?: number; status?: string;
      } = {
        page: currentPage,
        pageSize: 100,
      };
      if (search.trim()) params.search = search.trim();
      if (categoryFilter !== 'all') params.categoryId = Number(categoryFilter);
      if (statusFilter !== 'all') params.status = statusFilter;
      const res = await adminContentApi.listArticles(params);
      const items = res?.items ?? [];
      if (items.length > 0) {
        setArticles(items.map(mapApiArticleToUiArticle));
        setServerTotal(res.total ?? items.length);
      } else {
        setArticles(mockArticles);
        setServerTotal(mockArticles.length);
      }
    } catch (err: any) {
      setArticles(mockArticles);
      setServerTotal(mockArticles.length);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const metrics = useMemo(() => {
    const totalCount = articles.length;
    const publishedCount = articles.filter((a) => a.status === 'Published').length;
    const draftCount = articles.filter((a) => a.status === 'Draft' || a.status === 'PendingReview').length;
    const totalViews = articles.reduce((sum, a) => sum + (a.viewCount || 0), 0);
    return { totalCount, publishedCount, draftCount, totalViews };
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const query = search.trim().toLowerCase();
      const matchesQuery =
        !query ||
        article.title.toLowerCase().includes(query) ||
        (article.excerpt || '').toLowerCase().includes(query) ||
        article.slug.toLowerCase().includes(query) ||
        (article.author?.fullName || '').toLowerCase().includes(query);

      const matchesCategory =
        categoryFilter === 'all' || String(article.categoryId) === categoryFilter;

      const matchesStatus =
        statusFilter === 'all' || article.status === statusFilter;

      const hasApprovedReview = (article.medicalReviews || []).some((r) => r.isApproved);
      const hasPendingReview = (article.medicalReviews || []).some((r) => !r.isApproved);
      const matchesMedicalReview =
        medicalReviewFilter === 'all' ||
        (medicalReviewFilter === 'approved' && hasApprovedReview) ||
        (medicalReviewFilter === 'pending' && (hasPendingReview || !article.medicalReviews?.length));

      return matchesQuery && matchesCategory && matchesStatus && matchesMedicalReview;
    });
  }, [articles, search, categoryFilter, statusFilter, medicalReviewFilter]);

  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredArticles.slice(start, start + pageSize);
  }, [filteredArticles, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / pageSize));

  const formatDate = (date?: string) => {
    if (!date) return '—';
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      dateStyle: 'medium',
    }).format(new Date(date));
  };

  const getStatusBadge = (status: ArticleStatus) => {
    switch (status) {
      case 'Published':
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
            منتشرشده
          </Badge>
        );
      case 'Draft':
        return (
          <Badge variant="secondary" className="bg-slate-100 text-slate-700">
            پیش‌نویس
          </Badge>
        );
      case 'PendingReview':
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
            در انتظار بررسی
          </Badge>
        );
      case 'Archived':
        return (
          <Badge className="bg-rose-100 text-rose-700 border-rose-200">
            آرشیو شده
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMedicalBadge = (article: Article) => {
    const approved = (article.medicalReviews || []).find((r) => r.isApproved);
    if (approved) {
      return (
        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
          تأیید شده پزشکی
        </Badge>
      );
    }
    return (
      <Badge className="bg-amber-100 text-amber-700 border-amber-200">
        در انتظار بررسی
      </Badge>
    );
  };

  const handleDelete = async (id: number) => {
    if (!confirm('آیا از حذف این مقاله اطمینان دارید؟')) return;
    try {
      await adminContentApi.deleteArticle(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
      toast.success('مقاله با موفقیت حذف شد');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'خطا در حذف مقاله';
      toast.error(msg);
    }
  };

  const handleTogglePublish = async (article: Article) => {
    const shouldPublish = article.status !== 'Published';
    try {
      if (shouldPublish) {
        await adminContentApi.publishArticle(article.id);
      } else {
        await adminContentApi.unpublishArticle(article.id);
      }
      const newStatus: ArticleStatus = shouldPublish ? 'Published' : 'Draft';
      setArticles((prev) =>
        prev.map((a) => (a.id === article.id ? { ...a, status: newStatus } : a))
      );
      toast.success(shouldPublish ? 'مقاله منتشر شد' : 'مقاله از حالت انتشار خارج شد');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'خطا در تغییر وضعیت انتشار';
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">مدیریت مقالات</h1>
          <p className="mt-2 text-sm text-gray-500">
            انتشار، ویرایش و مدیریت محتوای مجله سلامت
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/articles" target="_blank">
            <Button variant="ghost" size="sm">
              <Eye className="ml-2 h-4 w-4" />
              پیش‌نمایش مجله
            </Button>
          </Link>
          <Link href="/dashboard/admin/content/articles/create">
            <Button size="sm">
              <Plus className="ml-2 h-4 w-4" />
              نوشتن مقاله جدید
            </Button>
          </Link>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="کل مقالات"
          value={metrics.totalCount}
          icon={<FileText className="h-5 w-5 text-teal-600" />}
          colorClass="bg-teal-50"
        />
        <MetricCard
          title="مقالات منتشرشده"
          value={metrics.publishedCount}
          icon={<Eye className="h-5 w-5 text-emerald-600" />}
          colorClass="bg-emerald-50"
        />
        <MetricCard
          title="پیش‌نویس‌ها"
          value={metrics.draftCount}
          icon={<FileEdit className="h-5 w-5 text-amber-600" />}
          colorClass="bg-amber-50"
        />
        <MetricCard
          title="بازدید کل ماهانه"
          value={metrics.totalViews.toLocaleString('fa-IR')}
          icon={<BarChart3 className="h-5 w-5 text-blue-600" />}
          colorClass="bg-blue-50"
        />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid gap-3 flex-1 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative sm:col-span-2">
              <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="جستجو در عنوان، خلاصه، نویسنده..."
                className="w-full rounded-2xl border border-gray-200 bg-white py-2.5 pr-9 pl-3 text-sm outline-none focus:border-teal-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-500"
            >
              <option value="all">همه دسته‌بندی‌ها</option>
              {contentCategories.map((cat) => (
                <option key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-500"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="Published">منتشرشده</option>
              <option value="Draft">پیش‌نویس</option>
              <option value="Archived">آرشیو</option>
            </select>

            <select
              value={medicalReviewFilter}
              onChange={(e) => {
                setMedicalReviewFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-500"
            >
              <option value="all">همه بررسی‌های پزشکی</option>
              <option value="approved">تأییدشده</option>
              <option value="pending">در انتظار</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="ml-2 h-4 w-4" />
              فیلترها
            </Button>
            <Button variant="secondary" size="sm">
              <Download className="ml-2 h-4 w-4" />
              خروجی اکسل
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {filteredArticles.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-black text-gray-900 mb-1">مقاله‌ای یافت نشد</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              با تغییر فیلترها یا جستجوی عبارت دیگر، نتیجه بیشتری پیدا کنید.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3.5 font-bold text-slate-600 text-xs whitespace-nowrap">ردیف</th>
                    <th className="px-4 py-3.5 font-bold text-slate-600 text-xs whitespace-nowrap">عنوان مقاله</th>
                    <th className="px-4 py-3.5 font-bold text-slate-600 text-xs whitespace-nowrap">دسته‌بندی</th>
                    <th className="px-4 py-3.5 font-bold text-slate-600 text-xs whitespace-nowrap">نویسنده</th>
                    <th className="px-4 py-3.5 font-bold text-slate-600 text-xs whitespace-nowrap">بررسی پزشکی</th>
                    <th className="px-4 py-3.5 font-bold text-slate-600 text-xs whitespace-nowrap">وضعیت</th>
                    <th className="px-4 py-3.5 font-bold text-slate-600 text-xs whitespace-nowrap">بازدید</th>
                    <th className="px-4 py-3.5 font-bold text-slate-600 text-xs whitespace-nowrap">تاریخ انتشار</th>
                    <th className="px-4 py-3.5 font-bold text-slate-600 text-xs whitespace-nowrap">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedArticles.map((article, index) => {
                    const globalIndex = (currentPage - 1) * pageSize + index + 1;
                    return (
                      <tr key={article.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3.5 text-slate-500 font-bold text-xs whitespace-nowrap">
                          #{globalIndex}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3 min-w-[240px]">
                            {article.featuredImageUrl ? (
                              <img
                                src={article.featuredImageUrl}
                                alt={article.title}
                                className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-slate-200"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                                <FileText className="h-5 w-5 text-slate-400" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-bold text-gray-900 truncate max-w-[280px] hover:text-teal-600">
                                {article.title}
                              </div>
                              <div className="text-xs text-slate-400 mt-0.5 font-mono truncate" dir="ltr">
                                /articles/{article.slug}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                            {article.category?.name ||
                              contentCategories.find((c) => c.id === article.categoryId)?.name ||
                              '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-sm text-slate-700 font-bold">
                          {article.author?.fullName ||
                            authors.find((a) => a.id === article.authorId)?.fullName ||
                            '—'}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {getMedicalBadge(article)}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {getStatusBadge(article.status)}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap font-bold text-slate-700">
                          {(article.viewCount || 0).toLocaleString('fa-IR')}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-slate-600 text-xs font-bold">
                          {formatDate(article.publishedAt)}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Link
                              href={`/articles/${article.slug}`}
                              target="_blank"
                              title="پیش‌نمایش"
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-teal-600 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              href={`/dashboard/admin/content/articles/create?edit=${article.id}`}
                              title="ویرایش"
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors"
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>
                            <button
                              type="button"
                              title={article.status === 'Published' ? 'لغو انتشار' : 'انتشار'}
                              onClick={() => handleTogglePublish(article)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-emerald-600 transition-colors"
                            >
                              {article.status === 'Published' ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              type="button"
                              title="حذف"
                              onClick={() => handleDelete(article.id)}
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="border-t border-slate-200 px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-500">
                  نمایش {((currentPage - 1) * pageSize) + 1} تا{' '}
                  {Math.min(currentPage * pageSize, filteredArticles.length)} از{' '}
                  {filteredArticles.length.toLocaleString('fa-IR')} مقاله
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-40 hover:bg-slate-50 disabled:hover:bg-transparent transition-colors"
                  >
                    قبلی
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[34px] h-[34px] px-2 rounded-xl text-xs font-bold transition-colors ${
                        page === currentPage
                          ? 'bg-teal-600 text-white shadow-sm'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 disabled:opacity-40 hover:bg-slate-50 disabled:hover:bg-transparent transition-colors"
                  >
                    بعدی
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  colorClass = 'bg-gray-50',
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  colorClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-bold text-gray-500">{title}</div>
          <div className="mt-2 text-3xl font-black text-gray-900">{value}</div>
        </div>
        <div className={`rounded-2xl ${colorClass} p-3`}>{icon}</div>
      </div>
    </div>
  );
}
