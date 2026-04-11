'use client'

import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  variant?: 'default' | 'inset'
}

const NeuInput = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, variant = 'default', className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-400">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full rounded-xl px-4 py-3 outline-none transition-all duration-200',
              'text-slate-700 dark:text-slate-200',
              'placeholder:text-slate-300 dark:placeholder:text-slate-600',
              variant === 'default' && [
                'bg-white/80 dark:bg-slate-900/80',
                'shadow-neomorphic-sm',
                'focus:shadow-neomorphic focus:bg-white dark:focus:bg-slate-900',
                'dark:border dark:border-white/[0.05]',
              ],
              variant === 'inset' && [
                'bg-neomorphic-light-shade dark:bg-slate-950/70',
                'shadow-neomorphic-inset',
                'focus:shadow-[inset_2px_2px_4px_rgba(163,174,208,0.15),inset_-2px_-2px_4px_rgba(255,255,255,0.7)]',
                'dark:focus:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.4),inset_-2px_-2px_6px_rgba(255,255,255,0.02)]',
              ],
              'focus:ring-2 focus:ring-neomorphic-secondary/50 dark:focus:ring-indigo-500/30',
              error && 'ring-2 ring-neomorphic-danger/50',
              icon && 'pl-11',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              className,
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{error}</p>
        )}
      </div>
    )
  },
)

NeuInput.displayName = 'NeuInput'
export default NeuInput
