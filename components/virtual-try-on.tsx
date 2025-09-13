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

const poseOptions = {
  standing: "standing upright with good posture",
  sitting: "sitting comfortably with good posture",
  walking: "walking naturally with confident stride",
  posing: "striking a fashionable pose for the camera",
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
  id: string
  timestamp: number
}

export function VirtualTryOn() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([])
  const [clothingTypeOverride, setClothingTypeOverride] = useState<string>("auto-detect")
  const [selectedPoses, setSelectedPoses] = useState<string[]>(["standing"])
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<TryOnResult[]>([])
  const [prompt, setPrompt] = useState("")
  const [isImageExpanded, setIsImageExpanded] = useState(false)
  const [expandedImageUrl, setExpandedImageUrl] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const generateSmartPrompt = () => {
    if (selectedProducts.length === 0) return ""

    const poseDescription =
      selectedPoses.length > 0
        ? selectedPoses.map((pose) => poseOptions[pose as keyof typeof poseOptions]).join(" or ")
        : "standing upright with good posture"

    if (selectedProducts.length === 1) {
      const product = selectedProducts[0]
      const clothingType = clothingTypeOverride || product.category
      const typeInfo = clothingTypes[clothingType as keyof typeof clothingTypes]

      if (!typeInfo)
        return `Make the person wear the ${product.name}. The person should be ${poseDescription}. Ensure natural lighting and realistic fit.`

      return `Make the person wear the ${product.name} specifically on their ${typeInfo.placement}. The person should be ${poseDescription}. Ensure the ${clothingType} fits naturally and realistically on the correct body part. Do not confuse this ${clothingType} with other clothing types. Maintain natural lighting and realistic proportions.`
    }

    // Multiple products - create complete outfit
    const outfitItems = selectedProducts
      .map((product) => {
        const typeInfo = clothingTypes[product.category as keyof typeof clothingTypes]
        return `${product.name} on ${typeInfo?.placement || "appropriate body part"}`
      })
      .join(", ")

    return `Create a complete stylish outfit with: ${outfitItems}. The person should be ${poseDescription}. Ensure all clothing items fit naturally and complement each other. Maintain natural lighting and realistic proportions for a cohesive look.`
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
      const newResult: TryOnResult = {
        url: data.output,
        prompt: prompt,
        id: Date.now().toString(),
        timestamp: Date.now(),
      }
      setResults((prev) => [newResult, ...prev])
    } catch (error) {
      console.error("Error processing image:", error)
      alert("Failed to process image. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const togglePoseSelection = (pose: string) => {
    setSelectedPoses((prev) => {
      const isSelected = prev.includes(pose)
      if (isSelected) {
        return prev.filter((p) => p !== pose)
      } else {
        return [...prev, pose]
      }
    })
  }

  const handleImageExpand = (imageUrl: string) => {
    setExpandedImageUrl(imageUrl)
    setIsImageExpanded(true)
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

        <div className="max-w-6xl mx-auto space-y-12">
          <div className="grid md:grid-cols-2 gap-8">
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
                      className="w-full h-64 object-cover rounded-lg border"
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
                  <Label>Pose Selection</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(poseOptions).map(([key, description]) => (
                      <div
                        key={key}
                        className={`flex items-center space-x-2 p-2 rounded border cursor-pointer transition-colors ${
                          selectedPoses.includes(key)
                            ? "border-primary bg-gray-100 text-gray-900"
                            : "border-muted hover:border-primary/50 bg-white text-gray-700"
                        }`}
                        onClick={() => togglePoseSelection(key)}
                      >
                        <div
                          className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                            selectedPoses.includes(key) ? "border-primary bg-primary" : "border-muted"
                          }`}
                        >
                          {selectedPoses.includes(key) && <Check className="h-3 w-3 text-primary-foreground" />}
                        </div>
                        <span className="text-sm capitalize font-medium">{key}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Select one or more poses for variety</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Style Configuration</CardTitle>
                <CardDescription>Customize your virtual try-on experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prompt">Style Prompt</Label>
                  <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="AI-generated prompt will appear here..."
                    className="min-h-32"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPrompt(generateSmartPrompt())}
                    className="w-full"
                  >
                    Generate Smart Prompt
                  </Button>
                  <p className="text-xs text-muted-foreground">Smart prompt generated automatically. Edit if needed.</p>
                </div>

                {selectedProducts.length > 0 && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-3">Selected Items ({selectedProducts.length}):</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedProducts.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
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

                <Button
                  onClick={handleTryOn}
                  disabled={!selectedImage || selectedProducts.length === 0 || isProcessing}
                  className="w-full"
                  size="lg"
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
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Select Clothing</CardTitle>
              <CardDescription>Choose multiple items to create complete outfits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className={`relative cursor-pointer border-2 rounded-lg p-4 transition-all hover:shadow-md ${
                      selectedProducts.some((p) => p.id === product.id)
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-primary/50"
                    }`}
                    onClick={() => toggleProductSelection(product)}
                  >
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-32 object-cover rounded mb-3"
                    />
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-sm text-muted-foreground">${product.price}</p>
                      <span className="text-xs text-gray-700 capitalize bg-gray-200 px-2 py-1 rounded-full inline-block font-medium">
                        {product.category}
                      </span>
                    </div>
                    {selectedProducts.some((p) => p.id === product.id) && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {results.length > 0 && (
            <div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold tracking-tight mb-2">GENERATED LOOKS</h3>
                <p className="text-muted-foreground">Your virtual try-on results</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((result, index) => (
                  <Card key={result.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative cursor-pointer" onClick={() => handleImageExpand(result.url)}>
                      <img
                        src={result.url || "/placeholder.svg"}
                        alt={`Virtual try-on result ${index + 1}`}
                        className="w-full h-64 object-cover hover:opacity-90 transition-opacity"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
                        <div className="bg-white/90 px-3 py-1 rounded-full text-sm font-medium">Click to expand</div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1 bg-transparent"
                          onClick={() => {
                            const link = document.createElement("a")
                            link.href = result.url
                            link.download = `felipe-banana-look-${index + 1}.jpg`
                            link.click()
                          }}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                        <Button className="flex-1">Add to Cart</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {results.length === 0 && (
            <div className="text-center py-12">
              <Camera className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No looks generated yet</h3>
              <p className="text-muted-foreground">
                Upload a photo and select clothing items to start creating your virtual looks!
              </p>
            </div>
          )}
        </div>

        {isImageExpanded && expandedImageUrl && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setIsImageExpanded(false)}
          >
            <div className="relative max-w-4xl max-h-full">
              <button
                onClick={() => setIsImageExpanded(false)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              >
                <X className="h-8 w-8" />
              </button>
              <img
                src={expandedImageUrl || "/placeholder.svg"}
                alt="Virtual try-on result - expanded view"
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation()
                    const link = document.createElement("a")
                    link.href = expandedImageUrl
                    link.download = "felipe-banana-tryout.jpg"
                    link.click()
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button className="flex-1" onClick={(e) => e.stopPropagation()}>
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
