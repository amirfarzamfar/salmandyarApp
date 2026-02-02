'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Settings, 
  LogOut, 
  Shield, 
  Phone, 
  Mail, 
  Calendar,
  ChevronLeft,
  Activity,
  ClipboardList,
  Clock,
  Heart
} from 'lucide-react';
import { nursePortalService } from '@/services/nurse-portal.service';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function NurseProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    patients: 0,
    reports: 0,
    services: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        // In a real app, we'd fetch actual profile and stats
        // For now, we'll simulate it with the available services
        const [userData, patients] = await Promise.all([
          nursePortalService.getProfile(),
          nursePortalService.getMyPatients()
        ]);
        
        setProfile(userData);
        setStats({
          patients: patients.length,
          reports: 12, // Mock data
          services: 45  // Mock data
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('خطا در دریافت اطلاعات پروفایل');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('با موفقیت خارج شدید');
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-medical-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-medical-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-8 pb-24">
      {/* Header Profile Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative pt-12 pb-8 px-6 text-center"
      >
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-medical-50 to-transparent dark:from-medical-900/20 -z-10 rounded-b-[3rem]" />
        
        <div className="absolute top-4 left-6">
          <ThemeToggle />
        </div>

        <div className="relative inline-block">
          <div className="w-28 h-28 rounded-[2rem] bg-white dark:bg-gray-800 shadow-soft-xl border-4 border-white dark:border-gray-700 overflow-hidden flex items-center justify-center mx-auto">
            {profile?.avatar ? (
              <img src={profile.avatar} alt={profile.firstName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-medical-50 dark:bg-medical-900/30 flex items-center justify-center">
                <User size={48} className="text-medical-500 dark:text-medical-400" />
              </div>
            )}
          </div>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 border-4 border-white dark:border-gray-800 rounded-full"
          />
        </div>

        <div className="mt-6 space-y-1">
          <h1 className="text-2xl font-black text-gray-800 dark:text-gray-100">
            {profile?.firstName} {profile?.lastName}
          </h1>
          <p className="text-medical-600 dark:text-medical-400 font-medium flex items-center justify-center gap-1.5">
            <Shield size={14} />
            {profile?.role === 'nurse' ? 'پرستار متخصص' : 'مراقب سلامت'}
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 px-4">
        {[
          { label: 'بیماران', value: stats.patients, icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
          { label: 'گزارش‌ها', value: stats.reports, icon: ClipboardList, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'خدمات', value: stats.services, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' }
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * idx }}
            className="bg-white dark:bg-gray-800 p-4 rounded-[2rem] shadow-soft-sm border border-gray-100 dark:border-gray-700 text-center space-y-2"
          >
            <div className={cn("w-10 h-10 rounded-2xl mx-auto flex items-center justify-center", stat.bg)}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <div>
              <div className="text-lg font-black text-gray-800 dark:text-gray-100">{stat.value}</div>
              <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Info Sections */}
      <div className="px-4 space-y-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-[2.5rem] p-6 shadow-soft-sm border border-white/50 dark:border-gray-700/50 space-y-5"
        >
          <h3 className="text-sm font-black text-gray-800 dark:text-gray-100 flex items-center gap-2 px-1">
            <Settings size={18} className="text-medical-500 dark:text-medical-400" />
            اطلاعات کاربری
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50/50 dark:bg-gray-700/50">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-600 flex items-center justify-center text-gray-400 dark:text-gray-300 shadow-sm">
                <Phone size={18} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500">شماره تماس</div>
                <div className="text-sm font-bold text-gray-700 dark:text-gray-200">{profile?.phoneNumber || '۰۹۱۲۳۴۵۶۷۸۹'}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50/50 dark:bg-gray-700/50">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-600 flex items-center justify-center text-gray-400 dark:text-gray-300 shadow-sm">
                <Mail size={18} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500">ایمیل</div>
                <div className="text-sm font-bold text-gray-700 dark:text-gray-200">{profile?.email || 'nurse@example.com'}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50/50 dark:bg-gray-700/50">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-600 flex items-center justify-center text-gray-400 dark:text-gray-300 shadow-sm">
                <Calendar size={18} />
              </div>
              <div>
                <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500">تاریخ عضویت</div>
                <div className="text-sm font-bold text-gray-700 dark:text-gray-200">۱۴۰۲/۰۵/۱۵</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <button className="w-full group flex items-center justify-between p-5 bg-white dark:bg-gray-800 rounded-[2rem] shadow-soft-sm border border-gray-100 dark:border-gray-700 hover:border-medical-200 dark:hover:border-medical-800 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-medical-50 dark:bg-medical-900/20 text-medical-500 dark:text-medical-400 flex items-center justify-center transition-colors group-hover:bg-medical-100 dark:group-hover:bg-medical-900/30">
                <Settings size={20} />
              </div>
              <span className="font-bold text-gray-700 dark:text-gray-200">تنظیمات حساب کاربری</span>
            </div>
            <ChevronLeft size={18} className="text-gray-300 dark:text-gray-600 group-hover:text-medical-500 dark:group-hover:text-medical-400 transition-colors" />
          </button>

          <button 
            onClick={handleLogout}
            className="w-full group flex items-center justify-between p-5 bg-rose-50/50 dark:bg-rose-900/20 rounded-[2rem] border border-rose-100/50 dark:border-rose-900/30 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-white dark:bg-gray-800 text-rose-500 flex items-center justify-center shadow-sm">
                <LogOut size={20} />
              </div>
              <span className="font-bold text-rose-600 dark:text-rose-400">خروج از حساب</span>
            </div>
            <ChevronLeft size={18} className="text-rose-300 dark:text-rose-500" />
          </button>
        </motion.div>
      </div>

      {/* App Version */}
      <div className="text-center pb-8">
        <p className="text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-[0.2em]">
          Salmandyar Nurse Portal • v1.2.0
        </p>
      </div>
    </div>
  );
}
