/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
import type React from "react"

interface VerificationEmailProps {
  verificationLink: string
}

export const VerificationEmail: React.FC<VerificationEmailProps> = ({ verificationLink }) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Verify Your Email</title>
      </head>
      <body
        style={{
          fontFamily: "'Segoe UI', Helvetica, Arial, sans-serif",
          lineHeight: 1.6,
          color: "#333",
          backgroundColor: "#f9f9f9",
          margin: 0,
          padding: 0,
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
          }}
        >
          {/* Header */}
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "30px 20px",
              textAlign: "center",
              borderBottom: "1px solid #eaeaea",
            }}
          >
            <img
              src="https://3842090645.imgdist.com/pub/bfra/xny8ibaj/r99/e2p/1sx/logo.png"
              alt="MS Portfolio Logo"
              style={{ maxWidth: "180px", height: "auto" }}
            />
          </div>

          {/* Title Banner */}
          <div
            style={{
              background: "linear-gradient(135deg, #000319 0%, #1a237e 100%)",
              padding: "35px 20px",
              textAlign: "center",
            }}
          >
            <h1
              style={{
                color: "white",
                margin: 0,
                fontSize: "28px",
                fontWeight: 600,
                letterSpacing: "0.5px",
              }}
            >
              Verify Your Email Address
            </h1>
          </div>

          {/* Content */}
          <div style={{ padding: "40px 30px", backgroundColor: "#ffffff" }}>
            <p style={{ fontSize: "16px", marginTop: 0 }}>Hello,</p>

            <p style={{ fontSize: "16px", marginBottom: "25px" }}>
              Thank you for signing up! To complete your registration and start using our services, please verify your
              email address by clicking the button below:
            </p>

            <div style={{ textAlign: "center", margin: "35px 0" }}>
              <a
                href={verificationLink}
                style={{
                  backgroundColor: "#000319",
                  color: "white",
                  padding: "14px 28px",
                  textDecoration: "none",
                  display: "inline-block",
                  borderRadius: "6px",
                  fontWeight: 600,
                  fontSize: "16px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.12)",
                }}
              >
                Verify Email
              </a>
            </div>

            <p style={{ fontSize: "16px", marginBottom: "25px" }}>
              <strong>Important:</strong> This verification link will expire in 24 hours for security reasons.
            </p>

            <p style={{ fontSize: "16px", marginBottom: "25px" }}>
              If you did not create an account with us, please ignore this email or contact our support team if you have
              concerns.
            </p>

            <div
              style={{
                borderTop: "1px solid #eaeaea",
                paddingTop: "25px",
                marginTop: "30px",
                fontSize: "16px",
                color: "#666",
              }}
            >
              <p style={{ margin: "0 0 10px 0" }}>We're excited to have you join us!</p>
              <p style={{ margin: 0, fontWeight: 600 }}>The Support Team</p>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              backgroundColor: "#000319",
              padding: "30px 20px",
              textAlign: "center",
              color: "white",
            }}
          >
            <p style={{ fontSize: "14px", margin: "0 0 15px 0" }}>Connect with us:</p>

            <div style={{ margin: "0 auto 20px auto" }}>
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "inline-block", margin: "0 8px" }}
              >
                <img
                  src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-outline-circle-white/facebook@2x.png"
                  width="32"
                  height="32"
                  alt="Facebook"
                  style={{ display: "block", border: 0 }}
                />
              </a>
              <a
                href="https://www.twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "inline-block", margin: "0 8px" }}
              >
                <img
                  src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-outline-circle-white/twitter@2x.png"
                  width="32"
                  height="32"
                  alt="Twitter"
                  style={{ display: "block", border: 0 }}
                />
              </a>
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "inline-block", margin: "0 8px" }}
              >
                <img
                  src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-outline-circle-white/linkedin@2x.png"
                  width="32"
                  height="32"
                  alt="LinkedIn"
                  style={{ display: "block", border: 0 }}
                />
              </a>
            </div>

            <p style={{ fontSize: "12px", margin: "0 0 10px 0", opacity: 0.8 }}>
              This is an automated message. Please do not reply to this email.
            </p>
            <p style={{ fontSize: "12px", margin: 0, opacity: 0.8 }}>
              &copy; {new Date().getFullYear()} simon339. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}

