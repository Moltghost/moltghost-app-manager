import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { AppWalletProvider } from "@/providers/WalletProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const circularStd = localFont({
  src: [
    {
      path: "../../public/fonts/CircularStd-Book.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/CircularStd-BookItalic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/fonts/CircularStd-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/CircularStd-MediumItalic.ttf",
      weight: "500",
      style: "italic",
    },
    {
      path: "../../public/fonts/CircularStd-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/CircularStd-BoldItalic.ttf",
      weight: "700",
      style: "italic",
    },
    {
      path: "../../public/fonts/CircularStd-Black.ttf",
      weight: "900",
      style: "normal",
    },
    {
      path: "../../public/fonts/CircularStd-BlackItalic.ttf",
      weight: "900",
      style: "italic",
    },
  ],
  variable: "--font-circular-std",
});

export const metadata: Metadata = {
  title: "MOLTGHOST App Manager",
  description: "Deploy and manage your AI-powered applications",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${circularStd.variable} antialiased`}
      >
        <AppWalletProvider>{children}</AppWalletProvider>
        <div className="fixed top-4 left-4 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[11px] text-white/40 select-none pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400/70 animate-pulse" />
          In Development
        </div>
      </body>
    </html>
  );
}
