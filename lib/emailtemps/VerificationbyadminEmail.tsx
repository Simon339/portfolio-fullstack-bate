/* eslint-disable @next/next/no-img-element */
import type React from "react"

interface VerificationbyadminEmailProps {
    verificationLink: string
    password: string
}

export const VerificationbyadminEmail: React.FC<VerificationbyadminEmailProps> = ({ verificationLink, password }) => {
    return (
        <html lang="en">
        <head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Verification Email!</title>
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
                  <h1 style={{ color: "white", margin: 0 }}>Verify Your Email to Complete Your Registration!</h1>
                </td>
              </tr>
              <tr>
                <td style={{ padding: "20px" }}>
                  <p>Dear Valued User,</p>
                  <br></br>
                  <p>
                  We&apos;ve added your account to the portal. To get started, here is your temporary password: {password}. Click the link below to verify your account:</p>
                  <br></br>
                  <p style={{ textAlign: "center", margin: "30px 0" }}>
                    <a href={`${verificationLink}`} style={{ backgroundColor: "#000319", color: "white", padding: "12px 24px", textDecoration: "none", display: "inline-block", borderRadius: "4px", fontWeight: "bold" }}>Leave a Review</a>
                  </p>
                  <p><strong>Please note:</strong>This verification link will expire within 24 hours for security reasons.</p>
                  <br></br>
                  <p>Once you&apos;ve set your password, you&apos;ll be able to log in and access your account. If you didn&apos;t request this, please contact our Support Team immediately.</p>
                  <br></br>
                  <p>Thank you for joining us. We look forward to having you onboard!</p>
                  <br></br>
                   <p>Sincerely,
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