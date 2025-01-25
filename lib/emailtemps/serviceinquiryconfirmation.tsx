/* eslint-disable @next/next/no-img-element */
import type React from "react"

interface ServiceInquiryConfirmationTempProps {
  name: string
  email: string
  companyName: string
  phoneNumber: string
  service: string
}

export const ServiceInquiryConfirmationTemp: React.FC<ServiceInquiryConfirmationTempProps> = ({ name, email,companyName, phoneNumber, service }) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Service Request Confirmation</title>
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
                <h1 style={{ color: "white", margin: 0 }}>Service Request Confirmation</h1>
              </td>
            </tr>
            <tr>
              <td style={{ padding: "20px" }}>
                <p>Dear Valued Client,</p>
                <br></br>
                <p>
                Thank you for reaching out to us regarding our services. We have received your request and will respond within <span style={{ fontWeight: "bold"}}>3-7 business days</span> via email or phone call.
                </p>
                <br></br>
                <p>Below is a summary of the information you provided:</p>
                <br></br>
                <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
                  <li>
                    <strong>Name:</strong> {name}
                  </li>
                  <li>
                  <strong>Company:</strong> {companyName}
                  </li>
                  <li>
                    <strong>Email:</strong> {email}
                  </li>
                  <li>
                    <strong>Phone:</strong> {phoneNumber}
                  </li>
                  <li>
                    <strong>Service Requested:</strong> {service}
                  </li>
                </ul>
                <p>
                If you need to update any information or have any questions in the meantime, please do not hesitate to contact us.
                </p>
                <br></br>
                <p>We sincerely appreciate your interest in our services and look forward to speaking with you soon.</p>
                <br></br>
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

export default ServiceInquiryConfirmationTemp




// export const ServiceInquiryConfirmationTemp = `
//   <!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Service Request Confirmation</title>
// </head>
// <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
//     <table style="width: 100%; border-collapse: collapse;">
//         <tr>
//             <td style="background-color: #ffffff; padding: 20px; text-align: center;">
//                 <img src="https://3842090645.imgdist.com/pub/bfra/xny8ibaj/r99/e2p/1sx/logo.png" alt="MS Portfolio Logo" style="max-width: 100%; height: auto;">
//             </td>
//         </tr>
//         <tr>
//             <td style="background-color: #000319; padding: 20px; text-align: center;">
//                 <h1 style="color: white; margin: 0;">Service Request Confirmation</h1>
//             </td>
//         </tr>
//         <tr>
//             <td style="padding: 20px;">
//                 <p>Dear Valued Client,</p>
//                 <p>Thank you for reaching out to us regarding our services. We have received your request and will respond within <span style="font-weight: bold;">3-7 business days</span> via email or phone call.</p>
//                 <p>Below is a summary of the information you provided:</p>
//                 <ul style="list-style-type: none; padding-left: 0;">
//                     <li><strong>Name:</strong> {{name}}</li>
//                     <li><strong>Company:</strong> {{companyName}}</li>
//                     <li><strong>Email:</strong> {{email}}</li>
//                     <li><strong>Phone:</strong> {{phoneNumber}}</li>
//                     <li><strong>Service Requested:</strong> {{service}}</li>
//                 </ul>
//                 <p>If you need to update any information or have any questions in the meantime, please do not hesitate to contact us.</p>
//                 <p>We sincerely appreciate your interest in our services and look forward to speaking with you soon.</p>
//                 <p>Sincerely,<br>Support Team</p>
//             </td>
//         </tr>
//         <tr>
//             <td style="background-color: #000319; padding: 20px; text-align: center; font-size: 12px; color: white;">
//                 <p>Connect with us:</p>
//                 <table style="margin: 0 auto;">
//                     <tr>
//                         <td style="padding: 0 10px;">
//                             <a href="https://www.facebook.com" target="_blank">
//                                 <img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-outline-circle-white/facebook@2x.png" width="32" height="32" alt="Facebook" title="Facebook" style="display: block; border: 0;">
//                             </a>
//                         </td>
//                         <td style="padding: 0 10px;">
//                             <a href="https://www.twitter.com" target="_blank">
//                                 <img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-outline-circle-white/twitter@2x.png" width="32" height="32" alt="Twitter" title="Twitter" style="display: block; border: 0;">
//                             </a>
//                         </td>
//                         <td style="padding: 0 10px;">
//                             <a href="https://www.linkedin.com" target="_blank">
//                                 <img src="https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-outline-circle-white/linkedin@2x.png" width="32" height="32" alt="LinkedIn" title="LinkedIn" style="display: block; border: 0;">
//                             </a>
//                         </td>
//                     </tr>
//                 </table>
//                 <p>This is an automated message. Please do not reply to this email.</p>
//                 <p>&copy; 2025 simon339. All rights reserved.</p>
//             </td>
//         </tr>
//     </table>
// </body>
// </html>

// `