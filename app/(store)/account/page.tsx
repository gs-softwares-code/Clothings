import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { formatPrice } from '@/lib/utils'
import {
  ShoppingBag,
  MapPin,
  Heart,
  ArrowRight,
  ShieldCheck,
  Clock,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AccountOverviewPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/login?callbackUrl=/account')
  }

  const [user, orders, addressesCount, wishlistCount] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
      },
    }),
    db.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: {
        items: true,
      },
    }),
    db.address.count({
      where: { userId: session.user.id },
    }),
    db.wishlistItem.count({
      where: { userId: session.user.id },
    }),
  ])

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-stone-900/50 rounded-lg border border-stone-800">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs tracking-wider uppercase font-medium">
              Orders Placed
            </span>
            <ShoppingBag className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-serif text-white font-medium">
            {orders.length}
          </div>
          <Link
            href="/account/orders"
            className="text-[11px] text-amber-400 hover:underline mt-2 inline-flex items-center"
          >
            <span>View all acquisitions</span>
            <ArrowRight className="w-3 h-3 ml-1" />
          </Link>
        </div>

        <div className="p-5 bg-stone-900/50 rounded-lg border border-stone-800">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs tracking-wider uppercase font-medium">
              Saved Addresses
            </span>
            <MapPin className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-serif text-white font-medium">
            {addressesCount}
          </div>
          <Link
            href="/account/addresses"
            className="text-[11px] text-amber-400 hover:underline mt-2 inline-flex items-center"
          >
            <span>Manage delivery coordinates</span>
            <ArrowRight className="w-3 h-3 ml-1" />
          </Link>
        </div>

        <div className="p-5 bg-stone-900/50 rounded-lg border border-stone-800">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs tracking-wider uppercase font-medium">
              Wishlist Items
            </span>
            <Heart className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-serif text-white font-medium">
            {wishlistCount}
          </div>
          <Link
            href="/account/wishlist"
            className="text-[11px] text-amber-400 hover:underline mt-2 inline-flex items-center"
          >
            <span>View saved garments</span>
            <ArrowRight className="w-3 h-3 ml-1" />
          </Link>
        </div>
      </div>

      {/* Patron Profile Details */}
      <div className="p-6 bg-stone-900/50 rounded-lg border border-stone-800 space-y-4">
        <h2 className="text-sm font-semibold tracking-wider uppercase text-stone-200 pb-3 border-b border-stone-800">
          Personal Dossier
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-stone-400 block text-[10px] uppercase tracking-wider">
              Patron Name
            </span>
            <p className="text-white font-medium mt-0.5">{user?.name || 'Not provided'}</p>
          </div>
          <div>
            <span className="text-stone-400 block text-[10px] uppercase tracking-wider">
              Primary Email
            </span>
            <p className="text-white font-medium mt-0.5">{user?.email}</p>
          </div>
          <div>
            <span className="text-stone-400 block text-[10px] uppercase tracking-wider">
              Telephone
            </span>
            <p className="text-white font-medium mt-0.5">{user?.phone || 'Not registered'}</p>
          </div>
          <div>
            <span className="text-stone-400 block text-[10px] uppercase tracking-wider">
              Member Since
            </span>
            <p className="text-white font-medium mt-0.5">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                    month: 'long',
                    year: 'numeric',
                  })
                : 'Maison Founding'}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="p-6 bg-stone-900/50 rounded-lg border border-stone-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <h2 className="text-sm font-semibold tracking-wider uppercase text-stone-200">
            Recent Haute Couture Orders
          </h2>
          <Link
            href="/account/orders"
            className="text-xs text-amber-400 hover:underline flex items-center"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="py-8 text-center text-xs text-stone-400">
            You have not placed any orders yet. Discover our latest collections.
          </div>
        ) : (
          <div className="divide-y divide-stone-800/80">
            {orders.map((order) => (
              <div
                key={order.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-medium text-amber-300">
                      {order.orderNumber}
                    </span>
                    <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
                      {order.status}
                    </span>
                  </div>
                  <p className="text-stone-400 text-[11px] mt-1">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'} •{' '}
                    Placed on{' '}
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end sm:space-x-4">
                  <div className="font-serif font-medium text-white text-sm">
                    {formatPrice(order.total)}
                  </div>
                  <Link
                    href={`/order-confirmation/${order.orderNumber}`}
                    className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded text-xs transition border border-stone-700"
                  >
                    View Receipt
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
