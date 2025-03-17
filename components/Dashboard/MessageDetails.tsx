"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from '../ui/button';
import { MailPlus, MoreHorizontal, SquarePen, } from 'lucide-react';
import { Dropdown, DropdownMenu, DropdownSection, DropdownItem, DropdownTrigger } from '@heroui/react';

import { markContactFormAsRead } from '@/server/actions/notification';
import React from "react";

interface Message {
    id: string;
    topic: string;
    name: string;
    email: string;
    createdAt: Date;
    message: string;
}

interface MessageDetailProps {
    message: Message;
}

const MessageDetail = ({ message }: MessageDetailProps) => {
    const iconClasses = "h-4 w-4 mr-2 pointer-events-none flex-shrink-0";

    React.useEffect(() => {
        markContactFormAsRead(parseInt(message.id, 10));
    }, [message.id]);

    const formattedDate = new Date(message.createdAt).toLocaleDateString("en-US", {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div className="">
            <div className="flex items-start justify-between gap-4 mb-8">
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-medium text-foreground mb-4">{message.topic}</h1>
                    <div className="flex items-start gap-3">
                        <Avatar>
                            <AvatarImage
                                src={`https://api.dicebear.com/6.x/initials/svg?seed=${message.name}`}
                                alt={message.name}
                            />
                            <AvatarFallback>{message.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2 flex-wrap">
                                <span className="font-medium text-sm">{message.name}</span>
                                <span className="text-sm text-muted-foreground">{`<${message.email}>`}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">to me</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <time className="text-sm text-muted-foreground whitespace-nowrap">{formattedDate}</time>

                            <Dropdown className='bg-[#0F1C2E] text-[#acc2ef] font-semibold'>
                                <DropdownTrigger>
                                    <Button variant="ghost" size="sm" className="text-gray-600">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    variant="faded"
                                    aria-label="Static Actions"
                                    className='border-[#acc2ef]'
                                >
                                    <DropdownSection title="New Message" showDivider>
                                        <DropdownItem
                                            key="compose"
                                            startContent={<MailPlus className={iconClasses} />}
                                            description="Compose a new message."
                                            href="/dev/new"
                                        >
                                            New Message
                                        </DropdownItem>
                                        <DropdownItem
                                            key="drafts"
                                            startContent={<SquarePen className={iconClasses} />}
                                            description="Manage your drafts."
                                        >
                                            Drafts
                                        </DropdownItem>
                                    </DropdownSection>
                                </DropdownMenu>
                            </Dropdown>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4 text-sm leading-relaxed">
                <p>Dear Support,</p>
                <p>{message.message}</p>
                <p>
                    Best regards,
                    <br />
                    {message.name}
                </p>
            </div>


        </div>
    )
}

export default MessageDetail

