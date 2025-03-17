/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UploadIcon, Calendar, Shield, Clock, Key, Trash2 } from "lucide-react";
import { SettingsSchema } from "@/types";
import FieldDialog from '../modals/FieldDialog';
import { getCurrentUser } from '@/hooks/getcurrectuser';
import { Badge } from "@/components/ui/badge";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useRouter } from "next/navigation";
import { toast } from 'sonner';
import { requestAccountDeletion } from '@/server/actions/settings';

type User = {
  name: string
  surname: string
  email: string
  phone: string
  role: "USER" | "ADMIN"
  image: string
  country: string
  status: "PENDING" | "REJECTED" | "APPROVED"
  lastActivityDate: string
  createdAt: Date
}

const UserManagement = () => {
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<User | null>(null)
  const { user, loading: userLoading } = getCurrentUser()
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!userLoading && user) {
      setUserData({
        name: user.name || "Enter your Name",
        surname: user.surname || "Enter your Surname",
        email: user.email || "Enter your Email",
        phone: user.phone || "Enter your Cellphone",
        role: user.role || "USER",
        image: user.image || "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg",
        country: user.country || "",
        status: user.status || "PENDING",
        lastActivityDate: user.lastActivityDate || "No Data",
        createdAt: user.createdAt,
      })
      setLoading(false)
    } else if (!userLoading && !user) {
      setLoading(false)
    }
  }, [user, userLoading])

  const handleFieldUpdate = (field: keyof User) => (value: string) => {
    setUserData((prev) => (prev ? { ...prev, [field]: value } : null))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const result = SettingsSchema.shape.image.safeParse(file)
      if (result.success) {
        setUserData((prev) => (prev ? { ...prev, image: URL.createObjectURL(file) } : null))
      } else {
        alert(result.error.errors[0].message)
      }
    }
  }

  const handleDeleteAccount = async () => {
    setIsSubmitting(true)
    try {
      const result = await requestAccountDeletion(userData.id)

      if (result.success) {
        toast("Account deleted", {
          description: "Your account has been deleted successfully.",
        })
        // Redirect to login page
        router.push("/auth")
      } else {
        toast("Deletion failed", {
          description: result.message || "There was an error deleting your account.",
        })
      }
    } catch (error) {
      toast("Deletion failed", {
        description: "There was an error deleting your account.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTwoFactorToggle = () => {
    setTwoFactorEnabled(!twoFactorEnabled)
    console.log("Two-factor authentication toggled:", !twoFactorEnabled)
  }

  if (loading || userLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!userData) {
    return <div className="text-center text-2xl text-gray-600 mt-10">No user data available. Please log in.</div>
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-500"
      case "PENDING":
        return "bg-yellow-500"
      case "REJECTED":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card className="w-full mx-auto bg-transparent border-none text-gray-800 p-3">
      <CardHeader>
        <CardTitle className="text-center text-xl font-bold">User Profile Settings</CardTitle>
        <CardDescription className="text-center text-gray-600">Manage your Profile</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 flex flex-col items-center space-y-4 mb-6 md:mb-0">
            <Avatar className="w-40 h-40 border-4 border-white shadow-lg">
              <AvatarImage src={userData.image} alt={`${userData.name} ${userData.surname}`} />
              <AvatarFallback className="text-4xl">
                {userData.name[0]}
                {userData.surname[0]}
              </AvatarFallback>
            </Avatar>
            <div className="relative">
              <input
                type="file"
                id="imageUpload"
                className="hidden"
                onChange={handleImageUpload}
                accept="image/jpeg,image/png,image/webp"
              />
              <Button asChild className="bg-blue-500 text-white hover:bg-blue-600 transition duration-200">
                <label htmlFor="imageUpload" className="cursor-pointer flex items-center">
                  <UploadIcon className="mr-2 h-4 w-4" /> Change Picture
                </label>
              </Button>
            </div>
            <Badge
              className={`${getStatusColor(userData.status)} text-white px-3 py-1 rounded-full text-sm font-semibold`}
            >
              {userData.status}
            </Badge>
          </div>
          <div className="md:w-2/3 md:pl-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(["name", "surname", "email", "phone", "country"] as (keyof User)[]).map((field) => (
                <div key={field} className="flex flex-col space-y-1">
                  <span className="text-sm font-medium text-gray-500">
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">{userData[field]}</span>
                    <FieldDialog
                      title={field.charAt(0).toUpperCase() + field.slice(1)}
                      fieldName={field}
                      currentValue={userData[field] || ""}
                      onUpdate={handleFieldUpdate(field)}
                      userId={user?.id || 0}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between text-gray-600">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span className="font-medium">Role:</span>
                </div>
                <span>{userData.role}</span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span className="font-medium">Joined:</span>
                </div>
                <span>{new Date(userData.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span className="font-medium">Last Active:</span>
                </div>
                <span>{userData.lastActivityDate}</span>
              </div>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-2">
                  <Key className="h-5 w-5 text-gray-600" />
                  <Label htmlFor="two-factor" className="text-sm font-medium text-gray-700">
                    Two-Factor Authentication
                  </Label>
                </div>
                <Switch id="two-factor" checked={twoFactorEnabled} onCheckedChange={handleTwoFactorToggle} />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 p-6 flex flex-col space-y-4">
        <Button variant="destructive" className="w-full" onClick={handleDeleteAccount}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Account
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UserManagement;