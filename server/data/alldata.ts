/* eslint-disable @typescript-eslint/no-unused-vars */
'use server'

import { boolean, z } from "zod";
import { db } from "../db";
import bcrypt from "bcryptjs";
import { AddNewUserSchema } from "@/types";
import { revalidatePath } from "next/cache";
import { generateVerificationToken } from "@/lib/token";
import { sendVerificationEmail, sendVerificationEmailForAddedUser } from "@/lib/mail";

export async function getUsers() {
  try {
    const users = await db.user.findMany()
    revalidatePath('/users')
    return { count: users.length, success: true }
  } catch (error) {
    return { count: 0, success: false }
  } finally {
    await db.$disconnect()
  }
}

export async function getbyUserDetails() {
  const Users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      surname: true,
      email: true,
      phone: true,
      country: true,
      image: true,
      role: true,
      createdAt: true,
      emailVerified: true
    }
  });
  revalidatePath('/users')
  return Users.map(user => ({
    ...user,
    status: user.emailVerified ? 'Verified' : 'Not Verified',
    isSelected: false,
  }));
}

export async function getUserSignupAnalytics() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const lastYear = currentYear - 1;

  try {
    const currentYearSignups = await db.user.count({
      where: {
        createdAt: {
          gte: new Date(currentYear, 0, 1),
          lt: new Date(currentYear + 1, 0, 1),
        },
      },
    });

    const lastYearSignups = await db.user.count({
      where: {
        createdAt: {
          gte: new Date(lastYear, 0, 1),
          lt: new Date(currentYear, 0, 1),
        },
      },
    });

    const percentageChange = lastYearSignups !== 0
      ? ((currentYearSignups - lastYearSignups) / lastYearSignups) * 100
      : 100; // If there were no signups last year, we consider it a 100% increase
      revalidatePath('/users')
    return {
      currentYearSignups,
      lastYearSignups,
      percentageChange: parseFloat(percentageChange.toFixed(1)),
      success: true,
    };
  } catch (error) {
    console.error("Error fetching user signup analytics:", error);
    return {
      currentYearSignups: 0,
      lastYearSignups: 0,
      percentageChange: 0,
      success: false,
    };
  } finally {
    await db.$disconnect();
  }
}

export type AddUserFormData = z.infer<typeof AddNewUserSchema>;

export async function addUser(data: AddUserFormData) {
  try {
    // Convert the File object to a URL string if it exists
    const imageUrl = data.image ? URL.createObjectURL(data.image) : undefined;

    const user = await db.user.create({
      data: {
        email: data.email.toLowerCase(),
        name: data.name,
        surname: data.surname,
        phone: data.phone,
        country: data.country,
        role: data.role,
        image: imageUrl,
        password: await bcrypt.hash("defaultPassword", 10),
      },
    });

    const verificationToken = await generateVerificationToken(data.email.toLowerCase());
    await sendVerificationEmailForAddedUser(data.email.toLowerCase(), verificationToken.token, "defaultPassword");
    revalidatePath('/users')
    return { success: true, message: "User added successfully" };
  } catch (error) {
    console.error("Error adding user:", error);
    return { error: "Failed to add user", success: false };
  }
}

export async function deleteUser(formData: FormData) {
  const userId = formData.get("userId") as string;

  if (!userId) {
    return { error: "User ID is required", success: false };
  }

  try {
    await db.user.delete({
      where: { id: userId },
    });
    revalidatePath('/users')
    return { success: true, message: "User deleted successfully" };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { error: "Failed to delete user", success: false };
  }
}

export async function updateUserRole(userId: string, newRole: string) {
  try {
    await db.user.update({
      where: { id: userId },
      data: { role: newRole },
    });
  } catch (error) {
    console.error('Failed to update user role:', error);
    throw new Error('Failed to update user role');
  }
}


export async function updateUserEmail(userId: string, newEmail: string) {
  try {
    await db.user.update({
      where: { id: userId },
      data: { email: newEmail },
    });
  } catch (error) {
    console.error('Failed to update user email:', error);
    throw new Error('Failed to update user email');
  }
}

//"features"