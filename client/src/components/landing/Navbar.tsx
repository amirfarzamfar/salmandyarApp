'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Menu, X, Phone } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-teal-600">سالمندیار</span>
            </Link>
            <div className="hidden md:block md:mr-10">
              <div className="flex items-baseline space-x-4">
                <Link href="#services" className="text-gray-600 hover:text-teal-600 px-3 py-2 rounded-md text-sm font-medium">خدمات ما</Link>
                <Link href="#process" className="text-gray-600 hover:text-teal-600 px-3 py-2 rounded-md text-sm font-medium">نحوه کار</Link>
                <Link href="#about" className="text-gray-600 hover:text-teal-600 px-3 py-2 rounded-md text-sm font-medium">درباره ما</Link>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 gap-3">
               <div className="flex items-center gap-2 text-gray-600 ml-4">
                  <Phone size={18} />
                  <span className="font-semibold text-lg" dir="ltr">021-12345678</span>
               </div>
              <Link href="/login">
                <Button variant="ghost" size="sm">ورود</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">شروع کنید</Button>
              </Link>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
            <Link href="#services" className="text-gray-600 hover:text-teal-600 block px-3 py-2 rounded-md text-base font-medium">خدمات ما</Link>
            <Link href="#process" className="text-gray-600 hover:text-teal-600 block px-3 py-2 rounded-md text-base font-medium">نحوه کار</Link>
            <Link href="#about" className="text-gray-600 hover:text-teal-600 block px-3 py-2 rounded-md text-base font-medium">درباره ما</Link>
          </div>
          <div className="border-t border-gray-200 pb-3 pt-4">
            <div className="flex items-center px-5 gap-3 flex-col">
              <Link href="/login" className="w-full">
                <Button variant="outline" className="w-full">ورود</Button>
              </Link>
              <Link href="/register" className="w-full">
                <Button className="w-full">شروع کنید</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
