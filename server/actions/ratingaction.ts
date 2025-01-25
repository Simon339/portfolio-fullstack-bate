'use server';

import { RatingSchema } from "@/types";
import { db } from "../db";
import * as z from "zod";
import { generateReviewInvitationtoken } from "@/lib/token";
import { sendReviewInvitationToken } from "@/lib/mail";


export async function RatingAction(data: z.infer<typeof RatingSchema>) {
    try {
        RatingSchema.parse(data);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const newRating = await db.rating.create({
            data: {
                rating: data.rating,
                feedback: data.feedback || null,
            },
        });

        
        return { success: "Your rating has been submitted successfully!" };
    } catch (error) {
        if (error instanceof z.ZodError) {
           
            return { error: error.errors.map((e) => e.message).join(", ") };
        }

        return { error: "An unexpected error occurred. Please try again later." };
    }
}

export async function fetchRating() {
    try {
      const ratings = await db.rating.findMany();
      return ratings;
    } catch (error) {
      console.error('Failed to fetch ratings: ' , error);
    }
  }


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const reviewSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  rating: z.number().min(1).max(5),
  review: z.string().min(10, 'Review must be at least 10 characters long'),
})


export async function submitReview(formData: FormData) {
    const token = formData.get('token');
  
    if (!token || typeof token !== 'string') {
      return { success: false, error: 'Invalid token' };
    }
  
    try {
      // Verify the token
      const validToken = await db.token.findUnique({
        where: { token },
      });
  
      if (!validToken || validToken.expires < new Date()) {
        return { success: false, error: 'Invalid or expired token' };
      }
  
      // Parse and validate the form data
      const rating = parseInt(formData.get('rating') as string, 10);
      const feedback = formData.get('feedback') as string;
      const name = formData.get('name') as string;
  
      if (isNaN(rating) || rating < 1 || rating > 5) {
        return { success: false, error: 'Invalid rating' };
      }
  
      // Save the review
      const review = await db.rating.create({
        data: {
          rating,
          feedback: feedback || undefined,
          name: name || undefined,
        },
      });
  
      // Delete the used token
      await db.token.delete({
        where: { id: validToken.id },
      });
  
      return { success: true, data: review };
    } catch (error) {
      console.error('Failed to submit review:', error);
      return { success: false, error: 'Failed to submit review' };
    }
  }
  
  

  const AddSchema = z.object({
      email: z.string().email({ message: "Invalid email address." }),
  })
  

  export async function sendReviewInvitation(data: z.infer<typeof AddSchema>) {
    const validatedFields = AddSchema.safeParse(data);
        if (!validatedFields.success) {
            return { error: "Invalid email!" };
        }
        const { email } = validatedFields.data;

    const reviewInvitationToken = await generateReviewInvitationtoken(email);
        await sendReviewInvitationToken(
            reviewInvitationToken.email,
            reviewInvitationToken.token,
        )
    
    
        return { success: "Invitation email sent!" }
  }