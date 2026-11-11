'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Ticket,
  ShieldCheck,
  Truck,
  RotateCcw,
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { useCartStore } from '@/store/cart-store'
import { formatPrice } from '@/lib/utils'

export default function CartPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [couponInput, setCouponInput] = useState('')
  const [validatingCoupon, setValidatingCoupon] = useState(false)

  const items = useCartStore((state) => state.items)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const appliedCoupon = useCartStore((state) => state.appliedCoupon)
  const applyCoupon = useCartStore((state) => state.applyCoupon)
  const removeCoupon = useCartStore((state) => state.removeCoupon)
  const getSubtotal = useCartStore((state) => state.getSubtotal)
  const getDiscount = useCartStore((state) => state.getDiscount)
  const getShippingFee = useCartStore((state) => state.getShippingFee)
  const getTotal = useCartStore((state) => state.getTotal)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-stone-950 pt-32 pb-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const subtotal = getSubtotal()
  const discount = getDiscount()
  const shippingFee = getShippingFee()
  const gst = Math.round(((subtotal - discount) * 0.18) * 100) / 100
  const finalTotal = Math.max(0, subtotal - discount + shippingFee + gst)

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!couponInput.trim()) return

    try {
      setValidatingCoupon(true)
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponInput.trim().toUpperCase(),
          subtotal,
        }),
      })

      const data = await res.json()

      if (data.success && data.data) {
        applyCoupon({
          code: data.data.code,
          type: data.data.type,
          value: data.data.value,
          minOrderValue: data.data.minOrderValue,
          maxDiscount: data.data.maxDiscount,
        })
        toast.success(`Coupon "${data.data.code}" applied!`)
        setCouponInput('')
      } else {
        // Fallback to client-side known coupons
        const result = applyCoupon(couponInput.trim())
        if (result.success) {
          toast.success(result.message)
          setCouponInput('')
        } else {
          toast.error(data.error || result.message)
        }
      }
    } catch {
      const result = applyCoupon(couponInput.trim())
      if (result.success) {
        toast.success(result.message)
        setCouponInput('')
      } else {
        toast.error(result.message)
      }
    } finally {
      setValidatingCoupon(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 pt-24 pb-20">
      <Toaster position="top-right" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Title */}
        <div className="pb-6 mb-8 border-b border-stone-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-[11px] text-stone-400 uppercase tracking-widest mb-1">
              <Link href="/" className="hover:text-amber-300">
                Maison
              </Link>
              <span>/</span>
              <span className="text-amber-400">Shopping Bag</span>
            </div>
            <h1 className="font-serif text-3xl font-light text-white tracking-wide">
              Your Wardrobe Selection
            </h1>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center space-x-2 text-xs text-stone-400 hover:text-amber-300 transition uppercase tracking-wider"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Curating</span>
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="py-24 text-center p-8 bg-stone-900/40 rounded-lg border border-stone-800 space-y-4 max-w-xl mx-auto">
            <ShoppingBag className="w-12 h-12 text-stone-400 mx-auto stroke-[1.25]" />
            <h2 className="font-serif text-2xl font-light text-white">
              Your Shopping Bag is Empty
            </h2>
            <p className="text-xs text-stone-400 leading-relaxed">
              Explore our curated garments crafted with pure natural fibers, timeless silhouettes, and bespoke tailoring.
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold text-xs uppercase tracking-widest rounded transition"
              >
                <span>Discover Creations</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Bag Items List (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-stone-900/40 rounded-lg border border-stone-800 divide-y divide-stone-800/80 overflow-hidden">
                {items.map((item) => {
                  let parsedImages: string[] = []
                  try {
                    parsedImages =
                      typeof item.product.images === 'string'
                        ? JSON.parse(item.product.images)
                        : item.product.images
                  } catch {
                    parsedImages = item.product.images
                      ? [item.product.images as any]
                      : []
                  }
                  const thumbnail =
                    parsedImages[0] ||
                    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800'
                  const unitPrice =
                    item.variant?.price ?? item.product.price ?? 0
                  const itemTotal = unitPrice * item.quantity

                  return (
                    <div
                      key={item.id}
                      className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      {/* Image & Title */}
                      <div className="flex items-center space-x-4">
                        <div className="relative w-20 h-24 bg-stone-900 rounded overflow-hidden flex-shrink-0 border border-stone-800">
                          <Image
                            src={thumbnail}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="space-y-1">
                          <Link
                            href={`/products/${item.product.slug}`}
                            className="text-sm font-medium text-white hover:text-amber-300 transition line-clamp-1"
                          >
                            {item.product.name}
                          </Link>
                          <div className="text-[11px] text-stone-400">
                            Size: <span className="text-white font-medium">{item.size || 'M'}</span> • Color:{' '}
                            <span className="text-white font-medium">{item.color || 'Standard'}</span>
                          </div>
                          <div className="font-serif text-sm font-medium text-white sm:hidden pt-1">
                            {formatPrice(unitPrice)}
                          </div>
                        </div>
                      </div>

                      {/* Quantity & Item Subtotal */}
                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto sm:space-x-8 pt-2 sm:pt-0">
                        {/* Quantity Counter */}
                        <div className="flex items-center border border-stone-700 rounded bg-stone-950">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="p-1.5 text-stone-400 hover:text-white transition"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-mono font-medium text-white">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="p-1.5 text-stone-400 hover:text-white transition"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <div className="font-serif font-medium text-amber-300 text-sm">
                            {formatPrice(itemTotal)}
                          </div>
                          {item.quantity > 1 && (
                            <div className="text-[10px] text-stone-400">
                              {formatPrice(unitPrice)} each
                            </div>
                          )}
                        </div>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-400 transition"
                          title="Remove garment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* White Glove Service Callouts */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[11px] text-stone-400">
                <div className="p-3 bg-stone-900/30 rounded border border-stone-800 flex items-center space-x-2.5">
                  <Truck className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>Complimentary shipping on orders over ₹999</span>
                </div>
                <div className="p-3 bg-stone-900/30 rounded border border-stone-800 flex items-center space-x-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>100% Certified Authentic Fabrics</span>
                </div>
                <div className="p-3 bg-stone-900/30 rounded border border-stone-800 flex items-center space-x-2.5">
                  <RotateCcw className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>Complimentary 14-day courier returns</span>
                </div>
              </div>
            </div>

            {/* Right: Order Summary & Coupon (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Coupon Code Box */}
              <div className="p-5 bg-stone-900/40 rounded-lg border border-stone-800 space-y-3">
                <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-stone-200">
                  <Ticket className="w-4 h-4 text-amber-400" />
                  <span>Privilege / Voucher Code</span>
                </div>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 bg-amber-400/10 border border-amber-400/30 rounded text-xs">
                    <div>
                      <span className="font-mono font-bold text-amber-300">
                        {appliedCoupon.code}
                      </span>
                      <span className="text-[10px] text-stone-400 block">
                        {appliedCoupon.type === 'PERCENTAGE'
                          ? `${appliedCoupon.value}% discount applied`
                          : `${formatPrice(appliedCoupon.value)} discount applied`}
                      </span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-stone-400 hover:text-rose-400 text-xs font-medium uppercase tracking-wider"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="e.g. LUXE15"
                      className="flex-1 px-3 py-2 bg-stone-950 border border-stone-800 rounded text-xs text-white uppercase font-mono placeholder-stone-400 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="submit"
                      disabled={validatingCoupon || !couponInput.trim()}
                      className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold uppercase tracking-wider rounded transition disabled:opacity-50 border border-stone-700"
                    >
                      {validatingCoupon ? '...' : 'Apply'}
                    </button>
                  </form>
                )}
                <p className="text-[10px] text-stone-400">
                  Tip: Use <span className="font-mono text-amber-300">LUXE15</span> for 15% off orders above ₹999
                </p>
              </div>

              {/* Price Breakdown */}
              <div className="p-6 bg-stone-900/60 rounded-lg border border-stone-800 space-y-4">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-300 pb-3 border-b border-stone-800">
                  Order Summary
                </h2>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-stone-300">
                    <span>Subtotal</span>
                    <span className="font-serif">{formatPrice(subtotal)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Privilege Discount</span>
                      <span className="font-serif">-{formatPrice(discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-stone-300">
                    <span>White Glove Shipping</span>
                    <span>
                      {shippingFee === 0 ? (
                        <span className="text-emerald-400 uppercase text-[10px] font-medium tracking-wider">
                          Complimentary
                        </span>
                      ) : (
                        <span className="font-serif">{formatPrice(shippingFee)}</span>
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-stone-300">
                    <span>Estimated GST (18%)</span>
                    <span className="font-serif">{formatPrice(gst)}</span>
                  </div>

                  <div className="pt-3 border-t border-stone-800 flex justify-between items-baseline">
                    <div>
                      <span className="text-sm font-semibold text-white uppercase tracking-wider">
                        Total Settled
                      </span>
                      <span className="text-[10px] text-stone-400 block">
                        Inclusive of all duties & handling
                      </span>
                    </div>
                    <span className="font-serif text-xl font-bold text-amber-400">
                      {formatPrice(finalTotal)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => router.push('/checkout')}
                  className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold tracking-[0.15em] uppercase text-xs rounded transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-amber-400/10 mt-4"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
