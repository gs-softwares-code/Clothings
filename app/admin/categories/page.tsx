'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  Layers,
  Plus,
  Trash2,
  FolderTree,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  image?: string | null
  parentId?: string | null
  parent?: { name: string } | null
  _count?: {
    products: number
  }
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [parentId, setParentId] = useState('')

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/categories')
      const data = await res.json()
      if (data.success) {
        setCategories(data.data)
      }
    } catch {
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return toast.error('Category name is required')

    try {
      setSubmitting(true)
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim() || undefined,
          description: description.trim() || undefined,
          image: image.trim() || undefined,
          parentId: parentId || undefined,
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success('Category created')
        setName('')
        setSlug('')
        setDescription('')
        setImage('')
        setParentId('')
        fetchCategories()
      } else {
        toast.error(data.error || 'Failed to create category')
      }
    } catch {
      toast.error('Error creating category')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-6 border-b border-stone-800">
        <h1 className="font-serif text-2xl md:text-3xl font-light text-white tracking-wide">
          Atelier Collections & Categories
        </h1>
        <p className="text-xs text-stone-400 uppercase tracking-widest mt-1">
          Organize sartorial lines, gender departments, and aesthetic taxonomy
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form to create category */}
        <div className="p-6 bg-stone-950/80 rounded-lg border border-stone-800 space-y-4 h-fit shadow-sm">
          <div className="flex items-center space-x-2 pb-3 border-b border-stone-800">
            <Plus className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-200">
              New Collection / Category
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-stone-300 font-medium">
                Category Title <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Silk Loungewear"
                required
                className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded text-white placeholder-stone-400 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-stone-300 font-medium">
                Slug (Optional)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="silk-loungewear"
                className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded text-white placeholder-stone-400 font-mono text-[11px] focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-stone-300 font-medium">
                Parent Department (Optional)
              </label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded text-white focus:outline-none focus:border-amber-400"
              >
                <option value="">Root Department (No Parent)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-stone-300 font-medium">
                Editorial Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Curated aesthetic overview..."
                className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded text-white placeholder-stone-400 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-stone-300 font-medium">
                Cover Image URL
              </label>
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded text-white placeholder-stone-400 focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold uppercase tracking-wider rounded transition-colors disabled:opacity-50 mt-2"
            >
              {submitting ? 'Creating...' : 'Create Category'}
            </button>
          </form>
        </div>

        {/* Right Column: Existing Categories List */}
        <div className="lg:col-span-2 bg-stone-950/80 rounded-lg border border-stone-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-stone-800 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-300">
              Active Collections ({categories.length})
            </span>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <div className="inline-block w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : categories.length === 0 ? (
            <div className="py-16 text-center text-xs text-stone-400">
              No categories established yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-800 text-stone-400 uppercase tracking-wider text-[10px] bg-stone-900/40">
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Slug</th>
                    <th className="py-3 px-4">Parent Dept</th>
                    <th className="py-3 px-4 text-center">Products</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {categories.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-stone-900/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          {c.image ? (
                            <div className="relative w-8 h-8 rounded overflow-hidden flex-shrink-0 bg-stone-900 border border-stone-800">
                              <Image
                                src={c.image}
                                alt={c.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-400">
                              <Layers className="w-4 h-4" />
                            </div>
                          )}
                          <div>
                            <span className="font-medium text-white">{c.name}</span>
                            {c.description && (
                              <p className="text-[10px] text-stone-400 line-clamp-1">
                                {c.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-amber-300/80">
                        /{c.slug}
                      </td>

                      <td className="py-3.5 px-4 text-stone-400">
                        {c.parent ? c.parent.name : '—'}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-stone-900 text-stone-300 font-mono text-[11px] border border-stone-800">
                          {c._count?.products || 0}
                        </span>
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
