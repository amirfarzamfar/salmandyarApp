import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  listArticles,
  listCategories,
} from '@/lib/content-api';
import type { Article, ContentCategory } from '@/lib/types/content';
import CategoryLandingPage from '@/components/content/CategoryLandingPage';
import {
  CollectionPageSchema,
  CategoryFAQSchema,
} from '@/lib/seo/structured-data';
import { getCategoryContent } from '@/lib/data/category-content';

export const revalidate = 3600;

const PAGE_PATH_BASE = '/articles/category';

export async function generateStaticParams() {
  try {
    const categories = await listCategories();
    return (categories || [])
      .filter((c: ContentCategory) => c.isActive && !c.parentId)
      .map((c: ContentCategory) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const categories = await listCategories();
  const category = (categories || []).find((c: any) => c.slug === slug);
  if (!category) return {};

  const cat = category as ContentCategory;
  const content = getCategoryContent(slug);

  const title =
    cat.metaTitle ||
    content?.hero.h1 ||
    `${cat.name} | مقالات تخصصی مجله سلامت سالمندیار`;
  const description =
    cat.metaDescription ||
    content?.hero.subtitle ||
    cat.description ||
    `مقالات تخصصی ${cat.name} با تأیید تیم پزشکی سالمندیار`;
  const pagePath = `${PAGE_PATH_BASE}/${slug}`;
  const keywords = content
    ? [
        content.keywords.primary,
        ...content.keywords.secondary,
        ...content.keywords.longTail.slice(0, 5),
      ].filter(Boolean)
    : undefined;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: cat.canonicalUrl || pagePath,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      url: pagePath,
      title,
      description,
      siteName: 'سالمندیار | مجله سلامت',
      locale: 'fa_IR',
      images: cat.coverImageUrl
        ? [
            {
              url: cat.coverImageUrl,
              width: 1200,
              height: 630,
              alt: title,
              type: 'image/jpeg',
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: cat.coverImageUrl ? [cat.coverImageUrl] : undefined,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categories = await listCategories();
  const category = (categories || []).find((c: any) => c.slug === slug) as
    | ContentCategory
    | undefined;

  if (!category || !category.isActive) {
    notFound();
  }

  const pagePath = `${PAGE_PATH_BASE}/${slug}`;
  const content = getCategoryContent(slug);

  const [articlesResult] = await Promise.all([
    listArticles({ categoryId: category.id, pageSize: 24 }),
  ]);

  const publishedArticles: Article[] = (articlesResult?.items || []).filter(
    (a: any) => !a.status || a.status === 'Published'
  ) as Article[];

  const sortedArticles: Article[] = [...publishedArticles].sort((a: any, b: any) => {
    const fa = a.isFeatured ? 0 : 1;
    const fb = b.isFeatured ? 0 : 1;
    if (fa !== fb) return fa - fb;
    const ta = a.publishedAt ? +new Date(a.publishedAt) : 0;
    const tb = b.publishedAt ? +new Date(b.publishedAt) : 0;
    return tb - ta;
  });

  const collectionDescription = content
    ? `${content.introduction.paragraphs[0]?.slice(0, 180)}${
        content.introduction.paragraphs[0] &&
        content.introduction.paragraphs[0].length > 180
          ? '…'
          : ''
      }`
    : undefined;

  return (
    <>
      <CollectionPageSchema
        category={category}
        articles={sortedArticles}
        description={collectionDescription}
        pagePath={pagePath}
      />
      {content && content.faqs.length > 0 && (
        <CategoryFAQSchema
          faqs={content.faqs}
          categorySlug={category.slug}
          pagePath={pagePath}
        />
      )}
      <CategoryLandingPage
        category={category}
        articles={sortedArticles}
        allCategories={(categories || []) as ContentCategory[]}
      />
    </>
  );
}
