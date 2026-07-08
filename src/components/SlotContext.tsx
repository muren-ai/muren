"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";

type SlotCtx = { clearVersion: number; clearAll: () => void };

const Ctx = createContext<SlotCtx>({ clearVersion: 0, clearAll: () => {} });

export function useSlots() {
  return useContext(Ctx);
}

/** Wraps the page so a single CLEAR ASSETS control can reset every Slot. */
export default function SlotProvider({ children }: { children: React.ReactNode }) {
  const [clearVersion, setClearVersion] = useState(0);
  const clearAll = useCallback(() => setClearVersion((v) => v + 1), []);

  // Prevent the browser from opening an image when it's dropped anywhere
  // OUTSIDE a slot (slots stopPropagation, so their own drops still work).
  useEffect(() => {
    const prevent = (e: DragEvent) => e.preventDefault();
    window.addEventListener("dragover", prevent);
    window.addEventListener("drop", prevent);
    return () => {
      window.removeEventListener("dragover", prevent);
      window.removeEventListener("drop", prevent);
    };
  }, []);

  return <Ctx.Provider value={{ clearVersion, clearAll }}>{children}</Ctx.Provider>;
}
