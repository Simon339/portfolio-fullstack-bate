/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Star, User } from "lucide-react"
import { RatingAction } from "@/server/actions/ratingaction"
import { toast } from "sonner"

export default function RatingModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [name, setName] = useState("")
  const [feedback, setFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Only run on client
    const hasShownModal = localStorage.getItem("hasShownRatingModal")

    if (!hasShownModal) {
      const timer = setTimeout(() => {
        setIsOpen(true)
        localStorage.setItem("hasShownRatingModal", "true")
      }, 30000)

      return () => clearTimeout(timer)
    }
  }, [])

  if (!mounted) return null

  const handleRatingSubmit = async () => {
    if (rating === 0) {
      setError("Please select a rating")
      return
    }
    
    if (!name.trim()) {
      setError("Please enter your name")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const result = await RatingAction({ rating, feedback, name })

      if (result.success) {
        setIsOpen(false)
        setName("")
        setFeedback("")
        setRating(0)
        toast.success("Thank you for your feedback, " + name + "!")
      } else {
        setError("Failed to submit rating")
      }
    } catch (err) {
      setError("An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[400px] bg-black-100 border-2 border-[#acc2ef]">
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-semibold">Rate Your Experience</DialogTitle>
          <DialogDescription className="text-gray-300">
            Your feedback helps us improve. We'd love to hear about your experience.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-5 py-4">
          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200 flex items-center gap-2">
              <User className="h-4 w-4" />
              Your Name <span className="text-red-400">*</span>
            </label>
            <Input
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-black-200 border-[#acc2ef] text-white placeholder:text-gray-400 focus:border-[#acc2ef] focus:ring-[#acc2ef]"
            />
          </div>

          {/* Rating Stars */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">
              Rating <span className="text-red-400">*</span>
            </label>
            <div className="flex justify-center gap-1 py-2">
              {[...Array(5)].map((_, index) => {
                const ratingValue = index + 1
                return (
                  <button
                    key={ratingValue}
                    type="button"
                    className={`transition-all duration-200 transform hover:scale-110 focus:outline-none ${
                      ratingValue <= (hover || rating) ? "text-yellow-400" : "text-gray-500"
                    }`}
                    onMouseEnter={() => setHover(ratingValue)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(ratingValue)}
                  >
                    <Star className="h-8 w-8 fill-current" />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Feedback Textarea */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200">
              Feedback (Optional)
            </label>
            <Textarea
              placeholder="Tell us what you think about your experience..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[100px] bg-black-200 border-[#acc2ef] text-white placeholder:text-gray-400 focus:border-[#acc2ef] focus:ring-[#acc2ef] resize-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-400 text-xs bg-red-400/10 p-2 rounded-md border border-red-400/30">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleRatingSubmit}
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-[#acc2ef] to-[#8ba8d4] hover:from-[#8ba8d4] hover:to-[#6d8bb8] text-[#000B58] font-semibold py-2 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Submitting...
              </span>
            ) : (
              "Submit Feedback"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}