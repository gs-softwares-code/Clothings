import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { formatPrice } from '@/lib/utils'
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  MapPin,
  Calendar,
  CreditCard,
  Printer,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: {
    orderNumber: string
  }
}

export default async function OrderConfirmationPage({ params }: PageProps) {
  const { orderNumber } = params

  const order = await db.order.findFirst({
    where: {
      OR: [{ orderNumber }, { id: orderNumber }],
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      address: true,
      user: true,
    },
  })

  if (!order) {
    notFound()
  }

  // Parse shipping address
  let parsedAddress: any = null
  if (order.address) {
    parsedAddress = order.address
  } else if (order.shippingAddress) {
    try {
      parsedAddress = JSON.parse(order.shippingAddress)
    } catch {
      parsedAddress = { line1: order.shippingAddress }
    }
  }

  // Estimated delivery: 3 to 5 days from creation
  const orderDate = new Date(order.createdAt)
  const minEst = new Date(orderDate)
  minEst.setDate(minEst.getDate() + 3)
  const maxEst = new Date(orderDate)
  maxEst.setDate(maxEst.getDate() + 5)

  const dateOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
  }
  const estimateString = `${minEst.toLocaleDateString(
    'en-IN',
    dateOptions
  )} - ${maxEst.toLocaleDateString('en-IN', dateOptions)}`

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Success Banner */}
        <div className="p-8 bg-gradient-to-b from-stone-900/90 to-stone-950 rounded-xl border border-stone-800 text-center space-y-3 relative overflow-hidden">
          <div className="w-16 h-16 bg-amber-400/10 border border-amber-400/30 rounded-full flex items-center justify-center mx-auto text-amber-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-amber-400 font-mono block">
            Acquisition Confirmed
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-white tracking-wide">
            Thank you for your order.
          </h1>
          <p className="text-xs text-stone-300 max-w-lg mx-auto font-light leading-relaxed">
            Your sartorial acquisition has been logged with our Maison atelier. A confirmation receipt has been dispatched to{' '}
            <span className="text-white font-medium">
              {order.user?.email || order.guestEmail || 'your email'}
            </span>
            .
          </p>

          <div className="pt-2 flex items-center justify-center space-x-3 text-xs font-mono text-amber-300">
            <span>REFERENCE:</span>
            <span className="bg-stone-900 px-3 py-1 rounded border border-stone-800 tracking-wider">
              {order.orderNumber}
            </span>
          </div>
        </div>

        {/* Fulfillment Pipeline Stepper */}
        <div className="p-6 bg-stone-900/40 rounded-lg border border-stone-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800 text-xs">
            <span className="font-semibold uppercase tracking-wider text-stone-200">
              Fulfillment Journey
            </span>
            <span className="text-amber-300 font-mono">
              Estimated Delivery: {estimateString}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="space-y-1.5 text-center">
              <div className="w-8 h-8 rounded-full bg-amber-400 text-stone-950 font-bold mx-auto flex items-center justify-center text-xs">
                ✓
              </div>
              <p className="text-xs font-medium text-white">Confirmed</p>
              <p className="text-[10px] text-stone-400">Order logged</p>
            </div>

            <div className="space-y-1.5 text-center">
              <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-bold ${
                ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status)
                  ? 'bg-amber-400 text-stone-950'
                  : 'bg-stone-800 text-stone-400 border border-stone-700'
              }`}>
                2
              </div>
              <p className="text-xs font-medium text-white">Atelier Prep</p>
              <p className="text-[10px] text-stone-400">Garment inspection</p>
            </div>

            <div className="space-y-1.5 text-center">
              <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-bold ${
                ['SHIPPED', 'DELIVERED'].includes(order.status)
                  ? 'bg-amber-400 text-stone-950'
                  : 'bg-stone-800 text-stone-400 border border-stone-700'
              }`}>
                3
              </div>
              <p className="text-xs font-medium text-white">In Transit</p>
              <p className="text-[10px] text-stone-400">Priority logistics</p>
            </div>

            <div className="space-y-1.5 text-center">
              <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-bold ${
                order.status === 'DELIVERED'
                  ? 'bg-amber-400 text-stone-950'
                  : 'bg-stone-800 text-stone-400 border border-stone-700'
              }`}>
                4
              </div>
              <p className="text-xs font-medium text-white">Delivered</p>
              <p className="text-[10px] text-stone-400">White glove delivery</p>
            </div>
          </div>
        </div>

        {/* Dossier Information Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          {/* Shipping Address */}
          <div className="p-6 bg-stone-900/40 rounded-lg border border-stone-800 space-y-3">
            <div className="flex items-center space-x-2 text-stone-400 uppercase text-[10px] font-semibold tracking-wider">
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Destination Coordinates</span>
            </div>
            {parsedAddress ? (
              <div className="text-stone-300 leading-relaxed space-y-1">
                <p className="font-semibold text-white">
                  {parsedAddress.name || order.user?.name || order.guestName}
                </p>
                <p>{parsedAddress.line1}</p>
                {parsedAddress.line2 && <p>{parsedAddress.line2}</p>}
                <p>
                  {parsedAddress.city}, {parsedAddress.state} -{' '}
                  {parsedAddress.pincode}
                </p>
                <p className="text-[11px] text-stone-400">
                  Contact: {parsedAddress.phone || order.guestPhone || 'On File'}
                </p>
              </div>
            ) : (
              <p className="text-stone-400">Standard Atelier Dispatch</p>
            )}
          </div>

          {/* Payment Method */}
          <div className="p-6 bg-stone-900/40 rounded-lg border border-stone-800 space-y-3">
            <div className="flex items-center space-x-2 text-stone-400 uppercase text-[10px] font-semibold tracking-wider">
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>Payment Details</span>
            </div>
            <div className="space-y-1 text-stone-300">
              <p className="font-semibold text-white">
                {order.paymentMethod === 'RAZORPAY'
                  ? 'Razorpay Online Settlement'
                  : 'Cash / UPI on Delivery'}
              </p>
              <p className="text-[11px] text-stone-400">
                Payment Status:{' '}
                <span className="text-amber-400 font-medium uppercase font-mono">
                  {order.paymentStatus}
                </span>
              </p>
              {order.paymentId && (
                <p className="text-[10px] font-mono text-stone-400">
                  Transaction Ref: {order.paymentId}
                </p>
              )}
              <div className="pt-2 text-[11px] text-stone-400 flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified by Luxe Threads Atelier</span>
              </div>
            </div>
          </div>
        </div>

        {/* Garments Acquired Table */}
        <div className="p-6 bg-stone-900/40 rounded-lg border border-stone-800 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-200 pb-2 border-b border-stone-800">
            Acquired Garments ({order.items.length})
          </h2>

          <div className="divide-y divide-stone-800/80">
            {order.items.map((item) => {
              let parsedImages: string[] = []
              try {
                parsedImages =
                  typeof item.product.images === 'string'
                    ? JSON.parse(item.product.images)
                    : item.product.images
              } catch {
                parsedImages = item.product.images
                  ? [item.product.images as any]
                  : []
              }
              const thumbnail =
                parsedImages[0] ||
                'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=300'

              return (
                <div
                  key={item.id}
                  className="py-4 first:pt-2 last:pb-0 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative w-14 h-16 bg-stone-900 rounded overflow-hidden flex-shrink-0 border border-stone-800">
                      <Image
                        src={thumbnail}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="font-medium text-white hover:text-amber-300 transition"
                      >
                        {item.productName}
                      </Link>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        Size: {item.size} • Color: {item.color} • SKU: {item.sku}
                      </p>
                      <p className="text-[10px] text-stone-400 font-mono">
                        {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>

                  <div className="font-serif text-sm font-medium text-amber-300 text-right">
                    {formatPrice(item.total)}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pricing Ledger */}
          <div className="pt-4 border-t border-stone-800 space-y-2 text-xs">
            <div className="flex justify-between text-stone-400">
              <span>Subtotal</span>
              <span className="font-serif text-stone-200">
                {formatPrice(order.subtotal)}
              </span>
            </div>

            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Voucher Privilege ({order.couponCode})</span>
                <span className="font-serif">-{formatPrice(order.discount)}</span>
              </div>
            )}

            <div className="flex justify-between text-stone-400">
              <span>White Glove Logistics</span>
              <span className="text-stone-200">
                {order.shippingCharge === 0
                  ? 'Complimentary'
                  : formatPrice(order.shippingCharge)}
              </span>
            </div>

            <div className="flex justify-between text-stone-400">
              <span>Estimated GST (18%)</span>
              <span className="font-serif text-stone-200">
                {formatPrice(order.tax)}
              </span>
            </div>

            <div className="pt-3 border-t border-stone-800 flex justify-between items-baseline font-serif">
              <span className="text-base text-white">Total Settled</span>
              <span className="text-xl text-amber-400 font-bold">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <Link
            href="/products"
            className="inline-flex items-center space-x-2 text-xs text-amber-400 hover:text-amber-300 transition uppercase tracking-wider"
          >
            <span>Explore Further Collections</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <div className="flex items-center space-x-3">
            <Link
              href="/account/orders"
              className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-200 text-xs font-semibold uppercase tracking-wider rounded transition border border-stone-800"
            >
              View in Patron Suite
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
