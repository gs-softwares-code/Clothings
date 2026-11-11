'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'

interface Slide {
  id: string
  title: string
  subtitle: string
  tagline: string
  image: string
  primaryCtaText: string
  primaryCtaLink: string
  secondaryCtaText: string
  secondaryCtaLink: string
  theme: 'dark' | 'light'
}

const HERO_SLIDES: Slide[] = [
  {
    id: 'slide-1',
    tagline: 'AUTUMN / WINTER 2026',
    title: 'The Modern Monolith',
    subtitle: 'Where timeless Indian craftsmanship meets contemporary structural silhouettes.',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=85',
    primaryCtaText: 'Shop New Arrivals',
    primaryCtaLink: '/products?sort=newest',
    secondaryCtaText: 'Explore Lookbook',
    secondaryCtaLink: '/products?category=women',
    theme: 'dark',
  },
  {
    id: 'slide-2',
    tagline: 'ROYAL HERITAGE EDIT',
    title: 'The Imperial Silk & Linen',
    subtitle: 'Artisanal hand-spun textiles woven with understated modern luxury.',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1920&q=85',
    primaryCtaText: 'Discover Women',
    primaryCtaLink: '/products?category=women',
    secondaryCtaText: 'Discover Men',
    secondaryCtaLink: '/products?category=men',
    theme: 'dark',
  },
  {
    id: 'slide-3',
    tagline: 'BESPOKE TAILORING',
    title: 'Architecture of Form',
    subtitle: 'Sharply tailored trench coats, bandhgalas, and relaxed drape trousers.',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1920&q=85',
    primaryCtaText: 'Shop Menswear',
    primaryCtaLink: '/products?category=men',
    secondaryCtaText: 'View All Collections',
    secondaryCtaLink: '/products',
    theme: 'dark',
  },
]

export default function HeroBanner() {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % HERO_SLIDES.length)
  }

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
  }

  // Auto-advance slides every 6 seconds unless paused
  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % HERO_SLIDES.length)
    }, 6500)
    return () => clearInterval(timer)
  }, [isPaused])

  const slide = HERO_SLIDES[current]

  return (
    <section
      aria-label="Hero Showcase"
      className="relative h-[82vh] min-h-[580px] max-h-[920px] w-full overflow-hidden bg-neutral-950"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Slides */}
      {HERO_SLIDES.map((s, idx) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <Image
            src={s.image}
            alt={s.title}
            fill
            priority={idx === 0}
            className="object-cover object-center filter brightness-[0.78]"
            sizes="100vw"
          />
          {/* Subtle gradient scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/30" />
        </div>
      ))}

      {/* Hero Content Container */}
      <div className="relative z-20 mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-20 sm:px-10 md:pb-28 lg:px-16">
        <div className="max-w-2xl text-left">
          {/* Tagline */}
          <div className="flex items-center gap-2 mb-3">
            <span className="h-px w-8 bg-[#C9A84C]" />
            <span className="font-inter text-xs font-semibold tracking-[0.25em] text-[#C9A84C] uppercase">
              {slide.tagline}
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-white leading-[1.08] mb-4">
            {slide.title}
          </h1>

          {/* Subtitle */}
          <p className="font-inter text-sm sm:text-base text-neutral-300 leading-relaxed font-light mb-8 max-w-lg">
            {slide.subtitle}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={slide.primaryCtaText ? slide.primaryCtaLink : '/products'}
              className="group inline-flex items-center justify-center gap-2 bg-[#FFFFF0] text-neutral-950 px-8 py-3.5 text-xs font-semibold tracking-widest uppercase transition-all duration-200 hover:bg-[#C9A84C] hover:text-white"
            >
              <span>{slide.primaryCtaText}</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href={slide.secondaryCtaLink}
              className="inline-flex items-center justify-center border border-white/60 bg-black/20 backdrop-blur-sm text-white px-8 py-3.5 text-xs font-medium tracking-widest uppercase transition-all duration-200 hover:bg-white hover:text-black hover:border-white"
            >
              {slide.secondaryCtaText}
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 right-6 z-20 flex items-center gap-6 sm:right-12">
        {/* Slide Indicators */}
        <div className="flex items-center gap-2">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Go to slide ${idx + 1}`}
              onClick={() => setCurrent(idx)}
              className={`h-1.5 transition-all duration-300 ${
                idx === current ? 'w-8 bg-[#C9A84C]' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>

        {/* Arrow buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous slide"
            onClick={prevSlide}
            className="flex h-10 w-10 items-center justify-center border border-white/30 bg-black/40 text-white backdrop-blur-sm transition-colors hover:border-white hover:bg-white hover:text-black"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={nextSlide}
            className="flex h-10 w-10 items-center justify-center border border-white/30 bg-black/40 text-white backdrop-blur-sm transition-colors hover:border-white hover:bg-white hover:text-black"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
