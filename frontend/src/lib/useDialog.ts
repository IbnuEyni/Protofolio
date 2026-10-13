import { useEffect, useRef } from "react";

/**
 * Modal behaviour shared by the dialogs: Escape closes, focus moves to the
 * returned ref (the close button) and goes back to the trigger on close, and
 * the page behind stops scrolling. Runs once per open, so callers can pass an
 * inline `onClose` without focus jumping back on every re-render.
 */
export function useDialog<T extends HTMLElement>(onClose: () => void) {
  const initialFocusRef = useRef<T>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; });

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    initialFocusRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCloseRef.current(); };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);

  return initialFocusRef;
}
