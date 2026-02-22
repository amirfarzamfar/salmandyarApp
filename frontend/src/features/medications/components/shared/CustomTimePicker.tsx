import React from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const CustomTimePicker = ({ value, onChange, className }: CustomTimePickerProps) => {
  // Parse existing value or default to current time or 08:00
  const [hour, minute] = (value && value.includes(':')) 
    ? value.split(':') 
    : ['08', '00'];

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const allMinutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const handleChange = (type: 'hour' | 'minute', val: string) => {
    if (type === 'hour') {
      onChange(`${val}:${minute}`);
    } else {
      onChange(`${hour}:${val}`);
    }
  };

  return (
    <div className={cn(
      "flex items-center gap-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1.5 focus-within:ring-2 focus-within:ring-teal-100 focus-within:border-teal-500 transition-all w-fit direction-ltr",
      className
    )} dir="ltr">
      
      {/* Icon (Left side in LTR) */}
      <div className="pl-1 pr-2 text-gray-400">
        <Clock className="w-4 h-4" />
      </div>

      {/* Hour Select */}
      <div className="relative">
        <select
          value={hour}
          onChange={(e) => handleChange('hour', e.target.value)}
          className="appearance-none bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-center font-mono text-base font-semibold text-gray-800 dark:text-gray-100 rounded-md py-1 w-12 focus:outline-none focus:border-teal-500 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          {hours.map((h) => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>
      </div>

      <span className="text-gray-400 font-bold px-0.5">:</span>

      {/* Minute Select */}
      <div className="relative">
        <select
          value={minute}
          onChange={(e) => handleChange('minute', e.target.value)}
          className="appearance-none bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-center font-mono text-base font-semibold text-gray-800 dark:text-gray-100 rounded-md py-1 w-12 focus:outline-none focus:border-teal-500 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          {allMinutes.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

    </div>
  );
};
