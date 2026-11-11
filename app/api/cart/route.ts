import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

async function resolveIdentifiers(request: NextRequest) {
  const session = await auth()
  const userId = session?.user?.id || null

  const headerSession = request.headers.get('x-session-id')
  const cookieSession = request.cookies.get('cart_session_id')?.value
  const { searchParams } = new URL(request.url)
  const querySession = searchParams.get('sessionId')

  const sessionId = headerSession || cookieSession || querySession || null

  return { userId, sessionId }
}

async function getOrCreateCart(userId: string | null, sessionId: string | null) {
  if (userId) {
    let cart = await db.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    })

    if (!cart) {
      cart = await db.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: true,
              variant: true,
            },
          },
        },
      })
    }

    // Merge guest cart if sessionId is present
    if (sessionId) {
      const guestCart = await db.cart.findUnique({
        where: { sessionId },
        include: { items: true },
      })

      if (guestCart && guestCart.items.length > 0) {
        for (const item of guestCart.items) {
          const existingItem = cart.items.find(
            (i) => i.productId === item.productId && i.variantId === item.variantId
          )
          if (existingItem) {
            await db.cartItem.update({
              where: { id: existingItem.id },
              data: { quantity: existingItem.quantity + item.quantity },
            })
          } else {
            await db.cartItem.create({
              data: {
                cartId: cart.id,
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
              },
            })
          }
        }
        await db.cart.delete({ where: { id: guestCart.id } })

        cart = (await db.cart.findUnique({
          where: { id: cart.id },
          include: {
            items: {
              include: {
                product: true,
                variant: true,
              },
            },
          },
        }))!
      }
    }

    return cart
  }

  if (sessionId) {
    let cart = await db.cart.findUnique({
      where: { sessionId },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    })

    if (!cart) {
      cart = await db.cart.create({
        data: { sessionId },
        include: {
          items: {
            include: {
              product: true,
              variant: true,
            },
          },
        },
      })
    }
    return cart
  }

  return null
}

function formatCartResponse(cart: any) {
  if (!cart) {
    return {
      items: [],
      itemCount: 0,
      subtotal: 0,
    }
  }

  const items = cart.items.map((item: any) => {
    let imagesList: string[] = []
    try {
      imagesList = JSON.parse(item.product.images)
    } catch {
      imagesList = item.product.images ? [item.product.images] : []
    }

    const price = item.variant.price ?? item.product.price
    const itemTotal = price * item.quantity

    return {
      id: item.id,
      cartId: item.cartId,
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      price,
      itemTotal,
      product: {
        ...item.product,
        imagesList,
      },
      variant: item.variant,
    }
  })

  const itemCount = items.reduce((sum: number, item: any) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum: number, item: any) => sum + item.itemTotal, 0)

  return {
    id: cart.id,
    userId: cart.userId,
    sessionId: cart.sessionId,
    items,
    itemCount,
    subtotal,
  }
}

// GET /api/cart
export async function GET(request: NextRequest) {
  try {
    const { userId, sessionId } = await resolveIdentifiers(request)

    if (!userId && !sessionId) {
      return NextResponse.json({
        success: true,
        data: {
          items: [],
          itemCount: 0,
          subtotal: 0,
        },
      })
    }

    const cart = await getOrCreateCart(userId, sessionId)
    return NextResponse.json({
      success: true,
      data: formatCartResponse(cart),
    })
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cart' },
      { status: 500 }
    )
  }
}

// POST /api/cart - Add or increment item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, variantId, quantity = 1, sessionId: bodySessionId } = body

    if (!productId || !variantId) {
      return NextResponse.json(
        { success: false, error: 'Product ID and Variant ID are required' },
        { status: 400 }
      )
    }

    const qty = Math.max(1, parseInt(quantity, 10) || 1)

    // Verify product and variant
    const variant = await db.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true },
    })

    if (!variant || variant.productId !== productId) {
      return NextResponse.json(
        { success: false, error: 'Invalid product variant' },
        { status: 404 }
      )
    }

    if (variant.stock < qty) {
      return NextResponse.json(
        { success: false, error: `Only ${variant.stock} item(s) in stock` },
        { status: 400 }
      )
    }

    const resolved = await resolveIdentifiers(request)
    const userId = resolved.userId
    const sessionId = resolved.sessionId || bodySessionId || crypto.randomUUID()

    const cart = await getOrCreateCart(userId, sessionId)
    if (!cart) {
      return NextResponse.json(
        { success: false, error: 'Failed to find or create cart' },
        { status: 500 }
      )
    }

    // Check existing item
    const existingItem = await db.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        variantId,
      },
    })

    if (existingItem) {
      const newQty = existingItem.quantity + qty
      if (newQty > variant.stock) {
        return NextResponse.json(
          {
            success: false,
            error: `Cannot add more. You have ${existingItem.quantity} in cart, and stock is ${variant.stock}`,
          },
          { status: 400 }
        )
      }
      await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      })
    } else {
      await db.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId,
          quantity: qty,
        },
      })
    }

    const updatedCart = await db.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    })

    const response = NextResponse.json({
      success: true,
      message: 'Item added to cart',
      data: formatCartResponse(updatedCart),
    })

    // If new sessionId generated for guest, set cookie
    if (!userId && !resolved.sessionId) {
      response.cookies.set('cart_session_id', sessionId, {
        path: '/',
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: 'lax',
      })
    }

    return response
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update cart' },
      { status: 500 }
    )
  }
}

// PUT /api/cart - Update item quantity
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { itemId, quantity } = body

    if (!itemId || quantity === undefined) {
      return NextResponse.json(
        { success: false, error: 'Item ID and quantity are required' },
        { status: 400 }
      )
    }

    const targetItem = await db.cartItem.findUnique({
      where: { id: itemId },
      include: { variant: true, cart: true },
    })

    if (!targetItem) {
      return NextResponse.json(
        { success: false, error: 'Cart item not found' },
        { status: 404 }
      )
    }

    const qty = parseInt(quantity, 10)

    if (qty <= 0) {
      await db.cartItem.delete({
        where: { id: itemId },
      })
    } else {
      if (qty > targetItem.variant.stock) {
        return NextResponse.json(
          {
            success: false,
            error: `Only ${targetItem.variant.stock} available in stock`,
          },
          { status: 400 }
        )
      }
      await db.cartItem.update({
        where: { id: itemId },
        data: { quantity: qty },
      })
    }

    const updatedCart = await db.cart.findUnique({
      where: { id: targetItem.cartId },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Cart updated',
      data: formatCartResponse(updatedCart),
    })
  } catch (error) {
    console.error('Error updating cart item:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update cart item' },
      { status: 500 }
    )
  }
}

// DELETE /api/cart - Remove item or clear cart
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const itemIdParam = searchParams.get('itemId')
    const clearParam = searchParams.get('clear') === 'true'

    const { userId, sessionId } = await resolveIdentifiers(request)

    const cart = await getOrCreateCart(userId, sessionId)
    if (!cart) {
      return NextResponse.json({ success: true, message: 'Cart already empty' })
    }

    if (clearParam) {
      await db.cartItem.deleteMany({
        where: { cartId: cart.id },
      })
      return NextResponse.json({
        success: true,
        message: 'Cart cleared successfully',
        data: {
          id: cart.id,
          userId: cart.userId,
          sessionId: cart.sessionId,
          items: [],
          itemCount: 0,
          subtotal: 0,
        },
      })
    }

    if (itemIdParam) {
      const item = await db.cartItem.findFirst({
        where: { id: itemIdParam, cartId: cart.id },
      })
      if (item) {
        await db.cartItem.delete({ where: { id: item.id } })
      }
    }

    const updatedCart = await db.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Item removed from cart',
      data: formatCartResponse(updatedCart),
    })
  } catch (error) {
    console.error('Error deleting from cart:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to remove from cart' },
      { status: 500 }
    )
  }
}
