'use server';

import Providers from "@/components/Website/providers";
import RatingModal from "@/components/Website/RatingModal";
import SessionProvider from "@/components/Auth/SessionProvider";
import { auth } from "@/server/auth";

export default async function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
      <SessionProvider session={session}>
        <Providers>
          {children}
          <RatingModal />
        </Providers>
      </SessionProvider>
  )
}