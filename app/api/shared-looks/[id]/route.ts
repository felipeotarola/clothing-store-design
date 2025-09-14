import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { video_url, public: isPublic } = body
    const id = params.id

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    // Build update object based on provided fields
    const updateData: any = {}
    if (video_url !== undefined) updateData.video_url = video_url
    if (isPublic !== undefined) updateData.public = isPublic

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No update fields provided" }, { status: 400 })
    }

    console.log("Updating shared look:", id, "with data:", updateData)

    // Update the shared look in Supabase
    const { data, error } = await supabase
      .from('shared_looks')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      console.error("Error updating shared look:", error)
      return NextResponse.json({ error: "Failed to update shared look", details: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Shared look not found" }, { status: 404 })
    }

    console.log("Successfully updated shared look:", data[0])
    return NextResponse.json({ success: true, data: data[0] })
  } catch (error) {
    console.error("Error processing update:", error)
    return NextResponse.json({ 
      error: "Failed to process update", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
}