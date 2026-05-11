'use client'

import { cn } from '../../lib/utils'

interface GlassButtonProps {
  label: string
  onClick?: () => void
  className?: string
  variant?: 'primary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export default function GlassButton({
  label,
  onClick,
  className,
  variant = 'primary',
  size = 'md',
}: GlassButtonProps) {
  const sizeClasses = {
    sm: 'h-9 px-5 text-sm',
    md: 'h-11 px-7 text-sm',
    lg: 'h-12 px-8 text-base',
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        // Base
        'relative group cursor-pointer rounded-full font-medium tracking-wide',
        'transition-all duration-300 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2',
        // Size
        sizeClasses[size],
        // Variants
        variant === 'primary' && [
          // Light mode: solid, visible glass
          'bg-primary/10 dark:bg-white/[0.07]',
          'backdrop-blur-xl',
          'border border-primary/30 dark:border-white/10',
          'text-primary dark:text-foreground',
          // Glow
          'shadow-[0_0_20px_rgba(37,99,235,0.12),inset_0_1px_0_rgba(255,255,255,0.3)]',
          'dark:shadow-[0_0_25px_rgba(173,198,255,0.12),inset_0_1px_0_rgba(255,255,255,0.06)]',
          // Hover
          'hover:bg-primary/15 dark:hover:bg-white/[0.12]',
          'hover:border-primary/50 dark:hover:border-primary/30',
          'hover:shadow-[0_0_30px_rgba(37,99,235,0.2),inset_0_1px_0_rgba(255,255,255,0.4)]',
          'dark:hover:shadow-[0_0_35px_rgba(173,198,255,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]',
          'hover:scale-[1.02]',
          // Active
          'active:scale-[0.98] active:shadow-[0_0_15px_rgba(37,99,235,0.2)]',
        ],
        variant === 'outline' && [
          'bg-transparent',
          'border border-foreground/20 dark:border-foreground/10',
          'text-foreground/70 dark:text-foreground/80',
          'hover:bg-foreground/5 dark:hover:bg-white/[0.04]',
          'hover:border-foreground/35 dark:hover:border-foreground/20',
          'hover:text-foreground',
          'hover:scale-[1.02]',
          'active:scale-[0.98]',
        ],
        className,
      )}
    >
      {/* Subtle glow pulse behind for primary */}
      {variant === 'primary' && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/15 via-primary/5 to-primary/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
      )}
      <span className="relative z-10">{label}</span>
    </button>
  )
}
