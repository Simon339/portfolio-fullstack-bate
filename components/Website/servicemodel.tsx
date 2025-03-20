'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import ServiceForm from './ServiceForm'

interface ServiceModelProps {
  service: string
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export function ServiceModel({ service, isOpen, setIsOpen }: ServiceModelProps) {
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] bg-black-100 border border-[#685189]/20 p-5 rounded-none">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-sm font-normal text-white">{service}</DialogTitle>
        </DialogHeader>
        <ServiceForm service={service} setIsOpen={setIsOpen} />
      </DialogContent>
    </Dialog>
  )
}
