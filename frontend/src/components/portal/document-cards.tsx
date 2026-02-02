"use client";

import { PortalCard } from "./ui/portal-card";
import { FileIcon, FileText, ImageIcon } from "lucide-react";

export function DocumentCards() {
  const docs = [
    { id: 1, title: "نسخه داروخانه", type: "pdf", date: "۱۴۰۲/۱۰/۱۵", icon: FileText, color: "text-red-500 bg-red-50" },
    { id: 2, title: "جواب آزمایش خون", type: "image", date: "۱۴۰۲/۱۰/۱۲", icon: ImageIcon, color: "text-blue-500 bg-blue-50" },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-gray-800 mb-4">مدارک پزشکی</h2>
      <div className="grid grid-cols-2 gap-3">
        {docs.map((doc) => (
          <PortalCard key={doc.id} className="flex flex-col items-center text-center gap-2" variant="highlight">
            <div className={`p-3 rounded-full ${doc.color} mb-1`}>
              <doc.icon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-800 text-sm">{doc.title}</h3>
            <span className="text-xs text-gray-500">{doc.date}</span>
          </PortalCard>
        ))}
      </div>
    </div>
  );
}
