"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* Every other world gets shots — a frame someone already chose. VR gets a
 * viewport: an equirect panorama you look around inside. Yaw wraps seamlessly
 * because equirects tile horizontally (background-repeat: repeat-x), so the
 * whole camera is just background-position math — no 3D library. */

type ChannelKey = "konbini" | "scaffold";

const CHANNELS: Record<
  ChannelKey,
  { src: string; label: string; zoom: number; basePitch: number }
> = {
  konbini: {
    src: "/worlds/vr-konbini.webp",
    label: "CH.01 — KONBINI, TOKYO",
    zoom: 2.6,
    basePitch: 0,
  },
  scaffold: {
    src: "/worlds/vr-scaffold.webp",
    label: "CH.02 — SCAFFOLD, 10F",
    zoom: 2.4,
    basePitch: -30,
  },
};

export default function VRViewport() {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const poseRef = useRef<HTMLSpanElement>(null);
  const [channel, setChannel] = useState<ChannelKey>("konbini");
  const channelRef = useRef<ChannelKey>("konbini");
  channelRef.current = channel;

  // camera state lives in refs — sampled by one gsap ticker, never re-renders
  const cam = useRef({
    yaw: 0, // free-look offset from dragging
    pitch: 0,
    velYaw: 0,
    velPitch: 0,
    scrub: 0.5, // section scroll progress
    kick: 0, // transient tilt used for the channel-switch drop
    dragging: false,
  });
  const stageH = useRef(0);

  useEffect(() => {
    const stage = stageRef.current;
    const root = rootRef.current;
    if (!stage || !root) return;

    // warm the other channel so switching never shows a blank frame
    Object.values(CHANNELS).forEach(({ src }) => {
      const img = new window.Image();
      img.src = src;
    });

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return; // CSS renders the static centered frame

    const ro = new ResizeObserver(() => {
      stageH.current = stage.getBoundingClientRect().height;
    });
    ro.observe(stage);

    const st = ScrollTrigger.create({
      trigger: root.closest(".world") ?? root,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        cam.current.scrub = self.progress;
      },
    });

    /* drag = free look. horizontal drags only, so vertical touch still
       scrolls the page (touch-action: pan-y on the stage) */
    let lastX = 0;
    let lastY = 0;
    const down = (e: PointerEvent) => {
      cam.current.dragging = true;
      cam.current.velYaw = 0;
      cam.current.velPitch = 0;
      lastX = e.clientX;
      lastY = e.clientY;
      stage.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!cam.current.dragging) return;
      const h = stageH.current || stage.getBoundingClientRect().height;
      const z = CHANNELS[channelRef.current].zoom;
      const bgH = z * h;
      const degPerPxX = 360 / (2 * bgH);
      const degPerPxY = 180 / bgH;
      const dYaw = -(e.clientX - lastX) * degPerPxX;
      const dPitch = (e.clientY - lastY) * degPerPxY;
      cam.current.yaw += dYaw;
      cam.current.pitch -= dPitch;
      cam.current.velYaw = dYaw;
      cam.current.velPitch = -dPitch;
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const up = () => {
      cam.current.dragging = false;
    };
    stage.addEventListener("pointerdown", down);
    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerup", up);
    stage.addEventListener("pointercancel", up);

    const tick = () => {
      const c = cam.current;
      const ch = CHANNELS[channelRef.current];
      const h = stageH.current;
      if (!h) return;

      // released drags glide to a stop
      if (!c.dragging) {
        c.yaw += c.velYaw;
        c.pitch += c.velPitch;
        c.velYaw *= 0.93;
        c.velPitch *= 0.93;
      }

      /* scroll contribution: the konbini pans across the aisle; the scaffold
         sinks — the deeper you scroll, the further down the camera looks */
      const scrubYaw =
        channelRef.current === "konbini"
          ? (c.scrub - 0.5) * 160
          : (c.scrub - 0.5) * 40;
      const scrubPitch =
        channelRef.current === "scaffold" ? (0.5 - c.scrub) * 34 : 0;

      const z = ch.zoom;
      const maxPitch = 90 - 90 / z - 2;
      const pitch = gsap.utils.clamp(
        -maxPitch,
        maxPitch,
        ch.basePitch + c.pitch + scrubPitch + c.kick
      );
      const yaw = c.yaw + scrubYaw;

      const bgH = z * h;
      const bgW = 2 * bgH;
      const x = -((((yaw / 360) * bgW) % bgW));
      const centerY = (h - bgH) / 2;
      const y = gsap.utils.clamp(h - bgH, 0, centerY + (pitch / 180) * bgH);

      stage.style.backgroundPosition = `${x.toFixed(1)}px ${y.toFixed(1)}px`;

      if (poseRef.current) {
        const yawDisp = ((Math.round(yaw) % 360) + 360) % 360;
        const pitchDisp = Math.round(pitch);
        poseRef.current.textContent = `YAW ${String(yawDisp).padStart(
          3,
          "0"
        )}° · PITCH ${pitchDisp >= 0 ? "+" : "−"}${String(
          Math.abs(pitchDisp)
        ).padStart(2, "0")}° · FOV ${Math.round(180 / z)}°`;
      }
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      st.kill();
      ro.disconnect();
      stage.removeEventListener("pointerdown", down);
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerup", up);
      stage.removeEventListener("pointercancel", up);
    };
  }, []);

  const switchChannel = (next: ChannelKey) => {
    if (next === channel) return;
    setChannel(next);
    cam.current.yaw = 0;
    cam.current.pitch = 0;
    cam.current.velYaw = 0;
    cam.current.velPitch = 0;
    /* the drop: entering the scaffold starts the camera level, then it
       sinks to the resting downward gaze — the stomach-drop beat */
    if (next === "scaffold") {
      const c = cam.current;
      gsap.fromTo(
        c,
        { kick: 34 },
        { kick: 0, duration: 1.6, ease: "power3.out", overwrite: "auto" }
      );
    } else {
      cam.current.kick = 0;
    }
  };

  const ch = CHANNELS[channel];

  return (
    <div className="vrvp" ref={rootRef}>
      <div
        className="vp-stage"
        ref={stageRef}
        style={{
          backgroundImage: `url(${ch.src})`,
          backgroundSize: `auto ${ch.zoom * 100}%`,
        }}
        role="img"
        aria-label={
          channel === "konbini"
            ? "Interactive panorama inside a Japanese convenience store"
            : "Interactive panorama on construction scaffolding, looking down"
        }
      >
        <span className="edge" />
        <span className="vp-ret" aria-hidden="true" />
        <span className="vp-pose" ref={poseRef}>
          YAW 000° · PITCH +00° · FOV {Math.round(180 / ch.zoom)}°
        </span>
        <span className="vp-hint">DRAG TO LOOK</span>
        <span className="tag">POV 02 — NO ONE PICKS YOUR FRAME</span>
      </div>
      <div className="vp-channels" role="tablist" aria-label="Simulation channel">
        {(Object.keys(CHANNELS) as ChannelKey[]).map((key) => (
          <button
            key={key}
            role="tab"
            aria-selected={channel === key}
            className={channel === key ? "on" : ""}
            onClick={() => switchChannel(key)}
          >
            {CHANNELS[key].label}
          </button>
        ))}
      </div>
    </div>
  );
}
