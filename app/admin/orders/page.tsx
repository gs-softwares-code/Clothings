'use client'

import React, { useState, useEffect } from 'react'
import {
  ShoppingBag,
  Search,
  CheckCircle,
  Clock,
  Truck,
  Package,
  XCircle,
  Eye,
  X,
  CreditCard,
  MapPin,
  Calendar,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatPrice } from '@/lib/utils'

interface OrderItem {
  id: string
  productName: string
  size: string
  color: string
  sku: string
  quantity: number
  price: number
  total: number
}

interface Order {
  id: string
  orderNumber: string
  user?: { name?: string | null; email: string; phone?: string | null } | null
  guestEmail?: string | null
  guestName?: string | null
  guestPhone?: string | null
  shippingAddress?: string | null
  subtotal: number
  discount: number
  shippingCharge: number
  tax: number
  total: number
  couponCode?: string | null
  status: string
  paymentMethod: string
  paymentStatus: string
  paymentId?: string | null
  notes?: string | null
  createdAt: string
  items: OrderItem[]
  address?: {
    name: string
    phone: string
    line1: string
    line2?: string | null
    city: string
    state: string
    pincode: string
  } | null
}

const ORDER_STATUSES = [
  'ALL',
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedStatus !== 'ALL') params.append('status', selectedStatus)
      if (searchQuery.trim()) params.append('search', searchQuery.trim())

      const res = await fetch(`/api/admin/orders?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setOrders(data.data)
      } else {
        toast.error(data.error || 'Failed to load orders')
      }
    } catch {
      toast.error('Error fetching orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders()
    }, 300)
    return () => clearTimeout(timer)
  }, [selectedStatus, searchQuery])

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingId(orderId)
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()

      if (data.success) {
        toast.success(`Order status updated to ${newStatus}`)
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        )
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus })
        }
      } else {
        toast.error(data.error || 'Failed to update order status')
      }
    } catch {
      toast.error('Error updating order status')
    } finally {
      setUpdatingId(null)
    }
  }

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      CONFIRMED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      PROCESSING: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      SHIPPED: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      DELIVERED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      CANCELLED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    }
    return (
      <span
        className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider border font-medium ${
          map[status] || 'bg-stone-800 text-stone-300'
        }`}
      >
        {status}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-stone-800">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-light text-white tracking-wide">
            Acquisitions & Orders
          </h1>
          <p className="text-xs text-stone-400 uppercase tracking-widest mt-1">
            Fulfillment pipeline, patron deliveries & payment reconciliations
          </p>
        </div>
      </div>

      {/* Filter tabs & Search */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {ORDER_STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 text-xs rounded uppercase tracking-wider font-medium whitespace-nowrap transition-colors ${
                selectedStatus === status
                  ? 'bg-amber-400 text-stone-950 shadow-sm'
                  : 'bg-stone-950 text-stone-400 hover:text-white border border-stone-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order number (ORD-...), customer name or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded text-xs text-white placeholder-stone-400 focus:outline-none focus:border-amber-400 transition"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-stone-950/80 rounded-lg border border-stone-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <p className="mt-3 text-xs text-stone-400 uppercase tracking-widest">
              Loading orders...
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <ShoppingBag className="w-10 h-10 text-stone-400 mx-auto" />
            <p className="text-sm text-stone-400">
              No acquisitions found in this status category.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-800 text-stone-400 uppercase tracking-wider text-[10px] bg-stone-900/40">
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Patron Details</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Fulfillment Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {orders.map((order) => {
                  const patronName =
                    order.user?.name || order.guestName || 'Private Patron'
                  const patronEmail =
                    order.user?.email || order.guestEmail || 'Unspecified'

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-stone-900/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-medium text-amber-300">
                        {order.orderNumber}
                      </td>
                      <td className="py-3.5 px-4 text-stone-400 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-white font-medium">{patronName}</div>
                        <div className="text-[10px] text-stone-400">
                          {patronEmail}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-stone-300">
                        {order.items.length}{' '}
                        {order.items.length === 1 ? 'item' : 'items'}
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
                        <select
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(e) =>
                            handleUpdateStatus(order.id, e.target.value)
                          }
                          className="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-[11px] text-amber-300 font-medium focus:outline-none focus:border-amber-400 cursor-pointer disabled:opacity-50"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 text-stone-400 hover:text-amber-300 rounded hover:bg-stone-800 transition"
                          title="View Order Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-stone-950 border border-stone-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-amber-400 font-mono">
                  Order Dossier
                </span>
                <h2 className="text-xl font-serif text-white">
                  {selectedOrder.orderNumber}
                </h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-stone-400 hover:text-white rounded hover:bg-stone-900 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status and Summary row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-stone-900/60 rounded border border-stone-800 text-xs">
              <div>
                <span className="text-stone-400 text-[10px] block uppercase">
                  Status
                </span>
                <span className="font-semibold text-white">
                  {selectedOrder.status}
                </span>
              </div>
              <div>
                <span className="text-stone-400 text-[10px] block uppercase">
                  Payment
                </span>
                <span className="font-semibold text-white">
                  {selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})
                </span>
              </div>
              <div>
                <span className="text-stone-400 text-[10px] block uppercase">
                  Order Date
                </span>
                <span className="font-semibold text-white">
                  {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-stone-400 text-[10px] block uppercase">
                  Total
                </span>
                <span className="font-serif font-bold text-amber-400">
                  {formatPrice(selectedOrder.total)}
                </span>
              </div>
            </div>

            {/* Customer & Shipping info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-stone-900/40 rounded border border-stone-800">
                <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block mb-2">
                  Patron Information
                </span>
                <p className="text-white font-medium">
                  {selectedOrder.user?.name ||
                    selectedOrder.guestName ||
                    'Valued Patron'}
                </p>
                <p className="text-stone-400">
                  {selectedOrder.user?.email || selectedOrder.guestEmail || 'N/A'}
                </p>
                <p className="text-stone-400">
                  {selectedOrder.user?.phone ||
                    selectedOrder.guestPhone ||
                    'No phone recorded'}
                </p>
              </div>

              <div className="p-3 bg-stone-900/40 rounded border border-stone-800">
                <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block mb-2">
                  Delivery Destination
                </span>
                {selectedOrder.address ? (
                  <p className="text-stone-300 leading-relaxed">
                    {selectedOrder.address.name}
                    <br />
                    {selectedOrder.address.line1}
                    {selectedOrder.address.line2 && `, ${selectedOrder.address.line2}`}
                    <br />
                    {selectedOrder.address.city}, {selectedOrder.address.state} -{' '}
                    {selectedOrder.address.pincode}
                    <br />
                    Phone: {selectedOrder.address.phone}
                  </p>
                ) : (
                  <p className="text-stone-400">
                    {selectedOrder.shippingAddress || 'Digital / In-store fulfillment'}
                  </p>
                )}
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
                Acquired Items ({selectedOrder.items.length})
              </span>
              <div className="divide-y divide-stone-800 border border-stone-800 rounded overflow-hidden">
                {selectedOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-stone-900/30 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-medium text-white">{item.productName}</p>
                      <p className="text-[11px] text-stone-400">
                        Size: {item.size} • Color: {item.color} • SKU: {item.sku}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">
                        {item.quantity} × {formatPrice(item.price)}
                      </p>
                      <p className="text-amber-400 font-mono text-[11px]">
                        {formatPrice(item.total)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial breakdown */}
            <div className="p-3 bg-stone-900/50 rounded border border-stone-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-400">
                <span>Subtotal</span>
                <span>{formatPrice(selectedOrder.subtotal)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Coupon Discount ({selectedOrder.couponCode})</span>
                  <span>-{formatPrice(selectedOrder.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-400">
                <span>Shipping & White Glove Handling</span>
                <span>
                  {selectedOrder.shippingCharge === 0
                    ? 'Complimentary'
                    : formatPrice(selectedOrder.shippingCharge)}
                </span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Estimated GST</span>
                <span>{formatPrice(selectedOrder.tax)}</span>
              </div>
              <div className="pt-2 border-t border-stone-800 flex justify-between font-serif text-sm font-semibold text-white">
                <span>Total Settled</span>
                <span className="text-amber-400">
                  {formatPrice(selectedOrder.total)}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs rounded uppercase tracking-wider transition"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
