import type { Variants, Transition } from 'framer-motion'

// ── Transições padrão ─────────────────────────────────────────────────────────
export const spring: Transition = { type: 'spring', stiffness: 400, damping: 30 }
export const springBounce: Transition = { type: 'spring', stiffness: 500, damping: 20 }
export const smooth: Transition = { duration: 0.25, ease: [0.4, 0, 0.2, 1] }
export const smoothSlow: Transition = { duration: 0.35, ease: [0.4, 0, 0.2, 1] }

// ── Variantes de animação ─────────────────────────────────────────────────────

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: smooth },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: smoothSlow },
  exit: { opacity: 0, y: 4, transition: { duration: 0.15 } },
}

export const fadeScale: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: { opacity: 1, scale: 1, transition: smooth },
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.15 } },
}

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: smooth },
  exit: { opacity: 0, x: -8, transition: { duration: 0.15 } },
}

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 12 },
  visible: { opacity: 1, x: 0, transition: smooth },
  exit: { opacity: 0, x: 8, transition: { duration: 0.15 } },
}

export const slideInBottom: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: spring },
  exit: { opacity: 0, y: 16, transition: { duration: 0.2 } },
}

// Drawer slide-in da direita (para DrawerEditor)
export const drawerRight: Variants = {
  hidden: { opacity: 0, x: '100%' },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 320, damping: 32 } },
  exit: { opacity: 0, x: '100%', transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } },
}

// Overlay backdrop
export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

// ── Stagger container ─────────────────────────────────────────────────────────
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: smooth },
}

// ── Page transition ───────────────────────────────────────────────────────────
export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.2 } },
}

// ── Context menu ──────────────────────────────────────────────────────────────
export const contextMenuVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: -4 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.12, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, scale: 0.95, y: -4, transition: { duration: 0.1 } },
}
