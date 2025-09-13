import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 flex">
        {/* Female model section */}
        <div
          className="w-1/2 bg-gradient-to-r from-black/60 to-black/40"
          style={{
            backgroundImage: `url('/minimalist-fashion-model-in-grayscale-wearing-eleg.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* Male model section */}
        <div
          className="w-1/2 bg-gradient-to-l from-black/60 to-black/40"
          style={{
            backgroundImage: `url('/stylish-male-model-in-modern-casual-wear--black-an.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </div>

      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 text-center space-y-6 max-w-2xl px-4">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-balance text-white drop-shadow-2xl">
          FELIPE'S
          <br />
          BANANA 🍌
        </h1>
        <p className="text-lg md:text-xl text-white max-w-md mx-auto text-pretty drop-shadow-xl">
          Style for everyone! Try on clothes virtually with our AI magic
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" className="mt-8 px-8 py-3 text-base bg-black hover:bg-gray-900 text-white border-0">
            EXPLORE COLLECTION
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="mt-8 px-8 py-3 text-base bg-white/90 backdrop-blur-sm text-black border-white hover:bg-white hover:text-black"
          >
            TRY ON NOW
          </Button>
        </div>
      </div>
    </section>
  )
}
