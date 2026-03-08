/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/server/auth";

export const metadata: Metadata = {
  title: "Onboarding | Complete Your Profile",
  description: "Complete your profile information to get started",
};

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get the current session
  const session = await auth.api.getSession({
    headers: await headers()
  });

  // If no session, redirect to auth page
  if (!session) {
    redirect("/auth");
  }

  // // Get user's organizations
  // const organizations = await getOrganizations();
  
  // // If user belongs to at least one organization, redirect to dashboard
  // if (organizations && organizations.length > 0) {
  //   redirect("/dashboard");
  // }

  return (
    
      <>{children}</>
  );
}