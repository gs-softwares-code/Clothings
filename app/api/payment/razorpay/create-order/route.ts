import { NextRequest, NextResponse } from 'next/server'
import { razorpay } from '@/lib/razorpay'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, amount: customAmount, currency = 'INR' } = body

    let amountInPaise = 0
    let receipt = `rcpt_${Date.now()}`
    let notes: Record<string, string> = {}
    let targetOrder = null

    if (orderId) {
      targetOrder = await db.order.findFirst({
        where: {
          OR: [{ id: orderId }, { orderNumber: orderId }],
        },
      })

      if (!targetOrder) {
        return NextResponse.json(
          { success: false, error: 'Order not found' },
          { status: 404 }
        )
      }

      amountInPaise = Math.round(targetOrder.total * 100)
      receipt = targetOrder.orderNumber
      notes = {
        orderId: targetOrder.id,
        orderNumber: targetOrder.orderNumber,
      }
    } else if (customAmount !== undefined && !isNaN(customAmount)) {
      amountInPaise = Math.round(parseFloat(customAmount) * 100)
    } else {
      return NextResponse.json(
        { success: false, error: 'Order ID or amount is required' },
        { status: 400 }
      )
    }

    if (amountInPaise <= 0) {
      return NextResponse.json(
        { success: false, error: 'Amount must be greater than 0' },
        { status: 400 }
      )
    }

    // Create Razorpay order
    const rzpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency,
      receipt,
      notes,
    })

    // If order exists in DB, update razorpayOrderId
    if (targetOrder) {
      await db.order.update({
        where: { id: targetOrder.id },
        data: {
          razorpayOrderId: rzpOrder.id,
        },
      })
    }

    const keyId =
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      process.env.RAZORPAY_KEY_ID ||
      'rzp_test_placeholder'

    return NextResponse.json({
      success: true,
      orderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      key: keyId,
      receipt: rzpOrder.receipt,
    })
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create payment order',
      },
      { status: 500 }
    )
  }
}
