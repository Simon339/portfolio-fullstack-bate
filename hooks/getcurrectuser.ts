import { createAuthClient } from "better-auth/react"
import { lastLoginMethodClient, organizationClient, twoFactorClient,  adminClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
    baseURL: "http://localhost:3000",
    plugins: [ organizationClient(), lastLoginMethodClient(), twoFactorClient(), adminClient()],
})

export const {
    signIn,
    signOut,
    signUp,
    useSession
} = authClient;
