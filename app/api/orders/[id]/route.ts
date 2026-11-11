import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Order ID or order number is required' },
        { status: 400 }
      )
    }

    const order = await db.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        address: true,
        returns: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    const itemsWithImages = order.items.map((item) => {
      let imagesList: string[] = []
      try {
        imagesList = JSON.parse(item.product.images)
      } catch {
        imagesList = item.product.images ? [item.product.images] : []
      }
      return {
        ...item,
        product: {
          ...item.product,
          imagesList,
        },
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...order,
        items: itemsWithImages,
      },
    })
  } catch (error) {
    console.error('Error fetching order details:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch order details' },
      { status: 500 }
    )
  }
}
