import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const categoryParam = searchParams.get('category')
    const subcategoryParam = searchParams.get('subcategory')
    const search = searchParams.get('search')?.trim()
    const sort = searchParams.get('sort')?.toLowerCase()
    const badge = searchParams.get('badge')?.trim()
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '12', 10) || 12))
    const skip = (page - 1) * limit

    const where: Prisma.ProductWhereInput = {
      isActive: true,
    }

    // Category / Subcategory filtering
    if (subcategoryParam) {
      const subcategory = await db.category.findFirst({
        where: {
          OR: [{ slug: subcategoryParam }, { id: subcategoryParam }],
        },
      })
      if (subcategory) {
        where.categoryId = subcategory.id
      } else {
        // Subcategory specified but not found
        return NextResponse.json({
          success: true,
          data: [],
          pagination: { total: 0, page, limit, totalPages: 0 },
        })
      }
    } else if (categoryParam) {
      const category = await db.category.findFirst({
        where: {
          OR: [{ slug: categoryParam }, { id: categoryParam }],
        },
        include: { children: true },
      })
      if (category) {
        const categoryIds = [category.id, ...category.children.map((child) => child.id)]
        where.categoryId = { in: categoryIds }
      } else {
        // Category specified but not found
        return NextResponse.json({
          success: true,
          data: [],
          pagination: { total: 0, page, limit, totalPages: 0 },
        })
      }
    }

    // Search query
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } },
        { fabric: { contains: search } },
      ]
    }

    // Badge filter
    if (badge) {
      where.badge = { equals: badge }
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {}
      if (minPrice !== undefined && !isNaN(minPrice)) {
        where.price.gte = minPrice
      }
      if (maxPrice !== undefined && !isNaN(maxPrice)) {
        where.price.lte = maxPrice
      }
    }

    // Sort order
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' }
    if (sort === 'price-asc' || sort === 'price_asc') {
      orderBy = { price: 'asc' }
    } else if (sort === 'price-desc' || sort === 'price_desc') {
      orderBy = { price: 'desc' }
    } else if (sort === 'newest') {
      orderBy = { createdAt: 'desc' }
    } else if (sort === 'popular') {
      orderBy = { updatedAt: 'desc' }
    }

    const [total, products] = await Promise.all([
      db.product.count({ where }),
      db.product.findMany({
        where,
        include: {
          category: {
            include: {
              parent: true,
            },
          },
          variants: true,
          reviews: {
            select: {
              rating: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
    ])

    // Format products with parsed images and rating aggregates
    const formattedProducts = products.map((product) => {
      let parsedImages: string[] = []
      try {
        parsedImages = JSON.parse(product.images)
      } catch {
        parsedImages = product.images ? [product.images] : []
      }

      const reviewCount = product.reviews.length
      const avgRating =
        reviewCount > 0
          ? Math.round((product.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10
          : 0

      return {
        ...product,
        images: product.images,
        imagesList: parsedImages,
        avgRating,
        reviewCount,
      }
    })

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: formattedProducts,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
