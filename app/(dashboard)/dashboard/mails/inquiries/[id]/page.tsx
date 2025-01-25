"use client";


import InquiryDetail from "@/components/Dashboard/InquiryDetail";
import { Button } from "@/components/ui/button";
import { getAllServiceInquiry } from "@/server/actions/notification";
import { ChevronLeft } from 'lucide-react';
import { useParams, useRouter } from "next/navigation";
import React from 'react';

interface ServiceInquiry {
  id: string;
  name: string;
  email: string;
  companyName: string;
  service: string;
  phoneNumber: string;
  createdAt: Date;
  isSelected: boolean;
  isRead: boolean;
}

const Page = () => {
  const params = useParams();
  const router = useRouter();

  const [allServiceInquiries, setAllServiceInquiries] = React.useState<ServiceInquiry[]>([]);

  React.useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    const inquiries = await getAllServiceInquiry();
    setAllServiceInquiries(inquiries);
  };

  const handleBack = () => {
    router.back();
  };

  const inquiryId = params.id as string;

  // Check for invalid inquiryId
  if (!inquiryId) {
    return (
      <section className="rounded-xl bg-gray-50 shadow-md px-4 overflow-hidden min-h-screen flex flex-col">
        <div className="flex items-center justify-between p-2 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <Button onClick={handleBack} variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="items-center mb-10">
          <div className="flex flex-col items-center">
            <h2 className="text-xl text-center">Inquiry not found</h2>
          </div>
        </div>
      </section>
    );
  }

  const inquiry = allServiceInquiries.find((i) => i.id === inquiryId);

  // If the inquiry is not found in the fetched list
  if (!inquiry) {
    return (
      <section className="rounded-xl bg-gray-50 shadow-md px-4 overflow-hidden min-h-screen flex flex-col">
        <div className="flex items-center justify-between p-2 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <Button onClick={handleBack} variant="ghost" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="items-center mb-10">
          <div className="flex flex-col items-center">
            <h2 className="text-xl text-center">Inquiry not found</h2>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl bg-gray-50 shadow-md px-4 overflow-hidden min-h-screen flex flex-col">
      <div className="flex items-center justify-between p-2 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Button onClick={handleBack} variant="ghost" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <InquiryDetail inquiry={inquiry} />
    </section>
  );
};

export default Page;

