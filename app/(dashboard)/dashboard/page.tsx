'use client';

import UserCard from "@/components/Dashboard/DashboardCards";
// import RecentUsers from "@/components/Dashboard/charts/RecentUser";
// import ProjectChart from "@/components/Dashboard/charts/ProjectChart";


const page = () => {
  
  return (
    <div className=" mx-auto p-1">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <UserCard type="Total Users" count='1' icon='users' />
        <UserCard type="Total Projects" count="18" icon='projects' />
        <UserCard type="Total Request" count="1" icon='message' />
        <UserCard type="Staff" count="1" icon='staff' />
      </div>

      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"> */}
        {/* <RecentUsers /> */}
        {/* <ProjectChart /> */}
      {/* </div> */}
    </div>
  )
}

export default page