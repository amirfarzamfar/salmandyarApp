import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface HealthTestCategorySectionProps {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
}

export default function HealthTestCategorySection({
  id,
  eyebrow,
  title,
  description,
  action,
  children,
  className,
  headerClassName,
}: HealthTestCategorySectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={id ? `${id}-heading` : undefined}
      className={cn('mb-14 sm:mb-16', className)}
    >
      <header
        className={cn(
          'flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-4',
          headerClassName,
        )}
      >
        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="inline-flex items-center text-xs font-black uppercase tracking-widest text-teal-700 bg-teal-50 border border-teal-100 px-3 py-1 rounded-full mb-3">
              {eyebrow}
            </p>
          ) : null}
          <h2
            id={id ? `${id}-heading` : undefined}
            className="font-black text-2xl sm:text-3xl lg:text-4xl text-slate-900 leading-tight"
          >
            {title}
          </h2>
          {description ? (
            <p className="mt-2.5 text-slate-600 leading-relaxed text-sm sm:text-base max-w-2xl">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
      {children}
    </section>
  );
}
