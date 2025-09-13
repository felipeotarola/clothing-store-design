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
    const userImage = formData.get("userImage") as File
    const clothingImage = formData.get("clothingImage") as File
    const prompt = formData.get("prompt") as string
    const productName = formData.get("productName") as string
    const clothingType = formData.get("clothingType") as string // Added clothing type parameter for better AI understanding

    if (!userImage || !clothingImage) {
      return NextResponse.json({ error: "Both user image and clothing image are required" }, { status: 400 })
    }

    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json({ error: "REPLICATE_API_TOKEN environment variable is not set" }, { status: 500 })
    }

    // Convert user image to base64
    const userBytes = await userImage.arrayBuffer()
    const userBuffer = Buffer.from(userBytes)
    const base64UserImage = `data:${userImage.type};base64,${userBuffer.toString("base64")}`

    // Convert clothing image to base64
    const clothingBytes = await clothingImage.arrayBuffer()
    const clothingBuffer = Buffer.from(clothingBytes)
    const base64ClothingImage = `data:${clothingImage.type};base64,${clothingBuffer.toString("base64")}`

    console.log("[v0] Sending to Replicate with both images as base64")

    const enhancedPrompt =
      prompt ||
      `Make the person wear the ${productName} (${clothingType}). Ensure the ${clothingType} is placed correctly on the appropriate body part. Do not confuse ${clothingType} with other clothing types. Make the scene natural and well-lit with realistic fit and proportions.`

    const output = await replicate.run("google/nano-banana", {
      input: {
        prompt: enhancedPrompt,
        image_input: [base64UserImage, base64ClothingImage],
        output_format: "jpg",
      },
    })

    console.log("[v0] Replicate output type:", typeof output)
    console.log("[v0] Replicate output constructor:", output?.constructor?.name)

    let imageArrayBuffer: ArrayBuffer | null = null
    let originalUrl: string | null = null

    if (typeof output === "string") {
      // Model returned a URL
      originalUrl = output
      console.log("[v0] Got URL from Replicate:", originalUrl)
      const res = await fetch(originalUrl)
      if (!res.ok) throw new Error(`Failed to download image: ${res.status} ${res.statusText}`)
      imageArrayBuffer = await res.arrayBuffer()
    } else if (Array.isArray(output) && typeof output[0] === "string") {
      // Array of URLs
      originalUrl = output[0]
      console.log("[v0] Got URL array from Replicate:", originalUrl)
      const res = await fetch(originalUrl)
      if (!res.ok) throw new Error(`Failed to download image: ${res.status} ${res.statusText}`)
      imageArrayBuffer = await res.arrayBuffer()
    } else if (output instanceof Uint8Array) {
      // Binary response
      console.log("[v0] Got binary Uint8Array from Replicate")
      imageArrayBuffer = output.buffer
    } else if (output && typeof (output as any).arrayBuffer === "function") {
      // Blob response (Edge/Node 18+)
      console.log("[v0] Got Blob from Replicate")
      imageArrayBuffer = await (output as Blob).arrayBuffer()
    } else if (output && typeof (output as any).getReader === "function") {
      console.log("[v0] Got ReadableStream from Replicate")
      imageArrayBuffer = await new Response(output as ReadableStream).arrayBuffer()
    } else if (output && typeof (output as any).output === "string") {
      // If SDK returns prediction object
      originalUrl = (output as any).output
      console.log("[v0] Got prediction object from Replicate:", originalUrl)
      const res = await fetch(originalUrl)
      if (!res.ok) throw new Error(`Failed to download image: ${res.status} ${res.statusText}`)
      imageArrayBuffer = await res.arrayBuffer()
    } else {
      console.error("[v0] Unexpected output format from Replicate:", output, Object.prototype.toString.call(output))
      return NextResponse.json({ error: "Unexpected output format from Replicate" }, { status: 500 })
    }

    if (!imageArrayBuffer) {
      console.error("[v0] No valid image data found in Replicate response")
      return NextResponse.json({ error: "No image data returned from Replicate" }, { status: 500 })
    }

    console.log("[v0] Storing image in Blob storage")

    // Upload to Blob storage with a unique filename
    const timestamp = Date.now()
    const filename = `virtual-try-on-${timestamp}.jpg`

    const blob = await put(filename, imageArrayBuffer, {
      access: "public",
      contentType: "image/jpeg",
    })

    console.log("[v0] Image stored in Blob:", blob.url)

    return NextResponse.json({
      output: blob.url,
      originalUrl,
    })
  } catch (error) {
    console.error("Error processing virtual try-on:", error)
    return NextResponse.json({ error: "Failed to process virtual try-on" }, { status: 500 })
  }
}
