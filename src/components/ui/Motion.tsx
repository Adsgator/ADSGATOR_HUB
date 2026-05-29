'use client'

import { motion, AnimatePresence, type HTMLMotionProps } from 'framer-motion'
import {
  fadeIn, fadeUp, fadeScale, slideInLeft, slideInRight,
  staggerContainer, staggerItem, pageTransition,
} from '@/lib/motion'

type DivProps = HTMLMotionProps<'div'>

// ── MotionFade ────────────────────────────────────────────────────────────────
export function MotionFade({ children, className, ...props }: DivProps) {
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// ── MotionFadeUp ──────────────────────────────────────────────────────────────
export function MotionFadeUp({ children, className, ...props }: DivProps) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// ── MotionScale ───────────────────────────────────────────────────────────────
export function MotionScale({ children, className, ...props }: DivProps) {
  return (
    <motion.div
      variants={fadeScale}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// ── MotionSlideLeft ───────────────────────────────────────────────────────────
export function MotionSlideLeft({ children, className, ...props }: DivProps) {
  return (
    <motion.div
      variants={slideInLeft}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// ── MotionSlideRight ──────────────────────────────────────────────────────────
export function MotionSlideRight({ children, className, ...props }: DivProps) {
  return (
    <motion.div
      variants={slideInRight}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// ── MotionPage ────────────────────────────────────────────────────────────────
export function MotionPage({ children, className, ...props }: DivProps) {
  return (
    <motion.div
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// ── MotionStagger — wrapper com stagger para listas ───────────────────────────
export function MotionStagger({ children, className, ...props }: DivProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// ── MotionStaggerItem — filho do MotionStagger ────────────────────────────────
export function MotionStaggerItem({ children, className, ...props }: DivProps) {
  return (
    <motion.div
      variants={staggerItem}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

// Re-export AnimatePresence para uso conveniente
export { AnimatePresence }
export { motion }
