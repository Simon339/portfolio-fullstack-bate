import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import React from 'react'
import { MdCategory, MdReport } from 'react-icons/md'
import { FaTools } from 'react-icons/fa';
import Techstack from '@/components/Dashboard/acomponents/Techstack';
import Categories from '@/components/Dashboard/acomponents/Categories';
import Report from '@/components/Dashboard/acomponents/Report';

const page = () => {
  return (
    <section className="rounded-xl bg-gray-50 shadow-md px-4 overflow-hidden min-h-screen flex flex-col">
      <div className=" text-center p-2 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-800">Manage & Reports</h1>
      </div>
      <Tabs defaultValue="report" className="space-y-4 ">
        <TabsList className='justify-center bg-transparent items-center flex'>
          <TabsTrigger value="report" className="hover:bg-black-100 hover:text-gray-50 border-[#ebebeb]">
            <MdReport className="w-4 h-4 mr-2" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="catergory" className="hover:bg-black-100 hover:text-gray-50 border-[#ebebeb]">
            <MdCategory className="w-4 h-4 mr-2" />
            Catergory
          </TabsTrigger>
          <TabsTrigger value="techstack" className="hover:bg-black-100 hover:text-gray-50 border-[#ebebeb]">
            <FaTools className="w-4 h-4 mr-2" />
            Tech Stack
          </TabsTrigger>
        </TabsList>
        <TabsContent value="report">
          <Report />
        </TabsContent>
        <TabsContent value="catergory">
          <Categories />
        </TabsContent>
        <TabsContent value="techstack">
          <Techstack />
        </TabsContent>
      </Tabs>
    </section>
  )
}

export default page
