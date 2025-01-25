import { Card, CardContent} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, BuildingIcon, MailIcon, PhoneIcon, WrenchIcon } from 'lucide-react'

interface ServiceInquiry {
  id: string;
  name: string;
  email: string;
  companyName: string;
  service: string;
  phoneNumber: string;
  createdAt: Date;
}

interface ServiceInquiryDetailProps {
  inquiry: ServiceInquiry;
}

const InquiryDetail = ({ inquiry }: ServiceInquiryDetailProps) => {
  const formattedDate = new Date(inquiry.createdAt).toLocaleDateString("en-US", {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <Card className="w-full bg-current border-none overflow-hidden">
      <div className="relative h-48 bg-gradient-to-r from-[#020024] to-[#090979]">
        <div className="absolute inset-0 bg-black-100 opacity-20"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">{inquiry.name}</h1>
          <p className="text-xl opacity-90">{inquiry.companyName}</p>
        </div>
      </div>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <Badge variant="secondary" className="text-sm mb-2 md:mb-0">
            Inquiry ID: {inquiry.id}
          </Badge>
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarIcon className="h-4 w-4 mr-2" />
            {formattedDate}
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <InfoItem icon={<MailIcon className="h-5 w-5" />} label="Email" value={inquiry.email} />
          <InfoItem icon={<PhoneIcon className="h-5 w-5" />} label="Phone" value={inquiry.phoneNumber} />
          <InfoItem icon={<WrenchIcon className="h-5 w-5" />} label="Service" value={inquiry.service} />
          <InfoItem icon={<BuildingIcon className="h-5 w-5" />} label="Company" value={inquiry.companyName} />
          <div className="h-[100px]"></div>
        </div>
      </CardContent>
    </Card>
  )
}

export default InquiryDetail

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start space-x-3 p-3 rounded-lg bg-zinc-900 transition-all duration-300 hover:bg-secondary">
      <div className="text-primary">{icon}</div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-base font-semibold">{value}</p>
      </div>
    </div>
  )
}