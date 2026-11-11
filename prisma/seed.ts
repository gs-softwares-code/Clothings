import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // ============================================================
  // 1. Store Settings
  // ============================================================
  await prisma.storeSettings.deleteMany()
  await prisma.storeSettings.create({
    data: {
      storeName: 'LUXE THREADS',
      storeEmail: 'hello@luxethreads.com',
      storePhone: '+91 98765 43210',
      storeAddress: 'Level 4, Phoenix Palladium, Lower Parel, Mumbai - 400013',
      currency: 'INR',
      currencySymbol: '₹',
      gstRate: 18,
      freeShippingMin: 999,
      shippingCharge: 99,
      whatsappNumber: '+919876543210',
      instagramUrl: 'https://instagram.com/luxethreads',
      facebookUrl: 'https://facebook.com/luxethreads',
      twitterUrl: 'https://twitter.com/luxethreads',
    },
  })
  console.log('✅ Store settings created')

  // ============================================================
  // 2. Users
  // ============================================================
  await prisma.user.deleteMany()

  const adminPassword = await bcrypt.hash('Admin@123', 12)
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@luxethreads.com',
      password: adminPassword,
      role: 'ADMIN',
      phone: '+919876543210',
    },
  })

  const customerPassword = await bcrypt.hash('Test@123', 12)
  const customerUser = await prisma.user.create({
    data: {
      name: 'Test Customer',
      email: 'test@example.com',
      password: customerPassword,
      role: 'CUSTOMER',
      phone: '+919000000000',
    },
  })

  console.log(`✅ Users created: ${adminUser.email}, ${customerUser.email}`)

  // ============================================================
  // 3. Categories
  // ============================================================
  await prisma.category.deleteMany()

  const menCat = await prisma.category.create({
    data: {
      name: 'Men',
      slug: 'men',
      description: 'Premium menswear — from refined casuals to formal essentials',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
    },
  })

  const womenCat = await prisma.category.create({
    data: {
      name: 'Women',
      slug: 'women',
      description: 'Elegant womenswear curated for the modern Indian woman',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
    },
  })

  const kidsCat = await prisma.category.create({
    data: {
      name: 'Kids',
      slug: 'kids',
      description: 'Adorable and comfortable clothing for little ones',
      image: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=800&q=80',
    },
  })

  const accessoriesCat = await prisma.category.create({
    data: {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Handcrafted accessories to complete every look',
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
    },
  })

  // Subcategories — Men
  const menShirts = await prisma.category.create({
    data: { name: 'Shirts', slug: 'men-shirts', parentId: menCat.id },
  })
  const menKurtas = await prisma.category.create({
    data: { name: 'Kurtas', slug: 'men-kurtas', parentId: menCat.id },
  })
  const menTrousers = await prisma.category.create({
    data: { name: 'Trousers', slug: 'men-trousers', parentId: menCat.id },
  })

  // Subcategories — Women
  const womenKurtis = await prisma.category.create({
    data: { name: 'Kurtis', slug: 'women-kurtis', parentId: womenCat.id },
  })
  const womenDresses = await prisma.category.create({
    data: { name: 'Dresses', slug: 'women-dresses', parentId: womenCat.id },
  })
  const womenSarees = await prisma.category.create({
    data: { name: 'Sarees', slug: 'women-sarees', parentId: womenCat.id },
  })

  // Subcategories — Kids
  const kidsBoys = await prisma.category.create({
    data: { name: "Boys' Wear", slug: 'kids-boys', parentId: kidsCat.id },
  })
  const kidsGirls = await prisma.category.create({
    data: { name: "Girls' Wear", slug: 'kids-girls', parentId: kidsCat.id },
  })

  // Subcategories — Accessories
  const accScarves = await prisma.category.create({
    data: { name: 'Scarves & Stoles', slug: 'accessories-scarves', parentId: accessoriesCat.id },
  })
  const accBags = await prisma.category.create({
    data: { name: 'Bags', slug: 'accessories-bags', parentId: accessoriesCat.id },
  })

  console.log('✅ Categories created')

  // ============================================================
  // 4. Products
  // ============================================================
  await prisma.productVariant.deleteMany()
  await prisma.product.deleteMany()

  // ---- Helper: create product with variants ----
  async function createProduct(data: {
    name: string
    slug: string
    description: string
    price: number
    comparePrice?: number
    images: string[]
    categoryId: string
    fabric?: string
    care?: string
    tags?: string
    badge?: string
    variants: Array<{
      size: string
      color: string
      colorHex?: string
      sku: string
      stock: number
    }>
  }) {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        comparePrice: data.comparePrice,
        images: JSON.stringify(data.images),
        categoryId: data.categoryId,
        fabric: data.fabric,
        care: data.care,
        tags: data.tags,
        badge: data.badge,
        isActive: true,
      },
    })
    for (const v of data.variants) {
      await prisma.productVariant.create({
        data: {
          productId: product.id,
          size: v.size,
          color: v.color,
          colorHex: v.colorHex,
          sku: v.sku,
          stock: v.stock,
        },
      })
    }
    return product
  }

  // ---- MEN — 6 products ----
  await createProduct({
    name: 'Khadi Linen Bandhgala Kurta',
    slug: 'khadi-linen-bandhgala-kurta',
    description:
      'A refined bandhgala kurta in handwoven khadi linen. The structured collar and flared hem lend a regal silhouette, perfect for festive occasions and formal gatherings.',
    price: 3499,
    comparePrice: 4999,
    images: [
      'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800&q=80',
      'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=800&q=80',
    ],
    categoryId: menKurtas.id,
    fabric: '100% Handwoven Khadi Linen',
    care: 'Dry clean recommended. Light iron on reverse.',
    tags: 'kurta,ethnic,festive,bandhgala,linen',
    badge: 'BESTSELLER',
    variants: [
      { size: 'S', color: 'Off White', colorHex: '#FAF9F6', sku: 'KLB-S-OW', stock: 15 },
      { size: 'M', color: 'Off White', colorHex: '#FAF9F6', sku: 'KLB-M-OW', stock: 20 },
      { size: 'L', color: 'Off White', colorHex: '#FAF9F6', sku: 'KLB-L-OW', stock: 18 },
      { size: 'XL', color: 'Off White', colorHex: '#FAF9F6', sku: 'KLB-XL-OW', stock: 10 },
      { size: 'M', color: 'Sage Green', colorHex: '#8FAF7E', sku: 'KLB-M-SG', stock: 12 },
      { size: 'L', color: 'Sage Green', colorHex: '#8FAF7E', sku: 'KLB-L-SG', stock: 10 },
    ],
  })

  await createProduct({
    name: 'Egyptian Cotton Oxford Shirt',
    slug: 'egyptian-cotton-oxford-shirt',
    description:
      'Precision-cut from two-ply Egyptian cotton, this Oxford shirt balances boardroom authority with weekend ease. Mother-of-pearl buttons and a slim spread collar define its understated luxury.',
    price: 2299,
    comparePrice: 2999,
    images: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    ],
    categoryId: menShirts.id,
    fabric: '100% Egyptian Cotton (120s)',
    care: 'Machine wash cold. Tumble dry low. Warm iron.',
    tags: 'shirt,formal,cotton,oxford,office',
    badge: 'NEW',
    variants: [
      { size: '38', color: 'Sky Blue', colorHex: '#87CEEB', sku: 'ECO-38-SB', stock: 20 },
      { size: '40', color: 'Sky Blue', colorHex: '#87CEEB', sku: 'ECO-40-SB', stock: 25 },
      { size: '42', color: 'Sky Blue', colorHex: '#87CEEB', sku: 'ECO-42-SB', stock: 15 },
      { size: '40', color: 'White', colorHex: '#FFFFFF', sku: 'ECO-40-WH', stock: 30 },
      { size: '42', color: 'White', colorHex: '#FFFFFF', sku: 'ECO-42-WH', stock: 20 },
      { size: '44', color: 'White', colorHex: '#FFFFFF', sku: 'ECO-44-WH', stock: 10 },
    ],
  })

  await createProduct({
    name: 'Wool-Blend Slim Trousers',
    slug: 'wool-blend-slim-trousers',
    description:
      'Tailored in a premium wool-blend fabric, these slim-fit trousers drape beautifully and resist creasing. A clean waistband and concealed zip make them office-ready in seconds.',
    price: 2799,
    comparePrice: 3499,
    images: [
      'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=800&q=80',
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80',
    ],
    categoryId: menTrousers.id,
    fabric: '65% Wool, 35% Polyester blend',
    care: 'Dry clean only. Hang after wear.',
    tags: 'trousers,formal,wool,slim,office',
    badge: 'SALE',
    variants: [
      { size: '30', color: 'Charcoal', colorHex: '#36454F', sku: 'WST-30-CH', stock: 12 },
      { size: '32', color: 'Charcoal', colorHex: '#36454F', sku: 'WST-32-CH', stock: 18 },
      { size: '34', color: 'Charcoal', colorHex: '#36454F', sku: 'WST-34-CH', stock: 15 },
      { size: '32', color: 'Navy', colorHex: '#001F5B', sku: 'WST-32-NV', stock: 10 },
      { size: '34', color: 'Navy', colorHex: '#001F5B', sku: 'WST-34-NV', stock: 10 },
      { size: '36', color: 'Navy', colorHex: '#001F5B', sku: 'WST-36-NV', stock: 8 },
    ],
  })

  await createProduct({
    name: 'Printed Mandarin Collar Kurta',
    slug: 'printed-mandarin-collar-kurta',
    description:
      'Block-printed by artisans in Jaipur, this mandarin collar kurta fuses traditional craft with a contemporary slim silhouette. Pair with churidar or slim trousers.',
    price: 1899,
    comparePrice: 2499,
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4b8bde?w=800&q=80',
      'https://images.unsplash.com/photo-1612902673046-70c0b2a2a4e5?w=800&q=80',
    ],
    categoryId: menKurtas.id,
    fabric: '100% Cotton Mulmul',
    care: 'Hand wash cold. Do not wring. Dry in shade.',
    tags: 'kurta,ethnic,block print,jaipur,cotton',
    badge: undefined,
    variants: [
      { size: 'S', color: 'Indigo', colorHex: '#4B0082', sku: 'PMK-S-IN', stock: 10 },
      { size: 'M', color: 'Indigo', colorHex: '#4B0082', sku: 'PMK-M-IN', stock: 14 },
      { size: 'L', color: 'Indigo', colorHex: '#4B0082', sku: 'PMK-L-IN', stock: 12 },
      { size: 'M', color: 'Rust', colorHex: '#B7410E', sku: 'PMK-M-RU', stock: 8 },
      { size: 'L', color: 'Rust', colorHex: '#B7410E', sku: 'PMK-L-RU', stock: 8 },
      { size: 'XL', color: 'Rust', colorHex: '#B7410E', sku: 'PMK-XL-RU', stock: 5 },
    ],
  })

  await createProduct({
    name: 'Linen Relaxed-Fit Shirt',
    slug: 'linen-relaxed-fit-shirt',
    description:
      'Cut from pure European linen, this relaxed-fit shirt is the perfect companion for summer afternoons. Its natural texture softens with every wash.',
    price: 1699,
    images: [
      'https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=800&q=80',
      'https://images.unsplash.com/photo-1512353087810-25dfcd100962?w=800&q=80',
    ],
    categoryId: menShirts.id,
    fabric: '100% European Linen',
    care: 'Machine wash cold. Line dry. Light iron.',
    tags: 'shirt,linen,casual,summer,relaxed',
    badge: 'NEW',
    variants: [
      { size: 'S', color: 'Ecru', colorHex: '#C2B280', sku: 'LRS-S-EC', stock: 15 },
      { size: 'M', color: 'Ecru', colorHex: '#C2B280', sku: 'LRS-M-EC', stock: 20 },
      { size: 'L', color: 'Ecru', colorHex: '#C2B280', sku: 'LRS-L-EC', stock: 18 },
      { size: 'M', color: 'Dusty Rose', colorHex: '#DCAE96', sku: 'LRS-M-DR', stock: 10 },
      { size: 'L', color: 'Dusty Rose', colorHex: '#DCAE96', sku: 'LRS-L-DR', stock: 8 },
    ],
  })

  await createProduct({
    name: 'Handloom Ikat Nehru Jacket',
    slug: 'handloom-ikat-nehru-jacket',
    description:
      'A statement Nehru jacket in handloom Ikat fabric from Pochampally. Intricate geometric resist-dyed patterns make each piece one of a kind. Ideal for weddings and cultural events.',
    price: 4799,
    comparePrice: 5999,
    images: [
      'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80',
      'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?w=800&q=80',
    ],
    categoryId: menKurtas.id,
    fabric: '100% Handloom Ikat Cotton-Silk',
    care: 'Dry clean only. Store in muslin bag.',
    tags: 'jacket,nehru,ikat,handloom,festive,wedding',
    badge: 'BESTSELLER',
    variants: [
      { size: 'S', color: 'Teal', colorHex: '#008080', sku: 'HIN-S-TE', stock: 5 },
      { size: 'M', color: 'Teal', colorHex: '#008080', sku: 'HIN-M-TE', stock: 8 },
      { size: 'L', color: 'Teal', colorHex: '#008080', sku: 'HIN-L-TE', stock: 6 },
      { size: 'M', color: 'Maroon', colorHex: '#800000', sku: 'HIN-M-MA', stock: 4 },
      { size: 'L', color: 'Maroon', colorHex: '#800000', sku: 'HIN-L-MA', stock: 4 },
    ],
  })

  // ---- WOMEN — 6 products ----
  await createProduct({
    name: 'Chikankari Georgette Kurti',
    slug: 'chikankari-georgette-kurti',
    description:
      'Hand-embroidered Chikankari on airy georgette — a timeless Lucknawi craft reimagined for the contemporary wardrobe. The flared silhouette flatters all body types.',
    price: 2799,
    comparePrice: 3799,
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
      'https://images.unsplash.com/photo-1583391099995-b3b037c2d20f?w=800&q=80',
    ],
    categoryId: womenKurtis.id,
    fabric: '100% Georgette with hand Chikankari embroidery',
    care: 'Dry clean recommended. Store flat.',
    tags: 'kurti,chikankari,embroidery,ethnic,festive',
    badge: 'BESTSELLER',
    variants: [
      { size: 'XS', color: 'Blush Pink', colorHex: '#FFB6C1', sku: 'CGK-XS-BP', stock: 10 },
      { size: 'S', color: 'Blush Pink', colorHex: '#FFB6C1', sku: 'CGK-S-BP', stock: 15 },
      { size: 'M', color: 'Blush Pink', colorHex: '#FFB6C1', sku: 'CGK-M-BP', stock: 18 },
      { size: 'L', color: 'Blush Pink', colorHex: '#FFB6C1', sku: 'CGK-L-BP', stock: 12 },
      { size: 'S', color: 'Mint', colorHex: '#98FF98', sku: 'CGK-S-MI', stock: 8 },
      { size: 'M', color: 'Mint', colorHex: '#98FF98', sku: 'CGK-M-MI', stock: 10 },
    ],
  })

  await createProduct({
    name: 'Banarasi Silk Wrap Dress',
    slug: 'banarasi-silk-wrap-dress',
    description:
      'A modern wrap dress in lustrous Banarasi silk, adorned with subtle zari motifs. Effortlessly transitions from daytime elegance to evening glamour.',
    price: 5499,
    comparePrice: 6999,
    images: [
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80',
    ],
    categoryId: womenDresses.id,
    fabric: 'Pure Banarasi Silk with Zari weave',
    care: 'Dry clean only. Keep away from direct sunlight.',
    tags: 'dress,banarasi,silk,zari,festive,wedding',
    badge: 'NEW',
    variants: [
      { size: 'XS', color: 'Deep Burgundy', colorHex: '#800020', sku: 'BSW-XS-DB', stock: 6 },
      { size: 'S', color: 'Deep Burgundy', colorHex: '#800020', sku: 'BSW-S-DB', stock: 8 },
      { size: 'M', color: 'Deep Burgundy', colorHex: '#800020', sku: 'BSW-M-DB', stock: 10 },
      { size: 'L', color: 'Deep Burgundy', colorHex: '#800020', sku: 'BSW-L-DB', stock: 6 },
      { size: 'S', color: 'Royal Blue', colorHex: '#4169E1', sku: 'BSW-S-RB', stock: 5 },
      { size: 'M', color: 'Royal Blue', colorHex: '#4169E1', sku: 'BSW-M-RB', stock: 5 },
    ],
  })

  await createProduct({
    name: 'Handwoven Kanjivaram Saree',
    slug: 'handwoven-kanjivaram-saree',
    description:
      'An heirloom-quality Kanjivaram saree handwoven by master weavers in Kanchipuram. Rich mulberry silk with contrasting zari border makes this a treasured addition to any wardrobe.',
    price: 18999,
    comparePrice: 22000,
    images: [
      'https://images.unsplash.com/photo-1583391099994-9f5b79a5a437?w=800&q=80',
      'https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?w=800&q=80',
    ],
    categoryId: womenSarees.id,
    fabric: 'Pure Mulberry Silk with Gold Zari',
    care: 'Dry clean only. Store in original silk bag.',
    tags: 'saree,kanjivaram,silk,traditional,wedding,heirloom',
    badge: 'BESTSELLER',
    variants: [
      { size: 'Free Size', color: 'Crimson & Gold', colorHex: '#DC143C', sku: 'HKS-FS-CG', stock: 4 },
      { size: 'Free Size', color: 'Peacock Blue & Gold', colorHex: '#005F6B', sku: 'HKS-FS-PBG', stock: 3 },
      { size: 'Free Size', color: 'Emerald & Silver', colorHex: '#50C878', sku: 'HKS-FS-ES', stock: 3 },
    ],
  })

  await createProduct({
    name: 'Linen Palazzo Kurti Set',
    slug: 'linen-palazzo-kurti-set',
    description:
      'Breezy linen kurti paired with wide-leg palazzo pants — the perfect fusion of comfort and style for everyday Indian wear. Printed with an earthy geometric pattern.',
    price: 2199,
    comparePrice: 2799,
    images: [
      'https://images.unsplash.com/photo-1562137369-1a1a0bc66744?w=800&q=80',
      'https://images.unsplash.com/photo-1529139574466-a303027330d5?w=800&q=80',
    ],
    categoryId: womenKurtis.id,
    fabric: '100% Linen (top + bottom)',
    care: 'Machine wash cold. Line dry. Iron while damp.',
    tags: 'kurti,palazzo,linen,set,casual,everyday',
    badge: 'SALE',
    variants: [
      { size: 'XS', color: 'Terracotta', colorHex: '#E2725B', sku: 'LPK-XS-TC', stock: 10 },
      { size: 'S', color: 'Terracotta', colorHex: '#E2725B', sku: 'LPK-S-TC', stock: 15 },
      { size: 'M', color: 'Terracotta', colorHex: '#E2725B', sku: 'LPK-M-TC', stock: 20 },
      { size: 'L', color: 'Terracotta', colorHex: '#E2725B', sku: 'LPK-L-TC', stock: 12 },
      { size: 'XL', color: 'Terracotta', colorHex: '#E2725B', sku: 'LPK-XL-TC', stock: 8 },
      { size: 'M', color: 'Sage', colorHex: '#B2AC88', sku: 'LPK-M-SA', stock: 10 },
    ],
  })

  await createProduct({
    name: 'Embellished Anarkali Suit',
    slug: 'embellished-anarkali-suit',
    description:
      'A floor-length Anarkali in dupion silk, embellished with intricate mirror work and sequin embroidery. The fitted bodice flares dramatically into a full skirt — festive elegance personified.',
    price: 7999,
    comparePrice: 10499,
    images: [
      'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&q=80',
      'https://images.unsplash.com/photo-1628015081036-0747ec8f077a?w=800&q=80',
    ],
    categoryId: womenKurtis.id,
    fabric: 'Dupion Silk with Mirror & Sequin Embroidery',
    care: 'Dry clean only. Do not iron embellishments.',
    tags: 'anarkali,suit,festive,embellished,dupion,silk',
    badge: 'BESTSELLER',
    variants: [
      { size: 'XS', color: 'Fuchsia', colorHex: '#FF1493', sku: 'EAS-XS-FU', stock: 5 },
      { size: 'S', color: 'Fuchsia', colorHex: '#FF1493', sku: 'EAS-S-FU', stock: 8 },
      { size: 'M', color: 'Fuchsia', colorHex: '#FF1493', sku: 'EAS-M-FU', stock: 10 },
      { size: 'L', color: 'Fuchsia', colorHex: '#FF1493', sku: 'EAS-L-FU', stock: 6 },
      { size: 'S', color: 'Teal', colorHex: '#008080', sku: 'EAS-S-TE', stock: 5 },
      { size: 'M', color: 'Teal', colorHex: '#008080', sku: 'EAS-M-TE', stock: 5 },
    ],
  })

  await createProduct({
    name: 'Cotton Poplin Shirt Dress',
    slug: 'cotton-poplin-shirt-dress',
    description:
      'A versatile shirt dress in crisp cotton poplin with rolled cuffs and a belted waist. Wear it buttoned up for a polished look or open over jeans for laid-back style.',
    price: 2499,
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80',
    ],
    categoryId: womenDresses.id,
    fabric: '100% Cotton Poplin',
    care: 'Machine wash warm. Tumble dry medium. Iron warm.',
    tags: 'dress,shirt dress,cotton,casual,versatile',
    badge: 'NEW',
    variants: [
      { size: 'XS', color: 'White', colorHex: '#FFFFFF', sku: 'CPS-XS-WH', stock: 15 },
      { size: 'S', color: 'White', colorHex: '#FFFFFF', sku: 'CPS-S-WH', stock: 20 },
      { size: 'M', color: 'White', colorHex: '#FFFFFF', sku: 'CPS-M-WH', stock: 25 },
      { size: 'L', color: 'White', colorHex: '#FFFFFF', sku: 'CPS-L-WH', stock: 15 },
      { size: 'S', color: 'Cobalt Blue', colorHex: '#0047AB', sku: 'CPS-S-CB', stock: 10 },
      { size: 'M', color: 'Cobalt Blue', colorHex: '#0047AB', sku: 'CPS-M-CB', stock: 12 },
    ],
  })

  // ---- KIDS — 6 products ----
  await createProduct({
    name: 'Handloom Cotton Dhoti Kurta Set — Boys',
    slug: 'handloom-cotton-dhoti-kurta-set-boys',
    description:
      'Soft handloom cotton dhoti-kurta set for boys — perfect for pujas, weddings, and festivals. Finished with delicate embroidery on the collar and sleeves.',
    price: 1299,
    comparePrice: 1699,
    images: [
      'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=800&q=80',
      'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800&q=80',
    ],
    categoryId: kidsBoys.id,
    fabric: 'Handloom Cotton',
    care: 'Hand wash cold. Dry in shade.',
    tags: 'kids,boys,dhoti,kurta,ethnic,festive',
    badge: 'NEW',
    variants: [
      { size: '2-3Y', color: 'Cream', colorHex: '#FFFDD0', sku: 'HDK-23-CR', stock: 15 },
      { size: '3-4Y', color: 'Cream', colorHex: '#FFFDD0', sku: 'HDK-34-CR', stock: 15 },
      { size: '4-5Y', color: 'Cream', colorHex: '#FFFDD0', sku: 'HDK-45-CR', stock: 12 },
      { size: '5-6Y', color: 'Cream', colorHex: '#FFFDD0', sku: 'HDK-56-CR', stock: 10 },
      { size: '3-4Y', color: 'Ivory Gold', colorHex: '#F5DEB3', sku: 'HDK-34-IG', stock: 8 },
      { size: '4-5Y', color: 'Ivory Gold', colorHex: '#F5DEB3', sku: 'HDK-45-IG', stock: 8 },
    ],
  })

  await createProduct({
    name: 'Printed Lehenga Choli Set — Girls',
    slug: 'printed-lehenga-choli-set-girls',
    description:
      'A vibrant digitally-printed lehenga-choli set for little princesses. Soft georgette fabric ensures comfort while the foil print adds a magical shimmer.',
    price: 1599,
    comparePrice: 1999,
    images: [
      'https://images.unsplash.com/photo-1476234251651-f353703a034d?w=800&q=80',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&q=80',
    ],
    categoryId: kidsGirls.id,
    fabric: 'Georgette with foil print',
    care: 'Hand wash cold. Do not wring.',
    tags: 'kids,girls,lehenga,choli,ethnic,festive,princess',
    badge: 'BESTSELLER',
    variants: [
      { size: '2-3Y', color: 'Magenta', colorHex: '#FF00FF', sku: 'PLG-23-MG', stock: 12 },
      { size: '3-4Y', color: 'Magenta', colorHex: '#FF00FF', sku: 'PLG-34-MG', stock: 15 },
      { size: '4-5Y', color: 'Magenta', colorHex: '#FF00FF', sku: 'PLG-45-MG', stock: 12 },
      { size: '5-6Y', color: 'Magenta', colorHex: '#FF00FF', sku: 'PLG-56-MG', stock: 8 },
      { size: '3-4Y', color: 'Turquoise', colorHex: '#40E0D0', sku: 'PLG-34-TQ', stock: 8 },
      { size: '4-5Y', color: 'Turquoise', colorHex: '#40E0D0', sku: 'PLG-45-TQ', stock: 8 },
    ],
  })

  await createProduct({
    name: 'Organic Cotton Casual Shirt — Boys',
    slug: 'organic-cotton-casual-shirt-boys',
    description:
      'Soft and durable organic cotton shirt for active boys. Tagless and double-stitched seams prevent irritation, while playful prints keep it fun.',
    price: 699,
    comparePrice: 899,
    images: [
      'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800&q=80',
      'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=800&q=80',
    ],
    categoryId: kidsBoys.id,
    fabric: '100% GOTS-certified Organic Cotton',
    care: 'Machine wash cold. Tumble dry low.',
    tags: 'kids,boys,shirt,organic,casual,everyday',
    badge: undefined,
    variants: [
      { size: '2-3Y', color: 'Blue Stripe', colorHex: '#6495ED', sku: 'OCS-23-BS', stock: 20 },
      { size: '3-4Y', color: 'Blue Stripe', colorHex: '#6495ED', sku: 'OCS-34-BS', stock: 20 },
      { size: '4-5Y', color: 'Blue Stripe', colorHex: '#6495ED', sku: 'OCS-45-BS', stock: 18 },
      { size: '5-6Y', color: 'Blue Stripe', colorHex: '#6495ED', sku: 'OCS-56-BS', stock: 15 },
      { size: '3-4Y', color: 'Red Plaid', colorHex: '#B22222', sku: 'OCS-34-RP', stock: 12 },
      { size: '4-5Y', color: 'Red Plaid', colorHex: '#B22222', sku: 'OCS-45-RP', stock: 12 },
    ],
  })

  await createProduct({
    name: 'Embroidered Velvet Frock — Girls',
    slug: 'embroidered-velvet-frock-girls',
    description:
      'A party-perfect velvet frock with floral embroidery on the bodice and a tulle skirt. Concealed back zip for easy dressing.',
    price: 1299,
    comparePrice: 1699,
    images: [
      'https://images.unsplash.com/photo-1511949860663-92c5c57d48a7?w=800&q=80',
      'https://images.unsplash.com/photo-1476234251651-f353703a034d?w=800&q=80',
    ],
    categoryId: kidsGirls.id,
    fabric: 'Velvet bodice with Tulle skirt',
    care: 'Spot clean only. Dry flat.',
    tags: 'kids,girls,dress,velvet,embroidery,party,frock',
    badge: 'NEW',
    variants: [
      { size: '2-3Y', color: 'Wine', colorHex: '#722F37', sku: 'EVF-23-WN', stock: 8 },
      { size: '3-4Y', color: 'Wine', colorHex: '#722F37', sku: 'EVF-34-WN', stock: 10 },
      { size: '4-5Y', color: 'Wine', colorHex: '#722F37', sku: 'EVF-45-WN', stock: 10 },
      { size: '5-6Y', color: 'Wine', colorHex: '#722F37', sku: 'EVF-56-WN', stock: 6 },
      { size: '3-4Y', color: 'Navy', colorHex: '#001F5B', sku: 'EVF-34-NV', stock: 6 },
      { size: '4-5Y', color: 'Navy', colorHex: '#001F5B', sku: 'EVF-45-NV', stock: 6 },
    ],
  })

  await createProduct({
    name: 'Denim Dungaree Set — Boys',
    slug: 'denim-dungaree-set-boys',
    description:
      'Classic denim dungarees with adjustable straps and patch pockets. Pairs with any tee for an effortlessly cool look.',
    price: 1099,
    images: [
      'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=800&q=80',
      'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800&q=80',
    ],
    categoryId: kidsBoys.id,
    fabric: '100% Denim Cotton',
    care: 'Machine wash cold. Tumble dry medium.',
    tags: 'kids,boys,denim,dungaree,casual',
    badge: undefined,
    variants: [
      { size: '2-3Y', color: 'Mid Blue', colorHex: '#6699CC', sku: 'DDS-23-MB', stock: 15 },
      { size: '3-4Y', color: 'Mid Blue', colorHex: '#6699CC', sku: 'DDS-34-MB', stock: 15 },
      { size: '4-5Y', color: 'Mid Blue', colorHex: '#6699CC', sku: 'DDS-45-MB', stock: 12 },
      { size: '5-6Y', color: 'Mid Blue', colorHex: '#6699CC', sku: 'DDS-56-MB', stock: 10 },
    ],
  })

  await createProduct({
    name: 'Ruffle Sleeve Anarkali Dress — Girls',
    slug: 'ruffle-sleeve-anarkali-dress-girls',
    description:
      'A charming ethnic Anarkali dress with ruffle sleeves and a flared skirt for girls. Soft rayon fabric provides all-day comfort during celebrations.',
    price: 999,
    comparePrice: 1299,
    images: [
      'https://images.unsplash.com/photo-1476234251651-f353703a034d?w=800&q=80',
      'https://images.unsplash.com/photo-1511949860663-92c5c57d48a7?w=800&q=80',
    ],
    categoryId: kidsGirls.id,
    fabric: '100% Viscose Rayon',
    care: 'Hand wash cold. Iron on low.',
    tags: 'kids,girls,anarkali,dress,ethnic,ruffle,festive',
    badge: 'SALE',
    variants: [
      { size: '2-3Y', color: 'Lilac', colorHex: '#C8A2C8', sku: 'RSA-23-LI', stock: 12 },
      { size: '3-4Y', color: 'Lilac', colorHex: '#C8A2C8', sku: 'RSA-34-LI', stock: 15 },
      { size: '4-5Y', color: 'Lilac', colorHex: '#C8A2C8', sku: 'RSA-45-LI', stock: 12 },
      { size: '5-6Y', color: 'Lilac', colorHex: '#C8A2C8', sku: 'RSA-56-LI', stock: 8 },
      { size: '3-4Y', color: 'Peach', colorHex: '#FFCBA4', sku: 'RSA-34-PE', stock: 8 },
      { size: '4-5Y', color: 'Peach', colorHex: '#FFCBA4', sku: 'RSA-45-PE', stock: 8 },
    ],
  })

  // ---- ACCESSORIES — 6 products ----
  await createProduct({
    name: 'Hand-Painted Silk Stole',
    slug: 'hand-painted-silk-stole',
    description:
      'Each stole is individually hand-painted by artisans using vegetable dyes on pure silk. No two pieces are identical, making it a truly personal accessory.',
    price: 1999,
    comparePrice: 2499,
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
      'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&q=80',
    ],
    categoryId: accScarves.id,
    fabric: 'Pure Silk (habotai)',
    care: 'Dry clean or gentle hand wash. Iron on silk setting.',
    tags: 'stole,silk,hand painted,accessories,artisan',
    badge: 'BESTSELLER',
    variants: [
      { size: 'Free Size', color: 'Floral Multicolor', colorHex: '#FF6B6B', sku: 'HPS-FS-FM', stock: 20 },
      { size: 'Free Size', color: 'Abstract Blue', colorHex: '#1E90FF', sku: 'HPS-FS-AB', stock: 15 },
      { size: 'Free Size', color: 'Nature Green', colorHex: '#228B22', sku: 'HPS-FS-NG', stock: 12 },
    ],
  })

  await createProduct({
    name: 'Pashmina Embroidered Shawl',
    slug: 'pashmina-embroidered-shawl',
    description:
      'A luxuriously soft Pashmina shawl adorned with Sozni needle embroidery by Kashmir\'s master craftsmen. A timeless investment piece.',
    price: 8999,
    comparePrice: 11999,
    images: [
      'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
    ],
    categoryId: accScarves.id,
    fabric: '100% Pashmina (Grade A Cashmere)',
    care: 'Dry clean only. Store in breathable cotton bag.',
    tags: 'shawl,pashmina,kashmiri,embroidery,luxury,accessories',
    badge: 'BESTSELLER',
    variants: [
      { size: 'Free Size', color: 'Ivory', colorHex: '#FFFFF0', sku: 'PES-FS-IV', stock: 8 },
      { size: 'Free Size', color: 'Caramel', colorHex: '#C68642', sku: 'PES-FS-CA', stock: 6 },
      { size: 'Free Size', color: 'Dove Grey', colorHex: '#B2B6BA', sku: 'PES-FS-DG', stock: 5 },
    ],
  })

  await createProduct({
    name: 'Genuine Leather Tote Bag',
    slug: 'genuine-leather-tote-bag',
    description:
      'Handcrafted in Kanpur\'s finest leather workshops, this spacious tote combines Indian craftsmanship with minimalist aesthetics. Zip-top closure with internal organization pockets.',
    price: 4999,
    comparePrice: 5999,
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
      'https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?w=800&q=80',
    ],
    categoryId: accBags.id,
    fabric: 'Full-Grain Vegetable-Tanned Leather',
    care: 'Wipe with damp cloth. Condition every 3 months.',
    tags: 'bag,tote,leather,handcrafted,kanpur,accessories',
    badge: 'NEW',
    variants: [
      { size: 'One Size', color: 'Cognac', colorHex: '#9A4500', sku: 'GLT-OS-CO', stock: 10 },
      { size: 'One Size', color: 'Black', colorHex: '#1A1A1A', sku: 'GLT-OS-BK', stock: 15 },
      { size: 'One Size', color: 'Tan', colorHex: '#D2B48C', sku: 'GLT-OS-TN', stock: 8 },
    ],
  })

  await createProduct({
    name: 'Embroidered Clutch Bag',
    slug: 'embroidered-clutch-bag',
    description:
      'A statement evening clutch adorned with Zardozi embroidery on velvet. The magnetic clasp closure and satin lining add a luxurious finishing touch.',
    price: 2199,
    comparePrice: 2799,
    images: [
      'https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?w=800&q=80',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
    ],
    categoryId: accBags.id,
    fabric: 'Velvet with Zardozi Embroidery, Satin Lining',
    care: 'Spot clean only. Store in dust bag.',
    tags: 'clutch,bag,zardozi,embroidery,velvet,evening,accessories',
    badge: 'BESTSELLER',
    variants: [
      { size: 'One Size', color: 'Emerald Green', colorHex: '#50C878', sku: 'ECB-OS-EG', stock: 12 },
      { size: 'One Size', color: 'Rose Gold', colorHex: '#B76E79', sku: 'ECB-OS-RG', stock: 10 },
      { size: 'One Size', color: 'Midnight Blue', colorHex: '#191970', sku: 'ECB-OS-MB', stock: 8 },
    ],
  })

  await createProduct({
    name: 'Block-Print Cotton Scarf',
    slug: 'block-print-cotton-scarf',
    description:
      'A lightweight cotton scarf with hand block prints from Sanganer, Rajasthan. Versatile enough to wear as a head wrap, neckerchief, or shoulder drape.',
    price: 799,
    comparePrice: 999,
    images: [
      'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
    ],
    categoryId: accScarves.id,
    fabric: '100% Cotton Voile',
    care: 'Machine wash cold. Line dry.',
    tags: 'scarf,block print,cotton,rajasthan,accessories',
    badge: undefined,
    variants: [
      { size: 'Free Size', color: 'Red Floral', colorHex: '#DC143C', sku: 'BPC-FS-RF', stock: 25 },
      { size: 'Free Size', color: 'Blue Geometric', colorHex: '#000080', sku: 'BPC-FS-BG', stock: 20 },
      { size: 'Free Size', color: 'Black & White', colorHex: '#1A1A1A', sku: 'BPC-FS-BW', stock: 18 },
    ],
  })

  await createProduct({
    name: 'Jute & Leather Satchel',
    slug: 'jute-leather-satchel',
    description:
      'An eco-conscious satchel combining natural jute with leather trim and handles. Sustainable without compromising on style or durability.',
    price: 2799,
    comparePrice: 3499,
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
      'https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?w=800&q=80',
    ],
    categoryId: accBags.id,
    fabric: 'Natural Jute with Leather Trim',
    care: 'Spot clean with mild soap. Air dry.',
    tags: 'bag,satchel,jute,leather,eco,sustainable,accessories',
    badge: 'NEW',
    variants: [
      { size: 'One Size', color: 'Natural Jute & Brown', colorHex: '#C68642', sku: 'JLS-OS-NB', stock: 15 },
      { size: 'One Size', color: 'Natural Jute & Black', colorHex: '#1A1A1A', sku: 'JLS-OS-NK', stock: 12 },
    ],
  })

  console.log('✅ 24 products created')

  // ============================================================
  // 5. Banners
  // ============================================================
  await prisma.banner.deleteMany()

  await prisma.banner.createMany({
    data: [
      {
        title: 'The New Season Edit',
        subtitle: 'Artisanal Indian fashion, reimagined for the modern wardrobe.',
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80',
        link: '/collections',
        position: 'HERO',
        isActive: true,
        sortOrder: 1,
      },
      {
        title: 'Handcrafted for Festivals',
        subtitle: 'Celebrate in curated ethnic wear — kurtis, sarees, and lehengas.',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600&q=80',
        link: '/category/women',
        position: 'HERO',
        isActive: true,
        sortOrder: 2,
      },
      {
        title: 'Men\'s Premium Essentials',
        subtitle: 'From relaxed linens to formal Bandhgalas — discover your signature style.',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1600&q=80',
        link: '/category/men',
        position: 'HERO',
        isActive: true,
        sortOrder: 3,
      },
    ],
  })

  console.log('✅ 3 Banners created')

  // ============================================================
  // 6. Coupons
  // ============================================================
  await prisma.coupon.deleteMany()

  await prisma.coupon.createMany({
    data: [
      {
        code: 'WELCOME10',
        description: '10% off your first order',
        type: 'PERCENTAGE',
        value: 10,
        minOrderValue: 500,
        maxDiscount: null,
        usageLimit: 1000,
        usedCount: 0,
        isActive: true,
      },
      {
        code: 'FLAT200',
        description: 'Flat ₹200 off on orders above ₹999',
        type: 'FIXED',
        value: 200,
        minOrderValue: 999,
        maxDiscount: 200,
        usageLimit: 500,
        usedCount: 0,
        isActive: true,
      },
      {
        code: 'LUXE15',
        description: '15% off on orders above ₹1500 (max ₹500 discount)',
        type: 'PERCENTAGE',
        value: 15,
        minOrderValue: 1500,
        maxDiscount: 500,
        usageLimit: 300,
        usedCount: 0,
        isActive: true,
      },
    ],
  })

  console.log('✅ 3 Coupons created')

  console.log('\n🎉 Seed completed successfully!')
  console.log('📧 Admin: admin@luxethreads.com / Admin@123')
  console.log('📧 Customer: test@example.com / Test@123')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
