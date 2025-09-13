"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Heart, Loader2, User, Package, Calendar, Expand } from "lucide-react"
import { SharedLook } from "@/lib/supabase"

interface YourLookGridProps {
  category?: string
}

export function YourLookGrid({ category }: YourLookGridProps) {
  const [sharedLooks, setSharedLooks] = useState<SharedLook[]>([])
  const [isLoading, setIsLoading] = useState(true)

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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Heart className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No shared looks yet</h3>
          <p className="text-muted-foreground text-sm">
            Try on some clothes and share your favorite looks to see them here!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {sharedLooks.map((look) => (
        <Card key={look.id} className="group cursor-pointer border-0 shadow-none">
          <CardContent className="p-0">
            <div className="relative aspect-[3/4] overflow-hidden bg-muted">
              <img
                src={look.image_url || "/placeholder.svg"}
                alt={`Shared look with ${look.product_names}`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {/* Expand button overlay */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 hover:bg-black/40 border-0 text-white"
                  >
                    <Expand className="h-4 w-4" />
                  </Button>
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
  )
}