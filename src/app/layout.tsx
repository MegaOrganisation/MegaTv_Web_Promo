import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://megatv-neo.vercel.app"),
  title: {
    default: "MegaTv — Site officiel & MegaCompagnon",
    template: "%s — MegaTv"
  },
  description: "Site promo MegaTv et accès sécurisé MegaCompagnon pour vos statistiques, profils, appareils et données cloud.",
  icons: {
    icon: "/assets/mark.png"
  },
  openGraph: {
    title: "MegaTv — Site officiel & MegaCompagnon",
    description: "Découvrez MegaTv puis connectez-vous avec votre ID MegaTv pour ouvrir le Companion web.",
    siteName: "MegaTv",
    images: ["/assets/logo.png"]
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#10191C"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}
