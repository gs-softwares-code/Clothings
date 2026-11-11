import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const coupons = await db.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: coupons })
  } catch (error: any) {
    console.error('Error fetching coupons:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch coupons' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      code,
      description,
      type,
      value,
      minOrderValue,
      maxDiscount,
      usageLimit,
      isActive = true,
      expiresAt,
    } = body

    if (!code || !type || value === undefined) {
      return NextResponse.json(
        { success: false, error: 'Code, type, and value are required' },
        { status: 400 }
      )
    }

    const cleanCode = code.trim().toUpperCase()

    const existing = await db.coupon.findUnique({
      where: { code: cleanCode },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Coupon code already exists' },
        { status: 400 }
      )
    }

    const coupon = await db.coupon.create({
      data: {
        code: cleanCode,
        description: description || null,
        type,
        value: parseFloat(value),
        minOrderValue: minOrderValue ? parseFloat(minOrderValue) : null,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
        isActive: Boolean(isActive),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    })

    return NextResponse.json({ success: true, data: coupon }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating coupon:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create coupon' },
      { status: 500 }
    )
  }
}
