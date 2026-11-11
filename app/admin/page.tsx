import React from 'react'
import Link from 'next/link'
import { db } from '@/lib/db'
import { formatPrice } from '@/lib/utils'
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  ArrowUpRight,
  PlusCircle,
  Ticket,
  Sliders,
  TrendingUp,
  Clock,
  AlertTriangle,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  // Fetch overview stats
  const [
    ordersCount,
    productsCount,
    usersCount,
    recentOrders,
    allOrders,
    lowStockVariants,
  ] = await Promise.all([
    db.order.count(),
    db.product.count(),
    db.user.count({ where: { role: 'CUSTOMER' } }),
    db.order.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        items: true,
      },
    }),
    db.order.findMany({
      where: {
        status: { not: 'CANCELLED' },
      },
      select: { total: true },
    }),
    db.productVariant.findMany({
      where: { stock: { lte: 5 } },
      include: { product: true },
      take: 5,
    }),
  ])

  const totalRevenue = allOrders.reduce((sum, order) => sum + (order.total || 0), 0)

  const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    CONFIRMED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    PROCESSING: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    SHIPPED: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    DELIVERED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    CANCELLED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-stone-800">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-light tracking-wide text-white">
            Atelier Executive Overview
          </h1>
          <p className="text-xs text-stone-400 tracking-wider mt-1 uppercase">
            Performance metrics, transactions & inventory monitoring
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-medium tracking-wider uppercase rounded transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Product</span>
          </Link>
          <Link
            href="/admin/orders"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium tracking-wider uppercase rounded transition-colors border border-stone-700"
          >
            <span>Orders Board</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="p-6 bg-stone-950/80 rounded-lg border border-stone-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs tracking-wider uppercase font-medium">
              Gross Revenue
            </span>
            <span className="p-2 bg-amber-400/10 rounded-full text-amber-400">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-serif text-white font-medium">
            {formatPrice(totalRevenue)}
          </div>
          <div className="mt-2 flex items-center text-[11px] text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            <span>Active transactions verified</span>
          </div>
        </div>

        {/* Orders Count */}
        <div className="p-6 bg-stone-950/80 rounded-lg border border-stone-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs tracking-wider uppercase font-medium">
              Total Orders
            </span>
            <span className="p-2 bg-blue-400/10 rounded-full text-blue-400">
              <ShoppingBag className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-serif text-white font-medium">
            {ordersCount}
          </div>
          <div className="mt-2 flex items-center text-[11px] text-stone-400">
            <Clock className="w-3.5 h-3.5 mr-1 text-stone-500" />
            <span>Across all sales channels</span>
          </div>
        </div>

        {/* Products Count */}
        <div className="p-6 bg-stone-950/80 rounded-lg border border-stone-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs tracking-wider uppercase font-medium">
              Couture Catalog
            </span>
            <span className="p-2 bg-purple-400/10 rounded-full text-purple-400">
              <Package className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-serif text-white font-medium">
            {productsCount}
          </div>
          <div className="mt-2 flex items-center text-[11px] text-stone-400">
            <span>Live curated items</span>
          </div>
        </div>

        {/* Registered Patrons */}
        <div className="p-6 bg-stone-950/80 rounded-lg border border-stone-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs tracking-wider uppercase font-medium">
              Clientele Base
            </span>
            <span className="p-2 bg-emerald-400/10 rounded-full text-emerald-400">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-serif text-white font-medium">
            {usersCount}
          </div>
          <div className="mt-2 flex items-center text-[11px] text-stone-400">
            <span>Registered customer accounts</span>
          </div>
        </div>
      </div>

      {/* Quick Launchpad & Low Stock Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions Panel */}
        <div className="p-6 bg-stone-950/80 rounded-lg border border-stone-800 space-y-4">
          <h2 className="text-sm font-medium tracking-wider uppercase text-stone-300">
            Atelier Command Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/admin/products/new"
              className="p-3 bg-stone-900 hover:bg-stone-850 rounded border border-stone-800 hover:border-amber-400/40 text-stone-300 hover:text-white transition group flex flex-col justify-between"
            >
              <PlusCircle className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium">Add Product</span>
            </Link>
            <Link
              href="/admin/orders"
              className="p-3 bg-stone-900 hover:bg-stone-850 rounded border border-stone-800 hover:border-amber-400/40 text-stone-300 hover:text-white transition group flex flex-col justify-between"
            >
              <ShoppingBag className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium">Manage Orders</span>
            </Link>
            <Link
              href="/admin/coupons"
              className="p-3 bg-stone-900 hover:bg-stone-850 rounded border border-stone-800 hover:border-amber-400/40 text-stone-300 hover:text-white transition group flex flex-col justify-between"
            >
              <Ticket className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium">Coupons</span>
            </Link>
            <Link
              href="/admin/settings"
              className="p-3 bg-stone-900 hover:bg-stone-850 rounded border border-stone-800 hover:border-amber-400/40 text-stone-300 hover:text-white transition group flex flex-col justify-between"
            >
              <Sliders className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-medium">Store Config</span>
            </Link>
          </div>
        </div>

        {/* Low Stock Watch */}
        <div className="lg:col-span-2 p-6 bg-stone-950/80 rounded-lg border border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium tracking-wider uppercase text-stone-300 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Low Inventory Watch</span>
            </h2>
            <Link
              href="/admin/products"
              className="text-xs text-amber-400 hover:underline flex items-center"
            >
              <span>View catalog</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          {lowStockVariants.length === 0 ? (
            <p className="text-xs text-stone-400 py-4">
              All product variants maintain healthy inventory levels.
            </p>
          ) : (
            <div className="divide-y divide-stone-800">
              {lowStockVariants.map((v) => (
                <div
                  key={v.id}
                  className="py-2.5 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-medium text-white">{v.product.name}</span>
                    <span className="text-stone-400 ml-2">
                      ({v.size} / {v.color})
                    </span>
                    <span className="text-[10px] text-stone-400 block font-mono">
                      SKU: {v.sku}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                      v.stock === 0
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {v.stock} units left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="p-6 bg-stone-950/80 rounded-lg border border-stone-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div>
            <h2 className="font-serif text-lg text-white font-normal">
              Recent Haute Couture Acquisitions
            </h2>
            <p className="text-xs text-stone-400 tracking-wider">
              Latest patron orders awaiting fulfillment or processing
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs text-amber-400 hover:underline flex items-center"
          >
            <span>All orders</span>
            <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-12 text-center text-stone-400 text-xs">
            No orders placed yet. Orders will automatically appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-800 text-stone-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Patron</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {recentOrders.map((order) => {
                  const customerName =
                    order.user?.name || order.guestName || 'Valued Patron'
                  const customerEmail =
                    order.user?.email || order.guestEmail || 'N/A'

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-stone-900/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-medium text-amber-300">
                        {order.orderNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-white font-medium">{customerName}</div>
                        <div className="text-[10px] text-stone-400">
                          {customerEmail}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-stone-300">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-white">
                        {formatPrice(order.total)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="uppercase text-[10px] px-2 py-0.5 rounded bg-stone-900 text-stone-300 border border-stone-700">
                          {order.paymentMethod} • {order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase tracking-wider border font-medium ${
                            statusColors[order.status] ||
                            'bg-stone-800 text-stone-300 border-stone-700'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-400">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/orders?search=${order.orderNumber}`}
                          className="text-amber-400 hover:text-amber-300 text-xs hover:underline"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
