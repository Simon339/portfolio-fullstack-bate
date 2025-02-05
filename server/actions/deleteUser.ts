'use server'

import { db } from "../db"

export async function deleteUser(userId: string) {
  try {
    await db.user.delete({
      where: { id: userId },
    })
    return { success: true, message: 'User deleted successfully' }
  } catch (error) {
    console.error('Error deleting user:', error)
    return { success: false, message: 'Failed to delete user' }
  }
}

