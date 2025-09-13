"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Camera, Loader2, Download, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

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
]

interface TryOnResult {
  url: string
  prompt: string
}

export function VirtualTryOn() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<TryOnResult | null>(null)
  const [prompt, setPrompt] = useState(
    "Make the person wear the selected clothing item. Make the scene natural and well-lit.",
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleTryOn = async () => {
    if (!selectedImage || !selectedProduct) return

    setIsProcessing(true)
    try {
      // Convert clothing image to base64
      const clothingImageResponse = await fetch(selectedProduct.image)
      const clothingImageBlob = await clothingImageResponse.blob()

      const formData = new FormData()
      formData.append("userImage", selectedImage)
      formData.append("clothingImage", clothingImageBlob, `${selectedProduct.name}.jpg`)
      formData.append("prompt", prompt)
      formData.append("productName", selectedProduct.name)

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
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-4">VIRTUAL TRY-ON</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Upload your photo, select clothes, and see how they look on you using AI magic! 🍌✨
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
                <Label htmlFor="prompt">Style Prompt</Label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe how you want to style the outfit..."
                  className="min-h-20"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Select Clothing</CardTitle>
              <CardDescription>Choose an item to try on</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className={`relative cursor-pointer border-2 rounded-lg p-2 transition-all ${
                      selectedProduct?.id === product.id
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedProduct(product)}
                  >
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-24 object-cover rounded"
                    />
                    <p className="text-xs font-medium mt-1 text-center">{product.name}</p>
                    <p className="text-xs text-muted-foreground text-center">${product.price}</p>
                    {selectedProduct?.id === product.id && (
                      <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Button
                onClick={handleTryOn}
                disabled={!selectedImage || !selectedProduct || isProcessing}
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
                    Try On Clothes
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
                      {!selectedImage ? "Upload a photo" : !selectedProduct ? "Select clothing" : "Ready to try on!"}
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
