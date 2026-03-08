// LayoutWrapper.tsx
"use client";

import type React from "react";
import Providers from "@/components/Website/providers"
import RatingModal from "@/components/Website/RatingModal"
import { authClient } from "@/hooks/getcurrectuser";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { 
    data: session, 
    isPending,
    error,
  } = authClient.useSession();

  // Show loading state
  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-5 h-5 border-t-2 border-gray-300 rounded-full animate-spin"></div>
      </div>
    );
  }


  return (
    <Providers>
      {children}
      <RatingModal />
    </Providers>
  );
}