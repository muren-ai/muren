import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Terms & Services — MUREN",
  description:
    "The terms that govern use of muren.ai and the systems MUREN operates.",
};

const UPDATED = "Effective 6 July 2026";

export default function TermsPage() {
  return (
    <>
      <header className="legal-top wrap">
        <Link href="/" className="legal-brand" aria-label="MUREN — home">
          <Image
            src="/brand/logo-horizontal.webp"
            alt="MUREN"
            width={1768}
            height={344}
            priority
          />
        </Link>
        <Link href="/" className="legal-back">
          ← BACK TO SITE
        </Link>
      </header>

      <main className="legal wrap">
        <div className="legal-head">
          <span className="legal-kick">LEGAL · MUREN</span>
          <h1 className="legal-title display">
            Terms &amp;<br />Services
          </h1>
          <span className="legal-date">{UPDATED} · ISLAMABAD, PK</span>
        </div>

        <p className="legal-lead">
          These terms govern your use of muren.ai and anything we make available
          through it. Using the site means you accept them.
        </p>

        <ol className="legal-body">
          <li>
            <h2>Who we are</h2>
            <p>
              MUREN (Private) Limited is a deep-tech research group registered in
              Islamabad, Pakistan. &ldquo;MUREN,&rdquo; &ldquo;we,&rdquo; and
              &ldquo;our&rdquo; refer to that company; &ldquo;you&rdquo; refers to
              anyone accessing this site or the systems we operate.
            </p>
          </li>
          <li>
            <h2>Using this site</h2>
            <p>
              You may read, reference, and share this site for lawful purposes.
              You agree not to scrape it at scale, disrupt it, or attempt to gain
              unauthorized access to the infrastructure behind it. We may change,
              suspend, or withdraw any part of it without notice.
            </p>
          </li>
          <li>
            <h2>Our work and intellectual property</h2>
            <p>
              The names, marks, writing, designs, source, and system output shown
              here belong to MUREN or our partners and are protected by law. Case
              studies describe deployed systems; nothing here grants you a licence
              to copy, resell, or reverse-engineer them.
            </p>
          </li>
          <li>
            <h2>Systems and availability</h2>
            <p>
              The systems we describe — including Career Konnect, Eco Muhafiz, and
              others in the array — run under separate agreements with their own
              users and partners. This site is informational; it is not the
              service, and the uptime, accuracy, and fitness of any live system is
              governed by that system&rsquo;s own terms.
            </p>
          </li>
          <li>
            <h2>Your data</h2>
            <p>
              If you email us or open a channel through this site, we use what you
              send only to respond and to keep a record of our correspondence. We
              don&rsquo;t sell it. Where a specific system collects data, that
              system&rsquo;s privacy notice controls.
            </p>
          </li>
          <li>
            <h2>Links we don&rsquo;t control</h2>
            <p>
              Links out to LinkedIn, GitHub, partner sites, and live deployments
              are there for convenience. We don&rsquo;t control those destinations
              and aren&rsquo;t responsible for their content or practices.
            </p>
          </li>
          <li>
            <h2>No warranty; limits of liability</h2>
            <p>
              This site is provided &ldquo;as is,&rdquo; without warranties of any
              kind. To the fullest extent the law allows, MUREN is not liable for
              indirect or consequential loss arising from your use of the site or
              reliance on anything published here.
            </p>
          </li>
          <li>
            <h2>Governing law</h2>
            <p>
              These terms are governed by the laws of Pakistan, and the courts of
              Islamabad have exclusive jurisdiction over any dispute arising from
              them.
            </p>
          </li>
          <li>
            <h2>Reaching us</h2>
            <p>
              Questions about these terms go to{" "}
              <a href="mailto:inbox@muren.ai">inbox@muren.ai</a> or{" "}
              <a href="tel:+923222805717">+92&nbsp;322&nbsp;280&nbsp;5717</a>. We
              update this page as our work changes; the effective date above always
              reflects the current version.
            </p>
          </li>
        </ol>
      </main>

      <SiteFooter />
    </>
  );
}
