'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  User,
  ShoppingBag,
  MapPin,
  Heart,
  LogOut,
  ChevronRight,
  Shield,
} from 'lucide-react'

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { data: session } = useSession()

  const navLinks = [
    { name: 'Profile Overview', href: '/account', icon: User },
    { name: 'Order History', href: '/account/orders', icon: ShoppingBag },
    { name: 'Shipping Addresses', href: '/account/addresses', icon: MapPin },
    { name: 'Wardrobe Wishlist', href: '/account/wishlist', icon: Heart },
  ]

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Account Header */}
        <div className="pb-8 mb-8 border-b border-stone-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-amber-400 font-mono">
              Patron Suite
            </span>
            <h1 className="font-serif text-3xl font-light text-white tracking-wide mt-1">
              Welcome, {session?.user?.name || 'Valued Patron'}
            </h1>
            <p className="text-xs text-stone-400 tracking-wider mt-0.5">
              {session?.user?.email || 'Maison Member'}
            </p>
          </div>

          {session?.user?.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 border border-amber-400/30 text-amber-300 text-xs rounded transition uppercase tracking-wider self-start md:self-auto"
            >
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Enter Admin Suite</span>
            </Link>
          )}
        </div>

        {/* Content with Sidebar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Nav */}
          <div className="md:col-span-1 space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-3 rounded text-xs tracking-wider transition-colors ${
                    isActive
                      ? 'bg-amber-400/10 text-amber-300 font-medium border border-amber-400/20'
                      : 'text-stone-400 hover:text-white hover:bg-stone-900/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-amber-400' : 'text-stone-400'
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-amber-400" />}
                </Link>
              )
            })}

            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center space-x-3 w-full px-4 py-3 rounded text-xs tracking-wider text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors mt-4"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Main Display Area */}
          <div className="md:col-span-3">{children}</div>
        </div>
      </div>
    </div>
  )
}
