// ============================================================
// Core Entity Types
// ============================================================

export interface User {
  id: string
  name?: string | null
  email: string
  emailVerified?: Date | null
  image?: string | null
  password?: string | null
  phone?: string | null
  role: 'CUSTOMER' | 'ADMIN'
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  image?: string | null
  parentId?: string | null
  parent?: Category | null
  children?: Category[]
  products?: Product[]
  createdAt: Date
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  comparePrice?: number | null
  images: string // JSON array string
  categoryId: string
  category?: Category
  fabric?: string | null
  care?: string | null
  tags?: string | null
  badge?: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  variants?: ProductVariant[]
  reviews?: Review[]
  _count?: {
    reviews: number
    wishlistItems: number
  }
  avgRating?: number
}

export interface ProductVariant {
  id: string
  productId: string
  size: string
  color: string
  colorHex?: string | null
  sku: string
  stock: number
  price?: number | null
}

export interface CartItem {
  id: string
  cartId: string
  productId: string
  product: Product
  variantId: string
  variant: ProductVariant
  quantity: number
}

export interface Cart {
  id: string
  userId?: string | null
  sessionId?: string | null
  items: CartItem[]
  createdAt: Date
  updatedAt: Date
}

export interface WishlistItem {
  id: string
  userId: string
  productId: string
  product: Product
  createdAt: Date
}

export interface Address {
  id: string
  userId: string
  name: string
  phone: string
  line1: string
  line2?: string | null
  city: string
  state: string
  pincode: string
  isDefault: boolean
}

export interface Order {
  id: string
  orderNumber: string
  userId?: string | null
  user?: User | null
  guestEmail?: string | null
  guestName?: string | null
  guestPhone?: string | null
  addressId?: string | null
  address?: Address | null
  shippingAddress?: string | null
  items: OrderItem[]
  subtotal: number
  discount: number
  shippingCharge: number
  tax: number
  total: number
  couponCode?: string | null
  status: OrderStatus
  paymentMethod: string
  paymentStatus: PaymentStatus
  paymentId?: string | null
  razorpayOrderId?: string | null
  notes?: string | null
  createdAt: Date
  updatedAt: Date
  returns?: Return[]
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  product?: Product
  productName: string
  size: string
  color: string
  sku: string
  quantity: number
  price: number
  total: number
}

export interface Review {
  id: string
  userId: string
  user?: User
  productId: string
  rating: number
  title?: string | null
  body: string
  isApproved: boolean
  createdAt: Date
}

export interface Coupon {
  id: string
  code: string
  description?: string | null
  type: CouponType
  value: number
  minOrderValue?: number | null
  maxDiscount?: number | null
  usageLimit?: number | null
  usedCount: number
  isActive: boolean
  expiresAt?: Date | null
  createdAt: Date
}

export interface Banner {
  id: string
  title: string
  subtitle?: string | null
  image: string
  link?: string | null
  position: string
  isActive: boolean
  sortOrder: number
  createdAt: Date
}

export interface Return {
  id: string
  orderId: string
  reason: string
  status: string
  createdAt: Date
}

export interface StoreSettings {
  id: string
  storeName: string
  storeEmail?: string | null
  storePhone?: string | null
  storeAddress?: string | null
  currency: string
  currencySymbol: string
  gstRate: number
  freeShippingMin: number
  shippingCharge: number
  whatsappNumber?: string | null
  instagramUrl?: string | null
  facebookUrl?: string | null
  twitterUrl?: string | null
}

// ============================================================
// Enums
// ============================================================

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED'

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'

export type CouponType = 'PERCENTAGE' | 'FIXED'

export type UserRole = 'CUSTOMER' | 'ADMIN'

// ============================================================
// Form / Input Types
// ============================================================

export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  phone?: string
}

export interface AddressFormData {
  name: string
  phone: string
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
  isDefault?: boolean
}

export interface CheckoutFormData {
  name: string
  email: string
  phone: string
  address: AddressFormData
  paymentMethod: 'RAZORPAY' | 'COD'
  notes?: string
}

export interface ReviewFormData {
  rating: number
  title?: string
  body: string
}

// ============================================================
// API Response Types
// ============================================================

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ProductFilters {
  categoryId?: string
  categorySlug?: string
  minPrice?: number
  maxPrice?: number
  sizes?: string[]
  colors?: string[]
  tags?: string[]
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular'
  page?: number
  limit?: number
  search?: string
}

// ============================================================
// Cart / Zustand Store Types
// ============================================================

export interface CartState {
  items: CartItem[]
  isOpen: boolean
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void
  removeItem: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

export interface WishlistState {
  productIds: string[]
  addToWishlist: (productId: string) => void
  removeFromWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
}

// ============================================================
// Razorpay Types
// ============================================================

export interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description?: string
  order_id: string
  handler: (response: RazorpayPaymentResponse) => void
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  theme?: {
    color?: string
  }
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}
