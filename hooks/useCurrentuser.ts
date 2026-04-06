/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { getUserById } from "@/server/actions/user"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"


export function useCurrentUser() {
  const { data: session } = useSession()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      if (session?.user?.id) {
        try {
          const userData = await getUserById(session.user.id)
          setUser(userData)
        } catch (error) {
          console.error("Failed to fetch user data:", error)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    fetchUser()
  }, [session])

  return user
}

