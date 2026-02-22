import React from 'react';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import TimePicker from 'react-multi-date-picker/plugins/time_picker';
import { Clock, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimeListSelectorProps {
  value: string[];
  onChange: (times: string[]) => void;
  className?: string;
}

export const TimeListSelector = ({ value = [], onChange, className }: TimeListSelectorProps) => {
  const times = value.length > 0 ? value : [''];

  const updateTime = (index: number, newTime: string) => {
    const newTimes = [...times];
    newTimes[index] = newTime;
    onChange(newTimes);
  };

  const addTime = () => {
    onChange([...times, '']);
  };

  const removeTime = (index: number) => {
    const newTimes = times.filter((_, i) => i !== index);
    onChange(newTimes.length ? newTimes : ['']);
  };

  const commonTimes = ["08:00", "12:00", "14:00", "18:00", "20:00", "22:00"];

  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {times.map((time, index) => (
          <div key={index} className="relative group">
            <DatePicker
              disableDayPicker
              format="HH:mm"
              plugins={[<TimePicker hideSeconds />]}
              value={time || ''}
              onChange={(date: any) => {
                const formatted = date?.format ? date.format('HH:mm') : '';
                updateTime(index, formatted);
              }}
              calendar={persian}
              locale={persian_fa}
              calendarPosition="bottom-right"
              render={(value, openCalendar) => (
                <button
                  type="button"
                  onClick={openCalendar}
                  className={cn(
                    "flex items-center justify-center gap-2 w-full py-3 px-3 bg-white border rounded-xl transition-all",
                    value ? "border-teal-200 bg-teal-50/30 text-teal-900" : "border-gray-200 text-gray-400 hover:border-teal-300"
                  )}
                >
                  <Clock className={cn("w-4 h-4", value ? "text-teal-600" : "text-gray-400")} />
                  <span className="font-mono text-lg font-medium tracking-wider">
                    {value || '--:--'}
                  </span>
                </button>
              )}
            />
            {times.length > 1 && (
              <button
                type="button"
                onClick={() => removeTime(index)}
                className="absolute -top-2 -right-2 bg-white rounded-full p-1 text-red-400 hover:text-red-600 shadow-sm border border-gray-100 hover:border-red-100 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
        
        <button
          type="button"
          onClick={addTime}
          className="flex items-center justify-center gap-2 py-3 px-3 border border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50/50 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm font-medium">افزودن</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        <span className="text-xs text-gray-400 py-1">پیشنهادی:</span>
        {commonTimes.map(t => (
          <button
            key={t}
            type="button"
            onClick={() => {
              // Find first empty slot or add new
              const emptyIndex = times.findIndex(v => !v);
              if (emptyIndex !== -1) {
                updateTime(emptyIndex, t);
              } else {
                onChange([...times, t]);
              }
            }}
            className="px-2.5 py-1 text-xs bg-gray-50 hover:bg-teal-50 text-gray-500 hover:text-teal-700 border border-gray-200 hover:border-teal-200 rounded-lg transition-colors"
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
};
