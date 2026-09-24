import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/landing/Hero'
import { CategoryShowcase } from '@/components/landing/CategoryShowcase'
import { FeaturedProducts } from '@/components/landing/FeaturedProducts'
import { WhyOneShop } from '@/components/landing/WhyOneShop'
import { SellerCTA } from '@/components/landing/SellerCTA'
import { FinalCTA } from '@/components/landing/FinalCTA'

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <CategoryShowcase />
        <FeaturedProducts />
        <WhyOneShop />
        <SellerCTA />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}
