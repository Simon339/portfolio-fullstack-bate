import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge, Chip } from "@heroui/react";
import { format } from 'date-fns';

interface RecentUsersProps {
    id: number;
    name: string;
    surname: string;
    image: string;
    email: string;
    role: "USER" | "SUPER_USER" | "ADMIN";
    status?: 'Verified' | 'Not Verified';
    color?: string;
    createdAt: Date;
}

const roleColor = {
    USER: 'warning',
    SUPER_USER: 'success',
    ADMIN: 'success',
    default: 'secondary',
  }


const Userlist = ({ image, name, surname, role, email, createdAt, status, color, id }: RecentUsersProps) => {
    const chipColor = status === 'Verified' ? 'success' : 'warning';
    const getRoleColor = (role: "USER" | "SUPER_USER" | "ADMIN") => {
        return roleColor[role] || roleColor.default;
    };

    return (
        <div className="space-y-4 p-2 max-h-[250px] w-full">
            <div key={id} className="flex items-center gap-4 pb-2 w-full">
                <Badge color="danger" shape="circle" showOutline={false}>
                    <Avatar className="h-14 text-white w-14">
                        <AvatarImage src={image || `https://api.dicebear.com/6.x/initials/svg?seed=${name}`} alt="Avatar" />
                        <AvatarFallback>{name.slice(0, 2) || `https://api.dicebear.com/6.x/initials/svg?seed=${name}`}</AvatarFallback>
                    </Avatar>
                </Badge>
                <div className="ml-4 space-y-1">
                    <p className="text-sm font-thin leading-none">{name} {surname}</p>
                    <p className="text-sm text-muted-foreground">{email}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Chip  size="sm" variant="flat" color={getRoleColor(role)} className="text-xs">
                            {role}
                        </Chip>
                        <span>·</span>
                        <span>{format(new Date(createdAt), 'MMM d, yyyy')}</span>
                        
                    </div>
                </div>
                <div className={`ml-auto font-medium ${color === 'green' ? 'text-green-500' : 'text-orange-500'}`}>
                    <Chip className="capitalize" color={chipColor} size="sm" variant="flat">
                        {status}
                    </Chip>
                </div>
            </div>
        </div>
    );
};

export default Userlist;
