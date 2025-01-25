import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Malesela's Portfolio's surveys",
    description: "This dashboard is for customer reviews and ratings for all services provided",
  };
  
  export default function RootLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {

    return (
        <main className="px-px relative bg-black-100 overflow-hidden">
        {children}
      </main> 
    )
  }
  