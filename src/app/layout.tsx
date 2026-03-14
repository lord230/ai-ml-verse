import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/providers/AuthProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AI ML Verse",
    template: "%s | AI ML Verse",
  },
  description: "See how neural networks actually learn. Interactive visualizations of backpropagation, transformers, normalization, CNNs, and deep learning architectures — built for serious AI minds.",
  metadataBase: new URL("https://www.aimlverse.in"),
  alternates: {
    canonical: "https://www.aimlverse.in",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "AI ML Verse",
    description: "See how neural networks actually learn. Interactive visualizations of backpropagation, transformers, normalization, CNNs, and deep learning architectures — built for serious AI minds.",
    type: "website",
    url: "https://www.aimlverse.in",
    siteName: "AI ML Verse",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI ML Verse — Interactive AI/ML Visualizations",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI ML Verse",
    description: "See how neural networks actually learn. Interactive visualizations of backpropagation, transformers, normalization, CNNs, and deep learning architectures — built for serious AI minds.",
    creator: "@aimlverse",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased text-slate-200 bg-[#0f172a] selection:bg-indigo-500/30 overflow-x-hidden min-h-screen flex flex-col`}>
        <AuthProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">
            {children}
          </main>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
