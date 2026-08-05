import Link from 'next/link';
import { cn } from '@/lib/utils';

type AuthBrandLinkProps = {
  className?: string;
};

export function AuthBrandLink({ className }: AuthBrandLinkProps) {
  return (
    <Link
      href="/"
      aria-label="سالمندیار"
      className={cn(
        'flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50 dark:focus-visible:ring-offset-gray-900',
        className
      )}
    >
      <span className="text-xl sm:text-2xl font-bold text-teal-600 dark:text-teal-400 leading-none">
        سالمندیار
      </span>
    </Link>
  );
}
