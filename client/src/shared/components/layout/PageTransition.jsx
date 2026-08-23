import { motion } from 'framer-motion';

const VARIANTS = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

/**
 * Wraps a page so route changes cross-fade instead of snapping.
 * Disabled automatically when the viewer prefers reduced motion (see
 * `<MotionConfig reducedMotion="user">` in AppProviders).
 */
export function PageTransition({ children }) {
  return (
    <motion.div
      variants={VARIANTS}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
