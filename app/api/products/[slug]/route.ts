import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Product identifier is required' },
        { status: 400 }
      )
    }

    const product = await db.product.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
        isActive: true,
      },
      include: {
        category: {
          include: {
            parent: true,
          },
        },
        variants: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    // Related products (same subcategory or parent category)
    let relatedCategoryIds = [product.categoryId]
    if (product.category?.parentId) {
      const siblingCategories = await db.category.findMany({
        where: { parentId: product.category.parentId },
        select: { id: true },
      })
      relatedCategoryIds = Array.from(new Set([product.categoryId, ...siblingCategories.map((c) => c.id)]))
    }

    const relatedProducts = await db.product.findMany({
      where: {
        categoryId: { in: relatedCategoryIds },
        id: { not: product.id },
        isActive: true,
      },
      include: {
        variants: true,
        category: true,
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      take: 4,
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Parse images and stats helper
    const parseProductImages = (imagesStr: string) => {
      try {
        return JSON.parse(imagesStr)
      } catch {
        return imagesStr ? [imagesStr] : []
      }
    }

    const reviewCount = product.reviews.length
    const avgRating =
      reviewCount > 0
        ? Math.round((product.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10
        : 0

    const formattedRelated = relatedProducts.map((rel) => {
      const relReviewCount = rel.reviews.length
      const relAvgRating =
        relReviewCount > 0
          ? Math.round((rel.reviews.reduce((sum, r) => sum + r.rating, 0) / relReviewCount) * 10) / 10
          : 0
      return {
        ...rel,
        imagesList: parseProductImages(rel.images),
        avgRating: relAvgRating,
        reviewCount: relReviewCount,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        imagesList: parseProductImages(product.images),
        avgRating,
        reviewCount,
        relatedProducts: formattedRelated,
      },
    })
  } catch (error) {
    console.error('Error fetching product by slug:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}
