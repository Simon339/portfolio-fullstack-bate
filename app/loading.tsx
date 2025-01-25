/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState } from "react"
import { motion } from "framer-motion";


export default function Loading() {
  const [progress, setProgress] = useState(0)
  return (
    <div className="preloader fixed inset-0 z-50 flex items-center justify-center bg-white">
      <motion.svg
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: progress / 100 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <path id="preloaderSvg" d="M0,1005S175,995,500,995s500,5,500,5V0H0Z" fill="#000319"></path>
      </motion.svg>

      <div className="preloader-heading relative z-10">
        <motion.div
          className="load-text text-4xl font-bold text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {["L", "o", "a", "d", "i", "n", "g"].map((letter, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.5 }}
            >
              {letter}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
