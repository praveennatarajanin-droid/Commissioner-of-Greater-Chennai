import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/context/LanguageContext";
import { db } from "@/lib/db";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const seoSettings = await db.getSeoSettings();
  const baseUrl = seoSettings.site_url || "https://chennaiguardian.in";

  return {
    title: seoSettings.site_title || "Chennai Guardian | Greater Chennai Police",
    description: seoSettings.site_description || "Official executive leadership portal and smart public safety dashboard of Dr. A. Amalraj IPS, Commissioner of Greater Chennai Police.",
    keywords: (seoSettings.default_keywords || "").split(",").map(k => k.trim()).filter(Boolean),
    authors: [{ name: seoSettings.organization_name || "Greater Chennai Police" }],
    metadataBase: new URL(baseUrl),
    openGraph: {
      type: "website",
      title: seoSettings.site_title,
      description: seoSettings.site_description,
      url: baseUrl,
      siteName: seoSettings.site_title,
      images: [{ url: seoSettings.default_og_image || "/images/gcp_logo.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: seoSettings.site_title,
      description: seoSettings.site_description,
      images: [seoSettings.default_og_image || "/images/gcp_logo.png"],
    },
    robots: seoSettings.default_robots || "index, follow",
    alternates: {
      canonical: baseUrl,
    },
    verification: {
      google: seoSettings.google_search_console || undefined,
      other: seoSettings.bing_verification ? { "msvalidate.01": seoSettings.bing_verification } : undefined,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeSettings = await db.getThemeSettings();
  const seoSettings = await db.getSeoSettings();
  const baseUrl = seoSettings.site_url || "https://chennaiguardian.in";

  const inlineStyles = `
    :root {
      --color-brand-maroon: ${themeSettings.primary_color};
      --color-brand-blue: ${themeSettings.secondary_color};
      --color-brand-gold: ${themeSettings.accent_color};
    }
  `;

  // Organization Schema JSON-LD
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": seoSettings.organization_name || "Greater Chennai Police",
    "url": baseUrl,
    "logo": `${baseUrl}${seoSettings.organization_logo || "/images/gcp_logo.png"}`,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": seoSettings.contact_number || "044-23452300",
      "contactType": "customer service"
    },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": seoSettings.address || "Commissioner Office, Vepery, Chennai"
    },
    "sameAs": [
      seoSettings.social_facebook,
      seoSettings.social_twitter,
      seoSettings.social_instagram,
      seoSettings.social_youtube
    ].filter(Boolean)
  };

  // Website Schema JSON-LD
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": seoSettings.site_title || "Chennai Guardian",
    "url": baseUrl,
    "description": seoSettings.site_description,
    "publisher": {
      "@type": "Organization",
      "name": seoSettings.organization_name || "Greater Chennai Police"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${baseUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <head>
        <style dangerouslySetInnerHTML={{ __html: inlineStyles }} />
        <link rel="icon" href="/favicon.ico?v=2" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=2" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=2" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2" />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />

        {/* Google Analytics */}
        {seoSettings.google_analytics_id && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${seoSettings.google_analytics_id}`} />
            <script dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${seoSettings.google_analytics_id}');`
            }} />
          </>
        )}

        {/* Google Tag Manager */}
        {seoSettings.google_tag_manager_id && (
          <script dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${seoSettings.google_tag_manager_id}');`
          }} />
        )}
      </head>
      <body className="min-h-full flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
        {/* GTM noscript fallback */}
        {seoSettings.google_tag_manager_id && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${seoSettings.google_tag_manager_id}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        <LanguageProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
