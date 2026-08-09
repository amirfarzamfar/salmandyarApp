import { cache } from "react";
import { getApiOrigin } from '@/lib/network';
import * as mock from '@/lib/data/content-data';
import type {
  Article,
  Author,
  ContentCategory,
  ContentTag,
  Disease,
  City,
  Guide,
  HealthTool,
  ServiceSeoProfile,
  FAQItem,
} from '@/lib/types/content';


const API_PREFIX = '/api/public/content';

function apiUrl(path: string) {
  const origin = getApiOrigin();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${origin}${API_PREFIX}${normalized}`;
}

async function safeFetch<T>(
  path: string,
  fallback: T,
  init?: RequestInit
): Promise<T> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(apiUrl(path), {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
      // cache: 'no-store',
      next: { revalidate: 3600 },
    });
    clearTimeout(timeout);
    if (!res.ok) {
      return fallback;
    }
    const json = await res.json();
    return (json ?? fallback) as T;
  } catch {
    return fallback;
  }
}

export interface PagedResponse<T> {
  total: number;
  page: number;
  pageSize: number;
  items: T[];
}

export interface HomeResponse {
  featuredArticles: Article[];
  featuredServices: Array<{ service: any; seo: any }>;
  featuredDiseases: Disease[];
}

export interface MegamenuResponse {
  categories: Array<ContentCategory & { articles: Article[] }>;
  services: Array<{ id: number; code: string; title: string; slug: string; description?: string; priceRangeText?: string }>;
  diseases: Array<{ id: number; name: string; slug: string }>;
  cities: Array<{ id: number; name: string; slug: string; province?: string }>;
}

export async function getHomePageData(): Promise<HomeResponse> {
  const fallback: HomeResponse = {
    featuredArticles: mock.articles
      .filter((a: any) => a.status === 'Published' && a.isFeatured)
      .slice(0, 3) as Article[],
    featuredServices: mock.serviceSeoProfiles
      .slice(0, 4)
      .map((s: any) => ({ service: s.serviceDefinition, seo: s })),
    featuredDiseases: mock.diseases.slice(0, 5) as Disease[],
  };
  return safeFetch<HomeResponse>('/home', fallback);
}

export async function getMegamenu(): Promise<MegamenuResponse> {
  const fallback: MegamenuResponse = {
    categories: mock.contentCategories
      .filter((c: any) => !c.parentId)
      .slice(0, 6)
      .map((c: any) => ({
        ...c,
        articles: mock.articles
          .filter((a: any) => a.status === 'Published' && a.categoryId === c.id)
          .slice(0, 5),
      })),
    services: mock.serviceSeoProfiles
      .filter((s: any) => s.serviceDefinition)
      .slice(0, 8)
      .map((s: any) => ({
        id: s.serviceDefinition?.id,
        code: s.serviceDefinition?.code,
        title: s.serviceDefinition?.title,
        slug: s.slug,
      })),
    diseases: mock.diseases.slice(0, 8).map((d: any) => ({ id: d.id, name: d.name, slug: d.slug })),
    cities: mock.cities.slice(0, 8).map((c: any) => ({ id: c.id, name: c.name, slug: c.slug })),
  };
  return safeFetch<MegamenuResponse>('/megamenu', fallback);
}

export async function listArticles(params?: {
  page?: number;
  pageSize?: number;
  categoryId?: number;
  diseaseId?: number;
  search?: string;
}): Promise<PagedResponse<Article>> {
  const { page = 1, pageSize = 9, categoryId, diseaseId, search } = params || {};
  const qs = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    ...(categoryId != null ? { categoryId: String(categoryId) } : {}),
    ...(diseaseId != null ? { diseaseId: String(diseaseId) } : {}),
    ...(search ? { search } : {}),
  });

  const allPublished = [...mock.articles].filter((a: any) => a.status === 'Published');
  const filtered = allPublished.filter((a: any) => {
    if (categoryId != null && a.categoryId !== categoryId) return false;
    if (diseaseId != null && a.diseaseId !== diseaseId) return false;
    if (search && !a.title.includes(search) && !(a.excerpt || '').includes(search)) return false;
    return true;
  });
  const start = (page - 1) * pageSize;
  const fallback: PagedResponse<Article> = {
    total: filtered.length,
    page,
    pageSize,
    items: filtered.slice(start, start + pageSize) as Article[],
  };
  return safeFetch<PagedResponse<Article>>(`/articles?${qs.toString()}`, fallback);
}

export async function getRecentArticles(count = 5, excludeId?: number): Promise<Article[]> {
  const qs = new URLSearchParams({ count: String(count) });
  if (excludeId != null) qs.set('excludeId', String(excludeId));
  const fallback = [...mock.articles]
    .filter((a: any) => a.status === 'Published' && (excludeId == null || a.id !== excludeId))
    .sort((a: any, b: any) => +new Date(b.publishedAt || 0) - +new Date(a.publishedAt || 0))
    .slice(0, count) as Article[];
  return safeFetch<Article[]>(`/articles/recent?${qs.toString()}`, fallback);
}

export async function getFeaturedArticles(count = 3): Promise<Article[]> {
  const qs = new URLSearchParams({ count: String(count) });
  const fallback = [...mock.articles]
    .filter((a: any) => a.status === 'Published' && a.isFeatured)
    .sort((a: any, b: any) => +new Date(b.publishedAt || 0) - +new Date(a.publishedAt || 0))
    .slice(0, count) as Article[];
  return safeFetch<Article[]>(`/articles/featured?${qs.toString()}`, fallback);
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const fallback = (mock.articles.find((a: any) => a.slug === slug) as Article) || null;
  return safeFetch<Article | null>(`/articles/${slug}`, fallback);
}

export async function listCategories(): Promise<ContentCategory[]> {
  const fallback = mock.contentCategories as ContentCategory[];
  return safeFetch<ContentCategory[]>('/categories', fallback);
}

export async function listTags(): Promise<ContentTag[]> {
  const fallback = mock.contentTags as ContentTag[];
  return safeFetch<ContentTag[]>('/tags', fallback);
}

export async function listDiseases(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
}): Promise<PagedResponse<Disease>> {
  const { page = 1, pageSize = 20, search } = params || {};
  const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize), ...(search ? { search } : {}) });
  const all = mock.diseases as Disease[];
  const filtered = search
    ? all.filter((d: any) => d.name.includes(search))
    : all;
  const start = (page - 1) * pageSize;
  const fallback: PagedResponse<Disease> = {
    total: filtered.length,
    page,
    pageSize,
    items: filtered.slice(start, start + pageSize),
  };
  return safeFetch<PagedResponse<Disease>>(`/diseases?${qs.toString()}`, fallback);
}

export async function getFeaturedDiseases(count = 6): Promise<Disease[]> {
  const qs = new URLSearchParams({ count: String(count) });
  const fallback = (mock.diseases as Disease[]).slice(0, count);
  return safeFetch<Disease[]>(`/diseases/featured?${qs.toString()}`, fallback);
}

export async function getDiseaseBySlug(slug: string): Promise<Disease | null> {
  const fallback = (mock.diseases.find((d: any) => d.slug === slug) as Disease) || null;
  return safeFetch<Disease | null>(`/diseases/${slug}`, fallback);
}

export async function listCities(): Promise<City[]> {
  const fallback = mock.cities as City[];
  return safeFetch<City[]>('/cities', fallback);
}

export async function getCityBySlug(slug: string): Promise<City | null> {
  const fallback = (mock.cities.find((c: any) => c.slug === slug) as City) || null;
  return safeFetch<City | null>(`/cities/${slug}`, fallback);
}

export async function listGuides(params?: { page?: number; pageSize?: number }): Promise<PagedResponse<Guide>> {
  const { page = 1, pageSize = 12 } = params || {};
  const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  const all = mock.guides as Guide[];
  const start = (page - 1) * pageSize;
  const fallback: PagedResponse<Guide> = {
    total: all.length,
    page,
    pageSize,
    items: all.slice(start, start + pageSize),
  };
  return safeFetch<PagedResponse<Guide>>(`/guides?${qs.toString()}`, fallback);
}

export async function getGuideBySlug(slug: string): Promise<Guide | null> {
  const fallback = (mock.guides.find((g: any) => g.slug === slug) as Guide) || null;
  return safeFetch<Guide | null>(`/guides/${slug}`, fallback);
}

export async function listTools(): Promise<HealthTool[]> {
  const fallback = (mock.healthTools as HealthTool[])
    .slice()
    .sort((a, b) => {
      const orderA = (a.isFeatured ? 0 : 1) * 1000 + (a.displayOrder ?? 999);
      const orderB = (b.isFeatured ? 0 : 1) * 1000 + (b.displayOrder ?? 999);
      return orderA - orderB;
    });
  return safeFetch<HealthTool[]>('/tools', fallback);
}

export async function getFeaturedTools(count = 4): Promise<HealthTool[]> {
  const qs = new URLSearchParams({ count: String(count) });
  const fallback = (mock.healthTools as HealthTool[])
    .filter((t: any) => t.isFeatured !== false)
    .sort((a, b) => {
      const orderA = (a.displayOrder ?? 999);
      const orderB = (b.displayOrder ?? 999);
      return orderA - orderB;
    })
    .slice(0, count);
  return safeFetch<HealthTool[]>(`/tools/featured?${qs.toString()}`, fallback);
}

export async function getToolBySlug(slug: string): Promise<HealthTool | null> {
  const fallback = (mock.healthTools.find((t: any) => t.slug === slug) as HealthTool) || null;
  return safeFetch<HealthTool | null>(`/tools/${slug}`, fallback);
}

export async function listAuthors(): Promise<Author[]> {
  const fallback = mock.authors as Author[];
  return safeFetch<Author[]>('/authors', fallback);
}

export async function getAuthorBySlug(slug: string): Promise<Author | null> {
  const fallback = (mock.authors.find((a: any) => a.slug === slug) as Author) || null;
  return safeFetch<Author | null>(`/authors/${slug}`, fallback);
}

export async function listServicesWithSeo(): Promise<ServiceSeoProfile[]> {
  const fallback = mock.serviceSeoProfiles as ServiceSeoProfile[];
  return safeFetch<ServiceSeoProfile[]>('/services', fallback);
}

export async function getServiceLandingBySlug(slug: string): Promise<ServiceSeoProfile | null> {
  const fallback = (mock.serviceSeoProfiles.find((s: any) => s.slug === slug) as ServiceSeoProfile) || null;
  return safeFetch<ServiceSeoProfile | null>(`/services/${slug}`, fallback);
}

export async function getFaqs(entityType: string, entityId: number): Promise<FAQItem[]> {
  const fallback: FAQItem[] = [];
  return safeFetch<FAQItem[]>(`/faqs/${entityType}/${entityId}`, fallback);
}

export async function getSitemapSlugs(): Promise<Array<{ type: string; slug: string; updated: string }>> {
  const fallback: Array<{ type: string; slug: string; updated: string }> = [];
  return safeFetch(`/sitemap/slugs`, fallback);
}
