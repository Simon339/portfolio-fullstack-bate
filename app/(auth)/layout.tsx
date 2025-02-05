// Code Generated with love

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AuthPage",
  description: "Let's Sign up or Login",
};

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 to-pink-500">
      {children}
    </main>
  );
}
