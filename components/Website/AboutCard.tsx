"use client"

import { useRef, useEffect } from "react"
import { aboutcards } from "@/data"

const AboutCard = () => {
  const ref = useRef(null)

  useEffect(() => {
    import("@lottiefiles/lottie-player")
  }, [])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
      {aboutcards.map((item) => (
        <div
          key={item.id}
          className="flex flex-col items-center p-2 rounded-xl border-[#685189] bg-primary/5 backdrop-blur-sm transition-all hover:bg-primary/10"
        >
          <div className="w-12 h-12 mb-3">
            <lottie-player
              id={`about-${item.id}`}
              ref={ref}
              src={item.icon}
              autoplay
              loop
              mode="normal"
              style={{ width: "100%", height: "100%" }}
            ></lottie-player>
          </div>
          <h3 className="font-bold text-lg mb-1">{item.title}</h3>
          <span className="text-sm text-muted-foreground italic">{item.subtitle}</span>
        </div>
      ))}
    </div>
  )
}

export default AboutCard