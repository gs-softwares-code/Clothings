import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Missing required payment verification parameters (razorpay_order_id, razorpay_payment_id, razorpay_signature)',
        },
        { status: 400 }
      )
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'your_razorpay_key_secret'

    // Calculate HMAC SHA256 signature
    const hmac = crypto.createHmac('sha256', keySecret)
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`)
    const generatedSignature = hmac.digest('hex')

    const isSignatureValid = generatedSignature === razorpay_signature

    if (!isSignatureValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid payment signature. Verification failed.',
        },
        { status: 400 }
      )
    }

    // Find and update the corresponding order
    let order = null
    if (orderId) {
      order = await db.order.findFirst({
        where: {
          OR: [{ id: orderId }, { orderNumber: orderId }, { razorpayOrderId: razorpay_order_id }],
        },
      })
    } else {
      order = await db.order.findFirst({
        where: { razorpayOrderId: razorpay_order_id },
      })
    }

    if (order) {
      order = await db.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'PAID',
          status: 'PROCESSING',
          paymentId: razorpay_payment_id,
          razorpayOrderId: razorpay_order_id,
        },
        include: {
          items: true,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and order updated successfully',
      data: order,
    })
  } catch (error: any) {
    console.error('Error verifying Razorpay payment:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Payment verification failed',
      },
      { status: 500 }
    )
  }
}
