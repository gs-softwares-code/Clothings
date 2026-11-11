import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const rawCode = body.code
    const orderTotal = parseFloat(body.orderTotal ?? body.cartTotal ?? body.subtotal ?? 0)

    if (!rawCode || typeof rawCode !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Coupon code is required' },
        { status: 400 }
      )
    }

    const code = rawCode.trim().toUpperCase()

    const coupon = await db.coupon.findUnique({
      where: { code },
    })

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: 'Invalid coupon code' },
        { status: 404 }
      )
    }

    if (!coupon.isActive) {
      return NextResponse.json(
        { success: false, error: 'This coupon is no longer active' },
        { status: 400 }
      )
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return NextResponse.json(
        { success: false, error: 'This coupon has expired' },
        { status: 400 }
      )
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { success: false, error: 'Coupon usage limit has been reached' },
        { status: 400 }
      )
    }

    if (coupon.minOrderValue !== null && orderTotal < coupon.minOrderValue) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon`,
        },
        { status: 400 }
      )
    }

    // Calculate discount amount
    let discount = 0
    if (coupon.type === 'PERCENTAGE') {
      discount = (orderTotal * coupon.value) / 100
      if (coupon.maxDiscount !== null && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount
      }
    } else if (coupon.type === 'FIXED') {
      discount = Math.min(coupon.value, orderTotal)
    }

    discount = Math.round(discount * 100) / 100
    const finalTotal = Math.max(0, Math.round((orderTotal - discount) * 100) / 100)

    return NextResponse.json({
      success: true,
      message: `Coupon "${coupon.code}" applied successfully!`,
      data: {
        code: coupon.code,
        description: coupon.description,
        type: coupon.type,
        value: coupon.value,
        discount,
        minOrderValue: coupon.minOrderValue,
        maxDiscount: coupon.maxDiscount,
        orderTotal,
        finalTotal,
      },
    })
  } catch (error) {
    console.error('Error validating coupon:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to validate coupon' },
      { status: 500 }
    )
  }
}
