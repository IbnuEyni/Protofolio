import { useEffect, useRef } from "react";

/**
 * Modal behaviour shared by the detail dialogs: Escape closes, focus moves to
 * the returned ref (the close button) and goes back to the trigger on close,
 * and the page behind stops scrolling. `onClose` must be referentially stable.
 */
export function useDialog<T extends HTMLElement>(onClose: () => void) {
  const initialFocusRef = useRef<T>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    initialFocusRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [onClose]);

  return initialFocusRef;
}
