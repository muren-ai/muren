"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { useGSAP } from "@gsap/react";
import Slot from "./Slot";

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin, useGSAP);

type World = {
  key: string;
  id: string;
  no: string;
  sct: string;
  name: string;
  ghost: string;
  tint: string;
  flip: boolean;
  anchorLead: string;
  anchorTint: string;
  body: string;
  stats: [string, string][];
  enter: string;
  shots: [string, string, string?][]; // [big, sub, src?] for c1,c2,c3
  tag: string;
};

const WORLDS: World[] = [
  {
    key: "career",
    id: "w-career",
    no: "SYS.01 / WORLD",
    sct: "EDUCATION & WORKFORCE",
    name: "Career",
    ghost: "Konnect",
    tint: "#7ca0f5",
    flip: false,
    anchorLead: "The distance from classroom to floor — ",
    anchorTint: "made visible.",
    body: "Turns raw education into proven employability. Surfaces the latent skill employers can never quite see.",
    stats: [
      ["10K+", "LEARNERS ON PATH"],
      ["92%", "JOB-READINESS SIGNAL"],
    ],
    enter: "ENTER CAREER KONNECT",
    shots: [
      ["THE THRESHOLD", "4:5", "/worlds/threshold.webp"],
      ["PRODUCT UI", "16:10", "/worlds/product-ui.webp"],
      ["THE FLOOR", "16:10", "/worlds/floor.webp"],
    ],
    tag: "SHOT 01 — DOORWAY, DAWN",
  },
  {
    key: "vr",
    id: "w-vr",
    no: "SYS.02 / WORLD",
    sct: "IMMERSIVE SIMULATION",
    name: "VR",
    ghost: "Training",
    tint: "#8877ff",
    flip: true,
    anchorLead: "Rehearse the disaster — ",
    anchorTint: "without the cost.",
    body: "Run the dangerous procedure a thousand times without a scratch. Witness consequence before it costs anything real.",
    stats: [
      ["1000×", "REPEATABLE, SAFELY"],
      ["0", "REAL-WORLD RISK"],
    ],
    enter: "ENTER VR TRAINING",
    shots: [
      ["THE HAZARD", "4:5"],
      ["IN-SIM VIEW", "3:4"],
      ["THE TRAINEE", "16:10"],
    ],
    tag: "SHOT 02 — PANEL, WIREFRAME",
  },
  {
    key: "factory",
    id: "w-factory",
    no: "SYS.03 / WORLD",
    sct: "INDUSTRIAL AI",
    name: "Factory",
    ghost: "Copilot",
    tint: "#d9963f",
    flip: false,
    anchorLead: "What the machine remembers — ",
    anchorTint: "surfaced in seconds.",
    body: "Point a camera at any machine. Decades of repair history, manuals and tribal knowledge. The AI recommends; the technician decides.",
    stats: [
      ["SEC", "CAMERA TO KNOWLEDGE"],
      ["10+YRS", "TRIBAL KNOWLEDGE CAPTURED"],
    ],
    enter: "ENTER FACTORY COPILOT",
    shots: [
      ["THE GEARBOX", "4:5"],
      ["TECHNICIAN + PHONE", "3:4"],
      ["THE DIAGNOSIS", "16:10"],
    ],
    tag: "SHOT 03 — STEEL, STEAM",
  },
  {
    key: "eco",
    id: "w-eco",
    no: "SYS.04 / WORLD",
    sct: "CLIMATE & ENVIRONMENT",
    name: "Eco",
    ghost: "Muhafiz",
    tint: "#6fc494",
    flip: true,
    anchorLead: "Where the forest speaks — ",
    anchorTint: "and AI protects.",
    body: "The whole territory, at once. Every river, forest and emission, watched in real time. Pakistan's first AI-powered climate intelligence platform.",
    stats: [
      ["12,500ha", "REAL-TIME MONITORING"],
      ["98.6%", "CLASSIFICATION ACCURACY"],
    ],
    enter: "ENTER ECO MUHAFIZ",
    shots: [
      ["CARBON STOCK", "1475×1067", "/worlds/carbon.webp"],
      ["EMISSIONS", "1811×868", "/worlds/emissions.webp"],
      ["RIVER FLOW", "1380×1140", "/worlds/flow.webp"],
    ],
    tag: "SHOT 04 — DELTA, DAWN MIST",
  },
];

function Copy({ w }: { w: World }) {
  return (
    <div className="wcopy">
      <div className="anchor">
        {w.anchorLead}
        <span className="tint">{w.anchorTint}</span>
      </div>
      <div className="body">{w.body}</div>
      <div className="stats">
        {w.stats.map(([n, l], i) => (
          <div key={i}>
            <div className="n tint">{n}</div>
            <div className="l">{l}</div>
          </div>
        ))}
      </div>
      <a className="enter" href="#">
        {w.enter} <span className="ar">→</span>
      </a>
    </div>
  );
}

function Collage({ w }: { w: World }) {
  return (
    <div className={`collage${w.flip ? " alt" : ""}`}>
      <Slot className="c1" big={w.shots[0][0]} sub={w.shots[0][1]} src={w.shots[0][2]} />
      <Slot className="c2" big={w.shots[1][0]} sub={w.shots[1][1]} src={w.shots[1][2]} />
      <Slot className="c3" big={w.shots[2][0]} sub={w.shots[2][1]} src={w.shots[2][2]} />
      <span className="tag">{w.tag}</span>
    </div>
  );
}

/** counts the numeric head of strings like "12,500ha" / "98.6%" / "10K+" up
 *  from zero, preserving the surrounding text verbatim */
function countUp(el: HTMLElement) {
  const original = el.textContent ?? "";
  const m = original.match(/^([\d,]+(?:\.\d+)?)(.*)$/);
  if (!m) return;
  const target = parseFloat(m[1].replace(/,/g, ""));
  const decimals = (m[1].split(".")[1] ?? "").length;
  const hasComma = m[1].includes(",");
  const suffix = m[2];
  const obj = { v: 0 };
  gsap.to(obj, {
    v: target,
    duration: 1.4,
    ease: "power2.out",
    onUpdate: () => {
      let n = decimals ? obj.v.toFixed(decimals) : String(Math.round(obj.v));
      if (hasComma)
        n = Number(n).toLocaleString("en-US", { minimumFractionDigits: decimals });
      el.textContent = n + suffix;
    },
  });
}

export default function Worlds() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const sections = gsap.utils.toArray<HTMLElement>(".world", root);

      sections.forEach((section, i) => {
        const w = WORLDS[i];

        /* the signature: the ghost half of the name floods with the world's
           tint as you move through the section */
        const fill = section.querySelector<HTMLElement>(".ghost-fill");
        if (fill) {
          gsap.fromTo(
            fill,
            { clipPath: "inset(-25% 100% -25% 0)" },
            {
              clipPath: "inset(-25% 0% -25% 0)",
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "top 62%",
                end: "center 42%",
                scrub: 0.4,
                invalidateOnRefresh: true,
              },
            }
          );
        }

        /* giant name drifts slower than the section — depth.
           force3D:false keeps it a 2D transform so the display type stays
           crisp on HiDPI instead of caching to a soft GPU layer. */
        const wname = section.querySelector<HTMLElement>(".wname");
        if (wname) {
          gsap.fromTo(
            wname,
            { y: 34 },
            {
              y: -34,
              ease: "none",
              force3D: false,
              scrollTrigger: {
                trigger: section,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
                invalidateOnRefresh: true,
              },
            }
          );
        }

        /* corner telemetry labels decode in */
        section
          .querySelectorAll<HTMLElement>(".w-no, .w-sct, .collage .tag")
          .forEach((el) => {
            const original = el.textContent ?? "";
            gsap.to(el, {
              duration: 1.0,
              scrambleText: { text: original, chars: "upperCase", speed: 0.9 },
              ease: "none",
              scrollTrigger: { trigger: section, start: "top 70%", once: true },
            });
          });

        /* collage shots settle in as a staggered cascade; inline transforms
           are cleared afterwards so the CSS hover lift keeps working */
        const shots = gsap.utils.toArray<HTMLElement>(".collage .slot", section);
        if (shots.length) {
          gsap.set(shots, { transition: "none" });
          gsap.from(shots, {
            y: 70,
            opacity: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.13,
            scrollTrigger: { trigger: section, start: "top 62%", once: true },
            onComplete: () => gsap.set(shots, { clearProps: "all" }),
          });
        }

        /* copy column: one quiet rise, then the stats count themselves up */
        const copy = section.querySelector<HTMLElement>(".wcopy");
        if (copy) {
          const parts = Array.from(copy.children) as HTMLElement[];
          gsap.from(parts, {
            y: 26,
            opacity: 0,
            duration: 0.75,
            ease: "power3.out",
            stagger: 0.09,
            scrollTrigger: {
              trigger: section,
              start: "top 58%",
              once: true,
              onEnter: () =>
                copy
                  .querySelectorAll<HTMLElement>(".stats .n")
                  .forEach((el) => countUp(el)),
            },
            onComplete: () => gsap.set(parts, { clearProps: "all" }),
          });
        }
      });
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef}>
      {WORLDS.map((w) => (
        <section key={w.key} className={`world ${w.key}${w.flip ? " flip" : ""}`} id={w.id}>
          <span className="w-no">{w.no}</span>
          <span className="w-sct">{w.sct}</span>
          <div className="wname">
            {w.name}
            <br />
            <span className="ghost">
              {w.ghost}
              <span className="ghost-fill" aria-hidden="true">
                {w.ghost}
              </span>
            </span>
          </div>
          <div className="wgrid">
            {w.flip ? (
              <>
                <Collage w={w} />
                <Copy w={w} />
              </>
            ) : (
              <>
                <Copy w={w} />
                <Collage w={w} />
              </>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
