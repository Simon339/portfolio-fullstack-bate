/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  User,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Mail,
  Phone,
  MapPin,
  AlertTriangle,
  Pencil,
  Trash2,
  Upload,
  Loader2,
} from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/hooks/getcurrectuser"
import CountrySelect from "./Countryselect"
import { toast } from "sonner"
import { requestAccountDeletion, Settings } from "@/server/actions/onboarding"

interface UserProfileProps {
  user: {
    name: string
    surname: string
    email: string
    phone: string
    role: "USER" | "ADMIN"
    image: string
    country: string
    status: "Verified" | "Not Verified"
    approvalStatus: "PENDING" | "REJECTED" | "APPROVED"
    lastActivityDate: string
    createdAt: Date
  } | null
}

const UserProfile = ({ user }: UserProfileProps) => {
  const { user: currentUser, loading: userLoading } = getCurrentUser()
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSendingVerification, setIsSendingVerification] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    surname: user?.surname || "",
    phone: user?.phone || "",
    country: user?.country || "",
    email: user?.email || "",
  })
  const [newImage, setNewImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.image || null)
  const router = useRouter()

  useEffect(() => {
    if (!userLoading && currentUser) {
      setFormData({
        name: currentUser.name || "",
        surname: currentUser.surname || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        country: currentUser.country || "",
      })
      setPreviewUrl(currentUser.image || null)
      setLoading(false)
    } else if (!userLoading && !currentUser) {
      setLoading(false)
    }
  }, [currentUser, userLoading])

  if (!currentUser) {
    return (
      <Card className="w-full h-full mx-auto bg-slate-50 border-[#acc2ef] text-gray-800 rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-center text-xl font-medium">User Profile</CardTitle>
          <CardDescription className="text-center text-gray-500">
            Your profile information could not be loaded
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <p className="text-gray-500">Please try again later or contact support</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCountryChange = (countryCode: string) => {
    setFormData((prev) => ({ ...prev, country: countryCode }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setNewImage(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formDataToSend = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value)
      })

      if (newImage) {
        formDataToSend.append("image", newImage)
      }

      // Extract values from FormData and construct the expected object
      const settingsData = {
        email: formDataToSend.get("email") as string,
        name: formDataToSend.get("name") as string,
        surname: formDataToSend.get("surname") as string,
        phone: formDataToSend.get("phone") as string,
        role: currentUser.role, // Assuming role is already available in currentUser
        image: newImage || undefined, // Pass the image file if it exists
      }

      const result = await Settings(settingsData)

      if (result.success) {
        toast("Profile updated", {
          description: "Your profile information has been updated successfully.",
        })
        setIsEditing(false)
        // Refresh the page to show updated data
        router.refresh()
      } else {
        toast("Update failed", {
          description: result.message || "There was an error updating your profile.",
        })
      }
    } catch (error) {
      toast("Update failed", {
        description: "There was an error updating your profile.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsSubmitting(true)

    try {
      const result = await requestAccountDeletion(currentUser.id)

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

  const handleSendVerification = async () => {
    setIsSendingVerification(true)
    try {
      // Call your verification email server action here
      // Example: await sendVerificationEmail(currentUser.email)
      toast("Verification email sent", {
        description: "Please check your inbox for the verification link.",
      })
    } catch (error) {
      toast("Failed to send verification", {
        description: "There was an error sending the verification email.",
      })
    } finally {
      setIsSendingVerification(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-[#e0ebff] text-[#3b82f6] hover:bg-[#d0e1ff] border-[#acc2ef]">Approved</Badge>
      case "REJECTED":
        return <Badge className="bg-[#fee2e2] text-[#ef4444] hover:bg-[#fecaca] border-[#fca5a5]">Rejected</Badge>
      case "PENDING":
      default:
        return <Badge className="bg-[#fef9c3] text-[#ca8a04] hover:bg-[#fef08a] border-[#fde047]">Pending</Badge>
    }
  }

  const getInitials = (name: string, surname: string) => {
    return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase()
  }

  const formatDate = (date: Date | string | undefined) => {
    return date ? format(new Date(date), "PPP") : "N/A"
  }

  return (
    <div className="space-y-6 bg-slate-50 p-6 rounded-xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-medium tracking-tight text-gray-800 text-center">Profile</h1>
          <p className="text-gray-500 text-center">Manage your account settings and profile information</p>
        </div>
        <div className="flex items-center gap-2">
          {currentUser.approvalStatus !== "APPROVED" && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#fef9c3] border border-[#fde047] rounded-md text-[#ca8a04]">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Account pending approval</span>
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100 border-[#acc2ef]">
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-white data-[state=active]:text-gray-800 data-[state=active]:shadow-sm"
          >
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="account"
            className="data-[state=active]:bg-white data-[state=active]:text-gray-800 data-[state=active]:shadow-sm"
          >
            Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="border-[#acc2ef] bg-white shadow-sm rounded-xl">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-gray-800">Personal Information</CardTitle>
                  <CardDescription className="text-gray-500">
                    Update your personal details and contact information
                  </CardDescription>
                </div>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="gap-1 bg-gray-50 border-[#acc2ef] hover:bg-gray-100 text-gray-700"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-20 w-20 md:h-24 md:w-24 border-2 border-[#acc2ef]">
                        <AvatarImage
                          src={
                            previewUrl ||
                            `https://api.dicebear.com/6.x/initials/svg?seed=${getInitials(currentUser.name || "", currentUser.surname || "")}`
                          }
                          alt={currentUser.name || "User"}
                        />
                        <AvatarFallback className="text-lg bg-[#e0ebff] text-[#3b82f6]">
                          {getInitials(currentUser.name, currentUser.surname)}
                        </AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <div className="absolute -bottom-2 -right-2">
                          <label htmlFor="profile-image" className="cursor-pointer">
                            <div className="h-8 w-8 bg-[#3b82f6] text-white rounded-full flex items-center justify-center shadow-md">
                              <Upload className="h-4 w-4" />
                            </div>
                            <input
                              id="profile-image"
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handleImageChange}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-gray-800">
                        {currentUser.name} {currentUser.surname}
                      </p>
                      <p className="text-sm text-gray-500">{currentUser.email}</p>
                    </div>
                    <div className="flex items-center gap-2">{getStatusBadge(currentUser.status)}</div>
                  </div>

                  <div className="flex-1 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-700">
                          First Name
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="Enter your first name"
                          className="bg-slate-50 border-[#acc2ef] focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="surname" className="text-gray-700">
                          Last Name
                        </Label>
                        <Input
                          id="surname"
                          name="surname"
                          value={formData.surname}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="Enter your last name"
                          className="bg-slate-50 border-[#acc2ef] focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700">
                          Email
                        </Label>
                        <div className="relative">
                          <Input
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="Enter your email"
                            type="email"
                            className="bg-slate-50 border-[#acc2ef] focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                          />
                          {currentUser.emailVerified ? (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                              <CheckCircle className="h-4 w-4" />
                            </div>
                          ) : (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500">
                              <XCircle className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-gray-700">
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="Enter your phone number"
                          className="bg-slate-50 border-[#acc2ef] focus:border-[#3b82f6] focus:ring-[#3b82f6]"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="country" className="text-gray-700">
                          Country
                        </Label>
                        <CountrySelect
                          value={formData.country}
                          onValueChange={handleCountryChange}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex justify-end gap-2 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false)
                            setFormData({
                              name: currentUser.name,
                              surname: currentUser.surname,
                              phone: currentUser.phone,
                              country: currentUser.country,
                              email: currentUser.email,
                            })
                            setPreviewUrl(currentUser.image)
                            setNewImage(null)
                          }}
                          className="bg-slate-50 border-[#acc2ef] hover:bg-slate-100 text-gray-700"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="bg-[#3b82f6] hover:bg-[#2563eb] text-white"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </form>

              <div className="flex flex-col items-center border-b p-4 my-6 border-[#acc2ef]">
                <h1 className="text-2xl font-semibold leading-none tracking-tight text-center text-gray-800">
                  Account Information
                </h1>
                <h2 className="text-sm items-center justify-center text-center text-gray-500">
                  View your account details and status
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-[#acc2ef]" />
                    <span className="text-sm font-medium text-gray-700">Account Status</span>
                    <div className="ml-auto">{getStatusBadge(currentUser.status)}</div>
                  </div>
                  <Separator className="bg-slate-200" />
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[#acc2ef]" />
                    <span className="text-sm font-medium text-gray-700">Email Verification</span>
                    <div className="ml-auto">
                      {currentUser.emailVerified ? (
                        <Badge className="bg-[#e0ebff] text-[#3b82f6] hover:bg-[#d0e1ff] border-[#acc2ef]">
                          Verified
                        </Badge>
                      ) : (
                        <Badge className="bg-[#fef9c3] text-[#ca8a04] hover:bg-[#fef08a] border-[#fde047]">
                          Not Verified
                        </Badge>
                      )}
                      {!currentUser.emailVerified && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSendVerification}
                          disabled={isSendingVerification}
                          className="ml-2 h-7 text-xs bg-slate-50 border-[#acc2ef] hover:bg-slate-100"
                        >
                          {isSendingVerification ? (
                            <>
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            "Verify"
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                  <Separator className="bg-slate-200" />
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[#acc2ef]" />
                    <span className="text-sm font-medium text-gray-700">Phone</span>
                    <span className="ml-auto text-sm text-gray-600">{currentUser.phone}</span>
                  </div>
                  <Separator className="bg-slate-200" />
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-[#acc2ef]" />
                    <span className="text-sm font-medium text-gray-700">Country</span>
                    <span className="ml-auto text-sm text-gray-600">{currentUser.country}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#acc2ef]" />
                    <span className="text-sm font-medium text-gray-700">Last Activity</span>
                    <span className="ml-auto text-sm text-slate-600">{formatDate(currentUser.lastActivityDate)}</span>
                  </div>
                  <Separator className="bg-slate-200" />
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#acc2ef]" />
                    <span className="text-sm font-medium text-gray-700">Account Created</span>
                    <span className="ml-auto text-sm text-gray-600">{formatDate(currentUser.createdAt)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card className="border-[#acc2ef] bg-white shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-gray-800">Account Settings</CardTitle>
              <CardDescription className="text-gray-500">Manage your account settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-800">Email Preferences</h3>
                <p className="text-sm text-gray-500">Manage your email notification preferences</p>
                {/* Email preferences would go here */}
              </div>

              <Separator className="bg-slate-200" />

              <div className="space-y-2">
                <h3 className="text-lg font-medium text-red-500">Danger Zone</h3>
                <p className="text-sm text-gray-500">Permanently delete your account and all of your data</p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="mt-2 gap-2 bg-red-50 border-red-200 hover:bg-red-100 text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-white border-[#acc2ef] rounded-xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-gray-800">Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription className="text-gray-500">
                        This action cannot be undone. This will permanently delete your account and remove all of your
                        data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-slate-50 border-[#acc2ef] hover:bg-slate-100 text-gray-700">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-red-500 text-white hover:bg-red-600"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          "Delete Account"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default UserProfile


