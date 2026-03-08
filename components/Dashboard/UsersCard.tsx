import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Chip } from "@heroui/react"
import { format } from "date-fns"

interface UsersCardProps {
    id: string
    name: string
    image: string
    email: string
    status: "Verified" | "Not Verified"
    color?: string
    createdAt: Date
    isSelected: boolean
    onSelect: (id: string, checked: boolean) => void
}


  const UsersCard = ({ id, name, email, image, createdAt, status, isSelected, onSelect }: UsersCardProps) => {


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
                        alt={`${name}`}
                    />
                    <AvatarFallback>
                        {name.slice(0, 1)}
                    </AvatarFallback>
                </Avatar>
            </div>

            <div className="flex flex-1 flex-col">
                <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-800 text-foreground">
                        {name}
                    </h3>
                    <div className="flex gap-2 border-[#acc2ef]">
                        <Chip color={status === 'Verified' ? 'success' : 'warning'} variant="flat" className="text-xs font-normal border-[#acc2ef]">
                            {status}
                        </Chip>
                    </div>
                </div>

                <div className="mt-1 text-sm text-muted-foreground">{email}</div>

                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground border-[#acc2ef]">
                    <span>Joined {format(new Date(createdAt), "MMM d, yyyy")}</span>
                </div>
            </div>
        </div>
    )
}

export default UsersCard
