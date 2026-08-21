'use client';

import { useState, useId, useCallback } from 'react';
import { ChevronLeft } from 'lucide-react';
import type { DrugFAQ } from '@/lib/data/drug-content';

interface DrugFAQAccordionProps {
  faqs: DrugFAQ[];
  accentClass?: string;
}

export default function DrugFAQAccordion({ faqs, accentClass = 'purple' }: DrugFAQAccordionProps) {
  const [openMap, setOpenMap] = useState<Record<number, boolean>>({});
  const groupId = useId();

  const styleByAccent: Record<string, { ring: string; border: string; icon: string; title: string; head: string }> = {
    purple: {
      ring: 'ring-purple-500/20',
      border: 'border-purple-100',
      icon: 'bg-purple-500 border-purple-500 text-white',
      title: 'text-purple-700',
      head: 'bg-white/70 border border-gray-100 open:bg-purple-50 open:border-purple-200',
    },
    emerald: {
      ring: 'ring-emerald-500/20',
      border: 'border-emerald-100',
      icon: 'bg-emerald-500 border-emerald-500 text-white',
      title: 'text-emerald-700',
      head: 'bg-white/70 border border-gray-100 open:bg-emerald-50 open:border-emerald-200',
    },
    indigo: {
      ring: 'ring-indigo-500/20',
      border: 'border-indigo-100',
      icon: 'bg-indigo-500 border-indigo-500 text-white',
      title: 'text-indigo-700',
      head: 'bg-white/70 border border-gray-100 open:bg-indigo-50 open:border-indigo-200',
    },
  };
  const style = styleByAccent[accentClass] || styleByAccent.purple;

  const toggle = useCallback((id: number) => {
    setOpenMap(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, id: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle(id);
    }
  };

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => {
        const isOpen = !!openMap[faq.id];
        const panelId = `${groupId}-panel-${faq.id}`;
        const buttonId = `${groupId}-btn-${faq.id}`;
        return (
          <div
            key={faq.id}
            className={`group rounded-2xl bg-gray-50 border border-gray-100 transition-all ${isOpen ? `${style.head} shadow-lg shadow-gray-100/60` : ''}`}
            data-open={isOpen}
          >
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(faq.id)}
                onKeyDown={e => handleKeyDown(e, faq.id)}
                className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 text-right cursor-pointer"
              >
                <span className="flex items-start gap-3 min-w-0 flex-1 text-right">
                  <span
                    className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-black text-xs border transition ${isOpen ? style.icon : 'bg-white border-gray-200 text-gray-500'}`}
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <span className={`leading-relaxed font-bold text-gray-900 text-right ${isOpen ? style.title : ''}`}>
                    {faq.question}
                  </span>
                </span>
                <ChevronLeft
                  size={20}
                  className={`text-gray-400 shrink-0 transition-transform duration-300 ${isOpen ? '-rotate-90 text-purple-500' : ''}`}
                  aria-hidden="true"
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className={`${isOpen ? 'animate-[fadeIn_0.2s_ease-out]' : ''}`}
            >
              <div className="px-5 pb-5 pr-[4.25rem] pt-1 border-t border-gray-200/60 mt-1 pt-4">
                {faq.direct && (
                  <div className={`mb-3 inline-block px-3 py-1.5 rounded-xl bg-gray-900/5 text-gray-800 text-xs sm:text-sm font-black border border-gray-200 ${isOpen ? 'bg-purple-50 text-purple-800 border-purple-100' : ''}`}>
                    پاسخ مستقیم: {faq.direct}
                  </div>
                )}
                <p className="text-gray-700 leading-loose text-sm sm:text-base">
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
