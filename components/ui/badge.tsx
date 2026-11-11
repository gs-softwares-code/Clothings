import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'new' | 'bestseller' | 'sale' | 'gold' | 'outline' | 'secondary'
  size?: 'sm' | 'md'
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-neutral-900 text-white',
    new: 'bg-[#1A1A1A] text-white',
    bestseller: 'bg-[#C9A84C] text-white',
    sale: 'bg-rose-700 text-white',
    gold: 'bg-[#F7E7CE] text-[#8C6D1F] border border-[#E4C98E]',
    outline: 'border border-neutral-300 text-neutral-800 bg-white/80 backdrop-blur-sm',
    secondary: 'bg-neutral-100 text-neutral-700',
  }

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 tracking-wider font-semibold',
    md: 'text-xs px-2.5 py-1 tracking-widest font-medium',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center uppercase font-inter select-none',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export default Badge
