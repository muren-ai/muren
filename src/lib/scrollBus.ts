/**
 * Shared scroll telemetry, written once per frame by SmoothScroll (Lenis)
 * and read by any component that wants to react to scroll velocity —
 * the marquee rail speed and the hero stamp spin rate. A plain mutable
 * object (not state) so consumers can sample it inside their own tickers
 * without re-renders.
 */
export const scrollBus = {
  /** signed Lenis velocity (px/frame-ish); ~0 when the page is at rest */
  velocity: 0,
};
