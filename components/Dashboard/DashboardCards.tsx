"use client"

import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Users, MessageCircleMore, FolderGit2,  } from 'lucide-react'

interface UserCardProps {
  type: string;
  count: number;
  icon: "users" | "message" | "projects" | "staff";
}

const iconMap = {
  "users": Users,
  "message": MessageCircleMore ,
  "projects": FolderGit2,
  "staff": Users
}

const UserCard = ({ type, icon, count,  }: UserCardProps) => {
  const Icon = iconMap[icon];
  return (
    <Card className="w-full mb-2 text-black-100 bg-white border-[#cee8ff]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {type}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {count}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCard;


