
import type { Metadata } from "next";
import "./globals.css";
import LayoutWrapper from "./_component/LayoutWrapper";


export const metadata: Metadata = {
  title: "Malesela's Portfolio",
  description: "Updated Silk full stack Portfolio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {


  return (
    <html lang="en">
      <head>
        <link href="/logo.png" rel="icon" />
      </head>
      <body className={` h-screen grow scrollbar scrollbar-track-[#000B58] scrollbar-thumb-transparent`}>
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}

//https://colorhunt.co/palette/000b58003161006a67fff4b7
//https://aicolors.co/