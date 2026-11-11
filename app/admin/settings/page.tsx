'use client'

import React, { useState, useEffect } from 'react'
import {
  Sliders,
  Save,
  Store,
  DollarSign,
  Truck,
  Percent,
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Twitter,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface StoreSettingsData {
  id?: string
  storeName: string
  storeEmail?: string
  storePhone?: string
  storeAddress?: string
  currency: string
  currencySymbol: string
  gstRate: number
  freeShippingMin: number
  shippingCharge: number
  whatsappNumber?: string
  instagramUrl?: string
  facebookUrl?: string
  twitterUrl?: string
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState<StoreSettingsData>({
    storeName: 'LUXE THREADS',
    storeEmail: 'concierge@luxethreads.com',
    storePhone: '+91 98765 43210',
    storeAddress: '10 Atelier Boulevard, High Fashion District, Mumbai, India',
    currency: 'INR',
    currencySymbol: '₹',
    gstRate: 18,
    freeShippingMin: 999,
    shippingCharge: 99,
    whatsappNumber: '+91 98765 43210',
    instagramUrl: 'https://instagram.com/luxethreads',
    facebookUrl: 'https://facebook.com/luxethreads',
    twitterUrl: 'https://twitter.com/luxethreads',
  })

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true)
        const res = await fetch('/api/admin/settings')
        const data = await res.json()
        if (data.success && data.data) {
          setFormData({
            ...data.data,
            storeEmail: data.data.storeEmail || '',
            storePhone: data.data.storePhone || '',
            storeAddress: data.data.storeAddress || '',
            whatsappNumber: data.data.whatsappNumber || '',
            instagramUrl: data.data.instagramUrl || '',
            facebookUrl: data.data.facebookUrl || '',
            twitterUrl: data.data.twitterUrl || '',
          })
        }
      } catch {
        toast.error('Failed to load store settings')
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Store configuration saved')
      } else {
        toast.error(data.error || 'Failed to update settings')
      }
    } catch {
      toast.error('Error saving settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-xs text-stone-400 uppercase tracking-widest">
          Loading atelier settings...
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-stone-800">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-light text-white tracking-wide">
            Atelier Configuration
          </h1>
          <p className="text-xs text-stone-400 uppercase tracking-widest mt-1">
            Global store policies, taxation, shipping limits, and concierge channels
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center space-x-2 px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-semibold uppercase tracking-wider rounded transition-colors disabled:opacity-50 shadow-sm"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Brand & Identity */}
        <div className="p-6 bg-stone-950/80 rounded-lg border border-stone-800 space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-stone-800">
            <Store className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-200">
              Maison & Brand Identity
            </h2>
          </div>

          <div className="space-y-1.5 text-xs">
            <label className="text-stone-300 font-medium">Store Name</label>
            <input
              type="text"
              value={formData.storeName}
              onChange={(e) =>
                setFormData({ ...formData, storeName: e.target.value })
              }
              required
              className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="space-y-1.5 text-xs">
            <label className="text-stone-300 font-medium">Concierge Email</label>
            <input
              type="email"
              value={formData.storeEmail || ''}
              onChange={(e) =>
                setFormData({ ...formData, storeEmail: e.target.value })
              }
              className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="space-y-1.5 text-xs">
            <label className="text-stone-300 font-medium">Concierge Telephone</label>
            <input
              type="text"
              value={formData.storePhone || ''}
              onChange={(e) =>
                setFormData({ ...formData, storePhone: e.target.value })
              }
              className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="space-y-1.5 text-xs">
            <label className="text-stone-300 font-medium">Physical Atelier Address</label>
            <textarea
              value={formData.storeAddress || ''}
              onChange={(e) =>
                setFormData({ ...formData, storeAddress: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded text-white focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>

        {/* Currency & Financial Rates */}
        <div className="p-6 bg-stone-950/80 rounded-lg border border-stone-800 space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-stone-800">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-200">
              Monetary & Taxation Parameters
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-stone-300 font-medium">Base Currency</label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value })
                }
                className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded text-white uppercase font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-stone-300 font-medium">Currency Symbol</label>
              <input
                type="text"
                value={formData.currencySymbol}
                onChange={(e) =>
                  setFormData({ ...formData, currencySymbol: e.target.value })
                }
                className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <label className="text-stone-300 font-medium">GST Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={formData.gstRate}
              onChange={(e) =>
                setFormData({ ...formData, gstRate: parseFloat(e.target.value) })
              }
              className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded text-white font-mono focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-stone-300 font-medium">
                Complimentary Shipping Threshold (₹)
              </label>
              <input
                type="number"
                value={formData.freeShippingMin}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    freeShippingMin: parseFloat(e.target.value),
                  })
                }
                className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-stone-300 font-medium">
                Standard Shipping Charge (₹)
              </label>
              <input
                type="number"
                value={formData.shippingCharge}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    shippingCharge: parseFloat(e.target.value),
                  })
                }
                className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded text-white font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Social & Concierge Channels */}
        <div className="p-6 bg-stone-950/80 rounded-lg border border-stone-800 space-y-4 md:col-span-2">
          <div className="flex items-center space-x-2 pb-2 border-b border-stone-800">
            <Instagram className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-200">
              VIP Channels & Social Links
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-stone-300 font-medium">WhatsApp VIP Concierge</label>
              <input
                type="text"
                value={formData.whatsappNumber || ''}
                onChange={(e) =>
                  setFormData({ ...formData, whatsappNumber: e.target.value })
                }
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-stone-300 font-medium">Instagram Profile URL</label>
              <input
                type="url"
                value={formData.instagramUrl || ''}
                onChange={(e) =>
                  setFormData({ ...formData, instagramUrl: e.target.value })
                }
                placeholder="https://instagram.com/..."
                className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-stone-300 font-medium">Facebook Page URL</label>
              <input
                type="url"
                value={formData.facebookUrl || ''}
                onChange={(e) =>
                  setFormData({ ...formData, facebookUrl: e.target.value })
                }
                placeholder="https://facebook.com/..."
                className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
