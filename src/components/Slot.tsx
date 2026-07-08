"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useSlots } from "./SlotContext";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type Media = { url: string; type: "image" | "video"; owned: boolean };

/**
 * A v9 asset slot: click or drag-drop an image/video to preview it.
 * `src` pre-fills a real, finalized asset (dropped media overrides it).
 * Reset by the global CLEAR ASSETS control via SlotContext.
 */
export default function Slot({
  className = "",
  big,
  sub,
  src,
  children,
  locked = false,
}: {
  className?: string;
  big: string;
  sub?: string;
  src?: string;
  children?: React.ReactNode;
  /** locked slots ignore click/drag (used for the hero) */
  locked?: boolean;
}) {
  const initial = (): Media | null =>
    src
      ? { url: src, type: /\.(mp4|webm|mov)$/i.test(src) ? "video" : "image", owned: false }
      : null;

  const [media, setMedia] = useState<Media | null>(initial);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const { clearVersion } = useSlots();

  // The "develop" reveal: as each photo reaches the viewport it blooms from
  // grayscale into full colour and settles from a slight overscale — the whole
  // site's imagery resolves like a print in a tray. Locked slots (the hero,
  // which already wipes) and slots carrying their own overlay treatment (the
  // CS.02 satellite scan) opt out so effects never stack.
  const canDevelop = !locked && !children;
  useGSAP(
    () => {
      if (!canDevelop || !media) return;
      const el = mediaRef.current;
      if (!el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.set(el, { filter: "grayscale(1) contrast(1.04) brightness(1.02)", scale: 1.06 });
      gsap.to(el, {
        filter: "grayscale(0) contrast(1) brightness(1)",
        scale: 1,
        duration: 1.25,
        ease: "power2.out",
        scrollTrigger: { trigger: rootRef.current, start: "top 85%", once: true },
        onComplete: () => gsap.set(el, { clearProps: "filter,transform,scale" }),
      });
    },
    { scope: rootRef, dependencies: [!!media, canDevelop] }
  );

  const load = (file?: File) => {
    if (!file) return;
    setMedia((prev) => {
      if (prev?.owned) URL.revokeObjectURL(prev.url);
      return {
        url: URL.createObjectURL(file),
        type: file.type.startsWith("video") ? "video" : "image",
        owned: true,
      };
    });
  };

  // global CLEAR: revoke owned object URLs and reset to the (optional) preset
  useEffect(() => {
    if (clearVersion === 0) return;
    setMedia((prev) => {
      if (prev?.owned) URL.revokeObjectURL(prev.url);
      return initial();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearVersion]);

  // revoke on unmount
  useEffect(
    () => () => {
      setMedia((prev) => {
        if (prev?.owned) URL.revokeObjectURL(prev.url);
        return prev;
      });
    },
    []
  );

  const interactive = !locked;
  const handlers = interactive
    ? {
        "data-slot": true,
        onClick: (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          inputRef.current?.click();
        },
        onDragEnter: (e: React.DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
          setDrag(true);
        },
        onDragOver: (e: React.DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
          setDrag(true);
        },
        onDragLeave: (e: React.DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
          setDrag(false);
        },
        onDrop: (e: React.DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
          setDrag(false);
          load(e.dataTransfer.files[0]);
        },
      }
    : {};

  return (
    <div
      ref={rootRef}
      className={`slot${media ? " filled" : ""}${drag ? " drag" : ""}${
        locked ? " locked" : ""
      }${className ? " " + className : ""}`}
      {...handlers}
    >
      <span className="edge" />
      {media && (
        <div className="slot-media" ref={mediaRef}>
          {media.type === "video" ? (
            <video src={media.url} autoPlay loop muted playsInline />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={media.url} alt={big} />
          )}
        </div>
      )}
      <div className="ph">
        <span className="big">{big}</span>
        {sub && <span>{sub}</span>}
      </div>
      {children}
      {interactive && (
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          hidden
          onChange={(e) => load(e.target.files?.[0])}
        />
      )}
    </div>
  );
}
