'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { useWishlistStore } from '@/store/wishlist-store'
import { useCartStore } from '@/store/cart-store'
import { formatPrice } from '@/lib/utils'

export default function AccountWishlistPage() {
  const [mounted, setMounted] = useState(false)
  const items = useWishlistStore((state) => state.items)
  const removeItem = useWishlistStore((state) => state.removeItem)
  const addItemToCart = useCartStore((state) => state.addItem)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const handleQuickAdd = (product: any) => {
    const firstVariant =
      product.variants && product.variants.length > 0
        ? product.variants[0]
        : { size: 'M', color: 'Classic' }

    addItemToCart(product, firstVariant, 1)
    toast.success(`"${product.name}" transferred to your Shopping Bag`)
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      <div className="flex items-center justify-between pb-4 border-b border-stone-800">
        <div>
          <h2 className="font-serif text-2xl font-light text-white tracking-wide">
            Wardrobe Wishlist
          </h2>
          <p className="text-xs text-stone-400 uppercase tracking-widest mt-1">
            Curated desires, future acquisitions, and limited edition pieces
          </p>
        </div>
        <span className="text-xs font-mono text-amber-300">
          {items.length} {items.length === 1 ? 'creation' : 'creations'}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="py-20 text-center p-8 bg-stone-900/40 rounded-lg border border-stone-800 space-y-3">
          <Heart className="w-10 h-10 text-stone-400 mx-auto" />
          <h3 className="text-sm font-medium text-white uppercase tracking-wider">
            Your Wishlist is Empty
          </h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto">
            Explore our latest sartorial silhouettes and mark items to reserve them in your personal lookbook.
          </p>
          <div className="pt-2">
            <Link
              href="/products"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-semibold uppercase tracking-wider rounded transition"
            >
              <span>Explore Creations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((product) => {
            let parsedImages: string[] = []
            try {
              parsedImages =
                typeof product.images === 'string'
                  ? JSON.parse(product.images)
                  : product.images
            } catch {
              parsedImages = product.images ? [product.images as any] : []
            }
            const thumbnail =
              parsedImages[0] ||
              'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800'

            return (
              <div
                key={product.id}
                className="group bg-stone-900/40 rounded-lg border border-stone-800 overflow-hidden flex flex-col justify-between transition-all hover:border-amber-400/40"
              >
                <div>
                  {/* Image container */}
                  <div className="relative aspect-[3/4] bg-stone-900 overflow-hidden">
                    <Link href={`/products/${product.slug}`}>
                      <Image
                        src={thumbnail}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    </Link>

                    {product.badge && (
                      <span className="absolute top-3 left-3 px-2 py-0.5 bg-black/80 text-amber-300 text-[9px] uppercase tracking-wider rounded font-mono">
                        {product.badge}
                      </span>
                    )}

                    <button
                      onClick={() => {
                        removeItem(product.id)
                        toast.success('Removed from wishlist')
                      }}
                      className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-stone-300 hover:text-rose-400 hover:bg-black transition"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-4 space-y-1">
                    <Link
                      href={`/products/${product.slug}`}
                      className="text-xs font-medium text-white hover:text-amber-300 transition line-clamp-1"
                    >
                      {product.name}
                    </Link>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-white">
                        {formatPrice(product.price)}
                      </span>
                      {product.comparePrice && (
                        <span className="text-[10px] text-stone-400 line-through">
                          {formatPrice(product.comparePrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Add Button */}
                <div className="p-4 pt-0">
                  <button
                    onClick={() => handleQuickAdd(product)}
                    className="w-full py-2 bg-stone-900 hover:bg-amber-400 hover:text-stone-950 text-stone-200 border border-stone-700 hover:border-amber-400 rounded text-xs uppercase tracking-wider font-medium flex items-center justify-center space-x-2 transition-all duration-200"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Transfer to Bag</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
