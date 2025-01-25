/* eslint-disable @next/next/no-html-link-for-pages */
'use client';

import React, { useEffect, useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CircleCheckBig, Star, LoaderCircle, Send, CircleAlert } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { submitReview } from '@/server/actions/ratingaction';
import { useSearchParams } from 'next/navigation';

const reviewSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  rating: z.number().min(1, 'Please select a rating'),
  feedback: z.string().min(10, 'Review must be at least 10 characters long'),
})

type ReviewFormData = z.infer<typeof reviewSchema>

const Reviewform = () => {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [isPending, startTransition] = useTransition()
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
  })

  useEffect(() => {
    setValue('rating', rating)
  }, [rating, setValue])

  useEffect(() => {
    if (!token) {
      setError("No token provided");
    } else {
      if (token.trim() === '') {
        setError("Invalid token");
      }
    }
  }, [token]);


  const onSubmit = async (data: ReviewFormData) => {
    if (!token) {
      setError("No token provided");
      return;
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('rating', data.rating.toString())
      formData.append('feedback', data.feedback)
      formData.append('token', token)

      try {
        const result = await submitReview(formData);

        if (result.success) {
          setSubmitSuccess(true)
          reset()
          setRating(0)
        } else {
          // Handle errors
          setError(result.error || "An unexpected error occurred");
        }
      } catch (error) {
        console.error('Submission failed:', error);
        setError("An unexpected error occurred");
      }
    })
  }

  const formVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md w-full space-y-4 p-10 rounded-xl border border-[#acc2ef] shadow-lg"
    >
      {error ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center p-6 rounded-lg shadow-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-4 animate-pulse"
          >
            <CircleAlert className="w-16 h-16 text-danger" aria-hidden="true" />
          </motion.div>
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-red-700 mb-2"
          >
            Error
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-red-600"
          >
            {error}
          </motion.p>
        </motion.div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <motion.h1
              className="mt-6 text-center text-3xl font-extrabold text-[#cee8ff]"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              Submit Your Review
            </motion.h1>
            <motion.p
              className="mt-2 text-center text-sm text-[#acc2ef]"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Thank you for choosing us for your recent project. We truly value your feedback!
            </motion.p>
          </motion.div>
          <AnimatePresence mode="wait">
            {submitSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5 }}
                className="text-center p-6  rounded-lg shadow-md"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="flex justify-center mb-4 animate-pulse"
                >
                  <CircleCheckBig className="w-16 h-16 text-emerald-500" aria-hidden="true" />
                </motion.div>
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-emerald-700 mb-2"
                >
                  Thank You!
                </motion.h2>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-emerald-600"
                >
                  We appreciate you taking the time to share your thoughts!
                </motion.p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="mt-8 space-y-6"
                onSubmit={handleSubmit(onSubmit)}
              >
                <motion.div variants={itemVariants}>
                  <label htmlFor="name" className="block text-sm text-[#cee8ff] font-medium ">
                    Company Name:
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    id="name"
                    type="text"
                    placeholder="Enter your full name or business name"
                    {...register('name')}
                    className="mt-1 block w-full border bg-[#cee8ff] border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500  text-slate-600 placeholder:text-slate-400 col-span-6 resize-none outline-none  p-3 duration-300 hover:bg-slate-50  focus:ring-2 focus:shadow-inner"
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </motion.div>
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-[#cee8ff]">Rating:</label>
                  <div className="flex justify-center py-4 hover:animate-border-beam">
                    {[...Array(5)].map((_, index) => {
                      const ratingValue = index + 1
                      return (
                        <motion.button
                          key={ratingValue}
                          type="button"
                          className={`${ratingValue <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'
                            } transition-colors duration-200`}
                          onMouseEnter={() => setHover(ratingValue)}
                          onMouseLeave={() => setHover(0)}
                          onClick={() => setRating(ratingValue)}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Star className="h-6 w-6 fill-current" aria-hidden="true" />
                        </motion.button>
                      )
                    })}
                  </div>
                  {errors.rating && <p className="mt-2 text-sm text-red-600">{errors.rating.message}</p>}
                </motion.div>
                <motion.div variants={itemVariants}>
                  <label htmlFor="feedback" className="block text-sm font-medium text-[#cee8ff]">
                    Your Review:
                  </label>
                  <motion.textarea
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                    id="feedback"
                    {...register('feedback')}
                    placeholder='Please type your message here...'
                    rows={4}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-[#cee8ff] text-slate-600 h-32 placeholder:text-slate-400 col-span-6 resize-none outline-none  p-3 duration-300 hover:bg-slate-50  focus:ring-2 focus:shadow-inner"
                  />
                  {errors.feedback && <p className="mt-2 text-sm text-red-600">{errors.feedback.message}</p>}
                </motion.div>
                <motion.div variants={itemVariants}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={isPending}
                    className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {isPending ? (
                        <LoaderCircle className="h-5 w-5 mr-2 animate-spin" aria-hidden="true" />
                    ) : (
                      <div className='hover:animate-bounce'>
                        <Send className="h-5 w-5 mr-2" aria-hidden="true" />
                      </div>
                    )}
                    {isPending ? 'Submitting...' : 'Submit Review'}
                  </motion.button>
                </motion.div>
              </motion.form>
            )}
          </AnimatePresence>
        </>
      )}
      <>
        <AnimatePresence mode="wait">
          <footer className="item-center">
            <div className='flex justify-center gap-2'>
              <p className="text-14 font-normal text-[#acc2ef]"> Back to {" "}</p>
              <a
                href="/"
                className="text-blue-600 text-14 font-normal hover:underline"
              >
                Site
              </a>
            </div>
          </footer>
        </AnimatePresence>
      </>
    </motion.div>
  )
}

export default Reviewform

