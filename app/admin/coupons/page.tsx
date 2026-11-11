'use client'

import React, { useState, useEffect } from 'react'
import {
  Ticket,
  Plus,
  Percent,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatPrice } from '@/lib/utils'

interface Coupon {
  id: string
  code: string
  description?: string | null
  type: string
  value: number
  minOrderValue?: number | null
  maxDiscount?: number | null
  usageLimit?: number | null
  usedCount: number
  isActive: boolean
  expiresAt?: string | null
  createdAt: string
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form states
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('PERCENTAGE')
  const [value, setValue] = useState('')
  const [minOrderValue, setMinOrderValue] = useState('')
  const [maxDiscount, setMaxDiscount] = useState('')
  const [usageLimit, setUsageLimit] = useState('')
  const [expiresAt, setExpiresAt] = useState('')

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/coupons')
      const data = await res.json()
      if (data.success) {
        setCoupons(data.data)
      }
    } catch {
      toast.error('Failed to load coupons')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return toast.error('Coupon code is required')
    if (!value || parseFloat(value) <= 0) return toast.error('Valid discount value is required')

    try {
      setSubmitting(true)
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          description: description.trim() || undefined,
          type,
          value: parseFloat(value),
          minOrderValue: minOrderValue ? parseFloat(minOrderValue) : null,
          maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
          usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
          expiresAt: expiresAt || null,
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success('Coupon code issued')
        setCode('')
        setDescription('')
        setValue('')
        setMinOrderValue('')
        setMaxDiscount('')
        setUsageLimit('')
        setExpiresAt('')
        fetchCoupons()
      } else {
        toast.error(data.error || 'Failed to create coupon')
      }
    } catch {
      toast.error('Error creating coupon')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-6 border-b border-stone-800">
        <h1 className="font-serif text-2xl md:text-3xl font-light text-white tracking-wide">
          Promotions & Privileges
        </h1>
        <p className="text-xs text-stone-400 uppercase tracking-widest mt-1">
          Issue VIP promotional vouchers, discount percentages, and privilege codes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Issue Coupon Form */}
        <div className="p-6 bg-stone-950/80 rounded-lg border border-stone-800 space-y-4 h-fit shadow-sm">
          <div className="flex items-center space-x-2 pb-3 border-b border-stone-800">
            <Ticket className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-200">
              Generate Privilege Code
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-stone-300 font-medium">
                Privilege Code <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. LUXE20"
                required
                className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded text-white placeholder-stone-400 uppercase font-mono tracking-wider focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-stone-300 font-medium">Discount Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (₹)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-stone-300 font-medium">
                  Value <span className="text-amber-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={type === 'PERCENTAGE' ? '15' : '500'}
                  required
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-stone-300 font-medium">Min Order (₹)</label>
                <input
                  type="number"
                  value={minOrderValue}
                  onChange={(e) => setMinOrderValue(e.target.value)}
                  placeholder="1999"
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-stone-300 font-medium">Max Cap (₹)</label>
                <input
                  type="number"
                  value={maxDiscount}
                  onChange={(e) => setMaxDiscount(e.target.value)}
                  placeholder="1000"
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-stone-300 font-medium">Usage Limit</label>
                <input
                  type="number"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  placeholder="Unlimited"
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded text-white font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-stone-300 font-medium">Expiry Date</label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded text-white text-[11px] focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-stone-300 font-medium">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="15% off on debut orders"
                className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded text-white placeholder-stone-400 focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold uppercase tracking-wider rounded transition-colors disabled:opacity-50 mt-2"
            >
              {submitting ? 'Generating...' : 'Issue Code'}
            </button>
          </form>
        </div>

        {/* Existing Coupons List */}
        <div className="lg:col-span-2 bg-stone-950/80 rounded-lg border border-stone-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-stone-800 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-300">
              Active Privilege Codes ({coupons.length})
            </span>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-block w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : coupons.length === 0 ? (
            <div className="py-16 text-center text-xs text-stone-400">
              No promotions registered yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-800 text-stone-400 uppercase tracking-wider text-[10px] bg-stone-900/40">
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Benefit</th>
                    <th className="py-3 px-4">Conditions</th>
                    <th className="py-3 px-4">Usage</th>
                    <th className="py-3 px-4">Expires</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {coupons.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-stone-900/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-medium text-amber-300">
                        {c.code}
                      </td>

                      <td className="py-3.5 px-4 text-white font-medium">
                        {c.type === 'PERCENTAGE'
                          ? `${c.value}% OFF`
                          : `${formatPrice(c.value)} OFF`}
                        {c.description && (
                          <span className="block text-[10px] text-stone-400 font-normal">
                            {c.description}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-stone-400 text-[11px]">
                        {c.minOrderValue
                          ? `Min: ${formatPrice(c.minOrderValue)}`
                          : 'No minimum'}
                        {c.maxDiscount && (
                          <span className="block text-[10px]">
                            Max: {formatPrice(c.maxDiscount)}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-stone-300">
                        {c.usedCount}
                        {c.usageLimit ? ` / ${c.usageLimit}` : ' used'}
                      </td>

                      <td className="py-3.5 px-4 text-stone-400 text-[11px]">
                        {c.expiresAt
                          ? new Date(c.expiresAt).toLocaleDateString('en-IN')
                          : 'Never'}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {c.isActive ? (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                            Active
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-stone-800 text-stone-400 font-medium">
                            Inactive
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
