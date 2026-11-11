import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { slugify } from '@/lib/utils'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = await db.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        variants: true,
      },
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: product })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch product' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
      isActive,
      variants,
    } = body

    const existingProduct = await db.product.findUnique({
      where: { id: params.id },
      include: { variants: true },
    })

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      )
    }

    const finalSlug = slug ? slugify(slug) : undefined
    const imagesString =
      images !== undefined
        ? Array.isArray(images)
          ? JSON.stringify(images)
          : typeof images === 'string'
          ? images
          : '[]'
        : undefined

    // Transaction to update product and re-sync variants if supplied
    const updated = await db.$transaction(async (tx) => {
      if (Array.isArray(variants)) {
        // Delete old variants
        await tx.productVariant.deleteMany({
          where: { productId: params.id },
        })
        // Create new variants
        await tx.productVariant.createMany({
          data: variants.map((v: any, index: number) => ({
            productId: params.id,
            size: v.size || 'M',
            color: v.color || 'Standard',
            colorHex: v.colorHex || '#000000',
            sku: v.sku || `${existingProduct.slug}-${v.size || 'M'}-${Date.now().toString(36)}-${index}`.toUpperCase(),
            stock: parseInt(v.stock, 10) || 0,
            price: v.price ? parseFloat(v.price) : null,
          })),
        })
      }

      return tx.product.update({
        where: { id: params.id },
        data: {
          ...(name && { name }),
          ...(finalSlug && { slug: finalSlug }),
          ...(description !== undefined && { description }),
          ...(price !== undefined && { price: parseFloat(price) }),
          ...(comparePrice !== undefined && {
            comparePrice: comparePrice ? parseFloat(comparePrice) : null,
          }),
          ...(imagesString !== undefined && { images: imagesString }),
          ...(categoryId && { categoryId }),
          ...(fabric !== undefined && { fabric }),
          ...(care !== undefined && { care }),
          ...(tags !== undefined && { tags }),
          ...(badge !== undefined && { badge }),
          ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        },
        include: {
          category: true,
          variants: true,
        },
      })
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error: any) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.product.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true, message: 'Product deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete product' },
      { status: 500 }
    )
  }
}
