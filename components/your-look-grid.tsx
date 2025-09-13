"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Loader2 } from "lucide-react"
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
            <div className="aspect-[3/4] overflow-hidden bg-muted">
              <img
                src={look.image_url || "/placeholder.svg"}
                alt={`Shared look with ${look.product_names}`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
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