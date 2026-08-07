import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import GuestRequestSection from '@/components/landing/GuestRequestSection';
import ServicesSection from '@/components/landing/ServicesSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import ProcessSection from '@/components/landing/ProcessSection';
import RecentArticlesSection from '@/components/landing/RecentArticlesSection';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <div className="min-h-screen font-sans text-slate-900">
      <Navbar />
      <main>
        <HeroSection />
        <GuestRequestSection />
        <ServicesSection />
        <RecentArticlesSection />
        <FeaturesSection />
        <ProcessSection />
      </main>
      <Footer />
    </div>
  );
}
