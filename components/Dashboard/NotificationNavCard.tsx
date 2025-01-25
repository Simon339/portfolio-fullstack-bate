import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from '@/components/ui/button'
import { Check, Mail } from 'lucide-react'
import Link from 'next/link'

interface NotificationCardProps {
    id: string;
    name: string
    email: string
    message: string
    createdAt: Date;
    onRead: () => void;
}

const NotificationNavCard = ({id, name, email, message, createdAt, onRead }: NotificationCardProps) => {

    const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    })

    return (
        <div className="w-full max-w-md transition-all duration-200">
            <div className="flex items-start space-x-4 border-[#acc2ef]">
                <Avatar className='h-10 w-10'>
                    <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${name}`} alt={name} />
                    <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-medium leading-none">{name}</h2>
                        <span className="text-xs text-muted-foreground">{formattedDate}</span>
                    </div>

                    <p className="text-sm text-muted-foreground">{email}</p>
                    <p className="text-ellipsis text-sm...">{message}</p>
                    <div className="flex items-center gap-4 pt-2">
                    <Link href={`/dashboard/mails/${id}`} passHref>
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1 hover:text-white hover:bg-black-200  border-[#acc2ef]  bg-transparent"
                            
                        >
                            <Mail className="h-4 w-4" />
                            Open
                        </Button>
                        </Link>
                        

                        <Button onClick={onRead} variant="ghost" size="sm" className="flex items-center gap-1 hover:text-white hover:bg-black-200 hover:border-[#acc2ef]">
                            <Check className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NotificationNavCard