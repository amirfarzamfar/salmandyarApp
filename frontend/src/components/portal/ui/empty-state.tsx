import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-10 px-4", className)}>
      <div className="w-20 h-20 bg-medical-50 rounded-full flex items-center justify-center mb-4 text-medical-400">
        <Icon className="w-10 h-10 opacity-80" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-bold text-gray-700 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-xs text-sm leading-relaxed">{description}</p>
    </div>
  );
}
