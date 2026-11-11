import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const customers = await db.user.findMany({
      where: { role: 'CUSTOMER' },
      include: {
        orders: {
          select: {
            id: true,
            total: true,
            status: true,
            createdAt: true,
          },
        },
        addresses: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const formatted = customers.map((c) => {
      const successfulOrders = c.orders.filter((o) => o.status !== 'CANCELLED')
      const totalSpent = successfulOrders.reduce((sum, o) => sum + o.total, 0)
      return {
        id: c.id,
        name: c.name || 'Private Patron',
        email: c.email,
        phone: c.phone || '—',
        joinedAt: c.createdAt,
        totalOrders: c.orders.length,
        totalSpent,
      }
    })

    return NextResponse.json({ success: true, data: formatted })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}
