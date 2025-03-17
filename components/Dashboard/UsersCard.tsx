import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Chip } from "@heroui/react"
import { format } from "date-fns"

interface UsersCardProps {
    id: string
    name: string
    surname: string
    image: string
    email: string
    role: "USER" | "SUPER_USER" | "ADMIN"
    status: "Verified" | "Not Verified"
    approval: "PENDING" | "APPROVED" | "REJECTED"
    color?: string
    createdAt: Date
    isSelected: boolean
    onSelect: (id: string, checked: boolean) => void
}

const approvalColorMap = {
    APPROVED: 'success',
    REJECTED: 'destructive',
    PENDING: 'warning',
    default: 'secondary',
  };

  const roleColor = {
    USER: 'warning',
    SUPER_USER: 'success',
    ADMIN: 'success',
    default: 'secondary',
  }


  const UsersCard = ({ id, name, surname, email, image, role, createdAt, status, isSelected, onSelect, approval }: UsersCardProps) => {

    
    const getApprovalColor = (approval: "PENDING" | "APPROVED" | "REJECTED") => {
        return approvalColorMap[approval] || approvalColorMap.default;
    };
    
    const getRoleColor = (role: "USER" | "SUPER_USER" | "ADMIN") => {
        return roleColor[role] || roleColor.default;
    };

    const formatApproval = (text: string) => {
        return text.charAt(0) + text.slice(1).toLowerCase()
    }

    const handleSelectChange = (checked: boolean) => {
        onSelect(id, checked)
    }

    return (
        <div className="group relative flex items-center gap-4 rounded-lg border border-[#acc2ef] p-4 text-gray-800 transition-all hover:bg-accent/5">
            <div className="flex items-center gap-4">
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={handleSelectChange}
                    className="h-4 w-4"
                    onClick={(e) => e.stopPropagation()}
                />
                <Avatar className="h-10 w-10 ring-1 ring-[#acc2ef]">
                    <AvatarImage
                        src={image || `https://api.dicebear.com/6.x/initials/svg?seed=${email}`}
                        alt={`${name} ${surname}`}
                    />
                    <AvatarFallback>
                        {name.slice(0, 1)}
                        {surname.slice(0, 1)}
                    </AvatarFallback>
                </Avatar>
            </div>

            <div className="flex flex-1 flex-col">
                <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-800 text-foreground">
                        {name} {surname}
                    </h3>
                    <div className="flex gap-2 border-[#acc2ef]">
                        <Chip color={status === 'Verified' ? 'success' : 'warning'} variant="flat" className="text-xs font-normal border-[#acc2ef]">
                            {status}
                        </Chip>
                        <Chip variant="flat" color={getApprovalColor(approval)} className="text-xs font-normal border-[#acc2ef]">
                            {formatApproval(approval)}
                        </Chip>
                    </div>
                </div>

                <div className="mt-1 text-sm text-muted-foreground">{email}</div>

                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground border-[#acc2ef]">
                    <Chip variant="flat" color={getRoleColor(role)} className="px-2 py-0 text-xs font-normal border-[#acc2ef] text-gray-800">
                    {formatApproval(role)}
                    </Chip>
                    <span className="text-muted-foreground">•</span>
                    <span>Joined {format(new Date(createdAt), "MMM d, yyyy")}</span>
                </div>
            </div>
        </div>
    )
}

export default UsersCard
