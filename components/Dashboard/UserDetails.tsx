/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, Clock, Trash2, XCircle } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import EditableField from "./forms/EditableField"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Activities from "./activities"
import { toast } from "sonner"
import { deleteUserPermanently, getUserAuditLogs, updateApprovalStatus, updateUserEmail, updateUserRole } from "@/server/data/alldata"
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

type User = {
    id: string
    name: string
    surname: string
    image: string
    email: string
    status: "Verified" | "Not Verified"
    role: string
    createdAt: string
    phone: string
    country: string
    approvalStatus: "PENDING" | "APPROVED" | "REJECTED"
    updatedAt: Date
    lastActivityDate: Date
}

interface UserDetailProps {
    user: User
}

const roleColor = {
    USER: 'warning',
    SUPER_USER: 'success',
    ADMIN: 'success',
    default: 'secondary',
}

type AuditLog = {
    id: string
    action: string
    tableName: string
    recordId: string
    userId: string | null
    timestamp: Date
    details: any
    ipAddress: string | null
    userAgent: string | null
}

const UserDetails = ({ user }: UserDetailProps) => {
    const [currentUser, setCurrentUser] = useState<User>(user)
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchAuditLogs = async () => {
            try {
                const logs = await getUserAuditLogs(user.id)
                setAuditLogs(logs)
            } catch (error) {
                console.error("Failed to fetch audit logs:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchAuditLogs()
    }, [user.id])

    const handleRoleChange = async (newRole: string) => {
        try {
            const result = await updateUserRole(currentUser.id, newRole);
            if (result.success) {
                setCurrentUser((prevUser) => ({ ...prevUser, role: newRole }));
                toast.success(result.message);
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            console.error("Failed to update role:", error);
            toast.error("Failed to update role");
        }
    };

    const handleEmailChange = async (newEmail: string) => {
        try {
            const result = await updateUserEmail(currentUser.id, newEmail);
            if (result.success) {
                setCurrentUser((prevUser) => ({ ...prevUser, email: newEmail }));
                toast.success("Email updated successfully");
            } else {
                toast.error(result.error || "Failed to update email");
            }
        } catch (error) {
            console.error("Failed to update email:", error);
            toast.error("Failed to update email");
        }
    };


    const handleApprovalChange = async (newStatus: "PENDING" | "APPROVED" | "REJECTED") => {
        if (isUpdatingStatus) return;

        try {
            setIsUpdatingStatus(true);
            const result = await updateApprovalStatus(currentUser.id, newStatus);
            if (result.success) {
                setCurrentUser((prevUser) => ({ ...prevUser, approvalStatus: newStatus }));
                toast.success(result.message);
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            console.error("Failed to update approval status:", error);
            toast.error("Failed to update approval status");
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handlePermanentDelete = async () => {
        try {
            const result = await deleteUserPermanently(currentUser.id);
            if (result.success) {
                toast.success("User permanently deleted");
            } else {
                toast.error(result.error || "Failed to delete user");
            }
        } catch (error) {
            console.error("Failed to delete user:", error);
            toast.error("Failed to delete user");
        }
    };

    const isVerified = currentUser.status === "Verified";
    const lastActive = currentUser.lastActivityDate
        ? formatDistanceToNow(new Date(currentUser.lastActivityDate), { addSuffix: true })
        : "Never"

    const getInitials = (name: string, surname: string): string => {
        return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
    };

    const initials = getInitials(currentUser.name, currentUser.surname);

    const getRoleColor = (role: "USER" | "SUPER_USER" | "ADMIN") => {
        return roleColor[role] || roleColor.default;
    };

    const formatApproval = (text: string) => {
        return text.charAt(0) + text.slice(1).toLowerCase();
    };

    return (

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b  border-[#acc2ef] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border text-white  border-[#acc2ef]">
                        <AvatarImage src={currentUser.image || `https://api.dicebear.com/6.x/initials/svg?seed=${initials}`} alt={`${currentUser.name} ${currentUser.surname}`} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="text-xl font-medium text-gray-900">
                            {currentUser.name} {currentUser.surname}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                            <Chip variant="flat" color={getRoleColor(currentUser.role)} className="px-2 py-0 text-xs font-normal border-[#acc2ef] text-gray-800">
                                {formatApproval(currentUser.role)}
                            </Chip>
                            <Chip color={currentUser.status === 'Verified' ? 'success' : 'warning'} variant="flat" className="flex items-center gap-1 text-xs font-normal border-[#acc2ef]">
                                <div className="flex items-center gap-1 text-xs f">
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
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Clock className="w-3 h-3 mr-1" />
                            Last active: {lastActive}
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
                                This action cannot be undone. This will permanently delete the user account and remove all
                                associated data.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handlePermanentDelete} className="bg-red-600 hover:bg-red-700">
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            {/* User Details */}
            <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <EditableField label="Email" value={currentUser.email} onSave={handleEmailChange} />
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm text-gray-600">
                            Phone
                        </Label>
                        <Input className="bg-gray-50  border-[#acc2ef]" id="phone" value={currentUser.phone || ""} readOnly />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="country" className="text-sm text-gray-600">
                            Country
                        </Label>
                        <Input className="bg-gray-50  border-[#acc2ef]" id="country" value={currentUser.country || ""} readOnly />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role" className="text-sm text-gray-600">
                            Role
                        </Label>
                        <Select
                            onValueChange={handleRoleChange}
                            value={currentUser.role}
                            disabled={isUpdatingStatus}>
                            <SelectTrigger className="bg-white  border-[#acc2ef]">
                                <SelectValue placeholder="Select a role" defaultValue={currentUser.role} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="USER">User</SelectItem>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                                <SelectItem value="SUPER_USER">Super user</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="access" className="text-sm text-gray-600">
                            Access to Dashboard
                        </Label>
                        <Select
                            onValueChange={handleApprovalChange}
                            value={currentUser.approvalStatus}
                            disabled={isUpdatingStatus}
                        >
                            <SelectTrigger className="bg-white border-[#acc2ef]">
                                <SelectValue placeholder="Set approval status" defaultValue={currentUser.approvalStatus} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PENDING" className="text-amber-600">
                                    Pending
                                </SelectItem>
                                <SelectItem value="APPROVED" className="text-green-600">
                                    Approved
                                </SelectItem>
                                <SelectItem value="REJECTED" className="text-red-600">
                                    Rejected
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Member Since</Label>
                        <div className="h-10 px-3 py-2 text-sm bg-gray-50 border  border-[#acc2ef] rounded-md">
                            {format(new Date(currentUser.createdAt), "MMMM d, yyyy")}
                        </div>
                    </div>
                </div>

                {/* Activities Section */}
                <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                    <div className="mt-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activities</h3>
                        <Activities auditLogs={auditLogs} />
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
}

function getActivityDescription(approvalStatus: User["approvalStatus"]) {
    switch (approvalStatus) {
        case "PENDING":
            return "Requested approval"
        case "APPROVED":
            return "Was approved"
        case "REJECTED":
            return "Was rejected"
        default:
            return "Unknown status"
    }
}

export default UserDetails

