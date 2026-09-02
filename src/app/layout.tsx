import { Geist, Geist_Mono } from "next/font/google";
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

export const metadata = {
  title: "OnWear - Unique Way of Elegance | Premium Men's Clothing",
  description: "Explore premium men's shirts, panjabi, polo, and trousers tailored with superior fabric and craftsmanship. Fast delivery across Bangladesh.",
  keywords: ["OnWear", "men's fashion", "clothing Bangladesh", "premium shirts", "panjabi", "Dhaka fashion"],
  authors: [{ name: "ONWEAR" }],
  creator: "ONWEAR",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://onwear.bd",
    title: "OnWear - Unique Way of Elegance",
    description: "Premium men's clothing designed for modern elegance. Shop shirts, trousers, panjabi, and accessories with doorstep delivery across Bangladesh.",
    siteName: "ONWEAR",
    images: [
      {
        url: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=1200",
        width: 1200,
        height: 630,
        alt: "ONWEAR - Unique Way of Elegance"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "OnWear - Unique Way of Elegance",
    description: "Premium men's clothing brand. Discover the latest collections with fast delivery.",
    images: ["https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=1200"]
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 font-sans text-zinc-900">
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

