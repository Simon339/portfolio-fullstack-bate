'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import ServiceForm from './ServiceForm'

interface ServiceModelProps {
  service: string
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export function ServiceModel({ service, isOpen, setIsOpen }: ServiceModelProps) {
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] bg-black-100">
        <DialogHeader>
          <DialogTitle className='text-center font-semibold '>{service}</DialogTitle>
          <DialogDescription className='text-center font-semibold'>
            Thank you for your interest in {service}!
            We&apos;re excited to share more details and explore how we can assist you.
            Please fill out the form below, and we&apos;ll get back to you as soon as possible!
          </DialogDescription>
        </DialogHeader>
        <ServiceForm service={service} setIsOpen={setIsOpen} />
      </DialogContent>
    </Dialog>
  )
}