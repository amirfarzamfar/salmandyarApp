'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  Plus,
  Eye,
  ArrowLeft,
  Save,
  FileText,
  Tag,
  UserCheck,
  BarChart3,
  ListTodo,
  Stethoscope,
  AlertCircle,
  CheckCircle2,
  X,
  FileEdit,
  Sparkles,
  Search as SearchIcon,
  Loader2,
  Check,
  RotateCcw,
  SaveAll,
  ExternalLink,
  History,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/progress';
import {
  contentCategories as mockCategories,
  contentTags as mockTags,
  serviceSeoProfiles,
  diseases,
  cities,
  authors as mockAuthors,
} from '@/lib/data/content-data';
import adminContentApi, {
  type CategoryItem,
  type TagItem,
} from '@/lib/content-admin-api';
import RichTextEditor from '@/components/admin/content/RichTextEditor';
import PersianDatePicker from '@/components/admin/content/PersianDatePicker';
import FeaturedImageUploader from '@/components/admin/content/FeaturedImageUploader';
import { safeNumber, formatJalaliDateTime } from '@/lib/utils';
import type { ArticleStatus } from '@/lib/types/content';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

type NestedStub = { Id?: number; id?: number } & Record<string, unknown>;
type RawApiArticle = Record<string, unknown>;
type ApiErrorShape = { response?: { data?: { message?: string } }; message?: string };

function mapApiArticleToFormState(a: RawApiArticle) {
  const tagsRaw = (a.Tags ?? a.tags ?? a.TagIds ?? a.tagIds ?? []) as unknown[];
  const tagIds: number[] = Array.isArray(tagsRaw)
    ? tagsRaw
        .map((t: unknown) =>
          safeNumber(
            typeof t === 'object' && t ? (t as NestedStub).Id ?? (t as NestedStub).id : t,
            0
          )
        )
        .filter(Boolean)
    : [];

  const resolveString = (...keys: (keyof RawApiArticle)[]): string => {
    for (const k of keys) {
      const v = a[k];
      if (v !== null && v !== undefined) return String(v);
    }
    return '';
  };

  const resolveDateIso = (...keys: (keyof RawApiArticle)[]): string | null => {
    for (const k of keys) {
      const v = a[k];
      if (typeof v === 'string' && v) {
        try {
          const d = new Date(v);
          if (!isNaN(d.getTime())) return d.toISOString();
        } catch {
          /* ignore */
        }
      }
    }
    return null;
  };

  const resolveKeywords = (): string[] => {
    const rawSecondary = a.SecondaryKeywordsJson ?? a.secondaryKeywordsJson;
    if (typeof rawSecondary === 'string') {
      try {
        const parsed = JSON.parse(rawSecondary);
        if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
      } catch {
        /* ignore */
      }
    }
    const kws = a.SecondaryKeywords ?? a.secondaryKeywords;
    if (Array.isArray(kws)) return kws.filter(Boolean).map(String);
    return [];
  };

  const resolveServices = (): number[] => {
    const raw = (a.Services ?? a.services ?? a.ServiceIds ?? a.serviceIds ?? []) as unknown[];
    return Array.isArray(raw)
      ? raw
          .map((s: unknown) =>
            safeNumber(
              typeof s === 'object' && s ? (s as NestedStub).Id ?? (s as NestedStub).id : s,
              0
            )
          )
          .filter(Boolean)
      : [];
  };

  return {
    title: resolveString('Title', 'title'),
    slug: resolveString('Slug', 'slug'),
    excerpt: resolveString('Excerpt', 'excerpt', 'MetaDescription', 'metaDescription'),
    content: resolveString('Content', 'content'),
    metaTitle: resolveString('MetaTitle', 'metaTitle'),
    metaDescription: resolveString('MetaDescription', 'metaDescription', 'Excerpt', 'excerpt'),
    focusKeyword: resolveString('PrimaryKeyword', 'primaryKeyword'),
    keywords: resolveKeywords(),
    status: ((a.Status ?? a.status ?? 'Draft') as ArticleStatus),
    categoryId: String(safeNumber(a.CategoryId ?? a.categoryId ?? 0, 0) || ''),
    authorId: String(safeNumber(a.AuthorId ?? a.authorId ?? 0, 0) || ''),
    publishedAtIso: resolveDateIso('PublishedAt', 'publishedAt'),
    featuredImageUrl: resolveString('FeaturedImageUrl', 'featuredImageUrl'),
    imageAlt: resolveString('FeaturedImageAlt', 'featuredImageAlt'),
    diseaseId: String(safeNumber(a.DiseaseId ?? a.diseaseId ?? 0, 0) || ''),
    cityId: String(safeNumber(a.CityId ?? a.cityId ?? 0, 0) || ''),
    isMedicallyValidated: Boolean(a.IsFactChecked ?? a.isFactChecked ?? false),
    medicalReviewerId: String(safeNumber(a.MedicalReviewerId ?? a.medicalReviewerId ?? 0, 0) || ''),
    serviceDefinitionId: safeNumber(a.ServiceDefinitionId ?? a.serviceDefinitionId ?? 0, 0),
    selectedTags: tagIds,
    selectedServices: resolveServices(),
    lastUpdatedAt: (a.UpdatedAt ?? a.updatedAt ?? a.LastUpdatedAt ?? a.lastUpdatedAt ?? null) as string | null,
  };
}

export default function CreateArticlePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editIdRaw = searchParams.get('edit');
  const editId = safeNumber(editIdRaw, 0) || null;

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [focusKeyword, setFocusKeyword] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [status, setStatus] = useState<ArticleStatus>('Draft');
  const [categoryId, setCategoryId] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [publishedAtIso, setPublishedAtIso] = useState<string | null>(null);
  const [authorId, setAuthorId] = useState<string>('');

  const [submitting, setSubmitting] = useState(false);
  const [saveLock, setSaveLock] = useState(false);

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [lookupLoading, setLookupLoading] = useState({ cats: true, tags: true });

  const [loadingArticle, setLoadingArticle] = useState(false);
  const [loadArticleError, setLoadArticleError] = useState<string | null>(null);
  const loadArticleLockRef = useRef(false);
  const aliveRef = useRef(true);
  const didInitSnapshotRef = useRef(false);
  const didFallbackLoadRef = useRef(false);
  const currentFormRef = useRef({ title: '', slug: '', publishedAtIso: null as string | null, featuredImageUrl: '', imageAlt: '' });

  const [medicalReviewerId, setMedicalReviewerId] = useState<string>('');
  const [isMedicallyValidated, setIsMedicallyValidated] = useState(false);
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string>('');
  const [imageAlt, setImageAlt] = useState<string>('');
  const [diseaseId, setDiseaseId] = useState<string>('');
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [cityId, setCityId] = useState<string>('');
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const initialSnapshotRef = useRef<string | null>(null);

  useEffect(() => {
    aliveRef.current = true;
    return () => { aliveRef.current = false; };
  }, []);

  useEffect(() => { currentFormRef.current = { title, slug, publishedAtIso, featuredImageUrl, imageAlt }; }, [title, slug, publishedAtIso, featuredImageUrl, imageAlt]);

  useEffect(() => {
    let alive = true;
    adminContentApi.listCategories()
      .then(data => { if (alive) setCategories(data); })
      .catch(() => { if (alive) setCategories(mockCategories as unknown as CategoryItem[]); })
      .finally(() => { if (alive) setLookupLoading(p => ({ ...p, cats: false })); });
    adminContentApi.listTags()
      .then(data => { if (alive) setTags(data); })
      .catch(() => { if (alive) setTags(mockTags as unknown as TagItem[]); })
      .finally(() => { if (alive) setLookupLoading(p => ({ ...p, tags: false })); });
    return () => { alive = false; };
  }, []);

  const captureSnapshot = useCallback(() => {
    return JSON.stringify({
      title, slug, excerpt, content, metaTitle, metaDescription,
      focusKeyword, keywords, status, categoryId, selectedTags,
      publishedAtIso, authorId, medicalReviewerId, isMedicallyValidated,
      featuredImageUrl, imageAlt, diseaseId, selectedServices, cityId,
    });
  }, [title, slug, excerpt, content, metaTitle, metaDescription,
      focusKeyword, keywords, status, categoryId, selectedTags,
      publishedAtIso, authorId, medicalReviewerId, isMedicallyValidated,
      featuredImageUrl, imageAlt, diseaseId, selectedServices, cityId]);

  useEffect(() => {
    if (editId) return;
    if (didInitSnapshotRef.current) return;
    didInitSnapshotRef.current = true;
    const t = window.setTimeout(() => {
      initialSnapshotRef.current = captureSnapshot();
    }, 0);
    return () => window.clearTimeout(t);
  }, [editId, captureSnapshot]);

  useEffect(() => {
    const snap = captureSnapshot();
    if (initialSnapshotRef.current && snap !== initialSnapshotRef.current) {
      setHasUnsavedChanges(true);
    }
  }, [captureSnapshot]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && saveStatus !== 'saving') {
        e.preventDefault();
        e.returnValue = 'تغییرات ذخیره نشده‌اند. آیا مطمئن هستید می‌خواهید از صفحه خارج شوید؟';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges, saveStatus]);

  const loadArticleForEdit = useCallback(async (id: number, silent = false) => {
    if (loadArticleLockRef.current) return;
    loadArticleLockRef.current = true;
    if (!silent) {
      setLoadingArticle(true);
      setLoadArticleError(null);
    }
    let success = false;
    try {
      const data = (await adminContentApi.getArticle(id)) as RawApiArticle;
      if (!aliveRef.current || !data) {
        if (aliveRef.current) setLoadArticleError('داده مقاله دریافت نشد');
        return;
      }
      const form = mapApiArticleToFormState(data);
      setTitle(form.title);
      setSlug(form.slug);
      setExcerpt(form.excerpt);
      setContent(form.content);
      setMetaTitle(form.metaTitle);
      setMetaDescription(form.metaDescription);
      setFocusKeyword(form.focusKeyword);
      if (form.keywords.length > 0) setKeywords(form.keywords);
      setStatus(form.status);
      setCategoryId(form.categoryId);
      setAuthorId(form.authorId);
      setPublishedAtIso(form.publishedAtIso);
      setFeaturedImageUrl(form.featuredImageUrl);
      setImageAlt(form.imageAlt);
      setDiseaseId(form.diseaseId);
      setCityId(form.cityId);
      setIsMedicallyValidated(form.isMedicallyValidated);
      setMedicalReviewerId(form.medicalReviewerId);
      if (form.selectedTags.length > 0) setSelectedTags(form.selectedTags);
      if (form.selectedServices.length > 0) setSelectedServices(form.selectedServices);
      setLastUpdatedAt(form.lastUpdatedAt);
      if (!silent) toast.success('اطلاعات مقاله برای ویرایش بارگذاری شد');
      success = true;
      window.setTimeout(() => {
        if (!aliveRef.current) return;
        const snap = JSON.stringify({
          title: form.title, slug: form.slug, excerpt: form.excerpt, content: form.content,
          metaTitle: form.metaTitle, metaDescription: form.metaDescription,
          focusKeyword: form.focusKeyword, keywords: form.keywords, status: form.status,
          categoryId: form.categoryId, selectedTags: form.selectedTags,
          publishedAtIso: form.publishedAtIso, authorId: form.authorId,
          medicalReviewerId: form.medicalReviewerId, isMedicallyValidated: form.isMedicallyValidated,
          featuredImageUrl: form.featuredImageUrl, imageAlt: form.imageAlt,
          diseaseId: form.diseaseId, selectedServices: form.selectedServices, cityId: form.cityId,
        });
        initialSnapshotRef.current = snap;
        setHasUnsavedChanges(false);
        didFallbackLoadRef.current = true;
      }, 0);
    } catch (err: unknown) {
      if (!aliveRef.current) return;
      const e = err as ApiErrorShape;
      const msg = e?.response?.data?.message ?? e?.message ?? 'خطا در بارگذاری مقاله';
      setLoadArticleError(msg);
      if (!silent) toast.error(msg);
    } finally {
      if (!silent) setLoadingArticle(false);
      loadArticleLockRef.current = false;
      if (!success && aliveRef.current && id && !didFallbackLoadRef.current && currentFormRef.current.title === '' && currentFormRef.current.slug === '') {
        const rid = id;
        window.setTimeout(() => {
          if (aliveRef.current && !didFallbackLoadRef.current && currentFormRef.current.title === '' && currentFormRef.current.slug === '' && !loadArticleLockRef.current) {
            didFallbackLoadRef.current = true;
            void loadArticleForEdit(rid, true);
          }
        }, 120);
      }
    }
  }, []);

  useEffect(() => {
    if (!editId) return;
    didFallbackLoadRef.current = false;
    const id = editId;
    const t = window.setTimeout(() => loadArticleForEdit(id, false), 0);
    return () => window.clearTimeout(t);
  }, [editId, loadArticleForEdit]);

  useEffect(() => {
    if (!editId) return;
    if (didFallbackLoadRef.current) return;
    if (title !== '' || slug !== '' || content !== '') { didFallbackLoadRef.current = true; return; }
    if (loadingArticle || loadArticleLockRef.current) return;
    const id = editId;
    const t = window.setTimeout(() => {
      if (didFallbackLoadRef.current) return;
      if (title === '' && slug === '' && !loadArticleLockRef.current) {
        didFallbackLoadRef.current = true;
        void loadArticleForEdit(id, true);
      }
    }, 350);
    return () => window.clearTimeout(t);
  }, [editId, title, slug, content, loadingArticle, loadArticleForEdit]);

  const handleRetryLoadArticle = useCallback(() => {
    if (!editId) return;
    loadArticleForEdit(editId, false);
  }, [editId, loadArticleForEdit]);

  const contentCategories: { id: number; name: string }[] =
    categories.length > 0
      ? (categories as unknown as { id: number; name: string }[])
      : mockCategories;
  const contentTags: { id: number; name: string }[] =
    tags.length > 0 ? (tags as unknown as { id: number; name: string }[]) : mockTags;
  const authors = mockAuthors;

  const medicalReviewers = useMemo(
    () => authors.filter((a) => a.isMedicalReviewer),
    [authors]
  );

  const wordCount = useMemo(
    () => content.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter((w) => w.length).length,
    [content]
  );
  const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200));

  const [seoScore, seoSuggestions] = useMemo(() => {
    let score = 30;
    const suggestions: { text: string; ok: boolean }[] = [];

    const titleOk = title.trim().length >= 20 && title.trim().length <= 70;
    if (titleOk) {
      score += 12;
      suggestions.push({ text: 'طول عنوان در محدوده ایده‌آل (۲۰ تا ۷۰ کاراکتر)', ok: true });
    } else {
      suggestions.push({
        text:
        title.trim().length < 20 ? 'عنوان کوتاه‌تر از حد ایده‌آل است' : 'عنوان طولانی‌تر از حد ایده‌آل است',
        ok: false,
      });
    }

    const slugOk = slug.trim().length >= 5 && slug.trim().length <= 80;
    if (slugOk) {
      score += 8;
      suggestions.push({ text: 'Slug مناسب و خوانا تعریف شده است', ok: true });
    } else {
      suggestions.push({ text: 'Slug کوتاه یا طولانی است و بهینه نیست', ok: false });
    }

    const excerptOk = excerpt.trim().length >= 80 && excerpt.trim().length <= 160;
    if (excerptOk) {
      score += 12;
      suggestions.push({ text: 'خلاصه در محدوده ایده‌آل متای توصیف است', ok: true });
    } else {
      suggestions.push({ text: 'خلاصه بین ۸۰ تا ۱۶۰ کاراکتر باشد', ok: false });
    }

    const contentOk = wordCount >= 500;
    if (contentOk) {
      score += wordCount >= 1500 ? 20 : 14;
      suggestions.push({
        text: wordCount >= 1500 ? 'محتوا طولانی و جامع (مناسب سئو عمیق)' : 'طول محتوا قابل قبول است',
        ok: true,
      });
    } else {
      suggestions.push({ text: 'محتوا باید حداقل ۵۰۰ کلمه باشد', ok: false });
    }

    if (/<h2[^>]*>[\s\S]*?<\/h2>/i.test(content)) {
      score += 6;
      suggestions.push({ text: 'ساختار H2 در محتوا استفاده شده است', ok: true });
    } else {
      suggestions.push({ text: 'حداقل یک عنوان H2 در محتوا قرار دهید', ok: false });
    }

    if (featuredImageUrl && imageAlt.trim().length >= 3) {
      score += 8;
      suggestions.push({ text: 'عکس شاخص با Alt مناسب تعریف شده', ok: true });
    } else {
      suggestions.push({ text: 'عکس شاخص با Alt Text مناسب انتخاب کنید', ok: false });
    }

    if (focusKeyword.trim().length >= 3) {
      score += 6;
      suggestions.push({ text: 'کلمه کلیدی اصلی تعریف شده است', ok: true });
    } else {
      suggestions.push({ text: 'کلمه کلیدی اصلی را مشخص کنید', ok: false });
    }

    if (keywords.length >= 3) {
      score += 4;
      suggestions.push({ text: 'کلمات کلیدی فرعی کافی تعریف شده‌اند', ok: true });
    } else {
      suggestions.push({ text: 'حداقل ۳ کلمه کلیدی فرعی اضافه کنید', ok: false });
    }

    if (categoryId) {
      score += 4;
      suggestions.push({ text: 'دسته‌بندی مقاله مشخص است', ok: true });
    } else {
      suggestions.push({ text: 'دسته‌بندی مقاله را انتخاب کنید', ok: false });
    }

    if (selectedTags.length >= 2) {
      score += 2;
      suggestions.push({ text: 'تگ‌های مرتبط تعریف شده‌اند', ok: true });
    } else {
      suggestions.push({ text: 'حداقل ۲ تگ مرتبط اضافه کنید', ok: false });
    }

    score = Math.min(100, score);
    return [score, suggestions] as const;
  }, [title, slug, excerpt, wordCount, content, featuredImageUrl, imageAlt, focusKeyword, keywords.length, categoryId, selectedTags.length]);

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
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]);
  };

  const toggleService = (serviceId: number) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((s) => s !== serviceId)
        : [...prev, serviceId]);
  };

  const resolvePayload = (articleStatus: 'Draft' | 'Published') => {
    const effectiveAuthorId = safeNumber(authorId, 0) || safeNumber(mockAuthors[0]?.id, 0) || 1;
    const effectiveCategoryId = safeNumber(categoryId, 0) || safeNumber(contentCategories[0]?.id, 0) || 1;
    const effectiveSlug = ((slug.trim() || title.trim())
      .trim()
      .toLowerCase()
      .replace(/[\s\u200c]+/g, '-')
      .replace(/[^a-z0-9\-آ-ی]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    ) || `article-${Date.now()}`;
    const finalStatus = articleStatus;
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
      featuredImageAlt: imageAlt || null,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      primaryKeyword: focusKeyword || null,
      secondaryKeywordsJson: keywords?.length ? JSON.stringify(keywords) : null,
      status: finalStatus,
      publishedAt: publishedAtIso,
      diseaseId: safeNumber(diseaseId, 0),
      cityId: safeNumber(cityId, 0),
      isFeatured: false,
      isMedicalContent: true,
      isFactChecked: isMedicallyValidated,
      allowComments: true,
      tagIds: selectedTags,
      serviceDefinitionId: safeNumber(selectedServices[0] ?? 0, 0),
      medicalReviewerId: safeNumber(medicalReviewerId, 0),
    };
  };

  const tryAcquireSaveLock = () => {
    if (saveLock || submitting) return false;
    setSaveLock(true);
    setSubmitting(true);
    setSaveStatus('saving');
    return true;
  };

  const releaseSaveLock = (success: boolean) => {
    setSaveLock(false);
    setSubmitting(false);
    setSaveStatus(success ? 'saved' : 'error');
    if (success) {
      window.setTimeout(() => {
        if (aliveRef.current) {
          setSaveStatus('idle');
          initialSnapshotRef.current = captureSnapshot();
          setHasUnsavedChanges(false);
        }
      }, 2200);
    }
  };

  const handleSaveDraft = async () => {
    if (!tryAcquireSaveLock()) return;
    try {
      if (!title.trim()) {
        toast.error('عنوان مقاله الزامی است');
        releaseSaveLock(false);
        return;
      }
      const payload = resolvePayload('Draft');
      const res = (editId
        ? await adminContentApi.updateArticle(editId, payload)
        : await adminContentApi.createArticle(payload)) as { message?: string } | undefined;
      toast.success(res?.message || 'پیش‌نویس مقاله ذخیره شد');
      releaseSaveLock(true);
      window.setTimeout(() => router.push('/dashboard/admin/content/articles'), 800);
    } catch (err: unknown) {
      const e = err as ApiErrorShape;
      const msg = e?.response?.data?.message ?? e?.message ?? 'خطا در ذخیره پیش‌نویس';
      toast.error(msg);
      releaseSaveLock(false);
    }
  };

  const handlePreview = () => {
    if (editId) {
      const win = window.open(`/articles/${slug || '#'}`, '_blank', 'noopener,noreferrer');
      if (!win) toast.success('صفحه پیش‌نمایش باز شد');
    } else {
      toast('ذخیره مقاله برای مشاهده پیش‌نمایش', { icon: '📝' });
    }
  };

  const handleDiscardChanges = () => {
    if (!editId) {
      if (!confirm('تمامی تغییرات پاک شوند؟')) return;
      setTitle(''); setSlug(''); setExcerpt(''); setContent(''); setMetaTitle('');
      setMetaDescription(''); setFocusKeyword(''); setKeywords([]); setStatus('Draft');
      setCategoryId(''); setSelectedTags([]); setPublishedAtIso(null); setAuthorId('');
      setMedicalReviewerId(''); setIsMedicallyValidated(false);
      setFeaturedImageUrl(''); setImageAlt(''); setDiseaseId(''); setSelectedServices([]); setCityId('');
      initialSnapshotRef.current = captureSnapshot();
      setHasUnsavedChanges(false);
      toast.success('فرم بازنشانی شد');
      return;
    }
    if (!confirm('آیا می‌خواهید تغییرات ذخیره نشده را کنار بگذارید و مجدد مقاله را بارگذاری کنید؟')) return;
    loadArticleForEdit(editId, false);
  };

  const handlePublish = async () => {
    if (!tryAcquireSaveLock()) return;
    try {
      if (!title.trim()) {
        toast.error('عنوان مقاله الزامی است');
        releaseSaveLock(false);
        return;
      }
      if (!categoryId && !contentCategories[0]) {
        toast.error('انتخاب دسته‌بندی الزامی است');
        releaseSaveLock(false);
        return;
      }
      const payload = resolvePayload('Published');
      const res = (editId
        ? await adminContentApi.updateArticle(editId, payload)
        : await adminContentApi.createArticle(payload)) as { message?: string } | undefined;
      toast.success(res?.message || 'مقاله با موفقیت منتشر شد');
      releaseSaveLock(true);
      window.setTimeout(() => router.push('/dashboard/admin/content/articles'), 800);
    } catch (err: unknown) {
      const e = err as ApiErrorShape;
      const msg = e?.response?.data?.message ?? e?.message ?? 'خطا در انتشار مقاله';
      toast.error(msg);
      releaseSaveLock(false);
    }
  };

  const renderSaveStatusBadge = () => {
    if (saveStatus === 'saving' || submitting) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-1 text-[11px] font-black text-blue-700">
          <Loader2 className="h-3 w-3 animate-spin" />
          در حال ذخیره...
        </span>
      );
    }
    if (saveStatus === 'saved') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-black text-emerald-700">
          <Check className="h-3 w-3" />
          ذخیره شد
        </span>
      );
    }
    if (hasUnsavedChanges) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-[11px] font-black text-amber-700">
          <SaveAll className="h-3 w-3" />
          تغییرات ذخیره نشده
        </span>
      );
    }
    return null;
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
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-gray-900">
                {editId ? 'ویرایش مقاله' : 'نوشتن مقاله جدید'}
              </h1>
              {renderSaveStatusBadge()}
              {editId && lastUpdatedAt && (
                <span
                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-1 text-[11px] font-black text-slate-600"
                  title={String(lastUpdatedAt)}
                >
                  <History className="h-3 w-3" />
                  آخرین ویرایش: {formatJalaliDateTime(String(lastUpdatedAt))}
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-500">
              اطلاعات اصلی مقاله را وارد کنید، سپس محتوا را با ویرایشگر حرفه‌ای بنویسید و تنظیمات انتشار را تکمیل نمایید.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDiscardChanges}
            disabled={submitting || loadingArticle}
          >
            <RotateCcw className="ml-2 h-4 w-4" />
            بازنشانی تغییرات
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            disabled={submitting || loadingArticle}
          >
            {submitting ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <Save className="ml-2 h-4 w-4" />}
            ذخیره پیش‌نویس
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePreview}
            disabled={submitting || loadingArticle}
          >
            <Eye className="ml-2 h-4 w-4" />
            پیش‌نمایش
            {editId && <ExternalLink className="mr-1 h-3 w-3" />}
          </Button>
          <Button
            size="sm"
            onClick={handlePublish}
            disabled={submitting || loadingArticle}
            className="bg-gradient-to-l from-teal-600 to-emerald-500 hover:from-teal-700 hover:to-emerald-600 shadow-lg shadow-teal-600/20"
          >
            {submitting ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="ml-2 h-4 w-4" />}
            {editId ? 'ذخیره و به‌روزرسانی' : 'انتشار مقاله'}
          </Button>
        </div>
      </div>

      {loadingArticle && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 flex flex-col items-center justify-center gap-3 shadow-sm">
          <Loader2 className="h-10 w-10 text-teal-600 animate-spin" />
          <div className="text-sm font-bold text-slate-700">در حال بارگذاری اطلاعات مقاله برای ویرایش...</div>
          <div className="text-xs text-slate-500">لطفاً چند لحظه منتظر بمانید</div>
        </div>
      )}

      {!loadingArticle && loadArticleError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-5 shadow-sm space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-rose-600" />
            </div>
            <div className="flex-1">
              <div className="text-base font-black text-rose-800">خطا در بارگذاری اطلاعات مقاله</div>
              <div className="mt-1 text-sm font-bold text-rose-600/80">{loadArticleError}</div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button size="sm" variant="outline" onClick={() => router.push('/dashboard/admin/content/articles')}>
                <ArrowLeft className="ml-2 h-4 w-4" />
                بازگشت به لیست
              </Button>
              <Button size="sm" onClick={handleRetryLoadArticle}>
                <RotateCcw className="ml-2 h-4 w-4" />
                تلاش مجدد
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
          <Card title="اطلاعات اصلی" icon={<FileEdit className="h-4 w-4 text-teal-600" />}>
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700 block">عنوان مقاله (H1)</label>
                  <span className={`text-[11px] font-bold ${title.length > 70 ? 'text-rose-600' : 'text-slate-400'}`}>
                    {title.length}/۷۰
                  </span>
                </div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثلاً: مراقبت کامل از بیمار سکته مغزی در منزل - راهنمای علمی ۱۴۰۵"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base font-bold text-slate-800 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
                />
                <p className="text-[11px] font-bold text-slate-400 leading-relaxed">
                  این عنوان به صورت H1 در بالای صفحه نمایش داده می‌شود و نباید در محتوای مقاله تکرار شود.
                </p>
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
                  <label className="text-sm font-bold text-slate-700">خلاصه کوتاه مقاله</label>
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
              <RichTextEditor
                value={content}
                onChange={setContent}
                minHeight={460}
                placeholder="محتوای کامل مقاله را اینجا بنویسید..."
              />
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5">
                <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1">
                    <BarChart3 className="h-3.5 w-3.5 text-teal-600" />
                    تعداد کلمات: <span className="text-slate-700">{wordCount.toLocaleString('fa-IR')}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    زمان تخمینی مطالعه: <span className="text-slate-700">{estimatedReadTime.toLocaleString('fa-IR')} دقیقه</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                  H1 فقط در عنوان صفحه استفاده شده و داخل محتوا H2، H3 و H4 به کار رفته‌اند
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
                    وضعیت: {seoScore >= 85 ? 'عالی ✨' : seoScore >= 65 ? 'خوب 👍' : seoScore >= 45 ? 'متوسط 📊' : 'نیاز به بهبود ⚠️'}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 rounded-2xl border border-slate-200 bg-white p-3">
                <div className="text-xs font-black text-slate-700 mb-2 flex items-center gap-1">
                  <ListTodo className="h-3.5 w-3.5 text-indigo-500" />
                  پیشنهادهای هوشمند سئو
                </div>
                {seoSuggestions.map((s, i) => (
                  <div key={i} className={`flex items-start gap-2 rounded-lg px-2.5 py-1.5 ${s.ok ? 'bg-emerald-50/60' : 'bg-amber-50/50'}`}>
                    {s.ok
                      ? <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      : <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />}
                    <span className={`text-xs font-bold leading-relaxed ${s.ok ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {s.text}
                    </span>
                  </div>
                ))}
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
                  placeholder={title || 'عنوان صفحه در نتایج گوگل (اختیاری - به صورت خودکار از عنوان استفاده می‌شود)'}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-700">متای توصیف (Meta Description)</label>
                  <span
                    className={`text-xs font-bold ${
                      excerptCount > 160 ? 'text-rose-600' : 'text-slate-400'
                    }`}
                  >
                    {metaDescription.length}/۱۶۰
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="توضیح کوتاه برای نمایش در نتایج موتورهای جستجو (اختیاری - می‌تواند با خلاصه مقاله یکسان باشد)"
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
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card title="وضعیت انتشار" icon={<Sparkles className="h-4 w-4 text-teal-600" />}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">وضعیت</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ArticleStatus)}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all font-bold"
                >
                  <option value="Draft">پیش‌نویس</option>
                  <option value="PendingReview">در انتظار بررسی</option>
                  <option value="Published">منتشرشده</option>
                  <option value="Archived">آرشیو شده</option>
                </select>
              </div>

              <div className="space-y-2">
                <PersianDatePicker
                  label="تاریخ انتشار"
                  value={publishedAtIso}
                  onChange={(iso) => setPublishedAtIso(iso)}
                  includeTime
                  placeholder="1405/06/01 14:30"
                />
                <p className="text-[11px] font-bold text-slate-400 leading-relaxed">
                  خالی بودن به معنی استفاده از زمان فعلی سرور هنگام انتشار است. تاریخ به صورت میلادی در پایگاه‌داده ذخیره می‌شود.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600 block">دسته‌بندی اصلی</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
                  disabled={lookupLoading.cats}
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
                <div className="flex flex-wrap gap-1.5 p-2.5 rounded-2xl border border-gray-200 bg-white max-h-[200px] overflow-y-auto">
                  {lookupLoading.tags ? (
                    <span className="text-xs text-slate-400 py-1 px-1 inline-flex items-center gap-1">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      در حال بارگذاری تگ‌ها...
                    </span>
                  ) : contentTags.length === 0 ? (
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
                <p className="text-[11px] font-bold text-slate-400 leading-relaxed">
                  {selectedTags.length} تگ انتخاب شده است
                </p>
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
                    محتوا توسط متخصص پزشکی بررسی و تأیید شده است. (IsFactChecked)
                  </div>
                </div>
              </label>
            </div>
          </Card>

          <Card title="تصویر شاخص و سئوی تصویر" icon={<FileText className="h-4 w-4 text-rose-500" />}>
            <FeaturedImageUploader
              imageUrl={featuredImageUrl || null}
              imageAlt={imageAlt}
              onImageChange={(url) => setFeaturedImageUrl(url || '')}
              onAltChange={setImageAlt}
              title="عکس شاخص مقاله"
            />
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
                <div className="flex flex-wrap gap-1.5 p-2.5 rounded-2xl border border-gray-200 bg-white max-h-[160px] overflow-y-auto">
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
                <p className="text-[11px] font-bold text-slate-400 leading-relaxed">
                  {selectedServices.length} سرویس مرتبط انتخاب شده
                </p>
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
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-100 pb-4 -mx-5 px-5 mt-[-2px]">
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
