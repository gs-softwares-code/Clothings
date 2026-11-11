'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  RotateCcw,
  X,
  ExternalLink,
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { formatPrice } from '@/lib/utils'

interface OrderItem {
  id: string
  productName: string
  size: string
  color: string
  quantity: number
  price: number
  total: number
}

interface ReturnRecord {
  id: string
  reason: string
  status: string
  createdAt: string
}

interface Order {
  id: string
  orderNumber: string
  subtotal: number
  discount: number
  shippingCharge: number
  total: number
  status: string
  paymentMethod: string
  paymentStatus: string
  createdAt: string
  items: OrderItem[]
  returns?: ReturnRecord[]
}

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  // Return modal
  const [returnOrderId, setReturnOrderId] = useState<string | null>(null)
  const [returnReason, setReturnReason] = useState('')
  const [submittingReturn, setSubmittingReturn] = useState(false)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/orders')
      const data = await res.json()
      if (data.success) {
        setOrders(data.data)
      } else {
        // Fallback or guest
      }
    } catch {
      // toast error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!returnOrderId || !returnReason.trim()) return

    try {
      setSubmittingReturn(true)
      const res = await fetch(`/api/orders/${returnOrderId}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: returnReason.trim() }),
      })
      const data = await res.json()

      if (data.success) {
        toast.success('Return inquiry lodged. Atelier concierge will contact you.')
        setReturnOrderId(null)
        setReturnReason('')
        fetchOrders()
      } else {
        toast.error(data.error || 'Failed to submit return request')
      }
    } catch {
      toast.error('Error submitting return request')
    } finally {
      setSubmittingReturn(false)
    }
  }

  const getStatusBadge = (status: string) => {
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
      <Toaster position="top-right" />

      <div className="pb-4 border-b border-stone-800">
        <h2 className="font-serif text-2xl font-light text-white tracking-wide">
          Acquisitions History
        </h2>
        <p className="text-xs text-stone-400 uppercase tracking-widest mt-1">
          Review your couture acquisitions, delivery status, and returns
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center p-8 bg-stone-900/40 rounded-lg border border-stone-800 space-y-3">
          <ShoppingBag className="w-10 h-10 text-stone-400 mx-auto" />
          <p className="text-sm text-stone-300">
            No acquisitions recorded in your dossier.
          </p>
          <Link
            href="/products"
            className="inline-block px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-semibold uppercase tracking-wider rounded transition"
          >
            Explore Collections
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const hasReturn = order.returns && order.returns.length > 0

            return (
              <div
                key={order.id}
                className="bg-stone-900/40 rounded-lg border border-stone-800 overflow-hidden"
              >
                {/* Order Top Bar */}
                <div className="p-4 sm:p-5 bg-stone-900/80 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-medium text-amber-300 text-sm">
                      {order.orderNumber}
                    </span>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="flex items-center space-x-4 text-stone-400 text-[11px]">
                    <span>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="font-serif text-white font-medium text-sm">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="p-4 sm:p-5 divide-y divide-stone-800/60">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-medium text-white">{item.productName}</p>
                        <p className="text-[11px] text-stone-400">
                          Size: {item.size} • Color: {item.color} • Qty:{' '}
                          {item.quantity}
                        </p>
                      </div>
                      <div className="font-mono text-amber-300 font-medium">
                        {formatPrice(item.total)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions & Return info */}
                <div className="px-4 sm:px-5 py-3.5 bg-stone-950/60 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    {hasReturn ? (
                      <span className="text-[11px] text-amber-400 inline-flex items-center space-x-1">
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Return inquiry lodged ({order.returns![0].status})</span>
                      </span>
                    ) : order.status === 'DELIVERED' ? (
                      <button
                        onClick={() => setReturnOrderId(order.id)}
                        className="text-[11px] text-stone-400 hover:text-amber-300 inline-flex items-center space-x-1 transition"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Initiate Return</span>
                      </button>
                    ) : null}
                  </div>

                  <Link
                    href={`/order-confirmation/${order.orderNumber}`}
                    className="inline-flex items-center space-x-1 text-xs text-amber-400 hover:text-amber-300 hover:underline"
                  >
                    <span>View Official Receipt</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Return Request Modal */}
      {returnOrderId && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-stone-950 border border-stone-800 rounded-lg max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="font-serif text-lg text-white font-light">
                Request Garment Return
              </h3>
              <button
                onClick={() => setReturnOrderId(null)}
                className="p-1 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              Our Maison provides complimentary 14-day white-glove return courier pickup for unworn garments with tags attached.
            </p>

            <form onSubmit={handleReturnSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-stone-300 font-medium">
                  Reason for Return
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="">Select reason...</option>
                  <option value="Size too small / snug fit">Size too small / snug fit</option>
                  <option value="Size too large / relaxed fit">Size too large / relaxed fit</option>
                  <option value="Fabric / drape not as anticipated">Fabric / drape not as anticipated</option>
                  <option value="Received incorrect garment">Received incorrect garment</option>
                  <option value="Other bespoke consideration">Other bespoke consideration</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReturnOrderId(null)}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReturn}
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold rounded text-xs uppercase tracking-wider transition disabled:opacity-50"
                >
                  {submittingReturn ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
