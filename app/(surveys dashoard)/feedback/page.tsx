import Reviewform from '@/components/surveys&reviwe/Reviewform'
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Malesela Portfolio's surveys",
  description: "This dashboard is for customer reviews and ratings for all services provided",
};

const page = () => {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <Reviewform />
    </section>
  )
}

export default page
