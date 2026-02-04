'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { assessmentService } from '@/services/assessment.service';
import { Search, UserCheck, Star, Brain, CheckCircle } from 'lucide-react';

export default function MatchingPage() {
  const [seniorId, setSeniorId] = useState('');
  const [searchTrigger, setSearchTrigger] = useState('');

  const { data: matchingResult, isLoading, error } = useQuery({
    queryKey: ['matching', searchTrigger],
    queryFn: () => assessmentService.findMatches(searchTrigger),
    enabled: !!searchTrigger,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (seniorId.trim()) {
      setSearchTrigger(seniorId);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Brain className="text-teal-400" />
          سیستم تطبیق هوشمند
        </h1>
        <p className="text-slate-400">
          شناسه کاربری سالمند یا بیمار را وارد کنید تا سیستم بهترین پرستاران را بر اساس نیازها و شخصیت پیشنهاد دهد.
        </p>
      </div>

      {/* Search Box */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
        <form onSubmit={handleSearch} className="flex gap-4 items-end">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-slate-300">شناسه سالمند / بیمار</label>
            <div className="relative">
              <input
                value={seniorId}
                onChange={(e) => setSeniorId(e.target.value)}
                placeholder="مثال: user-123-abc..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-4 pr-10 py-3 text-white focus:ring-2 focus:ring-teal-500 outline-none transition-all"
              />
              <Search className="absolute left-3 top-3.5 text-slate-500 w-5 h-5" />
            </div>
          </div>
          <button
            type="submit"
            className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Search size={18} />
            جستجو و تحلیل
          </button>
        </form>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {isLoading && (
           <div className="text-center py-12">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
             <p className="text-slate-400">در حال تحلیل داده‌ها و محاسبه امتیاز تطابق...</p>
           </div>
        )}

        {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg text-center">
                خطا در دریافت اطلاعات. لطفا شناسه را بررسی کنید.
            </div>
        )}

        {matchingResult && matchingResult.topMatches.length === 0 && (
             <div className="bg-slate-800/50 border border-slate-700 text-slate-400 p-8 rounded-lg text-center">
                هیچ پرستار منطبقی یافت نشد. اطمینان حاصل کنید که فرم‌های ارزیابی توسط پرستاران و بیمار پر شده‌اند.
            </div>
        )}

        {matchingResult && matchingResult.topMatches.length > 0 && (
          <>
            <h2 className="text-xl font-bold text-white mb-4">نتایج تحلیل و پیشنهادات برتر</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchingResult.topMatches.map((match, index) => (
                <div key={match.caregiverId} className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-teal-500/50 transition-all group relative">
                   {/* Rank Badge */}
                   <div className="absolute top-0 right-0 bg-slate-700 px-3 py-1 rounded-bl-xl text-xs font-bold text-white border-b border-l border-slate-600">
                      رتبه {index + 1}
                   </div>

                   <div className="p-6 space-y-4">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-teal-400">
                            <UserCheck size={24} />
                         </div>
                         <div>
                            <h3 className="font-bold text-white text-lg">{match.caregiverName}</h3>
                            <span className="text-xs text-slate-400">پرستار تایید شده</span>
                         </div>
                      </div>

                      <div className="space-y-2">
                         <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">امتیاز تطابق:</span>
                            <span className="font-bold text-teal-400 text-lg">{Math.round(match.matchingScore)}%</span>
                         </div>
                         <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                            <div 
                                className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-1000"
                                style={{ width: `${match.matchingScore}%` }}
                            ></div>
                         </div>
                      </div>

                      <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                         <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                            <CheckCircle size={12} className="text-emerald-500" />
                            دلیل پیشنهاد:
                         </p>
                         <p className="text-sm text-slate-300 leading-relaxed">
                            {match.reason}
                         </p>
                      </div>

                      <button className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors">
                         مشاهده پروفایل کامل
                      </button>
                   </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
