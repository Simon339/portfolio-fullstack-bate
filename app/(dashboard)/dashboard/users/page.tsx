'use client'

import React, { useState, useEffect } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import { Users, Plus, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { deleteUser, getbyUserDetails } from '@/server/data/alldata'
import { DataTable } from '@/components/Dashboard/UsersCard'

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

export default function Page() {
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

        <Button className="bg-gray-50 border border-[#acc2ef] rounded-full hover:bg-blue-700 text-bold text-black hover:text-white" onClick={() => toast('Add user functionality coming soon!')}>
          <Plus className="text-bold" />
        </Button>
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
  )
}
