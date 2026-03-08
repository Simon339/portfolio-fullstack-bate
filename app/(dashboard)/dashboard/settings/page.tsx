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

      <UserManagement />

    </section>
  );
}

export default SettingsPage