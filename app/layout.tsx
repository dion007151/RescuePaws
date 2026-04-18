import type { Metadata, Viewport } from "next";
import { Nunito, Fraunces } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import LayoutWrapper from "@/components/LayoutWrapper";
import { LazyMotion, domAnimation } from "framer-motion";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import InAppBrowserWarning from "@/components/InAppBrowserWarning";
import Script from "next/script";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  weight: ["700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rescuepaws.vercel.app"),
  title: "RescuePaws – Stray Animal Rescue Map",
  description:
    "Report and rescue stray animals in your community. Real-time map, GPS tracking, and rescue missions — all free.",
  keywords: ["animal rescue", "stray animals", "rescue map", "pets", "community"],
  authors: [{ name: "Dionimar Flores" }],
  creator: "Dionimar Punzalan Flores",
  // PWA / App meta
  applicationName: "RescuePaws",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RescuePaws",
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    title: "RescuePaws – Stray Animal Rescue Map",
    description: "Help rescue stray animals in your community using real-time GPS mapping.",
    siteName: "RescuePaws",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RescuePaws Social Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RescuePaws – Stray Animal Rescue Map",
    description: "Help rescue stray animals in your community using real-time GPS mapping.",
    images: ["/og-image.png"],
  },
};

// Viewport + PWA theme color (separate export — Next.js 13+ requirement)
export const viewport: Viewport = {
  themeColor: "#f8947b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // Respects notch/home-bar safe areas
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Apple PWA icons */}
        <link rel="apple-touch-icon" href="/icons/icon-512.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512.png" />
        {/* Splash screen color for iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${nunito.variable} ${fraunces.variable} font-nunito antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <LazyMotion features={domAnimation}>
            <LayoutWrapper>{children}</LayoutWrapper>
            {/* PWA install prompt — shows after 2s on supported browsers */}
            <PWAInstallPrompt />
            {/* Smart detection for Facebook / Messenger / FB Lite */}
            <InAppBrowserWarning />
          </LazyMotion>
        </AuthProvider>

        {/* Service Worker registration */}
        <Script
          id="sw-register"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(reg) {
                      console.log('[RescuePaws] SW registered:', reg.scope);
                    })
                    .catch(function(err) {
                      console.warn('[RescuePaws] SW registration failed:', err);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
