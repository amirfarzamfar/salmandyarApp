"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { label: "خانه", href: "/portal" },
  { label: "پروفایل", href: "/portal/profile" },
  { label: "آزمون‌ها", href: "/portal/assessments" },
];

export function PortalSectionNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-4 overflow-x-auto sm:mb-6" aria-label="ناوبری پورتال">
      <div className="flex min-w-max items-center gap-2 rounded-2xl bg-white/80 p-2 shadow-sm ring-1 ring-gray-100 backdrop-blur">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-black transition-colors",
                active
                  ? "bg-medical-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

