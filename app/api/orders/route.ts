import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { generateOrderNumber } from '@/lib/utils'

export const dynamic = 'force-dynamic'

// GET /api/orders - Get orders for authenticated user
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please sign in to view your orders.' },
        { status: 401 }
      )
    }

    const orders = await db.order.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        address: true,
        returns: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      data: orders,
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user?.id || null

    const body = await request.json()
    const {
      items,
      shippingAddress,
      addressId,
      guestName,
      guestEmail,
      guestPhone,
      couponCode,
      paymentMethod = 'RAZORPAY',
      notes,
    } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order must contain at least one item' },
        { status: 400 }
      )
    }

    if (!userId && (!guestEmail || !guestName)) {
      return NextResponse.json(
        { success: false, error: 'Guest email and name are required for guest checkout' },
        { status: 400 }
      )
    }

    // Fetch store settings
    const settings = await db.storeSettings.findFirst()
    const gstRate = settings?.gstRate ?? 18
    const freeShippingMin = settings?.freeShippingMin ?? 999
    const standardShippingCharge = settings?.shippingCharge ?? 99

    // Validate each item and calculate subtotal
    const validatedItems: Array<{
      variantId: string
      productId: string
      productName: string
      size: string
      color: string
      sku: string
      quantity: number
      price: number
      total: number
    }> = []

    let subtotal = 0

    for (const item of items) {
      const quantity = Math.max(1, parseInt(item.quantity, 10) || 1)
      const variant = await db.productVariant.findUnique({
        where: { id: item.variantId },
        include: { product: true },
      })

      if (!variant) {
        return NextResponse.json(
          { success: false, error: `Product variant not found (ID: ${item.variantId})` },
          { status: 400 }
        )
      }

      if (variant.stock < quantity) {
        return NextResponse.json(
          {
            success: false,
            error: `Insufficient stock for "${variant.product.name}" (${variant.size} - ${variant.color}). Available: ${variant.stock}`,
          },
          { status: 400 }
        )
      }

      const price = variant.price ?? variant.product.price
      const total = price * quantity

      subtotal += total

      validatedItems.push({
        variantId: variant.id,
        productId: variant.productId,
        productName: variant.product.name,
        size: variant.size,
        color: variant.color,
        sku: variant.sku,
        quantity,
        price,
        total,
      })
    }

    // Validate coupon and calculate discount
    let discount = 0
    let verifiedCoupon: any = null

    if (couponCode && typeof couponCode === 'string') {
      const code = couponCode.trim().toUpperCase()
      const coupon = await db.coupon.findUnique({
        where: { code },
      })

      if (coupon && coupon.isActive) {
        const notExpired = !coupon.expiresAt || new Date() <= coupon.expiresAt
        const withinLimit = coupon.usageLimit === null || coupon.usedCount < coupon.usageLimit
        const meetsMin = coupon.minOrderValue === null || subtotal >= coupon.minOrderValue

        if (notExpired && withinLimit && meetsMin) {
          verifiedCoupon = coupon
          if (coupon.type === 'PERCENTAGE') {
            discount = (subtotal * coupon.value) / 100
            if (coupon.maxDiscount !== null && discount > coupon.maxDiscount) {
              discount = coupon.maxDiscount
            }
          } else if (coupon.type === 'FIXED') {
            discount = Math.min(coupon.value, subtotal)
          }
          discount = Math.round(discount * 100) / 100
        }
      }
    }

    const discountedSubtotal = Math.max(0, subtotal - discount)
    const shippingCharge = discountedSubtotal >= freeShippingMin ? 0 : standardShippingCharge
    const tax = Math.round((discountedSubtotal * (gstRate / 100)) * 100) / 100
    const total = Math.round((discountedSubtotal + shippingCharge + tax) * 100) / 100

    // Format shipping address string
    let shippingAddressStr = ''
    if (typeof shippingAddress === 'string') {
      shippingAddressStr = shippingAddress
    } else if (shippingAddress && typeof shippingAddress === 'object') {
      shippingAddressStr = JSON.stringify(shippingAddress)
    }

    // Generate unique order number
    const orderNumber = generateOrderNumber()

    // Execute in Prisma transaction
    const order = await db.$transaction(async (tx) => {
      // 1. Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          guestName: !userId ? guestName : null,
          guestEmail: !userId ? guestEmail : null,
          guestPhone: !userId ? guestPhone : null,
          addressId: addressId || null,
          shippingAddress: shippingAddressStr,
          subtotal,
          discount,
          shippingCharge,
          tax,
          total,
          couponCode: verifiedCoupon ? verifiedCoupon.code : null,
          status: 'PENDING',
          paymentMethod,
          paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
          notes: notes || null,
          items: {
            create: validatedItems.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              size: item.size,
              color: item.color,
              sku: item.sku,
              quantity: item.quantity,
              price: item.price,
              total: item.total,
            })),
          },
        },
        include: {
          items: true,
          address: true,
        },
      })

      // 2. Decrement stock for each variant
      for (const item of validatedItems) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })
      }

      // 3. Update coupon usedCount if applied
      if (verifiedCoupon) {
        await tx.coupon.update({
          where: { id: verifiedCoupon.id },
          data: {
            usedCount: {
              increment: 1,
            },
          },
        })
      }

      // 4. Clear user cart if userId exists
      if (userId) {
        const userCart = await tx.cart.findUnique({
          where: { userId },
        })
        if (userCart) {
          await tx.cartItem.deleteMany({
            where: { cartId: userCart.id },
          })
        }
      }

      return newOrder
    })

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      data: order,
    })
  } catch (error: any) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create order' },
      { status: 500 }
    )
  }
}
