'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  ArrowRight,
  LogOut,
  ShieldAlert,
} from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { useWishlistStore } from '@/store/wishlist-store'
import { cn } from '@/lib/utils'
import { SearchModal } from './search-modal'

interface CategoryNav {
  title: string
  href: string
  featuredImage?: string
  featuredLabel?: string
  subcategories: { name: string; href: string }[]
}

const NAVIGATION_CATEGORIES: CategoryNav[] = [
  {
    title: 'Women',
    href: '/products?category=women',
    featuredLabel: 'The Silk & Chanderi Edit',
    featuredImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500&auto=format&fit=crop&q=80',
    subcategories: [
      { name: 'All Women', href: '/products?category=women' },
      { name: 'Sarees & Drapes', href: '/products?category=women&subcategory=sarees' },
      { name: 'Kurtis & Tunics', href: '/products?category=women&subcategory=kurtis' },
      { name: 'Dresses & Gowns', href: '/products?category=women&subcategory=dresses' },
      { name: 'Co-ord Sets', href: '/products?category=women&subcategory=coord-sets' },
      { name: 'Tops & Blouses', href: '/products?category=women&subcategory=tops' },
      { name: 'Ethnic Festive Wear', href: '/products?category=women&subcategory=ethnic' },
    ],
  },
  {
    title: 'Men',
    href: '/products?category=men',
    featuredLabel: 'Linen & Tailored Silhouettes',
    featuredImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&auto=format&fit=crop&q=80',
    subcategories: [
      { name: 'All Men', href: '/products?category=men' },
      { name: 'Linen & Cotton Shirts', href: '/products?category=men&subcategory=shirts' },
      { name: 'T-Shirts & Polos', href: '/products?category=men&subcategory=t-shirts' },
      { name: 'Trousers & Chinos', href: '/products?category=men&subcategory=trousers' },
      { name: 'Nehru Jackets & Blazers', href: '/products?category=men&subcategory=jackets' },
      { name: 'Ethnic Kurta Sets', href: '/products?category=men&subcategory=ethnic' },
      { name: 'Jeans & Denim', href: '/products?category=men&subcategory=jeans' },
    ],
  },
  {
    title: 'Kids',
    href: '/products?category=kids',
    featuredLabel: 'Little Connoisseurs Collection',
    featuredImage: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=500&auto=format&fit=crop&q=80',
    subcategories: [
      { name: 'All Kids', href: '/products?category=kids' },
      { name: "Boys' Shirts & Kurtas", href: '/products?category=kids&gender=boys' },
      { name: "Girls' Dresses & Lehengas", href: '/products?category=kids&gender=girls' },
      { name: 'Baby Luxury Essentials', href: '/products?category=kids&age=baby' },
      { name: 'Festive Miniatures', href: '/products?category=kids&tag=festive' },
    ],
  },
  {
    title: 'Accessories',
    href: '/products?category=accessories',
    featuredLabel: 'Handcrafted Leather & Silk Accents',
    featuredImage: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500&auto=format&fit=crop&q=80',
    subcategories: [
      { name: 'All Accessories', href: '/products?category=accessories' },
      { name: 'Artisanal Leather Bags', href: '/products?category=accessories&type=bags' },
      { name: 'Wallets & Cardholders', href: '/products?category=accessories&type=wallets' },
      { name: 'Belts & Buckles', href: '/products?category=accessories&type=belts' },
      { name: 'Caps & Headwear', href: '/products?category=accessories&type=caps' },
      { name: 'Jewelry & Cufflinks', href: '/products?category=accessories&type=jewelry' },
    ],
  },
]

export const Navbar: React.FC = () => {
  const pathname = usePathname()
  const { openCart, getItemCount } = useCartStore()
  const { getItemCount: getWishlistCount } = useWishlistStore()

  const [isScrolled, setIsScrolled] = React.useState(false)
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null)
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = React.useState(false)
  const [activeMobileCategory, setActiveMobileCategory] = React.useState<string | null>(null)

  // Resilient session state
  const [user, setUser] = React.useState<{
    name?: string | null
    email?: string | null
    role?: string
  } | null>(null)

  React.useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user)
      })
      .catch(() => {})
  }, [pathname])

  // Scroll detection for sticky navbar
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close menus on route change
  React.useEffect(() => {
    setIsMobileMenuOpen(false)
    setActiveDropdown(null)
    setIsAccountMenuOpen(false)
  }, [pathname])

  const cartItemCount = getItemCount()
  const wishlistItemCount = getWishlistCount()

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
      setUser(null)
      window.location.href = '/'
    } catch {
      window.location.href = '/api/auth/signout'
    }
  }

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md transition-all duration-300',
          isScrolled
            ? 'shadow-[0_4px_20px_rgba(0,0,0,0.04)] border-b border-neutral-100 py-3'
            : 'border-b border-neutral-100 py-4'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -ml-2 text-neutral-800 hover:text-black transition-colors"
                aria-label="Open mobile menu"
              >
                <Menu className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>

            {/* Desktop Navigation Links (Left) */}
            <nav className="hidden lg:flex items-center gap-7">
              {NAVIGATION_CATEGORIES.map((cat) => (
                <div
                  key={cat.title}
                  className="relative group"
                  onMouseEnter={() => setActiveDropdown(cat.title)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={cat.href}
                    className={cn(
                      'text-xs font-inter uppercase tracking-[0.18em] font-medium transition-colors py-2 flex items-center gap-1',
                      pathname.includes(cat.href.split('?')[0])
                        ? 'text-neutral-900 font-semibold'
                        : 'text-neutral-600 hover:text-neutral-900'
                    )}
                  >
                    <span>{cat.title}</span>
                    <ChevronDown className="w-3 h-3 text-neutral-400 group-hover:rotate-180 transition-transform duration-200" />
                  </Link>

                  {/* Mega Menu Dropdown */}
                  {activeDropdown === cat.title && (
                    <div className="absolute left-0 top-full pt-2 w-[460px] animate-fade-in z-50">
                      <div className="bg-white border border-neutral-100 shadow-xl p-6 grid grid-cols-2 gap-6">
                        <div>
                          <div className="text-[10px] font-inter uppercase tracking-widest text-[#C9A84C] font-semibold mb-3">
                            Collections
                          </div>
                          <ul className="space-y-2.5">
                            {cat.subcategories.map((sub) => (
                              <li key={sub.name}>
                                <Link
                                  href={sub.href}
                                  className="text-xs font-inter text-neutral-700 hover:text-neutral-950 transition-colors hover:translate-x-0.5 inline-block"
                                >
                                  {sub.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Featured Editorial Card */}
                        {cat.featuredImage && (
                          <div className="relative overflow-hidden bg-neutral-100 flex flex-col justify-end p-4 group/card">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={cat.featuredImage}
                              alt={cat.featuredLabel || cat.title}
                              className="absolute inset-0 w-full h-full object-cover object-center group-hover/card:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            <div className="relative z-10 text-white">
                              <span className="text-[9px] font-inter uppercase tracking-widest text-[#F7E7CE]">
                                Featured
                              </span>
                              <p className="text-xs font-playfair font-medium mt-0.5">
                                {cat.featuredLabel}
                              </p>
                              <Link
                                href={cat.href}
                                className="text-[10px] font-inter uppercase tracking-wider text-white/90 hover:text-white flex items-center gap-1 mt-2 underline"
                              >
                                <span>Discover</span>
                                <ArrowRight className="w-2.5 h-2.5" />
                              </Link>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <Link
                href="/products?sort=newest"
                className="text-xs font-inter uppercase tracking-[0.18em] font-medium text-neutral-600 hover:text-neutral-900 transition-colors py-2"
              >
                New In
              </Link>

              <Link
                href="/products?badge=sale"
                className="text-xs font-inter uppercase tracking-[0.18em] font-medium text-rose-700 hover:text-rose-800 transition-colors py-2 flex items-center gap-1"
              >
                <span>The Edit</span>
                <Sparkles className="w-2.5 h-2.5 text-[#C9A84C]" />
              </Link>
            </nav>

            {/* Brand Logo (Center) */}
            <div className="text-center">
              <Link
                href="/"
                className="inline-block group focus:outline-none"
                aria-label="Luxe Threads Homepage"
              >
                <span className="font-playfair text-xl sm:text-2xl lg:text-3xl tracking-[0.25em] font-medium text-neutral-950 uppercase block transition-opacity group-hover:opacity-90">
                  LUXE THREADS
                </span>
                <span className="block text-[8px] sm:text-[9px] font-inter tracking-[0.45em] text-[#C9A84C] uppercase -mt-1 font-semibold">
                  HAUTE COUTURE • INDIA
                </span>
              </Link>
            </div>

            {/* Action Icons (Right) */}
            <div className="flex items-center gap-1 sm:gap-3">
              {/* Search Icon */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-neutral-700 hover:text-neutral-950 transition-colors rounded-full hover:bg-neutral-50"
                aria-label="Search catalog"
              >
                <Search className="w-5 h-5 stroke-[1.5]" />
              </button>

              {/* Wishlist Icon */}
              <Link
                href="/account/wishlist"
                className="relative p-2 text-neutral-700 hover:text-neutral-950 transition-colors rounded-full hover:bg-neutral-50"
                aria-label="View Wishlist"
              >
                <Heart className="w-5 h-5 stroke-[1.5]" />
                {wishlistItemCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#C9A84C] text-white text-[9px] font-inter font-bold rounded-full flex items-center justify-center">
                    {wishlistItemCount}
                  </span>
                )}
              </Link>

              {/* Shopping Bag Icon */}
              <button
                type="button"
                onClick={openCart}
                className="relative p-2 text-neutral-700 hover:text-neutral-950 transition-colors rounded-full hover:bg-neutral-50"
                aria-label="Open Shopping Bag"
              >
                <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
                {cartItemCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#1A1A1A] text-white text-[9px] font-inter font-bold rounded-full flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>

              {/* Account Dropdown Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                  className="p-2 text-neutral-700 hover:text-neutral-950 transition-colors rounded-full hover:bg-neutral-50"
                  aria-label="Account options"
                >
                  <User className="w-5 h-5 stroke-[1.5]" />
                </button>

                {isAccountMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsAccountMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-neutral-100 shadow-xl py-2 z-50 animate-slide-up">
                      {user ? (
                        <div className="px-4 py-2 border-b border-neutral-100">
                          <p className="text-xs font-inter font-medium text-neutral-900 truncate">
                            {user.name || 'Valued Member'}
                          </p>
                          <p className="text-[10px] text-neutral-500 font-inter truncate">
                            {user.email}
                          </p>
                        </div>
                      ) : (
                        <div className="px-4 py-2 border-b border-neutral-100">
                          <p className="text-xs font-inter font-medium text-neutral-900">
                            Welcome to Luxe Threads
                          </p>
                          <div className="mt-2 flex gap-2">
                            <Link
                              href="/auth/login"
                              className="text-xs font-inter font-semibold text-neutral-900 hover:underline"
                            >
                              Sign In
                            </Link>
                            <span className="text-neutral-300">|</span>
                            <Link
                              href="/auth/register"
                              className="text-xs font-inter font-semibold text-[#C9A84C] hover:underline"
                            >
                              Register
                            </Link>
                          </div>
                        </div>
                      )}

                      <div className="py-1">
                        <Link
                          href="/account"
                          className="block px-4 py-2 text-xs font-inter text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950"
                        >
                          Account Dashboard
                        </Link>
                        <Link
                          href="/account/orders"
                          className="block px-4 py-2 text-xs font-inter text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950"
                        >
                          Order History
                        </Link>
                        <Link
                          href="/account/addresses"
                          className="block px-4 py-2 text-xs font-inter text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950"
                        >
                          Saved Addresses
                        </Link>
                        <Link
                          href="/account/wishlist"
                          className="block px-4 py-2 text-xs font-inter text-neutral-700 hover:bg-neutral-50 hover:text-neutral-950"
                        >
                          My Wishlist ({wishlistItemCount})
                        </Link>

                        {/* Admin Link if admin */}
                        {user?.role === 'ADMIN' && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-1.5 px-4 py-2 text-xs font-inter text-[#C9A84C] font-semibold hover:bg-neutral-50"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Admin Portal</span>
                          </Link>
                        )}
                      </div>

                      {user && (
                        <div className="border-t border-neutral-100 pt-1">
                          <button
                            onClick={handleSignOut}
                            type="button"
                            className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-inter text-rose-700 hover:bg-neutral-50"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex lg:hidden"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-up overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-neutral-100">
              <span className="font-playfair tracking-widest text-lg font-medium text-neutral-900">
                LUXE THREADS
              </span>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 text-neutral-500 hover:text-neutral-900"
              >
                <X className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>

            <div className="p-5 flex-1">
              {/* Category Accordion */}
              <div className="space-y-4">
                {NAVIGATION_CATEGORIES.map((cat) => (
                  <div key={cat.title} className="border-b border-neutral-100 pb-3">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveMobileCategory(
                          activeMobileCategory === cat.title ? null : cat.title
                        )
                      }
                      className="w-full flex items-center justify-between text-sm font-inter uppercase tracking-wider font-medium text-neutral-900"
                    >
                      <span>{cat.title}</span>
                      <ChevronDown
                        className={cn(
                          'w-4 h-4 text-neutral-400 transition-transform duration-200',
                          activeMobileCategory === cat.title && 'rotate-180'
                        )}
                      />
                    </button>

                    {activeMobileCategory === cat.title && (
                      <ul className="mt-3 pl-3 space-y-2.5">
                        {cat.subcategories.map((sub) => (
                          <li key={sub.name}>
                            <Link
                              href={sub.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="text-xs font-inter text-neutral-600 hover:text-neutral-900 block"
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}

                <div className="pt-2">
                  <Link
                    href="/products?sort=newest"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-sm font-inter uppercase tracking-wider font-medium text-neutral-900 py-2"
                  >
                    New Arrivals
                  </Link>
                  <Link
                    href="/products?badge=sale"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-sm font-inter uppercase tracking-wider font-medium text-rose-700 py-2"
                  >
                    Sale / The Edit
                  </Link>
                </div>
              </div>

              {/* Account Quick Links */}
              <div className="mt-8 pt-6 border-t border-neutral-100 space-y-3">
                <Link
                  href="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-xs font-inter text-neutral-700"
                >
                  <User className="w-4 h-4" />
                  <span>{user ? `Account (${user.name || user.email})` : 'Sign In / Register'}</span>
                </Link>
                <Link
                  href="/account/wishlist"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-xs font-inter text-neutral-700"
                >
                  <Heart className="w-4 h-4" />
                  <span>Wishlist ({wishlistItemCount})</span>
                </Link>
              </div>
            </div>

            {/* Bottom info */}
            <div className="p-5 border-t border-neutral-100 bg-neutral-50 text-[11px] font-inter text-neutral-500">
              <p>Currency: INR (₹) — Free shipping over ₹999</p>
              <p className="mt-1">Concierge: +91 98765 43210</p>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  )
}

export default Navbar
