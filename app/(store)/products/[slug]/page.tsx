import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { db } from '@/lib/db'
import ProductDetailView from '@/components/store/product/product-detail-view'
import { parseProductImages } from '@/components/store/product/product-card'

interface ProductPageProps {
  params: {
    slug: string
  }
}

export const dynamic = 'force-dynamic'

async function getProductBySlug(slug: string) {
  try {
    const product = await db.product.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
        isActive: true,
      },
      include: {
        category: true,
        variants: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!product) return null

    // Fetch related products in the same category
    const relatedProducts = await db.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isActive: true,
      },
      include: {
        category: true,
        variants: true,
      },
      take: 4,
    })

    return {
      product: JSON.parse(JSON.stringify(product)),
      relatedProducts: JSON.parse(JSON.stringify(relatedProducts)),
    }
  } catch (error) {
    console.error('Error fetching product by slug:', error)
    return null
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const data = await getProductBySlug(params.slug)
  if (!data?.product) {
    return {
      title: 'Product Not Found',
    }
  }

  const images = parseProductImages(data.product.images)
  const primaryImg = images[0]

  return {
    title: data.product.name,
    description: data.product.description,
    openGraph: {
      title: `${data.product.name} | LUXE THREADS`,
      description: data.product.description,
      images: primaryImg ? [{ url: primaryImg }] : [],
    },
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const data = await getProductBySlug(params.slug)

  if (!data?.product) {
    notFound()
  }

  return (
    <ProductDetailView
      product={data.product}
      relatedProducts={data.relatedProducts}
    />
  )
}
