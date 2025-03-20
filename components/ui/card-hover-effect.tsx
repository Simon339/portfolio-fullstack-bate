"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useState } from "react"
import { ServiceModel } from "../Website/servicemodel"

export const HoverEffect = ({
  items,
  className,
}: {
  items: {
    icon: React.ReactNode
    title: string
    description: string
    link: string
  }[]
  className?: string
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleServiceClick = (serviceTitle: string) => {
    setSelectedService(serviceTitle)
    setIsModalOpen(true)
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-6", className)}>
      {items.map((item, idx) => (
        <motion.div
          key={`${item.title}-${idx}`}
          className="border border-white/5 hover:border-[#685189]/30 p-5 transition-colors duration-300"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
          initial={{ opacity: 0.9 }}
          animate={{
            opacity: 1,
            borderColor: hoveredIndex === idx ? "rgba(104, 81, 137, 0.3)" : "rgba(255, 255, 255, 0.05)",
          }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center mb-4">
            <motion.div
              className="text-white/70"
              animate={{
                opacity: hoveredIndex === idx ? 1 : 0.7,
                color: hoveredIndex === idx ? "#685189" : "rgba(255, 255, 255, 0.7)",
              }}
              transition={{ duration: 0.2 }}
            >
              {item.icon}
            </motion.div>
            <h3 className="text-sm font-medium text-white ml-3">{item.title}</h3>
          </div>

          <p className="text-xs text-white/60 leading-relaxed mb-4">{item.description}</p>

          <button
            onClick={() => handleServiceClick(item.title)}
            className="text-[10px] text-white border border-[#685189]/50 hover:border-[#685189] px-3 py-1 transition-colors duration-200"
          >
            Reserve
          </button>
        </motion.div>
      ))}

      {selectedService && <ServiceModel service={selectedService} isOpen={isModalOpen} setIsOpen={setIsModalOpen} />}
    </div>
  )
}

