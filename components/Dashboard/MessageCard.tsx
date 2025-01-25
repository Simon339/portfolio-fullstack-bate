/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from '../ui/checkbox';


interface MessageCardProps {
    id: string;
    name: string;
    email: string;
    topic: string;
    message: string;
    createdAt: Date;
    isSelected?: boolean;
    isRead?: boolean;
    onSelect: (id: string, checked: boolean) => void;
    onToggleRead: (id: string) => void;
  }
  
  const MessageCard = ({ id,name, email, topic, message, createdAt, isSelected, isRead, onSelect, onToggleRead }: MessageCardProps) => {
  
      function formatDate(createdAt: Date) {
          const now = new Date();
          const timeDiff = now.getTime() - createdAt.getTime();
          const secondsInMinute = 60;
          const secondsInHour = 60 * secondsInMinute;
          const secondsInDay = 24 * secondsInHour;
          const secondsInYear = 365 * secondsInDay;
  
  
          if (timeDiff < secondsInMinute * 1000) {
              return 'Just now';
          }
  
          if (timeDiff < secondsInHour * 1000) {
              const minutesAgo = Math.floor(timeDiff / 1000 / secondsInMinute);
              return `${minutesAgo} min${minutesAgo > 1 ? 's' : ''} ago`;
          }
  
          if (timeDiff < secondsInDay * 1000) {
              const hoursAgo = Math.floor(timeDiff / 1000 / secondsInHour);
              return `${hoursAgo} hr${hoursAgo > 1 ? 's' : ''} ago`;
          }
  
          const currentYear = now.getFullYear();
          const dateObj = new Date(createdAt);
          const dateYear = dateObj.getFullYear();
  
          if (dateYear === currentYear) {
              const day = String(dateObj.getDate()).padStart(2, '0');
              const month = String(dateObj.getMonth() + 1).padStart(2, '0');
              return `${day}/${month}`;
          }
  
  
          const day = String(dateObj.getDate()).padStart(2, '0');
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const year = String(dateObj.getFullYear()).slice(2);
          return `${day}/${month}/${year}`;
      }
  
      const handleSelectChange = (checked: boolean) => {
          onSelect(id, checked);
        };
  
      return (
          <div className={`flex items-start gap-4 p-4 rounded-lg hover:bg-gray-200 transition-colors mb-2 ${isRead ? 'bg-white' : 'bg-blue-50'}`}>
              <Checkbox
                  checked={isSelected}
                  onCheckedChange={handleSelectChange}
                  className="mt-3 border-gray-400 checkmark"
              />
              <Avatar className="h-10 w-10">
                  <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${name}`} alt={name} />
                  <AvatarFallback>{name.charAt(0)}</AvatarFallback>
              </Avatar>
  
              <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                      <div className="font-medium text-gray-800">{name}</div>
                      <div className="text-sm text-gray-600">{formatDate(createdAt)}</div>
                  </div>
                  <div className="text-sm font-medium text-gray-700 mb-1">{topic}</div>
                  <div className="text-sm text-gray-700 line-clamp-2">
                      {message}
                  </div>
              </div>
          </div>
      )
  }
  
  export default MessageCard
  
  
