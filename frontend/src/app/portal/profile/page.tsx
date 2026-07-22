'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@/components/auth/UserContext';
import { Edit, Loader2 } from 'lucide-react';
import PatientProfileTab from '@/components/patients/tabs/PatientProfileTab';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function MyProfilePage() {
  const router = useRouter();
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto px-4 py-8 pb-24"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">پرونده پزشکی من</h1>
          <p className="text-sm text-gray-500 mt-1">مشاهده اطلاعات جامع درمانی شما</p>
        </div>
        <Link href="/portal/profile-wizard">
          <button className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-100 transition-colors">
            <Edit className="w-4 h-4" />
            ویرایش
          </button>
        </Link>
      </div>

      <PatientProfileTab userId={user.id} />
    </motion.div>
  );
}
