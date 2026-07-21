import "@fontsource-variable/nunito";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist_Mono, Instrument_Sans, Geist } from "next/font/google";
import Script from "next/script";

import { CompanionPwaSplash } from "@/features/companion/CompanionPwaSplash";
import { ThemeProvider } from "@/features/theme/ThemeProvider";

import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap"
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  display: "swap"
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
      { url: "/assets/megatv-icon.png?v=3", sizes: "32x32", type: "image/png" },
      { url: "/assets/megatv-icon.png?v=3", sizes: "180x180", type: "image/png" }
    ],
    apple: [{ url: "/assets/megatv-icon.png?v=3", sizes: "180x180", type: "image/png" }],
    shortcut: [{ url: "/assets/megatv-icon.png?v=3", type: "image/png" }]
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
    <html lang="fr" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <head>
        <link rel="apple-touch-startup-image" href="/assets/apple-touch-startup.png" />
      </head>
      <body
        className={`${geistMono.variable} ${bricolage.variable} ${instrument.variable} font-[family-name:var(--font-nunito)]`}
        style={{ ["--font-nunito" as string]: "'Nunito Variable', Nunito, system-ui, sans-serif" }}
      >
        <Script id="mega-theme-boot" strategy="beforeInteractive">
          {`(function(){try{var m=localStorage.getItem('megacompanion_theme');var t=m==='light'?'light':m==='system'&&window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t;}catch(e){document.documentElement.dataset.theme='dark';}})();`}
        </Script>
        <ThemeProvider>
          <CompanionPwaSplash />
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
