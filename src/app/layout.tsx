import type { Metadata, Viewport } from "next";
import { Space_Mono } from "next/font/google";
import localFont from "next/font/local";
import SmoothScroll from "@/components/SmoothScroll";
import ContactPanel from "@/components/ContactPanel";
import "./globals.css";

const cenzoFlare = localFont({
  src: [
    { path: "../fonts/CenzoFlare/CenzoFlare-Light.woff2", weight: "300", style: "normal" },
    { path: "../fonts/CenzoFlare/CenzoFlare-LightItalic.woff2", weight: "300", style: "italic" },
    { path: "../fonts/CenzoFlare/CenzoFlare-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/CenzoFlare/CenzoFlare-RegularItalic.woff2", weight: "400", style: "italic" },
    { path: "../fonts/CenzoFlare/CenzoFlare-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/CenzoFlare/CenzoFlare-MediumItalic.woff2", weight: "500", style: "italic" },
    { path: "../fonts/CenzoFlare/CenzoFlare-Bold.woff2", weight: "700", style: "normal" },
    { path: "../fonts/CenzoFlare/CenzoFlare-BoldItalic.woff2", weight: "700", style: "italic" },
    { path: "../fonts/CenzoFlare/CenzoFlare-Black.woff2", weight: "900", style: "normal" },
    { path: "../fonts/CenzoFlare/CenzoFlare-BlackItalic.woff2", weight: "900", style: "italic" },
  ],
  variable: "--font-cenzo-flare",
  display: "swap",
});

// dedicated black-only cut so `var(--heavy)` renders bold without every
// caller needing to set font-weight, mirroring how Archivo Black worked
const cenzoFlareBlack = localFont({
  src: [
    { path: "../fonts/CenzoFlare/CenzoFlare-Black.woff2", weight: "400", style: "normal" },
    { path: "../fonts/CenzoFlare/CenzoFlare-BlackItalic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-cenzo-flare-black",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

const SITE_URL = "https://muren.ai";
const TITLE = "MUREN — We build our own systems and disrupt them.";
const DESCRIPTION =
  "A deep-tech research group in Islamabad. Four systems — Career Konnect, VR Training, Factory Copilot, and Eco Muhafiz — shipped and running, that let people see what they couldn't before. Our AI recommends; people decide.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s — MUREN",
  },
  description: DESCRIPTION,
  applicationName: "MUREN",
  keywords: [
    "MUREN",
    "deep tech",
    "AI research",
    "Islamabad",
    "Pakistan",
    "Career Konnect",
    "VR training",
    "factory copilot",
    "Eco Muhafiz",
    "geospatial AI",
    "human-in-the-loop AI",
  ],
  authors: [{ name: "MUREN", url: SITE_URL }],
  creator: "MUREN",
  publisher: "MUREN (Private) Limited",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "MUREN",
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 600,
        alt: "MUREN — deep-tech research group, Islamabad",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${cenzoFlare.variable} ${cenzoFlareBlack.variable} ${spaceMono.variable}`}
    >
      <body>
        <SmoothScroll />
        {children}
        <ContactPanel />
      </body>
    </html>
  );
}
