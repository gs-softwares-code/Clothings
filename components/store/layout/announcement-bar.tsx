'use client'

import * as React from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'

const ANNOUNCEMENTS = [
  {
    text: 'Complimentary Express Delivery on orders over ₹999 | Use code',
    highlight: 'LUXE15',
    link: '/products',
  },
  {
    text: 'The Spring Couture Edit is Live | Explore the New Collection',
    highlight: 'SHOP NOW',
    link: '/products?sort=newest',
  },
  {
    text: 'Handcrafted Heritage — Ethically Woven Indian Luxury',
    highlight: 'OUR STORY',
    link: '/story',
  },
]

export const AnnouncementBar: React.FC = () => {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [isVisible, setIsVisible] = React.useState(true)

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  if (!isVisible) return null

  const current = ANNOUNCEMENTS[currentIndex]

  return (
    <div className="bg-[#1A1A1A] text-white border-b border-neutral-800 text-[11px] sm:text-xs font-inter tracking-widest uppercase transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between">
        {/* Left spacer or store contact */}
        <div className="hidden lg:flex items-center gap-4 text-neutral-400 text-[10px]">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#C9A84C]" />
            CONCIERGE: +91 98765 43210
          </span>
        </div>

        {/* Center: Rotating announcements */}
        <div className="flex-1 flex items-center justify-center gap-3 text-center">
          <button
            onClick={() =>
              setCurrentIndex((prev) => (prev - 1 + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length)
            }
            aria-label="Previous announcement"
            className="text-neutral-400 hover:text-white transition-colors p-0.5"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <div className="min-h-[18px] flex items-center justify-center overflow-hidden">
            <Link
              href={current.link}
              className="hover:underline flex items-center gap-1.5 text-neutral-200 transition-opacity duration-300"
            >
              <span>{current.text}</span>
              {current.highlight && (
                <span className="font-semibold text-[#C9A84C] underline underline-offset-2">
                  {current.highlight}
                </span>
              )}
            </Link>
          </div>

          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length)}
            aria-label="Next announcement"
            className="text-neutral-400 hover:text-white transition-colors p-0.5"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Currency / Language info */}
        <div className="hidden lg:flex items-center gap-4 text-neutral-400 text-[10px]">
          <span>INDIA (INR ₹)</span>
          <span>•</span>
          <Link href="/account" className="hover:text-white transition-colors">
            TRACK ORDER
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AnnouncementBar
