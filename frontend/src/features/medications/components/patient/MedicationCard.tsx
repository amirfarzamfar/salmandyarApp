import { useState } from 'react';
import { ChevronDown, ChevronUp, Pill, Clock, AlertTriangle, Info } from 'lucide-react';
import { format } from 'date-fns';

interface MedicationCardProps {
  medication: any;
}

export const MedicationCard = ({ medication }: MedicationCardProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div className="bg-teal-50 p-3 rounded-xl text-teal-600">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">{medication.name}</h3>
            <p className="text-sm text-gray-500 font-medium">{medication.dosage} - {medication.route}</p>
          </div>
        </div>
        
        <button className="text-gray-400">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {expanded && (
        <div className="p-4 pt-0 border-t border-gray-50 bg-gray-50/30">
          <div className="grid grid-cols-1 gap-4 mt-4">
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-teal-600 mt-1" />
              <div>
                <span className="text-sm font-semibold text-gray-700 block">زمان‌بندی:</span>
                <p className="text-sm text-gray-600">{medication.frequencyType === 0 ? 'روزانه' : '...'} - {medication.frequencyDetail}</p>
              </div>
            </div>

            {medication.instructions && (
              <div className="flex items-start gap-3">
                <Info className="w-4 h-4 text-blue-600 mt-1" />
                <div>
                  <span className="text-sm font-semibold text-gray-700 block">دستور مصرف:</span>
                  <p className="text-sm text-gray-600 leading-relaxed">{medication.instructions}</p>
                </div>
              </div>
            )}

            {medication.highAlert && (
              <div className="flex items-start gap-3 bg-red-50 p-3 rounded-lg border border-red-100">
                <AlertTriangle className="w-4 h-4 text-red-600 mt-1" />
                <div>
                  <span className="text-sm font-bold text-red-700 block">هشدار مهم:</span>
                  <p className="text-xs text-red-600">این دارو حساس است و باید با دقت زیاد مصرف شود.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
