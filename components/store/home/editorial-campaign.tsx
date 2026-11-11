import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Compass } from 'lucide-react'

export default function EditorialCampaign() {
  return (
    <section className="bg-neutral-950 text-white overflow-hidden py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Visual Editorial Column */}
          <div className="lg:col-span-7 relative">
            <div className="relative aspect-[4/5] sm:aspect-[16/11] lg:aspect-[4/5] w-full overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1400&q=85"
                alt="Autumn Couture Campaign"
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover object-center filter brightness-90 hover:scale-102 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>

            {/* Inset floating editorial badge */}
            <div className="absolute bottom-6 left-6 right-6 sm:right-auto bg-neutral-900/90 backdrop-blur-md p-4 sm:p-6 border border-white/10 max-w-sm">
              <span className="font-inter text-[10px] font-semibold tracking-[0.25em] text-[#C9A84C] uppercase block mb-1">
                CAMPAIGN NO. 08
              </span>
              <p className="font-playfair text-lg sm:text-xl text-neutral-100 italic leading-snug">
                “Clothing constructed not just for the season, but for generations to come.”
              </p>
              <span className="mt-2 text-[11px] text-neutral-400 font-inter block">
                Shot on location in Udaipur & Ladakh
              </span>
            </div>
          </div>

          {/* Right Editorial Copy Column */}
          <div className="lg:col-span-5 lg:pl-6 flex flex-col justify-center text-left">
            <div className="flex items-center gap-2 mb-3">
              <Compass className="h-4 w-4 text-[#C9A84C]" />
              <span className="font-inter text-xs font-semibold tracking-[0.25em] text-[#C9A84C] uppercase">
                The Winter Monolith
              </span>
            </div>

            <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-normal leading-tight text-white mb-6">
              Quiet Elegance, Sculpted by Hand
            </h2>

            <p className="font-inter text-sm sm:text-base text-neutral-300 font-light leading-relaxed mb-6">
              Our 2026 Winter Monolith capsule explores architecture through silhouette. Heavyweight
              organic cashmere, boiled Himalayan wool, and pure mulberry silks meet razor-sharp
              tailoring. Each garment requires up to 48 hours of artisanal hand-cutting and finishing.
            </p>

            {/* Craftsmanship Highlights Grid */}
            <div className="grid grid-cols-2 gap-4 border-y border-white/10 py-6 mb-8">
              <div>
                <span className="font-playfair text-2xl font-light text-[#C9A84C]">100%</span>
                <p className="text-xs text-neutral-400 font-inter tracking-wide uppercase mt-1">
                  Traceable Sustainable Fabrics
                </p>
              </div>
              <div>
                <span className="font-playfair text-2xl font-light text-[#C9A84C]">48+ Hrs</span>
                <p className="text-xs text-neutral-400 font-inter tracking-wide uppercase mt-1">
                  Hand-Artisanal Craft per Garment
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/products?collection=winter-monolith"
                className="group inline-flex items-center justify-center gap-2 bg-[#FFFFF0] text-neutral-950 px-8 py-3.5 text-xs font-semibold tracking-widest uppercase transition-all duration-200 hover:bg-[#C9A84C] hover:text-white"
              >
                <span>Shop The Collection</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center border border-white/30 text-white px-8 py-3.5 text-xs font-medium tracking-widest uppercase hover:bg-white hover:text-black hover:border-white transition-all duration-200"
              >
                Explore Lookbook
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
