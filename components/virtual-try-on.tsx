"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Camera, Loader2, Download, Expand, Share2, User, CheckCircle2, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
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

const POSE_OPTIONS = [
  { id: 'standing', label: 'Standing/Posing' },
  { id: 'walking', label: 'Walking' },
  { id: 'running', label: 'Running' },
  { id: 'sitting', label: 'Sitting' },
]

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
  const [selectedPoses, setSelectedPoses] = useState<string[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [isStylePromptCollapsed, setIsStylePromptCollapsed] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [prompt, setPrompt] = useState(
    "Make the person wear the selected clothing items. Make the scene natural and well-lit.",
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  globalSetSelectedProducts = setSelectedProducts

  // Update prompt when poses change
  useEffect(() => {
    if (selectedPoses.length > 0) {
      const poseText = selectedPoses.join(', ')
      setPrompt(`Make the person wear the selected clothing items while ${poseText}. Make the scene natural and well-lit.`)
    } else {
      setPrompt("Make the person wear the selected clothing items. Make the scene natural and well-lit.")
    }
  }, [selectedPoses])

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  // Drag and drop handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith('image/')) {
        handleFileSelect(file)
      } else {
        toast.error("Please upload an image file")
      }
    }
  }, [])

  const handleFileSelect = (file: File) => {
    setSelectedImage(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handlePoseToggle = (poseId: string) => {
    setSelectedPoses(prev => 
      prev.includes(poseId) 
        ? prev.filter(id => id !== poseId)
        : [...prev, poseId]
    )
  }

  const handleShareClick = () => {
    setShowShareConfirm(true)
  }

  const handleConfirmShare = async () => {
    if (!result || !selectedImage) return

    setIsSharing(true)
    setShowShareConfirm(false)
    try {
      // First, upload the user's original image to Vercel Blob
      let userImageUrl = null
      if (selectedImage) {
        const userImageFormData = new FormData()
        userImageFormData.append("file", selectedImage)
        
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: userImageFormData,
        })
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json()
          userImageUrl = uploadData.url
        } else {
          console.warn("Failed to upload user image, proceeding without it")
        }
      }

      // Then save the shared look with the permanent user image URL
      const response = await fetch("/api/shared-looks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_url: result.url,
          user_image_url: userImageUrl, // Use the permanent blob URL
          prompt: result.prompt,
          product_names: selectedProducts.map(p => p.name).join(", "),
          selected_items: selectedProducts, // Include the full product data
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to share look")
      }

      const data = await response.json()
      toast.success("Look shared successfully! 🎉", {
        description: "Your virtual try-on look is now visible in the 'Your Look' section for everyone to see!",
        duration: 5000,
      })
      
      // Trigger a refresh of the "Your Look" section
      window.dispatchEvent(new CustomEvent('shared-look-updated'))
    } catch (error) {
      console.error("Error sharing look:", error)
      toast.error("Failed to share look", {
        description: "There was an error uploading your images. Please try again.",
        duration: 5000,
      })
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
    
    // Show processing toast
    toast.info("Generating your virtual try-on...", {
      description: `Processing ${selectedProducts.length} item${selectedProducts.length > 1 ? 's' : ''} with AI magic ✨`,
      duration: 3000,
    })
    
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
      
      // Show success toast
      toast.success("Virtual try-on completed! 🎉", {
        description: `Successfully generated your look with ${selectedProducts.map(p => p.name).join(", ")}`,
        duration: 5000,
      })
    } catch (error) {
      console.error("Error processing image:", error)
      toast.error("Failed to process image", {
        description: "Please try again with a different photo or clothing selection.",
        duration: 5000,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className="rounded-full w-16 h-16 shadow-lg"
        >
          <Camera className="h-6 w-6" />
        </Button>
        {selectedProducts.length > 0 && (
          <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
            {selectedProducts.length}
          </div>
        )}
      </div>

      {/* Desktop Sidebar / Mobile Overlay */}
      <div
        className={`fixed right-0 bg-background border-l border-border z-40 overflow-y-auto transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:w-96
          ${isOpen ? 'translate-x-0 w-full max-w-md' : 'translate-x-full w-full max-w-md'}
        `}
        style={{ top: "4rem", height: "calc(100vh - 4rem)" }}
      >
      <div className="p-6 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight mb-2">VIRTUAL TRY-ON</h2>
          <p className="text-muted-foreground text-sm">
            Upload your photo and select clothes to see how they look on you! ✨
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
            {/* Avatar Preview */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center border-2 border-dashed border-muted-foreground/25">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <User className="w-10 h-10 text-muted-foreground" />
                )}
              </div>
            </div>

            {/* Drag and Drop Area */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-4 transition-all duration-200 cursor-pointer ${
                dragActive 
                  ? 'border-primary bg-primary/10 scale-[1.01] shadow-md' 
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/20'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              
              <div className="text-center space-y-2">
                <div className={`transition-all duration-200 ${
                  dragActive ? 'scale-110' : ''
                }`}>
                  <Upload className={`w-6 h-6 mx-auto text-muted-foreground transition-colors duration-200 ${
                    dragActive ? 'text-primary' : ''
                  }`} />
                </div>
                
                {selectedImage ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <p className="font-medium text-primary text-sm">
                        {selectedImage.name}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className={`text-sm font-medium transition-colors duration-200 ${
                      dragActive ? 'text-primary' : ''
                    }`}>
                      {dragActive ? "Drop image here" : "Click or drag to upload"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG, GIF up to 10MB
                    </p>
                  </div>
                )}
              </div>

              {/* Animated border for drag state */}
              {dragActive && (
                <div className="absolute inset-0 border-2 border-primary rounded-lg animate-pulse pointer-events-none" />
              )}
            </div>

            {/* Pose Selection */}
            {selectedImage && (
              <div className="space-y-3">
                <div className="text-left">
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    Select poses (optional)
                    {selectedPoses.length > 0 && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        {selectedPoses.length}
                      </span>
                    )}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {POSE_OPTIONS.map((pose) => (
                      <div key={pose.id} className={`flex items-center space-x-2 p-1.5 rounded-md border transition-all duration-200 cursor-pointer ${
                        selectedPoses.includes(pose.id) 
                          ? 'border-primary bg-primary/5' 
                          : 'border-muted hover:border-muted-foreground/50 hover:bg-muted/50'
                      }`} onClick={() => handlePoseToggle(pose.id)}>
                        <Checkbox
                          id={pose.id}
                          checked={selectedPoses.includes(pose.id)}
                          onCheckedChange={() => handlePoseToggle(pose.id)}
                        />
                        <Label
                          htmlFor={pose.id}
                          className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {pose.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div 
                className="flex items-center justify-between cursor-pointer p-2 rounded-md hover:bg-muted/50 transition-colors duration-200"
                onClick={() => setIsStylePromptCollapsed(!isStylePromptCollapsed)}
              >
                <Label htmlFor="prompt" className="text-sm font-medium cursor-pointer">
                  Style Prompt
                </Label>
                <div className="flex items-center gap-1">
                  {!isStylePromptCollapsed && (
                    <span className="text-xs text-muted-foreground">Click to collapse</span>
                  )}
                  <ChevronDown 
                    className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${
                      isStylePromptCollapsed ? '-rotate-90' : 'rotate-0'
                    }`}
                  />
                </div>
              </div>
              
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isStylePromptCollapsed ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'
              }`}>
                <div className="space-y-2 pt-1">
                  <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe how you want to style the outfit..."
                    className="min-h-16 text-xs transition-all duration-200"
                  />
                  <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-md">
                    💡 <strong>Tip:</strong> Be specific about styling, poses, lighting, and mood for better results
                  </p>
                </div>
              </div>
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
                  {/* Expand Icon */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="cursor-pointer relative">
                        <img
                          src={result.url || "/placeholder.svg"}
                          alt="Virtual try-on result"
                          className="w-full h-40 object-cover rounded-lg border hover:opacity-90 transition-opacity"
                        />
                        {/* Expand button - always visible */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute top-2 right-2 bg-white/90 hover:bg-white text-black"
                        >
                          <Expand className="h-3 w-3" />
                        </Button>
                      </div>
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
              Your look will be shared publicly in the "Your Look" section for everyone to see and get inspired by. Your images will be securely uploaded and stored.
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
                  Uploading & Sharing...
                </>
              ) : (
                "Yes, Share"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </>
  )
}
