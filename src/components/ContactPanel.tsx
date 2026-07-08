"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const PHONE = "+92 3222805717";
const PHONE_PRETTY = "+92 322 280 5717";
const EMAIL = "inbox@muren.ai";
const ADDRESS = "Hatch 8, NUST, H-12, Islamabad, Pakistan";

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" fill="none" aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V6a2 2 0 0 1 2-2h9" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" fill="none" aria-hidden="true">
      <path d="M5 12.5l4 4 10-11" />
    </svg>
  );
}

/**
 * Contact — a stack of rounded ink cards anchored top-right.
 * Opens when any element carrying `data-contact` is clicked (works from
 * server components too, via document-level delegation).
 */
export default function ContactPanel() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const copyTimer = useRef<number | null>(null);
  const stackRef = useRef<HTMLElement>(null);

  // open via any [data-contact] trigger anywhere on the page
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = (e.target as HTMLElement | null)?.closest("[data-contact]");
      if (!t) return;
      e.preventDefault();
      setOpen(true);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // esc to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // move focus onto the panel when it opens
  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  // the cards deal in like dossier pages dropped on a desk — each arrives
  // slightly rotated and settles flat (the wrappers animate, so the cards'
  // own CSS hover transitions are never contested)
  useEffect(() => {
    const stack = stackRef.current;
    if (!open || !stack) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const deals = stack.querySelectorAll<HTMLElement>(".cx-deal");
    const tween = gsap.fromTo(
      deals,
      {
        y: 30,
        opacity: 0,
        rotate: (i: number) => (i % 2 ? 1.4 : -1.4),
      },
      {
        y: 0,
        opacity: 1,
        rotate: 0,
        duration: 0.55,
        ease: "power3.out",
        stagger: 0.07,
        delay: 0.1,
        clearProps: "all",
      }
    );
    return () => {
      tween.kill();
    };
  }, [open]);

  const copy = useCallback((key: string, value: string) => {
    navigator.clipboard?.writeText(value).then(() => {
      setCopied(key);
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(null), 1600);
    });
  }, []);

  return (
    <div className={`cx-scrim${open ? " open" : ""}`} onClick={() => setOpen(false)}>
      <aside
        className="cx-stack"
        role="dialog"
        aria-label="Contact MUREN"
        aria-hidden={!open}
        onClick={(e) => e.stopPropagation()}
        ref={stackRef}
      >
        <div className="cx-deal">
          <div className="cx-card cx-lead">
            <button ref={closeRef} className="cx-x" onClick={() => setOpen(false)} aria-label="Close">
              <svg viewBox="0 0 24 24" width="34" height="34" fill="none" aria-hidden="true">
                <path d="M4 4l16 16M20 4L4 20" />
              </svg>
            </button>
            <h2 className="cx-head">
              Let&apos;s talk systems,
              <br />
              let&apos;s talk <em>what&apos;s next.</em>
            </h2>
          </div>
        </div>

        <div className="cx-deal">
          <div className="cx-card">
            <span className="cx-label">Call us</span>
            <a className="cx-value" href={`tel:${PHONE.replace(/\s+/g, "")}`}>
              {PHONE_PRETTY}
            </a>
            <button
              className={`cx-copy${copied === "call" ? " done" : ""}`}
              onClick={() => copy("call", PHONE)}
              aria-label="Copy phone number"
            >
              {copied === "call" ? <CheckIcon /> : <CopyIcon />}
            </button>
          </div>
        </div>

        <div className="cx-deal">
          <div className="cx-card">
            <span className="cx-label">Write to us</span>
            <a className="cx-value" href={`mailto:${EMAIL}`}>
              {EMAIL}
            </a>
            <button
              className={`cx-copy${copied === "mail" ? " done" : ""}`}
              onClick={() => copy("mail", EMAIL)}
              aria-label="Copy email address"
            >
              {copied === "mail" ? <CheckIcon /> : <CopyIcon />}
            </button>
          </div>
        </div>

        <div className="cx-deal">
          <div className="cx-card">
            <span className="cx-label">Find us</span>
            <span className="cx-value cx-value--addr">{ADDRESS}</span>
            <button
              className={`cx-copy${copied === "addr" ? " done" : ""}`}
              onClick={() => copy("addr", ADDRESS)}
              aria-label="Copy address"
            >
              {copied === "addr" ? <CheckIcon /> : <CopyIcon />}
            </button>
          </div>
        </div>

        <div className="cx-deal">
          <div className="cx-card">
            <span className="cx-label">Follow</span>
            <span className="cx-value cx-socials">
              <a href="https://www.linkedin.com/company/muren/" target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
              <span aria-hidden="true">·</span>
              <a href="https://github.com/muren-ai/" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
}
