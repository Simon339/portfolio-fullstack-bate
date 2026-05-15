import { createAuthClient } from "better-auth/react"
import { lastLoginMethodClient, twoFactorClient,  adminClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000" || "https://m-s-portfolio.vercel.app",
    plugins: [ lastLoginMethodClient(), twoFactorClient({ onTwoFactorRedirect(){ window.location.href ="/two-factor" } }), adminClient()]
})

export const { signIn, signOut, signUp, useSession } = authClient;
