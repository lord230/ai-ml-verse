import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/providers/AuthProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI ML Verse",
  description: "See how neural networks actually learn. Interactive visualizations of backpropagation, transformers, normalization, CNNs, and deep learning architectures — built for serious AI minds.",
  openGraph: {
    title: "AI ML Verse",
    description: "See how neural networks actually learn. Interactive visualizations of backpropagation, transformers, normalization, CNNs, and deep learning architectures — built for serious AI minds.",
    type: "website",
    url: "https://ai-ml-verse.com",
    siteName: "AI ML Verse",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI ML Verse",
    description: "See how neural networks actually learn. Interactive visualizations of backpropagation, transformers, normalization, CNNs, and deep learning architectures — built for serious AI minds.",
    creator: "@aimlverse",
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
      </body>
    </html>
  );
}
