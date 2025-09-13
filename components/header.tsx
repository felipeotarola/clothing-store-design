import { Camera } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold tracking-tight">FELIPE'S 🍌</h1>
        </div>

        <nav className="flex items-center space-x-8">
          <a href="#try-on" className="text-sm font-medium hover:text-primary transition-colors">
            VIRTUAL TRY-ON
          </a>
        </nav>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Camera className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
