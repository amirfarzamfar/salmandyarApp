import type { MetadataRoute } from 'next';
import { articles, authors, contentCategories, cities, diseases, guides, healthTools } from '@/lib/data/content-data';
import { serviceSeoProfiles } from '@/lib/data/content-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://salmandyar.com';
  const now = new Date();
  const lastModified = now;
  const routes: MetadataRoute.Sitemap = [];

  routes.push(
    { url: baseUrl + '/', lastModified, changeFrequency: 'daily', priority: 1 },
    { url: baseUrl + '/services', lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: baseUrl + '/diseases', lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: baseUrl + '/guides', lastModified, changeFrequency: 'weekly', priority: 0.8 },
    { url: baseUrl + '/tools', lastModified, changeFrequency: 'weekly', priority: 0.8 },
    { url: baseUrl + '/cities', lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: baseUrl + '/articles', lastModified, changeFrequency: 'daily', priority: 0.9 },
    { url: baseUrl + '/authors', lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: baseUrl + '/login', lastModified, changeFrequency: 'yearly', priority: 0.3 },
    { url: baseUrl + '/register', lastModified, changeFrequency: 'yearly', priority: 0.3 }
  );

  articles.forEach(a => routes.push({
    url: `${baseUrl}/articles/${a.slug}`,
    lastModified: a.lastUpdatedAt || a.publishedAt || lastModified,
    changeFrequency: a.isFeatured ? 'weekly' : 'monthly',
    priority: a.isFeatured ? 0.85 : 0.7,
  }));

  serviceSeoProfiles.forEach(s => routes.push({
    url: `${baseUrl}/services/${s.slug}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: 0.95,
  }));

  diseases.forEach(d => routes.push({
    url: `${baseUrl}/diseases/${d.slug}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.85,
  }));

  cities.forEach(c => routes.push({
    url: `${baseUrl}/cities/${c.slug}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.85,
  }));

  guides.forEach(g => routes.push({
    url: `${baseUrl}/guides/${g.slug}`,
    lastModified: g.publishedAt || lastModified,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  healthTools.forEach(t => routes.push({
    url: `${baseUrl}/tools/${t.slug}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.9,
  }));

  authors.filter(a => a.slug).forEach(a => routes.push({
    url: `${baseUrl}/authors/${a.slug}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  contentCategories.filter(c => c.isActive).forEach(c => routes.push({
    url: `${baseUrl}/articles/category/${c.slug}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return routes;
}
