"use client"

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail } from 'lucide-react';
import { MdOutlineSupportAgent } from 'react-icons/md';
import MessageTab from '@/components/Dashboard/MessageTab';
import InquiriesTab from '@/components/Dashboard/InquiriesTab';
import { seedDatabaseAction, clearDatabaseAction } from '@/server/data/seed-actions';

const Page = () => {
  // const [isLoading, setIsLoading] = useState(false);
  // const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // const handleSeed = async () => {
  //   setIsLoading(true);
  //   setMessage(null);
    
  //   try {
  //     const result = await seedDatabaseAction();
      
  //     if (result.success) {
  //       setMessage({ type: 'success', text: result.message });
  //       // Refresh the page to show new data
  //       window.location.reload();
  //     } else {
  //       setMessage({ type: 'error', text: result.message });
  //     }
  //   } catch (error) {
  //     console.error('Error seeding database:', error);
  //     setMessage({ type: 'error', text: 'Failed to seed database' });
  //   }
    
  //   setIsLoading(false);
    
  //   // Auto-hide message after 3 seconds
  //   setTimeout(() => setMessage(null), 3000);
  // };

  // const handleClear = async () => {
  //   setIsLoading(true);
  //   setMessage(null);
    
  //   try {
  //     const result = await clearDatabaseAction();
      
  //     if (result.success) {
  //       setMessage({ type: 'success', text: result.message });
  //       // Refresh the page to show empty state
  //       window.location.reload();
  //     } else {
  //       setMessage({ type: 'error', text: result.message });
  //     }
  //   } catch (error) {
  //     console.error('Error clearing database:', error);
  //     setMessage({ type: 'error', text: 'Failed to clear database' });
  //   }
    
  //   setIsLoading(false);
    
  //   // Auto-hide message after 3 seconds
  //   setTimeout(() => setMessage(null), 3000);
  // };
  
  return (
    <section className="rounded-xl bg-gray-50 shadow-md px-4 overflow-hidden min-h-screen flex flex-col">
      <div className=" items-center ">
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
{/* 
      <div className="space-y-4">
        <div className="flex gap-3">
          <button
            onClick={handleSeed}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                       flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating...
              </>
            ) : (
              'Generate Seed Data'
            )}
          </button>
          
          <button
            onClick={handleClear}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Clear All Data
          </button>
        </div>
        
        {message && (
          <div className={`p-3 rounded-md ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message.text}
          </div>
        )}
      </div> */}
    </section>
  );
};

export default Page;