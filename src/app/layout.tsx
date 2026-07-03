import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";

import { CompanionPwaSplash } from "@/features/companion/CompanionPwaSplash";
import { ThemeProvider } from "@/features/theme/ThemeProvider";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["600", "700", "800"]
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://megatv-neo.vercel.app"),
  title: {
    default: "MegaTv — Site officiel & MegaCompagnon",
    template: "%s — MegaTv"
  },
  description: "Site promo MegaTv et accès sécurisé MegaCompagnon pour vos statistiques, profils, appareils et données cloud.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Compagnon"
  },
  icons: {
    icon: [
      { url: "/assets/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/companion-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/assets/companion-icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: "/assets/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
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
  themeColor: "#000000"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=localStorage.getItem('megacompanion_theme');var t=m==='light'?'light':m==='system'&&window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t;}catch(e){document.documentElement.dataset.theme='dark';}})();`
          }}
        />
        <link rel="apple-touch-startup-image" href="/assets/apple-touch-startup.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable}`}>
        <ThemeProvider>
          <CompanionPwaSplash />
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
