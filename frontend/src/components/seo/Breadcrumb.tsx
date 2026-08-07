'use client';

import Link from 'next/link';
import { ChevronLeft, Home } from 'lucide-react';
import type { BreadcrumbItem } from '@/lib/types/content';
import { BreadcrumbSchema } from '@/lib/seo/structured-data';

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  const fullItems: BreadcrumbItem[] = [
    { name: 'خانه', href: '/' },
    ...items,
  ];

  return (
    <>
      <BreadcrumbSchema items={fullItems.map(i => ({ name: i.name, item: i.href }))} />
      <nav aria-label="breadcrumb" className="mb-6 -mt-2">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-gray-500">
          {fullItems.map((item, idx) => {
            const isLast = idx === fullItems.length - 1;
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
