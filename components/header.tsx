import { Search, ShoppingBag, User, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold tracking-tight">FELIPE'S 🍌</h1>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#pants" className="text-sm font-medium hover:text-primary transition-colors">
            PANTS
          </a>
          <a href="#shirts" className="text-sm font-medium hover:text-primary transition-colors">
            SHIRTS
          </a>
          <a href="#jackets" className="text-sm font-medium hover:text-primary transition-colors">
            JACKETS
          </a>
          <a href="#hats" className="text-sm font-medium hover:text-primary transition-colors">
            HATS
          </a>
          <a href="#try-on" className="text-sm font-medium hover:text-primary transition-colors">
            VIRTUAL TRY-ON
          </a>
        </nav>

        {/* Search and Actions */}
        <div className="flex items-center space-x-4">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search products..." className="w-64 pl-10 bg-muted/50 border-0 focus-visible:ring-1" />
          </div>
          <Button variant="ghost" size="icon">
            <Camera className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <ShoppingBag className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
