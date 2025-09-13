import { Instagram, Twitter, Facebook } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t">
      <div className="container px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold tracking-tight">FELIPE'S 🍌</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Where fashion meets fun! Try on clothes virtually with our AI magic.
            </p>
          </div>
        </div>
        <div className="border-t mt-12 pt-8 text-center">
          <p className="text-sm text-muted-foreground">© 2024 Felipe's Banana. All rights reserved. 🍌</p>
        </div>
      </div>
    </footer>
  )
}
