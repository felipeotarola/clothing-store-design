import { put } from "@vercel/blob"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Generate a unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split(".").pop() || "jpg"
    const filename = `user-images/${timestamp}-${Math.random().toString(36).substring(2)}.${fileExtension}`

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
    })

    return NextResponse.json({ 
      success: true, 
      url: blob.url,
      filename: blob.pathname 
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ 
      error: "Failed to upload file" 
    }, { status: 500 })
  }
}