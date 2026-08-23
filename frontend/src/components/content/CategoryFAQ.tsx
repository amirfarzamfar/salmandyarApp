'use client';

import { useState, useId } from 'react';
import { ChevronUp } from 'lucide-react';
import type { FAQItem } from '@/lib/types/content';

interface CategoryFAQProps {
  sectionTitle: string;
  faqs: FAQItem[];
}

export default function CategoryFAQ({ sectionTitle, faqs }: CategoryFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const headingId = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="mt-16 sm:mt-20"
    >
      <div className="flex items-center gap-3 mb-8">
        <span className="w-1.5 h-10 rounded-full bg-amber-500" aria-hidden="true" />
        <div>
          <h2 id={headingId} className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
            {sectionTitle}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            پاسخ مستقیم به متداول‌ترین سوالات کاربران
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          const buttonId = `faq-btn-${faq.id}-${idx}`;
          const panelId = `faq-panel-${faq.id}-${idx}`;
          return (
            <div
              key={faq.id}
              className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                isOpen
                  ? 'border-teal-200 shadow-lg shadow-teal-50/40 ring-1 ring-teal-50'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <h3>
                <button
                  id={buttonId}
                  type="button"
                  className="w-full flex items-center justify-between gap-4 text-right p-5 sm:p-6 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                >
                  <span className="font-bold text-gray-900 text-base sm:text-lg leading-relaxed text-right">
                    {faq.question}
                  </span>
                  <ChevronUp
                    size={20}
                    strokeWidth={2.5}
                    className={`flex-shrink-0 text-teal-600 transition-transform duration-300 ${
                      isOpen ? '' : 'rotate-180'
                    }`}
                    aria-hidden="true"
                  />
                </button>
              </h3>
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className={`transition-all duration-300 overflow-hidden ${
                  isOpen ? 'max-h-[800px]' : 'max-h-0'
                }`}
              >
                <div className="px-5 sm:px-6 pb-6 pt-0 border-t border-gray-50">
                  <p className="text-gray-700 leading-8 text-sm sm:text-base pt-4">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
