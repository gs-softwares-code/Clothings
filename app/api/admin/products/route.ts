import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { slugify } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId')

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ]
    }
    if (categoryId) {
      where.categoryId = categoryId
    }

    const products = await db.product.findMany({
      where,
      include: {
        category: true,
        variants: true,
        _count: {
          select: { orderItems: true, reviews: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: products })
  } catch (error: any) {
    console.error('Error fetching admin products:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      name,
      slug,
      description,
      price,
      comparePrice,
      images,
      categoryId,
      fabric,
      care,
      tags,
      badge,
      isActive = true,
      variants = [],
    } = body

    if (!name || !price || !categoryId) {
      return NextResponse.json(
        { success: false, error: 'Name, price, and category are required' },
        { status: 400 }
      )
    }

    const finalSlug = slug ? slugify(slug) : slugify(name) + '-' + Date.now().toString(36)

    // Check slug uniqueness
    const existing = await db.product.findUnique({
      where: { slug: finalSlug },
    })
    const uniqueSlug = existing ? `${finalSlug}-${Date.now().toString(36)}` : finalSlug

    const imagesString = Array.isArray(images) ? JSON.stringify(images) : typeof images === 'string' ? images : '[]'

    const product = await db.product.create({
      data: {
        name,
        slug: uniqueSlug,
        description: description || '',
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        images: imagesString,
        categoryId,
        fabric: fabric || null,
        care: care || null,
        tags: tags || null,
        badge: badge || null,
        isActive: Boolean(isActive),
        variants: {
          create: variants.map((v: any, index: number) => ({
            size: v.size || 'M',
            color: v.color || 'Standard',
            colorHex: v.colorHex || '#000000',
            sku: v.sku || `${uniqueSlug}-${v.size || 'M'}-${index + 1}`.toUpperCase(),
            stock: parseInt(v.stock, 10) || 0,
            price: v.price ? parseFloat(v.price) : null,
          })),
        },
      },
      include: {
        category: true,
        variants: true,
      },
    })

    return NextResponse.json({ success: true, data: product }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create product' },
      { status: 500 }
    )
  }
}
