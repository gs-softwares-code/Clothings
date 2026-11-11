'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  side?: 'left' | 'right' | 'bottom'
  size?: 'sm' | 'md' | 'lg' | 'full'
  title?: React.ReactNode
  description?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  showCloseButton?: boolean
  className?: string
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  side = 'right',
  size = 'md',
  title,
  description,
  children,
  footer,
  showCloseButton = true,
  className,
}) => {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // ESC key handler
  React.useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Body scroll lock
  React.useEffect(() => {
    if (isOpen) {
      const originalStyle = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalStyle
      }
    }
  }, [isOpen])

  if (!mounted) return null

  const sizeClasses = {
    left: {
      sm: 'max-w-xs',
      md: 'max-w-md',
      lg: 'max-w-lg',
      full: 'max-w-full',
    },
    right: {
      sm: 'max-w-xs',
      md: 'max-w-md',
      lg: 'max-w-lg',
      full: 'max-w-full',
    },
    bottom: {
      sm: 'max-h-[40vh]',
      md: 'max-h-[60vh]',
      lg: 'max-h-[85vh]',
      full: 'max-h-screen',
    },
  }

  const drawerContent = (
    <div
      role="dialog"
      aria-modal="true"
      className={cn(
        'fixed inset-0 z-50 transition-all duration-300',
        isOpen ? 'pointer-events-auto visible' : 'pointer-events-none invisible'
      )}
    >
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-out',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        className={cn(
          'fixed bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out z-10',
          side === 'right' && 'inset-y-0 right-0 w-full',
          side === 'left' && 'inset-y-0 left-0 w-full',
          side === 'bottom' && 'inset-x-0 bottom-0 w-full rounded-t-2xl',
          side !== 'bottom' && sizeClasses[side][size],
          side === 'bottom' && sizeClasses.bottom[size],
          side === 'right' && (isOpen ? 'translate-x-0' : 'translate-x-full'),
          side === 'left' && (isOpen ? 'translate-x-0' : '-translate-x-full'),
          side === 'bottom' && (isOpen ? 'translate-y-0' : 'translate-y-full'),
          className
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 shrink-0">
            <div>
              {title && (
                <h3 className="text-lg font-playfair font-normal tracking-wide text-neutral-900">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-neutral-500 font-inter mt-0.5">
                  {description}
                </p>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close drawer"
                className="p-2 -mr-2 text-neutral-400 hover:text-neutral-900 transition-colors rounded-full hover:bg-neutral-50"
              >
                <X className="w-5 h-5 stroke-[1.5]" />
              </button>
            )}
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-neutral-100 px-6 py-4 bg-neutral-50/50 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  )

  return createPortal(drawerContent, document.body)
}

export default Drawer
