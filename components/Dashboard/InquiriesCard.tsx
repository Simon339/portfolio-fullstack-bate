/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@heroui/react";
import { Checkbox } from '@/components/ui/checkbox';


interface ServiceInquiry {
    id: string;
    name: string;
    companyName: string;
    service: string;
    createdAt: Date;
    isSelected?: boolean;
    isRead?: boolean;
    onSelect: (id: string, checked: boolean) => void;
    onToggleRead: (id: string) => void;
}


const InquiriesCard = ({ id, name, companyName, service, createdAt, isSelected,  onSelect, }: ServiceInquiry) => {
    function formatDate(createdAt: Date) {
          if (!createdAt) return '';
          const now = new Date();
          const timeDiff = now.getTime() - createdAt.getTime();
          const secondsInMinute = 60;
          const secondsInHour = 60 * secondsInMinute;
          const secondsInDay = 24 * secondsInHour;
  
  
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
        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-200 transition-colors mb-1 bg-blue-50">
            <Checkbox
                checked={isSelected}
                onCheckedChange={handleSelectChange}
                className="mb-4 border-gray-400 checkmark"
                onClick={(e) => e.stopPropagation()}
            />
            <Badge color="danger" shape="circle" showOutline={false}>
                <Avatar className="h-14 text-white w-14">
                    <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${name}`} alt="Avatar" />
                    <AvatarFallback>{name.slice(0, 2) || ''}</AvatarFallback>
                </Avatar>
            </Badge>
            <div className="ml-2 space-y-1">
                <p className="text-sm font-medium leading-none">{companyName}</p>
                <p className="text-sm text-muted-foreground">{name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge color='secondary' shape="circle" showOutline={false} className="text-xs">
                        {service}
                    </Badge>
                    <span>·</span>
                    <span>Joined {formatDate(createdAt)}</span>
                </div>

            </div>
        </div>
    )
}

export default InquiriesCard
