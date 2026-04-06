import { createAuthClient } from "better-auth/react"
import { lastLoginMethodClient, twoFactorClient,  adminClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_AUTH_BASE_URL || "http://localhost:3000" || "http://192.168.1.8:3000",
    plugins: [ lastLoginMethodClient(), twoFactorClient({ onTwoFactorRedirect(){ window.location.href ="/two-factor" } }), adminClient()]
})

export const { signIn, signOut, signUp, useSession } = authClient;
