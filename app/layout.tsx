import type { Metadata } from "next";
import { Manrope, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import Head from "next/head";
import SiteHeader from "./site-header";
import SiteFooter from "./site-footer";

const display = Manrope({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"]
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"]
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["500", "600"]
});

export const metadata: Metadata = {
  title: {
    default: "Raja Mantri Chor Sipahi — Support & Download",
    template: "%s — Raja Mantri Chor Sipahi"
  },
  description:
    "The classic King, Minister, Thief, Soldier party game — download the free Android app and support its development."
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const zoneId = process.env.NEXT_PUBLIC_MONETAG_ZONE_ID ?? "";
  const sdkUrl = process.env.NEXT_PUBLIC_MONETAG_SDK_URL ?? "";
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <Head>
        <script src="https://telegram.org/js/telegram-web-app.js?63"></script>
      </Head>
      <body>
        <div className="site-shell">
          <SiteHeader />
          {children}
          <SiteFooter />
        </div>
      </body>
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
