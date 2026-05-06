'use client';

import { Check } from 'lucide-react';

export function RecipientChip({ label, icon: Icon, checked, onClick }: { label: string; icon: any; checked: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
        checked ? 'bg-teal-50 border-teal-200 text-teal-700 shadow-sm' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
      }`}
    >
      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${checked ? 'bg-teal-100' : 'bg-gray-100'}`}>
        {checked ? <Check className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

