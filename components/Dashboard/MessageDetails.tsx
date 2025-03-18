"use client"

import { useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { markContactFormAsRead } from "@/server/actions/notification"
import { formatDistanceToNow } from "date-fns"

interface Message {
  id: string
  topic: string
  name: string
  email: string
  createdAt: Date
  message: string
}

interface MessageDetailProps {
  message: Message
}

export default function MessageDetail({ message }: MessageDetailProps) {
  useEffect(() => {
    markContactFormAsRead(message.id)
  }, [message.id])

  const formattedDate = new Date(message.createdAt).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  const timeAgo = formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })

  return (
    <div className="mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-medium mb-6">{message.topic}</h1>

        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16 border border-[#acc2ef]">
            <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${message.name}`} alt={message.name} />
            <AvatarFallback>{message.name.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
              <div>
                <div className="font-medium">{message.name}</div>
                <div className="text-sm text-muted-foreground">{message.email}</div>
              </div>
              <div className="text-sm text-muted-foreground whitespace-nowrap">
                {formattedDate}
                <span className="hidden sm:inline"> · </span>
                <span className="block sm:inline text-xs">{timeAgo}</span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground mt-1">to me</div>
          </div>
        </div>
      </div>

      <div className="border-t pt-6 mt-6">
        <div className="prose prose-sm max-w-none">
          <p>Dear Support,</p>
          <div className="my-6 whitespace-pre-line">{message.message}</div>
          <p>
            Best regards,
            <br />
            {message.name}
          </p>
        </div>
      </div>
    </div>
  )
}

