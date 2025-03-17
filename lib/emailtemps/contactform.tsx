/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
import type React from "react"

interface ContactConfirmationProps {
  name: string
  email: string
  topic: string
  message: string
}

export const Contactconfirmation: React.FC<ContactConfirmationProps> = ({ name, email, topic, message }) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Contact Form Submission Confirmation</title>
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
              Message Received
            </h1>
          </div>

          {/* Content */}
          <div style={{ padding: "40px 30px", backgroundColor: "#ffffff" }}>
            <p style={{ fontSize: "16px", marginTop: 0 }}>Dear {name},</p>

            <p style={{ fontSize: "16px", marginBottom: "25px" }}>
              Thank you for reaching out to us. We have successfully received your message and will respond as promptly
              as possible, typically within 1-2 business days.
            </p>

            <div
              style={{
                backgroundColor: "#f8f9fa",
                borderRadius: "6px",
                padding: "25px",
                marginBottom: "25px",
                border: "1px solid #eaeaea",
              }}
            >
              <p style={{ fontSize: "16px", fontWeight: 600, marginTop: 0, marginBottom: "15px" }}>Message Details:</p>

              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={{ padding: "8px 0", fontSize: "15px", color: "#666" }}>Name:</td>
                    <td style={{ padding: "8px 0", fontSize: "15px", fontWeight: 500 }}>{name}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "8px 0", fontSize: "15px", color: "#666" }}>Email:</td>
                    <td style={{ padding: "8px 0", fontSize: "15px", fontWeight: 500 }}>{email}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "8px 0", fontSize: "15px", color: "#666" }}>Subject:</td>
                    <td style={{ padding: "8px 0", fontSize: "15px", fontWeight: 500 }}>{topic}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ marginTop: "15px" }}>
                <p style={{ fontSize: "15px", color: "#666", margin: "0 0 8px 0" }}>Message:</p>
                <p
                  style={{
                    fontSize: "15px",
                    margin: 0,
                    padding: "12px",
                    backgroundColor: "#fff",
                    border: "1px solid #eee",
                    borderRadius: "4px",
                  }}
                >
                  {message}
                </p>
              </div>
            </div>

            <p style={{ fontSize: "16px", marginBottom: "25px" }}>
              If you need to provide additional information or have any questions, please don't hesitate to reply to
              this email or submit another contact form.
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
              <p style={{ margin: "0 0 10px 0" }}>We appreciate your interest,</p>
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

