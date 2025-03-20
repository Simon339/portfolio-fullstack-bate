"use client"

import { useState } from "react"
import { Plus, Minus } from "lucide-react"

export const EducationCard = (props) => {
  const [showInfo, setShowInfo] = useState(false)

  return (
    <div className="border-b border-white/5 py-2">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowInfo(!showInfo)}>
        <h3 className="text-sm text-white/80">{props.title}</h3>
        <span className="text-white/50">{showInfo ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}</span>
      </div>

      {showInfo && (
        <div className="pt-2 pb-1 text-xs text-white/60">
          <div className="flex justify-between mb-1">
            <p>{props.subtitle}</p>
            <span>{props.date}</span>
          </div>
          {props.description && <p className="text-white/40">{props.description}</p>}
        </div>
      )}
    </div>
  )
}