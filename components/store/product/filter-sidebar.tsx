'use client'

import { X, Check } from 'lucide-react'

export interface FilterState {
  category: string
  minPrice?: number
  maxPrice?: number
  sizes: string[]
  colors: string[]
  badge?: string
}

interface FilterSidebarProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  onClearAll: () => void
  totalCount?: number
  className?: string
  isMobile?: boolean
  onCloseMobile?: () => void
}

const CATEGORIES = [
  { name: 'All Categories', slug: '' },
  { name: 'Women', slug: 'women' },
  { name: 'Men', slug: 'men' },
  { name: 'Kids', slug: 'kids' },
  { name: 'Accessories', slug: 'accessories' },
]

const PRICE_RANGES = [
  { label: 'All Prices', min: undefined, max: undefined },
  { label: 'Under ₹2,000', min: 0, max: 2000 },
  { label: '₹2,000 – ₹5,000', min: 2000, max: 5000 },
  { label: '₹5,000 – ₹10,000', min: 5000, max: 10000 },
  { label: '₹10,000 – ₹20,000', min: 10000, max: 20000 },
  { label: 'Above ₹20,000', min: 20000, max: 999999 },
]

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '38', '40', '42', 'Free Size']

const COLORS = [
  { name: 'Black', hex: '#1A1A1A' },
  { name: 'White', hex: '#FAF9F6' },
  { name: 'Ivory', hex: '#FFFFF0' },
  { name: 'Beige', hex: '#F5F5DC' },
  { name: 'Navy', hex: '#000080' },
  { name: 'Gold', hex: '#C9A84C' },
  { name: 'Charcoal', hex: '#36454F' },
  { name: 'Ecru', hex: '#C2B280' },
  { name: 'Rose', hex: '#E0A899' },
  { name: 'Brown', hex: '#654321' },
]

const BADGES = [
  { label: 'All Collections', value: '' },
  { label: 'New Arrivals', value: 'NEW' },
  { label: 'Bestsellers', value: 'BESTSELLER' },
  { label: 'Sale & Offers', value: 'SALE' },
]

export default function FilterSidebar({
  filters,
  onFilterChange,
  onClearAll,
  totalCount,
  className = '',
  isMobile = false,
  onCloseMobile,
}: FilterSidebarProps) {
  const toggleSize = (size: string) => {
    const exists = filters.sizes.includes(size)
    const newSizes = exists
      ? filters.sizes.filter((s) => s !== size)
      : [...filters.sizes, size]
    onFilterChange({ ...filters, sizes: newSizes })
  }

  const toggleColor = (color: string) => {
    const exists = filters.colors.includes(color)
    const newColors = exists
      ? filters.colors.filter((c) => c !== color)
      : [...filters.colors, color]
    onFilterChange({ ...filters, colors: newColors })
  }

  const setCategory = (catSlug: string) => {
    onFilterChange({ ...filters, category: catSlug })
  }

  const setPriceRange = (min?: number, max?: number) => {
    onFilterChange({ ...filters, minPrice: min, maxPrice: max })
  }

  const setBadge = (badgeVal: string) => {
    onFilterChange({ ...filters, badge: badgeVal || undefined })
  }

  const hasActiveFilters =
    Boolean(filters.category) ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.sizes.length > 0 ||
    filters.colors.length > 0 ||
    Boolean(filters.badge)

  return (
    <div className={`flex flex-col gap-8 text-neutral-900 ${className}`}>
      {/* Mobile Header */}
      {isMobile && (
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
          <div>
            <h3 className="font-playfair text-xl font-medium">Refine Catalog</h3>
            {totalCount !== undefined && (
              <span className="text-xs text-neutral-500 font-inter">
                {totalCount} pieces found
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-2 text-neutral-600 hover:text-neutral-950"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Clear All Button if active */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
          <span className="text-xs font-semibold tracking-wider uppercase text-neutral-500">
            Active Filters
          </span>
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs text-[#C9A84C] font-semibold hover:underline"
          >
            Reset All
          </button>
        </div>
      )}

      {/* 1. Category */}
      <div className="flex flex-col gap-3">
        <h4 className="font-playfair text-base font-medium tracking-tight text-neutral-900">
          Department
        </h4>
        <div className="flex flex-col gap-1.5">
          {CATEGORIES.map((cat) => {
            const isSelected = filters.category === cat.slug
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setCategory(cat.slug)}
                className={`flex items-center justify-between py-1 text-xs tracking-wide text-left transition-colors ${
                  isSelected
                    ? 'font-semibold text-neutral-950 underline decoration-[#C9A84C] underline-offset-4'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                <span>{cat.name}</span>
                {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-[#C9A84C]" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. Collection Badge */}
      <div className="flex flex-col gap-3 pt-6 border-t border-neutral-200/80">
        <h4 className="font-playfair text-base font-medium tracking-tight text-neutral-900">
          Collection
        </h4>
        <div className="flex flex-col gap-1.5">
          {BADGES.map((b) => {
            const isSelected = (filters.badge || '') === b.value
            return (
              <button
                key={b.value}
                type="button"
                onClick={() => setBadge(b.value)}
                className={`flex items-center justify-between py-1 text-xs tracking-wide text-left transition-colors ${
                  isSelected
                    ? 'font-semibold text-neutral-950 underline decoration-[#C9A84C] underline-offset-4'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                <span>{b.label}</span>
                {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-[#C9A84C]" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. Price Range */}
      <div className="flex flex-col gap-3 pt-6 border-t border-neutral-200/80">
        <h4 className="font-playfair text-base font-medium tracking-tight text-neutral-900">
          Price Range
        </h4>
        <div className="flex flex-col gap-1.5">
          {PRICE_RANGES.map((pr) => {
            const isSelected =
              filters.minPrice === pr.min && filters.maxPrice === pr.max
            return (
              <button
                key={pr.label}
                type="button"
                onClick={() => setPriceRange(pr.min, pr.max)}
                className={`flex items-center justify-between py-1 text-xs tracking-wide text-left transition-colors ${
                  isSelected
                    ? 'font-semibold text-neutral-950 underline decoration-[#C9A84C] underline-offset-4'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                <span>{pr.label}</span>
                {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-[#C9A84C]" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* 4. Sizes */}
      <div className="flex flex-col gap-3 pt-6 border-t border-neutral-200/80">
        <h4 className="font-playfair text-base font-medium tracking-tight text-neutral-900">
          Size
        </h4>
        <div className="grid grid-cols-4 gap-2">
          {SIZES.map((size) => {
            const isSelected = filters.sizes.includes(size)
            return (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`h-8 text-xs font-medium border transition-all duration-150 flex items-center justify-center ${
                  isSelected
                    ? 'border-neutral-950 bg-neutral-950 text-white font-semibold'
                    : 'border-neutral-300 bg-white text-neutral-700 hover:border-neutral-950'
                }`}
              >
                {size}
              </button>
            )
          })}
        </div>
      </div>

      {/* 5. Colors */}
      <div className="flex flex-col gap-3 pt-6 border-t border-neutral-200/80">
        <h4 className="font-playfair text-base font-medium tracking-tight text-neutral-900">
          Colour Palette
        </h4>
        <div className="flex flex-wrap gap-2.5">
          {COLORS.map((col) => {
            const isSelected = filters.colors.includes(col.name)
            return (
              <button
                key={col.name}
                type="button"
                title={col.name}
                onClick={() => toggleColor(col.name)}
                className={`relative flex items-center gap-1.5 px-2.5 py-1 text-xs border transition-all ${
                  isSelected
                    ? 'border-neutral-950 bg-neutral-100 font-medium'
                    : 'border-neutral-200 bg-white hover:border-neutral-400'
                }`}
              >
                <span
                  style={{ backgroundColor: col.hex }}
                  className="h-3 w-3 rounded-full border border-neutral-300 inline-block"
                />
                <span className="text-[11px] text-neutral-700">{col.name}</span>
                {isSelected && <Check className="h-3 w-3 text-neutral-950" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Mobile Apply Button */}
      {isMobile && (
        <div className="pt-6 border-t border-neutral-200 mt-auto">
          <button
            type="button"
            onClick={onCloseMobile}
            className="w-full bg-neutral-950 text-white py-3.5 text-xs font-semibold tracking-widest uppercase hover:bg-[#C9A84C] transition-colors"
          >
            Apply Filters
          </button>
        </div>
      )}
    </div>
  )
}
