/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, Clock, Trash2, XCircle, Globe, Shield, Users, Key, Mail, Calendar, Monitor, Smartphone, Eye, EyeOff, Ban, UserX, RefreshCw, UserCog, Loader2, LogOut, UserMinus } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import EditableField from "./forms/EditableField"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import Activities from "./activities"
import { toast } from "sonner"
import { getUserAuditLogs } from "@/server/data/alldata"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { ScrollArea } from "../ui/scroll-area"
import { Badge } from "../ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { banUser, deleteUser, impersonateUser, revokeAllUserSessions, revokeUserSession, stopImpersonating, unbanUser, updateUserRole, updateUserEmail, updateUserName } from "@/server/actions/user"
import { useRouter } from "next/navigation"

type User = {
  id: string
  name: string
  image: string
  email: string
  status: "Verified" | "Not Verified"
  role?: "user" | "admin" | "owner"
  twoFactorEnabled?: boolean
  banned: boolean
  banReason: string | null
  banExpires: Date | null
  createdAt: string
  updatedAt: Date
  emailVerified: boolean

  // Additional fields from comprehensive schema
  sessions?: {
    all: Array<{
      id: string
      expiresAt: Date
      ipAddress: string | null
      userAgent: string | null
      createdAt: Date
      impersonatedBy: string | null
    }>
    current: any | null
    stats: {
      total: number
      active: number
    }
  }

  accounts?: Array<{
    id: string
    providerId: string
    accountId: string
    password: string | null | boolean
    createdAt: Date
    scope: string | null
  }>


  activity?: {
    auditLogs: Array<{
      id: number
      action: string
      tableName: string
      recordId: string
      timestamp: Date
      ipAddress: string | null
      userAgent: string | null
      details: any
    }>
    stats: {
      totalActions: number
      lastActive: Date
    }
  }

  stats?: {
    sessionCount: number
    activeSessionCount: number
    linkedAccountCount: number
    auditLogCount: number
    lastActive: Date
  }

  verification?: {
    email: boolean
    accounts: boolean
  }

}

interface UserDetailProps {
  user: User
  onUserUpdate?: (user: User) => void
  onUserDelete?: (userId: string) => void
}

const roleColor: Record<"user" | "admin" | "owner" | "default", "warning" | "success" | "secondary"> = {
  user: "warning",
  admin: "success",
  owner: "success",
  default: "secondary",
}

const providerColors: Record<string, string> = {
  google: "bg-red-50 text-red-700 border-red-200",
  github: "bg-gray-50 text-gray-700 border-gray-200",
  email: "bg-blue-50 text-blue-700 border-blue-200",
  facebook: "bg-blue-50 text-blue-700 border-blue-200",
  twitter: "bg-sky-50 text-sky-700 border-sky-200",
  default: "bg-gray-50 text-gray-700 border-gray-200",
}

const UserDetails = ({ user, onUserUpdate, onUserDelete }: UserDetailProps) => {
  const [currentUser, setCurrentUser] = useState<User>(user)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [auditLogs, setAuditLogs] = useState<any[]>(user.activity?.auditLogs || [])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [banDialogOpen, setBanDialogOpen] = useState(false)
  const [banReason, setBanReason] = useState("")
  const [banDuration, setBanDuration] = useState("permanent")
  const [isBanning, setIsBanning] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        setIsLoading(true)
        const logs = await getUserAuditLogs(user.id)
        setAuditLogs(logs)
      } catch (error) {
        console.error("Failed to fetch audit logs:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (!user.activity?.auditLogs) {
      fetchAuditLogs()
    }
  }, [user.id, user.activity?.auditLogs])

  const handleRoleChange = async (newRole: "user" | "admin" | "owner") => {
  try {
    // Call the server action to update user role
    const result = await updateUserRole(currentUser.id, newRole)
    
    if (!result.success) {
      toast.error(result.error || "Failed to update role")
      return
    }

    // Success - update local state
    setCurrentUser((prevUser) => ({ ...prevUser, role: newRole }))
    toast.success(result.message || "User role updated successfully")
  } catch (error) {
    console.error("Failed to update role:", error)
    toast.error(error instanceof Error ? error.message : "Failed to update role")
  }
}

  const handleEmailChange = async (newEmail: string) => {
    try {
      const result = await updateUserEmail(currentUser.id, newEmail)
      if (result.success) {
        setCurrentUser((prevUser) => ({ ...prevUser, email: newEmail }))
        toast.success("Email updated successfully")
      } else {
        toast.error(result.error || "Failed to update email")
      }
    } catch (error) {
      console.error("Failed to update email:", error)
      toast.error("Failed to update email")
    }
  }

  const handleNameChange = async (newName: string) => {
    try {
     const result = await updateUserName(currentUser.id, newName)
      if (result.success) {
        setCurrentUser((prevUser) => ({ ...prevUser, name: newName }))
        toast.success("Name updated successfully")
      } else {
        toast.error(result.error || "Failed to update name")
      }
    } catch (error) {
      console.error("Failed to update name:", error)
      toast.error("Failed to update name")
    }
  }

  const handlePermanentDelete = async () => {
    try {
      const formData = new FormData();
      formData.append("userId", currentUser.id);
      const result = await deleteUser(formData);

      // Check if the response indicates success
      if (result?.success === false) {
        toast.error(result.message || "Failed to delete user")
        return
      }

      // Success
      toast.success(result?.message || "User permanently deleted")

      // Redirect or handle deletion in parent
      router.push("/dashboard/users")

    } catch (error) {
      console.error("Failed to delete user:", error)
      toast.error("Failed to delete user")
    }
  }

  const handleRevokeSession = async (sessionId: string) => {
  try {
    // Find the session to revoke from currentUser.sessions data
    const sessionToRevoke = currentUser.sessions?.all?.find(s => s.id === sessionId)
    if (!sessionToRevoke) {
      toast.error("Session not found")
      return
    }

    // Call the server action to revoke the session
    const result = await revokeUserSession(sessionToRevoke.id)
    
    if (!result.success) {
      throw new Error(result.error)
    }

    // Update local state after successful API call
    if (currentUser.sessions) {
      const updatedSessions = {
        ...currentUser.sessions,
        all: currentUser.sessions.all.filter(s => s.id !== sessionId),
        stats: {
          ...currentUser.sessions.stats,
          total: currentUser.sessions.stats.total - 1,
          active: currentUser.sessions.stats.active - 1
        }
      }
      const updatedUser = { ...currentUser, sessions: updatedSessions }
      setCurrentUser(updatedUser)
      onUserUpdate?.(updatedUser)
    }
    toast.success(result.message || "Session revoked successfully")
  } catch (error) {
    console.error("Failed to revoke session:", error)
    toast.error(error instanceof Error ? error.message : "Failed to revoke session")
  }
}

const handleRevokeAllSessions = async () => {
  try {
    // Call the server action to revoke all sessions
    const result = await revokeAllUserSessions(currentUser.id)
    
    if (!result.success) {
      throw new Error(result.error)
    }

    // Update local state after successful API call
    if (currentUser.sessions) {
      const updatedSessions = {
        ...currentUser.sessions,
        all: [],
        stats: { total: 0, active: 0 }
      }
      const updatedUser = { ...currentUser, sessions: updatedSessions }
      setCurrentUser(updatedUser)
      onUserUpdate?.(updatedUser)
    }
    toast.success(result.message || "All sessions revoked successfully")
  } catch (error) {
    console.error("Failed to revoke sessions:", error)
    toast.error(error instanceof Error ? error.message : "Failed to revoke all sessions")
  }
}

  const handleRefreshLogs = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      // In a real app, this would fetch fresh audit logs
      toast.success("Activity logs refreshed")
    } catch (error) {
      console.error("Failed to refresh logs:", error)
      toast.error("Failed to refresh activity logs")
    } finally {
      setIsLoading(false)
    }
  }

  const isVerified = currentUser.status === "Verified"

  const getInitials = (name: string): string => {
    return `${name.charAt(0)}`.toUpperCase()
  }

  const initials = getInitials(currentUser.name)

  const getRoleColor = (role: 'admin' | 'user' | 'owner'): "warning" | "success" | "secondary" => {
    return roleColor[role] || "secondary"
  }

  const getProviderDisplayName = (providerId: string) => {
    const providerMap: Record<string, string> = {
      google: "Google",
      github: "GitHub",
      email: "Email/Password",
      facebook: "Facebook",
      twitter: "Twitter",
    }
    return providerMap[providerId] || providerId
  }

  const getDeviceType = (userAgent: string | null) => {
    if (!userAgent) return "Unknown"
    if (/mobile/i.test(userAgent)) return "Mobile"
    if (/tablet/i.test(userAgent)) return "Tablet"
    return "Desktop"
  }

  const getBrowser = (userAgent: string | null) => {
    if (!userAgent) return "Unknown"
    if (/chrome/i.test(userAgent)) return "Chrome"
    if (/firefox/i.test(userAgent)) return "Firefox"
    if (/safari/i.test(userAgent)) return "Safari"
    if (/edge/i.test(userAgent)) return "Edge"
    return "Unknown"
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-[#acc2ef] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border text-white border-[#acc2ef]">
            <AvatarImage
              src={currentUser.image || `https://api.dicebear.com/6.x/initials/svg?seed=${initials}`}
              alt={`${currentUser.name}`}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-medium text-gray-900">
              {currentUser.name}
            </h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge
                variant={currentUser.status === "Verified" ? "default" : "secondary"}
                className="flex items-center gap-1 text-xs font-normal"
              >
                {isVerified ? (
                  <>
                    <CheckCircle className="w-3 h-3" />
                    <span>Verified</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3" />
                    <span>Not Verified</span>
                  </>
                )}
              </Badge>

              {currentUser.banned ? (
                <Badge variant="destructive" className="text-xs">
                  <Ban className="w-3 h-3 mr-1" />
                  Banned
                  {currentUser.banReason && (
                    <span className="ml-1 text-xs opacity-80">
                      ({currentUser.banReason})
                    </span>
                  )}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  Active
                </Badge>
              )}

              {currentUser.sessions && (
                <Badge variant="outline" className="text-xs">
                  <Monitor className="w-3 h-3 mr-1" />
                  {currentUser.sessions.stats.active} Active
                </Badge>
              )}

              {currentUser.role && (
                <Badge
                  variant={currentUser.role === "admin" || currentUser.role === "owner" ? "default" : "secondary"}
                  className="text-xs capitalize"
                >
                  <Shield className="w-3 h-3 mr-1" />
                  {currentUser.role}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {currentUser.banned ? (
            <UnbanDialog userId={currentUser.id} userName={currentUser.name} />
          ) : (
            <BanDialog userId={currentUser.id} userName={currentUser.name}/>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-[#acc2ef] rounded-lg hover:bg-gray-50">
                <Trash2 className="w-4 h-4 mr-1 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Permanently delete user?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the user account and remove all associated
                  data including sessions, organizations memberships, and audit logs.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handlePermanentDelete} className="bg-red-600 hover:bg-red-700">
                  Delete Permanently
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <ImpersonateDialog userId={currentUser.id} userName={currentUser.name} />
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b border-[#acc2ef] bg-transparent px-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="p-6 space-y-6">
          {/* Ban Warning */}
          {currentUser.banned && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <Ban className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">User is Banned</h4>
                <p className="text-sm text-red-600">
                  {currentUser.banReason && `Reason: ${currentUser.banReason}`}
                  {currentUser.banExpires && (
                    <span className="block">
                      Expires: {format(new Date(currentUser.banExpires), "MMMM d, yyyy 'at' HH:mm")}
                    </span>
                  )}
                  {!currentUser.banExpires && <span className="block">Duration: Permanent</span>}
                </p>
              </div>
            </div>
          )}

          {/* Basic Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <EditableField
              label="Name"
              value={currentUser.name}
              onSave={handleNameChange}
            />

            <EditableField
              label="Email"
              value={currentUser.email}
              onSave={handleEmailChange}
            />

            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm text-gray-600 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Role
              </Label>
              <Select onValueChange={handleRoleChange} value={currentUser.role} disabled={isUpdatingStatus}>
                <SelectTrigger className="bg-white border-[#acc2ef]">
                  <SelectValue placeholder="Select a role" defaultValue={currentUser.role} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-gray-600 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Member Since
              </Label>
              <div className="h-10 px-3 py-2 text-sm bg-gray-50 border border-[#acc2ef] rounded-md flex items-center">
                {format(new Date(currentUser.createdAt), "MMMM d, yyyy")}
                <span className="text-gray-400 ml-2">
                  ({formatDistanceToNow(new Date(currentUser.createdAt), { addSuffix: true })})
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-gray-600 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Last Updated
              </Label>
              <div className="h-10 px-3 py-2 text-sm bg-gray-50 border border-[#acc2ef] rounded-md flex items-center">
                {format(new Date(currentUser.updatedAt), "MMMM d, yyyy")}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-gray-600 flex items-center gap-2">
                <Key className="w-4 h-4" />
                User ID
              </Label>
              <div className="h-10 px-3 py-2 text-sm bg-gray-50 border border-[#acc2ef] rounded-md flex items-center font-mono text-xs">
                {currentUser.id}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg font-semibold">
                  {currentUser.sessions?.stats.total || 0}
                </CardTitle>
                <CardDescription className="text-xs">Total Sessions</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-sm text-green-600 flex items-center gap-1">
                  {currentUser.sessions?.stats.active || 0} <Eye className="w-3 h-3" /> active
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg font-semibold">
                  {currentUser.accounts?.length || 0}
                </CardTitle>
                <CardDescription className="text-xs">Linked Accounts</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-sm text-purple-600 flex items-center gap-1">
                  <Key className="w-3 h-3" /> providers
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg font-semibold">
                  {currentUser.activity?.stats.totalActions || auditLogs.length || 0}
                </CardTitle>
                <CardDescription className="text-xs">Total Actions</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-sm text-orange-600 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> tracked
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  {currentUser.twoFactorEnabled ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-400" />
                  )}
                </CardTitle>
                <CardDescription className="text-xs">2FA Status</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className={`text-sm flex items-center gap-1 ${currentUser.twoFactorEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                  <Shield className="w-3 h-3" /> {currentUser.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Linked Accounts Preview */}
          {currentUser.accounts && currentUser.accounts.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Linked Accounts
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {currentUser.accounts.map((account) => (
                  <div key={account.id} className={`flex items-center gap-3 p-3 border rounded-md ${providerColors[account.providerId] || providerColors.default}`}>
                    <Globe className="w-5 h-5" />
                    <div>
                      <div className="font-medium">{getProviderDisplayName(account.providerId)}</div>
                      <div className="text-xs opacity-70">
                        Connected {formatDistanceToNow(new Date(account.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="p-6 space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Authentication & Security</h3>


          {/* Verification Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Verification Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${currentUser.emailVerified ? 'bg-green-100' : 'bg-red-100'}`}>
                    <Mail className={`w-4 h-4 ${currentUser.emailVerified ? 'text-green-600' : 'text-red-600'}`} />
                  </div>
                  <div>
                    <div className="font-medium">Email Verification</div>
                    <div className="text-sm text-gray-500">{currentUser.email}</div>
                  </div>
                </div>
                <Badge variant={currentUser.emailVerified ? "default" : "destructive"}>
                  {currentUser.emailVerified ? "Verified" : "Pending"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${currentUser.accounts?.some(acc => acc.password) ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <Key className={`w-4 h-4 ${currentUser.accounts?.some(acc => acc.password) ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <div className="font-medium">Password Authentication</div>
                    <div className="text-sm text-gray-500">{currentUser.accounts?.some(acc => acc.password) ? 'Password set' : 'No password (OAuth only)'}</div>
                  </div>
                </div>
                <Badge variant={currentUser.accounts?.some(acc => acc.password) ? "default" : "outline"}>
                  {currentUser.accounts?.some(acc => acc.password) ? "Enabled" : "Not Set"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${currentUser.twoFactorEnabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <Shield className={`w-4 h-4 ${currentUser.twoFactorEnabled ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <div className="font-medium">Two-Factor Authentication</div>
                    <div className="text-sm text-gray-500">{currentUser.twoFactorEnabled ? 'Enabled' : 'Not enabled'}</div>
                  </div>
                </div>
                <Badge variant={currentUser.twoFactorEnabled ? "default" : "outline"}>
                  {currentUser.twoFactorEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Linked Accounts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Linked Authentication Providers</CardTitle>
              <CardDescription>External accounts connected to this user</CardDescription>
            </CardHeader>
            <CardContent>
              {currentUser.accounts && currentUser.accounts.length > 0 ? (
                <div className="space-y-3">
                  {currentUser.accounts.map((account) => (
                    <div key={account.id} className="flex items-center justify-between p-3 border border-[#acc2ef] rounded-md">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${providerColors[account.providerId] || providerColors.default}`}>
                          <Globe className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium">{getProviderDisplayName(account.providerId)}</div>
                          <div className="text-xs text-gray-500">
                            ID: {account.accountId} • Connected {formatDistanceToNow(new Date(account.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {account.scope ? account.scope.split(' ').length + ' scopes' : 'No scopes'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No linked authentication providers</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Session Management</h3>
            {currentUser.sessions && currentUser.sessions.all.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                    <XCircle className="w-4 h-4 mr-1" />
                    Revoke All Sessions
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Revoke All Sessions?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will log the user out of all devices. They will need to log in again.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRevokeAllSessions} className="bg-red-600 hover:bg-red-700">
                      Revoke All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          {currentUser.sessions && currentUser.sessions.all.length > 0 ? (
            <ScrollArea className="h-[400px] w-full rounded-md border border-[#acc2ef]">
              <div className="p-4 space-y-3">
                {currentUser.sessions.all.map((session) => {
                  const isActive = new Date(session.expiresAt) > new Date()
                  const isCurrent = currentUser.sessions?.current?.id === session.id

                  return (
                    <div key={session.id} className={`flex items-center justify-between p-4 border rounded-md ${isCurrent ? 'border-blue-300 bg-blue-50' : 'border-[#acc2ef]'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getDeviceType(session.userAgent) === 'Mobile' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          {getDeviceType(session.userAgent) === 'Mobile' ? (
                            <Smartphone className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Monitor className="w-4 h-4 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-sm flex items-center gap-2">
                            {getBrowser(session.userAgent)} on {getDeviceType(session.userAgent)}
                            {isCurrent && <Badge variant="default" className="text-xs">Current</Badge>}
                          </div>
                          <div className="text-xs text-gray-500 space-y-1">
                            <div>IP: {session.ipAddress || 'Unknown'}</div>
                            <div>Created: {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}</div>
                            <div>Expires: {format(new Date(session.expiresAt), 'MMM d, yyyy HH:mm')}</div>
                            {session.impersonatedBy && (
                              <div className="text-orange-600">
                                Impersonated by: {session.impersonatedBy}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={isActive ? "default" : "outline"}>
                          {isActive ? "Active" : "Expired"}
                        </Badge>
                        {isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRevokeSession(session.id)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            Revoke
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-12 border border-[#acc2ef] rounded-md">
              <Monitor className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Sessions Found</h3>
              <p className="text-gray-500">This user has no active sessions.</p>
            </div>
          )}
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Activity Timeline</h3>
              <Button variant="outline" size="sm" onClick={handleRefreshLogs} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <p className="mt-2 text-gray-500">Loading activities...</p>
              </div>
            ) : auditLogs.length > 0 ? (
              <ScrollArea className="h-[500px] w-full rounded-md border border-[#acc2ef] p-4">
                <Activities auditLogs={auditLogs} />
              </ScrollArea>
            ) : (
              <div className="text-center py-12 border border-[#acc2ef] rounded-md">
                <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Activity Found</h3>
                <p className="text-gray-500">No audit logs available for this user.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

const ImpersonateDialog = ({ userId, userName }: { userId: string; userName: string }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isImpersonating, setIsImpersonating] = useState(false)
  const router = useRouter();

  // Check if currently impersonating
  useEffect(() => {
    const checkImpersonation = () => {
      const impersonating = sessionStorage.getItem('isImpersonating') === 'true'
      setIsImpersonating(impersonating)
    }

    checkImpersonation()

    // Listen for storage changes
    window.addEventListener('storage', checkImpersonation)
    return () => window.removeEventListener('storage', checkImpersonation)
  }, [])

  const handleImpersonate = async () => {
    setIsSubmitting(true)
    try {

      const result = await impersonateUser(userId);
      
      if (result.error) {
        throw new Error(result.error || 'Failed to impersonate user')
      }

      toast.success(`Now impersonating ${userName}`)

      // Store impersonation state
      sessionStorage.setItem('isImpersonating', 'true')
      sessionStorage.setItem('impersonatedUserId', userId)

      // Close dialog
      setIsOpen(false)

      // Redirect to home page
      router.push('/')
      router.refresh()

    } catch (error) {
      console.error('Impersonation error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to impersonate user')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStopImpersonating = async () => {
    setIsSubmitting(true)
    try {
      const result = await stopImpersonating();

      if (result.error) {
        throw new Error(result.error || 'Failed to stop impersonation')
      }

      // Clear impersonation state
      sessionStorage.removeItem('isImpersonating')
      sessionStorage.removeItem('impersonatedUserId')

      toast.success('Stopped impersonating user')

      // Close dialog
      setIsOpen(false)

      // Redirect to users page
      router.push('/dashboard/users')
      router.refresh()

    } catch (error) {
      console.error('Stop impersonation error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to stop impersonation')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="cursor-pointer flex items-center gap-2">
          {isImpersonating ? (
            <UserMinus className="w-4 h-4 mr-1" />
          ) : (
            <UserCog className="w-4 h-4 mr-1" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[458px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {isImpersonating ? 'Stop Impersonating' : 'Impersonate User'}
          </DialogTitle>
          <DialogDescription>
            {isImpersonating
              ? `Are you sure you want to stop impersonating and return to your admin account?`
              : `Are you sure you want to start impersonating ${userName}?`
            }
            {isImpersonating
              ? ''
              : <span className="text-xs italic font-medium text-amber-800">  Warning: This action will be audited</span>
            }
          </DialogDescription>
        </DialogHeader>

        {isImpersonating && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-md">
            <p className="text-xs text-yellow-600 text-center">
              You are currently impersonating a user. Stopping will return you to your admin account.
            </p>
          </div>
        )}

        <div className="flex gap-3 justify-end mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={isImpersonating ? handleStopImpersonating : handleImpersonate}
            disabled={isSubmitting}
            className={isImpersonating
              ? 'bg-yellow-600 hover:bg-yellow-700'
              : 'bg-purple hover:bg-purple/30'
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isImpersonating ? 'Stopping...' : 'Impersonating...'}
              </>
            ) : (
              isImpersonating ? (
                <>
                  <LogOut className="w-4 h-4 mr-2" />
                  Stop Impersonating
                </>
              ) : (
                'Confirm Impersonate'
              )
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
const BanSchema = z.object({
  banReason: z.string().min(1, 'Ban reason is required'),
  banExpiresIn: z.string().min(1, "Ban duration is required"),
})

const BanDialog = ({ userId, userName }: { userId: string; userName: string }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<z.infer<typeof BanSchema>>({
    resolver: zodResolver(BanSchema),
    defaultValues: {
      banReason: "",
      banExpiresIn: "7days",
    },
  })

  const resetForm = () => {
    form.reset({
      banReason: "",
      banExpiresIn: "7days",
    })
  }

  const getBanExpiresInSeconds = (duration: string): number | undefined => {
    const durationMap: Record<string, number | undefined> = {
      "1day": 60 * 60 * 24,
      "7days": 60 * 60 * 24 * 7,
      "30days": 60 * 60 * 24 * 30,
      "permanent": undefined,
    }
    return durationMap[duration]
  }

  const onSubmit = async (values: z.infer<typeof BanSchema>) => {
    setIsSubmitting(true)
    try {
      const banExpiresIn = getBanExpiresInSeconds(values.banExpiresIn)
      await banUser(userId, values.banReason, banExpiresIn)
      setIsOpen(false)
      resetForm()
      toast.success('User banned successfully')
    } catch (error) {
      toast.error('Failed to ban user')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="cursor-pointer flex items-center gap-2 text-orange-600 focus:text-orange-600">
          <Ban className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[458px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            Ban User - {userName}
          </DialogTitle>
          <DialogDescription>
            Enter the reason and duration for banning this user.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="banReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason:</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter the reason for banning this user" {...field} className="w-full" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="banExpiresIn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ban Duration:</FormLabel>
                  <FormControl>
                    <select 
                      {...field} 
                      className="w-full p-2 rounded border border-gray-300 bg-white"
                    >
                      <option value="1day">1 Day</option>
                      <option value="7days">7 Days</option>
                      <option value="30days">30 Days</option>
                      <option value="permanent">Permanent</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isSubmitting ? "Banning..." : "Ban User"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

const UnbanDialog = ({ userId, userName, }: { userId: string; userName: string; }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleUnban = async () => {
    setIsSubmitting(true)
    try {
      await unbanUser(userId)
      setIsOpen(false)
      toast.success(`${userName} has been unbanned successfully`)
    } catch (error) {
      toast.error('Failed to unban user')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="cursor-pointer flex items-center gap-2 text-green-600 focus:text-green-600">
          <CheckCircle className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Unban User</DialogTitle>
          <DialogDescription>
            Are you sure you want to unban {userName}?
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-3 justify-end mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleUnban}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? "Unbanning..." : "Confirm Unban"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default UserDetails
