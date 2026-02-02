import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import ServicesSection from '@/components/landing/ServicesSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import ProcessSection from '@/components/landing/ProcessSection';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <div className="min-h-screen font-sans text-slate-900">
      <Navbar />
      <main>
        <HeroSection />
        <ServicesSection />
        <FeaturesSection />
        <ProcessSection />
      </main>
      <Footer />
    </div>
  );
}
