import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { CategorySection } from "@/components/category-section"
import { VirtualTryOn } from "@/components/virtual-try-on"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <VirtualTryOn />
        <CategorySection id="pants" title="PANTS" category="pants" />
        <CategorySection id="shirts" title="SHIRTS" category="shirts" />
        <CategorySection id="jackets" title="JACKETS" category="jackets" />
        <CategorySection id="hats" title="HATS" category="hats" />
        <CategorySection id="sports" title="SPORTSWEAR" category="sports" />
      </main>
      <Footer />
    </div>
  )
}
