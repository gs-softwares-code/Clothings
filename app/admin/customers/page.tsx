'use client'

import React, { useState, useEffect } from 'react'
import { Users, Search, Mail, Phone, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatPrice } from '@/lib/utils'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  joinedAt: string
  totalOrders: number
  totalSpent: number
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function loadCustomers() {
      try {
        setLoading(true)
        const res = await fetch('/api/admin/customers')
        const data = await res.json()
        if (data.success) {
          setCustomers(data.data)
        }
      } catch {
        toast.error('Failed to load customers')
      } finally {
        setLoading(false)
      }
    }
    loadCustomers()
  }, [])

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="pb-6 border-b border-stone-800">
        <h1 className="font-serif text-2xl md:text-3xl font-light text-white tracking-wide">
          Patrons & Clientele
        </h1>
        <p className="text-xs text-stone-400 uppercase tracking-widest mt-1">
          Registered VIP members, purchase history & lifetime value
        </p>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search patrons by name or email address..."
          className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded text-xs text-white placeholder-stone-400 focus:outline-none focus:border-amber-400 transition"
        />
      </div>

      <div className="bg-stone-950/80 rounded-lg border border-stone-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-stone-400">
            No patrons found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-800 text-stone-400 uppercase tracking-wider text-[10px] bg-stone-900/40">
                  <th className="py-3 px-4">Patron Name</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Member Since</th>
                  <th className="py-3 px-4 text-center">Total Orders</th>
                  <th className="py-3 px-4 text-right">Lifetime Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-stone-900/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-medium text-white">
                      {c.name}
                    </td>
                    <td className="py-3.5 px-4 text-stone-400">
                      <div>{c.email}</div>
                      <div className="text-[11px] text-stone-400">{c.phone}</div>
                    </td>
                    <td className="py-3.5 px-4 text-stone-400 text-[11px]">
                      {new Date(c.joinedAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        year: 'numeric',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-stone-300">
                      {c.totalOrders}
                    </td>
                    <td className="py-3.5 px-4 text-right font-serif font-medium text-amber-300">
                      {formatPrice(c.totalSpent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
