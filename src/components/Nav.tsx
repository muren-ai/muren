"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";

const ARRAY = [
  { no: "01", name: "Career Konnect", sector: "education & workforce", code: "EDU", href: "#w-career" },
  { no: "02", name: "VR Training", sector: "immersive simulation", code: "SIM", href: "#w-vr" },
  { no: "03", name: "Factory Copilot", sector: "industrial ai", code: "IND", href: "#w-factory" },
  { no: "04", name: "Eco Muhafiz", sector: "climate & environment", code: "ENV", href: "#w-eco" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [clock, setClock] = useState("--:--:--");
  const headerRef = useRef<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  // header hairline draws in on load
  useEffect(() => {
    const id = requestAnimationFrame(() => headerRef.current?.classList.add("drawn"));
    return () => cancelAnimationFrame(id);
  }, []);

  // hide the header on scroll-down, reveal it gently on scroll-up
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      if (y < 80) setHidden(false);
      else if (y > lastY + 6) setHidden(true);
      else if (y < lastY - 6) setHidden(false);
      lastY = y;
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // live clock (overlay foot)
  useEffect(() => {
    const p = (n: number) => String(n).padStart(2, "0");
    const tick = () => {
      const d = new Date();
      setClock(`${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // esc to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // opening choreography: the ink panel slides (CSS), then the big links
  // ride up through their masks and the ARRAY prints row by row
  useEffect(() => {
    const ov = overlayRef.current;
    if (!open || !ov) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const links = ov.querySelectorAll<HTMLElement>(".ov-nav a");
    const rows = ov.querySelectorAll<HTMLElement>(".idx-item");
    const head = ov.querySelector<HTMLElement>(".idx-head");
    const tl = gsap.timeline({ delay: 0.28 });
    // suspend the links' CSS hover transition while GSAP owns their transform
    tl.set(links, { transition: "none" });
    tl.fromTo(
      links,
      { yPercent: 120 },
      {
        yPercent: 0,
        duration: 0.75,
        ease: "power4.out",
        stagger: 0.06,
        clearProps: "transform,transition",
      }
    );
    if (head)
      tl.fromTo(
        head,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: "none" },
        0.15
      );
    tl.fromTo(
      rows,
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        ease: "power3.out",
        stagger: 0.07,
        clearProps: "all",
      },
      0.3
    );
    return () => {
      tl.kill();
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <header className={`hd${hidden && !open ? " hd--hidden" : ""}`} ref={headerRef}>
        <nav className="top">
          <a href="#" className="brand" aria-label="MUREN — home">
            <Image
              src="/assets/muren-horizontal.png?v=2"
              alt="MUREN"
              width={1176}
              height={273}
              priority
            />
          </a>
          <div className="links">
            <a href="#work" className="navlink" data-text="CASE STUDIES">
              <span>CASE STUDIES</span>
            </a>
            <a href="#w-career" className="navlink" data-text="SYSTEMS">
              <span>SYSTEMS</span>
            </a>
            <a href="#" data-contact className="navlink" data-text="CONTACT">
              <span>CONTACT</span>
            </a>
            <button className="idxbtn" onClick={() => setOpen(true)}>
              INDEX{" "}
              <span className="bars">
                <i></i>
                <i></i>
              </span>
            </button>
          </div>
        </nav>
      </header>

      <div
        className={`overlay${open ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        ref={overlayRef}
      >
        <div className="ov-top">
          <span className="wm">MUREN</span>
          <button className="ov-close" onClick={close}>
            CLOSE ×
          </button>
        </div>
        <div className="ov-body">
          <nav className="ov-nav">
            <div className="ov-mask">
              <a href="#work" onClick={close}>
                Work <span className="k">02</span>
              </a>
            </div>
            <div className="ov-mask">
              <a href="#w-career" onClick={close}>
                Systems <span className="k">04</span>
              </a>
            </div>
            <div className="ov-mask">
              <a href="#" onClick={close}>
                Research
              </a>
            </div>
            <div className="ov-mask">
              <a href="#" onClick={close}>
                The Group
              </a>
            </div>
            <div className="ov-mask">
              <a href="#" data-contact onClick={close}>
                Contact
              </a>
            </div>
          </nav>
          <div className="ov-side">
            <div className="idx-head">
              <span>THE ARRAY</span>
              <span>04 SYSTEMS</span>
            </div>
            <ol className="idx-list">
              {ARRAY.map((s) => (
                <li key={s.no}>
                  <a className="idx-item" href={s.href} onClick={close}>
                    <span className="idx-no">{s.no}</span>
                    <span className="idx-name">{s.name}</span>
                    <span className="idx-code">{s.code}</span>
                    <span className="idx-sector">{s.sector}</span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <div className="ov-foot">
          <span>ISLAMABAD · 33.68°N 73.05°E</span>
          <span>RESEARCH FIRST · PRODUCT ALWAYS</span>
          <span suppressHydrationWarning>{clock}</span>
        </div>
      </div>
    </>
  );
}
