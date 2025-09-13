"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Camera, Loader2, Download, Expand, Share2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

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

let globalSelectedProducts: Product[] = []
let globalSetSelectedProducts: ((products: Product[]) => void) | null = null

export function toggleGlobalSelectedProduct(product: Product) {
  const existingIndex = globalSelectedProducts.findIndex(p => p.id === product.id)
  
  if (existingIndex >= 0) {
    // Remove product if already selected
    globalSelectedProducts = globalSelectedProducts.filter(p => p.id !== product.id)
  } else {
    // Add product if not selected
    globalSelectedProducts = [...globalSelectedProducts, product]
  }
  
  if (globalSetSelectedProducts) {
    globalSetSelectedProducts(globalSelectedProducts)
  }
}

export function removeGlobalSelectedProduct(productId: string) {
  globalSelectedProducts = globalSelectedProducts.filter(p => p.id !== productId)
  if (globalSetSelectedProducts) {
    globalSetSelectedProducts(globalSelectedProducts)
  }
}

export function isProductSelected(productId: string): boolean {
  return globalSelectedProducts.some(p => p.id === productId)
}

export function VirtualTryOn() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [selectedProducts, setSelectedProducts] = useState<Product[]>(globalSelectedProducts)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [showShareConfirm, setShowShareConfirm] = useState(false)
  const [result, setResult] = useState<TryOnResult | null>(null)
  const [prompt, setPrompt] = useState(
    "Make the person wear the selected clothing items. Make the scene natural and well-lit.",
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  globalSetSelectedProducts = setSelectedProducts

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleShareClick = () => {
    setShowShareConfirm(true)
  }

  const handleConfirmShare = async () => {
    if (!result) return

    setIsSharing(true)
    setShowShareConfirm(false)
    try {
      const response = await fetch("/api/shared-looks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_url: result.url,
          user_image_url: previewUrl, // Include the original user image
          prompt: result.prompt,
          product_names: selectedProducts.map(p => p.name).join(", "),
          selected_items: selectedProducts, // Include the full product data
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to share look")
      }

      const data = await response.json()
      alert("Look shared successfully! 🎉")
      
      // Trigger a refresh of the "Your Look" section
      window.dispatchEvent(new CustomEvent('shared-look-updated'))
    } catch (error) {
      console.error("Error sharing look:", error)
      alert("Failed to share look. Please try again.")
    } finally {
      setIsSharing(false)
    }
  }

  const handleCancelShare = () => {
    setShowShareConfirm(false)
  }

  const handleTryOn = async () => {
    if (!selectedImage || selectedProducts.length === 0) return

    setIsProcessing(true)
    try {
      // Convert all clothing images to base64
      const clothingImages = await Promise.all(
        selectedProducts.map(async (product) => {
          const response = await fetch(product.image)
          const blob = await response.blob()
          return { blob, name: product.name }
        })
      )

      const formData = new FormData()
      formData.append("userImage", selectedImage)
      
      // Add all clothing images
      clothingImages.forEach((item, index) => {
        formData.append(`clothingImage_${index}`, item.blob, `${item.name}.jpg`)
      })
      
      formData.append("prompt", prompt)
      formData.append("productNames", selectedProducts.map(p => p.name).join(", "))
      formData.append("productCount", selectedProducts.length.toString())

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

        {/* Selected Items Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Selected Items ({selectedProducts.length})</CardTitle>
            <CardDescription className="text-xs">Ready to try on?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedProducts.length > 0 ? (
              <div className="space-y-3">
                {selectedProducts.map((product) => (
                  <div key={product.id} className="flex items-center space-x-3 p-2 border rounded-lg">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-md border"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-xs truncate">{product.name}</h4>
                      <p className="text-sm font-bold text-primary">${product.price}</p>
                      <p className="text-xs text-muted-foreground capitalize">{product.category}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => removeGlobalSelectedProduct(product.id)}
                      className="text-xs px-2"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedProducts([])} 
                  className="w-full text-xs"
                >
                  Clear All
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <p className="text-muted-foreground text-xs text-center px-2">
                  Select items from the categories to preview
                </p>
              </div>
            )}

            <Button
              onClick={handleTryOn}
              disabled={!selectedImage || selectedProducts.length === 0 || isProcessing}
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
                <div className="relative">
                  <img
                    src={result.url || "/placeholder.svg"}
                    alt="Virtual try-on result"
                    className="w-full h-40 object-cover rounded-lg border"
                  />
                  {/* Expand Icon */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white text-black"
                      >
                        <Expand className="h-3 w-3" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl w-full">
                      <DialogHeader>
                        <DialogTitle>Your Virtual Try-On Result</DialogTitle>
                        <DialogDescription>
                          Items: {selectedProducts.map(p => p.name).join(", ")}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-center">
                        <img
                          src={result.url || "/placeholder.svg"}
                          alt="Virtual try-on result expanded"
                          className="max-w-full max-h-96 object-contain rounded-lg"
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
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
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={handleShareClick}
                    disabled={isSharing}
                  >
                    {isSharing ? (
                      <>
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        Sharing...
                      </>
                    ) : (
                      <>
                        <Share2 className="mr-1 h-3 w-3" />
                        Share Look
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                <div className="text-center">
                  <Camera className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground text-xs">
                    {!selectedImage ? "Upload a photo" : selectedProducts.length === 0 ? "Select clothing" : "Ready to try on!"}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Share Confirmation Dialog */}
      <Dialog open={showShareConfirm} onOpenChange={setShowShareConfirm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Share Your Look?</DialogTitle>
            <DialogDescription>
              Your look will be shared publicly in the "Your Look" section for everyone to see and get inspired by.
            </DialogDescription>
          </DialogHeader>
          
          {result && (
            <div className="space-y-4">
              {/* What will be shared preview */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm">What will be shared:</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Original Photo */}
                  {previewUrl && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground font-medium">Your Original Photo</p>
                      <img
                        src={previewUrl}
                        alt="Your original photo"
                        className="w-full aspect-[3/4] object-cover rounded-lg border"
                      />
                    </div>
                  )}
                  
                  {/* Try-on Result */}
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">Virtual Try-On Result</p>
                    <img
                      src={result.url || "/placeholder.svg"}
                      alt="Virtual try-on result"
                      className="w-full aspect-[3/4] object-cover rounded-lg border"
                    />
                  </div>
                </div>
                
                {/* Selected Items */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium">Selected Items</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedProducts.map((product, index) => (
                      <div key={index} className="flex items-center gap-2 bg-muted rounded-lg p-2">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-8 h-8 object-cover rounded"
                        />
                        <div className="text-xs">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-muted-foreground">${product.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelShare}
              disabled={isSharing}
            >
              No, Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleConfirmShare}
              disabled={isSharing}
            >
              {isSharing ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Sharing...
                </>
              ) : (
                "Yes, Share"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
