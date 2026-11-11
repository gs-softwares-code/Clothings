'use client'

import { useState } from 'react'
import { Star, CheckCircle, ChevronLeft, ChevronRight, Quote } from 'lucide-react'

interface ReviewItem {
  id: string
  name: string
  city: string
  productPurchased: string
  rating: number
  headline: string
  comment: string
  date: string
}

const REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    name: 'Ananya Singhania',
    city: 'South Mumbai',
    productPurchased: 'Raw Mulberry Silk Bandhgala',
    rating: 5,
    headline: 'Exquisite silhouette and unparalleled craftsmanship',
    comment:
      'The drape of the raw silk is extraordinary. You can immediately feel the weight and artisanal dignity in every seam. Wore it to a gallery opening and received endless compliments.',
    date: 'October 2026',
  },
  {
    id: 'rev-2',
    name: 'Devraj Oberoi',
    city: 'New Delhi',
    productPurchased: 'Khadi Double-Breasted Suit',
    rating: 5,
    headline: 'Redefining contemporary Indian tailoring',
    comment:
      'I usually get my suits tailored on Savile Row, but this hand-spun piece has an understated nobility that off-the-rack European luxury simply cannot emulate. The fit is immaculate.',
    date: 'November 2026',
  },
  {
    id: 'rev-3',
    name: 'Meera Krishnan',
    city: 'Bengaluru',
    productPurchased: 'Chanderi Gold Zari Anarkali',
    rating: 5,
    headline: 'Like floating on air — pure festive poetry',
    comment:
      'Lightweight, breathable, and the gold zari shimmer is subtle rather than gaudy. Delivery to Bangalore was under 48 hours, packed in sustainable linen garment bags.',
    date: 'October 2026',
  },
  {
    id: 'rev-4',
    name: 'Kabir & Tara Mehta',
    city: 'London / Mumbai',
    productPurchased: 'Pashmina Reversible Cape',
    rating: 5,
    headline: 'Heirloom quality you pass down generations',
    comment:
      'The softness of this Kashmiri pashmina is sublime. Knowing that the artisans are paid fair living wages makes every purchase here deeply fulfilling.',
    date: 'September 2026',
  },
]

export default function CustomerReviews() {
  const [currentIdx, setCurrentIdx] = useState(0)

  const next = () => {
    setCurrentIdx((prev) => (prev + 1) % REVIEWS.length)
  }

  const prev = () => {
    setCurrentIdx((prev) => (prev - 1 + REVIEWS.length) % REVIEWS.length)
  }

  return (
    <section className="py-20 sm:py-28 bg-white border-y border-neutral-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-1.5 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-[#C9A84C] text-[#C9A84C]" />
            ))}
          </div>
          <span className="font-inter text-xs font-semibold tracking-[0.2em] text-[#C9A84C] uppercase block mb-2">
            Verified Patron Testimonials
          </span>
          <h2 className="font-playfair text-3xl sm:text-4xl text-neutral-900 font-normal">
            Voices of Refinement
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-neutral-500 font-light font-inter">
            Rated 4.9/5 by over 2,400+ discerning patrons across India and abroad.
          </p>
        </div>

        {/* Desktop Grid Layout */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {REVIEWS.map((review) => (
            <div
              key={review.id}
              className="flex flex-col justify-between bg-[#FAF9F6] p-6 border border-neutral-200/70 transition-all duration-300 hover:shadow-lg hover:border-neutral-300"
            >
              <div>
                {/* Stars */}
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-[#C9A84C] text-[#C9A84C]" />
                  ))}
                </div>

                <h3 className="font-playfair text-base font-normal text-neutral-900 mb-2 leading-snug">
                  “{review.headline}”
                </h3>

                <p className="font-inter text-xs text-neutral-600 leading-relaxed font-light mb-6">
                  {review.comment}
                </p>
              </div>

              {/* Author footer */}
              <div className="pt-4 border-t border-neutral-200">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-inter text-xs font-medium text-neutral-900 block">
                      {review.name}
                    </span>
                    <span className="font-inter text-[11px] text-neutral-400 block">
                      {review.city}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <CheckCircle className="h-3 w-3" />
                    Verified
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-[#C9A84C] font-inter font-medium truncate">
                  Purchased: {review.productPurchased}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Single Card Carousel */}
        <div className="block md:hidden">
          <div className="relative bg-[#FAF9F6] p-6 border border-neutral-200/80">
            <Quote className="h-8 w-8 text-[#C9A84C]/30 mb-2" />
            <div className="flex items-center gap-1 mb-3">
              {[...Array(REVIEWS[currentIdx].rating)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-[#C9A84C] text-[#C9A84C]" />
              ))}
            </div>
            <h3 className="font-playfair text-lg text-neutral-900 mb-2">
              “{REVIEWS[currentIdx].headline}”
            </h3>
            <p className="font-inter text-xs text-neutral-600 leading-relaxed font-light mb-6">
              {REVIEWS[currentIdx].comment}
            </p>
            <div className="pt-4 border-t border-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-inter text-xs font-medium text-neutral-900 block">
                    {REVIEWS[currentIdx].name}
                  </span>
                  <span className="font-inter text-[11px] text-neutral-400 block">
                    {REVIEWS[currentIdx].city}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <CheckCircle className="h-3 w-3" />
                  Verified
                </div>
              </div>
            </div>
          </div>

          {/* Carousel controls */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              type="button"
              onClick={prev}
              className="flex h-9 w-9 items-center justify-center border border-neutral-300 text-neutral-700 hover:bg-neutral-900 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-inter text-neutral-500">
              {currentIdx + 1} of {REVIEWS.length}
            </span>
            <button
              type="button"
              onClick={next}
              className="flex h-9 w-9 items-center justify-center border border-neutral-300 text-neutral-700 hover:bg-neutral-900 hover:text-white transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>
    </section>
  )
}
