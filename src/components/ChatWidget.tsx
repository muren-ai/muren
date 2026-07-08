"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Turn = { role: "user" | "coach"; text: string };

/**
 * Scripted CareerKonnect coaching session — a deterministic, scroll-scrubbed
 * playback of the real Career Coach UI (no LLM call, no fetch). The chat frame,
 * colours, logo and icons mirror careerkonnect-web's CoachingPanel exactly;
 * only the reveal is driven by scroll. `**bold**` renders as <strong>.
 */
const SCRIPT: Turn[] = [
  { role: "user", text: "Can I get help with the courses?" },
  {
    role: "coach",
    text: "Welcome, Rains! Since you're targeting a **Backend Developer** role and haven't taken any assessments yet, the first step is to build a strong foundation. I recommend starting with a course on **Python** or **JavaScript** — the core backend languages.",
  },
  { role: "user", text: "Which one should I pick first?" },
  {
    role: "coach",
    text: "Given you have zero prior programming background, **Python** is the softer entry — cleaner syntax, faster wins. You can move to JavaScript once you're comfortable with variables, loops, and functions.",
  },
];

const LOGO = "/brand/chat-logo.webp";

// "a **b** c" -> [{bold:false,"a "},{bold:true,"b"},{bold:false," c"}]
type Tok = { bold: boolean; text: string };
const tokenize = (s: string): Tok[] =>
  s.split("**").map((chunk, i) => ({ bold: i % 2 === 1, text: chunk }));
const visibleLen = (toks: Tok[]) => toks.reduce((n, t) => n + t.text.length, 0);
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** HTML for the first `n` visible chars, keeping bold spans intact. */
const typedHtml = (toks: Tok[], n: number) => {
  let rem = n;
  let out = "";
  for (const t of toks) {
    if (rem <= 0) break;
    const slice = t.text.slice(0, rem);
    rem -= slice.length;
    out += t.bold ? `<strong>${esc(slice)}</strong>` : esc(slice);
  }
  return out;
};

// minimise / close / send icons — copied 1:1 from careerkonnect CoachingPanel
const IconMin = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 14 10 14 10 20" />
    <polyline points="20 10 14 10 14 4" />
    <line x1="10" y1="14" x2="3" y2="21" />
    <line x1="21" y1="3" x2="14" y2="10" />
  </svg>
);
const IconClose = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconSend = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);

export default function ChatWidget() {
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const txtRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useGSAP(
    () => {
      const root = rootRef.current;
      const body = bodyRef.current;
      const section = root?.closest(".cs1") as HTMLElement | null;
      if (!root || !body || !section) return;

      const rows = rowRefs.current;
      const txts = txtRefs.current;
      const N = SCRIPT.length;
      const toks = SCRIPT.map((t) => tokenize(t.text));
      const lens = toks.map(visibleLen);

      // within each 1/N segment: appear, then type, then dwell
      const APPEAR = 0.15;
      const TYPE = 0.7;

      const setTxt = (i: number, n: number) => {
        const t = txts[i];
        if (t && t.dataset.n !== String(n)) {
          t.innerHTML = typedHtml(toks[i], n);
          t.dataset.n = String(n);
        }
      };

      // full static transcript — reduced-motion path
      const showAll = () => {
        rows.forEach((r, i) => {
          if (!r) return;
          r.style.display = "flex";
          r.style.opacity = "1";
          r.style.transform = "none";
          r.classList.remove("typing");
          setTxt(i, lens[i]);
        });
        body.scrollTop = 0;
      };

      const render = (p: number) => {
        const seg = 1 / N;
        for (let i = 0; i < N; i++) {
          const r = rows[i];
          if (!r) continue;
          const sp = clamp((p - i * seg) / seg, 0, 1);
          if (sp <= 0) {
            r.style.display = "none";
            r.classList.remove("typing");
            continue;
          }
          r.style.display = "flex";
          const appear = clamp(sp / APPEAR, 0, 1);
          r.style.opacity = appear.toFixed(3);
          r.style.transform = `translateY(${((1 - appear) * 10).toFixed(1)}px)`;

          if (SCRIPT[i].role === "user") {
            setTxt(i, lens[i]); // user bubbles appear whole, no typing
            r.classList.remove("typing");
          } else {
            const typeProg = clamp((sp - APPEAR) / TYPE, 0, 1);
            const n = Math.round(lens[i] * typeProg);
            setTxt(i, n);
            // "streaming" (bouncing dots) while appearing or mid-type
            r.classList.toggle("typing", n < lens[i]);
          }
        }
        // keep the newest bubble near the bottom of the chat's OWN scroll
        body.scrollTop = body.scrollHeight - body.clientHeight;
      };

      const mm = gsap.matchMedia();

      mm.add(
        {
          desktop: "(min-width: 820px) and (prefers-reduced-motion: no-preference)",
          mobile: "(max-width: 819px) and (prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { desktop, reduce } = ctx.conditions as Record<string, boolean>;

          if (reduce) {
            root.classList.add("reduced");
            root.classList.remove("inline");
            showAll();
            return;
          }

          root.classList.remove("reduced");
          root.classList.toggle("inline", !desktop);

          // Desktop: the panel travels ~a full viewport before it pins. Rather
          // than sit there as a stark empty box during that entry, have it
          // fade + slide into place, reaching full opacity exactly when it pins
          // and the first message appears — a deliberate arrival, not a glitch.
          if (desktop) {
            const panel = root.querySelector(".ck-panel");
            gsap.fromTo(
              root,
              { opacity: 0 },
              {
                opacity: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: section,
                  start: "top 92%",
                  end: "top top+=96",
                  scrub: true,
                  invalidateOnRefresh: true,
                },
              }
            );
            if (panel)
              gsap.fromTo(
                panel,
                { y: 44 },
                {
                  y: 0,
                  ease: "none",
                  scrollTrigger: {
                    trigger: section,
                    start: "top 92%",
                    end: "top top+=96",
                    scrub: true,
                    invalidateOnRefresh: true,
                  },
                }
              );
          }

          // scroll → target progress; displayed progress lerps toward it (inertia)
          let target = 0;
          let disp = 0;
          let raf = 0;
          const tick = () => {
            disp = lerp(disp, target, 0.1);
            if (Math.abs(target - disp) < 0.0002) disp = target;
            render(disp);
            raf = requestAnimationFrame(tick);
          };

          ScrollTrigger.create({
            trigger: desktop ? section : root,
            start: desktop ? "top top+=96" : "top 82%",
            end: desktop ? "bottom bottom" : "bottom 45%",
            pin: desktop ? root : false,
            pinSpacing: !!desktop,
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              target = self.progress;
            },
          });

          render(0);
          raf = requestAnimationFrame(tick);

          return () => cancelAnimationFrame(raf);
        }
      );

      return () => mm.revert();
    },
    { scope: rootRef }
  );

  return (
    <div className="chat-pin" ref={rootRef}>
      <div className="cw-cap">
        <span className="cw-num">02</span>
        <span className="cw-live">AI TUTOR — LIVE SESSION</span>
      </div>

      {/* CareerKonnect "Career Coach" panel — replicated exactly */}
      <div className="ck-panel">
        {/* header */}
        <div className="ck-head">
          <div className="ck-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="ck-logo" src={LOGO} alt="Coach" width={44} height={44} />
            <span className="ck-title">Career Coach</span>
          </div>
          <div className="ck-ctl" aria-hidden="true">
            <button className="ck-ico" tabIndex={-1} title="Minimise">
              <IconMin />
            </button>
            <button className="ck-ico" tabIndex={-1} title="Close">
              <IconClose />
            </button>
          </div>
        </div>

        {/* messages */}
        <div className="ck-body" ref={bodyRef} aria-live="polite">
          {SCRIPT.map((turn, i) => (
            <div
              key={i}
              className={`ck-msg ck-${turn.role}`}
              data-role={turn.role}
              aria-label={turn.role === "user" ? "You" : "Career Coach"}
              ref={(el) => {
                rowRefs.current[i] = el;
              }}
            >
              {turn.role === "coach" && (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="ck-av" src={LOGO} alt="Coach" width={34} height={34} />
              )}
              <div className="ck-col">
                <div className="ck-bubble">
                  <span
                    className="ck-txt"
                    ref={(el) => {
                      txtRefs.current[i] = el;
                    }}
                  />
                  {turn.role === "coach" && (
                    <span className="ck-dots" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* input (non-interactive but visually complete) */}
        <div className="ck-input" aria-hidden="true">
          <div className="ck-field">
            <span className="ck-ph">Message your coach…</span>
            <button className="ck-send" disabled tabIndex={-1}>
              <IconSend />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
