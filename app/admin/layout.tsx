'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Ticket,
  Users,
  Settings,
  ExternalLink,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'
import { Toaster } from 'react-hot-toast'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Categories', href: '/admin/categories', icon: Layers },
    { name: 'Coupons', href: '/admin/coupons', icon: Ticket },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Store Settings', href: '/admin/settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col md:flex-row antialiased">
      <Toaster position="top-right" />

      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 bg-stone-950 border-b border-stone-800">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
          <span className="font-serif tracking-widest text-sm font-semibold text-white">
            LUXE ATELIER
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-stone-400 hover:text-white rounded"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-stone-950 border-r border-stone-800 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo / Brand header */}
          <div className="p-6 border-b border-stone-800/80">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-serif text-lg tracking-[0.25em] font-medium text-white uppercase">
                LUXE THREADS
              </span>
            </div>
            <p className="text-[10px] tracking-widest text-stone-400 uppercase mt-1 pl-4">
              Atelier Admin Suite
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href)

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-md text-xs tracking-wider transition-all duration-150 ${
                    isActive
                      ? 'bg-amber-400/10 text-amber-300 font-medium border border-amber-400/30'
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
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-stone-800/80 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between w-full px-3 py-2 text-xs tracking-wider text-stone-400 hover:text-amber-300 hover:bg-stone-900 rounded-md transition-colors"
          >
            <span className="flex items-center space-x-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Online Store</span>
            </span>
          </Link>

          <div className="pt-2 px-3 flex items-center justify-between text-[11px] text-stone-400">
            <span>Server: Active</span>
            <span className="text-emerald-400 font-mono">v1.0.0</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen bg-stone-900 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 md:p-8">{children}</div>
      </main>
    </div>
  )
}
