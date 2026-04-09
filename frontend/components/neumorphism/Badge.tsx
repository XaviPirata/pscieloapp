'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'rose' | 'blue' | 'green' | 'purple' | 'yellow' | 'gray' | 'red'
  size?: 'sm' | 'md'
  pulse?: boolean
  className?: string
}

const colors = {
  rose: 'bg-pastel-rose/60 text-rose-700 border-rose-200/50',
  blue: 'bg-pastel-blue/60 text-blue-700 border-blue-200/50',
  green: 'bg-pastel-green/60 text-green-700 border-green-200/50',
  purple: 'bg-pastel-purple/60 text-purple-700 border-purple-200/50',
  yellow: 'bg-pastel-yellow/60 text-yellow-700 border-yellow-200/50',
  gray: 'bg-pastel-gray/60 text-slate-600 border-slate-200/50',
  red: 'bg-red-100/60 text-red-700 border-red-200/50',
}

const badgeSizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
}

export default function NeuBadge({
  children,
  variant = 'blue',
  size = 'sm',
  pulse = false,
  className,
}: BadgeProps) {
  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium',
        'backdrop-blur-sm',
        colors[variant],
        badgeSizes[size],
        className,
      )}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className={cn(
            'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
            variant === 'green' && 'bg-green-400',
            variant === 'rose' && 'bg-rose-400',
            variant === 'blue' && 'bg-blue-400',
          )} />
          <span className={cn(
            'relative inline-flex h-2 w-2 rounded-full',
            variant === 'green' && 'bg-green-500',
            variant === 'rose' && 'bg-rose-500',
            variant === 'blue' && 'bg-blue-500',
          )} />
        </span>
      )}
      {children}
    </motion.span>
  )
}
