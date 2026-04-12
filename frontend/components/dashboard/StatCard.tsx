'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: number
  prefix?: string
  suffix?: string
  change?: number
  changeLabel?: string
  icon: React.ReactNode
  color: 'rose' | 'blue' | 'green' | 'purple' | 'yellow'
  delay?: number
}

const colorMap = {
  rose: {
    bg: 'from-neomorphic-primary/40 to-neomorphic-primary/10',
    icon: 'from-neomorphic-primary to-neomorphic-primary-dark',
    glow: 'shadow-[0_8px_30px_rgba(255,214,224,0.4)]',
  },
  blue: {
    bg: 'from-neomorphic-secondary/40 to-neomorphic-secondary/10',
    icon: 'from-neomorphic-secondary to-neomorphic-secondary-dark',
    glow: 'shadow-[0_8px_30px_rgba(214,234,248,0.4)]',
  },
  green: {
    bg: 'from-neomorphic-success/40 to-neomorphic-success/10',
    icon: 'from-neomorphic-success to-green-300',
    glow: 'shadow-[0_8px_30px_rgba(168,230,207,0.4)]',
  },
  purple: {
    bg: 'from-pastel-purple/40 to-pastel-purple/10',
    icon: 'from-pastel-purple to-purple-300',
    glow: 'shadow-[0_8px_30px_rgba(232,213,240,0.4)]',
  },
  yellow: {
    bg: 'from-neomorphic-warning/40 to-neomorphic-warning/10',
    icon: 'from-neomorphic-warning to-yellow-300',
    glow: 'shadow-[0_8px_30px_rgba(255,217,61,0.3)]',
  },
}

/** Animated counter that goes from 0 to target */
function useAnimatedValue(target: number, duration: number = 1200, delay: number = 0) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timeout = setTimeout(() => {
      const start = performance.now()
      const step = (now: number) => {
        const elapsed = now - start
        const progress = Math.min(elapsed / duration, 1)
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3)
        setCurrent(Math.floor(target * eased))
        if (progress < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }, delay)
    return () => clearTimeout(timeout)
  }, [target, duration, delay])

  return current
}

export default function StatCard({
  title,
  value,
  prefix = '',
  suffix = '',
  change,
  changeLabel,
  icon,
  color,
  delay = 0,
}: StatCardProps) {
  const animatedValue = useAnimatedValue(value, 1400, delay)
  const colors = colorMap[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000, type: 'spring', stiffness: 200, damping: 20 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={cn(
        'relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white/80 dark:bg-slate-800/80 p-4 sm:p-6',
        'shadow-neomorphic backdrop-blur-sm',
        'transition-shadow duration-300',
        `hover:${colors.glow}`,
      )}
    >
      {/* Background gradient blob */}
      <div
        className={cn(
          'absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br opacity-30 blur-2xl',
          colors.bg,
        )}
      />

      <div className="relative z-10 flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs sm:text-sm font-medium text-slate-400 dark:text-slate-500">{title}</p>
          <div className="mt-1 sm:mt-2 flex items-baseline gap-1">
            <motion.span
              className="text-2xl sm:text-3xl font-bold text-slate-700 dark:text-slate-200"
              key={animatedValue}
            >
              {prefix}{animatedValue.toLocaleString('es-AR')}{suffix}
            </motion.span>
          </div>

          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
                  change >= 0
                    ? 'bg-green-100/60 text-green-700'
                    : 'bg-red-100/60 text-red-600',
                )}
              >
                {change >= 0 ? '+' : ''}{change}%
              </span>
              {changeLabel && (
                <span className="text-xs text-slate-400 dark:text-slate-500">{changeLabel}</span>
              )}
            </div>
          )}
        </div>

        {/* Icon */}
        <div
          className={cn(
            'flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl',
            'bg-gradient-to-br shadow-elevate-2',
            colors.icon,
          )}
        >
          <div className="text-white">{icon}</div>
        </div>
      </div>
    </motion.div>
  )
}
