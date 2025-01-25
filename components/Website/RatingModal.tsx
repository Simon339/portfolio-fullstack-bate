'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"
import { RatingAction } from '@/server/actions/ratingaction'
import { toast } from 'sonner'

export default function RatingModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    
    const hasShownModal = localStorage.getItem('hasShownRatingModal')

    if (!hasShownModal) {
      const timer = setTimeout(() => {
        setIsOpen(true)
        localStorage.setItem('hasShownRatingModal', 'true') 
      }, 30000) // 6 minutes delay

      
      return () => clearTimeout(timer)
    } else {
      setIsOpen(false)
    }
  }, [])

  const handleRatingSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating before submitting.')
      return
    }

    setIsSubmitting(true)
    setError('')

    
    const result = await RatingAction({ rating, feedback });

    if (result.success) {
      setIsOpen(false);
      toast.success('Rating submitted successfully!');
    } else {
      setError('Failed to submit rating. Please try again.');
      toast.error('Failed to submit rating. Please try again.');
    }

    setIsSubmitting(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] bg-black-100">
        <DialogHeader>
          <DialogTitle>Rate Your Experience</DialogTitle>
          <DialogDescription>
            How would you rate your experience on our website?
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-4">
          {[...Array(5)].map((_, index) => {
            const ratingValue = index + 1
            return (
              <Button
                key={ratingValue}
                variant="ghost"
                size="icon"
                className={`${
                  ratingValue <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'
                } transition-colors duration-200`}
                onMouseEnter={() => setHover(ratingValue)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(ratingValue)}
              >
                <Star className="h-6 w-6 fill-current" />
              </Button>
            )
          })}
        </div>
        <Textarea
          placeholder="Optional: Leave us some feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="min-h-[100px]"
        />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <DialogFooter>
          <Button 
          onClick={handleRatingSubmit} 
          disabled={isSubmitting}
            className="w-full disabled:opacity-50 bg-white text-black hover:bg-[#685189] font-bold"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Rating'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
