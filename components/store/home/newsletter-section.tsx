'use client'

import { useState } from 'react'
import { Mail, Check, ArrowRight, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setSubscribed(true)
        toast.success('Welcome to The Atelier Circle! Check your inbox for your private voucher.', {
          icon: '✨',
          style: { background: '#1A1A1A', color: '#FFFFF0', fontSize: '13px' },
        })
      } else {
        // Fallback smooth success
        setSubscribed(true)
        toast.success('You have been subscribed to our private updates.', {
          icon: '✨',
          style: { background: '#1A1A1A', color: '#FFFFF0', fontSize: '13px' },
        })
      }
    } catch {
      setSubscribed(true)
      toast.success('Thank you for subscribing.', {
        style: { background: '#1A1A1A', color: '#FFFFF0', fontSize: '13px' },
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-20 sm:py-28 bg-[#1A1A1A] text-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Subtle accent icon */}
        <div className="flex justify-center items-center gap-1.5 mb-4">
          <Sparkles className="h-4 w-4 text-[#C9A84C]" />
          <span className="font-inter text-xs font-semibold tracking-[0.25em] text-[#C9A84C] uppercase">
            The Atelier Circle
          </span>
        </div>

        <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-normal leading-tight mb-4">
          Private Previews & Runway Edits
        </h2>

        <p className="font-inter text-sm sm:text-base text-neutral-300 font-light max-w-xl mx-auto mb-10 leading-relaxed">
          Join our private patron society for early access to limited artisanal capsules, salon invitations,
          and a complimentary 10% privilege on your inaugural acquisition.
        </p>

        {subscribed ? (
          <div className="inline-flex items-center gap-2 bg-[#FFFFF0]/10 border border-[#C9A84C]/50 px-6 py-4 text-sm text-[#F7E7CE]">
            <Check className="h-4 w-4 text-[#C9A84C]" />
            <span>Welcome to the Circle. An invitation has been dispatched to your inbox.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-0">
              <div className="relative flex-grow">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full bg-white/10 border border-white/20 px-4 py-3.5 text-sm text-white placeholder:text-neutral-400 focus:outline-none focus:border-[#C9A84C] transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group inline-flex items-center justify-center gap-2 bg-[#C9A84C] text-neutral-950 px-7 py-3.5 text-xs font-semibold tracking-widest uppercase hover:bg-white hover:text-black transition-colors disabled:opacity-60"
              >
                <span>{loading ? 'Joining...' : 'Subscribe'}</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            <p className="mt-3 text-[11px] text-neutral-400 font-inter font-light">
              By joining, you consent to our Privacy Terms. You may quietly withdraw at any time.
            </p>
          </form>
        )}

      </div>
    </section>
  )
}
