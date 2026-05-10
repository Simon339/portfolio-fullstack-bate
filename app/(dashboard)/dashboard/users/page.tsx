'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Users, Plus, Loader2, Eye, Trash2, Ban, UserCheck, UserCog, LogOut, MoreHorizontal, CheckCircle, UserMinus } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import {  getbyUserDetails } from '@/server/data/alldata'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { DataTable } from '@/components/Dashboard/UsersCard'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from '@/components/ui/input'
import UserModal from '@/components/Dashboard/modals/User'
import { usePathname, useRouter } from "next/navigation";
import {deleteUser, banUser, impersonateUser, stopImpersonating, unbanUser } from '@/server/actions/user'

interface User {
  id: string
  name: string
  image: string | null
  email: string
  status: 'Verified' | 'Not Verified'
  role: 'admin' | 'user' | 'owner'
  twoFactorEnabled: boolean
  banned: boolean
  banReason: string | null
  banExpires: Date | null
  createdAt: Date
  emailVerified: boolean | null
  sessionCount?: number
  lastActive?: Date | null
  isSelected: boolean
}

const Page = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const usersData = await getbyUserDetails()

      const transformedData = (usersData || []).map((user: any) => ({
        ...user,
        role: user.role || 'user',
        twoFactorEnabled: user.twoFactorEnabled || false,
        banned: user.banned || false,
        status: user.emailVerified ? 'Verified' : 'Not Verified',
        isSelected: false,
      }))

      setUsers(transformedData)
    } catch (err) {
      console.error('Error fetching users:', err)
      setError('Failed to fetch users')
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (selectedUsers: User[]) => {
    setIsDeleting(true)
    try {
      for (const user of selectedUsers) {
        const formData = new FormData()
        formData.append('userId', user.id)
        const result = await deleteUser(formData)

        if (!result.success) {
          throw new Error(result.error || 'Failed to delete user')
        }
      }

      setUsers((prevUsers) =>
        prevUsers.filter((u) => !selectedUsers.find((s) => s.id === u.id))
      )
      toast.success(`${selectedUsers.length} user(s) deleted successfully`)
    } catch (error) {
      console.error('Error deleting users:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete users')
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: ColumnDef<User>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.image || `https://api.dicebear.com/6.x/initials/svg?seed=${user?.name || 'user'}`} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-gray-900">{user.name}</div>
              <div className="text-sm text-gray-500">{user.email}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <Badge
            variant="outline"
            className={
              status === 'Verified'
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-yellow-50 text-yellow-700 border-yellow-200'
            }
          >
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => {
        const role = row.original.role
        const roleColors: Record<string, string> = {
          admin: 'bg-purple-50 text-purple-700 border-purple-200',
          user: 'bg-blue-50 text-blue-700 border-blue-200',
          owner: 'bg-red-50 text-red-700 border-red-200',
        }
        return (
          <Badge variant="outline" className={roleColors[role] || roleColors.user}>
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'twoFactorEnabled',
      header: '2FA',
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={
            row.original.twoFactorEnabled
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-gray-50 text-gray-700 border-gray-200'
          }
        >
          {row.original.twoFactorEnabled ? 'Enabled' : 'Disabled'}
        </Badge>
      ),
    },
    {
      accessorKey: 'banned',
      header: 'Account',
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={
            row.original.banned
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-green-50 text-green-700 border-green-200'
          }
        >
          {row.original.banned ? 'Banned' : 'Active'}
        </Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => format(new Date(row.original.createdAt), 'MMM dd, yyyy'),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const user = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="size-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/users/${user.id}`} className="cursor-pointer flex items-center gap-2">
                  <Eye className="size-4" />
                  <span>View User</span>
                </Link>
              </DropdownMenuItem>
              
              <ImpersonateDialog userId={user.id} userName={user.name} />
              
              {user.banned ? (
                <UnbanDialog userId={user.id} userName={user.name} />
              ) : (
                <BanDialog userId={user.id} userName={user.name} />
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                className="cursor-pointer flex items-center gap-2 text-red-600 focus:text-red-600"
                onClick={() => handleDelete([{ ...user, isSelected: true }])}
              >
                <Trash2 className="size-4" />
                <span>Delete User</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="space-y-3 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-sm text-gray-500">Loading users...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error: {error}</p>
          <Button onClick={fetchUsers}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-blue-100 rounded-xl">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Users</h1>
              <p className="text-sm text-gray-600 mt-0.5">
                {users.length} users{' '}
                {users.filter((u) => u.banned).length > 0 && (
                  <span className="text-red-600">
                    • {users.filter((u) => u.banned).length} banned
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <UserModal />
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={users}
          searchPlaceholder="Search by name or email..."
          onDelete={handleDelete}
          isDeleting={isDeleting}
        />
      </div>
    </TooltipProvider>
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
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer flex items-center gap-2 text-orange-600 focus:text-orange-600">
          <Ban className="size-4" />
          <span>Ban User</span>
        </DropdownMenuItem >
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
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer flex items-center gap-2 text-green-600 focus:text-green-600">
          <CheckCircle className="size-4" />
          <span>Unban User</span>
        </DropdownMenuItem >
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
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer flex items-center gap-2">
          {isImpersonating ?<UserMinus className='size-4' /> : <UserCog className="size-4" />}
          <span>{isImpersonating ? 'Stop Impersonating' : 'Impersonate User'}</span>
        </DropdownMenuItem>
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
              :  <span className="text-xs italic font-medium text-amber-800">  Warning: This action will be audited</span>
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

export default Page