'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingBag, Check } from 'lucide-react'
import { Product, ProductVariant } from '@/types'
import { formatPrice, calculateDiscount } from '@/lib/utils'
import { useCartStore } from '@/store/cart-store'
import { useWishlistStore } from '@/store/wishlist-store'
import toast from 'react-hot-toast'

interface ProductCardProps {
  product: Product
  priority?: boolean
  className?: string
}

export function parseProductImages(images: string | string[] | null | undefined): string[] {
  if (!images) {
    return ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80']
  }
  if (Array.isArray(images)) {
    return images.filter(Boolean)
  }
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter(Boolean)
      }
    } catch {
      // If it's a comma separated or single url
      if (images.includes(',')) {
        return images.split(',').map((s) => s.trim()).filter(Boolean)
      }
      return [images]
    }
  }
  return ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80']
}

export default function ProductCard({ product, priority = false, className = '' }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  const addItem = useCartStore((state) => state.addItem)
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist)
  const isInWishlist = useWishlistStore((state) => state.isInWishlist(product.id))

  const images = parseProductImages(product.images)
  const primaryImage = images[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80'
  const secondaryImage = images[1] || primaryImage

  const hasDiscount = product.comparePrice && product.comparePrice > product.price
  const discountPercent = hasDiscount
    ? calculateDiscount(product.comparePrice as number, product.price)
    : 0

  // Extract unique colors & sizes from variants
  const variants = product.variants || []
  const uniqueSizes = Array.from(new Set(variants.map((v) => v.size).filter(Boolean)))
  
  const uniqueColorsMap = new Map<string, string | undefined>()
  variants.forEach((v) => {
    if (v.color && !uniqueColorsMap.has(v.color)) {
      uniqueColorsMap.set(v.color, v.colorHex || undefined)
    }
  })
  const colorList = Array.from(uniqueColorsMap.entries())

  const handleQuickAdd = (e: React.MouseEvent, sizeToUse?: string) => {
    e.preventDefault()
    e.stopPropagation()

    setIsAdding(true)

    // Determine variant to add
    const size = sizeToUse || selectedSize || uniqueSizes[0] || 'Standard'
    const matchingVariant = variants.find((v) => v.size === size) || variants[0] || null

    addItem(product, matchingVariant, 1)
    toast.success(`Added "${product.name}" (${size}) to your bag`, {
      style: {
        background: '#1A1A1A',
        color: '#FFFFF0',
        border: '1px solid #C9A84C',
        fontSize: '13px',
        letterSpacing: '0.02em',
      },
      icon: '🛍️',
    })

    setTimeout(() => {
      setIsAdding(false)
    }, 600)
  }

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product)
    if (isInWishlist) {
      toast('Removed from Wishlist', {
        style: { background: '#1A1A1A', color: '#FFFFF0', fontSize: '13px' },
      })
    } else {
      toast('Saved to Wishlist', {
        icon: '🖤',
        style: { background: '#1A1A1A', color: '#FFFFF0', fontSize: '13px' },
      })
    }
  }

  // Prettify color dots
  const getColorHex = (colorName: string, hex?: string): string => {
    if (hex && hex.startsWith('#')) return hex
    const map: Record<string, string> = {
      black: '#1A1A1A',
      white: '#FAF9F6',
      ivory: '#FFFFF0',
      beige: '#F5F5DC',
      navy: '#000080',
      cream: '#FFFDD0',
      grey: '#808080',
      gray: '#808080',
      charcoal: '#36454F',
      gold: '#C9A84C',
      champagne: '#F7E7CE',
      brown: '#654321',
      olive: '#556B2F',
      burgundy: '#800020',
      maroon: '#800000',
      blue: '#2B4C7E',
      emerald: '#50C878',
      pink: '#FFC0CB',
      terracotta: '#E2725B',
    }
    return map[colorName.toLowerCase()] || '#9B8EA0'
  }

  return (
    <div
      className={`group relative flex flex-col bg-white transition-all duration-300 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Frame */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F5F4F0]">
        <Link href={`/products/${product.slug}`} className="block h-full w-full">
          {/* Primary Image */}
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            priority={priority}
            className={`object-cover object-top transition-all duration-700 ease-out ${
              images.length > 1
                ? isHovered
                  ? 'opacity-0 scale-105'
                  : 'opacity-100 scale-100'
                : isHovered
                ? 'scale-105'
                : 'scale-100'
            }`}
          />

          {/* Secondary Hover Image (if exists) */}
          {images.length > 1 && (
            <Image
              src={secondaryImage}
              alt={`${product.name} - alternate view`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className={`object-cover object-top transition-all duration-700 ease-out ${
                isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
              }`}
            />
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.badge && (
            <span
              className={`px-2.5 py-1 text-[10px] font-semibold tracking-widest uppercase shadow-sm ${
                product.badge.toUpperCase() === 'SALE'
                  ? 'bg-rose-900 text-rose-50'
                  : product.badge.toUpperCase() === 'BESTSELLER'
                  ? 'bg-[#C9A84C] text-black font-bold'
                  : 'bg-neutral-900 text-white'
              }`}
            >
              {product.badge}
            </span>
          )}
          {hasDiscount && !product.badge && (
            <span className="bg-rose-900 text-rose-50 px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase shadow-sm">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-transform duration-200 hover:scale-110 active:scale-95 text-neutral-800"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isInWishlist
                ? 'fill-rose-600 text-rose-600'
                : 'text-neutral-700 hover:text-neutral-950'
            }`}
          />
        </button>

        {/* Quick Add Overlay on Hover */}
        <div
          className={`absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 pt-8 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          {uniqueSizes.length > 0 ? (
            <div className="flex flex-col gap-2">
              <div className="text-[10px] font-medium tracking-widest uppercase text-white/90 text-center">
                Quick Add Size
              </div>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {uniqueSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={(e) => handleQuickAdd(e, size)}
                    className="h-7 min-w-7 px-2 text-[11px] font-medium border border-white/60 bg-white/20 text-white backdrop-blur-sm hover:bg-white hover:text-black hover:border-white transition-all duration-150 active:scale-95"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => handleQuickAdd(e)}
              disabled={isAdding}
              className="flex w-full items-center justify-center gap-2 bg-white text-black py-2.5 text-xs font-medium tracking-wider uppercase transition-colors hover:bg-champagne active:scale-[0.99]"
            >
              {isAdding ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Added
                </>
              ) : (
                <>
                  <ShoppingBag className="h-3.5 w-3.5" />
                  Quick Add
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Product Details */}
      <div className="flex flex-col p-3.5 pb-2 text-left">
        {/* Category & Color Swatches Row */}
        <div className="flex items-center justify-between text-[11px] text-warm-gray mb-1">
          <span className="tracking-widest uppercase font-medium">
            {product.category?.name || 'Exclusive'}
          </span>

          {/* Color Dots */}
          {colorList.length > 0 && (
            <div className="flex items-center gap-1">
              {colorList.slice(0, 4).map(([colorName, hex]) => (
                <span
                  key={colorName}
                  title={colorName}
                  style={{ backgroundColor: getColorHex(colorName, hex) }}
                  className="h-2.5 w-2.5 rounded-full border border-neutral-300 shadow-2xs"
                />
              ))}
              {colorList.length > 4 && (
                <span className="text-[10px] text-neutral-400">
                  +{colorList.length - 4}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Title */}
        <Link
          href={`/products/${product.slug}`}
          className="group/title font-playfair text-[15px] font-normal leading-snug text-neutral-900 hover:text-[#C9A84C] transition-colors line-clamp-1 mb-1.5"
        >
          {product.name}
        </Link>

        {/* Price & Discount */}
        <div className="flex items-baseline gap-2">
          <span className="font-inter text-sm font-semibold tracking-tight text-neutral-900">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-neutral-400 line-through">
              {formatPrice(product.comparePrice as number)}
            </span>
          )}
          {hasDiscount && (
            <span className="text-[11px] font-semibold text-rose-700">
              Save {discountPercent}%
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
