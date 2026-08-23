import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { UserProvider } from "@/components/auth/UserContext";
import { ToastProvider } from "@/components/ui/toast-provider";
import { RealtimeNotificationListener } from "@/components/notifications/RealtimeNotificationListener";
import IncompleteProfileModal from "@/components/profile-wizard/IncompleteProfileModal";
import { NavigationHistoryTracker } from "@/components/navigation/NavigationHistoryTracker";
import { OrganizationSchema, WebApplicationSchema } from "@/lib/seo/structured-data";
import { PWAProvider } from "@/providers/pwa-provider";
import { PWAInstallPrompt, OfflineBanner } from "@/components/pwa/PWAInstallPrompt";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://salmandyar.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  manifest: "/manifest.json",
  title: {
    default: "سالمندیار | پلتفرم جامع خدمات پرستاری و مراقبت در منزل",
    template: "%s | سالمندیار",
  },
  description: "پلتفرم رسمی سالمندیار - ارائه خدمات پرستاری سالمند، کودک و بیمار در منزل، پانسمان، تزریقات، ICU در منزل با کادر مجرب، دارای مجوز وزارت بهداشت و پشتیبانی ۲۴ ساعته",
  keywords: [
    "پرستار در منزل",
    "پرستاری در منزل",
    "مراقبت از سالمند",
    "پانسمان در منزل",
    "تزریقات در منزل",
    "ICU در منزل",
    "مراقبت از بیمار",
    "خدمات پرستاری",
    "سالمندیار",
    "فیزیوتراپی در منزل",
  ],
  applicationName: "سالمندیار",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "سالمندیار",
  },
  authors: [{ name: "تیم سالمندیار", url: "/about" }],
  creator: "سالمندیار",
  publisher: "سالمندیار",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
    languages: {
      "fa-IR": "/",
      "en-US": "/en",
      "de-DE": "/de",
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192x192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icons/icon-512x512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
    shortcut: ["/favicon.svg"],
    other: {
      rel: "mask-icon",
      url: "/favicon.svg",
      color: "#0f766e",
    },
  },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: SITE_URL,
    siteName: "سالمندیار",
    title: "سالمندیار | پلتفرم جامع خدمات پرستاری و مراقبت در منزل",
    description: "ارائه جامع‌ترین خدمات پرستاری و مراقبت در منزل با پرستاران مجرب و دارای مجوز وزارت بهداشت، در تمام شهرهای بزرگ کشور",
    images: [
      {
        url: "/opengraph-image.svg",
        width: 1200,
        height: 630,
        type: "image/svg+xml",
        alt: "سالمندیار - پرستاری و مراقبت در منزل",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "سالمندیار | پلتفرم پرستاری و مراقبت در منزل",
    description: "پرستار در منزل، پانسمان، تزریقات، ICU در منزل با پشتیبانی ۲۴ ساعته",
    creator: "@salmandyar",
    images: [
      {
        url: "/twitter-image.svg",
        width: 1200,
        height: 675,
        type: "image/svg+xml",
        alt: "سالمندیار - پرستاری و مراقبت در منزل",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "health",
  other: {
    "msapplication-TileColor": "#0f766e",
    "msapplication-tap-highlight": "no",
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0f766e" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  userScalable: true,
  viewportFit: "cover",
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body
        className={`${vazirmatn.className} antialiased bg-neutral-warm-50 dark:bg-gray-900 transition-colors duration-300`}
        suppressHydrationWarning
      >
        <OrganizationSchema />
        <WebApplicationSchema />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PWAProvider>
            <QueryProvider >
              <UserProvider>
                <ToastProvider />
                <OfflineBanner />
                <NavigationHistoryTracker />
                <RealtimeNotificationListener />
                <IncompleteProfileModal />
                {children}
                <PWAInstallPrompt />
              </UserProvider>
            </QueryProvider>
          </PWAProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
