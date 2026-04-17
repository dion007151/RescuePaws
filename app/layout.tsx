import type { Metadata } from "next";
import { Nunito, Fraunces } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import LayoutWrapper from "@/components/LayoutWrapper";
import { LazyMotion, domAnimation } from "framer-motion";

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
  title: "RescuePaws – Stray Animal Rescue Map",
  description: "Report and rescue stray animals in your community.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${nunito.variable} ${fraunces.variable} font-nunito antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <LazyMotion features={domAnimation}>
            <LayoutWrapper>{children}</LayoutWrapper>
          </LazyMotion>
        </AuthProvider>
      </body>
    </html>
  );
}
