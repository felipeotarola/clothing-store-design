"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Camera, Loader2, Download } from "lucide-react"
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

interface TryOnResult {
  url: string
  prompt: string
}

let globalSelectedProduct: Product | null = null
let globalSetSelectedProduct: ((product: Product | null) => void) | null = null

export function setGlobalSelectedProduct(product: Product) {
  globalSelectedProduct = product
  if (globalSetSelectedProduct) {
    globalSetSelectedProduct(product)
  }
}

export function VirtualTryOn() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(globalSelectedProduct)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<TryOnResult | null>(null)
  const [prompt, setPrompt] = useState(
    "Make the person wear the selected clothing item. Make the scene natural and well-lit.",
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  globalSetSelectedProduct = setSelectedProduct

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
    <div
      className="fixed right-0 w-96 bg-background border-l border-border z-50 overflow-y-auto"
      style={{ top: "4rem", height: "calc(100vh - 4rem)" }}
    >
      <div className="p-6 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight mb-2">VIRTUAL TRY-ON</h2>
          <p className="text-muted-foreground text-sm">
            Upload your photo and select clothes to see how they look on you! 🍌✨
          </p>
        </div>

        {/* Upload Photo Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Camera className="h-4 w-4" />
              Upload Your Photo
            </CardTitle>
            <CardDescription className="text-xs">Choose a clear photo of yourself</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-upload" className="text-sm">
                Select Image
              </Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                ref={fileInputRef}
                className="cursor-pointer text-xs"
              />
            </div>

            {previewUrl && (
              <div className="relative">
                <img
                  src={previewUrl || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-lg border"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="prompt" className="text-sm">
                Style Prompt
              </Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe how you want to style the outfit..."
                className="min-h-16 text-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* Selected Item Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Selected Item</CardTitle>
            <CardDescription className="text-xs">Ready to try on?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedProduct ? (
              <div className="space-y-3">
                <img
                  src={selectedProduct.image || "/placeholder.svg"}
                  alt={selectedProduct.name}
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <div className="text-center">
                  <h3 className="font-semibold text-sm">{selectedProduct.name}</h3>
                  <p className="text-lg font-bold text-primary">${selectedProduct.price}</p>
                  <p className="text-xs text-muted-foreground capitalize">{selectedProduct.category}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setSelectedProduct(null)} className="w-full text-xs">
                  Clear Selection
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <p className="text-muted-foreground text-xs text-center px-2">
                  Select an item from the categories to preview
                </p>
              </div>
            )}

            <Button
              onClick={handleTryOn}
              disabled={!selectedImage || !selectedProduct || isProcessing}
              className="w-full"
              size="sm"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-3 w-3" />
                  Try On Clothes
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Result Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Your Virtual Try-On</CardTitle>
            <CardDescription className="text-xs">See how you look in Felipe's Banana fashion!</CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-3">
                <img
                  src={result.url || "/placeholder.svg"}
                  alt="Virtual try-on result"
                  className="w-full h-40 object-cover rounded-lg border"
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent text-xs"
                    onClick={() => {
                      const link = document.createElement("a")
                      link.href = result.url
                      link.download = "felipe-banana-tryout.jpg"
                      link.click()
                    }}
                  >
                    <Download className="mr-1 h-3 w-3" />
                    Download
                  </Button>
                  <Button size="sm" className="flex-1 text-xs">
                    Add to Cart
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <div className="text-center">
                  <Camera className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground text-xs">
                    {!selectedImage ? "Upload a photo" : !selectedProduct ? "Select clothing" : "Ready to try on!"}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
