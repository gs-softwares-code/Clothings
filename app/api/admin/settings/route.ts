import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    let settings = await db.storeSettings.findFirst()

    if (!settings) {
      settings = await db.storeSettings.create({
        data: {
          storeName: 'LUXE THREADS',
          storeEmail: 'concierge@luxethreads.com',
          storePhone: '+91 98765 43210',
          currency: 'INR',
          currencySymbol: '₹',
          gstRate: 18,
          freeShippingMin: 999,
          shippingCharge: 99,
        },
      })
    }

    return NextResponse.json({ success: true, data: settings })
  } catch (error: any) {
    console.error('Error fetching store settings:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const {
      storeName,
      storeEmail,
      storePhone,
      storeAddress,
      currency,
      currencySymbol,
      gstRate,
      freeShippingMin,
      shippingCharge,
      whatsappNumber,
      instagramUrl,
      facebookUrl,
      twitterUrl,
    } = body

    let settings = await db.storeSettings.findFirst()

    if (!settings) {
      settings = await db.storeSettings.create({
        data: {
          storeName: storeName || 'LUXE THREADS',
          storeEmail,
          storePhone,
          storeAddress,
          currency: currency || 'INR',
          currencySymbol: currencySymbol || '₹',
          gstRate: gstRate !== undefined ? parseFloat(gstRate) : 18,
          freeShippingMin:
            freeShippingMin !== undefined ? parseFloat(freeShippingMin) : 999,
          shippingCharge:
            shippingCharge !== undefined ? parseFloat(shippingCharge) : 99,
          whatsappNumber,
          instagramUrl,
          facebookUrl,
          twitterUrl,
        },
      })
    } else {
      settings = await db.storeSettings.update({
        where: { id: settings.id },
        data: {
          ...(storeName !== undefined && { storeName }),
          ...(storeEmail !== undefined && { storeEmail }),
          ...(storePhone !== undefined && { storePhone }),
          ...(storeAddress !== undefined && { storeAddress }),
          ...(currency !== undefined && { currency }),
          ...(currencySymbol !== undefined && { currencySymbol }),
          ...(gstRate !== undefined && { gstRate: parseFloat(gstRate) }),
          ...(freeShippingMin !== undefined && {
            freeShippingMin: parseFloat(freeShippingMin),
          }),
          ...(shippingCharge !== undefined && {
            shippingCharge: parseFloat(shippingCharge),
          }),
          ...(whatsappNumber !== undefined && { whatsappNumber }),
          ...(instagramUrl !== undefined && { instagramUrl }),
          ...(facebookUrl !== undefined && { facebookUrl }),
          ...(twitterUrl !== undefined && { twitterUrl }),
        },
      })
    }

    return NextResponse.json({ success: true, data: settings })
  } catch (error: any) {
    console.error('Error updating store settings:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update settings' },
      { status: 500 }
    )
  }
}
