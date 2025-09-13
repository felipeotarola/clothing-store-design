import { type NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"
import { put } from "@vercel/blob"

export const runtime = "nodejs" // Use nodejs runtime to avoid Edge issues with Buffer

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    console.log("[API] FormData entries:")
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`[API] ${key}: File - ${value.name}, size: ${value.size} bytes, type: ${value.type}`)
      } else {
        console.log(`[API] ${key}: ${value}`)
      }
    }
    
    const userImage = formData.get("userImage") as File
    const prompt = formData.get("prompt") as string
    const productNames = formData.get("productNames") as string
    const productCount = parseInt(formData.get("productCount") as string) || 1

    console.log(`[API] Processing request - userImage: ${!!userImage}, productCount: ${productCount}`)

    if (!userImage) {
      console.error("[API] No user image provided")
      return NextResponse.json({ error: "User image is required" }, { status: 400 })
    }

    if (userImage.size === 0) {
      console.error("[API] User image is empty")
      return NextResponse.json({ error: "User image is empty" }, { status: 400 })
    }

    // Collect all clothing images
    const clothingImages: File[] = []
    for (let i = 0; i < productCount; i++) {
      const clothingImage = formData.get(`clothingImage_${i}`) as File
      if (clothingImage) {
        console.log(`[API] Found clothing image ${i}: ${clothingImage.name}, size: ${clothingImage.size}`)
        clothingImages.push(clothingImage)
      } else {
        console.log(`[API] Missing clothing image ${i}`)
      }
    }

    if (clothingImages.length === 0) {
      console.error("[API] No clothing images found")
      return NextResponse.json({ error: "At least one clothing image is required" }, { status: 400 })
    }

    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json({ error: "REPLICATE_API_TOKEN environment variable is not set" }, { status: 500 })
    }

    // Convert user image to base64
    console.log("[API] Converting user image to base64...")
    const userBytes = await userImage.arrayBuffer()
    const userBuffer = Buffer.from(userBytes)
    const base64UserImage = `data:${userImage.type};base64,${userBuffer.toString("base64")}`
    console.log(`[API] User image converted - size: ${base64UserImage.length} characters`)
    
    // Validate user image conversion
    if (!base64UserImage.startsWith('data:image/')) {
      console.error("[API] Invalid user image format after conversion")
      return NextResponse.json({ error: "Invalid user image format" }, { status: 400 })
    }

    // Convert all clothing images to base64
    console.log("[API] Converting clothing images to base64...")
    const base64ClothingImages = await Promise.all(
      clothingImages.map(async (clothingImage, index) => {
        const clothingBytes = await clothingImage.arrayBuffer()
        const clothingBuffer = Buffer.from(clothingBytes)
        const base64Image = `data:${clothingImage.type};base64,${clothingBuffer.toString("base64")}`
        console.log(`[API] Clothing image ${index} converted - size: ${base64Image.length} characters`)
        
        // Validate each clothing image
        if (!base64Image.startsWith('data:image/')) {
          throw new Error(`Invalid clothing image ${index} format after conversion`)
        }
        
        return base64Image
      })
    )

    // Final validation
    if (base64ClothingImages.length === 0) {
      console.error("[API] No valid clothing images after conversion")
      return NextResponse.json({ error: "No valid clothing images processed" }, { status: 400 })
    }

    console.log("[API] Sending to Replicate with user image and", clothingImages.length, "clothing images")

    // Create a more specific prompt that emphasizes the user as the main subject
    const finalPrompt = prompt || `The person in the first image is wearing the clothing items from the other images. Keep the person's face, body, and pose exactly the same. Only replace their clothing with the items shown in the clothing images: ${productNames}. The result should look natural and realistic, with proper lighting and shadows. The person should appear to be wearing these specific clothing items.`
    console.log(`[API] Final prompt: ${finalPrompt}`)

    // Use JSON format instead of FormData for better control
    const replicateInput = {
      prompt: finalPrompt,
      image_input: [base64UserImage, ...base64ClothingImages],
      output_format: "jpg" as const,
    }

    console.log(`[API] Replicate input prepared:`)
    console.log(`[API] - Prompt: ${replicateInput.prompt}`)
    console.log(`[API] - Image input array length: ${replicateInput.image_input.length}`)
    console.log(`[API] - User image (first): ${base64UserImage.substring(0, 50)}...`)
    console.log(`[API] - Clothing images count: ${base64ClothingImages.length}`)
    base64ClothingImages.forEach((img, index) => {
      console.log(`[API] - Clothing image ${index}: ${img.substring(0, 50)}...`)
    })

    console.log(`[API] Full input object keys: ${Object.keys(replicateInput)}`)
    console.log(`[API] Sending to Replicate with model: google/nano-banana`)

    const output = await replicate.run("google/nano-banana", {
      input: replicateInput,
    })

    console.log("[API] Replicate output type:", typeof output)
    console.log("[API] Replicate output constructor:", output?.constructor?.name)

    let imageArrayBuffer: ArrayBuffer | null = null
    let originalUrl: string | null = null

    if (typeof output === "string") {
      // Model returned a URL
      originalUrl = output
      console.log("[API] Got URL from Replicate:", originalUrl)
      const res = await fetch(originalUrl)
      if (!res.ok) throw new Error(`Failed to download image: ${res.status} ${res.statusText}`)
      imageArrayBuffer = await res.arrayBuffer()
    } else if (Array.isArray(output) && typeof output[0] === "string") {
      // Array of URLs
      originalUrl = output[0]
      console.log("[API] Got URL array from Replicate:", originalUrl)
      const res = await fetch(originalUrl)
      if (!res.ok) throw new Error(`Failed to download image: ${res.status} ${res.statusText}`)
      imageArrayBuffer = await res.arrayBuffer()
    } else if (output instanceof Uint8Array) {
      // Binary response
      console.log("[API] Got binary Uint8Array from Replicate")
      imageArrayBuffer = output.buffer instanceof ArrayBuffer ? output.buffer : new ArrayBuffer(output.byteLength)
    } else if (output && typeof (output as any).arrayBuffer === "function") {
      // Blob response (Edge/Node 18+)
      console.log("[API] Got Blob from Replicate")
      imageArrayBuffer = await (output as Blob).arrayBuffer()
    } else if (output && typeof (output as any).getReader === "function") {
      console.log("[API] Got ReadableStream from Replicate")
      imageArrayBuffer = await new Response(output as ReadableStream).arrayBuffer()
    } else if (output && typeof (output as any).output === "string") {
      // If SDK returns prediction object
      originalUrl = (output as any).output
      console.log("[API] Got prediction object from Replicate:", originalUrl)
      if (originalUrl) {
        const res = await fetch(originalUrl)
        if (!res.ok) throw new Error(`Failed to download image: ${res.status} ${res.statusText}`)
        imageArrayBuffer = await res.arrayBuffer()
      }
    } else {
      console.error("[API] Unexpected output format from Replicate:", output, Object.prototype.toString.call(output))
      return NextResponse.json({ error: "Unexpected output format from Replicate" }, { status: 500 })
    }

    if (!imageArrayBuffer) {
      console.error("[API] No valid image data found in Replicate response")
      return NextResponse.json({ error: "No image data returned from Replicate" }, { status: 500 })
    }

    console.log("[API] Storing image in Blob storage")

    // Upload to Blob storage with a unique filename
    const timestamp = Date.now()
    const filename = `virtual-try-on-${timestamp}.jpg`

    const blob = await put(filename, imageArrayBuffer, {
      access: "public",
      contentType: "image/jpeg",
    })

    console.log("[API] Image stored in Blob:", blob.url)

    return NextResponse.json({
      output: blob.url,
      originalUrl,
    })
  } catch (error) {
    console.error("[API] Error processing virtual try-on:", error)
    return NextResponse.json({ 
      error: "Failed to process virtual try-on",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
