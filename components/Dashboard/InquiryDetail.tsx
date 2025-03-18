import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, Building, Mail, Phone, Wrench } from "lucide-react"

interface ServiceInquiry {
  id: string
  name: string
  email: string
  companyName: string
  service: string
  phoneNumber: string
  createdAt: Date
}

interface ServiceInquiryDetailProps {
  inquiry: ServiceInquiry
}

const InquiryDetail = ({ inquiry }: ServiceInquiryDetailProps) => {
  const formattedDate = new Date(inquiry.createdAt).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <Card className="border-none mt-2 h-full w-full overflow-hidden shadow-sm">
      <div className="relative h-32 bg-gradient-to-r from-[#1E56A0] to-[#4D7AB9]">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-2xl font-bold mb-1">{inquiry.name}</h1>
          <p className="text-lg opacity-90">{inquiry.companyName}</p>
        </div>
      </div>
      <CardContent className="p-6 h-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <Badge variant="outline" className="text-sm mb-2 md:mb-0 bg-white border-[#acc2ef] text-gray-800">
            Inquiry ID: {inquiry.id.substring(0, 8)}...
          </Badge>
          <div className="flex items-center text-sm text-gray-600">
            <CalendarIcon className="h-4 w-4 mr-2" />
            {formattedDate}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 h-full">
          <InfoItem icon={<Mail className="h-5 w-5" />} label="Email" value={inquiry.email} />
          <InfoItem icon={<Phone className="h-5 w-5" />} label="Phone" value={inquiry.phoneNumber} />
          <InfoItem icon={<Wrench className="h-5 w-5" />} label="Service" value={inquiry.service} />
          <InfoItem icon={<Building className="h-5 w-5" />} label="Company" value={inquiry.companyName} />
        </div>
      </CardContent>
    </Card>
  )
}

export default InquiryDetail

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start space-x-3 p-4 rounded-lg bg-white border border-[#acc2ef] transition-all duration-300 hover:shadow-md">
      <div className="text-[#1E56A0]">{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-base font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  )
}

