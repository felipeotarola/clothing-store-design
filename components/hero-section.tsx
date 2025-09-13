import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-gradient-to-r from-muted/80 to-muted/40"
        style={{
          backgroundImage: `url('/minimalist-fashion-model-in-grayscale-wearing-eleg.jpg')`,
        }}
      />
      <div className="relative z-10 text-center space-y-6 max-w-2xl px-4">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance">
          FELIPE'S
          <br />
          BANANA 🍌
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-md mx-auto text-pretty">
          Where fashion meets fun! Try on clothes virtually with our AI magic
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            size="lg"
            className="mt-8 px-8 py-3 text-base"
            style={{
              backgroundColor: "#000000",
              color: "#ffffff",
              border: "none",
            }}
          >
            EXPLORE COLLECTION
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="mt-8 px-8 py-3 text-base bg-transparent"
            style={{
              backgroundColor: "#ffffff",
              color: "#000000",
              border: "2px solid #000000",
            }}
          >
            TRY ON NOW
          </Button>
        </div>
      </div>
    </section>
  )
}
