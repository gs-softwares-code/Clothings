'use client'

import Link from 'next/link'
import { Flame, ArrowRight } from 'lucide-react'
import { Product } from '@/types'
import ProductCard from '@/components/store/product/product-card'

interface BestsellersProps {
  products?: Product[]
}

const FALLBACK_BESTSELLERS: Product[] = [
  {
    id: 'bs-1',
    name: 'Kashmiri Hand-Spun Pashmina Jacket',
    slug: 'kashmiri-hand-spun-pashmina-jacket',
    description: 'Layered heirloom luxury crafted by master artisans in the Kashmir valley.',
    price: 32000,
    comparePrice: 38000,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
    ]),
    categoryId: 'women',
    category: { id: 'women', name: 'Women', slug: 'women', createdAt: new Date() },
    badge: 'BESTSELLER',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    variants: [
      { id: 'bv1', productId: 'bs-1', size: 'S', color: 'Midnight Gold', sku: 'KHP-S-GLD', stock: 4 },
      { id: 'bv2', productId: 'bs-1', size: 'M', color: 'Midnight Gold', sku: 'KHP-M-GLD', stock: 6 },
      { id: 'bv3', productId: 'bs-1', size: 'L', color: 'Midnight Gold', sku: 'KHP-L-GLD', stock: 2 },
    ],
  },
  {
    id: 'bs-2',
    name: 'Structured Double-Breasted Khadi Suit',
    slug: 'structured-double-breasted-khadi-suit',
    description: 'Hand-spun organic cotton tailored with Italian horn buttons and peaked lapels.',
    price: 21500,
    comparePrice: 26000,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    ]),
    categoryId: 'men',
    category: { id: 'men', name: 'Men', slug: 'men', createdAt: new Date() },
    badge: 'BESTSELLER',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    variants: [
      { id: 'bv4', productId: 'bs-2', size: '38', color: 'Sand Beige', sku: 'SDK-38-SND', stock: 5 },
      { id: 'bv5', productId: 'bs-2', size: '40', color: 'Sand Beige', sku: 'SDK-40-SND', stock: 7 },
      { id: 'bv6', productId: 'bs-2', size: '42', color: 'Sand Beige', sku: 'SDK-42-SND', stock: 3 },
    ],
  },
  {
    id: 'bs-3',
    name: 'Hand-Block Printed Silk Organza Saree',
    slug: 'hand-block-printed-silk-organza-saree',
    description: 'Whisper-weight pure silk organza decorated with Bagru natural mineral dyes.',
    price: 16900,
    comparePrice: null,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
    ]),
    categoryId: 'women',
    category: { id: 'women', name: 'Women', slug: 'women', createdAt: new Date() },
    badge: 'BESTSELLER',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    variants: [
      { id: 'bv7', productId: 'bs-3', size: 'Free Size', color: 'Rose Dust', sku: 'HBP-FS-RSD', stock: 8 },
    ],
  },
  {
    id: 'bs-4',
    name: 'Artisanal Veg-Tan Leather Oxford Loafers',
    slug: 'artisanal-veg-tan-leather-oxford-loafers',
    description: 'Goodyear welted handcrafted leather shoes with hand-painted patina finish.',
    price: 11500,
    comparePrice: 14000,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
    ]),
    categoryId: 'accessories',
    category: { id: 'accessories', name: 'Accessories', slug: 'accessories', createdAt: new Date() },
    badge: 'BESTSELLER',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    variants: [
      { id: 'bv8', productId: 'bs-4', size: 'UK 8', color: 'Cognac', sku: 'VTL-UK8-COG', stock: 4 },
      { id: 'bv9', productId: 'bs-4', size: 'UK 9', color: 'Cognac', sku: 'VTL-UK9-COG', stock: 6 },
      { id: 'bv10', productId: 'bs-4', size: 'UK 10', color: 'Cognac', sku: 'VTL-UK10-COG', stock: 3 },
    ],
  },
]

export default function Bestsellers({ products = [] }: BestsellersProps) {
  const items = products.length > 0 ? products : FALLBACK_BESTSELLERS

  return (
    <section className="py-20 sm:py-28 bg-[#FAF9F6]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Flame className="h-4 w-4 text-[#C9A84C]" />
              <span className="font-inter text-xs font-semibold tracking-[0.2em] text-[#C9A84C] uppercase">
                Most Coveted Icons
              </span>
            </div>
            <h2 className="font-playfair text-3xl sm:text-4xl text-neutral-900 font-normal">
              Bestsellers
            </h2>
            <p className="mt-2 font-inter text-xs sm:text-sm text-neutral-500 font-light max-w-md">
              The signature staples defined by uncompromising quality, cherished by our patrons worldwide.
            </p>
          </div>

          <Link
            href="/products?sort=popular"
            className="group inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-neutral-900 hover:text-[#C9A84C] transition-colors"
          >
            <span>Shop All Bestsellers</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Bestseller Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {items.slice(0, 8).map((product, idx) => (
            <div key={product.id} className="relative">
              {/* Luxury rank number indicator */}
              <div className="absolute top-2 left-2 z-20 pointer-events-none">
                <span className="font-playfair text-2xl font-light italic text-white/90 drop-shadow-md">
                  0{idx + 1}
                </span>
              </div>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
