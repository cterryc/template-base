import HeroCarousel from '@/components/hero-carousel'
import Benefits from '@/components/benefits'
import FeaturedProducts from '@/components/featured-products'
import BestSellers from '@/components/best-sellers'
import Newsletter from '@/components/newsletter'
import HeroSection from '@/components/hero-section'
import HeroFooterSection from '@/components/hero-footerSection'
import './globals.css'

export default function Home() {
  return (
    <div className='container'>
      {/* <HeroCarousel /> */}
      <HeroSection />
      <FeaturedProducts />
      <BestSellers />
      <HeroFooterSection />
      <div className='containerBenefits'>
        <Benefits />
      </div>
      {/* <Newsletter /> */}
    </div>
  )
}
