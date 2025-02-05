"use server"

// import { useCurrentUser } from "@/hooks/use-current-user";
import { db } from "../db";
import { revalidatePath } from 'next/cache'

export const getUserByEmail = async (email: string) => {
    try {
        const user = db.user.findUnique({ where: {email} });
        revalidatePath('/users')
        return  user;
    } catch {
        return null
    }
}

export const getUserById = async (id: string) => {
    try {
        const user = db.user.findUnique({ where: { id } });
        revalidatePath('/users')
        return  user;
    } catch {
        return null
    }
}

export async function requestApproval(email: string) {
    const user = await db.user.findUnique({
      where: { email },
    })
  
    if (user && user.role === 'USER') {
      const updatedUser = await db.user.update({
        where: { email },
        data: { approvalStatus: 'pending' },
      })
      revalidatePath('/users')
      return updatedUser
    } else {
      throw new Error('Only users with "User" role can request approval')
    }
  }
  
  export async function updateApprovalStatus(email: string, status: 'approved' | 'rejected') {
    const user = await db.user.findUnique({
      where: { email },
    })
  
    if (user && user.role === 'USER') {
      const updatedUser = await db.user.update({
        where: { email },
        data: { approvalStatus: status },
      })
      revalidatePath('/users')
      return updatedUser
    } else {
      throw new Error('Can only update approval status for users with "User" role')
    }
  }