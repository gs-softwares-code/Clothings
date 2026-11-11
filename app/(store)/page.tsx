import { db } from '@/lib/db'
import HeroBanner from '@/components/store/home/hero-banner'
import FeaturedCategories from '@/components/store/home/featured-categories'
import NewArrivals from '@/components/store/home/new-arrivals'
import Bestsellers from '@/components/store/home/bestsellers'
import EditorialCampaign from '@/components/store/home/editorial-campaign'
import BrandStory from '@/components/store/home/brand-story'
import CustomerReviews from '@/components/store/home/customer-reviews'
import InstagramGallery from '@/components/store/home/instagram-gallery'
import NewsletterSection from '@/components/store/home/newsletter-section'

export const dynamic = 'force-dynamic'

async function getHomepageData() {
  try {
    const products = await db.product.findMany({
      where: { isActive: true },
      include: {
        category: true,
        variants: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 24,
    })

    const newArrivals = products.slice(0, 8)
    const bestsellersList = products.filter(
      (p) => p.badge?.toUpperCase() === 'BESTSELLER'
    )
    const bestsellers =
      bestsellersList.length >= 4 ? bestsellersList.slice(0, 8) : products.slice(2, 10)

    return {
      newArrivals: JSON.parse(JSON.stringify(newArrivals)),
      bestsellers: JSON.parse(JSON.stringify(bestsellers)),
    }
  } catch (err) {
    console.warn('Fallback to static products for homepage:', err)
    return {
      newArrivals: [],
      bestsellers: [],
    }
  }
}

export default async function HomePage() {
  const { newArrivals, bestsellers } = await getHomepageData()

  return (
    <div className="flex flex-col w-full">
      {/* 1. Hero Full-Width Editorial Slider */}
      <HeroBanner />

      {/* 2. Curated Editorial Category Cards */}
      <FeaturedCategories />

      {/* 3. New Arrivals Latest Drops */}
      <NewArrivals products={newArrivals} />

      {/* 4. Luxury Lookbook Split-Screen Campaign Banner */}
      <EditorialCampaign />

      {/* 5. Most Coveted Bestsellers Grid */}
      <Bestsellers products={bestsellers} />

      {/* 6. Provenance & Artisanal Craftsmanship Brand Story */}
      <BrandStory />

      {/* 7. Verified Patron Reviews Carousel & Testimonials */}
      <CustomerReviews />

      {/* 8. Editorial Instagram Lookbook Grid */}
      <InstagramGallery />

      {/* 9. Minimal VIP Newsletter Circle Signup */}
      <NewsletterSection />
    </div>
  )
}
