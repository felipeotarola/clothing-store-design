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

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm tracking-wide uppercase">Shop</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#pants" className="hover:text-foreground transition-colors">
                  Pants
                </a>
              </li>
              <li>
                <a href="#shirts" className="hover:text-foreground transition-colors">
                  Shirts
                </a>
              </li>
              <li>
                <a href="#jackets" className="hover:text-foreground transition-colors">
                  Jackets
                </a>
              </li>
              <li>
                <a href="#hats" className="hover:text-foreground transition-colors">
                  Hats
                </a>
              </li>
              <li>
                <a href="#try-on" className="hover:text-foreground transition-colors">
                  Virtual Try-On
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm tracking-wide uppercase">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Size Guide
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Shipping
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Returns
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-foreground transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm tracking-wide uppercase">Stay Updated</h4>
            <p className="text-sm text-muted-foreground">Subscribe for banana-tastic fashion updates!</p>
            <div className="flex space-x-4">
              <Instagram className="h-5 w-5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
              <Twitter className="h-5 w-5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
              <Facebook className="h-5 w-5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
            </div>
          </div>
        </div>

        <div className="border-t mt-12 pt-8 text-center">
          <p className="text-sm text-muted-foreground">© 2024 Felipe's Banana. All rights reserved. 🍌</p>
        </div>
      </div>
    </footer>
  )
}
