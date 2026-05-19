// app/api/image/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // Type params as Promise
) {
  const { id: imageId } = await params  // Await and destructure
  
  // Simple mapping of IDs to actual files (obfuscated paths)
  const imageMap: Record<string, string> = {
    "sunset": "/assets/Profile.jpg",
  }

  const imagePath = imageMap[imageId]
  if (!imagePath) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 })
  }

  try {
    const fullPath = path.join(process.cwd(), "private-images", imagePath)
    
    // Check if file exists first
    if (!fs.existsSync(fullPath)) {
      return NextResponse.json({ error: "Image file not found" }, { status: 404 })
    }
    
    const imageBuffer = fs.readFileSync(fullPath)
    
    // Get mime type
    const ext = path.extname(imagePath).toLowerCase()
    const mimeTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".webp": "image/webp",
    }

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": mimeTypes[ext] || "image/jpeg",
        "Cache-Control": "no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
    })
  } catch (error) {
    console.error("Error loading image:", error)
    return NextResponse.json({ error: "Image not found" }, { status: 404 })
  }
}