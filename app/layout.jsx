import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ogImages, site } from "@/lib/site";
import { hasResume } from "@/lib/resume";
import { jsonLd } from "@/lib/utils";
import { socialLinks } from "@/data/social-links";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ScrollProgress from "@/components/layout/ScrollProgress";
import RevealObserver from "@/components/layout/RevealObserver";
import PublicOnly from "@/components/layout/PublicOnly";
import Preloader from "@/components/layout/Preloader";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: `${site.name} Portfolio`,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  keywords: [
    "Rubul Islam",
    "Full Stack Developer",
    "MERN Stack Developer",
    "React Developer",
    "Node.js Developer",
    "WordPress Developer",
    "Web Developer Guwahati",
    "Web Development Blog",
    "Assam",
    "India",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: site.locale,
    url: "/",
    siteName: site.name,
    title: site.title,
    description: site.description,
    images: ogImages,
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    images: ogImages,
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
  ],
  colorScheme: "dark light",
};

// Runs before paint: applies the saved theme (dark by default) and flags JS
// so entrance animations only hide content when they can also reveal it.
const bootScript = `(function(){try{var d=document.documentElement;d.classList.add('js');var t=localStorage.getItem('theme');d.dataset.theme=t==='light'?'light':'dark';}catch(e){document.documentElement.dataset.theme='dark';}})();`;

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${site.url}/#person`,
      name: site.name,
      jobTitle: "Full Stack Developer",
      image: `${site.url}/images/rubul-islam.jpg`,
      email: `mailto:${site.email}`,
      url: site.url,
      address: {
        "@type": "PostalAddress",
        addressLocality: site.location.city,
        addressRegion: site.location.region,
        addressCountry: site.location.countryCode,
      },
      alumniOf: { "@type": "CollegeOrUniversity", name: "Cotton University" },
      worksFor: { "@type": "Organization", name: "Indilens Web Solutions" },
      knowsAbout: ["React", "Node.js", "Express.js", "MongoDB", "REST APIs", "WordPress", "Software Testing"],
      sameAs: socialLinks.map((s) => s.href),
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      url: site.url,
      name: `${site.name} — Portfolio`,
      inLanguage: "en-IN",
      publisher: { "@id": `${site.url}/#person` },
    },
  ],
};

export default function RootLayout({ children }) {
  const resumeAvailable = hasResume();

  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(structuredData) }} />
      </head>
      <body className="min-h-dvh">
        <div id="top" aria-hidden="true" className="absolute top-0" />
        <PublicOnly>
          <Preloader />
          <ScrollProgress />
          <Navbar resumeAvailable={resumeAvailable} />
        </PublicOnly>
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <PublicOnly>
          <Footer />
          <RevealObserver />
        </PublicOnly>
      </body>
    </html>
  );
}
