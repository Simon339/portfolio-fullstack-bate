import { createAuthClient } from "better-auth/react"
import { lastLoginMethodClient, twoFactorClient,  adminClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
<<<<<<< HEAD
    baseURL: process.env.BETTER_AUTH_URL || "https://m-s-portfolio.vercel.app",
=======
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000" || "https://m-s-portfolio.vercel.app", 
>>>>>>> 1103396 (Describe your changes)
    plugins: [ lastLoginMethodClient(), twoFactorClient({ onTwoFactorRedirect(){ window.location.href ="/two-factor" } }), adminClient()]
})

export const { signIn, signOut, signUp, useSession } = authClient;
