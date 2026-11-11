import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { reason } = body

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { success: false, error: 'Reason for return is required' },
        { status: 400 }
      )
    }

    const order = await db.order.findUnique({
      where: { id: params.id },
      include: { returns: true },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    if (order.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const returnRequest = await db.return.create({
      data: {
        orderId: order.id,
        reason: reason.trim(),
        status: 'PENDING',
      },
    })

    return NextResponse.json({ success: true, data: returnRequest }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating return request:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit return' },
      { status: 500 }
    )
  }
}
