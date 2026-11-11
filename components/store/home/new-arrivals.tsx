'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Product } from '@/types'
import ProductCard from '@/components/store/product/product-card'

interface NewArrivalsProps {
  products?: Product[]
}

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'na-1',
    name: 'Raw Mulberry Silk Bandhgala Jacket',
    slug: 'raw-mulberry-silk-bandhgala-jacket',
    description: 'Bespoke structured jacket tailored from pure Mulberry raw silk with hand-cast brass buttons.',
    price: 18500,
    comparePrice: 22000,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80',
      'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=800&q=80',
    ]),
    categoryId: 'men',
    category: { id: 'men', name: 'Men', slug: 'men', createdAt: new Date() },
    badge: 'NEW',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    variants: [
      { id: 'v1', productId: 'na-1', size: '38', color: 'Charcoal', sku: 'MSB-38-BLK', stock: 5 },
      { id: 'v2', productId: 'na-1', size: '40', color: 'Charcoal', sku: 'MSB-40-BLK', stock: 8 },
      { id: 'v3', productId: 'na-1', size: '42', color: 'Charcoal', sku: 'MSB-42-BLK', stock: 4 },
    ],
  },
  {
    id: 'na-2',
    name: 'Chanderi Gold Zari Anarkali Kurta',
    slug: 'chanderi-gold-zari-anarkali-kurta',
    description: 'Voluminous handwoven Chanderi cotton-silk silhouette with delicate floral motifs.',
    price: 14200,
    comparePrice: 16500,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
    ]),
    categoryId: 'women',
    category: { id: 'women', name: 'Women', slug: 'women', createdAt: new Date() },
    badge: 'NEW',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    variants: [
      { id: 'v4', productId: 'na-2', size: 'XS', color: 'Ivory Gold', sku: 'CGZ-XS-IVO', stock: 3 },
      { id: 'v5', productId: 'na-2', size: 'S', color: 'Ivory Gold', sku: 'CGZ-S-IVO', stock: 6 },
      { id: 'v6', productId: 'na-2', size: 'M', color: 'Ivory Gold', sku: 'CGZ-M-IVO', stock: 5 },
      { id: 'v7', productId: 'na-2', size: 'L', color: 'Ivory Gold', sku: 'CGZ-L-IVO', stock: 2 },
    ],
  },
  {
    id: 'na-3',
    name: 'Pure Pashmina Hand-Embroidered Shawl',
    slug: 'pure-pashmina-hand-embroidered-shawl',
    description: 'Fine grade Kashmiri cashmere with sozni needle embroidery along the border.',
    price: 24000,
    comparePrice: null,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
    ]),
    categoryId: 'accessories',
    category: { id: 'accessories', name: 'Accessories', slug: 'accessories', createdAt: new Date() },
    badge: 'EXCLUSIVE',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    variants: [
      { id: 'v8', productId: 'na-3', size: 'Free Size', color: 'Oatmeal', sku: 'PPH-FS-OAT', stock: 6 },
    ],
  },
  {
    id: 'na-4',
    name: 'Tailored Linen Pleated Trousers',
    slug: 'tailored-linen-pleated-trousers',
    description: 'Relaxed double-pleated silhouette cut from heavyweight Belgian linen.',
    price: 6800,
    comparePrice: 8500,
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    ]),
    categoryId: 'men',
    category: { id: 'men', name: 'Men', slug: 'men', createdAt: new Date() },
    badge: 'NEW',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    variants: [
      { id: 'v9', productId: 'na-4', size: '30', color: 'Ecru', sku: 'TLP-30-ECR', stock: 4 },
      { id: 'v10', productId: 'na-4', size: '32', color: 'Ecru', sku: 'TLP-32-ECR', stock: 10 },
      { id: 'v11', productId: 'na-4', size: '34', color: 'Ecru', sku: 'TLP-34-ECR', stock: 7 },
    ],
  },
]

export default function NewArrivals({ products = [] }: NewArrivalsProps) {
  const [activeTab, setActiveTab] = useState<'ALL' | 'WOMEN' | 'MEN' | 'ACCESSORIES'>('ALL')

  const items = products.length > 0 ? products : FALLBACK_PRODUCTS

  const filteredItems = items.filter((item) => {
    if (activeTab === 'ALL') return true
    const catSlug = item.category?.slug?.toUpperCase() || ''
    return catSlug === activeTab
  })

  return (
    <section className="py-20 sm:py-28 bg-white border-b border-neutral-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-[#C9A84C]" />
              <span className="font-inter text-xs font-semibold tracking-[0.2em] text-[#C9A84C] uppercase">
                Just Landed
              </span>
            </div>
            <h2 className="font-playfair text-3xl sm:text-4xl text-neutral-900 font-normal">
              New Arrivals
            </h2>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {(['ALL', 'WOMEN', 'MEN', 'ACCESSORIES'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-xs font-medium tracking-wider uppercase transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900'
                }`}
              >
                {tab === 'ALL' ? 'All Pieces' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {filteredItems.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All CTA */}
        <div className="mt-14 text-center">
          <Link
            href="/products?sort=newest"
            className="group inline-flex items-center gap-2 border border-neutral-900 px-8 py-3.5 text-xs font-semibold tracking-widest uppercase text-neutral-900 hover:bg-neutral-900 hover:text-white transition-all duration-200"
          >
            <span>View All New Drops</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  )
}
