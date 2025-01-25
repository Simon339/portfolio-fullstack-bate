'use client';

import Header from "@/components/Website/header";
import Footer from "@/components/Website/footer";


export default function RootLayout({ children }: { children: React.ReactNode; }) {

  return (
    <>
      <Header />
      <main className="px-px relative bg-black-100 overflow-hidden">
        {children}
      </main>
      <Footer />
    </>
  );
}

