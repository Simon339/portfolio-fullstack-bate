
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, User } from 'lucide-react';
import GeneralSettings from '@/components/Dashboard/acomponents/GeneralTab';
import UserManagement from '@/components/Dashboard/acomponents/UserProfile';

const SettingsPage = () => {

  return (
    <section className="rounded-xl bg-gray-50 shadow-md px-4 overflow-hidden min-h-screen flex flex-col">
      <div className=" items-center border-b p-2 border-[#acc2ef]">
        <div>
          <h1 className="align-middle text-center text-2xl font-semibold text-gray-800">Settings</h1>
          <p className="align-middle text-center text-sm text-muted-foreground">Manager all the settings </p>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-4 w-full items-center  align-middle border-[#acc2ef] text-gray-700 ">
        <TabsList className='items-center bg-slate-50 border-[#acc2ef] flex align-middle'>
          <TabsTrigger value="users" className="hover:bg-black-100 hover:text-gray-50 border-[#acc2ef]">
            <User className="w-4 h-4 mr-2" />
            User Profile
          </TabsTrigger>
          <TabsTrigger value="general" className="hover:bg-black-100 hover:text-gray-50 border-[#acc2ef]">
            <Settings className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
        </TabsList>


        <TabsContent value="general">
          <GeneralSettings />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
      </Tabs>
    </section>
  );
}

export default SettingsPage