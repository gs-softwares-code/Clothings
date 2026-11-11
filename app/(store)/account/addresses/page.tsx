'use client'

import React, { useState, useEffect } from 'react'
import {
  MapPin,
  Plus,
  Trash2,
  CheckCircle,
  Home,
  Phone,
  User,
  X,
} from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

interface Address {
  id: string
  name: string
  phone: string
  line1: string
  line2?: string | null
  city: string
  state: string
  pincode: string
  isDefault: boolean
}

export default function AccountAddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [line1, setLine1] = useState('')
  const [line2, setLine2] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [pincode, setPincode] = useState('')
  const [isDefault, setIsDefault] = useState(false)

  const fetchAddresses = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/account/addresses')
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        setAddresses(data.data)
      }
    } catch {
      // toast error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAddresses()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !phone || !line1 || !city || !state || !pincode) {
      return toast.error('Please complete all required fields')
    }

    try {
      setSubmitting(true)
      const res = await fetch('/api/account/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          line1: line1.trim(),
          line2: line2.trim() || undefined,
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          isDefault,
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success('Address added to your address book')
        setIsModalOpen(false)
        setName('')
        setPhone('')
        setLine1('')
        setLine2('')
        setCity('')
        setState('')
        setPincode('')
        setIsDefault(false)
        fetchAddresses()
      } else {
        toast.error(data.error || 'Failed to save address')
      }
    } catch {
      toast.error('Error saving address')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this delivery address?')) return

    try {
      const res = await fetch(`/api/account/addresses?id=${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Address removed')
        setAddresses((prev) => prev.filter((a) => a.id !== id))
      } else {
        toast.error(data.error || 'Failed to delete address')
      }
    } catch {
      toast.error('Error deleting address')
    }
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <h2 className="font-serif text-2xl font-light text-white tracking-wide">
            Delivery Coordinates
          </h2>
          <p className="text-xs text-stone-400 uppercase tracking-widest mt-1">
            Manage private residences and worldwide shipping addresses
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-semibold uppercase tracking-wider rounded transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Destination</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="py-16 text-center p-8 bg-stone-900/40 rounded-lg border border-stone-800 space-y-3">
          <MapPin className="w-10 h-10 text-stone-400 mx-auto" />
          <p className="text-sm text-stone-300">
            No saved addresses in your patron profile.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-block text-xs text-amber-400 hover:underline uppercase tracking-wider font-medium"
          >
            + Add your first address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-5 rounded-lg border relative flex flex-col justify-between ${
                addr.isDefault
                  ? 'bg-amber-400/5 border-amber-400/30'
                  : 'bg-stone-900/40 border-stone-800'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white uppercase tracking-wider">
                    {addr.name}
                  </span>
                  {addr.isDefault && (
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      Default Residence
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-300 leading-relaxed">
                  {addr.line1}
                  {addr.line2 && `, ${addr.line2}`}
                  <br />
                  {addr.city}, {addr.state} - {addr.pincode}
                </p>

                <p className="text-[11px] text-stone-400">Phone: {addr.phone}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-stone-800 flex justify-end">
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="text-stone-400 hover:text-rose-400 text-xs flex items-center space-x-1 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Address Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-stone-950 border border-stone-800 rounded-lg max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="font-serif text-lg text-white font-light">
                Add Shipping Coordinates
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-stone-300">Recipient Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-stone-300">Phone Number *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-stone-300">Address Line 1 *</label>
                <input
                  type="text"
                  value={line1}
                  onChange={(e) => setLine1(e.target.value)}
                  placeholder="Street address, building, suite"
                  required
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-stone-300">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  value={line2}
                  onChange={(e) => setLine2(e.target.value)}
                  placeholder="Apartment, floor, landmark"
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-stone-300">City *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-stone-300">State *</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-stone-300">Pincode *</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center space-x-2 cursor-pointer text-stone-300">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-400 bg-stone-900 border-stone-700"
                  />
                  <span>Designate as primary residence address</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold rounded text-xs uppercase tracking-wider transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
