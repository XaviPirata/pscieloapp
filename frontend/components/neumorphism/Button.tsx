'use client'

import { forwardRef } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
}

const variants = {
  primary:
    'bg-gradient-to-br from-neomorphic-primary to-neomorphic-primary-dark text-slate-700 shadow-neomorphic hover:shadow-neomorphic-lg',
  secondary:
    'bg-gradient-to-br from-neomorphic-secondary to-neomorphic-secondary-dark text-slate-700 shadow-neomorphic hover:shadow-neomorphic-lg',
  ghost:
    'bg-white/60 backdrop-blur-sm text-slate-600 shadow-neomorphic-sm hover:shadow-neomorphic hover:bg-white/80',
  danger:
    'bg-gradient-to-br from-neomorphic-danger to-red-300 text-red-800 shadow-neomorphic hover:shadow-neomorphic-lg',
  success:
    'bg-gradient-to-br from-neomorphic-success to-green-300 text-green-800 shadow-neomorphic hover:shadow-neomorphic-lg',
}

const sizes = {
  sm: 'px-4 py-2 text-sm rounded-xl',
  md: 'px-6 py-3 text-base rounded-2xl',
  lg: 'px-8 py-4 text-lg rounded-2xl',
}

const NeuButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, children, className, disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -1 }}
        whileTap={{ scale: disabled ? 1 : 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className={cn(
          'relative inline-flex items-center justify-center gap-2 font-semibold',
          'transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neomorphic-secondary focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
          variants[variant],
          sizes[size],
          className,
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <motion.div
            className="h-5 w-5 rounded-full border-2 border-current border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
        ) : (
          icon
        )}
        {children}
      </motion.button>
    )
  },
)

NeuButton.displayName = 'NeuButton'
export default NeuButton
