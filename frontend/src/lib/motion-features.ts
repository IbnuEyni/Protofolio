// Loaded on demand by <LazyMotion> so the animation engine stays out of the
// startup bundle. domAnimation covers animate/variants/exit plus hover, tap,
// focus and in-view gestures — everything the site uses (no drag/layout).
import { domAnimation } from "framer-motion";

export default domAnimation;
