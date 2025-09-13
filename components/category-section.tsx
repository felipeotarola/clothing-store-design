import { ProductGrid } from "./product-grid"

interface CategorySectionProps {
  id: string
  title: string
  category: string
}

export function CategorySection({ id, title, category }: CategorySectionProps) {
  return (
    <section id={id} className="py-16">
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{title}</h2>
          <div className="w-24 h-px bg-primary mx-auto"></div>
        </div>
        <ProductGrid category={category} />
      </div>
    </section>
  )
}
