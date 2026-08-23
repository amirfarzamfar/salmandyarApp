'use client';

import api from '@/lib/axios';

export interface CategoryItem {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parentId: number | null;
  displayOrder: number;
  isActive: boolean;
  showInMenu: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  coverImageUrl: string | null;
  createdAt: string;
  updatedAt: string | null;
  articleCount: number;
  childrenCount: number;
  parentName: string | null;
}

export interface TagItem {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  coverImageUrl: string | null;
  createdAt: string;
  updatedAt: string | null;
  articleCount: number;
}

export interface AuthorStub { id: number; firstName: string; lastName: string; title: string | null; }
export interface CategoryStub { id: number; name: string; slug: string; }

export interface ArticleItem {
  id: number;
  title: string;
  slug: string;
  status: string;
  excerpt: string | null;
  featuredImageUrl: string | null;
  viewCount: number | null;
  isFeatured: boolean;
  isMedicalContent: boolean;
  isFactChecked: boolean;
  estimatedReadingTimeMinutes: number | null;
  createdAt: string;
  publishedAt: string | null;
  updatedAt: string | null;
  author: AuthorStub | null;
  category: CategoryStub | null;
  authorId: number;
  categoryId: number;
  diseaseId: number | null;
  serviceDefinitionId: number | null;
}

export interface ArticlePagedResult { total: number; page: number; pageSize: number; items: ArticleItem[]; }

export interface CreateCategoryPayload {
  name: string; slug: string; description?: string | null;
  parentId?: number; displayOrder?: number; isActive?: boolean; showInMenu?: boolean;
  metaTitle?: string | null; metaDescription?: string | null; coverImageUrl?: string | null;
}
export interface UpdateCategoryPayload extends Partial<CreateCategoryPayload> { }

export interface CreateTagPayload {
  name: string; slug: string; description?: string | null;
  isActive?: boolean;
  metaTitle?: string | null; metaDescription?: string | null; coverImageUrl?: string | null;
}
export interface UpdateTagPayload extends Partial<CreateTagPayload> { }

export interface CreateArticlePayload {
  title: string; slug: string; authorId: number; categoryId: number;
  content?: string | null; excerpt?: string | null; shortAnswer?: string | null;
  estimatedReadingTimeMinutes?: number;
  featuredImageUrl?: string | null; featuredImageAlt?: string | null; ogImageUrl?: string | null;
  metaTitle?: string | null; metaDescription?: string | null;
  primaryKeyword?: string | null; secondaryKeywordsJson?: string | null;
  canonicalUrl?: string | null; status?: 'Draft' | 'PendingReview' | 'Published' | 'Archived';
  publishedAt?: string | null;
  serviceDefinitionId?: number; diseaseId?: number;
  isFeatured?: boolean; isMedicalContent?: boolean; isFactChecked?: boolean;
  allowComments?: boolean; tagIds?: number[];
}
export interface UpdateArticlePayload extends Partial<CreateArticlePayload> { }

export interface UploadImageResult {
  url: string;
  fullUrl: string;
  fileName: string;
  sizeBytes: number;
  sizeKB: number;
}

const DEFAULT_PAGE_SIZE = 20;

export const adminContentApi = {
  /* ============ ContentCategory ============ */
  listCategories: (): Promise<CategoryItem[]> =>
    api.get('/admin/content/categories').then(r => r.data as CategoryItem[]),

  getCategory: (id: number): Promise<CategoryItem> =>
    api.get(`/admin/content/categories/${id}`).then(r => r.data as CategoryItem),

  createCategory: (payload: CreateCategoryPayload) =>
    api.post('/admin/content/categories', payload).then(r => r.data),

  updateCategory: (id: number, payload: UpdateCategoryPayload) =>
    api.put(`/admin/content/categories/${id}`, payload).then(r => r.data),

  deleteCategory: (id: number) =>
    api.delete(`/admin/content/categories/${id}`).then(r => r.data),

  /* ============ ContentTag ============ */
  listTags: (): Promise<TagItem[]> =>
    api.get('/admin/content/tags').then(r => r.data as TagItem[]),

  getTag: (id: number): Promise<TagItem> =>
    api.get(`/admin/content/tags/${id}`).then(r => r.data as TagItem),

  createTag: (payload: CreateTagPayload) =>
    api.post('/admin/content/tags', payload).then(r => r.data),

  updateTag: (id: number, payload: UpdateTagPayload) =>
    api.put(`/admin/content/tags/${id}`, payload).then(r => r.data),

  deleteTag: (id: number) =>
    api.delete(`/admin/content/tags/${id}`).then(r => r.data),

  /* ============ Article ============ */
  listArticles: (params?: {
    page?: number; pageSize?: number; search?: string;
    categoryId?: number; status?: string; onlyMedical?: boolean;
  }): Promise<ArticlePagedResult> => {
    const { page = 1, pageSize = DEFAULT_PAGE_SIZE, search, categoryId, status, onlyMedical } = params ?? {};
    const qs = new URLSearchParams();
    qs.set('page', String(page));
    qs.set('pageSize', String(pageSize));
    if (search) qs.set('search', search);
    if (categoryId != null) qs.set('categoryId', String(categoryId));
    if (status) qs.set('status', status);
    if (onlyMedical != null) qs.set('onlyMedical', String(onlyMedical));
    return api.get(`/admin/content/articles?${qs.toString()}`).then(r => r.data as ArticlePagedResult);
  },

  getArticle: (id: number) =>
    api.get(`/admin/content/articles/${id}`).then(r => r.data),

  createArticle: (payload: CreateArticlePayload) =>
    api.post('/admin/content/articles', payload).then(r => r.data),

  updateArticle: (id: number, payload: UpdateArticlePayload) =>
    api.put(`/admin/content/articles/${id}`, payload).then(r => r.data),

  deleteArticle: (id: number) =>
    api.delete(`/admin/content/articles/${id}`).then(r => r.data),

  publishArticle: (id: number) =>
    api.post(`/admin/content/articles/${id}/publish`).then(r => r.data),

  unpublishArticle: (id: number) =>
    api.post(`/admin/content/articles/${id}/unpublish`).then(r => r.data),

  uploadImage: (file: File, use: 'featured' | 'inline' = 'featured'): Promise<UploadImageResult> => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('use', use);
    return api.post('/admin/content/upload-image', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data as UploadImageResult);
  },
};

export default adminContentApi;
