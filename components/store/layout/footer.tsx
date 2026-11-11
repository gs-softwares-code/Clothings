'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Instagram,
  Facebook,
  Twitter,
  CheckCircle2,
} from 'lucide-react'

export const Footer: React.FC = () => {
  const [email, setEmail] = React.useState('')
  const [subscribed, setSubscribed] = React.useState(false)

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim() && email.includes('@')) {
      setSubscribed(true)
      setEmail('')
    }
  }

  return (
    <footer className="bg-[#141414] text-neutral-300 font-inter border-t border-neutral-800">
      {/* Editorial Value Pillars */}
      <div className="border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="w-12 h-12 rounded-full bg-neutral-800/80 flex items-center justify-center text-[#C9A84C] shrink-0">
                <Truck className="w-5 h-5 stroke-[1.5]" />
              </div>
              <div>
                <h5 className="text-xs font-semibold uppercase tracking-widest text-white">
                  Express Delivery
                </h5>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Complimentary across India on orders over ₹999
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="w-12 h-12 rounded-full bg-neutral-800/80 flex items-center justify-center text-[#C9A84C] shrink-0">
                <RotateCcw className="w-5 h-5 stroke-[1.5]" />
              </div>
              <div>
                <h5 className="text-xs font-semibold uppercase tracking-widest text-white">
                  7-Day Returns
                </h5>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Effortless, complimentary reverse doorstep pickup
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="w-12 h-12 rounded-full bg-neutral-800/80 flex items-center justify-center text-[#C9A84C] shrink-0">
                <Sparkles className="w-5 h-5 stroke-[1.5]" />
              </div>
              <div>
                <h5 className="text-xs font-semibold uppercase tracking-widest text-white">
                  Artisanal Craft
                </h5>
                <p className="text-xs text-neutral-400 mt-0.5">
                  100% authentic weaves certified by master artisans
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="w-12 h-12 rounded-full bg-neutral-800/80 flex items-center justify-center text-[#C9A84C] shrink-0">
                <ShieldCheck className="w-5 h-5 stroke-[1.5]" />
              </div>
              <div>
                <h5 className="text-xs font-semibold uppercase tracking-widest text-white">
                  Secure Checkout
                </h5>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Encrypted Razorpay & COD payment gateways
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Brand Story (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-playfair text-2xl tracking-[0.25em] font-normal text-white uppercase block">
                LUXE THREADS
              </span>
              <span className="block text-[8px] font-inter tracking-[0.45em] text-[#C9A84C] uppercase mt-0.5">
                HAUTE COUTURE • INDIA
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-neutral-400 max-w-sm">
              LUXE THREADS synthesizes India&apos;s centuries-old handloom mastery with
              sharp contemporary international tailoring. Each garment is meticulously
              crafted with pure silk, organic linen, and ethical cotton to honor timeless elegance.
            </p>

            <div className="pt-2">
              <span className="text-[10px] font-inter uppercase tracking-widest text-neutral-400 block mb-3">
                Connect With Us
              </span>
              <div className="flex items-center gap-3">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Twitter"
                  className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Categories Links (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white mb-4">
              Collections
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>
                <Link href="/products?category=women" className="hover:text-white transition-colors">
                  Women&apos;s Couture
                </Link>
              </li>
              <li>
                <Link href="/products?category=men" className="hover:text-white transition-colors">
                  Men&apos;s Tailoring
                </Link>
              </li>
              <li>
                <Link href="/products?category=kids" className="hover:text-white transition-colors">
                  Kids Miniatures
                </Link>
              </li>
              <li>
                <Link href="/products?category=accessories" className="hover:text-white transition-colors">
                  Artisanal Accessories
                </Link>
              </li>
              <li>
                <Link href="/products?sort=newest" className="hover:text-white transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/products?badge=bestseller" className="hover:text-white transition-colors">
                  Best Sellers
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white mb-4">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>
                <Link href="/account/orders" className="hover:text-white transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-white transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-white transition-colors">
                  Shipping & Customs
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-white transition-colors">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="hover:text-white transition-colors">
                  Bespoke Size Guide
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Concierge & Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Signup (4 cols) */}
          <div className="lg:col-span-4">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-white mb-2">
              The Connoisseurs Circle
            </h4>
            <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
              Subscribe to receive private invitations to runway previews, bespoke trunk shows, and
              enjoy <span className="text-[#C9A84C] font-semibold">15% off</span> your inaugural acquisition.
            </p>

            {subscribed ? (
              <div className="p-3 bg-neutral-900 border border-neutral-700 flex items-center gap-2.5 text-xs text-neutral-200">
                <CheckCircle2 className="w-4 h-4 text-[#C9A84C] shrink-0" />
                <span>Welcome to the circle. Check your inbox for your code.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <div className="relative flex">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full bg-neutral-900 border border-neutral-700 px-4 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#C9A84C] transition-colors"
                  />
                  <button
                    type="submit"
                    className="bg-[#C9A84C] text-neutral-950 px-4 py-2.5 hover:bg-[#B8963E] transition-colors flex items-center justify-center shrink-0"
                    aria-label="Subscribe to newsletter"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10px] text-neutral-500">
                  By joining, you consent to our Privacy Policy. Unsubscribe at any time.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright & Payment Badges */}
      <div className="border-t border-neutral-800 bg-[#0F0F0F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <div>
            © {new Date().getFullYear()} LUXE THREADS APPAREL PVT. LTD. All rights reserved.
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[10px] uppercase tracking-wider">
            <span className="px-2 py-1 bg-neutral-900 border border-neutral-800 text-neutral-400">
              Razorpay Secured
            </span>
            <span className="px-2 py-1 bg-neutral-900 border border-neutral-800 text-neutral-400">
              UPI Accepted
            </span>
            <span className="px-2 py-1 bg-neutral-900 border border-neutral-800 text-neutral-400">
              Visa / Mastercard
            </span>
            <span className="px-2 py-1 bg-neutral-900 border border-neutral-800 text-neutral-400">
              Cash on Delivery
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-neutral-300 transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-neutral-300 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
