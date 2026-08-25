import { LayoutList, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = "list" | "calendar";

interface ViewSwitcherProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewSwitcher({ mode, onChange }: ViewSwitcherProps) {
  const buttons: { key: ViewMode; label: string; icon: React.ComponentType<{ className?: string; size?: number }> }[] = [
    { key: "list", label: "لیست", icon: LayoutList },
    { key: "calendar", label: "تقویم", icon: Calendar },
  ];

  return (
    <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800/60">
      {buttons.map(({ key, label, icon: Icon }) => {
        const isActive = mode === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all",
              isActive
                ? "bg-white text-teal-700 shadow-sm dark:bg-slate-700 dark:text-teal-400"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            )}
          >
            <Icon size={16} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
