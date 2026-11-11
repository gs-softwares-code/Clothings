import React from 'react'
import { cn } from '@/lib/utils'

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: 'dark' | 'light' | 'gold' | 'charcoal'
}

const sizeClasses = {
  xs: 'w-3.5 h-3.5 border',
  sm: 'w-4 h-4 border-[1.5px]',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-2',
  xl: 'w-12 h-12 border-3',
}

const colorClasses = {
  dark: 'border-neutral-200 border-t-neutral-900',
  light: 'border-white/30 border-t-white',
  gold: 'border-[#F7E7CE] border-t-[#C9A84C]',
  charcoal: 'border-neutral-300 border-t-[#36454F]',
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'charcoal',
  className,
  ...props
}) => {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        'inline-block animate-spin rounded-full',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export default Spinner
