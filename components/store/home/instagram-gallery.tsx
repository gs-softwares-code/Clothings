import Image from 'next/image'
import Link from 'next/link'
import { Instagram, ShoppingBag } from 'lucide-react'

interface InstaPost {
  id: string
  image: string
  caption: string
  productSlug: string
  author: string
}

const INSTA_POSTS: InstaPost[] = [
  {
    id: 'ig-1',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80',
    caption: 'Golden hour in Varanasi silks.',
    productSlug: 'chanderi-gold-zari-anarkali-kurta',
    author: '@ananya_s',
  },
  {
    id: 'ig-2',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
    caption: 'Modern silhouette, timeless poise.',
    productSlug: 'raw-mulberry-silk-bandhgala-jacket',
    author: '@dev_oberoi',
  },
  {
    id: 'ig-3',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80',
    caption: 'Minimal drapery for warm autumn afternoons.',
    productSlug: 'tailored-linen-pleated-trousers',
    author: '@meera.k',
  },
  {
    id: 'ig-4',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80',
    caption: 'Heirloom stitches from the Kashmir valley.',
    productSlug: 'pure-pashmina-hand-embroidered-shawl',
    author: '@zoya_atelier',
  },
  {
    id: 'ig-5',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80',
    caption: 'Architecture in tailoring.',
    productSlug: 'structured-double-breasted-khadi-suit',
    author: '@rohan_mehta',
  },
  {
    id: 'ig-6',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80',
    caption: 'Festive radiance reimagined.',
    productSlug: 'hand-block-printed-silk-organza-saree',
    author: '@priya_couture',
  },
]

export default function InstagramGallery() {
  return (
    <section className="py-20 bg-[#FAF9F6] border-b border-neutral-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Instagram className="h-4 w-4 text-[#C9A84C]" />
              <span className="font-inter text-xs font-semibold tracking-[0.2em] text-[#C9A84C] uppercase">
                #LuxeThreadsPatron
              </span>
            </div>
            <h2 className="font-playfair text-3xl sm:text-4xl text-neutral-900 font-normal">
              As Worn by You
            </h2>
            <p className="mt-1 text-xs text-neutral-500 font-inter font-light">
              Tag @luxethreads in your curated ensembles for a chance to be featured in our lookbook.
            </p>
          </div>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-neutral-900 hover:text-[#C9A84C] transition-colors"
          >
            <span>Follow @luxethreads</span>
          </a>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {INSTA_POSTS.map((post) => (
            <Link
              key={post.id}
              href={`/products/${post.productSlug}`}
              className="group relative aspect-square overflow-hidden bg-neutral-900 block"
            >
              <Image
                src={post.image}
                alt={post.caption}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                className="object-cover object-center transition-all duration-500 group-hover:scale-108 group-hover:opacity-75"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <ShoppingBag className="h-5 w-5 text-white mb-2" />
                <span className="text-[10px] font-semibold text-white tracking-widest uppercase">
                  Shop The Look
                </span>
                <span className="text-[11px] text-[#F7E7CE] font-light mt-1 line-clamp-1">
                  {post.author}
                </span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  )
}
