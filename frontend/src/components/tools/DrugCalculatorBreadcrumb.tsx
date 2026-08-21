'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Home } from 'lucide-react';
import type { BreadcrumbItem } from '@/lib/types/content';
import { BreadcrumbSchema } from '@/lib/seo/structured-data';
import { DrugCalcTabId, DRUG_CALC_TAB_IDS } from './DrugDosageCalculatorTool';
import { getDrugContent } from '@/lib/data/drug-content';

const slugToTabId = (slug: string | null | undefined): DrugCalcTabId => {
  if (!slug) return 'heparin';
  const clean = slug.replace(/^#/, '').trim();
  if ((DRUG_CALC_TAB_IDS as readonly string[]).includes(clean)) return clean as DrugCalcTabId;
  return 'heparin';
};

export default function DrugCalculatorBreadcrumb({
  basePageName,
  basePageHref,
}: {
  basePageName: string;
  basePageHref: string;
}) {
  const [activeTab, setActiveTab] = useState<DrugCalcTabId | null>(null);
  const [, forceTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const readHash = () => slugToTabId(typeof window !== 'undefined' ? window.location.hash : '');
    const schedule = () => {
      if (cancelled) return;
      queueMicrotask(() => {
        if (cancelled) return;
        setActiveTab(readHash());
        forceTick(n => n + 1);
      });
    };
    schedule();
    const onHashChange = () => schedule();
    window.addEventListener('hashchange', onHashChange);
    return () => {
      cancelled = true;
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  const mounted = typeof window !== 'undefined';
  const items: BreadcrumbItem[] = [
    { name: 'خانه', href: '/' },
    { name: 'ابزارهای سلامت', href: '/tools' },
    { name: basePageName, href: basePageHref },
  ];
  if (mounted && activeTab) {
    const drug = getDrugContent(activeTab);
    items.push({
      name: drug.persianName,
      href: `${basePageHref}#${activeTab}`,
    });
  }

  const schemaItems = items.map(i => ({ name: i.name, item: i.href }));

  return (
    <>
      <BreadcrumbSchema items={schemaItems} />
      <nav aria-label="breadcrumb" className="mb-6 -mt-2">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-gray-500">
          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;
            return (
              <li key={`${item.href}-${idx}`} className="flex items-center gap-1.5">
                {idx > 0 && (
                  <ChevronLeft size={14} className="text-gray-300" />
                )}
                {isLast ? (
                  <span className="font-bold text-gray-700 truncate max-w-[200px] sm:max-w-[300px]" title={item.name}>
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="hover:text-teal-600 transition flex items-center gap-1 truncate max-w-[150px] sm:max-w-[200px]"
                  >
                    {idx === 0 && <Home size={14} />}
                    <span className="truncate">{item.name}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
