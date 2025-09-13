"use client"

import type { React } from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Camera, Loader2, Download, Check, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Product {
  id: string
  name: string
  price: number
  category: string
  image: string
}

const clothingTypes = {
  shirts: { label: "Shirt/Top", pose: "standing upright with arms slightly away from body", placement: "upper body" },
  pants: {
    label: "Pants/Trousers",
    pose: "standing with legs slightly apart",
    placement: "lower body from waist down",
  },
  jackets: { label: "Jacket/Blazer", pose: "standing upright with good posture", placement: "over upper body" },
  hats: { label: "Hat/Cap", pose: "facing forward with head visible", placement: "on head" },
  sports: {
    label: "Athletic Wear",
    pose: "athletic stance appropriate for the sport",
    placement: "full body or specific body part",
  },
  shoes: {
    label: "Shoes/Footwear",
    pose: "standing with feet visible and slightly apart",
    placement: "on feet",
  },
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

interface TryOnResult {
  url: string
  prompt: string
}

export function VirtualTryOn() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([])
  const [clothingTypeOverride, setClothingTypeOverride] = useState<string>("auto-detect")
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<TryOnResult | null>(null)
  const [prompt, setPrompt] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const generateSmartPrompt = () => {
    if (selectedProducts.length === 0) return ""

    if (selectedProducts.length === 1) {
      const product = selectedProducts[0]
      const clothingType = clothingTypeOverride || product.category
      const typeInfo = clothingTypes[clothingType as keyof typeof clothingTypes]

      if (!typeInfo) return `Make the person wear the ${product.name}. Ensure natural lighting and realistic fit.`

      return `Make the person wear the ${product.name} specifically on their ${typeInfo.placement}. The person should be ${typeInfo.pose}. Ensure the ${clothingType} fits naturally and realistically on the correct body part. Do not confuse this ${clothingType} with other clothing types. Maintain natural lighting and realistic proportions.`
    }

    // Multiple products - create complete outfit
    const outfitItems = selectedProducts
      .map((product) => {
        const typeInfo = clothingTypes[product.category as keyof typeof clothingTypes]
        return `${product.name} on ${typeInfo?.placement || "appropriate body part"}`
      })
      .join(", ")

    return `Create a complete stylish outfit with: ${outfitItems}. The person should be standing with good posture showing the full outfit. Ensure all clothing items fit naturally and complement each other. Maintain natural lighting and realistic proportions for a cohesive look.`
  }

  const toggleProductSelection = (product: Product) => {
    setSelectedProducts((prev) => {
      const isSelected = prev.some((p) => p.id === product.id)
      if (isSelected) {
        return prev.filter((p) => p.id !== product.id)
      } else {
        return [...prev, product]
      }
    })
  }

  const removeProduct = (productId: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId))
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleTryOn = async () => {
    if (!selectedImage || selectedProducts.length === 0) return

    setIsProcessing(true)
    try {
      // For multiple products, we'll combine them or process the primary one
      const primaryProduct = selectedProducts[0]

      // Convert clothing image to base64
      const clothingImageResponse = await fetch(primaryProduct.image)
      const clothingImageBlob = await clothingImageResponse.blob()

      const formData = new FormData()
      formData.append("userImage", selectedImage)
      formData.append("clothingImage", clothingImageBlob, `${primaryProduct.name}.jpg`)
      formData.append("prompt", prompt)
      formData.append("productName", selectedProducts.map((p) => p.name).join(", "))
      formData.append("clothingType", selectedProducts.map((p) => p.category).join(", "))

      const response = await fetch("/api/virtual-try-on", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to process image")
      }

      const data = await response.json()
      setResult({
        url: data.output,
        prompt: prompt,
      })
    } catch (error) {
      console.error("Error processing image:", error)
      alert("Failed to process image. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <section id="try-on" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-4">VIRTUAL TRY-ON</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Upload your photo, select multiple clothes to create complete outfits, and see how they look on you using AI
            magic! 🍌✨
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Upload Your Photo
              </CardTitle>
              <CardDescription>Choose a clear photo of yourself</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image-upload">Select Image</Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  ref={fileInputRef}
                  className="cursor-pointer"
                />
              </div>

              {previewUrl && (
                <div className="relative">
                  <img
                    src={previewUrl || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="clothing-type">Clothing Type (Optional Override)</Label>
                <Select value={clothingTypeOverride} onValueChange={setClothingTypeOverride}>
                  <SelectTrigger>
                    <SelectValue placeholder="Auto-detect from selected items" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto-detect">Auto-detect</SelectItem>
                    {Object.entries(clothingTypes).map(([key, type]) => (
                      <SelectItem key={key} value={key}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Override if the AI misidentifies your clothing type</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt">Style Prompt</Label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="AI-generated prompt will appear here..."
                  className="min-h-20"
                />
                <Button variant="outline" size="sm" onClick={() => setPrompt(generateSmartPrompt())} className="w-full">
                  Generate Smart Prompt
                </Button>
                <p className="text-xs text-muted-foreground">Smart prompt generated automatically. Edit if needed.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Select Clothing ({selectedProducts.length} selected)</CardTitle>
              <CardDescription>Choose multiple items to create complete outfits</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedProducts.length > 0 && (
                <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-2">Selected Items:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs"
                      >
                        <span>{product.name}</span>
                        <button
                          onClick={() => removeProduct(product.id)}
                          className="hover:bg-primary/20 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className={`relative cursor-pointer border-2 rounded-lg p-3 transition-all hover:shadow-md ${
                      selectedProducts.some((p) => p.id === product.id)
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-primary/50"
                    }`}
                    onClick={() => toggleProductSelection(product)}
                  >
                    <div className="flex gap-3">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{product.name}</p>
                        <p className="text-sm text-muted-foreground">${product.price}</p>
                        <span className="text-xs text-gray-700 capitalize bg-gray-200 px-2 py-1 rounded-full inline-block mt-1 font-medium">
                          {product.category}
                        </span>
                      </div>
                    </div>
                    {selectedProducts.some((p) => p.id === product.id) && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Button
                onClick={handleTryOn}
                disabled={!selectedImage || selectedProducts.length === 0 || isProcessing}
                className="w-full mt-4"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Magic...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Try On {selectedProducts.length > 1 ? "Outfit" : "Clothes"}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Result Section */}
          <Card>
            <CardHeader>
              <CardTitle>Your Virtual Try-On</CardTitle>
              <CardDescription>See how you look in Felipe's Banana fashion!</CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  <img
                    src={result.url || "/placeholder.svg"}
                    alt="Virtual try-on result"
                    className="w-full h-64 object-cover rounded-lg border"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => {
                        const link = document.createElement("a")
                        link.href = result.url
                        link.download = "felipe-banana-tryout.jpg"
                        link.click()
                      }}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button className="flex-1">Add to Cart</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                  <div className="text-center">
                    <Camera className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground text-sm">
                      {!selectedImage
                        ? "Upload a photo"
                        : selectedProducts.length === 0
                          ? "Select clothing items"
                          : "Ready to try on!"}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
