import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = newsletterSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.errors[0]?.message || 'Invalid email address',
        },
        { status: 400 }
      )
    }

    const email = validation.data.email.toLowerCase().trim()

    // Check if email already subscribed
    const existing = await db.newsletter.findUnique({
      where: { email },
    })

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'You are already subscribed to our newsletter.',
      })
    }

    await db.newsletter.create({
      data: { email },
    })

    return NextResponse.json({
      success: true,
      message: 'Thank you for subscribing to Luxe Threads updates and exclusive privileges.',
    })
  } catch (error) {
    console.error('Error subscribing to newsletter:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to subscribe to newsletter' },
      { status: 500 }
    )
  }
}
