'use client'

import * as React from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface RatingProps {
  value: number
  max?: number
  size?: 'xs' | 'sm' | 'md' | 'lg'
  readonly?: boolean
  onChange?: (rating: number) => void
  showValue?: boolean
  reviewCount?: number
  className?: string
}

export const Rating: React.FC<RatingProps> = ({
  value,
  max = 5,
  size = 'md',
  readonly = true,
  onChange,
  showValue = false,
  reviewCount,
  className,
}) => {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null)

  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  const effectiveRating = hoverRating !== null ? hoverRating : value

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }).map((_, index) => {
          const starNumber = index + 1
          const isFilled = effectiveRating >= starNumber
          const isHalf = !isFilled && effectiveRating >= starNumber - 0.5

          return (
            <button
              key={index}
              type="button"
              disabled={readonly}
              onClick={() => onChange && onChange(starNumber)}
              onMouseEnter={() => !readonly && setHoverRating(starNumber)}
              onMouseLeave={() => !readonly && setHoverRating(null)}
              className={cn(
                'relative p-0.5 transition-transform',
                !readonly && 'cursor-pointer hover:scale-110 focus:outline-none',
                readonly && 'cursor-default pointer-events-none'
              )}
              aria-label={`Rate ${starNumber} out of ${max}`}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  'transition-colors duration-150',
                  isFilled
                    ? 'fill-[#C9A84C] text-[#C9A84C]'
                    : isHalf
                    ? 'fill-[#C9A84C]/50 text-[#C9A84C]'
                    : 'fill-neutral-200 text-neutral-200'
                )}
              />
            </button>
          )
        })}
      </div>

      {showValue && (
        <span className="text-xs font-medium font-inter text-neutral-700 ml-1">
          {value.toFixed(1)}
        </span>
      )}

      {typeof reviewCount === 'number' && (
        <span className="text-xs text-neutral-400 font-inter">
          ({reviewCount})
        </span>
      )}
    </div>
  )
}

export default Rating
