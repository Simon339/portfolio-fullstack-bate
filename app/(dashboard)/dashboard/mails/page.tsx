"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail } from 'lucide-react';
import { MdOutlineSupportAgent } from 'react-icons/md';
import MessageTab from '@/components/Dashboard/MessageTab';
import InquiriesTab from '@/components/Dashboard/InquiriesTab';

const Page = () => {
  
  return (
    <section className="rounded-xl bg-gray-50 shadow-md px-4 overflow-hidden min-h-screen flex flex-col">
      <div className=" items-center p-2">
        <h1 className="align-middle text-center text-[24px] font-semibold text-gray-800">Messages and Inquiries</h1>
      </div>
      <Tabs defaultValue="messages" className="space-y-4 w-full items-center mb-3 align-middle border-[#ebebeb] text-gray-700 ">
        <TabsList className='items-center bg-slate-50 flex align-middle'>
          <TabsTrigger value="messages" className="hover:bg-black-100 hover:text-gray-50 border-[#ebebeb]">
            <Mail className="w-4 h-4 mr-2 " />
            Messages
          </TabsTrigger>
          <TabsTrigger value="security" className="hover:bg-black-100 hover:text-gray-50 border-[#ebebeb]">
            <MdOutlineSupportAgent className="w-4 h-4 mr-2" />
            Client Inquiries
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className='border-none'>
          <MessageTab />
        </TabsContent>
        <TabsContent value="security" className='border-none'>
          <InquiriesTab />
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default Page;