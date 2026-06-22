import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/context/LanguageContext";
import { db } from "@/lib/db";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chennai Guardian | Greater Chennai Police",
  description: "Official executive leadership portal and smart public safety dashboard of Dr. A. Amalraj IPS, Commissioner of Greater Chennai Police. Explore public initiatives, emergency resources, and modern policing command metrics.",
  keywords: ["A. Amalraj IPS", "Commissioner of Police Chennai", "Greater Chennai Police", "Kaaval Karangal", "Chennai Police Dashboard", "Tamil Nadu Police", "Public Safety Chennai"],
  authors: [{ name: "Greater Chennai Police" }],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeSettings = await db.getThemeSettings();
  const inlineStyles = `
    :root {
      --color-brand-maroon: ${themeSettings.primary_color};
      --color-brand-blue: ${themeSettings.secondary_color};
      --color-brand-gold: ${themeSettings.accent_color};
    }
  `;

  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <head>
        <style dangerouslySetInnerHTML={{ __html: inlineStyles }} />
        <link rel="icon" href="/favicon.ico?v=2" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=2" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=2" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2" />
      </head>
      <body className="min-h-full flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
        <LanguageProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

