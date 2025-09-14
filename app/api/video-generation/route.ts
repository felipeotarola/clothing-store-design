import { type NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"
import { put } from '@vercel/blob'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { image_url, prompt } = body

    if (!image_url) {
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
    }

    console.log("Starting video generation with VEO-3 Fast...")
    console.log("Input image:", image_url)
    console.log("Video prompt:", prompt)

    // Create enhanced prompt for video generation
    const videoPrompt = prompt || "A fashion model showcasing the outfit with natural, elegant movements. The model should move gracefully, turning slightly to show the clothing from different angles, with subtle body movements that highlight the fit and style of the garments."

    // Run the VEO-3 Fast model
    const prediction = await replicate.run(
      "google/veo-3-fast",
      {
        input: {
          image: image_url,
          prompt: videoPrompt,
          duration: 5, // 5 seconds
          aspect_ratio: "9:16", // Vertical format for fashion showcase
          loop: false,
        }
      }
    )

    console.log("VEO-3 Fast prediction:", prediction)
    console.log("Prediction type:", typeof prediction)
    console.log("Prediction constructor:", prediction?.constructor?.name)

    // Handle the prediction result - VEO-3 returns FileOutput objects
    let videoUrl: string
    
    if (typeof prediction === 'string') {
      // Direct URL
      videoUrl = prediction
    } else if (Array.isArray(prediction) && prediction.length > 0) {
      // Array of URLs or FileOutput objects
      const firstItem = prediction[0]
      if (typeof firstItem === 'string') {
        videoUrl = firstItem
      } else if (firstItem && typeof firstItem.url === 'function') {
        videoUrl = firstItem.url()
      } else if (firstItem && typeof firstItem.url === 'string') {
        videoUrl = firstItem.url
      } else {
        throw new Error(`Unexpected array item format: ${JSON.stringify(firstItem)}`)
      }
    } else if (prediction && typeof prediction === 'object') {
      // FileOutput object or similar
      const predObj = prediction as any
      
      if (typeof predObj.url === 'function') {
        // FileOutput object with url() method
        const urlResult = predObj.url()
        videoUrl = urlResult.toString() // Convert URL object to string
        console.log("Called url() method, result:", urlResult)
        console.log("Converted to string:", videoUrl)
      } else if (typeof predObj.url === 'string') {
        // Object with url property
        videoUrl = predObj.url
      } else if (predObj.output) {
        videoUrl = predObj.output
      } else {
        // Try to find a URL in the object values
        const values = Object.values(prediction)
        const urlValue = values.find(v => typeof v === 'string' && (v as string).includes('http'))
        if (urlValue) {
          videoUrl = urlValue as string
        } else {
          throw new Error(`Unexpected prediction format: ${JSON.stringify(prediction)}`)
        }
      }
    } else {
      throw new Error(`Invalid prediction type: ${typeof prediction}`)
    }

    console.log("Extracted video URL:", videoUrl)
    
    // Validate the URL
    if (!videoUrl || typeof videoUrl !== 'string') {
      throw new Error(`Invalid video URL extracted: ${videoUrl}`)
    }
    
    try {
      new URL(videoUrl) // Validate URL format
    } catch (urlError) {
      throw new Error(`Invalid URL format: ${videoUrl}`)
    }

    // Download the video from Replicate and upload to Vercel Blob
    console.log("Downloading video from Replicate...")
    const videoResponse = await fetch(videoUrl)
    if (!videoResponse.ok) {
      throw new Error(`Failed to download video: ${videoResponse.statusText}`)
    }
    
    const videoBlob = await videoResponse.blob()
    console.log("Video downloaded, size:", videoBlob.size, "bytes")
    
    // Upload to Vercel Blob
    console.log("Uploading video to Vercel Blob...")
    const filename = `fashion-video-${Date.now()}.mp4`
    const blob = await put(filename, videoBlob, {
      access: 'public',
      contentType: 'video/mp4'
    })
    
    console.log("Video uploaded to blob storage:", blob.url)

    return NextResponse.json({ 
      success: true, 
      video_url: blob.url, // Return the blob storage URL instead of Replicate URL
      prompt: videoPrompt
    })

  } catch (error) {
    console.error("Error generating video:", error)
    return NextResponse.json(
      { 
        error: "Failed to generate video", 
        details: error instanceof Error ? error.message : "Unknown error" 
      }, 
      { status: 500 }
    )
  }
}