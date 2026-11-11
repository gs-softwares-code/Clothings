'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  SlidersHorizontal,
  X,
  LayoutGrid,
  Grid3X3,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  RotateCcw,
} from 'lucide-react'
import { Product, Category } from '@/types'
import ProductCard from './product-card'
import FilterSidebar, { FilterState } from './filter-sidebar'
import SortDropdown, { SortOption } from './sort-dropdown'

interface ProductListingClientProps {
  initialProducts: Product[]
  categories: Category[]
  initialSearchParams: {
    category?: string
    subcategory?: string
    search?: string
    sort?: string
    badge?: string
    minPrice?: string
    maxPrice?: string
    sizes?: string
    colors?: string
    page?: string
  }
}

const ITEMS_PER_PAGE = 12

export default function ProductListingClient({
  initialProducts,
  categories,
  initialSearchParams,
}: ProductListingClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Mobile drawer state
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

  // Layout grid column count (3 or 4 on desktop)
  const [gridCols, setGridCols] = useState<3 | 4>(4)

  // Filter state initialized from props / searchParams
  const [filters, setFilters] = useState<FilterState>({
    category: initialSearchParams.category || '',
    minPrice: initialSearchParams.minPrice ? parseFloat(initialSearchParams.minPrice) : undefined,
    maxPrice: initialSearchParams.maxPrice ? parseFloat(initialSearchParams.maxPrice) : undefined,
    sizes: initialSearchParams.sizes ? initialSearchParams.sizes.split(',').filter(Boolean) : [],
    colors: initialSearchParams.colors ? initialSearchParams.colors.split(',').filter(Boolean) : [],
    badge: initialSearchParams.badge || undefined,
  })

  const [sort, setSort] = useState<SortOption>(
    (initialSearchParams.sort as SortOption) || 'newest'
  )

  const [currentPage, setCurrentPage] = useState(
    initialSearchParams.page ? parseInt(initialSearchParams.page, 10) || 1 : 1
  )

  // Sync state to URL search params
  const updateUrlParams = (newFilters: FilterState, newSort: SortOption, newPage: number) => {
    const params = new URLSearchParams()
    if (newFilters.category) params.set('category', newFilters.category)
    if (newFilters.minPrice !== undefined) params.set('minPrice', newFilters.minPrice.toString())
    if (newFilters.maxPrice !== undefined) params.set('maxPrice', newFilters.maxPrice.toString())
    if (newFilters.sizes.length > 0) params.set('sizes', newFilters.sizes.join(','))
    if (newFilters.colors.length > 0) params.set('colors', newFilters.colors.join(','))
    if (newFilters.badge) params.set('badge', newFilters.badge)
    if (newSort !== 'newest') params.set('sort', newSort)
    if (newPage > 1) params.set('page', newPage.toString())

    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    setCurrentPage(1)
    updateUrlParams(newFilters, sort, 1)
  }

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort)
    updateUrlParams(filters, newSort, currentPage)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    updateUrlParams(filters, sort, newPage)
    window.scrollTo({ top: 180, behavior: 'smooth' })
  }

  const handleClearAll = () => {
    const emptyFilters: FilterState = {
      category: '',
      minPrice: undefined,
      maxPrice: undefined,
      sizes: [],
      colors: [],
      badge: undefined,
    }
    setFilters(emptyFilters)
    setCurrentPage(1)
    updateUrlParams(emptyFilters, sort, 1)
  }

  // Filter & Sort calculation
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      // Category filter
      if (filters.category) {
        const catSlug = product.category?.slug?.toLowerCase() || ''
        if (catSlug !== filters.category.toLowerCase()) return false
      }

      // Badge filter
      if (filters.badge) {
        if (!product.badge || product.badge.toUpperCase() !== filters.badge.toUpperCase()) {
          return false
        }
      }

      // Price filter
      if (filters.minPrice !== undefined && product.price < filters.minPrice) {
        return false
      }
      if (filters.maxPrice !== undefined && product.price > filters.maxPrice) {
        return false
      }

      // Size filter (matches any selected size in product variants)
      if (filters.sizes.length > 0) {
        const variantSizes = product.variants?.map((v) => v.size) || []
        const hasMatchingSize = filters.sizes.some((size) => variantSizes.includes(size))
        if (!hasMatchingSize) return false
      }

      // Color filter
      if (filters.colors.length > 0) {
        const variantColors = (product.variants?.map((v) => v.color.toLowerCase()) || [])
        const hasMatchingColor = filters.colors.some((color) =>
          variantColors.includes(color.toLowerCase())
        )
        if (!hasMatchingColor) return false
      }

      return true
    })
  }, [initialProducts, filters])

  // Sorting
  const sortedProducts = useMemo(() => {
    const items = [...filteredProducts]
    if (sort === 'price-asc') {
      items.sort((a, b) => a.price - b.price)
    } else if (sort === 'price-desc') {
      items.sort((a, b) => b.price - a.price)
    } else if (sort === 'popular') {
      items.sort((a, b) => (b.badge === 'BESTSELLER' ? 1 : 0) - (a.badge === 'BESTSELLER' ? 1 : 0))
    } else {
      // Newest default
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
    return items
  }, [filteredProducts, sort])

  // Pagination calculation
  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE) || 1
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return sortedProducts.slice(start, start + ITEMS_PER_PAGE)
  }, [sortedProducts, currentPage])

  // Active filter count and labels
  const activePills: { label: string; onRemove: () => void }[] = []
  if (filters.category) {
    activePills.push({
      label: `Dept: ${filters.category}`,
      onRemove: () => handleFilterChange({ ...filters, category: '' }),
    })
  }
  if (filters.badge) {
    activePills.push({
      label: `Collection: ${filters.badge}`,
      onRemove: () => handleFilterChange({ ...filters, badge: undefined }),
    })
  }
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const minText = filters.minPrice !== undefined ? `₹${filters.minPrice}` : '₹0'
    const maxText = filters.maxPrice !== undefined ? `₹${filters.maxPrice}` : 'Above'
    activePills.push({
      label: `${minText} - ${maxText}`,
      onRemove: () => handleFilterChange({ ...filters, minPrice: undefined, maxPrice: undefined }),
    })
  }
  filters.sizes.forEach((size) => {
    activePills.push({
      label: `Size: ${size}`,
      onRemove: () =>
        handleFilterChange({
          ...filters,
          sizes: filters.sizes.filter((s) => s !== size),
        }),
    })
  })
  filters.colors.forEach((color) => {
    activePills.push({
      label: `Color: ${color}`,
      onRemove: () =>
        handleFilterChange({
          ...filters,
          colors: filters.colors.filter((c) => c !== color),
        }),
    })
  })

  // Dynamic Category Title
  const activeCategoryObj = categories.find(
    (c) => c.slug.toLowerCase() === filters.category.toLowerCase()
  )
  const categoryTitle = activeCategoryObj
    ? `${activeCategoryObj.name}’s Collection`
    : filters.badge
    ? `${filters.badge} Drops`
    : 'All Collections'

  return (
    <div className="bg-[#FAF9F6] min-h-screen pb-24">
      {/* Editorial Header / Breadcrumb */}
      <div className="bg-white border-b border-neutral-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[11px] font-inter text-neutral-400 tracking-wider uppercase mb-3">
            <Link href="/" className="hover:text-neutral-900 transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-neutral-900 transition-colors">
              Collections
            </Link>
            {filters.category && (
              <>
                <span>/</span>
                <span className="text-neutral-900 font-medium">{filters.category}</span>
              </>
            )}
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-playfair text-3xl sm:text-4xl md:text-5xl text-neutral-900 font-normal tracking-tight">
                {categoryTitle}
              </h1>
              <p className="mt-2 font-inter text-xs sm:text-sm text-neutral-500 font-light max-w-2xl">
                Artisanal handwoven fabrics, architectural tailoring, and heirloom Indian drapes.
                Each piece crafted with mindful attention to longevity and silhouette.
              </p>
            </div>
            <div className="text-xs text-neutral-500 font-inter">
              Showing <span className="font-semibold text-neutral-900">{sortedProducts.length}</span>{' '}
              pieces
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        {/* Filter & Sort Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-neutral-200">
          {/* Mobile Filter Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(true)}
            className="flex items-center gap-2 lg:hidden border border-neutral-300 bg-white px-4 py-2 text-xs font-semibold tracking-wider uppercase text-neutral-900 hover:border-neutral-950 transition-colors"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filters {activePills.length > 0 && `(${activePills.length})`}</span>
          </button>

          {/* Desktop Filter Counter */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-neutral-600 font-medium">
            <SlidersHorizontal className="h-4 w-4 text-[#C9A84C]" />
            <span>Refine Catalog</span>
          </div>

          {/* Right Controls: Grid Switcher + Sort Dropdown */}
          <div className="flex items-center gap-4 ml-auto">
            {/* Grid density toggle (Desktop) */}
            <div className="hidden md:flex items-center gap-1 border border-neutral-300 bg-white p-1">
              <button
                type="button"
                onClick={() => setGridCols(3)}
                title="3 Columns"
                className={`p-1.5 transition-colors ${
                  gridCols === 3 ? 'bg-neutral-950 text-white' : 'text-neutral-500 hover:text-black'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setGridCols(4)}
                title="4 Columns"
                className={`p-1.5 transition-colors ${
                  gridCols === 4 ? 'bg-neutral-950 text-white' : 'text-neutral-500 hover:text-black'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
            </div>

            {/* Sort Dropdown */}
            <SortDropdown value={sort} onChange={handleSortChange} />
          </div>
        </div>

        {/* Active Filter Pills Bar */}
        {activePills.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 py-4 border-b border-neutral-200">
            <span className="text-xs text-neutral-400 font-inter uppercase tracking-wider">
              Filters:
            </span>
            {activePills.map((pill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 bg-white border border-neutral-300 px-3 py-1 text-xs text-neutral-800 font-medium shadow-2xs"
              >
                {pill.label}
                <button
                  type="button"
                  onClick={pill.onRemove}
                  className="text-neutral-400 hover:text-neutral-950"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs font-semibold text-[#C9A84C] hover:underline ml-2"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Layout: Desktop Sidebar + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8">
          {/* Desktop Left Sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-28 bg-white p-6 border border-neutral-200/80 shadow-2xs">
              <FilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearAll={handleClearAll}
                totalCount={sortedProducts.length}
              />
            </div>
          </aside>

          {/* Main Product Grid Area */}
          <main className="lg:col-span-9 flex flex-col">
            {paginatedProducts.length > 0 ? (
              <>
                <div
                  className={`grid gap-4 sm:gap-6 ${
                    gridCols === 3
                      ? 'grid-cols-2 md:grid-cols-3'
                      : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                  }`}
                >
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-16 pt-8 border-t border-neutral-200">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="flex h-10 w-10 items-center justify-center border border-neutral-300 bg-white text-neutral-700 hover:border-neutral-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    {[...Array(totalPages)].map((_, i) => {
                      const pageNum = i + 1
                      const isActive = pageNum === currentPage
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => handlePageChange(pageNum)}
                          className={`flex h-10 w-10 items-center justify-center text-xs font-semibold transition-colors ${
                            isActive
                              ? 'bg-neutral-950 text-white'
                              : 'border border-neutral-300 bg-white text-neutral-800 hover:border-neutral-900'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}

                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="flex h-10 w-10 items-center justify-center border border-neutral-300 bg-white text-neutral-700 hover:border-neutral-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white border border-neutral-200">
                <RotateCcw className="h-10 w-10 text-neutral-400 mb-4" />
                <h3 className="font-playfair text-2xl text-neutral-900 mb-2">
                  No Pieces Match Your Selection
                </h3>
                <p className="font-inter text-xs sm:text-sm text-neutral-500 max-w-md mb-6 font-light">
                  Try adjusting your price range, removing specific size or color filters, or explore
                  our full archive.
                </p>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="bg-neutral-950 text-white px-8 py-3 text-xs font-semibold tracking-widest uppercase hover:bg-[#C9A84C] transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Slide-Over Drawer */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileFiltersOpen(false)}
          />
          <div className="relative ml-auto h-full w-full max-w-xs sm:max-w-md bg-white p-6 shadow-2xl flex flex-col overflow-y-auto">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearAll={handleClearAll}
              totalCount={sortedProducts.length}
              isMobile
              onCloseMobile={() => setIsMobileFiltersOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
