import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "MUREN — We build our own systems and disrupt them.",
  description:
    "A deep-tech research group in Islamabad. Four systems, shipped and running, that let people see what they couldn't before. Our AI recommends; people decide.",
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
