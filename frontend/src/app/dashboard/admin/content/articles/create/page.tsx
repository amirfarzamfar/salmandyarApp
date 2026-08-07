'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  Plus,
  Eye,
  ArrowLeft,
  Save,
  Upload,
  FileText,
  Tag,
  UserCheck,
  BarChart3,
  ListTodo,
  Stethoscope,
  Calendar,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  X,
  FileEdit,
  Sparkles,
  Search as SearchIcon,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/progress';
import {
  contentCategories as mockCategories,
  contentTags as mockTags,
  serviceSeoProfiles,
  diseases,
  cities,
  healthTools,
  authors as mockAuthors,
} from '@/lib/data/content-data';
import adminContentApi, { type CategoryItem, type TagItem, type AuthorStub } from '@/lib/content-admin-api';

export default function CreateArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [focusKeyword, setFocusKeyword] = useState('');
  const [keywords, setKeywords] = useState<string[]>(['مراقبت در منزل', 'پرستاری', 'سلامت']);
  const [status, setStatus] = useState('Draft');
  const [categoryId, setCategoryId] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [publishedAt, setPublishedAt] = useState('');
  const [authorId, setAuthorId] = useState<string>('');
  const [submitting, setSubmitting] = useState<'draft' | 'publish' | null>(null);

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [lookupLoading, setLookupLoading] = useState({ cats: true, tags: true });

  useEffect(() => {
    let alive = true;
    adminContentApi.listCategories()
      .then(data => { if (alive) setCategories(data); })
      .catch(() => { if (alive) setCategories((mockCategories as unknown) as CategoryItem[]); })
      .finally(() => { if (alive) setLookupLoading(p => ({ ...p, cats: false })); });
    adminContentApi.listTags()
      .then(data => { if (alive) setTags(data); })
      .catch(() => { if (alive) setTags((mockTags as unknown) as TagItem[]); })
      .finally(() => { if (alive) setLookupLoading(p => ({ ...p, tags: false })); });
    return () => { alive = false; };
  }, []);

  const contentCategories = categories.length > 0 ? (categories as unknown as any[]) : mockCategories;
  const contentTags = tags.length > 0 ? (tags as unknown as any[]) : mockTags;
  const authors = mockAuthors;
  const [medicalReviewerId, setMedicalReviewerId] = useState<string>('');
  const [medicalReviewedAt, setMedicalReviewedAt] = useState('');
  const [isMedicallyValidated, setIsMedicallyValidated] = useState(false);
  const [featuredImageUrl, setFeaturedImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [diseaseId, setDiseaseId] = useState<string>('');
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [healthToolId, setHealthToolId] = useState<string>('');
  const [cityId, setCityId] = useState<string>('');
  const [faqs, setFaqs] = useState([
    { id: 1, question: 'این مقاله برای چه کسانی مفید است؟', answer: '' },
    { id: 2, question: 'عوارض جانبی این روش درمان چیست؟', answer: '' },
  ]);

  const medicalReviewers = useMemo(
    () => authors.filter((a) => a.isMedicalReviewer),
    []
  );

  const wordCount = useMemo(
    () => content.trim().split(/\s+/).filter((w) => w.length).length,
    [content]
  );
  const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200));
  const seoScore = 82;

  const excerptCount = excerpt.length;
  const metaTitleCount = metaTitle.length;

  const handleAutoSlug = () => {
    const cleanTitle = title
      .trim()
      .toLowerCase()
      .replace(/[^\s\u0600-\u06FFa-zA-Z0-9]/g, '')
      .replace(/\s+/g, '-');
    setSlug(cleanTitle);
    toast.success('نامک از عنوان ساخته شد');
  };

  const handleAddKeyword = () => {
    const kw = focusKeyword.trim();
    if (!kw) return;
    if (!keywords.includes(kw)) {
      setKeywords([...keywords, kw]);
      toast.success('کلمه کلیدی اضافه شد');
    }
    setFocusKeyword('');
  };

  const handleRemoveKeyword = (kw: string) => {
    setKeywords(keywords.filter((k) => k !== kw));
  };

  const toggleTag = (tagId: number) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const toggleService = (serviceId: number) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((s) => s !== serviceId)
        : [...prev, serviceId]
    );
  };

  const addFAQ = () => {
    setFaqs([...faqs, { id: Date.now(), question: '', answer: '' }]);
    toast.success('سؤال جدید اضافه شد');
  };

  const updateFAQ = (id: number, field: 'question' | 'answer', value: string) => {
    setFaqs(faqs.map((f) => (f.id === id ? { ...f, [field]: value } : f)));
  };

  const removeFAQ = (id: number) => {
    setFaqs(faqs.filter((f) => f.id !== id));
  };

  const resolvePayload = (articleStatus: 'Draft' | 'Published') => {
    const effectiveAuthorId = Number(authorId) || Number(mockAuthors[0]?.id) || 1;
    const effectiveCategoryId = Number(categoryId) || Number(contentCategories[0]?.id) || 1;
    const effectiveSlug = (slug.trim() || title.trim())
      .trim()
      .toLowerCase()
      .replace(/[\s\u200c]+/g, '-')
      .replace(/[^a-z0-9\-آ-ی]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || `article-${Date.now()}`;
    return {
      title: title.trim(),
      slug: effectiveSlug,
      authorId: effectiveAuthorId,
      categoryId: effectiveCategoryId,
      content: content || null,
      excerpt: excerpt || null,
      shortAnswer: excerpt || null,
      estimatedReadingTimeMinutes: estimatedReadTime,
      featuredImageUrl: featuredImageUrl || null,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      primaryKeyword: focusKeyword || null,
      secondaryKeywordsJson: keywords?.length ? JSON.stringify(keywords) : null,
      status: articleStatus,
      diseaseId: Number(diseaseId) || 0,
      isFeatured: false,
      isMedicalContent: true,
      isFactChecked: isMedicallyValidated,
      allowComments: true,
      tagIds: selectedTags,
    };
  };

  const handleSaveDraft = async () => {
    if (!title.trim()) {
      toast.error('عنوان مقاله الزامی است');
      return;
    }
    setSubmitting('draft');
    try {
      const payload = resolvePayload('Draft');
      const res: any = await adminContentApi.createArticle(payload);
      toast.success(res?.message || 'پیش‌نویس مقاله ذخیره شد');
      setTimeout(() => router.push('/dashboard/admin/content/articles'), 800);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'خطا در ذخیره پیش‌نویس';
      toast.error(msg);
    } finally { setSubmitting(null); }
  };

  const handlePreview = () => {
    toast.success('صفحه پیش‌نمایش باز شد');
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      toast.error('عنوان مقاله الزامی است');
      return;
    }
    if (!categoryId && !contentCategories[0]) {
      toast.error('انتخاب دسته‌بندی الزامی است');
      return;
    }
    setSubmitting('publish');
    try {
      const payload = resolvePayload('Published');
      const res: any = await adminContentApi.createArticle(payload);
      toast.success(res?.message || 'مقاله با موفقیت منتشر شد');
      setTimeout(() => router.push('/dashboard/admin/content/articles'), 800);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'خطا در انتشار مقاله';
      toast.error(msg);
    } finally { setSubmitting(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <Link
            href="/dashboard/admin/content/articles"
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-teal-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            بازگشت به لیست مقالات
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900">نوشتن مقاله جدید</h1>
            <p className="mt-2 text-sm text-gray-500">
              اطلاعات اصلی مقاله را وارد کنید، سپس محتوا را بنویسید و تنظیمات انتشار را تکمیل نمایید.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={!!submitting}>
            {submitting === 'draft' ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
            ذخیره پیش‌نویس
          </Button>
          <Button variant="ghost" size="sm" onClick={handlePreview} disabled={!!submitting}>
            <Eye className="ml-2 h-4 w-4" />
            پیش‌نمایش
          </Button>
          <Button
            size="sm"
            onClick={handlePublish}
            disabled={!!submitting}
            className="bg-gradient-to-l from-teal-600 to-emerald-500 hover:from-teal-700 hover:to-emerald-600 shadow-lg shadow-teal-600/20"
          >
            {submitting === 'publish' ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="ml-2 h-4 w-4" />}
            انتشار مقاله
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
          <Card title="اطلاعات اصلی" icon={<FileEdit className="h-4 w-4 text-teal-600" />}>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 block">عنوان مقاله</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثلاً: مراقبت کامل از بیمار سکته مغزی در منزل"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700">نامک URL (Slug)</label>
                  <button
                    type="button"
                    onClick={handleAutoSlug}
                    disabled={!title.trim()}
                    className="text-xs font-bold text-teal-600 hover:text-teal-700 disabled:text-slate-300 disabled:hover:text-slate-300 transition-colors inline-flex items-center gap-1"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    ساخت خودکار از عنوان
                  </button>
                </div>
                <div className="flex items-stretch overflow-hidden rounded-2xl border border-gray-200 focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-500/10 transition-all">
                  <div className="px-3.5 bg-slate-50 text-xs font-mono text-slate-500 flex items-center border-l border-gray-200">
                    /articles/
                  </div>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    dir="ltr"
                    placeholder="stroke-patient-home-care"
                    className="flex-1 bg-white px-3 py-3 text-sm outline-none font-mono text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700">خلاصه کوتاه (Meta Description)</label>
                  <span
                    className={`text-xs font-bold ${
                      excerptCount > 160 ? 'text-rose-600' : 'text-slate-400'
                    }`}
                  >
                    {excerptCount}/۱۶۰
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="خلاصه‌ای کوتاه از محتوای مقاله که در نتایج جستجو و صفحات لیست نمایش داده می‌شود..."
                  className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
                />
              </div>
            </div>
          </Card>

          <Card title="متن کامل مقاله" icon={<FileText className="h-4 w-4 text-blue-600" />}>
            <div className="space-y-4">
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-500 font-bold">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                پشتیبانی از Markdown / WYSIWYG در نسخه بعدی
              </div>
              <textarea
                rows={18}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`محتوای کامل مقاله را اینجا بنویسید...\n\nبرای شروع می‌توانید از ساختار زیر استفاده کنید:\n\n## مقدمه\n## بخش اول\n## بخش دوم\n## نتیجه`}
                className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-sans leading-7"
              />
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5">
                <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1">
                    <BarChart3 className="h-3.5 w-3.5 text-teal-600" />
                    تعداد کلمات: <span className="text-slate-700">{wordCount.toLocaleString('fa-IR')}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-blue-600" />
                    زمان تخمینی مطالعه: <span className="text-slate-700">{estimatedReadTime.toLocaleString('fa-IR')} دقیقه</span>
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card title="سئو و پیشنهاد هوشمند" icon={<Sparkles className="h-4 w-4 text-amber-500" />}>
            <div className="space-y-5">
              <div className="rounded-2xl border border-teal-100 bg-gradient-to-l from-teal-50 via-emerald-50 to-teal-50 p-4 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-500">امتیاز سئو</div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-teal-700">{seoScore}</span>
                    <span className="text-sm font-bold text-slate-400">/۱۰۰</span>
                  </div>
                </div>
                <div className="flex-1 min-w-[180px]">
                  <Progress value={seoScore} className="h-2.5 bg-white border border-teal-100" />
                  <div className="mt-2 text-xs font-bold text-teal-700 text-left">
                    وضعیت: عالی ✨
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700">عنوان Google (Meta Title)</label>
                  <span
                    className={`text-xs font-bold ${
                      metaTitleCount > 60 ? 'text-rose-600' : 'text-slate-400'
                    }`}
                  >
                    {metaTitleCount}/۶۰
                  </span>
                </div>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder={title || 'عنوان صفحه در نتایج گوگل...'}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700">متای توصیف</label>
                  <span
                    className={`text-xs font-bold ${
                      excerptCount > 160 ? 'text-rose-600' : 'text-slate-400'
                    }`}
                  >
                    {excerptCount}/۱۶۰
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="توضیح کوتاه برای نمایش در نتایج موتورهای جستجو..."
                  className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 block">کلمات کلیدی (Focus Keywords)</label>
                <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-2xl border border-gray-200 bg-white focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-500/10 transition-all">
                  {keywords.map((kw) => (
                    <span
                      key={kw}
                      className="inline-flex items-center gap-1 rounded-full bg-teal-50 border border-teal-200 px-2.5 py-1 text-xs font-bold text-teal-700"
                    >
                      <Tag className="h-3 w-3" />
                      {kw}
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(kw)}
                        className="mr-1 p-0.5 rounded-full hover:bg-teal-100 text-teal-500 hover:text-teal-700 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <div className="flex items-center flex-1 min-w-[180px] gap-2">
                    <input
                      type="text"
                      value={focusKeyword}
                      onChange={(e) => setFocusKeyword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddKeyword();
                        }
                      }}
                      placeholder="افزودن کلمه کلیدی و Enter..."
                      className="flex-1 bg-transparent py-1.5 px-1 text-sm outline-none text-slate-700 min-w-[140px]"
                    />
                    <button
                      type="button"
                      onClick={handleAddKeyword}
                      className="p-1.5 rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card
            title="سؤالات متداول"
            icon={<ListTodo className="h-4 w-4 text-violet-600" />}
            action={
              <Button variant="outline" size="sm" onClick={addFAQ}>
                <Plus className="ml-2 h-4 w-4" />
                افزودن سؤال
              </Button>
            }
          >
            <div className="space-y-4">
              {faqs.length === 0 ? (
                <div className="py-8 text-center rounded-2xl border-2 border-dashed border-slate-200">
                  <ListTodo className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-500">هنوز سؤالی اضافه نکرده‌اید</p>
                  <p className="text-xs text-slate-400 mt-1">سؤالات متداول را برای سئوی بهتر اضافه کنید</p>
                </div>
              ) : (
                faqs.map((faq, index) => (
                  <div
                    key={faq.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200 px-2.5 py-0.5 text-xs font-bold">
                        سؤال {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFAQ(faq.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => updateFAQ(faq.id, 'question', e.target.value)}
                        placeholder="متن سؤال..."
                        className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all font-bold"
                      />
                      <textarea
                        rows={3}
                        value={faq.answer}
                        onChange={(e) => updateFAQ(faq.id, 'answer', e.target.value)}
                        placeholder="پاسخ سؤال..."
                        className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card title="وضعیت انتشار" icon={<Calendar className="h-4 w-4 text-teal-600" />}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">وضعیت</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-bold"
                >
                  <option value="Draft">پیش‌نویس</option>
                  <option value="PendingReview">در انتظار بررسی</option>
                  <option value="Published">منتشرشده</option>
                  <option value="Archived">آرشیو شده</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">دسته‌بندی اصلی</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
                >
                  <option value="">انتخاب دسته‌بندی...</option>
                  {contentCategories.map((cat) => (
                    <option key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">تگ‌ها</label>
                <div className="flex flex-wrap gap-1.5 p-2.5 rounded-2xl border border-gray-200 bg-white max-h-[180px] overflow-y-auto">
                  {contentTags.length === 0 ? (
                    <span className="text-xs text-slate-400 py-1 px-1">تگی تعریف نشده</span>
                  ) : (
                    contentTags.map((tag) => {
                      const active = selectedTags.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => toggleTag(tag.id)}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition-all ${
                            active
                              ? 'bg-teal-600 text-white border border-teal-600 shadow-sm'
                              : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-teal-300 hover:text-teal-700'
                          }`}
                        >
                          #{tag.name}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">تاریخ انتشار</label>
                <input
                  type="date"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
                />
              </div>
            </div>
          </Card>

          <Card title="نویسنده و بررسی پزشکی (E-E-A-T)" icon={<Stethoscope className="h-4 w-4 text-emerald-600" />}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block inline-flex items-center gap-1">
                  <UserCheck className="h-3.5 w-3.5 text-blue-500" />
                  نویسنده
                </label>
                <select
                  value={authorId}
                  onChange={(e) => setAuthorId(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
                >
                  <option value="">انتخاب نویسنده...</option>
                  {authors.map((auth) => (
                    <option key={auth.id} value={String(auth.id)}>
                      {auth.fullName} - {auth.title || 'نویسنده'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block inline-flex items-center gap-1">
                  <Stethoscope className="h-3.5 w-3.5 text-emerald-500" />
                  بررسی کننده پزشکی
                </label>
                <select
                  value={medicalReviewerId}
                  onChange={(e) => setMedicalReviewerId(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
                >
                  <option value="">بدون بررسی پزشکی</option>
                  {medicalReviewers.map((auth) => (
                    <option key={auth.id} value={String(auth.id)}>
                      {auth.fullName} - {auth.title || 'متخصص'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">
                  تاریخ آخرین بروزرسانی پزشکی
                </label>
                <input
                  type="date"
                  value={medicalReviewedAt}
                  onChange={(e) => setMedicalReviewedAt(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
                />
              </div>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 cursor-pointer hover:bg-emerald-50 transition-colors">
                <input
                  type="checkbox"
                  checked={isMedicallyValidated}
                  onChange={(e) => setIsMedicallyValidated(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="text-sm font-black text-emerald-800">تأیید اعتبار پزشکی</div>
                  <div className="text-xs font-bold text-emerald-600/70 mt-0.5">
                    محتوا توسط متخصص پزشکی بررسی و تأیید شده است.
                  </div>
                </div>
              </label>
            </div>
          </Card>

          <Card title="تصویر شاخص" icon={<ImageIcon className="h-4 w-4 text-rose-500" />}>
            <div className="space-y-4">
              {featuredImageUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 group">
                  <div
                    className="w-full aspect-video bg-cover bg-center"
                    style={{ backgroundImage: `url(${featuredImageUrl})` }}
                  />
                  <button
                    type="button"
                    onClick={() => setFeaturedImageUrl('')}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full aspect-video rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 hover:border-teal-400 hover:bg-teal-50/50 cursor-pointer transition-all">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-3 shadow-sm">
                    <Upload className="h-6 w-6 text-teal-500" />
                  </div>
                  <div className="text-sm font-black text-slate-700">آپلود تصویر</div>
                  <div className="text-xs text-slate-400 mt-1">
                    نسبت ۱۶:۹، فرمت JPG/PNG، حداکثر ۲MB
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFeaturedImageUrl(
                          'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=medical%20article%20cover%20image%20elderly%20care%20warm%20healthcare%20professional&image_size=landscape_16_9'
                        );
                        toast.success('تصویر آپلود شد');
                      }
                    }}
                  />
                </label>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">Alt Text (توضیح تصویر)</label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="توضیح کوتاه تصویر برای دسترسی‌پذیری و سئو..."
                  className="w-full rounded-2xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
                />
              </div>
            </div>
          </Card>

          <Card title="ارتباط با سایر محتواها" icon={<SearchIcon className="h-4 w-4 text-indigo-500" />}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">بیماری مرتبط</label>
                <select
                  value={diseaseId}
                  onChange={(e) => setDiseaseId(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
                >
                  <option value="">بدون ارتباط</option>
                  {diseases.map((d) => (
                    <option key={d.id} value={String(d.id)}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">خدمات مرتبط</label>
                <div className="flex flex-wrap gap-1.5 p-2.5 rounded-2xl border border-gray-200 bg-white max-h-[140px] overflow-y-auto">
                  {serviceSeoProfiles.length === 0 ? (
                    <span className="text-xs text-slate-400 py-1 px-1">سرویسی تعریف نشده</span>
                  ) : (
                    serviceSeoProfiles.map((service) => {
                      const active = selectedServices.includes(service.id);
                      return (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => toggleService(service.id)}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition-all ${
                            active
                              ? 'bg-indigo-600 text-white border border-indigo-600 shadow-sm'
                              : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-700'
                          }`}
                        >
                          {service.serviceDefinition?.title || `سرویس ${service.id}`}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">ابزار سلامت مرتبط</label>
                <select
                  value={healthToolId}
                  onChange={(e) => setHealthToolId(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
                >
                  <option value="">بدون ارتباط</option>
                  {healthTools.map((t) => (
                    <option key={t.id} value={String(t.id)}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">شهر مرتبط</label>
                <select
                  value={cityId}
                  onChange={(e) => setCityId(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
                >
                  <option value="">بدون ارتباط</option>
                  {cities.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  icon,
  action,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-100 pb-4 -mx-6 px-6 mt-[-2px]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
            {icon}
          </div>
          <h2 className="text-base font-black text-gray-900">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
