
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
    <main className="flex min-h-screen w-full lg:min-h-fit justify-between">
      {children}
    </main>
  );
}
