"use client";

import MessageDetail from "@/components/Dashboard/MessageDetails";
import { Button } from "@/components/ui/button";
import { getAllContactMessages } from "@/server/actions/notification";
import { ChevronLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React from 'react';

type Message = {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  createdAt: Date;
  isSelected: boolean;
  isRead: boolean;
};

const Page = () => {
  const params = useParams();
  const router = useRouter();

  const [allContactMessages, setAllContactMessages] = React.useState<Message[]>([]);

  React.useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const notifications = await getAllContactMessages();
    setAllContactMessages(notifications);
  };

  const handleBack = () => {
    router.back();
  };

  const messageId = parseInt(params.id, 10);

  // Check for invalid messageId
  if (isNaN(messageId)) {
    return (
      <section className="rounded-xl bg-gray-50 shadow-md px-4 overflow-hidden min-h-screen flex flex-col">
        <div className="flex items-center justify-between p-2 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <Button onClick={handleBack} variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="items-center mb-10">
          <div className="flex flex-col items-center">
            <h2 className="text-xl text-center">Message not found</h2>
          </div>
        </div>
      </section>
    );
  }

  const message = allContactMessages.find((m) => m.id === messageId);

  // If the message is not found in the fetched list
  if (!message) {
    return (
      <section className="rounded-xl bg-gray-50 shadow-md px-4 overflow-hidden min-h-screen flex flex-col">
        <div className="flex items-center justify-between p-2 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <Button onClick={handleBack} variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="items-center mb-10">
          <div className="flex flex-col items-center">
            <h2 className="text-xl text-center">Message not found</h2>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl bg-gray-50 shadow-md px-4 overflow-hidden min-h-screen flex flex-col">
      <div className="flex items-center justify-between p-2 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Button onClick={handleBack} variant="ghost" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <MessageDetail message={message} />
    </section>
  );
};

export default Page;
