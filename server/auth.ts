import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/server/db";
import { nextCookies } from "better-auth/next-js";
import { lastLoginMethod, twoFactor, admin as adminplug } from "better-auth/plugins";
import { schema } from "./schema";
import { owner, admin, member, ac } from "@/lib/permission";
import { transporter } from "@/lib/mail";

export const auth = betterAuth({
  appName: "Malesela's Portfolio",
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url, token }) => {
      // const verificationLink = `${process.env.BETTER_AUTH_URL}/verify-email?token=${token}`;
      transporter.sendMail({
        from: `"MS Portfolio Website" <${process.env.SMTP_EMAIL}>`,
        to: user.email,
        subject: "Verify your email address",
        html: `
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>Verify Your Email</title>
            </head>
            <body style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; margin: 0; padding: 0;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <!-- Header -->
                <div style="background-color: #ffffff; padding: 30px 20px; text-align: center; border-bottom: 1px solid #eaeaea;">
                  <img src="https://3842090645.imgdist.com/pub/bfra/xny8ibaj/r99/e2p/1sx/logo.png" alt="MS Portfolio Logo" style="max-width: 180px; height: auto;" />
                </div>

                <!-- Title Banner -->
                <div style="background: linear-gradient(135deg, #000319 0%, #1a237e 100%); padding: 35px 20px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: 0.5px;">
                    Verify Your Email Address
                  </h1>
                </div>

                <!-- Content -->
                <div style="padding: 40px 30px; background-color: #ffffff;">
                  <p style="font-size: 16px; margin-top: 0;">Hello ${user.name || 'there'},</p>

                  <p style="font-size: 16px; margin-bottom: 25px;">
                    Thank you for signing up! To complete your registration and start using our services, please verify your
                    email address by clicking the button below:
                  </p>

                  <div style="text-align: center; margin: 35px 0;">
                    <a href="${url}" style="background-color: #000319; color: white; padding: 14px 28px; text-decoration: none; display: inline-block; border-radius: 6px; font-weight: 600; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 6px rgba(0,0,0,0.12);">
                      Verify Email
                    </a>
                  </div>

                  <p style="font-size: 16px; margin-bottom: 25px;">
                    <strong>Important:</strong> This verification link will expire in 24 hours for security reasons.
                  </p>

                  <p style="font-size: 16px; margin-bottom: 25px;">
                    If you did not create an account with us, please ignore this email or contact our support team if you have concerns.
                  </p>

                  <div style="border-top: 1px solid #eaeaea; padding-top: 25px; margin-top: 30px; font-size: 16px; color: #666;">
                    <p style="margin: 0 0 10px 0;">We're excited to have you join us!</p>
                    <p style="margin: 0; font-weight: 600;">The Support Team</p>
                  </div>
                </div>

                <!-- Footer -->
                <div style="background-color: #000319; padding: 30px 20px; text-align: center; color: white;">
                  <p style="font-size: 14px; margin: 0 0 15px 0;">Connect with us:</p>

                  <div style="margin: 0 auto 20px auto;">
                    <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" style="display: inline-block; margin: 0 8px;">
                      <img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-outline-circle-white/facebook@2x.png" width="32" height="32" alt="Facebook" style="display: block; border: 0;" />
                    </a>
                    <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" style="display: inline-block; margin: 0 8px;">
                      <img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-outline-circle-white/twitter@2x.png" width="32" height="32" alt="Twitter" style="display: block; border: 0;" />
                    </a>
                    <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" style="display: inline-block; margin: 0 8px;">
                      <img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-outline-circle-white/linkedin@2x.png" width="32" height="32" alt="LinkedIn" style="display: block; border: 0;" />
                    </a>
                  </div>

                  <p style="font-size: 12px; margin: 0 0 10px 0; opacity: 0.8;">
                    This is an automated message. Please do not reply to this email.
                  </p>
                  <p style="font-size: 12px; margin: 0; opacity: 0.8;">
                    &copy; ${new Date().getFullYear()} MS Portfolio. All rights reserved.
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
        text: `Verify your email address by visiting: ${url}\n\nThis link will expire in 24 hours.`,
      })
    },
  },

  database: drizzleAdapter(db, {
    provider: "mysql",
    schema
  }),

  user: {
    modelName: "user",
    tableName: "user",
  },
  session: {
    modelName: "session",
    tableName: "session",
  },
  account: {
    modelName: "account",
    tableName: "account",
  },
  verification: {
    modelName: "verification",
    tableName: "verification",
  },

  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url, token }) => {
      // Create a frontend-specific URL
      const frontendUrl = `${process.env.BETTER_AUTH_URL || 'http://localhost:3000'}/new-password?token=${token}`;

      // Don't await the email sending to prevent timing attacks
      transporter.sendMail({
        from: `"MS Portfolio Website" <${process.env.SMTP_EMAIL}>`,
        to: user.email,
        subject: "Reset your password",
        html: `
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>Reset Your Password</title>
            </head>
            <body style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; margin: 0; padding: 0;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <!-- Header -->
                <div style="background-color: #ffffff; padding: 30px 20px; text-align: center; border-bottom: 1px solid #eaeaea;">
                  <img src="https://3842090645.imgdist.com/pub/bfra/xny8ibaj/r99/e2p/1sx/logo.png" alt="MS Portfolio Logo" style="max-width: 180px; height: auto;" />
                </div>

                <!-- Title Banner -->
                <div style="background: linear-gradient(135deg, #000319 0%, #1a237e 100%); padding: 35px 20px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: 0.5px;">
                    Reset Your Password
                  </h1>
                </div>

                <!-- Content -->
                <div style="padding: 40px 30px; background-color: #ffffff;">
                  <p style="font-size: 16px; margin-top: 0;">Hello ${user.name || 'there'},</p>

                  <p style="font-size: 16px; margin-bottom: 25px;">
                    We received a request to reset your password. Click the button below to create a new password:
                  </p>

                  <div style="text-align: center; margin: 35px 0;">
                    <a href="${frontendUrl}" style="background-color: #000319; color: white; padding: 14px 28px; text-decoration: none; display: inline-block; border-radius: 6px; font-weight: 600; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 6px rgba(0,0,0,0.12);">
                      Reset Password
                    </a>
                  </div>

                  <p style="font-size: 16px; margin-bottom: 25px;">
                    <strong>Important:</strong> This link will expire in 24 hours for security reasons.
                  </p>

                  <p style="font-size: 16px; margin-bottom: 25px;">
                    If you didn't request a password reset, please ignore this email or contact our support team if you have concerns.
                  </p>

                  <div style="border-top: 1px solid #eaeaea; padding-top: 25px; margin-top: 30px; font-size: 16px; color: #666;">
                    <p style="margin: 0 0 10px 0;">Best regards,</p>
                    <p style="margin: 0; font-weight: 600;">The Support Team</p>
                  </div>
                </div>

                <!-- Footer -->
                <div style="background-color: #000319; padding: 30px 20px; text-align: center; color: white;">
                  <p style="font-size: 14px; margin: 0 0 15px 0;">Connect with us:</p>

                  <div style="margin: 0 auto 20px auto;">
                    <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" style="display: inline-block; margin: 0 8px;">
                      <img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-outline-circle-white/facebook@2x.png" width="32" height="32" alt="Facebook" style="display: block; border: 0;" />
                    </a>
                    <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" style="display: inline-block; margin: 0 8px;">
                      <img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-outline-circle-white/twitter@2x.png" width="32" height="32" alt="Twitter" style="display: block; border: 0;" />
                    </a>
                    <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" style="display: inline-block; margin: 0 8px;">
                      <img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-outline-circle-white/linkedin@2x.png" width="32" height="32" alt="LinkedIn" style="display: block; border: 0;" />
                    </a>
                  </div>

                  <p style="font-size: 12px; margin: 0 0 10px 0; opacity: 0.8;">
                    This is an automated message. Please do not reply to this email.
                  </p>
                  <p style="font-size: 12px; margin: 0; opacity: 0.8;">
                    &copy; ${new Date().getFullYear()} MS Portfolio. All rights reserved.
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
        text: `Reset your password by visiting: ${frontendUrl}\n\nThis link will expire in 24 hours.`,
      })
    },
    requireEmailVerification: true,
  },

  socialProviders: {
    github: { 
      clientId: process.env.GITHUB_CLIENT_ID as string, 
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string, 
    }, 
    google: { 
      clientId: process.env.GOOGLE_CLIENT_ID as string, 
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
    },
  },

  plugins: [
    lastLoginMethod(),
    nextCookies(),
    twoFactor(),
    adminplug()
  ],
});