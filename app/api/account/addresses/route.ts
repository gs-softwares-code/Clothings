import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const addressSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Please enter a valid 10-digit phone number'),
  line1: z.string().min(5, 'Street address is required'),
  line2: z.string().optional().nullable(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().min(6, 'Pincode must be at least 6 characters'),
  isDefault: z.boolean().optional(),
})

// GET /api/account/addresses - List addresses for authenticated user
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const addresses = await db.address.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: [
        { isDefault: 'desc' },
        { id: 'desc' },
      ],
    })

    return NextResponse.json({
      success: true,
      data: addresses,
    })
  } catch (error) {
    console.error('Error fetching addresses:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch addresses' },
      { status: 500 }
    )
  }
}

// POST /api/account/addresses - Add new address
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validation = addressSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.errors[0]?.message || 'Invalid address data',
        },
        { status: 400 }
      )
    }

    const data = validation.data
    const userId = session.user.id

    // Check count of user's existing addresses
    const existingCount = await db.address.count({
      where: { userId },
    })

    // If first address or marked default, it should be default
    const shouldBeDefault = existingCount === 0 || !!data.isDefault

    if (shouldBeDefault && existingCount > 0) {
      await db.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      })
    }

    const address = await db.address.create({
      data: {
        userId,
        name: data.name,
        phone: data.phone,
        line1: data.line1,
        line2: data.line2 || null,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        isDefault: shouldBeDefault,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Address added successfully',
      data: address,
    })
  } catch (error) {
    console.error('Error adding address:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add address' },
      { status: 500 }
    )
  }
}

// PUT /api/account/addresses - Update existing address
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, ...rest } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Address ID is required' },
        { status: 400 }
      )
    }

    const validation = addressSchema.partial().safeParse(rest)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.errors[0]?.message || 'Invalid address data',
        },
        { status: 400 }
      )
    }

    const userId = session.user.id
    const existingAddress = await db.address.findFirst({
      where: { id, userId },
    })

    if (!existingAddress) {
      return NextResponse.json(
        { success: false, error: 'Address not found or does not belong to you' },
        { status: 404 }
      )
    }

    const data = validation.data

    if (data.isDefault) {
      await db.address.updateMany({
        where: { userId, id: { not: id } },
        data: { isDefault: false },
      })
    }

    const updatedAddress = await db.address.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.phone && { phone: data.phone }),
        ...(data.line1 && { line1: data.line1 }),
        ...(data.line2 !== undefined && { line2: data.line2 || null }),
        ...(data.city && { city: data.city }),
        ...(data.state && { state: data.state }),
        ...(data.pincode && { pincode: data.pincode }),
        ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Address updated successfully',
      data: updatedAddress,
    })
  } catch (error) {
    console.error('Error updating address:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update address' },
      { status: 500 }
    )
  }
}

// DELETE /api/account/addresses - Delete address
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    let addressId = searchParams.get('id')

    if (!addressId) {
      try {
        const body = await request.json()
        addressId = body.id
      } catch {
        // empty body
      }
    }

    if (!addressId) {
      return NextResponse.json(
        { success: false, error: 'Address ID is required' },
        { status: 400 }
      )
    }

    const userId = session.user.id
    const existing = await db.address.findFirst({
      where: { id: addressId, userId },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Address not found' },
        { status: 404 }
      )
    }

    await db.address.delete({
      where: { id: addressId },
    })

    // If the deleted address was default, promote the next one to default
    if (existing.isDefault) {
      const nextAddress = await db.address.findFirst({
        where: { userId },
        orderBy: { id: 'desc' },
      })
      if (nextAddress) {
        await db.address.update({
          where: { id: nextAddress.id },
          data: { isDefault: true },
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Address deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting address:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete address' },
      { status: 500 }
    )
  }
}
