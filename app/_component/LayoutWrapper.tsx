'use server';

import Providers from "@/components/Website/providers";
import RatingModal from "@/components/Website/RatingModal";
import SessionExpirationWarning from "@/components/Auth/SessionExpirationWarning";

export default async function LayoutWrapper({ children }: { children: React.ReactNode }) {

  return (
    <Providers>
      {children}
      <RatingModal />
      <SessionExpirationWarning />
    </Providers> 
  )
}