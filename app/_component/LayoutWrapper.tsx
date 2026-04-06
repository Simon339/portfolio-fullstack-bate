// LayoutWrapper.tsx
"use client";

import type React from "react";
import Providers from "@/components/Website/providers"
import RatingModal from "@/components/Website/RatingModal"
import { authClient } from "@/hooks/getcurrectuser";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { data: session, isPending, error} = authClient.useSession();

  // Show loading state
  if (isPending) {
  return (
   <div className="flex items-center justify-center h-screen gap-2">
      <div className="w-5 h-5 border-t-2 border-gray-300 rounded-full animate-spin"></div>
      <span className="text-gray-600 text-sm">
        Please wait
        <span className="animate-[pulse_1.5s_ease-in-out_infinite]">.</span>
        <span className="animate-[pulse_1.5s_ease-in-out_infinite_0.2s]">.</span>
        <span className="animate-[pulse_1.5s_ease-in-out_infinite_0.4s]">.</span>
      </span>
    </div>
  )
}



  return (
    <>
      {children}
      <RatingModal />
    </>
  );
}