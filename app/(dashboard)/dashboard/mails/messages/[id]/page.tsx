"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ChevronLeft } from "lucide-react"
import { getAllContactMessages } from "@/server/actions/notification"
import { Button } from "@/components/ui/button"
import MessageDetail from "@/components/Dashboard/MessageDetails"

type Message = {
  id: string
  name: string
  email: string
  topic: string
  message: string
  createdAt: Date
  isSelected: boolean
  isRead: boolean
}

export default function MessagePage() {
  const params = useParams()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const messageId = params.id as string

  useEffect(() => {
    async function loadMessages() {
      try {
        const data = await getAllContactMessages()
        setMessages(data)
      } catch (error) {
        console.error("Failed to load messages:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMessages()
  }, [])

  const message = messages.find((m) => m.id === messageId)

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 border-b bg-gray-50 backdrop-blur">
        <div className="flex h-14 items-center px-4">
          <Button onClick={() => router.back()} variant="ghost" size="icon" className="mr-2">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Go back</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-[50vh]">
            <div className="h-4 w-4 rounded-full border-2 border-[#acc2ef] border-r-transparent animate-spin" />
          </div>
        ) : !message ? (
          <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
            <h2 className="text-xl font-medium">Message not found</h2>
            <p className="text-muted-foreground">The message you&apos;re looking for doesn&apos;t exist or has been deleted.</p>
          </div>
        ) : (
          <MessageDetail message={message} />
        )}
      </main>
    </div>
  )
}