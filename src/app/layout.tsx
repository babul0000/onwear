import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { SettingsProvider } from "../context/SettingsContext";
import LayoutContent from "../components/LayoutContent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.onwearbd.com'),
  title: {
    default: "ONWEAR - Unique Way of Elegance | Premium Men's Clothing Bangladesh",
    template: "%s | ONWEAR",
  },
  description: "ONWEAR is a premier men's clothing & lifestyle brand in Bangladesh. Explore designer Panjabi, luxury formal & casual shirts, polo t-shirts, trousers, and signature apparel. Fast delivery across Dhaka and all of Bangladesh.",
  keywords: [
    "ONWEAR",
    "onwearbd",
    "onwear clothing",
    "men's clothing Bangladesh",
    "premium panjabi Dhaka",
    "luxury shirts bd",
    "formal shirts Bangladesh",
    "polo t-shirts bd",
    "men's fashion Dhaka",
    "buy clothes online Bangladesh",
    "unique way of elegance"
  ],
  authors: [{ name: "ONWEAR", url: "https://www.onwearbd.com" }],
  creator: "ONWEAR",
  publisher: "ONWEAR",
  alternates: {
    canonical: 'https://www.onwearbd.com',
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.onwearbd.com",
    siteName: "ONWEAR",
    title: "ONWEAR - Unique Way of Elegance | Premium Men's Clothing",
    description: "Shop premium men's clothing, designer panjabi, shirts, and trousers at ONWEAR Bangladesh. Fast nationwide doorstep delivery.",
    images: [
      {
        url: "https://www.onwearbd.com/logo.jpg",
        width: 1024,
        height: 1024,
        alt: "ONWEAR - Unique Way of Elegance"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "ONWEAR - Unique Way of Elegance | Premium Men's Fashion",
    description: "Premium men's clothing brand in Bangladesh. Discover signature shirts, panjabi & pants.",
    images: ["https://www.onwearbd.com/logo.jpg"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || 'EYBYDML3ByTrxNcaszwRBGEOT3lSDwSXLJVkZvVN334',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: ['/favicon.ico'],
  },
  manifest: '/site.webmanifest',
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ONWEAR',
  legalName: 'ONWEAR Official',
  url: 'https://www.onwearbd.com',
  logo: 'https://www.onwearbd.com/logo.jpg',
  image: 'https://www.onwearbd.com/logo.jpg',
  description: "Unique way of elegance - Premium Men's Fashion & Lifestyle Brand in Bangladesh",
  telephone: '+8801603742963',
  email: 'onwear.25@gmail.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Khilkhet',
    addressLocality: 'Dhaka',
    postalCode: '1229',
    addressCountry: 'BD',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+8801603742963',
    contactType: 'customer service',
    areaServed: 'BD',
    availableLanguage: ['en', 'bn'],
  },
  sameAs: [
    'https://facebook.com/onwear.bd',
    'https://instagram.com/onwear_bd',
  ],
};

const webSiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'ONWEAR',
  url: 'https://www.onwearbd.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://www.onwearbd.com/products?search={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://i.ibb.co" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://onwear-server.onrender.com" />
        <link rel="dns-prefetch" href="https://i.ibb.co" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://onwear-server.onrender.com" />
        {/* Favicon & Web App Icons */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        {/* Schema.org Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
        />
      </head>
      <body className={`${poppins.className} min-h-full flex flex-col bg-white text-[#232323] antialiased`}>
        <SettingsProvider>
          <AuthProvider>
            <CartProvider>
              <LayoutContent>{children}</LayoutContent>
            </CartProvider>
          </AuthProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}

