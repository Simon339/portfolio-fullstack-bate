/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, Clock, Trash2, XCircle, Globe, Shield, Users, Key, Mail, Calendar, Monitor, Smartphone, Eye, EyeOff } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import EditableField from "./forms/EditableField"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Activities from "./activities"
import { toast } from "sonner"
import {
  deleteUserPermanently,
  getUserAuditLogs,
  updateUserEmail,
  updateUserRole,
} from "@/server/data/alldata"
import { Button } from "@/components/ui/button"
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
import { Chip } from "@heroui/react"
import { ScrollArea } from "../ui/scroll-area"
import { Badge } from "../ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"

type User = {
  id: string
  name: string
  image: string
  email: string
  status: "Verified" | "Not Verified"
  role?: string
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
      activeOrganizationId: string | null
      activeTeamId: string | null
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
    createdAt: Date
    scope: string | null
  }>
  
  organizations?: Array<{
    membershipId: string
    role: "member" | "admin" | "owner"
    joinedAt: Date
    organization: {
      id: string
      name: string
      slug: string
      logo: string | null
    }
  }>
  
  invitations?: {
    sent: Array<{
      id: string
      email: string
      organizationId: string
      role: "member" | "admin" | "owner"
      status: "pending" | "accepted" | "rejected" | "cancelled"
      createdAt: Date
      expiresAt: Date
      organization: {
        name: string
        slug: string
      }
    }>
    stats: {
      pending: number
      accepted: number
      total: number
    }
  }
  
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
    organizationCount: number
    sentInvitationCount: number
    auditLogCount: number
    lastActive: Date
  }
  
  verification?: {
    email: boolean
    accounts: boolean
    hasPassword: boolean
  }
  
  permissions?: {
    isOrganizationOwner: boolean
    isOrganizationAdmin: boolean
    canInvite: boolean
    organizations: Array<{
      id: string
      role: string
      permissions: string[]
    }>
  }
}

interface UserDetailProps {
  user: User
}

const roleColor: Record<"USER" | "SUPER_ADMIN" | "ADMIN" | "default", "warning" | "success" | "secondary"> = {
  USER: "warning",
  SUPER_ADMIN: "success",
  ADMIN: "success",
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

const UserDetails = ({ user }: UserDetailProps) => {
  const [currentUser, setCurrentUser] = useState<User>(user)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [auditLogs, setAuditLogs] = useState<any[]>(user.activity?.auditLogs || [])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

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

  const handleRoleChange = async (newRole: string) => {
    try {
      const result = await updateUserRole(currentUser.id, newRole)
      if (result.success) {
        setCurrentUser((prevUser) => ({ ...prevUser, role: newRole }))
        toast.success(result.message)
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      console.error("Failed to update role:", error)
      toast.error("Failed to update role")
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

  const handlePermanentDelete = async () => {
    try {
      const result = await deleteUserPermanently(currentUser.id)
      if (result.success) {
        toast.success("User permanently deleted")
        // Redirect or handle deletion in parent
      } else {
        toast.error(result.error || "Failed to delete user")
      }
    } catch (error) {
      console.error("Failed to delete user:", error)
      toast.error("Failed to delete user")
    }
  }

  const isVerified = currentUser.status === "Verified"
 
  const getInitials = (name: string): string => {
    return `${name.charAt(0)}`.toUpperCase()
  }

  const initials = getInitials(currentUser.name)

  const getRoleColor = (role: "USER" | "SUPER_ADMIN" | "ADMIN"): "warning" | "success" | "secondary" => {
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
              <Chip
                color={currentUser.status === "Verified" ? "success" : "warning"}
                variant="flat"
                className="flex items-center gap-1 text-xs font-normal border-[#acc2ef]"
              >
                <div className="flex items-center gap-1 text-xs">
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
                </div>
              </Chip>
              {currentUser.organizations && currentUser.organizations.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  {currentUser.organizations.length} Org{currentUser.organizations.length !== 1 ? 's' : ''}
                </Badge>
              )}
              {currentUser.sessions && (
                <Badge variant="outline" className="text-xs">
                  <Monitor className="w-3 h-3 mr-1" />
                  {currentUser.sessions.stats.active} Active
                </Badge>
              )}
            </div>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="shrink-0">
              <Trash2 className="w-4 h-4 mr-1" />
              Delete User
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
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b border-[#acc2ef] bg-transparent px-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="p-6 space-y-6">
          {/* Basic Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <EditableField 
              label="Email" 
              value={currentUser.email} 
              onSave={handleEmailChange} 
              icon={<Mail className="w-4 h-4" />}
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
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
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
                  {currentUser.stats?.organizationCount || 0}
                </CardTitle>
                <CardDescription className="text-xs">Organizations</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-sm text-blue-600 flex items-center gap-1">
                  <Users className="w-3 h-3" /> member
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
                  {currentUser.activity?.stats.totalActions || 0}
                </CardTitle>
                <CardDescription className="text-xs">Total Actions</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-sm text-orange-600 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> last {currentUser.activity?.stats.lastActive ? formatDistanceToNow(new Date(currentUser.activity.stats.lastActive), { addSuffix: true }) : 'never'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sessions Section */}
          {currentUser.sessions && currentUser.sessions.all.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Recent Sessions
              </h3>
              <ScrollArea className="h-[200px] w-full rounded-md border border-[#acc2ef]">
                <div className="p-4 space-y-3">
                  {currentUser.sessions.all.slice(0, 5).map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 border border-[#acc2ef] rounded-md">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getDeviceType(session.userAgent) === 'Mobile' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          {getDeviceType(session.userAgent) === 'Mobile' ? (
                            <Smartphone className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Monitor className="w-4 h-4 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{getBrowser(session.userAgent)} • {getDeviceType(session.userAgent)}</div>
                          <div className="text-xs text-gray-500">
                            {session.ipAddress} • {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                      <Badge variant={new Date(session.expiresAt) > new Date() ? "default" : "outline"}>
                        {new Date(session.expiresAt) > new Date() ? "Active" : "Expired"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
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
                    <div className="text-sm text-gray-500">{currentUser.emailVerified ? 'Verified' : 'Not verified'}</div>
                  </div>
                </div>
                <Badge variant={currentUser.emailVerified ? "default" : "destructive"}>
                  {currentUser.emailVerified ? "Verified" : "Pending"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${currentUser.verification?.accounts ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <Key className={`w-4 h-4 ${currentUser.verification?.accounts ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <div className="font-medium">Linked Accounts</div>
                    <div className="text-sm text-gray-500">{currentUser.accounts?.length || 0} provider(s)</div>
                  </div>
                </div>
                <Badge variant={currentUser.verification?.accounts ? "default" : "outline"}>
                  {currentUser.verification?.accounts ? "Linked" : "None"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Linked Accounts */}
          {currentUser.accounts && currentUser.accounts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Linked Authentication Providers</CardTitle>
              </CardHeader>
              <CardContent>
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
                            Connected {formatDistanceToNow(new Date(account.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {account.scope ? account.scope.split(' ').length + ' scopes' : 'No scopes'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Session Management */}
          {currentUser.sessions && currentUser.sessions.all.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Active Sessions</CardTitle>
                <CardDescription>Manage user's active login sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentUser.sessions.all
                    .filter(session => new Date(session.expiresAt) > new Date())
                    .map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-3 border border-[#acc2ef] rounded-md">
                        <div>
                          <div className="font-medium">
                            {getBrowser(session.userAgent)} on {getDeviceType(session.userAgent)}
                          </div>
                          <div className="text-sm text-gray-500">
                            IP: {session.ipAddress || 'Unknown'} • 
                            Expires: {format(new Date(session.expiresAt), 'MMM d, HH:mm')}
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => toast.info('Revoke session feature coming soon')}>
                          Revoke
                        </Button>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Organizations Tab */}
        <TabsContent value="organizations" className="p-6">
          {currentUser.organizations && currentUser.organizations.length > 0 ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Organization Memberships</h3>
                <Badge variant="outline">
                  {currentUser.organizations.length} Organization{currentUser.organizations.length !== 1 ? 's' : ''}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentUser.organizations.map((org) => (
                  <Card key={org.membershipId} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{org.organization.name}</CardTitle>
                        <Badge variant={
                          org.role === 'owner' ? 'default' : 
                          org.role === 'admin' ? 'secondary' : 'outline'
                        }>
                          {org.role.toUpperCase()}
                        </Badge>
                      </div>
                      <CardDescription>@{org.organization.slug}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Joined</span>
                          <span className="font-medium">
                            {format(new Date(org.joinedAt), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Membership ID</span>
                          <span className="font-mono text-xs">{org.membershipId.slice(0, 8)}...</span>
                        </div>
                        {currentUser.permissions?.organizations.find(o => o.id === org.organization.id) && (
                          <div className="pt-2 border-t">
                            <div className="text-sm font-medium mb-2">Permissions:</div>
                            <div className="flex flex-wrap gap-1">
                              {currentUser.permissions.organizations
                                .find(o => o.id === org.organization.id)
                                ?.permissions.map((perm, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {perm}
                                  </Badge>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Invitations Sent */}
              {currentUser.invitations && currentUser.invitations.sent.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Invitations Sent</CardTitle>
                    <CardDescription>
                      {currentUser.invitations.stats.pending} pending, {currentUser.invitations.stats.accepted} accepted
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-3 pr-4">
                        {currentUser.invitations.sent.slice(0, 5).map((invite) => (
                          <div key={invite.id} className="flex items-center justify-between p-3 border border-[#acc2ef] rounded-md">
                            <div>
                              <div className="font-medium">{invite.email}</div>
                              <div className="text-sm text-gray-500">
                                To: {invite.organization.name} • Role: {invite.role}
                              </div>
                            </div>
                            <Badge variant={
                              invite.status === 'pending' ? 'outline' :
                              invite.status === 'accepted' ? 'default' :
                              invite.status === 'rejected' ? 'destructive' : 'secondary'
                            }>
                              {invite.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Organizations</h3>
              <p className="text-gray-500 mb-4">This user is not a member of any organization.</p>
            </div>
          )}
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Timeline</h3>
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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default UserDetails