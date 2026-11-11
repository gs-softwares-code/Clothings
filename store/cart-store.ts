import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Product, ProductVariant } from '@/types'

export interface CartItem {
  id: string
  cartId?: string
  productId: string
  product: Product
  variantId?: string
  variant?: ProductVariant
  size?: string
  color?: string
  quantity: number
}

export interface AppliedCoupon {
  code: string
  type: 'PERCENTAGE' | 'FIXED'
  value: number
  minOrderValue?: number
  maxDiscount?: number
}

export interface CartStore {
  items: CartItem[]
  isOpen: boolean
  appliedCoupon: AppliedCoupon | null
  
  // Drawer controls
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  setIsOpen: (isOpen: boolean) => void

  // Cart actions
  addItem: (
    product: Product,
    variant?: (Partial<ProductVariant> & { id?: string; size?: string; color?: string; price?: number | null }) | null,
    quantity?: number
  ) => void
  removeItem: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, quantity: number) => void
  clearCart: () => void

  // Coupons
  applyCoupon: (
    couponOrCode: string | { code: string; type: 'PERCENTAGE' | 'FIXED'; value: number; minOrderValue?: number; maxDiscount?: number }
  ) => { success: boolean; message: string }
  removeCoupon: () => void

  // Calculations
  getSubtotal: () => number
  getItemCount: () => number
  getTotalItems: () => number
  getTotalPrice: () => number
  getDiscount: () => number
  getShippingFee: () => number
  getTotal: () => number
}

// Built-in standard coupons for fallback/testing
const KNOWN_COUPONS: Record<string, { type: 'PERCENTAGE' | 'FIXED'; value: number; minOrderValue?: number; maxDiscount?: number }> = {
  LUXE15: { type: 'PERCENTAGE', value: 15, minOrderValue: 999, maxDiscount: 1500 },
  WELCOME10: { type: 'PERCENTAGE', value: 10, minOrderValue: 500, maxDiscount: 1000 },
  FASHION20: { type: 'PERCENTAGE', value: 20, minOrderValue: 1999, maxDiscount: 2000 },
  FLAT500: { type: 'FIXED', value: 500, minOrderValue: 2500 },
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      appliedCoupon: null,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      setIsOpen: (isOpen: boolean) => set({ isOpen }),

      addItem: (product, variant, quantity = 1) => {
        if (!product || quantity <= 0) return

        const size = variant?.size || 'Standard'
        const color = variant?.color || 'Default'
        const variantId = variant?.id || `${size}-${color}`
        const cartItemId = `${product.id}-${variantId}`

        set((state) => {
          const existingIndex = state.items.findIndex((item) => item.id === cartItemId)
          if (existingIndex > -1) {
            const updatedItems = [...state.items]
            const existingItem = updatedItems[existingIndex]
            updatedItems[existingIndex] = {
              ...existingItem,
              quantity: existingItem.quantity + quantity,
            }
            return { items: updatedItems, isOpen: true }
          } else {
            const newItem: CartItem = {
              id: cartItemId,
              productId: product.id,
              product,
              variantId: variant?.id,
              variant: variant as ProductVariant | undefined,
              size,
              color,
              quantity,
            }
            return { items: [...state.items, newItem], isOpen: true }
          }
        })
      },

      removeItem: (cartItemId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== cartItemId),
        }))
      },

      updateQuantity: (cartItemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(cartItemId)
          return
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.id === cartItemId ? { ...item, quantity } : item
          ),
        }))
      },

      clearCart: () => {
        set({ items: [], appliedCoupon: null })
      },

      applyCoupon: (couponOrCode) => {
        const subtotal = get().getSubtotal()

        let couponToApply: AppliedCoupon | null = null

        if (typeof couponOrCode === 'string') {
          const upper = couponOrCode.trim().toUpperCase()
          const known = KNOWN_COUPONS[upper]
          if (known) {
            couponToApply = { code: upper, ...known }
          } else {
            return {
              success: false,
              message: `Invalid coupon code "${upper}". Try LUXE15 or WELCOME10.`,
            }
          }
        } else if (couponOrCode && couponOrCode.code) {
          couponToApply = {
            code: couponOrCode.code.toUpperCase(),
            type: couponOrCode.type,
            value: couponOrCode.value,
            minOrderValue: couponOrCode.minOrderValue,
            maxDiscount: couponOrCode.maxDiscount,
          }
        }

        if (!couponToApply) {
          return { success: false, message: 'Invalid coupon format.' }
        }

        if (couponToApply.minOrderValue && subtotal < couponToApply.minOrderValue) {
          return {
            success: false,
            message: `Coupon requires minimum order of ₹${couponToApply.minOrderValue}.`,
          }
        }

        set({ appliedCoupon: couponToApply })
        return {
          success: true,
          message: `Coupon ${couponToApply.code} applied successfully!`,
        }
      },

      removeCoupon: () => {
        set({ appliedCoupon: null })
      },

      getSubtotal: () => {
        const { items } = get()
        return items.reduce((total, item) => {
          const price = item.variant?.price ?? item.product.price ?? 0
          return total + price * item.quantity
        }, 0)
      },

      getItemCount: () => {
        const { items } = get()
        return items.reduce((count, item) => count + item.quantity, 0)
      },

      getTotalItems: () => {
        return get().getItemCount()
      },

      getTotalPrice: () => {
        return get().getTotal()
      },

      getDiscount: () => {
        const { appliedCoupon } = get()
        if (!appliedCoupon) return 0

        const subtotal = get().getSubtotal()
        let discount = 0

        if (appliedCoupon.type === 'PERCENTAGE') {
          discount = (subtotal * appliedCoupon.value) / 100
          if (appliedCoupon.maxDiscount && discount > appliedCoupon.maxDiscount) {
            discount = appliedCoupon.maxDiscount
          }
        } else {
          discount = appliedCoupon.value
        }

        return Math.min(Math.round(discount), subtotal)
      },

      getShippingFee: () => {
        const subtotal = get().getSubtotal()
        if (subtotal === 0) return 0
        return subtotal >= 999 ? 0 : 99
      },

      getTotal: () => {
        const subtotal = get().getSubtotal()
        if (subtotal === 0) return 0
        const discount = get().getDiscount()
        const shipping = get().getShippingFee()
        return Math.max(0, subtotal - discount + shipping)
      },
    }),
    {
      name: 'luxe-threads-cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        appliedCoupon: state.appliedCoupon,
      }),
    }
  )
)

export const useCart = useCartStore
