'use client';

import Header from "@/components/Website/header";
import Footer from "@/components/Website/footer";


export default function RootLayout({ children }: { children: React.ReactNode; }) {

  return (
    <>
      <Header />
      <main className="px-px relative min-h-screen  bg-black-100 text-white overflow-hidden">
        {children}
      </main>
      <Footer />
    </>
  );
}

