'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Heart,
  ShoppingBag,
  Zap,
  Truck,
  RotateCcw,
  ShieldCheck,
  CreditCard,
  ChevronDown,
  Star,
  Ruler,
  Check,
  CheckCircle,
  AlertCircle,
  Share2,
} from 'lucide-react'
import { Product, ProductVariant, Review } from '@/types'
import { formatPrice, calculateDiscount } from '@/lib/utils'
import { useCartStore } from '@/store/cart-store'
import { useWishlistStore } from '@/store/wishlist-store'
import { Modal } from '@/components/ui/modal'
import ProductCard, { parseProductImages } from './product-card'
import toast from 'react-hot-toast'

interface ProductDetailViewProps {
  product: Product
  relatedProducts: Product[]
}

export default function ProductDetailView({ product, relatedProducts }: ProductDetailViewProps) {
  const router = useRouter()
  const images = parseProductImages(product.images)
  
  // Gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 })

  // Variant selections
  const variants = product.variants || []
  
  // Extract unique colors
  const colorMap = new Map<string, { name: string; hex?: string }>()
  variants.forEach((v) => {
    if (v.color && !colorMap.has(v.color)) {
      colorMap.set(v.color, { name: v.color, hex: v.colorHex || undefined })
    }
  })
  const availableColors = Array.from(colorMap.values())

  // Extract unique sizes
  const availableSizes = Array.from(new Set(variants.map((v) => v.size).filter(Boolean)))

  const [selectedColor, setSelectedColor] = useState<string>(
    availableColors[0]?.name || variants[0]?.color || 'Default'
  )
  const [selectedSize, setSelectedSize] = useState<string>(
    availableSizes[0] || variants[0]?.size || 'Standard'
  )
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [isBuyingNow, setIsBuyingNow] = useState(false)

  // Size guide modal state
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false)
  const [sizeGuideUnit, setSizeGuideUnit] = useState<'in' | 'cm'>('in')

  // Review Form state
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewTitle, setReviewTitle] = useState('')
  const [reviewBody, setReviewBody] = useState('')
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [localReviews, setLocalReviews] = useState<Review[]>(product.reviews || [])

  // Open accordions
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    fabric: true,
    fit: false,
    shipping: false,
    care: false,
  })

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  // Current matching variant
  const currentVariant: ProductVariant | undefined = variants.find(
    (v) =>
      (!selectedColor || v.color.toLowerCase() === selectedColor.toLowerCase()) &&
      (!selectedSize || v.size === selectedSize)
  ) || variants[0]

  const currentPrice = currentVariant?.price ?? product.price
  const hasDiscount = product.comparePrice && product.comparePrice > currentPrice
  const discountPercent = hasDiscount
    ? calculateDiscount(product.comparePrice as number, currentPrice)
    : 0

  // Cart & Wishlist hooks
  const addItem = useCartStore((state) => state.addItem)
  const openCart = useCartStore((state) => state.openCart)
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist)
  const isInWishlist = useWishlistStore((state) => state.isInWishlist(product.id))

  // Handle Zoom
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100
    setZoomPosition({ x, y })
  }

  // Handle Add to Bag
  const handleAddToCart = () => {
    setIsAdding(true)
    addItem(product, currentVariant || null, quantity)
    
    toast.success(`Added ${quantity} × ${product.name} (${selectedSize}) to bag`, {
      style: {
        background: '#1A1A1A',
        color: '#FFFFF0',
        border: '1px solid #C9A84C',
        fontSize: '13px',
      },
      icon: '🛍️',
    })

    setTimeout(() => {
      setIsAdding(false)
      openCart()
    }, 400)
  }

  // Handle Buy Now
  const handleBuyNow = () => {
    setIsBuyingNow(true)
    addItem(product, currentVariant || null, quantity)
    router.push('/checkout')
  }

  // Handle Share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard')
    }
  }

  // Handle Submit Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewBody.trim()) {
      toast.error('Please write a review.')
      return
    }

    setIsSubmittingReview(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          rating: reviewRating,
          title: reviewTitle,
          body: reviewBody,
        }),
      })

      const newRev: Review = {
        id: `rev-${Date.now()}`,
        userId: 'guest',
        user: { id: 'guest', name: 'You (Verified Buyer)', email: '', role: 'CUSTOMER', createdAt: new Date(), updatedAt: new Date() },
        productId: product.id,
        rating: reviewRating,
        title: reviewTitle,
        body: reviewBody,
        isApproved: true,
        createdAt: new Date(),
      }

      setLocalReviews([newRev, ...localReviews])
      toast.success('Thank you! Your review has been recorded.')
      setReviewTitle('')
      setReviewBody('')
      setIsReviewFormOpen(false)
    } catch {
      toast.error('Unable to post review at this time.')
    } finally {
      setIsSubmittingReview(false)
    }
  }

  // Stock check
  const stockRemaining = currentVariant?.stock ?? 10
  const isOutOfStock = stockRemaining <= 0

  return (
    <div className="bg-[#FAF9F6] pb-24">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-neutral-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-[11px] font-inter text-neutral-400 tracking-wider uppercase">
            <Link href="/" className="hover:text-neutral-900 transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-neutral-900 transition-colors">
              Shop
            </Link>
            {product.category && (
              <>
                <span>/</span>
                <Link
                  href={`/products?category=${product.category.slug}`}
                  className="hover:text-neutral-900 transition-colors"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-neutral-900 font-medium truncate max-w-[200px] sm:max-w-xs">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          
          {/* ============================================================ */}
          {/* LEFT: Multi-image Gallery */}
          {/* ============================================================ */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            
            {/* Thumbnails Column (Desktop Vertical, Mobile Horizontal) */}
            {images.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar md:w-20 shrink-0">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative aspect-[3/4] w-16 md:w-full overflow-hidden border-2 transition-all ${
                      idx === activeImageIndex
                        ? 'border-neutral-950 opacity-100 shadow-xs'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} thumb ${idx + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover object-top"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Primary Main Image Frame with Zoom */}
            <div className="relative flex-1 aspect-[3/4] overflow-hidden bg-white border border-neutral-200/80">
              <div
                className="relative h-full w-full cursor-crosshair"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
              >
                <Image
                  src={images[activeImageIndex] || images[0]}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  style={{
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  }}
                  className={`object-cover object-top transition-transform duration-200 ${
                    isZoomed ? 'scale-150' : 'scale-100'
                  }`}
                />
              </div>

              {/* Floating Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
                {product.badge && (
                  <span
                    className={`px-3 py-1 text-[11px] font-semibold tracking-widest uppercase shadow-sm ${
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
                {hasDiscount && (
                  <span className="bg-rose-900 text-rose-50 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase shadow-sm">
                    -{discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Top-Right Action Buttons: Wishlist & Share */}
              <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                <button
                  type="button"
                  onClick={handleShare}
                  aria-label="Share product"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-neutral-700 shadow-sm transition-transform hover:scale-110 active:scale-95"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleWishlist(product)}
                  aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-transform hover:scale-110 active:scale-95 text-neutral-800"
                >
                  <Heart
                    className={`h-4 w-4 transition-colors ${
                      isInWishlist ? 'fill-rose-600 text-rose-600' : 'text-neutral-700'
                    }`}
                  />
                </button>
              </div>

              {/* Bottom Image Counter */}
              <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-xs text-white text-[11px] font-inter px-2.5 py-1 z-10 pointer-events-none">
                {activeImageIndex + 1} / {images.length}
              </div>
            </div>

          </div>

          {/* ============================================================ */}
          {/* RIGHT: Product Details & Purchase Form */}
          {/* ============================================================ */}
          <div className="lg:col-span-5 flex flex-col text-left">
            
            {/* Category / Collection Tag */}
            <span className="font-inter text-xs font-semibold tracking-[0.2em] text-[#C9A84C] uppercase mb-2">
              {product.category?.name || 'Exclusive Edit'}
            </span>

            {/* Product Title */}
            <h1 className="font-playfair text-2xl sm:text-3xl md:text-4xl text-neutral-900 font-normal leading-snug mb-3">
              {product.name}
            </h1>

            {/* Rating Stars & Count */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-[#C9A84C] text-[#C9A84C]" />
                ))}
              </div>
              <span className="text-xs text-neutral-500 font-inter">
                4.9 ({localReviews.length || 18} Verified Patron Reviews)
              </span>
            </div>

            {/* Price Row */}
            <div className="flex items-baseline gap-3 pb-6 border-b border-neutral-200">
              <span className="font-inter text-2xl sm:text-3xl font-semibold text-neutral-950">
                {formatPrice(currentPrice)}
              </span>
              {hasDiscount && (
                <span className="text-base text-neutral-400 line-through">
                  {formatPrice(product.comparePrice as number)}
                </span>
              )}
              {hasDiscount && (
                <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 border border-rose-200 uppercase tracking-wide">
                  Save {discountPercent}%
                </span>
              )}
              <span className="text-[11px] text-neutral-500 font-inter ml-auto hidden sm:inline">
                Inclusive of all taxes
              </span>
            </div>

            {/* Short Description */}
            <p className="mt-6 font-inter text-sm text-neutral-600 font-light leading-relaxed">
              {product.description}
            </p>

            {/* Color Selector */}
            {availableColors.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold tracking-wider uppercase text-neutral-800">
                    Colour: <span className="font-normal text-neutral-500">{selectedColor}</span>
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {availableColors.map((col) => {
                    const isSelected = selectedColor.toLowerCase() === col.name.toLowerCase()
                    return (
                      <button
                        key={col.name}
                        type="button"
                        onClick={() => setSelectedColor(col.name)}
                        className={`group relative flex items-center gap-2 border px-3 py-1.5 transition-all ${
                          isSelected
                            ? 'border-neutral-950 bg-neutral-100 font-medium'
                            : 'border-neutral-200 bg-white hover:border-neutral-400'
                        }`}
                      >
                        <span
                          style={{ backgroundColor: col.hex || '#9B8EA0' }}
                          className="h-3 w-3 rounded-full border border-neutral-300"
                        />
                        <span className="text-xs text-neutral-800">{col.name}</span>
                        {isSelected && <Check className="h-3 w-3 text-neutral-950" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {availableSizes.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold tracking-wider uppercase text-neutral-800">
                    Select Size: <span className="font-normal text-neutral-500">{selectedSize}</span>
                  </span>

                  {/* Size Guide Modal Trigger */}
                  <button
                    type="button"
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs text-[#C9A84C] font-semibold hover:underline"
                  >
                    <Ruler className="h-3.5 w-3.5" />
                    <span>Size Guide</span>
                  </button>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {availableSizes.map((size) => {
                    const isSelected = selectedSize === size
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`h-11 text-xs font-medium border transition-all flex items-center justify-center ${
                          isSelected
                            ? 'border-neutral-950 bg-neutral-950 text-white font-semibold'
                            : 'border-neutral-300 bg-white text-neutral-800 hover:border-neutral-950'
                        }`}
                      >
                        {size}
                      </button>
                    )
                  })}
                </div>

                {/* Low Stock Warning */}
                {stockRemaining > 0 && stockRemaining <= 4 && (
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-700 mt-2 font-medium">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Only {stockRemaining} items remaining in this size</span>
                  </div>
                )}
              </div>
            )}

            {/* Quantity and Actions */}
            <div className="mt-8 flex flex-col gap-3 pt-6 border-t border-neutral-200">
              <div className="flex items-center gap-3">
                {/* Quantity Stepper */}
                <div className="flex items-center border border-neutral-300 bg-white h-12 px-2">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="h-8 w-8 flex items-center justify-center text-neutral-600 hover:text-neutral-950 disabled:opacity-30"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-semibold font-inter">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    disabled={quantity >= stockRemaining}
                    className="h-8 w-8 flex items-center justify-center text-neutral-600 hover:text-neutral-950 disabled:opacity-30"
                  >
                    +
                  </button>
                </div>

                {/* Add to Bag Button */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || isAdding}
                  className="flex-1 flex items-center justify-center gap-2 bg-neutral-950 text-white h-12 text-xs font-semibold tracking-widest uppercase transition-all duration-200 hover:bg-[#C9A84C] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>{isAdding ? 'Adding to Bag...' : isOutOfStock ? 'Sold Out' : 'Add to Bag'}</span>
                </button>
              </div>

              {/* Buy Now Button */}
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={isOutOfStock || isBuyingNow}
                className="w-full flex items-center justify-center gap-2 border border-neutral-950 bg-white text-neutral-950 h-12 text-xs font-semibold tracking-widest uppercase transition-colors hover:bg-neutral-950 hover:text-white"
              >
                <Zap className="h-4 w-4" />
                <span>Buy Now with Express Checkout</span>
              </button>
            </div>

            {/* Value Guarantees / Perks */}
            <div className="mt-8 grid grid-cols-2 gap-3 p-4 bg-white border border-neutral-200/80 text-xs font-inter text-neutral-700">
              <div className="flex items-center gap-2.5">
                <Truck className="h-4 w-4 text-[#C9A84C] shrink-0" />
                <span>Free Express Shipping over ₹999</span>
              </div>
              <div className="flex items-center gap-2.5">
                <RotateCcw className="h-4 w-4 text-[#C9A84C] shrink-0" />
                <span>7-Day Hassle-Free Returns</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-[#C9A84C] shrink-0" />
                <span>100% Certified Handwoven Craft</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CreditCard className="h-4 w-4 text-[#C9A84C] shrink-0" />
                <span>COD & Razorpay Secure Pay</span>
              </div>
            </div>

            {/* Accordion Details */}
            <div className="mt-8 border-t border-neutral-200 divide-y divide-neutral-200">
              
              {/* Accordion 1: Fabric & Craftsmanship */}
              <div className="py-4">
                <button
                  type="button"
                  onClick={() => toggleSection('fabric')}
                  className="flex w-full items-center justify-between text-left font-playfair text-base font-medium text-neutral-900"
                >
                  <span>Fabric & Craftsmanship Details</span>
                  <ChevronDown
                    className={`h-4 w-4 text-neutral-500 transition-transform ${
                      openSections.fabric ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openSections.fabric && (
                  <div className="mt-3 text-xs text-neutral-600 font-inter leading-relaxed space-y-2">
                    <p>
                      <strong>Material:</strong> {product.fabric || '100% Pure Mulberry Handloom Silk'}
                    </p>
                    <p>
                      <strong>Provenance:</strong> Hand-spun by generational artisan weavers using
                      traditional shuttle pit-looms. Dyed with natural mineral and vegetable dyes.
                    </p>
                    <p>
                      <strong>Finish:</strong> Hand-finished seams with Mother-of-Pearl or hand-cast brass buttons.
                    </p>
                  </div>
                )}
              </div>

              {/* Accordion 2: Size & Fit */}
              <div className="py-4">
                <button
                  type="button"
                  onClick={() => toggleSection('fit')}
                  className="flex w-full items-center justify-between text-left font-playfair text-base font-medium text-neutral-900"
                >
                  <span>Size & Fit Advisory</span>
                  <ChevronDown
                    className={`h-4 w-4 text-neutral-500 transition-transform ${
                      openSections.fit ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openSections.fit && (
                  <div className="mt-3 text-xs text-neutral-600 font-inter leading-relaxed space-y-2">
                    <p>• Tailored relaxed silhouette with structured shoulders.</p>
                    <p>• Model is 5’10” (178 cm) wearing size Small / 38.</p>
                    <p>• Designed to drape effortlessly without pulling at the seams.</p>
                  </div>
                )}
              </div>

              {/* Accordion 3: Shipping & Returns */}
              <div className="py-4">
                <button
                  type="button"
                  onClick={() => toggleSection('shipping')}
                  className="flex w-full items-center justify-between text-left font-playfair text-base font-medium text-neutral-900"
                >
                  <span>Shipping & Returns</span>
                  <ChevronDown
                    className={`h-4 w-4 text-neutral-500 transition-transform ${
                      openSections.shipping ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openSections.shipping && (
                  <div className="mt-3 text-xs text-neutral-600 font-inter leading-relaxed space-y-2">
                    <p>• Dispatched within 24–48 hours in signature zero-plastic linen garment bags.</p>
                    <p>• Domestic deliveries within 3–5 business days via BlueDart Air.</p>
                    <p>• Complimentary 7-day pickup for returns or size exchanges.</p>
                  </div>
                )}
              </div>

              {/* Accordion 4: Garment Care */}
              <div className="py-4">
                <button
                  type="button"
                  onClick={() => toggleSection('care')}
                  className="flex w-full items-center justify-between text-left font-playfair text-base font-medium text-neutral-900"
                >
                  <span>Care Instructions</span>
                  <ChevronDown
                    className={`h-4 w-4 text-neutral-500 transition-transform ${
                      openSections.care ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openSections.care && (
                  <div className="mt-3 text-xs text-neutral-600 font-inter leading-relaxed space-y-2">
                    <p>• {product.care || 'Dry clean only by specialists in artisanal fabrics.'}</p>
                    <p>• Store in the provided breathable linen dust bag away from direct sunlight.</p>
                    <p>• Use low-heat steam ironing on the reverse side of embellishments.</p>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

        {/* ============================================================ */}
        {/* CUSTOMER REVIEWS SECTION & FORM */}
        {/* ============================================================ */}
        <section className="mt-20 sm:mt-28 pt-12 border-t border-neutral-200">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div>
              <span className="font-inter text-xs font-semibold tracking-[0.2em] text-[#C9A84C] uppercase block mb-1">
                Patron Impressions
              </span>
              <h2 className="font-playfair text-3xl text-neutral-900 font-normal">
                Customer Reviews ({localReviews.length || 18})
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setIsReviewFormOpen(!isReviewFormOpen)}
              className="bg-neutral-950 text-white px-6 py-3 text-xs font-semibold tracking-widest uppercase hover:bg-[#C9A84C] transition-colors"
            >
              {isReviewFormOpen ? 'Close Form' : 'Write a Review'}
            </button>
          </div>

          {/* Collapsible Review Form */}
          {isReviewFormOpen && (
            <form
              onSubmit={handleSubmitReview}
              className="mb-12 bg-white p-6 sm:p-8 border border-neutral-200 shadow-sm max-w-2xl"
            >
              <h3 className="font-playfair text-xl text-neutral-900 mb-4">
                Share Your Experience with this Piece
              </h3>

              {/* Star Rating Selector */}
              <div className="mb-4">
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-2">
                  Overall Rating
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setReviewRating(num)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`h-5 w-5 ${
                          num <= reviewRating
                            ? 'fill-[#C9A84C] text-[#C9A84C]'
                            : 'text-neutral-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Headline */}
              <div className="mb-4">
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                  Headline
                </label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="e.g. Exceptional tailoring and luxurious drape"
                  className="w-full border border-neutral-300 px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950"
                />
              </div>

              {/* Review Body */}
              <div className="mb-6">
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1">
                  Review Details
                </label>
                <textarea
                  rows={4}
                  value={reviewBody}
                  onChange={(e) => setReviewBody(e.target.value)}
                  placeholder="Share details about the fit, fabric feel, craftsmanship, and how you styled it."
                  required
                  className="w-full border border-neutral-300 p-3 text-xs text-neutral-900 focus:outline-none focus:border-neutral-950"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="bg-neutral-950 text-white px-8 py-3 text-xs font-semibold tracking-widest uppercase hover:bg-[#C9A84C] transition-colors disabled:opacity-60"
              >
                {isSubmittingReview ? 'Submitting...' : 'Post Review'}
              </button>
            </form>
          )}

          {/* Reviews List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(localReviews.length > 0 ? localReviews : [
              {
                id: 'sr-1',
                userId: 'u1',
                rating: 5,
                title: 'Immaculate stitching and drape',
                body: 'The fabric feels unbelievably soft yet holds its shape with regal authority. Definitely worth every rupee.',
                isApproved: true,
                createdAt: new Date(),
                user: { id: 'u1', name: 'Simran Chadha', email: '', role: 'CUSTOMER', createdAt: new Date(), updatedAt: new Date() },
                productId: product.id,
              },
              {
                id: 'sr-2',
                userId: 'u2',
                rating: 5,
                title: 'Timeless piece for festive evenings',
                body: 'Paired this with neutral leather loafers and received non-stop inquiries about where I acquired it. Exceptional packaging as well.',
                isApproved: true,
                createdAt: new Date(),
                user: { id: 'u2', name: 'Aditya Singhania', email: '', role: 'CUSTOMER', createdAt: new Date(), updatedAt: new Date() },
                productId: product.id,
              },
            ]).map((rev) => (
              <div
                key={rev.id}
                className="bg-white p-6 border border-neutral-200/80 shadow-2xs text-left"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-[#C9A84C] text-[#C9A84C]" />
                    ))}
                  </div>
                  <span className="text-[11px] text-neutral-400 font-inter">
                    Verified Purchase
                  </span>
                </div>

                <h4 className="font-playfair text-base text-neutral-900 font-medium mb-1.5">
                  {rev.title || 'Exceptional Quality'}
                </h4>
                <p className="font-inter text-xs text-neutral-600 leading-relaxed font-light mb-4">
                  {rev.body}
                </p>

                <div className="flex items-center gap-2 pt-3 border-t border-neutral-100 text-[11px] text-neutral-500">
                  <CheckCircle className="h-3 w-3 text-emerald-700" />
                  <span className="font-medium text-neutral-800">
                    {rev.user?.name || 'Verified Patron'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================ */}
        {/* RELATED PRODUCTS */}
        {/* ============================================================ */}
        {relatedProducts.length > 0 && (
          <section className="mt-24 pt-16 border-t border-neutral-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="font-inter text-xs font-semibold tracking-[0.2em] text-[#C9A84C] uppercase block mb-1">
                  Complete The Ensemble
                </span>
                <h2 className="font-playfair text-2xl sm:text-3xl text-neutral-900 font-normal">
                  Patrons Also Acquired
                </h2>
              </div>
              <Link
                href="/products"
                className="text-xs font-semibold tracking-widest uppercase text-neutral-900 hover:text-[#C9A84C] transition-colors"
              >
                View Full Edit
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.slice(0, 4).map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </section>
        )}

      </div>

      {/* ============================================================ */}
      {/* SIZE GUIDE MODAL */}
      {/* ============================================================ */}
      <Modal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        title="Artisanal Garment Size Guide"
        description="Measurements represent body dimensions. If between sizes, we recommend selecting the larger size for a relaxed drape."
        size="lg"
      >
        <div className="flex flex-col gap-6 pt-2">
          {/* Unit Toggle */}
          <div className="flex items-center justify-end gap-2 text-xs">
            <span className="text-neutral-500 font-medium">Measurement Unit:</span>
            <div className="inline-flex border border-neutral-300">
              <button
                type="button"
                onClick={() => setSizeGuideUnit('in')}
                className={`px-3 py-1 font-semibold ${
                  sizeGuideUnit === 'in'
                    ? 'bg-neutral-950 text-white'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                Inches (in)
              </button>
              <button
                type="button"
                onClick={() => setSizeGuideUnit('cm')}
                className={`px-3 py-1 font-semibold ${
                  sizeGuideUnit === 'cm'
                    ? 'bg-neutral-950 text-white'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                Centimetres (cm)
              </button>
            </div>
          </div>

          {/* Size Table */}
          <div className="overflow-x-auto border border-neutral-200">
            <table className="w-full text-left text-xs font-inter divide-y divide-neutral-200">
              <thead className="bg-[#FAF9F6] text-neutral-900 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Size</th>
                  <th className="py-3 px-4 font-semibold">Chest / Bust</th>
                  <th className="py-3 px-4 font-semibold">Waist</th>
                  <th className="py-3 px-4 font-semibold">Hips</th>
                  <th className="py-3 px-4 font-semibold">Length</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 bg-white text-neutral-700">
                {[
                  { size: 'XS (36)', chest: '34-36', waist: '28-30', hips: '36-38', len: '28' },
                  { size: 'S (38)', chest: '36-38', waist: '30-32', hips: '38-40', len: '29' },
                  { size: 'M (40)', chest: '38-40', waist: '32-34', hips: '40-42', len: '30' },
                  { size: 'L (42)', chest: '40-42', waist: '34-36', hips: '42-44', len: '30.5' },
                  { size: 'XL (44)', chest: '42-44', waist: '36-38', hips: '44-46', len: '31' },
                  { size: 'XXL (46)', chest: '44-46', waist: '38-40', hips: '46-48', len: '31.5' },
                ].map((row) => {
                  const formatVal = (val: string) => {
                    if (sizeGuideUnit === 'in') return `${val}″`
                    const parts = val.split('-').map((v) => Math.round(parseFloat(v) * 2.54))
                    return parts.length > 1 ? `${parts[0]}-${parts[1]} cm` : `${parts[0]} cm`
                  }
                  return (
                    <tr key={row.size} className="hover:bg-neutral-50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-neutral-950">{row.size}</td>
                      <td className="py-3 px-4">{formatVal(row.chest)}</td>
                      <td className="py-3 px-4">{formatVal(row.waist)}</td>
                      <td className="py-3 px-4">{formatVal(row.hips)}</td>
                      <td className="py-3 px-4">{formatVal(row.len)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Fit Advice */}
          <div className="bg-[#FAF9F6] p-4 border border-neutral-200 text-xs text-neutral-600 space-y-1">
            <p className="font-semibold text-neutral-900">Need personal sizing consultation?</p>
            <p>
              Connect with our Atelier Concierge on WhatsApp at{' '}
              <span className="font-medium text-neutral-900">+91 98765 43210</span> for custom tailor
              advisories.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  )
}
