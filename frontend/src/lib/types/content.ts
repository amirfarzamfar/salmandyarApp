export type ArticleStatus = 'Draft' | 'PendingReview' | 'Published' | 'Archived';

export interface Author {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  title?: string;
  specialization?: string;
  biography?: string;
  experienceSummary?: string;
  yearsOfExperience?: number;
  profileImageUrl?: string;
  medicalLicenseNumber?: string;
  email?: string;
  slug?: string;
  isMedicalReviewer: boolean;
}

export interface ContentCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parentId?: number;
  parent?: ContentCategory;
  children?: ContentCategory[];
  displayOrder: number;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  coverImageUrl?: string;
  isActive: boolean;
  showInMenu: boolean;
}

export interface ContentTag {
  id: number;
  name: string;
  slug: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  coverImageUrl?: string;
}

export interface ArticleSource {
  id: number;
  title: string;
  url?: string;
  publisher?: string;
  publicationYear?: number;
  displayOrder?: number;
}

export interface FAQItem {
  id: number;
  question: string;
  answer: string;
  displayOrder: number;
}

export interface ArticleMedicalReview {
  id: number;
  medicalReviewer?: Author;
  reviewer?: Author;
  reviewNotes?: string;
  notes?: string;
  isApproved: boolean;
  approved?: boolean;
  reviewedAt: string;
  expiresAt?: string;
}

export interface ArticleTag {
  articleId: number;
  tagId: number;
  tag?: ContentTag;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  shortAnswer?: string;
  excerpt?: string;
  estimatedReadingTimeMinutes?: number;
  featuredImageUrl?: string;
  ogImageUrl?: string;
  twitterImageUrl?: string;
  imageGallery?: string[];
  metaTitle?: string;
  metaDescription?: string;
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  canonicalUrl?: string;
  status: ArticleStatus;
  version?: number;
  publishedAt?: string;
  lastUpdatedAt?: string;
  authorId: number;
  author?: Author;
  categoryId: number;
  category?: ContentCategory;
  serviceDefinitionId?: number;
  diseaseId?: number;
  viewCount?: number;
  isFeatured: boolean;
  isMedicalContent: boolean;
  isFactChecked: boolean;
  tags?: ContentTag[];
  articleTags?: ArticleTag[];
  medicalReviews?: ArticleMedicalReview[];
  sources?: ArticleSource[];
  faqs?: FAQItem[];
}

export interface ServiceSeoProfile {
  id: number;
  serviceDefinitionId: number;
  serviceDefinition?: {
    id: number;
    code: string;
    title: string;
    description: string;
    category: string;
  };
  slug: string;
  longDescription?: string;
  heroImageUrl?: string;
  ogImageUrl?: string;
  twitterImageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  canonicalUrl?: string;
  videoPresentationUrl?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  startingPrice?: number;
  priceRangeText?: string;
  showInHomePage: boolean;
  isFeatured: boolean;
  displayOrder: number;
  viewCount?: number;
  benefits?: ServiceBenefit[];
  targetPatients?: ServiceTargetPatient[];
  coverageAreas?: ServiceCoverageArea[];
  testimonials?: ServiceTestimonial[];
  faqs?: FAQItem[];
}

export interface ServiceBenefit {
  id: number;
  title: string;
  description?: string;
  iconName?: string;
  colorClass?: string;
  displayOrder: number;
}

export interface ServiceTargetPatient {
  id: number;
  title: string;
  description?: string;
  relatedDiseaseId?: number;
  displayOrder: number;
}

export interface ServiceCoverageArea {
  id: number;
  cityId?: number;
  areaName: string;
  district?: string;
  notes?: string;
  has24HourService: boolean;
  additionalCost?: number;
  displayOrder: number;
}

export interface ServiceTestimonial {
  id: number;
  clientFullName: string;
  clientRole?: string;
  profileImageUrl?: string;
  rating: number;
  content: string;
  highlight?: string;
  testimonialDate?: string;
  isApproved: boolean;
  isFeatured: boolean;
}

export interface Disease {
  id: number;
  name: string;
  slug: string;
  shortDescription?: string;
  definition?: string;
  causes?: string[];
  symptoms?: string[];
  riskFactors?: string[];
  diagnosis?: string[];
  treatment?: string[];
  prevention?: string[];
  homeCareInstructions?: string;
  coverImageUrl?: string;
  ogImageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  primaryKeyword?: string;
  icd10Code?: string;
  severityLevel?: number;
  requiresImmediateMedicalAttention: boolean;
  medicalReviewerId?: number;
  medicalReviewer?: Author;
  faqs?: FAQItem[];
}

export interface City {
  id: number;
  name: string;
  slug: string;
  province?: string;
  population?: number;
  shortDescription?: string;
  aboutRegion?: string;
  coveredAreas?: string[];
  phoneNumber?: string;
  coverImageUrl?: string;
  ogImageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  latitude?: number;
  longitude?: number;
  displayOrder: number;
}

export interface Guide {
  id: number;
  title: string;
  slug: string;
  shortDescription?: string;
  content?: string;
  shortAnswer?: string;
  estimatedReadingTimeMinutes?: number;
  coverImageUrl?: string;
  ogImageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  canonicalUrl?: string;
  authorId?: number;
  author?: Author;
  categoryId?: number;
  category?: ContentCategory;
  serviceDefinitionId?: number;
  diseaseId?: number;
  publishedAt?: string;
  lastUpdatedAt?: string;
  viewCount?: number;
  isFeatured: boolean;
  isMedicalContent: boolean;
  steps?: { title: string; description?: string; order: number }[];
  faqs?: FAQItem[];
  tags?: ContentTag[];
  sources?: ArticleSource[];
}

export interface HealthTool {
  id: number;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  toolType: 'Calculator' | 'Checklist' | 'Assessment' | 'Converter' | 'Tracker';
  toolConfiguration?: Record<string, unknown>;
  howToUse?: string;
  interpretationGuide?: string;
  disclaimers?: string;
  usageCount?: number;
  coverImageUrl?: string;
  ogImageUrl?: string;
  twitterImageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  isFeatured?: boolean;
  displayOrder?: number;
  faqs?: FAQItem[];
}

export interface BreadcrumbItem {
  name: string;
  label?: string;
  href: string;
}
