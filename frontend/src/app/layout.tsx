import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const metadata: Metadata = {
  title: "سالمندیار | پلتفرم جامع خدمات پرستاری و مراقبت در منزل",
  description: "ارائه دهنده خدمات پرستاری سالمند، کودک و بیمار در منزل با کادر مجرب و حرفه‌ای",
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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider >
            {children}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
