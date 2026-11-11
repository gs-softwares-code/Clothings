'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  SlidersHorizontal,
  Package,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { formatPrice } from '@/lib/utils'

interface Variant {
  id: string
  size: string
  color: string
  stock: number
  price?: number | null
}

interface Product {
  id: string
  name: string
  slug: string
  price: number
  comparePrice?: number | null
  images: string
  categoryId: string
  category: {
    id: string
    name: string
  }
  badge?: string | null
  isActive: boolean
  variants: Variant[]
  createdAt: string
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      let url = '/api/admin/products'
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (selectedCategory) params.append('categoryId', selectedCategory)
      if (params.toString()) url += `?${params.toString()}`

      const res = await fetch(url)
      const data = await res.json()
      if (data.success) {
        setProducts(data.data)
      }
    } catch (err) {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      if (data.success) {
        setCategories(data.data)
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchProducts()
    }, 300)
    return () => clearTimeout(timeout)
  }, [searchTerm, selectedCategory])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently remove "${name}" from the catalog?`)) {
      return
    }

    try {
      setDeletingId(id)
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()

      if (data.success) {
        toast.success('Product deleted')
        setProducts((prev) => prev.filter((p) => p.id !== id))
      } else {
        toast.error(data.error || 'Failed to delete product')
      }
    } catch (err) {
      toast.error('Error deleting product')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-stone-800">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-light text-white tracking-wide">
            Haute Couture Catalog
          </h1>
          <p className="text-xs text-stone-400 uppercase tracking-widest mt-1">
            Manage luxury garments, variants, pricing, and inventory
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-semibold uppercase tracking-wider rounded transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Creation</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by product name, description..."
            className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-800 rounded text-xs text-white placeholder-stone-400 focus:outline-none focus:border-amber-400 transition"
          />
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2.5 bg-stone-950 border border-stone-800 rounded text-xs text-white focus:outline-none focus:border-amber-400 transition"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-stone-950/80 rounded-lg border border-stone-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <p className="mt-3 text-xs text-stone-400 uppercase tracking-widest">
              Fetching catalog...
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Package className="w-10 h-10 text-stone-400 mx-auto" />
            <p className="text-sm text-stone-400">
              No creations found matching your query.
            </p>
            <Link
              href="/admin/products/new"
              className="inline-block text-xs text-amber-400 hover:underline tracking-wider uppercase font-medium"
            >
              + Create first product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-800 text-stone-400 uppercase tracking-wider text-[10px] bg-stone-900/40">
                  <th className="py-3 px-4">Garment</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Variants / Total Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60">
                {products.map((product) => {
                  let parsedImages: string[] = []
                  try {
                    parsedImages = JSON.parse(product.images)
                  } catch {
                    parsedImages = product.images ? [product.images] : []
                  }
                  const thumbnail =
                    parsedImages[0] ||
                    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=600'
                  const totalStock = product.variants.reduce(
                    (sum, v) => sum + v.stock,
                    0
                  )

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-stone-900/40 transition-colors"
                    >
                      {/* Product image & name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="relative w-12 h-14 bg-stone-900 rounded overflow-hidden flex-shrink-0 border border-stone-800">
                            <Image
                              src={thumbnail}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-medium text-white line-clamp-1">
                              {product.name}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              {product.badge && (
                                <span className="text-[9px] uppercase px-1.5 py-0.2 bg-amber-400/20 text-amber-300 font-mono rounded">
                                  {product.badge}
                                </span>
                              )}
                              <span className="text-[10px] text-stone-400 font-mono">
                                /{product.slug}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-stone-300">
                        {product.category?.name || 'Unassigned'}
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-white">
                          {formatPrice(product.price)}
                        </div>
                        {product.comparePrice && (
                          <div className="text-[10px] text-stone-400 line-through">
                            {formatPrice(product.comparePrice)}
                          </div>
                        )}
                      </td>

                      {/* Variants & Stock */}
                      <td className="py-3.5 px-4">
                        <div className="text-white font-mono">
                          {totalStock}{' '}
                          <span className="text-stone-400 text-[10px]">
                            in stock
                          </span>
                        </div>
                        <div className="text-[10px] text-stone-400">
                          {product.variants.length}{' '}
                          {product.variants.length === 1 ? 'variant' : 'variants'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {product.isActive ? (
                          <span className="inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                            <CheckCircle className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-400 border border-stone-700 font-medium">
                            <XCircle className="w-3 h-3" />
                            <span>Archived</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            href={`/products/${product.slug}`}
                            target="_blank"
                            title="View in Store"
                            className="p-1.5 text-stone-400 hover:text-white rounded hover:bg-stone-800 transition"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/products/new?edit=${product.id}`}
                            title="Edit Product"
                            className="p-1.5 text-stone-400 hover:text-amber-300 rounded hover:bg-stone-800 transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            disabled={deletingId === product.id}
                            title="Delete Product"
                            className="p-1.5 text-stone-400 hover:text-rose-400 rounded hover:bg-stone-800 transition disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
