"use server"

import nodemailer from "nodemailer"
import { render } from "@react-email/render"
import { ServiceInquiryConfirmationTemp } from "./emailtemps/serviceinquiryconfirmation";
import { InvitationtokenTemplate } from "./emailtemps/invitetoreview";
import { Contactconfirmation } from "./emailtemps/contactform"
import { VerificationEmail } from "./emailtemps/verificationEmail";
import { PasswordResetEmail } from "./emailtemps/passwordResetEmai";
import { VerificationbyadminEmail } from "./emailtemps/VerificationbyadminEmail";
// SMTP Transporter Setup
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
})

const domain = process.env.BASE_URL || "https://m-s-portfolio.vercel.app" // Use environment variable for base URL if possible

// Helper function to send emails
const sendEmail = async (to: string, subject: string, reactElement: React.ReactElement) => {
  try {
    const htmlContent = await render(reactElement)
    await transporter.sendMail({
      from: "MS Portfolio Website <do-not-reply@msnovicetech.co.za>",
      to,
      subject,
      html: htmlContent,
    })
    console.log(`${subject} sent successfully to ${to}`)
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error)
    throw new Error(`Failed to send email. Error: ${error}`)
  }
}

// Send verification email
export const sendVerificationEmail = async (email: string, token: string) => {
  if (!email || !token) throw new Error("Email and token are required.")
  const verificationLink = `${domain}/verify?token=${token}`
  await sendEmail(email, "Verify your email address", VerificationEmail({ verificationLink }) as React.ReactElement)
}

// Send verification email for add user that has been added by admin
export const sendVerificationEmailForAddedUser = async (email: string, token: string, password: string) => {
  if (!email || !token) throw new Error("Email and token are required.")
  const verificationLink = `${domain}/verify?token=${token}`
  await sendEmail(email, "Verify your email address", VerificationbyadminEmail({
    verificationLink, password
  }) as React.ReactElement)
}

// Send password reset email
export const sendPasswordResetEmail = async (email: string, token: string) => {
  if (!email || !token) throw new Error("Email and token are required.")
  const resetLink = `${domain}/reset-password?token=${token}`
  await sendEmail(email, "Reset your password", PasswordResetEmail({ resetLink }) as React.ReactElement)
}

// Send contact confirmation email
export async function sendContactConfirmationEmail(name: string, email: string, topic: string, message: string) {
  if (!email || !name || !topic || !message) {
    throw new Error("All fields (name, email, subject, message) must be provided.")
  }
  await sendEmail(
    email,
    "Thank you for contacting us!",
    Contactconfirmation({ name, email, topic, message }) as React.ReactElement,
  )
}

//Send service inquiry confirmation email
export async function sendServiceInquiryConfirmationEmail(
  name: string,
  companyName: string,
  service: string,
  email: string,
  phoneNumber: string,
) {
  if (!email || !name || !service) {
    throw new Error("Email, name, and service are required.")
  }
  await sendEmail(
    email,
    "Service Request Confirmation!",
    ServiceInquiryConfirmationTemp({ name, companyName, service, email, phoneNumber }) as React.ReactElement,
     
  )
}

// Sending the generated token
export async function sendReviewInvitationToken(email: string, token: string) {
  if (!email || !token) throw new Error("Email and token are required.")
  const reviewLink = `${domain}/feedback?token=${token}`
  await sendEmail(email, "Review Invitation", InvitationtokenTemplate({reviewLink}) as React.ReactElement)
}

