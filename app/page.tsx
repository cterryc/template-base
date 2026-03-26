import Benefits from '@/components/benefits'
import FeaturedProducts from '@/components/featured-products'
import BestSellers from '@/components/best-sellers'
import HeroSection from '@/components/hero-section'
import HeroFooterSection from '@/components/hero-footerSection'
import './globals.css'

export default function Home() {
  return (
    <div className='w-full'>
      {/* <HeroCarousel /> */}
      <HeroSection />
      <FeaturedProducts />
      <BestSellers />
      <HeroFooterSection />
      <div className='w-full'>
        <Benefits />
      </div>
      {/* <Newsletter /> */}
    </div>
  )
}
