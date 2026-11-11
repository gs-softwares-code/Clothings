'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Image as ImageIcon,
  Check,
  AlertCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface VariantRow {
  size: string
  color: string
  colorHex: string
  stock: number
  sku: string
  price?: string
}

interface Category {
  id: string
  name: string
}

function NewProductForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [price, setPrice] = useState('')
  const [comparePrice, setComparePrice] = useState('')
  const [fabric, setFabric] = useState('')
  const [care, setCare] = useState('')
  const [tags, setTags] = useState('')
  const [badge, setBadge] = useState('')
  const [isActive, setIsActive] = useState(true)

  // Images list
  const [imageUrls, setImageUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=1000',
  ])
  const [newImageUrl, setNewImageUrl] = useState('')

  // Variants
  const [variants, setVariants] = useState<VariantRow[]>([
    { size: 'S', color: 'Midnight Black', colorHex: '#1A1A1A', stock: 15, sku: '' },
    { size: 'M', color: 'Midnight Black', colorHex: '#1A1A1A', stock: 25, sku: '' },
    { size: 'L', color: 'Midnight Black', colorHex: '#1A1A1A', stock: 20, sku: '' },
  ])

  // Fetch categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/admin/categories')
        const data = await res.json()
        if (data.success && data.data.length > 0) {
          setCategories(data.data)
          if (!editId) {
            setCategoryId(data.data[0].id)
          }
        }
      } catch (err) {
        toast.error('Failed to load categories')
      }
    }
    loadCategories()
  }, [editId])

  // If edit mode, fetch existing product
  useEffect(() => {
    if (!editId) return

    async function loadProduct() {
      try {
        setFetching(true)
        const res = await fetch(`/api/admin/products/${editId}`)
        const data = await res.json()

        if (data.success) {
          const p = data.data
          setName(p.name)
          setSlug(p.slug)
          setDescription(p.description || '')
          setCategoryId(p.categoryId)
          setPrice(p.price ? p.price.toString() : '')
          setComparePrice(p.comparePrice ? p.comparePrice.toString() : '')
          setFabric(p.fabric || '')
          setCare(p.care || '')
          setTags(p.tags || '')
          setBadge(p.badge || '')
          setIsActive(p.isActive)

          let imgs: string[] = []
          try {
            imgs = JSON.parse(p.images)
          } catch {
            imgs = p.images ? [p.images] : []
          }
          if (imgs.length > 0) setImageUrls(imgs)

          if (p.variants && p.variants.length > 0) {
            setVariants(
              p.variants.map((v: any) => ({
                size: v.size,
                color: v.color,
                colorHex: v.colorHex || '#000000',
                stock: v.stock,
                sku: v.sku,
                price: v.price ? v.price.toString() : '',
              }))
            )
          }
        } else {
          toast.error('Failed to load product for editing')
        }
      } catch (err) {
        toast.error('Error fetching product details')
      } finally {
        setFetching(false)
      }
    }

    loadProduct()
  }, [editId])

  // Add / remove images
  const handleAddImage = () => {
    if (!newImageUrl.trim()) return
    setImageUrls([...imageUrls, newImageUrl.trim()])
    setNewImageUrl('')
  }

  const handleRemoveImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index))
  }

  // Variant operations
  const handleAddVariant = () => {
    setVariants([
      ...variants,
      {
        size: 'M',
        color: 'Classic',
        colorHex: '#000000',
        stock: 10,
        sku: '',
      },
    ])
  }

  const handleUpdateVariant = (
    index: number,
    field: keyof VariantRow,
    value: any
  ) => {
    const updated = [...variants]
    updated[index] = { ...updated[index], [field]: value }
    setVariants(updated)
  }

  const handleRemoveVariant = (index: number) => {
    if (variants.length <= 1) {
      toast.error('A product must contain at least one variant')
      return
    }
    setVariants(variants.filter((_, i) => i !== index))
  }

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) return toast.error('Product title is required')
    if (!price || parseFloat(price) <= 0) return toast.error('Valid price is required')
    if (!categoryId) return toast.error('Category is required')
    if (imageUrls.length === 0) return toast.error('Add at least one product image')

    try {
      setLoading(true)

      const payload = {
        name: name.trim(),
        slug: slug.trim() || undefined,
        description: description.trim(),
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        images: imageUrls,
        categoryId,
        fabric: fabric.trim() || null,
        care: care.trim() || null,
        tags: tags.trim() || null,
        badge: badge.trim() || null,
        isActive,
        variants: variants.map((v) => ({
          size: v.size.trim(),
          color: v.color.trim(),
          colorHex: v.colorHex.trim(),
          stock: Number(v.stock) || 0,
          sku: v.sku.trim() || undefined,
          price: v.price ? parseFloat(v.price) : null,
        })),
      }

      const url = editId ? `/api/admin/products/${editId}` : '/api/admin/products'
      const method = editId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (data.success) {
        toast.success(editId ? 'Product updated successfully' : 'Product created successfully')
        router.push('/admin/products')
      } else {
        toast.error(data.error || 'Operation failed')
      }
    } catch (err) {
      toast.error('Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-xs text-stone-400 uppercase tracking-widest">
          Loading garment details...
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-stone-800">
        <div className="flex items-center space-x-3">
          <Link
            href="/admin/products"
            className="p-2 text-stone-400 hover:text-white rounded bg-stone-950 border border-stone-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-light text-white tracking-wide">
              {editId ? 'Refine Creation' : 'Create Haute Couture Garment'}
            </h1>
            <p className="text-xs text-stone-400 uppercase tracking-widest mt-0.5">
              Specify craftsmanship, pricing tiers & variants
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center space-x-2 px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-semibold uppercase tracking-wider rounded transition-colors disabled:opacity-50 shadow-sm"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Saving...' : editId ? 'Update Creation' : 'Publish Creation'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Core Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Details */}
          <div className="p-6 bg-stone-950/80 rounded-lg border border-stone-800 space-y-4">
            <h2 className="text-sm font-medium tracking-wider uppercase text-stone-300 pb-2 border-b border-stone-800">
              Garment Identification
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs text-stone-300 font-medium">
                Product Title <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Cashmere Blend Trench Coat"
                required
                className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded text-xs text-white placeholder-stone-400 focus:outline-none focus:border-amber-400 transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-stone-300 font-medium">
                  Custom Slug (optional)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="auto-generated from title"
                  className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded text-xs text-white placeholder-stone-400 font-mono focus:outline-none focus:border-amber-400 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-stone-300 font-medium">
                  Editorial Badge
                </label>
                <select
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  className="w-full px-3 py-2.5 bg-stone-900 border border-stone-800 rounded text-xs text-white focus:outline-none focus:border-amber-400 transition"
                >
                  <option value="">None</option>
                  <option value="NEW ARRIVAL">NEW ARRIVAL</option>
                  <option value="BESTSELLER">BESTSELLER</option>
                  <option value="LIMITED EDITION">LIMITED EDITION</option>
                  <option value="ATELIER EXCLUSIVE">ATELIER EXCLUSIVE</option>
                  <option value="SALE">SALE</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-stone-300 font-medium">
                Editorial Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Narrative about design, weave, silhouette, tailoring and styling tips..."
                className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded text-xs text-white placeholder-stone-400 focus:outline-none focus:border-amber-400 transition"
              />
            </div>
          </div>

          {/* Pricing & Craftsmanship Details */}
          <div className="p-6 bg-stone-950/80 rounded-lg border border-stone-800 space-y-4">
            <h2 className="text-sm font-medium tracking-wider uppercase text-stone-300 pb-2 border-b border-stone-800">
              Pricing & Craftsmanship
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-stone-300 font-medium">
                  Retail Price (INR ₹) <span className="text-amber-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="2499"
                  required
                  className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded text-xs text-white font-mono focus:outline-none focus:border-amber-400 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-stone-300 font-medium">
                  Compare at Price / MRP (INR ₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={comparePrice}
                  onChange={(e) => setComparePrice(e.target.value)}
                  placeholder="3999"
                  className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded text-xs text-white font-mono focus:outline-none focus:border-amber-400 transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-stone-300 font-medium">
                  Fabric & Composition
                </label>
                <input
                  type="text"
                  value={fabric}
                  onChange={(e) => setFabric(e.target.value)}
                  placeholder="e.g. 100% Pure Mulberry Silk"
                  className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded text-xs text-white placeholder-stone-400 focus:outline-none focus:border-amber-400 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-stone-300 font-medium">
                  Care Instructions
                </label>
                <input
                  type="text"
                  value={care}
                  onChange={(e) => setCare(e.target.value)}
                  placeholder="e.g. Dry clean only, low iron"
                  className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded text-xs text-white placeholder-stone-400 focus:outline-none focus:border-amber-400 transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-stone-300 font-medium">
                Search Tags (comma separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="luxury, silk, autumn, minimalist, evening-wear"
                className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded text-xs text-white placeholder-stone-400 focus:outline-none focus:border-amber-400 transition"
              />
            </div>
          </div>

          {/* Variants and Sizes Management */}
          <div className="p-6 bg-stone-950/80 rounded-lg border border-stone-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <div>
                <h2 className="text-sm font-medium tracking-wider uppercase text-stone-300">
                  Size & Color Variants
                </h2>
                <p className="text-[11px] text-stone-400">
                  Manage individual stock by size, hue, and custom SKU
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddVariant}
                className="inline-flex items-center space-x-1 px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs rounded transition border border-stone-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Variant</span>
              </button>
            </div>

            <div className="space-y-3">
              {variants.map((v, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2 p-3 bg-stone-900/60 rounded border border-stone-800 items-center text-xs"
                >
                  <div className="col-span-2">
                    <label className="text-[10px] text-stone-400 uppercase block mb-1">
                      Size
                    </label>
                    <input
                      type="text"
                      value={v.size}
                      onChange={(e) =>
                        handleUpdateVariant(idx, 'size', e.target.value)
                      }
                      placeholder="M"
                      className="w-full px-2 py-1.5 bg-stone-950 border border-stone-800 rounded text-white text-center font-medium focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="col-span-3">
                    <label className="text-[10px] text-stone-400 uppercase block mb-1">
                      Color
                    </label>
                    <input
                      type="text"
                      value={v.color}
                      onChange={(e) =>
                        handleUpdateVariant(idx, 'color', e.target.value)
                      }
                      placeholder="Color Name"
                      className="w-full px-2 py-1.5 bg-stone-950 border border-stone-800 rounded text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] text-stone-400 uppercase block mb-1">
                      Hex
                    </label>
                    <div className="flex items-center space-x-1">
                      <input
                        type="color"
                        value={v.colorHex || '#000000'}
                        onChange={(e) =>
                          handleUpdateVariant(idx, 'colorHex', e.target.value)
                        }
                        className="w-6 h-7 p-0 bg-transparent rounded cursor-pointer border-0"
                      />
                      <input
                        type="text"
                        value={v.colorHex}
                        onChange={(e) =>
                          handleUpdateVariant(idx, 'colorHex', e.target.value)
                        }
                        className="w-full px-1.5 py-1.5 bg-stone-950 border border-stone-800 rounded text-[10px] font-mono text-white uppercase"
                      />
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] text-stone-400 uppercase block mb-1">
                      Stock
                    </label>
                    <input
                      type="number"
                      value={v.stock}
                      onChange={(e) =>
                        handleUpdateVariant(idx, 'stock', e.target.value)
                      }
                      className="w-full px-2 py-1.5 bg-stone-950 border border-stone-800 rounded text-white font-mono text-center focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] text-stone-400 uppercase block mb-1">
                      SKU
                    </label>
                    <input
                      type="text"
                      value={v.sku}
                      onChange={(e) =>
                        handleUpdateVariant(idx, 'sku', e.target.value)
                      }
                      placeholder="Auto"
                      className="w-full px-2 py-1.5 bg-stone-950 border border-stone-800 rounded text-stone-300 font-mono text-[10px]"
                    />
                  </div>

                  <div className="col-span-1 flex justify-center pt-4">
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      className="text-stone-400 hover:text-rose-400 transition p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Status, Category, Images */}
        <div className="space-y-6">
          {/* Status & Category */}
          <div className="p-6 bg-stone-950/80 rounded-lg border border-stone-800 space-y-4">
            <h2 className="text-sm font-medium tracking-wider uppercase text-stone-300 pb-2 border-b border-stone-800">
              Publishing Status
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs text-stone-300 font-medium">
                Category Collection <span className="text-amber-400">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-stone-900 border border-stone-800 rounded text-xs text-white focus:outline-none focus:border-amber-400 transition"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-400 bg-stone-900 border-stone-700 focus:ring-0"
                />
                <span className="text-xs text-stone-200">
                  Visible in Store (Active Catalog)
                </span>
              </label>
            </div>
          </div>

          {/* High-Resolution Imagery */}
          <div className="p-6 bg-stone-950/80 rounded-lg border border-stone-800 space-y-4">
            <h2 className="text-sm font-medium tracking-wider uppercase text-stone-300 pb-2 border-b border-stone-800">
              Editorial Imagery
            </h2>

            <div className="space-y-2">
              <label className="text-xs text-stone-300 font-medium">
                Add Image URL
              </label>
              <div className="flex space-x-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 px-3 py-2 bg-stone-900 border border-stone-800 rounded text-xs text-white placeholder-stone-400 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs rounded border border-stone-700 transition"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {imageUrls.map((url, i) => (
                <div
                  key={i}
                  className="group relative aspect-[3/4] bg-stone-900 rounded overflow-hidden border border-stone-800"
                >
                  <Image
                    src={url}
                    alt={`Image ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/80 text-amber-300 text-[9px] uppercase tracking-wider rounded font-mono">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}

export default function NewProductPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <div className="inline-block w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <NewProductForm />
    </Suspense>
  )
}
