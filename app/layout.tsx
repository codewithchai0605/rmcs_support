import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import Head from "next/head";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Support Raja Mantri Chor Sipahi",
  description: "Watch a quick ad to support Raja Mantri Chor Sipahi"
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const zoneId = process.env.NEXT_PUBLIC_MONETAG_ZONE_ID ?? "";
  const sdkUrl = process.env.NEXT_PUBLIC_MONETAG_SDK_URL ?? "";
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <Head>
        <script src="https://telegram.org/js/telegram-web-app.js?63"></script>
      </Head>
      <body>{children}</body>
      {sdkUrl && (
        <Script
          src={sdkUrl}
          data-zone={zoneId}
          data-sdk={`show_${zoneId}`}
          strategy="afterInteractive"
        />
      )}
    </html>
  );
}