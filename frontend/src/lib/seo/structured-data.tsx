import Script from 'next/script';
import type { Article, ServiceSeoProfile, FAQItem, Disease, City, Author, HealthTool } from '@/lib/types/content';

function toJsonLd(data: unknown): string {
  return JSON.stringify(data);
}

function formatDate(dateStr?: string) {
  if (!dateStr) return undefined;
  try {
    return new Date(dateStr).toISOString();
  } catch {
    return undefined;
  }
}

const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://salmandyar.com';

export function OrganizationSchema() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'سالمندیار | پلتفرم پرستاری و مراقبت در منزل',
    legalName: 'سالمندیار',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: 'پلتفرم جامع خدمات پرستاری و مراقبت در منزل با بیش از ۵۰۰ پرستار حرفه‌ای و دارای مجوز',
    foundingDate: '2023',
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+98-912-8718237',
        contactType: 'customer support',
        availableLanguage: ['Persian'],
        areaServed: 'IR',
      },
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IR',
      addressLocality: 'تهران',
      streetAddress: 'خیابان ولیعصر',
    },
    sameAs: [
      'https://instagram.com/salmandyar',
      'https://linkedin.com/company/salmandyar',
      'https://twitter.com/salmandyar',
    ],
  };
  return <Script id="schema-organization" type="application/ld+json" strategy="afterInteractive">{toJsonLd(data)}</Script>;
}

export function ArticleSchema({ article }: { article: Article }) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': article.isMedicalContent ? 'MedicalWebPage' : 'Article',
    headline: article.title,
    description: article.excerpt || article.shortAnswer || article.metaDescription,
    image: article.featuredImageUrl ? [article.featuredImageUrl] : undefined,
    datePublished: formatDate(article.publishedAt),
    dateModified: formatDate(article.lastUpdatedAt || article.publishedAt),
    wordCount: article.content?.length ? Math.ceil(article.content.length / 6) : undefined,
    keywords: [
      article.primaryKeyword,
      ...(article.secondaryKeywords || []),
    ].filter(Boolean).join(', '),
  };

  if (article.author) {
    data.author = {
      '@type': 'Person',
      name: article.author.fullName,
      jobTitle: article.author.title,
      knowsAbout: article.author.specialization,
      hasCredential: article.author.medicalLicenseNumber ? article.author.medicalLicenseNumber : undefined,
      url: article.author.slug ? `${SITE_URL}/authors/${article.author.slug}` : undefined,
      image: article.author.profileImageUrl,
    };
  }

  if (article.medicalReviews && article.medicalReviews.length > 0) {
    const review = article.medicalReviews.find(r => r.approved);
    if (review && review.reviewer) {
      data.medicalReview = {
        '@type': 'MedicalGuideline',
        author: {
          '@type': 'Organization' as const,
          name: 'تیم پزشکی سالمندیار',
        },
        reviewer: {
          '@type': 'Person' as const,
          name: review.reviewer.fullName,
          jobTitle: review.reviewer.title,
        },
        dateReviewed: formatDate(review.reviewedAt),
      };
      data.reviewedBy = {
        '@type': 'Organization',
        name: 'تیم پزشکی سالمندیار',
      };
    }
  }

  if (article.sources && article.sources.length > 0) {
    data.citation = article.sources.map(s => ({
      '@type': 'CreativeWork',
      headline: s.title,
      url: s.url,
      publisher: s.publisher ? { '@type': 'Organization', name: s.publisher } : undefined,
      datePublished: s.publicationYear ? String(s.publicationYear) : undefined,
    }));
  }

  if (article.isFeatured) {
    data.mainEntityOfPage = true;
  }

  return <Script id={`schema-article-${article.id}`} type="application/ld+json" strategy="afterInteractive">{toJsonLd(data)}</Script>;
}

export function FAQSchema({ faqs, pageUrl }: { faqs: FAQItem[]; pageUrl?: string }) {
  if (!faqs || faqs.length === 0) return null;
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
  return <Script id={`schema-faq-${pageUrl ? `${pageUrl}` : 'gen'}`} type="application/ld+json" strategy="afterInteractive">{toJsonLd(data)}</Script>;
}

export function ServiceSchema({ service, faqs }: { service: ServiceSeoProfile; faqs?: FAQItem[] }) {
  const has24Hour = (service.coverageAreas || []).some(c => c.has24HourService);
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.serviceDefinition?.title,
    serviceType: service.serviceDefinition?.title,
    description: service.longDescription || service.metaDescription,
    provider: {
      '@type': 'LocalBusiness',
      name: 'سالمندیار',
      image: `${SITE_URL}/opengraph-image.svg`,
      url: SITE_URL,
      priceRange: service.startingPrice ? `${service.startingPrice.toLocaleString('fa-IR')} تومان` : undefined,
      openingHours: has24Hour ? 'Mo-Su 00:00-24:00' : undefined,
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'IR',
        addressLocality: 'تهران',
      },
      telephone: '+98-912-8718237',
    },
    areaServed: (service.coverageAreas || []).map(c => ({
      '@type': 'City',
      name: c.areaName || c.district,
    })),
    url: `${SITE_URL}/services/${service.slug}`,
  };

  if (service.startingPrice || service.priceRangeText) {
    data.offers = {
      '@type': 'Offer',
      priceCurrency: 'IRR',
      price: service.startingPrice ? String(service.startingPrice) : undefined,
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    };
  }

  return (
    <>
      <Script id={`schema-service-${service.id}`} type="application/ld+json" strategy="afterInteractive">{toJsonLd(data)}</Script>
      {faqs && faqs.length > 0 && <FAQSchema faqs={faqs} pageUrl={`/services/${service.slug}`} />}
    </>
  );
}

export function DiseaseSchema({ disease }: { disease: Disease }) {
  const symptoms = disease.symptoms ?? [];
  const causes = disease.causes ?? [];
  const riskFactors = disease.riskFactors ?? [];
  const treatment = disease.treatment ?? [];
  const diagnosis = disease.diagnosis ?? [];
  const prevention = disease.prevention ?? [];
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'MedicalCondition',
    name: disease.name,
    alternateName: disease.icd10Code,
    code: disease.icd10Code ? {
      '@type': 'MedicalCode',
      code: disease.icd10Code,
      codingSystem: 'ICD-10',
    } : undefined,
    description: disease.definition,
    symptomsAndSigns: symptoms.length ? symptoms.map(s => ({
      '@type': 'MedicalSignOrSymptom',
      name: s,
    })) : undefined,
    cause: causes.length ? causes.map(c => ({
      '@type': 'MedicalCause',
      name: c,
    })) : undefined,
    riskFactor: riskFactors.length ? riskFactors.map(r => ({
      '@type': 'MedicalRiskFactor',
      name: r,
    })) : undefined,
    possibleTreatment: treatment.length ? treatment.map(t => ({
      '@type': 'MedicalTherapy',
      name: t,
    })) : undefined,
    typicalTest: diagnosis.length ? diagnosis.map(d => ({
      '@type': 'MedicalTest',
      name: d,
    })) : undefined,
    primaryPrevention: prevention.length ? prevention.map(p => ({
      '@type': 'MedicalTherapy',
      name: p,
    })) : undefined,
    url: `${SITE_URL}/diseases/${disease.slug}`,
  };

  if (disease.medicalReviewer) {
    data.reviewedBy = {
      '@type': 'Organization',
      name: 'تیم پزشکی سالمندیار',
      medicalExpert: disease.medicalReviewer.fullName,
    };
  }

  return <Script id={`schema-disease-${disease.id}`} type="application/ld+json" strategy="afterInteractive">{toJsonLd(data)}</Script>;
}

export function LocalBusinessSchema({ city }: { city: City }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `سالمندیار ${city.name}`,
    image: city.coverImageUrl || `${SITE_URL}/opengraph-image.svg`,
    url: `${SITE_URL}/cities/${city.slug}`,
    telephone: city.phoneNumber || '+98-912-8718237',
    priceRange: 'متوسط',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IR',
      addressRegion: city.province,
      addressLocality: city.name,
    },
    geo: (city.latitude && city.longitude) ? {
      '@type': 'GeoCoordinates',
      latitude: city.latitude,
      longitude: city.longitude,
    } : undefined,
    areaServed: (city.coveredAreas || []).length ? city.coveredAreas : undefined,
  };
  return <Script id={`schema-localbusiness-${city.id}`} type="application/ld+json" strategy="afterInteractive">{toJsonLd(data)}</Script>;
}

export function BreadcrumbSchema({ items }: { items: { name: string; item: string }[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: it.name,
      item: `${SITE_URL}${it.item}`,
    })),
  };
  return <Script id={`schema-breadcrumb-${items.length}-${items[items.length - 1]?.item || ''}`} type="application/ld+json" strategy="afterInteractive">{toJsonLd(data)}</Script>;
}

export function AuthorSchema({ author }: { author: Author }) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': author.isMedicalReviewer ? 'Physician' : 'Person',
    name: author.fullName,
    givenName: author.firstName,
    familyName: author.lastName,
    honorificPrefix: author.title,
    jobTitle: author.title,
    knowsAbout: author.specialization,
    hasCredential: author.medicalLicenseNumber,
    image: author.profileImageUrl,
    description: `${author.title} ${author.fullName}، متخصص در حوزه ${author.specialization} با بیش از ${author.yearsOfExperience || 0} سال تجربه کاری`,
    url: `${SITE_URL}/authors/${author.slug}`,
    worksFor: {
      '@type': 'Organization',
      name: 'سالمندیار',
    },
  };
  return <Script id={`schema-author-${author.id}`} type="application/ld+json" strategy="afterInteractive">{toJsonLd(data)}</Script>;
}

export function WebApplicationSchema() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: 'سالمندیار - پلتفرم پرستاری و مراقبت در منزل',
    description: 'ارائه خدمات پرستاری در منزل، پانسمان، تزریقات، مراقبت سالمند و ICU در منزل توسط پرستاران دارای مجوز',
    specialty: 'Nursing',
    medicalAudience: ['patients', 'caregivers'],
  };
  return <Script id="schema-webapp" type="application/ld+json" strategy="afterInteractive">{toJsonLd(data)}</Script>;
}

export interface DrugCalcSchemaItem {
  slug: string;
  persianName: string;
  englishName: string;
  genericName?: string;
  category: string;
  seoDescription: string;
  pagePath: string;
  units: string[];
  faqs: { question: string; answer: string }[];
}

export function DrugCalculatorsCollectionSchema({ items, pagePath }: { items: DrugCalcSchemaItem[]; pagePath: string }) {
  if (!items || items.length === 0) return null;

  const allFaqs = items.flatMap(it => it.faqs.map(f => ({ question: f.question, answer: f.answer })));

  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allFaqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'ماشین حساب محاسبات دارویی | ۱۳ ابزار پرستاری ICU',
    description: 'مجموعه‌ای جامع از ماشین‌حساب‌های دارویی شامل دوپامین، هپارین، اپی نفرین، نیتروگلیسیرین، آمیودارون، فنتانیل، میدازولام، اکتریوتاید، قطره سرم، داروهای درصدی، مبدل واحد و ماشین حساب عمومی.',
    url: `${SITE_URL}${pagePath}`,
    hasPart: items.map(it => ({
      '@type': 'MedicalWebPage' as const,
      name: it.seoDescription.includes('محاسبه') ? it.persianName : `محاسبه ${it.persianName}`,
      description: it.seoDescription,
      url: `${SITE_URL}${pagePath}#${it.slug}`,
      specialty: it.category,
      mainEntity: {
        '@type': 'Drug' as const,
        name: it.persianName,
        alternateName: it.englishName,
        genericName: it.genericName,
        drugClass: it.category,
        availableStrength: it.units,
      },
    })),
  };

  const medicalOrgSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    name: 'سالمندیار | تیم پزشکی و پرستاری',
    description: 'تیم پرستاری و پزشکی سالمندیار، تهیه‌کننده محتوای تأیید شده پزشکی و ابزارهای محاسبات دارویی.',
    url: SITE_URL,
    medicalSpecialty: ['Nursing', 'Critical Care Medicine', 'Emergency Medicine'],
  };

  return (
    <>
      <Script id="schema-drug-faq-collection" type="application/ld+json" strategy="afterInteractive">{toJsonLd(faqData)}</Script>
      <Script id="schema-drug-calc-collection" type="application/ld+json" strategy="afterInteractive">{toJsonLd(collectionSchema)}</Script>
      <Script id="schema-drug-medorg" type="application/ld+json" strategy="afterInteractive">{toJsonLd(medicalOrgSchema)}</Script>
    </>
  );
}

