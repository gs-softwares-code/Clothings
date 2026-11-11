'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, ArrowRight, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

const TRENDING_SEARCHES = [
  'Raw Silk Saree',
  'Linen Mandarin Shirt',
  'Cashmere Overcoat',
  'Handblock Chanderi Kurta',
  'Pleated Wide Trousers',
  'Bespoke Nehru Jacket',
  'Embroidered Co-ord Set',
  'Full Grain Leather Bag',
]

const QUICK_CATEGORIES = [
  { name: 'Men', href: '/products?category=men' },
  { name: 'Women', href: '/products?category=women' },
  { name: 'Kids', href: '/products?category=kids' },
  { name: 'Accessories', href: '/products?category=accessories' },
  { name: 'New Arrivals', href: '/products?sort=newest' },
  { name: 'Best Sellers', href: '/products?badge=bestseller' },
]

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter()
  const [query, setQuery] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Focus input when opened
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    } else {
      setQuery('')
    }
  }, [isOpen])

  // ESC key listener
  React.useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Lock body scroll
  React.useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = original
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSearch = (searchTerm: string) => {
    const trimmed = searchTerm.trim()
    if (!trimmed) return
    onClose()
    router.push(`/products?search=${encodeURIComponent(trimmed)}`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(query)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col justify-start items-center"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Search Header Panel */}
      <div className="relative w-full bg-white border-b border-neutral-200 shadow-2xl z-10 animate-slide-up">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10">
          {/* Top Bar with Close */}
          <div className="flex items-center justify-between pb-4">
            <span className="text-[11px] font-inter uppercase tracking-[0.2em] text-neutral-400 font-semibold">
              Curated Catalog Search
            </span>
            <button
              onClick={onClose}
              type="button"
              className="p-2 -mr-2 text-neutral-400 hover:text-neutral-900 transition-colors rounded-full hover:bg-neutral-100"
              aria-label="Close search"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>

          {/* Search Input Form */}
          <form onSubmit={handleSubmit} className="relative mt-2">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 text-neutral-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by silhouette, fabric, collection, or keyword..."
              className="w-full bg-transparent pl-10 pr-12 py-3 text-lg sm:text-2xl font-playfair font-normal text-neutral-900 placeholder:text-neutral-300 placeholder:font-inter placeholder:text-base border-b-2 border-neutral-200 focus:border-neutral-900 focus:outline-none transition-colors"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}
          </form>

          {/* Trending Searches */}
          <div className="mt-8">
            <div className="flex items-center gap-2 text-xs font-inter uppercase tracking-widest text-neutral-500 font-medium mb-3">
              <TrendingUp className="w-3.5 h-3.5 text-[#C9A84C]" />
              <span>Trending Now</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {TRENDING_SEARCHES.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => handleSearch(term)}
                  className="px-3.5 py-1.5 text-xs font-inter text-neutral-700 bg-neutral-100 hover:bg-neutral-900 hover:text-white transition-all duration-200 border border-neutral-200/60"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Categories */}
          <div className="mt-8 pt-6 border-t border-neutral-100">
            <div className="text-xs font-inter uppercase tracking-widest text-neutral-400 font-medium mb-3">
              Explore Collections
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {QUICK_CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => {
                    onClose()
                    router.push(cat.href)
                  }}
                  className="flex items-center justify-between px-3 py-2 text-xs font-inter font-medium text-neutral-800 bg-neutral-50 hover:bg-[#F7E7CE]/40 transition-colors text-left"
                >
                  <span>{cat.name}</span>
                  <ArrowRight className="w-3 h-3 text-neutral-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchModal
