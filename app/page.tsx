import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { CategorySection } from "@/components/category-section"
import { VirtualTryOn } from "@/components/virtual-try-on"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <HeroSection />
      <main className="pr-96">
        <CategorySection id="pants" title="PANTS" category="pants" />
        <CategorySection id="shirts" title="SHIRTS" category="shirts" />
        <CategorySection id="jackets" title="JACKETS" category="jackets" />
        <CategorySection id="hats" title="HATS" category="hats" />
        <CategorySection id="bags" title="BAGS" category="bags" />
        <CategorySection id="jewelry" title="JEWELRY" category="jewelry" />
        <CategorySection id="backpacks" title="BACKPACKS" category="backpacks" />
        <CategorySection id="sneakers" title="SNEAKERS" category="sneakers" />
        <CategorySection id="sportswear" title="SPORTSWEAR" category="sportswear" />
      </main>
      <Footer />
      <VirtualTryOn />
    </div>
  )
}
