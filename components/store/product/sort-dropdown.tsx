'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

export type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'popular'

interface SortDropdownProps {
  value: SortOption
  onChange: (value: SortOption) => void
  className?: string
}

const OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Newest Releases', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Most Coveted / Bestsellers', value: 'popular' },
]

export default function SortDropdown({ value, onChange, className = '' }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const activeOption = OPTIONS.find((o) => o.value === value) || OPTIONS[0]

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      <div className="flex items-center gap-2">
        <span className="text-xs text-neutral-400 font-inter tracking-wider uppercase hidden sm:inline">
          Sort by:
        </span>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center justify-between gap-2 border border-neutral-300 bg-white px-3.5 py-2 text-xs font-medium text-neutral-900 transition-colors hover:border-neutral-900 focus:outline-none min-w-[180px]"
        >
          <span className="truncate">{activeOption.label}</span>
          <ChevronDown
            className={`h-3.5 w-3.5 text-neutral-500 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-1 w-56 origin-top-right border border-neutral-200 bg-white shadow-xl focus:outline-none">
          <div className="py-1">
            {OPTIONS.map((option) => {
              const isSelected = option.value === value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value)
                    setIsOpen(false)
                  }}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-xs transition-colors ${
                    isSelected
                      ? 'bg-neutral-100 font-semibold text-neutral-950'
                      : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950'
                  }`}
                >
                  <span>{option.label}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-[#C9A84C]" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
