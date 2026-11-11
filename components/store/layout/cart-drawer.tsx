'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  Tag,
  ArrowRight,
  Truck,
  CheckCircle,
} from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { formatPrice } from '@/lib/utils'
import { Drawer } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'

function parseFirstImage(images: unknown): string {
  if (Array.isArray(images) && images.length > 0) {
    return images[0]
  }
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0]
      }
    } catch {
      if (images.startsWith('http') || images.startsWith('/')) {
        return images
      }
    }
  }
  return 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80'
}

export const CartDrawer: React.FC = () => {
  const router = useRouter()
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    getSubtotal,
    getDiscount,
    getShippingFee,
    getTotal,
    getItemCount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCartStore()

  const [couponCode, setCouponCode] = React.useState('')
  const [couponError, setCouponError] = React.useState<string | null>(null)
  const [couponSuccess, setCouponSuccess] = React.useState<string | null>(null)

  const subtotal = getSubtotal()
  const discount = getDiscount()
  const shippingFee = getShippingFee()
  const total = getTotal()
  const totalItems = getItemCount()

  // Free shipping threshold
  const FREE_SHIPPING_THRESHOLD = 999
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const progressPercent = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100))

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault()
    setCouponError(null)
    setCouponSuccess(null)

    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code.')
      return
    }

    const result = applyCoupon(couponCode.trim())
    if (result.success) {
      setCouponSuccess(result.message)
      setCouponCode('')
    } else {
      setCouponError(result.message)
    }
  }

  const handleCheckout = () => {
    closeCart()
    router.push('/checkout')
  }

  const handleViewBag = () => {
    closeCart()
    router.push('/cart')
  }

  return (
    <Drawer
      isOpen={isOpen}
      onClose={closeCart}
      size="md"
      title={
        <div className="flex items-center gap-2">
          <span>Shopping Bag</span>
          <span className="text-xs font-inter font-medium text-neutral-400">
            ({totalItems} {totalItems === 1 ? 'item' : 'items'})
          </span>
        </div>
      }
    >
      <div className="flex flex-col h-full">
        {/* Free Shipping Progress Indicator */}
        <div className="mb-4 p-3 bg-neutral-50 border border-neutral-100 rounded-none">
          <div className="flex items-center gap-2 text-xs font-inter text-neutral-800 font-medium mb-1.5">
            <Truck className="w-4 h-4 text-[#C9A84C]" />
            {amountToFreeShipping > 0 ? (
              <span>
                Add <span className="font-semibold text-neutral-900">{formatPrice(amountToFreeShipping)}</span> more for{' '}
                <span className="text-[#C9A84C] font-semibold">Complimentary Express Shipping</span>
              </span>
            ) : (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 inline" />
                Complimentary Express Shipping Unlocked!
              </span>
            )}
          </div>
          <div className="w-full bg-neutral-200 h-1.5 overflow-hidden">
            <div
              className="bg-[#C9A84C] h-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Empty State */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4">
              <ShoppingBag className="w-8 h-8 stroke-[1.2]" />
            </div>
            <h4 className="text-lg font-playfair text-neutral-900 mb-1">Your Bag is Empty</h4>
            <p className="text-xs text-neutral-500 font-inter max-w-xs mb-6">
              Discover our latest curation of handpicked artisanal designs and elevate your wardrobe.
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                closeCart()
                router.push('/products')
              }}
            >
              Explore Collection
            </Button>
          </div>
        ) : (
          /* Items List */
          <div className="flex-1 divide-y divide-neutral-100">
            {items.map((item) => {
              const imageSrc = parseFirstImage(item.product.images)
              const itemPrice = item.variant?.price ?? item.product.price

              return (
                <div key={item.id} className="py-4 flex gap-4">
                  {/* Thumbnail */}
                  <Link
                    href={`/products/${item.product.slug}`}
                    onClick={closeCart}
                    className="relative w-20 h-24 bg-neutral-100 shrink-0 overflow-hidden block border border-neutral-100"
                  >
                    <Image
                      src={imageSrc}
                      alt={item.product.name}
                      fill
                      className="object-cover object-top hover:scale-105 transition-transform duration-300"
                      sizes="80px"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/products/${item.product.slug}`}
                          onClick={closeCart}
                          className="text-xs sm:text-sm font-inter font-medium text-neutral-900 line-clamp-1 hover:underline"
                        >
                          {item.product.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-neutral-400 hover:text-neutral-900 transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Variant Info */}
                      <div className="mt-1 flex items-center gap-2 text-[11px] font-inter text-neutral-500">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.size && item.color && <span>•</span>}
                        {item.color && <span>Color: {item.color}</span>}
                      </div>

                      <div className="mt-1 text-xs font-semibold font-inter text-neutral-900">
                        {formatPrice(itemPrice)}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="inline-flex items-center border border-neutral-200">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 text-neutral-600 hover:text-neutral-900 transition-colors hover:bg-neutral-50 disabled:opacity-40"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-inter font-medium text-neutral-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 text-neutral-600 hover:text-neutral-900 transition-colors hover:bg-neutral-50"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-xs font-semibold text-neutral-900 font-inter">
                        {formatPrice(itemPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Footer with Calculations & Checkout (only if items present) */}
        {items.length > 0 && (
          <div className="mt-auto pt-4 border-t border-neutral-100">
            {/* Coupon Code Section */}
            <div className="mb-4">
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 bg-[#FAF7F0] border border-[#E9DDC2] text-xs font-inter">
                  <div className="flex items-center gap-2 text-neutral-800">
                    <Tag className="w-3.5 h-3.5 text-[#C9A84C]" />
                    <span>
                      Coupon <strong className="font-semibold">{appliedCoupon.code}</strong> applied
                      ({appliedCoupon.type === 'PERCENTAGE' ? `${appliedCoupon.value}% OFF` : `₹${appliedCoupon.value} OFF`})
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-rose-700 hover:underline uppercase font-medium tracking-wider"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value)
                        setCouponError(null)
                      }}
                      placeholder="Enter promo code (e.g. LUXE15)"
                      className="w-full pl-9 pr-3 py-2 text-xs uppercase font-inter border border-neutral-200 focus:border-neutral-900 focus:outline-none"
                    />
                  </div>
                  <Button type="submit" variant="secondary" size="sm">
                    Apply
                  </Button>
                </form>
              )}

              {couponError && (
                <p className="mt-1 text-[11px] text-rose-600 font-inter">{couponError}</p>
              )}
              {couponSuccess && (
                <p className="mt-1 text-[11px] text-emerald-600 font-inter">{couponSuccess}</p>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-1.5 text-xs font-inter text-neutral-600 pb-4 border-b border-neutral-100">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-neutral-900">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="font-medium text-neutral-900">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-700 font-semibold uppercase">Free</span>
                  ) : (
                    formatPrice(shippingFee)
                  )}
                </span>
              </div>
              <div className="flex justify-between pt-2 text-sm font-semibold text-neutral-900 border-t border-neutral-100">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <p className="text-[10px] text-neutral-400 font-inter text-right">
                Taxes calculated during checkout
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 space-y-2">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleCheckout}
                rightIcon={<ArrowRight className="w-4 h-4 ml-1" />}
              >
                Proceed to Checkout
              </Button>
              <Button
                variant="outline"
                size="md"
                fullWidth
                onClick={handleViewBag}
              >
                View Shopping Bag
              </Button>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  )
}

export default CartDrawer
