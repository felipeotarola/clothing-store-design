import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Product {
  id: string
  name: string
  price: number
  category: string
  image: string
}

const products: Product[] = [
  {
    id: "1",
    name: "Essential Straight Pants",
    price: 189,
    category: "pants",
    image: "/minimalist-straight-pants-grayscale.jpg",
  },
  {
    id: "2",
    name: "Classic White Shirt",
    price: 129,
    category: "shirts",
    image: "/classic-white-button-shirt-minimalist.jpg",
  },
  {
    id: "3",
    name: "Tailored Blazer",
    price: 349,
    category: "jackets",
    image: "/tailored-blazer-jacket-grayscale-minimalist.jpg",
  },
  {
    id: "4",
    name: "Wool Beanie",
    price: 59,
    category: "hats",
    image: "/wool-beanie-hat-minimalist-grayscale.jpg",
  },
  {
    id: "5",
    name: "Wide Leg Trousers",
    price: 219,
    category: "pants",
    image: "/wide-leg-trousers-pants-grayscale.jpg",
  },
  {
    id: "6",
    name: "Oversized Tee",
    price: 89,
    category: "shirts",
    image: "/oversized-t-shirt-minimalist-grayscale.jpg",
  },
  {
    id: "7",
    name: "Wool Coat",
    price: 459,
    category: "jackets",
    image: "/wool-coat-jacket-minimalist-grayscale.jpg",
  },
  {
    id: "8",
    name: "Baseball Cap",
    price: 79,
    category: "hats",
    image: "/baseball-cap-hat-minimalist-grayscale.jpg",
  },
  {
    id: "9",
    name: "Performance Running Shorts",
    price: 79,
    category: "sports",
    image: "/performance-running-shorts-athletic.jpg",
  },
  {
    id: "10",
    name: "Athletic Tank Top",
    price: 59,
    category: "sports",
    image: "/athletic-tank-top-sportswear.jpg",
  },
  {
    id: "11",
    name: "Training Hoodie",
    price: 149,
    category: "sports",
    image: "/training-hoodie-athletic-wear.jpg",
  },
  {
    id: "12",
    name: "Sport Leggings",
    price: 89,
    category: "sports",
    image: "/sport-leggings-athletic-wear.jpg",
  },
  {
    id: "13",
    name: "Basketball Jersey",
    price: 99,
    category: "sports",
    image: "/basketball-jersey-sportswear.jpg",
  },
  {
    id: "14",
    name: "Compression Shirt",
    price: 69,
    category: "sports",
    image: "/compression-shirt-athletic.jpg",
  },
  {
    id: "15",
    name: "Classic Oxford Shoes",
    price: 299,
    category: "shoes",
    image: "/classic-oxford-shoes-leather.jpg",
  },
  {
    id: "16",
    name: "White Sneakers",
    price: 159,
    category: "shoes",
    image: "/white-sneakers-minimalist.jpg",
  },
  {
    id: "17",
    name: "Running Shoes",
    price: 189,
    category: "shoes",
    image: "/running-shoes-athletic.jpg",
  },
]

interface ProductGridProps {
  category?: string
}

export function ProductGrid({ category }: ProductGridProps) {
  const filteredProducts = category ? products.filter((product) => product.category === category) : products

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {filteredProducts.map((product) => (
        <Card key={product.id} className="group cursor-pointer border-0 shadow-none">
          <CardContent className="p-0">
            <div className="aspect-[3/4] overflow-hidden bg-muted">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="p-4 space-y-2">
              <h3 className="font-medium text-sm tracking-wide uppercase">{product.name}</h3>
              <p className="text-lg font-semibold">${product.price}</p>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3 border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
              >
                ADD TO CART
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
