"use client";

import { LazyMotion, MotionConfig } from "framer-motion";

const loadFeatures = () => import("@/lib/motion-features").then((mod) => mod.default);

// Components use the lightweight `m.*` elements; the animation features load
// after hydration (strict mode throws if a full `motion.*` sneaks back in).
// MotionConfig honours the OS "reduce motion" setting for every animation.
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
