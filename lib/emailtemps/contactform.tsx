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
          fontFamily: "Arial, sans-serif",
          lineHeight: 1.6,
          color: "#333",
          maxWidth: "600px",
          margin: "0 auto",
          padding: "20px",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td style={{ backgroundColor: "#ffffff", padding: "20px", textAlign: "center" }}>
                <img
                  src="https://3842090645.imgdist.com/pub/bfra/xny8ibaj/r99/e2p/1sx/logo.png"
                  alt="MS Portfolio Logo"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              </td>
            </tr>
            <tr>
              <td style={{ backgroundColor: "#000319", padding: "20px", textAlign: "center" }}>
                <h1 style={{ color: "white", margin: 0 }}>Contact Form Submission Confirmation</h1>
              </td>
            </tr>
            <tr>
              <td style={{ padding: "20px" }}>
                <p>Dear {name},</p>
                <br></br>
                <p>
                  Thank you for reaching out to us. We have successfully received your message and will respond as
                  promptly as possible, typically within 1-2 business days.
                </p>
                <br></br>
                <p>Below is a summary of the information you provided:</p>
                <br></br>
                <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
                  <li>
                    <strong>Name:</strong> {name}
                  </li>
                  <li>
                    <strong>Email:</strong> {email}
                  </li>
                  <li>
                    <strong>Subject:</strong> {topic}
                  </li>
                  <li>
                    <strong>Message:</strong> {message}
                  </li>
                </ul>
                <br></br>
                <p>
                  If you need to provide additional information or have any questions, please don&apos;t hesitate to reply to
                  this email or submit another contact form.
                </p>
                <br></br>
                <p>We appreciate your interest in our company and look forward to assisting you.</p>
                <p>
                  Sincerely,
                  <br />
                  Support Team
                </p>
              </td>
            </tr>
            <tr>
              <td
                style={{
                  backgroundColor: "#000319",
                  padding: "20px",
                  textAlign: "center",
                  fontSize: "12px",
                  color: "white",
                }}
              >
                <p>Connect with us:</p>
                <table style={{ margin: "0 auto" }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: "0 10px" }}>
                        <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                          <img
                            src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-outline-circle-white/facebook@2x.png"
                            width="32"
                            height="32"
                            alt="Facebook"
                            title="Facebook"
                            style={{ display: "block", border: 0 }}
                          />
                        </a>
                      </td>
                      <td style={{ padding: "0 10px" }}>
                        <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">
                          <img
                            src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-outline-circle-white/twitter@2x.png"
                            width="32"
                            height="32"
                            alt="Twitter"
                            title="Twitter"
                            style={{ display: "block", border: 0 }}
                          />
                        </a>
                      </td>
                      <td style={{ padding: "0 10px" }}>
                        <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
                          <img
                            src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-outline-circle-white/linkedin@2x.png"
                            width="32"
                            height="32"
                            alt="LinkedIn"
                            title="LinkedIn"
                            style={{ display: "block", border: 0 }}
                          />
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>&copy; {new Date().getFullYear()} simon339. All rights reserved.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  )
}

export default Contactconfirmation

