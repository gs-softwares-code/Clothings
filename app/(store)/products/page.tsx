import { Suspense } from 'react'
import { db } from '@/lib/db'
import ProductListingClient from '@/components/store/product/product-listing-client'

export const dynamic = 'force-dynamic'

interface ProductsPageProps {
  searchParams: {
    category?: string
    subcategory?: string
    search?: string
    sort?: string
    badge?: string
    minPrice?: string
    maxPrice?: string
    sizes?: string
    colors?: string
    page?: string
  }
}

async function getInitialProducts(searchParams: ProductsPageProps['searchParams']) {
  try {
    const where: any = { isActive: true }

    if (searchParams.category) {
      const cat = await db.category.findFirst({
        where: { slug: searchParams.category.toLowerCase() },
        include: { children: true },
      })
      if (cat) {
        const catIds = [cat.id, ...cat.children.map((c) => c.id)]
        where.categoryId = { in: catIds }
      }
    }

    if (searchParams.search) {
      where.OR = [
        { name: { contains: searchParams.search } },
        { description: { contains: searchParams.search } },
        { tags: { contains: searchParams.search } },
      ]
    }

    if (searchParams.badge) {
      where.badge = searchParams.badge.toUpperCase()
    }

    if (searchParams.minPrice || searchParams.maxPrice) {
      where.price = {}
      if (searchParams.minPrice) where.price.gte = parseFloat(searchParams.minPrice)
      if (searchParams.maxPrice) where.price.lte = parseFloat(searchParams.maxPrice)
    }

    let orderBy: any = { createdAt: 'desc' }
    const sort = searchParams.sort?.toLowerCase()
    if (sort === 'price-asc') orderBy = { price: 'asc' }
    else if (sort === 'price-desc') orderBy = { price: 'desc' }
    else if (sort === 'popular') orderBy = { updatedAt: 'desc' }

    const products = await db.product.findMany({
      where,
      include: {
        category: true,
        variants: true,
      },
      orderBy,
      take: 60,
    })

    const categories = await db.category.findMany({
      where: { parentId: null },
      include: { children: true },
    })

    return {
      products: JSON.parse(JSON.stringify(products)),
      categories: JSON.parse(JSON.stringify(categories)),
    }
  } catch (error) {
    console.error('Error in getInitialProducts:', error)
    return { products: [], categories: [] }
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { products, categories } = await getInitialProducts(searchParams)

  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent" />
        </div>
      }
    >
      <ProductListingClient
        initialProducts={products}
        categories={categories}
        initialSearchParams={searchParams}
      />
    </Suspense>
  )
}
