/* eslint-disable @next/next/no-img-element */
import { auth } from "@/server/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { users } from "@/server/schema";
import { eq } from "drizzle-orm";
import Loggout from "@/components/Onboarding/Loggout";
import { after } from "next/server";

export const metadata: Metadata = {
  title: "Onboarding | Complete Your Profile",
  description: "Complete your profile information to get started",
};

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/auth");
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)
    .then((results) => results[0]);

  after(async () => {
    if (!session?.user?.id) return

    const user = await db.select().from(users).where(eq(users.id, session?.user?.id)).limit(1)

    if (user[0].lastActivityDate === new Date().toISOString().slice(0, 10)) return

    await db
      .update(users)
      .set({ lastActivityDate: new Date().toISOString().slice(0, 10) })
      .where(eq(users.id, session?.user?.id))
  })



  if (!user) {
    redirect("/auth");
  }

  if (user.deletionRequestedAt) {
    redirect("/account-deletion-requested");
  }

  if (user.status === "APPROVED") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-gray-700">
      <header className="border-b bg-white border-[#acc2ef] sticky top-0 z-10">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full flex items-center justify-center text-primary-foreground font-semibold">
              <img src="/logo.png" alt="logo" className="h-8 w-8" />
            </div>
            <span className="font-semibold">Malesela&apos;s Portfolio</span>
          </div>
          <Loggout />
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}