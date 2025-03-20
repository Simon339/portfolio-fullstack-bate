import { MdOutlineAppShortcut, MdOutlineDeveloperMode } from "react-icons/md"
import { HoverEffect } from "../ui/card-hover-effect"
import { Paintbrush } from "lucide-react"
import { VscCodeOss } from "react-icons/vsc"

export function ServicesCard() {
  return (
    <section className="py-4">
      <div className="max-w-3xl mx-auto px-4">
        <HoverEffect items={servicesData} />
      </div>
    </section>
  )
}


export const servicesData = [
  {
    icon: <Paintbrush className="h-10 w-10 items-center content-center" />,
    title: 'Web Developer',
    description:
      'As a front-end developer with expertise in React, Vue, Next.js, and Tailwind CSS, I create and redesign dynamic, responsive websites using HTML, CSS, and JavaScript to deliver high-quality, user-friendly solutions.',
    link: '',
  },
  {
    icon: <MdOutlineDeveloperMode className="h-10 w-10 items-center content-center" />,
    title: 'Web Application Development',
    description:
      'As a seasoned web application developer, I create sophisticated, interactive applications using React.js, Vue.js, Node.js, Next.js, and Tailwind CSS. I build complex, high-functionality solutions that surpass traditional website capabilities, delivering dynamic user experiences.',
    link: '',
  },
  {
    icon: <VscCodeOss className="h-10 w-10 items-center content-center" />,
    title: 'SEO Optimization',
    description:
      "Enhance your website’s visibility and drive more traffic with expert SEO strategies. I specialize in optimizing both on-page and off-page elements, including strategic keyword integration, compelling meta tags, and effective link-building techniques, to elevate your site’s ranking in search engines and attract your target audience.",
    link: '',
  },
  {
    icon: <MdOutlineAppShortcut className="h-10 w-10 items-center content-center" />,
    title: 'Mobile Development Services',
    description:
      'Transform your mobile vision with Flutter and React Native for high-performance apps. We utilize Firebase for secure backend services, SQLite  for local data management, and Appwrite for streamlined backend development, ensuring seamless, user-friendly experiences.',
    link: '',
  },
];
