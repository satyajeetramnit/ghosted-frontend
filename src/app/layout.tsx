import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { Toaster } from 'react-hot-toast';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ghosted - Job Tracking",
  description: "Stop getting ghosted. Track your applications cleanly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full flex text-foreground bg-background overflow-hidden relative" suppressHydrationWarning>
        <Providers>
          <Sidebar />
          <MobileNav />
          <main className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden pb-16 md:pb-0">
            {children}
          </main>
          <Toaster 
            position="bottom-right" 
            toastOptions={{
              className: 'bg-card text-foreground border border-border',
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
