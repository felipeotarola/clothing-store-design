import { Instagram, Twitter, Facebook, Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t">
      <div className="container px-4 py-16">
        <div className="border-t mt-12 pt-8">
          <div className="flex flex-col items-center space-y-4">
            {/* Social Media Links */}
            <div className="flex items-center space-x-6">
              <a
                href="https://www.linkedin.com/in/felipe-otarola/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
    
            </div>
            
            {/* Copyright */}
            <p className="text-sm text-muted-foreground">
              © 2024 all rights reserved. Made with 🤖 by{" "}
              <a
                href="https://www.linkedin.com/in/felipe-otarola/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:text-primary transition-colors"
              >
                Felipe Otárola
              </a>{" "}
              
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
