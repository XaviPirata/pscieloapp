'use client'

import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  variant?: 'elevated' | 'flat' | 'glass' | 'inset'
  hover?: boolean
  glow?: 'rose' | 'blue' | 'purple' | 'green' | 'none'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const variantStyles = {
  elevated: [
    'bg-white/90 dark:bg-slate-900/80',
    'shadow-neomorphic',
    'dark:border dark:border-white/[0.05]',
  ].join(' '),
  flat: [
    'bg-white/60 dark:bg-slate-900/60',
    'shadow-neomorphic-sm',
    'dark:border dark:border-white/[0.04]',
  ].join(' '),
  glass: [
    'bg-white/30 dark:bg-slate-900/20',
    'backdrop-blur-xl',
    'border border-white/40 dark:border-white/[0.06]',
    'shadow-elevate-2',
  ].join(' '),
  inset: [
    'bg-neomorphic-light-shade dark:bg-slate-950/70',
    'shadow-neomorphic-inset',
  ].join(' '),
}

const glowStyles = {
  rose: 'hover:shadow-[0_0_30px_rgba(255,214,224,0.5)] dark:hover:shadow-[0_0_30px_rgba(244,63,94,0.25)]',
  blue: 'hover:shadow-[0_0_30px_rgba(214,234,248,0.5)] dark:hover:shadow-[0_0_30px_rgba(59,130,246,0.25)]',
  purple: 'hover:shadow-[0_0_30px_rgba(232,213,240,0.5)] dark:hover:shadow-[0_0_30px_rgba(168,85,247,0.25)]',
  green: 'hover:shadow-[0_0_30px_rgba(168,230,207,0.5)] dark:hover:shadow-[0_0_30px_rgba(34,197,94,0.25)]',
  none: '',
}

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export default function NeuCard({
  variant = 'elevated',
  hover = true,
  glow = 'none',
  padding = 'md',
  children,
  className,
  ...props
}: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -3, scale: 1.005 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        'rounded-2xl transition-all duration-300',
        variantStyles[variant],
        glowStyles[glow],
        paddings[padding],
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}
