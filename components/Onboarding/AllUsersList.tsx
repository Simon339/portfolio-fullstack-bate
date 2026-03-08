"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, UserPlus, Loader2, Users, Mail } from "lucide-react"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getbyUserDetails } from '@/server/data/alldata'
import { addMember } from '@/server/actions/authactions'

type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status?: 'active' | 'inactive' | 'pending';
  createdAt?: string;
  emailVerified?: boolean;
}

type AllUsersListProps = {
  selectedOrgId?: string;
  organizationName?: string;
  currentOrgMembers?: Array<{
    id: string;
    email: string;
    name: string;
  }>;
}

const AllUsersList = ({ selectedOrgId, organizationName, currentOrgMembers = [] }: AllUsersListProps) => {
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [invitingUserId, setInvitingUserId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [role, setRole] = useState<"member" | "admin" | "owner">("member")

  // 1. Debounce Search Logic: Prevents UI lag by waiting 300ms after typing stops
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // 2. Stable Member IDs: Use a stringified version to prevent infinite loop
  // if the parent component passes a new array reference every render.
  const memberIdsKey = JSON.stringify(currentOrgMembers.map(m => m.id));

  useEffect(() => {
    const fetchAllUsers = async () => {
      if (!selectedOrgId) {
        setAllUsers([])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const usersData = await getbyUserDetails();
        
        if (!Array.isArray(usersData)) {
          setAllUsers([])
          return
        }
        
        // Use the stable member IDs for filtering
        const existingIds = JSON.parse(memberIdsKey);
        
        const filteredUsersData = usersData.filter(user => {
          if (!user?.id) return false;
          // Only show users who are NOT already in the organization
          return !existingIds.includes(user.id);
        })
        
        setAllUsers(filteredUsersData.filter(u => u.id && u.email))
      } catch (error: any) {
        console.error("Error fetching users:", error)
        toast.error("Failed to load users")
        setAllUsers([])
      } finally {
        setLoading(false)
      }
    }

    fetchAllUsers()
  }, [selectedOrgId, memberIdsKey]); // Dependency on stringified IDs stops the loop

  // 3. Derived State for Search: Faster than a separate useEffect
  const filteredUsers = useMemo(() => {
    if (!debouncedQuery.trim()) return allUsers;
    
    const query = debouncedQuery.toLowerCase();
    return allUsers.filter(user => 
      user.name?.toLowerCase().includes(query) || 
      user.email?.toLowerCase().includes(query)
    );
  }, [debouncedQuery, allUsers]);

  const handleInviteUser = async (userId: string, userEmail: string) => {
    if (!selectedOrgId) return;
    setInvitingUserId(userId)

    try {
      const result = await addMember(selectedOrgId, userId, role)

      if (!result?.success) throw new Error(result?.error || "Failed to invite")

      setAllUsers(prev => prev.filter(user => user.id !== userId))
      toast.success(`Invitation sent to ${userEmail}`)
    } catch (error: any) {
      toast.error(error.message || "Failed to send invitation")
    } finally {
      setInvitingUserId(null)
    }
  }

  const getStatusBadge = (status?: string, emailVerified?: boolean) => {
    if (status === 'pending' || !emailVerified) {
      return <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs">Pending</Badge>
    }
    return <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">Active</Badge>
  }

  const getInitials = (name: string) => {
    const [first = "?", last = ""] = (name || "").split(" ")
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
  }


  if (!selectedOrgId) {
    return (
      <Card className="bg-white border-slate-200">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-700">Select an Organization</h3>
          <p className="text-slate-500">View available users by selecting an organization.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Available Users</h3>
            <p className="text-sm text-slate-500">Not in {organizationName || 'this organization'}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Assign Role:</span>
            <Select value={role} onValueChange={(value: any) => setRole(value)}>
              <SelectTrigger className="w-32 h-9 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-slate-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by name or email..."
            className="pl-9 bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="divide-y divide-slate-100 min-h-[300px] flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-slate-400 animate-spin mb-2" />
            <p className="text-sm text-slate-500">Loading user directory...</p>
          </div>
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4 min-w-0">
                <Avatar className="h-10 w-10 border border-slate-200">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-slate-100 text-slate-600">{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900 truncate">{user.name}</span>
                    {getStatusBadge(user.status, user.emailVerified)}
                  </div>
                  <div className="text-sm text-slate-500 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {user.email}
                  </div>
                </div>
              </div>
              <Button
                onClick={() => handleInviteUser(user.id, user.email)}
                disabled={invitingUserId === user.id}
                size="sm"
                className="bg-slate-900 text-white hover:bg-slate-800"
              >
                {invitingUserId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
                Invite
              </Button>
            </div>
          ))
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <Users className="w-12 h-12 text-slate-200 mb-2" />
            <p className="text-slate-500 font-medium">No users found</p>
            <p className="text-xs text-slate-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </Card>
  )
}

export default AllUsersList