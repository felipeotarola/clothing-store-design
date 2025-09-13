import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { image_url, user_image_url, prompt, product_names, selected_items } = body

    if (!image_url || !product_names) {
      return NextResponse.json({ error: "Image URL and product names are required" }, { status: 400 })
    }

    // Insert the shared look into Supabase
    const { data, error } = await supabase
      .from('shared_looks')
      .insert([
        {
          image_url,
          user_image_url,
          prompt: prompt || "",
          product_names,
          selected_items,
        }
      ])
      .select()

    if (error) {
      console.error("Error saving shared look:", error)
      return NextResponse.json({ error: "Failed to save shared look" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: data[0] })
  } catch (error) {
    console.error("Error processing shared look:", error)
    return NextResponse.json({ error: "Failed to process shared look" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get all shared looks
    const { data, error } = await supabase
      .from('shared_looks')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error("Error fetching shared looks:", error)
      return NextResponse.json({ error: "Failed to fetch shared looks" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}