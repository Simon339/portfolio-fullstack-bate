// components/ProtectedImage.tsx
"use client"

import { useEffect, useRef, useState, useCallback } from "react"

type ProtectedImageProps = {
  imageId: string  // e.g., "sunset", "mountain"
  alt?: string
  watermark?: string
  className?: string
}

export default function ProtectedImage({
  imageId,
  alt = "Protected image",
  watermark = "© Protected Content",
  className = "",
}: ProtectedImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isBlurred, setIsBlurred] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const noiseIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Load image through canvas (never exposes direct URL)
  const loadImageToCanvas = useCallback(async () => {
    if (!canvasRef.current) return

    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Fetch image through API
      const response = await fetch(`/api/image/${imageId}`)
      if (!response.ok) throw new Error("Failed to load image")

      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)

      const img = new Image()
      img.onload = () => {
        // Set canvas size to match image
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight

        // Draw the main image
        ctx.drawImage(img, 0, 0)

        // Layer 1: Apply repeating watermark text
        applyTextWatermark(ctx, canvas.width, canvas.height, watermark)

        // Layer 2: Apply subtle diagonal lines pattern
        applyDiagonalPattern(ctx, canvas.width, canvas.height)

        // Layer 3: Apply initial noise (will be updated dynamically)
        applyDynamicNoise(ctx, canvas.width, canvas.height)

        // Clean up the object URL
        URL.revokeObjectURL(objectUrl)
        setIsLoaded(true)
      }

      img.src = objectUrl
    } catch (error) {
      console.error("Failed to load protected image:", error)
    }
  }, [imageId, watermark])

  // Apply text watermark diagonally across the image
  const applyTextWatermark = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    text: string
  ) => {
    ctx.save()
    
    // Configure watermark style
    ctx.fillStyle = "rgba(255, 255, 255, 0.12)"
    ctx.strokeStyle = "rgba(0, 0, 0, 0.08)"
    ctx.lineWidth = 0.5
    ctx.font = "bold 16px system-ui, -apple-system, sans-serif"
    ctx.rotate(-25 * Math.PI / 180) // Tilt diagonal

    // Fill the entire area with watermark
    const spacing = 150
    const rowHeight = 60
    const diagonalLength = Math.sqrt(width * width + height * height)

    for (let x = -diagonalLength; x < diagonalLength * 1.5; x += spacing) {
      for (let y = -height; y < height * 2; y += rowHeight) {
        ctx.strokeText(text, x, y)
        ctx.fillText(text, x, y)
      }
    }

    ctx.restore()
  }

  // Apply subtle diagonal line pattern (like old DRM)
  const applyDiagonalPattern = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    ctx.save()
    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)"
    ctx.lineWidth = 1
    
    const spacing = 4
    for (let i = -height; i < width + height; i += spacing) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i - height, height)
      ctx.stroke()
    }
    
    ctx.restore()
  }

  // Apply dynamic noise that changes frequently
  const applyDynamicNoise = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) => {
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data

    // Add semi-random noise to each pixel
    // This creates a subtle shimmer effect that's hard to see
    // But ruins screenshots because it changes every frame
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 12 // Very subtle noise
      data[i] = Math.min(255, Math.max(0, data[i] + noise))       // R
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise)) // G
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise)) // B
    }

    ctx.putImageData(imageData, 0, 0)
  }

  // Start/stop the noise animation
  const startNoiseAnimation = useCallback(() => {
    if (noiseIntervalRef.current) return

    noiseIntervalRef.current = setInterval(() => {
      if (!canvasRef.current || !isLoaded) return
      if (document.visibilityState !== "visible") return

      const ctx = canvasRef.current.getContext("2d")
      if (!ctx) return

      applyDynamicNoise(ctx, canvasRef.current.width, canvasRef.current.height)
    }, 150) // Update every 150ms - frequent enough to ruin screenshots
  }, [isLoaded])

  const stopNoiseAnimation = useCallback(() => {
    if (noiseIntervalRef.current) {
      clearInterval(noiseIntervalRef.current)
      noiseIntervalRef.current = null
    }
  }, [])

  // Load image on mount
  useEffect(() => {
    loadImageToCanvas()
  }, [loadImageToCanvas])

  // Protection against keyboard shortcuts and browser features
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Block all these actions
    const preventDefault = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      return false
    }

    // Detect and block screenshot attempts
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key?.toLowerCase()
      const ctrl = e.ctrlKey || e.metaKey
      const shift = e.shiftKey

      // Comprehensive list of screenshot/save shortcuts
      const isBlocked = 
        // Save/Inspect shortcuts
        (ctrl && ["s", "u", "p", "c", "a"].includes(key)) ||
        // Dev tools
        key === "f12" ||
        // Advanced dev tools shortcuts
        (ctrl && shift && ["i", "j", "c", "s"].includes(key)) ||
        // Print screen variations
        key === "printscreen" ||
        key === "sysrq" ||
        // Print dialog
        (ctrl && key === "p") ||
        // Windows Snipping Tool shortcut
        (key === "windows" && shift && key === "s") ||
        // Mac screenshot shortcuts
        (key === "meta" && shift && ["3", "4", "5"].includes(key))

      if (isBlocked) {
        e.preventDefault()
        e.stopPropagation()
        
        // Blur the image briefly as deterrent
        setIsBlurred(true)
        stopNoiseAnimation()
        setTimeout(() => {
          setIsBlurred(false)
          startNoiseAnimation()
        }, 2000)
        
        return false
      }
    }

    // Blur when window loses focus (deters external tools)
    const handleBlur = () => {
      setIsBlurred(true)
      stopNoiseAnimation()
    }

    const handleFocus = () => {
      setIsBlurred(false)
      startNoiseAnimation()
    }

    // Blur when tab becomes hidden
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setIsBlurred(true)
        stopNoiseAnimation()
      } else {
        setIsBlurred(false)
        startNoiseAnimation()
      }
    }

    // Prevent mobile long-press
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        // Single touch is fine
        return
      }
      e.preventDefault() // Block multi-touch gestures
    }

    // Add all event listeners
    container.addEventListener("contextmenu", preventDefault)
    container.addEventListener("dragstart", preventDefault)
    container.addEventListener("selectstart", preventDefault)
    container.addEventListener("copy", preventDefault)
    container.addEventListener("cut", preventDefault)
    container.addEventListener("paste", preventDefault)
    container.addEventListener("touchstart", handleTouchStart, { passive: false })
    
    window.addEventListener("keydown", handleKeyDown, true) // Capture phase
    window.addEventListener("blur", handleBlur)
    window.addEventListener("focus", handleFocus)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    // Start protection
    startNoiseAnimation()

    // Cleanup
    return () => {
      container.removeEventListener("contextmenu", preventDefault)
      container.removeEventListener("dragstart", preventDefault)
      container.removeEventListener("selectstart", preventDefault)
      container.removeEventListener("copy", preventDefault)
      container.removeEventListener("cut", preventDefault)
      container.removeEventListener("paste", preventDefault)
      container.removeEventListener("touchstart", handleTouchStart)
      
      window.removeEventListener("keydown", handleKeyDown, true)
      window.removeEventListener("blur", handleBlur)
      window.removeEventListener("focus", handleFocus)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      
      stopNoiseAnimation()
    }
  }, [startNoiseAnimation, stopNoiseAnimation])

  return (
    <div
      ref={containerRef}
      className={`relative inline-block select-none ${className}`}
      style={{
        WebkitUserSelect: "none",
        userSelect: "none",
        WebkitTouchCallout: "none",
        msUserSelect: "none",
      }}
    >
      {/* Loading state */}
      {!isLoaded && (
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ minHeight: "200px" }}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            <span className="text-sm text-gray-500">Loading image...</span>
          </div>
        </div>
      )}

      {/* The canvas element */}
      <canvas
        ref={canvasRef}
        className={`transition-all duration-500 max-w-full h-auto ${
          isBlurred ? "blur-xl brightness-50 scale-105" : ""
        }`}
        style={{
          pointerEvents: "none",
          WebkitTouchCallout: "none",
        }}
        aria-label={alt}
        role="img"
      />

      {/* Invisible overlay to catch interactions */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-10"
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        style={{ 
          cursor: "default",
          WebkitTouchCallout: "none",
        }}
      />

      {/* Visible watermark badge (subtle) */}
      <div className="absolute bottom-2 right-2 text-xs text-white/30 select-none pointer-events-none z-0">
        {watermark}
      </div>

      {/* CSS-based background watermark (additional layer) */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-5"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 50px,
            rgba(255,255,255,0.3) 50px,
            rgba(255,255,255,0.3) 51px
          )`,
          mixBlendMode: "overlay",
        }}
      />
    </div>
  )
}