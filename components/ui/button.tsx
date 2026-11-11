import * as React from 'react'
import { cn } from '@/lib/utils'
import { Spinner } from './spinner'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gold' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-inter font-medium tracking-wider uppercase transition-all duration-200 select-none focus:outline-none focus-visible:ring-1 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]'

    const variantStyles = {
      primary:
        'bg-[#1A1A1A] text-white hover:bg-neutral-800 shadow-sm focus-visible:ring-neutral-900',
      secondary:
        'bg-neutral-100 text-[#1A1A1A] hover:bg-neutral-200 focus-visible:ring-neutral-400',
      outline:
        'border border-neutral-300 text-[#1A1A1A] bg-transparent hover:border-black hover:bg-black hover:text-white focus-visible:ring-black',
      ghost:
        'bg-transparent text-neutral-700 hover:bg-neutral-100/80 hover:text-black focus-visible:ring-neutral-300',
      gold:
        'bg-[#C9A84C] text-white hover:bg-[#B8963E] shadow-sm focus-visible:ring-[#C9A84C]',
      danger:
        'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
    }

    const sizeStyles = {
      sm: 'text-xs px-3.5 py-1.5 gap-1.5 h-8',
      md: 'text-xs px-5 py-2.5 gap-2 h-10 tracking-widest',
      lg: 'text-sm px-7 py-3.5 gap-2.5 h-12 tracking-widest',
      xl: 'text-sm px-9 py-4 gap-3 h-14 tracking-widest font-semibold',
      icon: 'h-10 w-10 p-0',
    }

    const spinnerColor =
      variant === 'outline' || variant === 'ghost' || variant === 'secondary'
        ? 'dark'
        : 'light'

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading && (
          <Spinner
            size={size === 'sm' || size === 'icon' ? 'xs' : 'sm'}
            color={spinnerColor}
            className="mr-2"
          />
        )}
        {!isLoading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
