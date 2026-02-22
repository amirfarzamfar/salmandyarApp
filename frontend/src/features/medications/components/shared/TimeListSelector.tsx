import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CustomTimePicker } from './CustomTimePicker';

interface TimeListSelectorProps {
  value: string[];
  onChange: (times: string[]) => void;
  className?: string;
}

export const TimeListSelector = ({ value = [], onChange, className }: TimeListSelectorProps) => {
  // Ensure we always have at least one input if empty?
  // Or allow empty list? The previous code ensured at least one empty string.
  // Let's stick to allowing empty, but if the user wants to add, they click add.
  // But usually for "Daily", we want at least one time.
  const times = value.length > 0 ? value : ['08:00'];

  const updateTime = (index: number, newTime: string) => {
    const newTimes = [...times];
    newTimes[index] = newTime;
    onChange(newTimes);
  };

  const addTime = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    onChange([...times, '08:00']);
  };

  const removeTime = (index: number) => {
    const newTimes = times.filter((_, i) => i !== index);
    onChange(newTimes.length ? newTimes : ['08:00']);
  };

  const commonTimes = ["08:00", "12:00", "14:00", "18:00", "20:00", "22:00"];

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {times.map((time, index) => (
          <div key={index} className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-teal-200 transition-colors">
             <div className="flex-1">
                <CustomTimePicker
                    value={time}
                    onChange={(val) => updateTime(index, val)}
                    className="w-full bg-transparent border-0 shadow-none focus-within:ring-0 p-0"
                />
            </div>
            
            {times.length > 1 && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        removeTime(index);
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="حذف زمان"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            )}
          </div>
        ))}
         
         <button
            type="button"
            onClick={addTime}
            className="flex items-center justify-center gap-2 text-teal-600 hover:text-teal-700 font-medium p-2 border border-dashed border-teal-300 bg-teal-50/50 hover:bg-teal-50 rounded-xl transition-all h-full min-h-[50px]"
        >
            <Plus className="w-5 h-5" />
            <span>افزودن</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2 justify-start border-t border-gray-100 pt-4">
            <span className="text-xs text-gray-400 py-1 pl-2">زمان‌های پیشنهادی:</span>
            {commonTimes.map(t => (
                <button
                    key={t}
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        // Append logic: add new time if the list has changed
                        onChange([...times, t]);
                    }}
                    className="px-2 py-1 text-xs bg-gray-50 text-gray-500 border border-gray-200 rounded-md hover:border-teal-300 hover:text-teal-600 hover:bg-teal-50 transition-all"
                >
                    {t}
                </button>
            ))}
        </div>
    </div>
  );
};
