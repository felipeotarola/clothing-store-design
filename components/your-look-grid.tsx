"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Heart, Loader2, User, Package, Calendar, Expand, Upload, Camera, CheckCircle2 } from "lucide-react"
import { SharedLook } from "@/lib/supabase"
import { toast } from "sonner"

interface YourLookGridProps {
  category?: string
}

const POSE_OPTIONS = [
  { id: 'standing', label: 'Standing/Posing' },
  { id: 'walking', label: 'Walking' },
  { id: 'running', label: 'Running' },
  { id: 'sitting', label: 'Sitting' },
]

export function YourLookGrid({ category }: YourLookGridProps) {
  const [sharedLooks, setSharedLooks] = useState<SharedLook[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Upload states
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [selectedPose, setSelectedPose] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchSharedLooks = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/shared-looks")
      if (response.ok) {
        const data = await response.json()
        setSharedLooks(data.data || [])
      }
    } catch (error) {
      console.error("Error fetching shared looks:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Only load if we're showing the "your-look" category
    if (category === "your-look") {
      fetchSharedLooks()
    }
  }, [category])

  useEffect(() => {
    // Listen for shared look updates
    const handleSharedLookUpdate = () => {
      if (category === "your-look") {
        fetchSharedLooks()
      }
    }

    window.addEventListener('shared-look-updated', handleSharedLookUpdate)
    return () => {
      window.removeEventListener('shared-look-updated', handleSharedLookUpdate)
    }
  }, [category])

  // Upload handlers
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
    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handlePoseToggle = (poseId: string) => {
    // Toggle behavior: if same pose is clicked, deselect it; otherwise select the new pose
    setSelectedPose(prev => prev === poseId ? "" : poseId)
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error('Upload failed')
      }
      
      const data = await response.json()
      
      // Store the uploaded image URL and poses for the virtual try-on component
      const uploadedImageData = {
        url: data.url,
        file: selectedFile,
        poses: selectedPose ? [selectedPose] : [], // Convert single pose to array for backward compatibility
        timestamp: Date.now()
      }
      
      // Save to sessionStorage for the virtual try-on component to use
      sessionStorage.setItem('uploadedUserImage', JSON.stringify(uploadedImageData))
      
      // Dispatch custom event to notify virtual try-on component
      window.dispatchEvent(new CustomEvent('user-image-uploaded', { 
        detail: uploadedImageData 
      }))
      
      toast.success("Image uploaded successfully! 🎉", {
        description: `Ready for virtual try-on${selectedPose ? ` with ${selectedPose} pose` : ''}. Check the Virtual Try-On panel!`,
        duration: 5000,
      })
      
      // Reset form
      setSelectedFile(null)
      setPreviewUrl("")
      setSelectedPose("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      
    } catch (error) {
      console.error('Upload error:', error)
      toast.error("Upload failed", {
        description: "Please try again with a different image",
        duration: 3000,
      })
    } finally {
      setIsUploading(false)
    }
  }

  const clearSelection = () => {
    setSelectedFile(null)
    setPreviewUrl("")
    setSelectedPose("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Only render for "your-look" category
  if (category !== "your-look") {
    return null
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground mb-2" />
          <p className="text-muted-foreground text-sm">Loading your looks...</p>
        </div>
      </div>
    )
  }

  if (sharedLooks.length === 0) {
    return (
      <div className="space-y-8">
        {/* Upload Section */}
        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center">
                  {previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <User className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2">Upload Your Photo</h3>
                  <p className="text-muted-foreground text-sm">
                    Drag and drop or click to upload a photo for virtual try-on
                  </p>
                </div>

                {/* Drag and Drop Area */}
                <div
                  className={`relative border-2 border-dashed rounded-lg p-8 transition-all duration-200 cursor-pointer ${
                    dragActive 
                      ? 'border-primary bg-primary/10 scale-[1.02] shadow-lg' 
                      : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/30'
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
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  
                  <div className="text-center space-y-4">
                    <div className={`mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center transition-all duration-200 ${
                      dragActive ? 'bg-primary/20 scale-110' : ''
                    }`}>
                      <Upload className={`w-8 h-8 text-muted-foreground transition-all duration-200 ${
                        dragActive ? 'text-primary scale-110' : ''
                      }`} />
                    </div>
                    
                    {selectedFile ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                          <p className="font-medium text-primary">
                            {selectedFile.name}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className={`text-lg font-medium transition-colors duration-200 ${
                          dragActive ? 'text-primary' : ''
                        }`}>
                          {dragActive ? "Drop your image here" : "Choose your photo"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Drag and drop or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Supports JPG, PNG, GIF up to 10MB
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
                {selectedFile && (
                  <div className="space-y-4">
                    <div className="text-left">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        Select your pose (optional)
                        {selectedPose && (
                          <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full border border-primary/20">
                            {POSE_OPTIONS.find(p => p.id === selectedPose)?.label}
                          </span>
                        )}
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {POSE_OPTIONS.map((pose) => (
                          <div 
                            key={pose.id} 
                            className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer min-h-[60px] ${
                              selectedPose === pose.id 
                                ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20' 
                                : 'border-muted hover:border-muted-foreground/50 hover:bg-muted/50 active:bg-muted/70'
                            }`} 
                            onClick={() => handlePoseToggle(pose.id)}
                          >
                            <Checkbox
                              id={pose.id}
                              checked={selectedPose === pose.id}
                              onCheckedChange={() => handlePoseToggle(pose.id)}
                              className="scale-125"
                            />
                            <Label
                              htmlFor={pose.id}
                              className="text-base font-medium leading-relaxed cursor-pointer flex-1"
                            >
                              {pose.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={clearSelection}
                        className="flex-1 hover:bg-muted"
                        disabled={isUploading}
                      >
                        Clear
                      </Button>
                      <Button
                        onClick={handleUpload}
                        className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md"
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Camera className="mr-2 h-4 w-4" />
                            Upload & Try On
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Empty State */}
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Heart className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No shared looks yet</h3>
            <p className="text-muted-foreground text-sm">
              Upload a photo and try on some clothes to see your looks here!
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Existing Looks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {sharedLooks.map((look) => (
        <Card key={look.id} className="group cursor-pointer border-0 shadow-none">
          <CardContent className="p-0">
            <div className="relative aspect-[3/4] overflow-hidden bg-muted">
              {/* Expand button overlay - always visible */}
              <Dialog>
                <DialogTrigger asChild>
                  <div className="cursor-pointer h-full w-full relative">
                    <img
                      src={look.image_url || "/placeholder.svg"}
                      alt={`Shared look with ${look.product_names}`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Input image thumbnail indicator */}
                    {look.user_image_url && (
                      <div className="absolute top-2 left-2">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white shadow-lg bg-white/90 backdrop-blur-sm">
                          <img
                            src={look.user_image_url}
                            alt="Original input"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 text-center">
                            <span className="text-white text-[8px] font-bold drop-shadow-sm">INPUT</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Expand button - always visible */}
                    <div className="absolute top-2 right-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="bg-black/30 hover:bg-black/50 border-0 text-white backdrop-blur-sm"
                      >
                        <Expand className="h-4 w-4" />
                      </Button>
                    </div>
                    {/* Hover overlay hint */}
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/5 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                        Click to expand
                      </div>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Shared Look Details
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Original User Image */}
                    {look.user_image_url && (
                      <div className="space-y-3">
                        <h3 className="flex items-center gap-2 font-semibold text-sm uppercase tracking-wide">
                          <User className="h-4 w-4" />
                          Original Photo
                        </h3>
                        <div className="aspect-[3/4] overflow-hidden rounded-lg bg-muted">
                          <img
                            src={look.user_image_url}
                            alt="Original user photo"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Result Image */}
                    <div className="space-y-3">
                      <h3 className="flex items-center gap-2 font-semibold text-sm uppercase tracking-wide">
                        <Package className="h-4 w-4" />
                        Virtual Try-On Result
                      </h3>
                      <div className="aspect-[3/4] overflow-hidden rounded-lg bg-muted">
                        <img
                          src={look.image_url}
                          alt="Virtual try-on result"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Selected Items */}
                  <div className="space-y-3 mt-6">
                    <h3 className="flex items-center gap-2 font-semibold text-sm uppercase tracking-wide">
                      <Package className="h-4 w-4" />
                      Selected Items
                    </h3>
                    {look.selected_items && look.selected_items.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {look.selected_items.map((item: any, index: number) => (
                          <div key={index} className="space-y-2">
                            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                              <img
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="text-xs space-y-1">
                              <p className="font-medium line-clamp-2">{item.name}</p>
                              <p className="text-muted-foreground">${item.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {look.product_names}
                      </p>
                    )}
                  </div>
                  
                  {/* Additional Info */}
                  <div className="space-y-3 mt-6 pt-6 border-t">
                    {look.prompt && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Styling Notes</h4>
                        <p className="text-sm text-muted-foreground">{look.prompt}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Shared on {new Date(look.created_at).toLocaleDateString()}
                    </div>
                    
                    <div className="flex gap-2 pt-4">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          const link = document.createElement("a")
                          link.href = look.image_url
                          link.download = `shared-look-${look.id}.jpg`
                          link.click()
                        }}
                      >
                        Download Result
                      </Button>
                      {look.user_image_url && (
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => {
                            const link = document.createElement("a")
                            link.href = look.user_image_url!
                            link.download = `original-photo-${look.id}.jpg`
                            link.click()
                          }}
                        >
                          Download Original
                        </Button>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="p-4 space-y-2">
              <h3 className="font-medium text-sm tracking-wide uppercase line-clamp-2">
                {look.product_names}
              </h3>
              {look.prompt && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {look.prompt}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Shared {new Date(look.created_at).toLocaleDateString()}
              </p>
              <div className="flex gap-2 mt-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
                  onClick={() => {
                    const link = document.createElement("a")
                    link.href = look.image_url
                    link.download = `shared-look-${look.id}.jpg`
                    link.click()
                  }}
                >
                  DOWNLOAD
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      </div>
    </div>
  )
}