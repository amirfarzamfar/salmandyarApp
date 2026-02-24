'use client';

import { useUser } from '@/components/auth/UserContext';
import { useQuery } from '@tanstack/react-query';
import { assessmentService } from '@/services/assessment.service';
import { AssessmentType } from '@/types/assessment';
import Link from 'next/link';
import { AlertCircle, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { userEvaluationService } from '@/services/user-evaluation.service';

export default function PendingEvaluationNotification() {
    const { user } = useUser();

    // Determine relevant assessment types based on user role
    const getRelevantTypes = () => {
        if (!user) return [];
        const types: AssessmentType[] = [];
        
        // Legacy types
        if (user.role === 'Nurse') types.push(AssessmentType.NurseAssessment, AssessmentType.SpecializedAssessment);
        if (user.role === 'Senior' || user.role === 'Family') types.push(AssessmentType.SeniorAssessment);
        
        // New Role-based type
        const roleType = AssessmentType[user.role as keyof typeof AssessmentType];
        if (typeof roleType === 'number') {
             types.push(roleType);
        }
        
        return [...new Set(types)];
    };

    const types = getRelevantTypes();

    const { data: pendingForms, isLoading } = useQuery({
        queryKey: ['pending-evaluations', user?.id],
        queryFn: async () => {
            if (!types.length) return [];
            // Fetch for all relevant types
            const promises = types.map(type => {
                if (type >= 10) {
                    return userEvaluationService.getAvailableEvaluations(type);
                }
                return assessmentService.getAvailableExams(type);
            });
            
            const results = await Promise.all(promises);
            // Flatten and remove duplicates by ID just in case
            const allForms = results.flat();
            const uniqueForms = Array.from(new Map(allForms.map(item => [item.id, item])).values());
            
            // Filter out exams if any slipped through (though getAvailableExams(type) handles it)
            return uniqueForms.filter(f => f.type !== AssessmentType.Exam);
        },
        enabled: !!user && types.length > 0,
    });

    if (!user || isLoading || !pendingForms || pendingForms.length === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 shadow-sm"
            >
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-xl text-amber-600 dark:text-amber-400">
                        <AlertCircle size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">
                            تکمیل اطلاعات کاربری
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                            کاربر گرامی، جهت بهبود خدمات و تطبیق هوشمند، لطفاً فرم‌های ارزیابی زیر را تکمیل نمایید.
                        </p>
                        <div className="space-y-2">
                            {pendingForms.map((form: any) => (
                                <Link 
                                    key={form.id} 
                                    href={user.role === 'Nurse' 
                                        ? `/nurse-portal/assessments/${form.id}${form.type >= 10 ? '?source=user-eval' : ''}`
                                        : `/portal/assessments/${form.id}${form.type >= 10 ? '?source=user-eval' : ''}`}
                                    className="block"
                                >
                                    <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-xl border border-amber-100 dark:border-amber-800/50 hover:border-amber-300 dark:hover:border-amber-600 transition-colors group cursor-pointer">
                                        <span className="font-bold text-sm text-gray-700 dark:text-gray-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                            {form.title}
                                        </span>
                                        <ChevronLeft size={16} className="text-gray-400 group-hover:text-amber-600 transition-colors" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
