"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { setGlobalSelectedProduct } from "./virtual-try-on"

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
    name: "Leather Tote Bag",
    price: 299,
    category: "bags",
    image: "/minimalist-leather-tote-bag-grayscale.jpg",
  },
  {
    id: "10",
    name: "Canvas Crossbody",
    price: 149,
    category: "bags",
    image: "/canvas-crossbody-bag-minimalist-grayscale.jpg",
  },
  {
    id: "11",
    name: "Structured Handbag",
    price: 389,
    category: "bags",
    image: "/structured-handbag-minimalist-grayscale.jpg",
  },
  {
    id: "12",
    name: "Mini Clutch",
    price: 179,
    category: "bags",
    image: "/mini-clutch-bag-minimalist-grayscale.jpg",
  },
  {
    id: "13",
    name: "Silver Chain Necklace",
    price: 129,
    category: "jewelry",
    image: "/silver-chain-necklace-minimalist-grayscale.jpg",
  },
  {
    id: "14",
    name: "Geometric Earrings",
    price: 89,
    category: "jewelry",
    image: "/geometric-earrings-minimalist-grayscale.jpg",
  },
  {
    id: "15",
    name: "Minimalist Ring Set",
    price: 159,
    category: "jewelry",
    image: "/minimalist-ring-set-grayscale.jpg",
  },
  {
    id: "16",
    name: "Classic Watch",
    price: 249,
    category: "jewelry",
    image: "/classic-minimalist-watch-grayscale.jpg",
  },
  {
    id: "17",
    name: "Canvas Backpack",
    price: 199,
    category: "backpacks",
    image: "/canvas-backpack-minimalist-grayscale.jpg",
  },
  {
    id: "18",
    name: "Leather Daypack",
    price: 329,
    category: "backpacks",
    image: "/leather-daypack-backpack-minimalist-grayscale.jpg",
  },
  {
    id: "19",
    name: "Tech Backpack",
    price: 279,
    category: "backpacks",
    image: "/tech-backpack-minimalist-grayscale.jpg",
  },
  {
    id: "20",
    name: "Mini Backpack",
    price: 149,
    category: "backpacks",
    image: "/mini-backpack-minimalist-grayscale.jpg",
  },
  {
    id: "21",
    name: "Classic White Sneakers",
    price: 189,
    category: "sneakers",
    image: "/white-sneakers-minimalist-grayscale.jpg",
  },
  {
    id: "22",
    name: "High-Top Canvas",
    price: 159,
    category: "sneakers",
    image: "/high-top-canvas-sneakers-minimalist-grayscale.jpg",
  },
  {
    id: "23",
    name: "Running Shoes",
    price: 229,
    category: "sneakers",
    image: "/running-shoes-minimalist-grayscale.jpg",
  },
  {
    id: "24",
    name: "Slip-On Sneakers",
    price: 139,
    category: "sneakers",
    image: "/placeholder.svg?height=400&width=300",
  },
  {
    id: "25",
    name: "Athletic Hoodie",
    price: 149,
    category: "sportswear",
    image: "/placeholder.svg?height=400&width=300",
  },
  {
    id: "26",
    name: "Performance Leggings",
    price: 89,
    category: "sportswear",
    image: "/placeholder.svg?height=400&width=300",
  },
  {
    id: "27",
    name: "Training Shorts",
    price: 69,
    category: "sportswear",
    image: "/placeholder.svg?height=400&width=300",
  },
  {
    id: "28",
    name: "Sports Bra",
    price: 59,
    category: "sportswear",
    image: "/placeholder.svg?height=400&width=300",
  },
]

interface ProductGridProps {
  category?: string
}

export function ProductGrid({ category }: ProductGridProps) {
  const filteredProducts = category ? products.filter((product) => product.category === category) : products

  const handleProductSelect = (product: Product) => {
    setGlobalSelectedProduct(product)
    document.getElementById("try-on")?.scrollIntoView({ behavior: "smooth" })
  }

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
              <div className="flex gap-2 mt-3">
                <Button variant="default" size="sm" className="flex-1" onClick={() => handleProductSelect(product)}>
                  TRY ON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                >
                  ADD TO CART
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
