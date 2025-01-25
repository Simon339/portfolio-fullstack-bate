
import { Metadata } from "next";
import DashboardWrapper from "../_component/DashboardWrapper";


export const metadata: Metadata = {
  title: "Dashboard",
  description: "Updated Silk full stack Portfolio",
};


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
 
  return (
    <DashboardWrapper>
      {children}
    </DashboardWrapper>
  );
}