"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { useGSAP } from "@gsap/react";
import { motion, MotionConfig } from "framer-motion";
import Slot from "./Slot";
import ChatWidget from "./ChatWidget";

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin, useGSAP);

/* shared reveal recipes — Motion owns the in-view reveals (per the brief) */
const rise = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-12% 0px" },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
};
// nameplates press on like an ink stamp — fast, slightly oversized arrival
const stamp = {
  initial: { opacity: 0, scale: 1.07, rotate: 0.7 },
  whileInView: { opacity: 1, scale: 1, rotate: 0 },
  viewport: { once: true, margin: "-18% 0px" },
  transition: { duration: 0.45, ease: [0.22, 1.4, 0.36, 1] as const },
};

export default function CaseStudies() {
  const rootRef = useRef<HTMLDivElement>(null);
  const csCountRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      /* cs-head: rule draws while the counter ticks 00 -> 02 */
      const csHead = root.querySelector<HTMLElement>(".cs-head .row");
      if (csHead) {
        gsap.fromTo(
          csHead,
          { "--rule-p": 0 },
          {
            "--rule-p": 1,
            duration: 1.1,
            ease: "power3.inOut",
            scrollTrigger: { trigger: csHead, start: "top 85%", once: true },
          }
        );
      }
      const numEl = csCountRef.current;
      if (numEl) {
        const counter = { v: 0 };
        gsap.to(counter, {
          v: 2,
          duration: 0.9,
          ease: "none",
          snap: { v: 1 },
          onUpdate: () => {
            numEl.textContent = String(counter.v).padStart(2, "0");
          },
          scrollTrigger: { trigger: numEl, start: "top 88%", once: true },
        });
      }

      /* dossier top rule */
      const dossier = root.querySelector<HTMLElement>(".cs1 .dossier");
      if (dossier) {
        gsap.fromTo(
          dossier,
          { "--rule-p": 0 },
          {
            "--rule-p": 1,
            duration: 1.1,
            ease: "power3.inOut",
            scrollTrigger: { trigger: dossier, start: "top 85%", once: true },
          }
        );
      }

      /* mono labels decode like a terminal locking onto a value */
      gsap.utils.toArray<HTMLElement>(".scramble", root).forEach((el) => {
        const original = el.textContent ?? "";
        gsap.to(el, {
          duration: 1.1,
          scrambleText: {
            text: original,
            chars: "upperCase",
            speed: 0.9,
          },
          ease: "none",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });

      /* factstrip: the numbers are the argument — count them up */
      const strip = root.querySelector<HTMLElement>(".cs2 .factstrip");
      if (strip) {
        const counters = gsap.utils.toArray<HTMLElement>(".cv", strip);
        ScrollTrigger.create({
          trigger: strip,
          start: "top 82%",
          once: true,
          onEnter: () => {
            counters.forEach((el, i) => {
              const target = parseFloat(el.dataset.target ?? "0");
              const decimals = parseInt(el.dataset.decimals ?? "0", 10);
              const comma = "comma" in el.dataset;
              const obj = { v: 0 };
              gsap.to(obj, {
                v: target,
                duration: 1.6,
                delay: i * 0.12,
                ease: "power2.out",
                onUpdate: () => {
                  const n = decimals
                    ? obj.v.toFixed(decimals)
                    : Math.round(obj.v).toString();
                  el.textContent = comma
                    ? Number(n).toLocaleString("en-US", {
                        minimumFractionDigits: decimals,
                      })
                    : n;
                },
              });
            });
          },
        });
      }

      /* (twins parallax removed — those are content screenshots that must
         stay pixel-crisp; a permanent scroll transform put them on a soft
         GPU compositing layer on HiDPI displays) */
    },
    { scope: rootRef }
  );

  return (
    <MotionConfig reducedMotion="user">
      <div ref={rootRef}>
        <section className="cs-head wrap" id="work">
          <div className="row">
            <span className="t">Case Studies</span>
            <span className="n">
              <span ref={csCountRef}>02</span> SHIPPED SYSTEMS
            </span>
          </div>
        </section>

        {/* CS.01 — CAREERKONNECT · exploded blueprint */}
        <section className="cs1 wrap" id="cs-careerkonnect">
          <div className="blueprint">
            {/* ① base plane — trainer dashboard */}
            <div className="main">
              <div className="bp-plate">
                <div className="bp-callout">
                  <span className="bp-num">01</span>{" "}
                  <span className="scramble">
                    CAREERKONNECT — TRAINER DASHBOARD
                  </span>
                </div>
                <Slot
                  big="CS.01 — HERO STILL"
                  sub="PLATFORM IN USE"
                  src="/case-studies/careerkonnect.webp"
                />
                {/* clear title below the hero — same bone nameplate as CS.02 Eco Muhafiz */}
                <motion.div className="nameplate" {...stamp}>
                  <span className="np-title">Career Konnect</span>
                  <span className="np-meta scramble">
                    CS.01 · EDU · ADAPTIVE LEARNING
                  </span>
                </motion.div>
              </div>
              <div className="dossier">
                <motion.div className="ds-head" {...rise}>
                  <span className="ds-kicker">
                    <span className="bp-num">01</span> CAREER KONNECT
                  </span>
                  <span className="ds-tag scramble">EDU · ADAPTIVE LEARNING</span>
                </motion.div>

                <motion.div className="ds-beat" {...rise}>
                  <span className="ds-n">THE PROBLEM</span>
                  <p className="ds-line">
                    Every year thousands of graduates enter the market with no
                    verifiable signal of what they can actually do, and the
                    employers screening them can&apos;t tell who is genuinely
                    job-ready from a résumé — so real talent gets missed and
                    hiring stays a guessing game.
                  </p>
                </motion.div>

                <motion.div className="ds-beat" {...rise}>
                  <span className="ds-n">WHAT WE DID</span>
                  <h3 className="ds-lead">
                    Turned coursework into <em>live proof of readiness.</em>
                  </h3>
                  <p className="ds-sub">
                    We built an adaptive learning platform with an AI tutor that
                    scores real readiness as learners work — personalised to
                    each learner&apos;s target role, updated continuously, and
                    made legible to the employers and institutions deciding who
                    to hire.
                  </p>
                </motion.div>

                <motion.div className="ds-foot" {...rise}>
                  <div className="ds-facts">
                    <span>
                      <i>YEAR</i>2025 — ONGOING
                    </span>
                    <span>
                      <i>STATUS</i>LIVE IN PRODUCTION
                    </span>
                  </div>
                  <a className="visit" href="#">
                    VISIT CAREERKONNECT.ORG →
                  </a>
                </motion.div>
              </div>
            </div>

            {/* right rail: scroll-scrubbed live coaching session
                (replaces the static AI-tutor still — plays as you scroll CS.01) */}
            <div className="bp-side">
              <ChatWidget />
            </div>
          </div>
        </section>

        {/* CS.02 — ECO MUHAFIZ · field deployment plate + fact strip */}
        <section className="cs2" id="cs-ecomuhafiz">
          <div className="plate">
            <Slot
              big="CS.02 — FIELD DEPLOYMENT · UNIT 004"
              sub="MARGALLA HILLS · 33.68°N"
              src="/case-studies/eco-hero.webp"
            />
            {/* nameplate bar bites into the bottom of the photo — the reverse-tone
                mirror of CS.01's ink card over its dashboard shot */}
            <motion.div className="nameplate" {...stamp}>
              <span className="np-title">Eco Muhafiz</span>
              <span className="np-meta scramble">
                CS.02 · FIELD DEPLOYMENT · UNIT 004 · 33.68°N
              </span>
            </motion.div>
          </div>
          <motion.div className="sub" {...rise}>
            <p>
              <b>The problem:</b> deforestation is only ever discovered after
              the fact. <b>What we built:</b> Pakistan&apos;s first AI-powered
              climate intelligence platform — solar IoT/LoRa sensors in the
              canopy, satellite telemetry above, real-time event detection in
              between. Live at atlas.ecomuhafiz.com.
            </p>
            <p>
              <b>Recognition:</b> deployed with conservation authorities;
              MRV-aligned carbon verification for ESG reporting.
            </p>
          </motion.div>
          <div className="factstrip">
            <div className="cell">
              <div className="v">
                <span className="cv" data-target="12500" data-comma>
                  12,500
                </span>
                <span style={{ fontSize: ".45em" }}>ha</span>
              </div>
              <div className="k">UNDER REAL-TIME MONITORING</div>
            </div>
            <div className="cell">
              <div className="v">
                <span className="cv" data-target="98.6" data-decimals="1">
                  98.6
                </span>
                %
              </div>
              <div className="k">EVENT CLASSIFICATION ACCURACY</div>
            </div>
            <div className="cell">
              <div className="v">
                <span className="cv" data-target="73">
                  73
                </span>
                %
              </div>
              <div className="k">DECLINE IN ILLEGAL LOGGING ALERTS, PILOT ZONES</div>
            </div>
            <div className="cell">
              <div className="v">24/7</div>
              <div className="k">AUTONOMOUS FOREST GUARD</div>
            </div>
          </div>
          <div className="twins">
            <Slot
              big="THE SENSOR"
              sub="CANOPY UNIT · 16:10"
              src="/case-studies/eco-gis.webp"
            />
            <Slot
              className="t2"
              big="THE COCKPIT"
              sub="PLATFORM UI · 16:10"
              src="/case-studies/eco-chainsaw.webp"
            />
          </div>
          <a className="visit" href="#">
            VISIT ECOMUHAFIZ.COM →
          </a>
        </section>
      </div>
    </MotionConfig>
  );
}
