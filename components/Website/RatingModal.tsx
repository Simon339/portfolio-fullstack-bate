/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"

import { RatingAction } from "@/server/actions/ratingaction"
import { toast } from "sonner"

export default function RatingModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
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

    setIsSubmitting(true)
    setError("")

    try {
      const result = await RatingAction({ rating, feedback })

      if (result.success) {
        setIsOpen(false)
        toast.success("Rating submitted")
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
      <DialogContent className="sm:max-w-[400px] bg-black-100">
        <DialogHeader>
          <DialogTitle className="text-white">Rate Your Experience</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center py-2">
          {[...Array(5)].map((_, index) => {
            const ratingValue = index + 1
            return (
              <Button
                key={ratingValue}
                variant="ghost"
                size="icon"
                className={`${ratingValue <= (hover || rating) ? "text-yellow-400" : "text-gray-300"}`}
                onMouseEnter={() => setHover(ratingValue)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(ratingValue)}
              >
                <Star className="h-5 w-5 fill-current" />
              </Button>
            )
          })}
        </div>
        <Textarea
          placeholder="Optional feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="min-h-[80px]"
        />
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <DialogFooter>
          <Button
            onClick={handleRatingSubmit}
            disabled={isSubmitting}
            className="w-full bg-white text-black hover:bg-[#685189] font-medium text-sm"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

