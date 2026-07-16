"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* Every other world gets shots — a frame someone already chose. VR gets a
 * viewport: an equirect panorama you look around inside. Yaw wraps seamlessly
 * because equirects tile horizontally, so the whole camera is a translate3d
 * on one oversized layer — compositor-only, no repaints, no 3D library. */

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
  const layerRef = useRef<HTMLDivElement>(null);
  const poseRef = useRef<HTMLSpanElement>(null);
  const [channel, setChannel] = useState<ChannelKey>("konbini");
  const channelRef = useRef<ChannelKey>("konbini");
  channelRef.current = channel;

  /* camera state lives in refs — sampled by one gsap ticker, never re-renders.
     targets move instantly (drag), rendered values ease toward them, so the
     look always lands soft no matter how coarse the pointer events are */
  const cam = useRef({
    tYaw: 0,
    tPitch: 0,
    rYaw: 0,
    rPitch: 0,
    velYaw: 0,
    velPitch: 0,
    scrub: 0.5,
    kick: 0,
    dragging: false,
    active: false, // section on screen — ticker is a no-op otherwise
  });
  const size = useRef({ h: 0, layerH: 0 });
  const reducedRef = useRef(false);

  useEffect(() => {
    const stage = stageRef.current;
    const layer = layerRef.current;
    const root = rootRef.current;
    if (!stage || !layer || !root) return;

    // warm both channels so switching never shows a blank frame
    Object.values(CHANNELS).forEach(({ src }) => {
      const img = new window.Image();
      img.src = src;
    });

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    reducedRef.current = reduced;

    const applySizes = () => {
      const z = CHANNELS[channelRef.current].zoom;
      if (reduced) {
        // static centered frame, no camera
        layer.style.width = "100%";
        layer.style.height = "100%";
        layer.style.transform = "none";
        layer.style.backgroundSize = `auto ${z * 100}%`;
        layer.style.backgroundPosition = "50% 50%";
        return;
      }
      const r = stage.getBoundingClientRect();
      const layerH = z * r.height;
      // one full 360° span (2×layerH) plus a stage width so the window is
      // always covered while the translate wraps
      layer.style.height = `${layerH}px`;
      layer.style.width = `${2 * layerH + r.width}px`;
      layer.style.backgroundSize = `auto ${layerH}px`;
      size.current = { h: r.height, layerH };
      // land centered immediately so the frame never shows the zenith
      // while waiting for the first ticker write
      layer.style.transform = `translate3d(0px, ${(r.height - layerH) / 2}px, 0)`;
    };

    const ro = new ResizeObserver(applySizes);
    ro.observe(stage);
    // re-measure when the channel (zoom) changes
    const mo = new MutationObserver(applySizes);
    mo.observe(layer, { attributes: true, attributeFilter: ["data-ch"] });

    if (reduced) {
      return () => {
        ro.disconnect();
        mo.disconnect();
      };
    }

    const st = ScrollTrigger.create({
      trigger: root.closest(".world") ?? root,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        cam.current.scrub = self.progress;
      },
      onToggle: (self) => {
        cam.current.active = self.isActive;
      },
    });
    cam.current.active = st.isActive;

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
      const { layerH } = size.current;
      if (!layerH) return;
      const degPerPxX = 360 / (2 * layerH);
      const degPerPxY = 180 / layerH;
      const dYaw = -(e.clientX - lastX) * degPerPxX;
      const dPitch = (e.clientY - lastY) * degPerPxY;
      cam.current.tYaw += dYaw;
      cam.current.tPitch += dPitch;
      cam.current.velYaw = dYaw;
      cam.current.velPitch = dPitch;
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

    /* Infinity, NOT NaN: `Math.abs(x - NaN) > 0.05` is always false, which
       silently skips every transform write and kills the camera dead */
    let lastTx = Infinity;
    let lastTy = Infinity;
    let lastPose = "";
    const tick = () => {
      const c = cam.current;
      if (!c.active) return;
      const { h, layerH } = size.current;
      if (!h) return;
      const ch = CHANNELS[channelRef.current];

      // released drags glide to a stop
      if (!c.dragging) {
        c.tYaw += c.velYaw;
        c.tPitch += c.velPitch;
        c.velYaw *= 0.94;
        c.velPitch *= 0.94;
      }
      // rendered pose eases toward the target — this is the smoothness
      c.rYaw += (c.tYaw - c.rYaw) * 0.14;
      c.rPitch += (c.tPitch - c.rPitch) * 0.14;

      /* scroll contribution: the konbini pans across the aisle; the scaffold
         sinks — the deeper you scroll, the further down the camera looks */
      const isScaffold = channelRef.current === "scaffold";
      const scrubYaw = (c.scrub - 0.5) * (isScaffold ? 40 : 160);
      const scrubPitch = isScaffold ? (0.5 - c.scrub) * 34 : 0;

      const z = ch.zoom;
      const maxPitch = 90 - 90 / z - 2;
      const pitch = gsap.utils.clamp(
        -maxPitch,
        maxPitch,
        ch.basePitch + c.rPitch + scrubPitch + c.kick
      );
      const yaw = c.rYaw + scrubYaw;

      const span = 2 * layerH; // px per full 360°
      let x = -(((yaw / 360) * span) % span);
      if (x > 0) x -= span;
      const centerY = (h - layerH) / 2;
      const y = gsap.utils.clamp(h - layerH, 0, centerY + (pitch / 180) * layerH);

      // skip DOM writes when the camera has settled
      if (Math.abs(x - lastTx) > 0.05 || Math.abs(y - lastTy) > 0.05) {
        layer.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
        lastTx = x;
        lastTy = y;
      }
      if (poseRef.current) {
        const yawDisp = ((Math.round(yaw) % 360) + 360) % 360;
        const pitchDisp = Math.round(pitch);
        const pose = `YAW ${String(yawDisp).padStart(3, "0")}° · PITCH ${
          pitchDisp >= 0 ? "+" : "−"
        }${String(Math.abs(pitchDisp)).padStart(2, "0")}° · FOV ${Math.round(
          180 / z
        )}°`;
        if (pose !== lastPose) {
          poseRef.current.textContent = pose;
          lastPose = pose;
        }
      }
    };
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      st.kill();
      ro.disconnect();
      mo.disconnect();
      stage.removeEventListener("pointerdown", down);
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerup", up);
      stage.removeEventListener("pointercancel", up);
    };
  }, []);

  const switchChannel = (next: ChannelKey) => {
    if (next === channel) return;
    setChannel(next);
    const c = cam.current;
    c.tYaw = 0;
    c.tPitch = 0;
    c.rYaw = 0;
    c.rPitch = 0;
    c.velYaw = 0;
    c.velPitch = 0;
    /* the drop: entering the scaffold starts the camera level, then it
       sinks to the resting downward gaze — the stomach-drop beat */
    if (next === "scaffold" && !reducedRef.current) {
      gsap.fromTo(
        c,
        { kick: 34 },
        { kick: 0, duration: 1.6, ease: "power3.out", overwrite: "auto" }
      );
    } else {
      c.kick = 0;
    }
  };

  const ch = CHANNELS[channel];

  return (
    <div className="vrvp" ref={rootRef}>
      <div
        className="vp-stage"
        ref={stageRef}
        role="img"
        aria-label={
          channel === "konbini"
            ? "Interactive panorama inside a Japanese convenience store"
            : "Interactive panorama on construction scaffolding, looking down"
        }
      >
        <div
          className="vp-layer"
          ref={layerRef}
          data-ch={channel}
          style={{ backgroundImage: `url(${ch.src})` }}
        />
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
