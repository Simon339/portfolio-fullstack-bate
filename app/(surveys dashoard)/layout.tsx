import { Metadata } from "next";


export const metadata: Metadata = {
  title: "Malesela's Portfolio | Digital Business Card",
  description: "Professional digital business card of Malesela Simon Malapane - Technology Enthusiast specializing in Web Development, Flutter, Cybersecurity, Data Science, and React. Connect with me for collaborations and opportunities.",
  keywords: ["digital business card", "web developer", "full stack developer", "Malesela Malapane", "technology enthusiast", "React developer", "Flutter developer", "South Africa"],
  authors: [{ name: "Malesela Simon Malapane" }],
  creator: "Malesela Simon Malapane",
  publisher: "Malesela Simon Malapane",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Malesela's Portfolio | Digital Business Card",
    description: "Connect with Malesela Simon Malapane - Expert in Web Development, Flutter, Cybersecurity, Data Science & React. View my portfolio and get in touch.",
    url: "https://yourdomain.com/businesscard",
    siteName: "Malesela Malapane - Digital Business Card",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Malesela's Portfolio Digital Business Card",
      },
    ],
    locale: "en_US",
    type: "profile",
  },
  twitter: {
    card: "summary_large_image",
    title: "Malesela Simon Malapane | Digital Business Card",
    description: "Professional digital business card - Web Developer, Flutter, Cybersecurity, Data Science & React Expert",
    creator: "@yourtwitterhandle", 
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
 
  category: "portfolio",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="px-px relative bg-black-100 overflow-hidden">
      {children}
    </main>
  )
}
