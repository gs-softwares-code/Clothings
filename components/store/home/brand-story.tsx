import Image from 'next/image'
import Link from 'next/link'
import { Sparkles, ShieldCheck, Feather, HeartHandshake } from 'lucide-react'

const CRAFT_PILLARS = [
  {
    icon: Feather,
    title: 'Heirloom Handlooms',
    description: 'We collaborate directly with generational master-weavers across Varanasi, Chanderi, and Kashmir, preserving ancient craft traditions.',
  },
  {
    icon: ShieldCheck,
    title: 'Pure Organic Fibres',
    description: '100% GOTS-certified organic cotton, Ahimsa silk, and ethically sourced Mongolian cashmere free of harsh synthetic chemical washes.',
  },
  {
    icon: Sparkles,
    title: 'Modern Architecture',
    description: 'Indian sensibilities harmonized with clean European minimal tailoring — relaxed drops, structured collars, and flowing drapes.',
  },
  {
    icon: HeartHandshake,
    title: 'Artisan Fair Trade',
    description: 'Fair living wages, safe dignified work environments, and healthcare security for every weaver and tailor in our atelier network.',
  },
]

export default function BrandStory() {
  return (
    <section className="py-20 sm:py-28 bg-[#FAF9F6]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Intro Story Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-20">
          
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="flex items-center gap-2">
              <span className="h-px w-8 bg-[#C9A84C]" />
              <span className="font-inter text-xs font-semibold tracking-[0.25em] text-[#C9A84C] uppercase">
                Our Provenance
              </span>
            </div>

            <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-normal leading-[1.15] text-neutral-900">
              Indian Soul, <br />
              <span className="italic">Contemporary Silhouette.</span>
            </h2>

            <p className="font-inter text-sm sm:text-base text-neutral-600 font-light leading-relaxed">
              Founded on the belief that true luxury resides in the rhythm of the human hand, LUXE THREADS
              bridges the timeless textile heritage of the subcontinent with a clean, unpretentious modern design language.
            </p>

            <p className="font-inter text-sm sm:text-base text-neutral-600 font-light leading-relaxed">
              Every garment tells the story of an artisan who spent days spinning raw fibres, dyeing with
              madder root and indigo, and hand-embroidering motifs inspired by Mughal geometry and Indian flora.
            </p>

            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-neutral-900 border-b border-neutral-900 pb-1 hover:text-[#C9A84C] hover:border-[#C9A84C] transition-colors"
              >
                Read The Atelier Journal
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
                <Image
                  src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80"
                  alt="Weaving loom craftsmanship"
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-center filter grayscale contrast-105 hover:grayscale-0 transition-all duration-500"
                />
              </div>
              <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 translate-y-8">
                <Image
                  src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80"
                  alt="Hand block print and drape"
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-center hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>

        </div>

        {/* 4 Pillars of Craft */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-8 border-t border-neutral-200">
          {CRAFT_PILLARS.map((pillar) => {
            const Icon = pillar.icon
            return (
              <div key={pillar.title} className="flex flex-col text-left">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white border border-neutral-200 text-[#C9A84C] mb-4 shadow-2xs">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-playfair text-lg text-neutral-900 font-medium mb-2">
                  {pillar.title}
                </h3>
                <p className="font-inter text-xs text-neutral-600 leading-relaxed font-light">
                  {pillar.description}
                </p>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
