import { AnnouncementBar } from '@/components/store/layout/announcement-bar'
import { Navbar } from '@/components/store/layout/navbar'
import { CartDrawer } from '@/components/store/layout/cart-drawer'
import { Footer } from '@/components/store/layout/footer'

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAF9F6] text-neutral-900 font-inter antialiased selection:bg-[#C9A84C] selection:text-white">
      <AnnouncementBar />
      <Navbar />
      <CartDrawer />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
