import SlotProvider from "@/components/SlotContext";
import Nav from "@/components/Nav";
import MonumentHero from "@/components/MonumentHero";
import Marquee from "@/components/Marquee";
import Who from "@/components/Who";
import CaseStudies from "@/components/CaseStudies";
import Worlds from "@/components/Worlds";
import SiteFooter from "@/components/SiteFooter";

export default function Home() {
  return (
    <SlotProvider>
      <Nav />
      <MonumentHero />
      <Marquee />
      <Who />
      <CaseStudies />
      <Worlds />
      <SiteFooter />
    </SlotProvider>
  );
}
