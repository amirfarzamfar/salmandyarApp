import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-2xl bg-medical-100/50", className)}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-[32px] bg-white p-6 shadow-soft-lg space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-24 w-full rounded-2xl" />
    </div>
  );
}
