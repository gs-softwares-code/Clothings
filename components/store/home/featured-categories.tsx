import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'

interface CategoryCardData {
  title: string
  subtitle: string
  itemCount: string
  slug: string
  image: string
  aspectRatio: string
}

const CATEGORIES: CategoryCardData[] = [
  {
    title: 'Women',
    subtitle: 'Contemporary Silhouettes & Handwoven Drapes',
    itemCount: '240+ Styles',
    slug: 'women',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&q=80',
    aspectRatio: 'aspect-[3/4]',
  },
  {
    title: 'Men',
    subtitle: 'Sharp Tailoring, Bandhgalas & Linen Essentials',
    itemCount: '180+ Styles',
    slug: 'men',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1000&q=80',
    aspectRatio: 'aspect-[3/4]',
  },
  {
    title: 'Kids',
    subtitle: 'Gentle Pure Cottons & Celebration Wear',
    itemCount: '90+ Styles',
    slug: 'kids',
    image: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=1000&q=80',
    aspectRatio: 'aspect-[3/4]',
  },
  {
    title: 'Accessories',
    subtitle: 'Hand-dyed Stoles, Leather Craft & Minimal Jewelry',
    itemCount: '110+ Styles',
    slug: 'accessories',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1000&q=80',
    aspectRatio: 'aspect-[3/4]',
  },
]

export default function FeaturedCategories() {
  return (
    <section className="py-20 sm:py-28 bg-[#FAF9F6]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 sm:mb-16 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-px w-6 bg-[#C9A84C]" />
              <span className="font-inter text-xs font-semibold tracking-[0.2em] text-[#C9A84C] uppercase">
                Curated Universes
              </span>
            </div>
            <h2 className="font-playfair text-3xl sm:text-4xl text-neutral-900 font-normal">
              Featured Categories
            </h2>
          </div>
          <Link
            href="/products"
            className="group inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-neutral-800 hover:text-[#C9A84C] transition-colors"
          >
            <span>Explore All Collections</span>
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              href={`/products?category=${category.slug}`}
              className="group relative overflow-hidden bg-neutral-900 block"
            >
              {/* Image with subtle zoom */}
              <div className="relative aspect-[3/4] w-full overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-center transition-all duration-700 ease-out group-hover:scale-105 group-hover:opacity-90"
                />
                {/* Subtle dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent transition-opacity duration-300 group-hover:opacity-85" />
              </div>

              {/* Category Info Overlay */}
              <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col text-left">
                <span className="font-inter text-[11px] font-medium tracking-widest uppercase text-[#C9A84C] mb-1">
                  {category.itemCount}
                </span>
                <div className="flex items-center justify-between">
                  <h3 className="font-playfair text-2xl text-white font-normal group-hover:text-[#F7E7CE] transition-colors">
                    {category.title}
                  </h3>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white backdrop-blur-xs transition-transform duration-300 group-hover:scale-110 group-hover:bg-white group-hover:text-black">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-1 font-inter text-xs text-neutral-300 line-clamp-1 font-light opacity-90">
                  {category.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
