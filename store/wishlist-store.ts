import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Product } from '@/types'

export interface WishlistStore {
  items: Product[]
  productIds: string[]

  // Core methods
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  isInWishlist: (productId: string) => boolean

  // Aliases and helpers
  addToWishlist: (product: Product) => void
  removeFromWishlist: (productId: string) => void
  toggleWishlist: (product: Product) => void
  clearWishlist: () => void
  getItemCount: () => number
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      productIds: [],

      addItem: (product: Product) => {
        if (!product || !product.id) return
        const { productIds, items } = get()
        if (productIds.includes(product.id)) return

        set({
          items: [product, ...items],
          productIds: [product.id, ...productIds],
        })
      },

      removeItem: (productId: string) => {
        if (!productId) return
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
          productIds: state.productIds.filter((id) => id !== productId),
        }))
      },

      isInWishlist: (productId: string) => {
        if (!productId) return false
        return get().productIds.includes(productId)
      },

      addToWishlist: (product: Product) => {
        get().addItem(product)
      },

      removeFromWishlist: (productId: string) => {
        get().removeItem(productId)
      },

      toggleWishlist: (product: Product) => {
        if (!product || !product.id) return
        if (get().isInWishlist(product.id)) {
          get().removeItem(product.id)
        } else {
          get().addItem(product)
        }
      },

      clearWishlist: () => {
        set({ items: [], productIds: [] })
      },

      getItemCount: () => {
        return get().items.length
      },
    }),
    {
      name: 'luxe-threads-wishlist-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export const useWishlist = useWishlistStore
