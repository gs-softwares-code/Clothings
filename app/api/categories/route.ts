import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const categories = await db.category.findMany({
      where: {
        parentId: null,
      },
      include: {
        children: {
          include: {
            _count: {
              select: {
                products: true,
              },
            },
          },
          orderBy: {
            name: 'asc',
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    const categoriesWithCounts = categories.map((cat) => {
      const childrenWithCounts = cat.children.map((sub) => ({
        ...sub,
        productCount: sub._count.products,
      }))

      const subcategoriesProductCount = childrenWithCounts.reduce(
        (sum, sub) => sum + sub.productCount,
        0
      )

      const totalProductCount = cat._count.products + subcategoriesProductCount

      return {
        ...cat,
        productCount: cat._count.products,
        totalProductCount,
        children: childrenWithCounts,
      }
    })

    return NextResponse.json({
      success: true,
      data: categoriesWithCounts,
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
