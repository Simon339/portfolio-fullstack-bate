"use client"

import AboutCard from "@/components/Website/AboutCard"
import { Button } from "@/components/ui/button"
import { profile, companies } from "@/data"
import { Download } from "lucide-react"
import Image from "next/image"

export default function About() {
 

  return (
    <section id="about" className="py-20 bg-black-100 text-white">
      <div className="mx-auto px-4">
        <div className="flex flex-col items-center mb-12">
          <h2 className="text-3xl font-bold mb-2">About Me</h2>
          <div className="w-12 h-1 bg-primary mb-6"></div>
          <p className="text-muted-foreground text-center max-w-md">My introduction</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Profile Image */}
          <div className="flex justify-center">
            {profile.map((item) => (
              <div key={item.id} className="relative w-80 h-80 overflow-hidden rounded-2xl border-4 ">
                <Image
                  src={item.img || "/placeholder.svg"}
                  alt="Profile"
                  fill
                  className="about_img"
                  sizes="(max-width: 768px) 100vw, 320px"
                />
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Stats using AboutCard */}
            <AboutCard />

            {/* Description */}
            {profile.map((item) => (
              <p key={item.id} className="text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            ))}

            {/* Companies */}
            <div className="pt-4">
              <p className="text-sm text-muted-foreground mb-4">Companies I&apos;ve worked with:</p>
              <div className="flex flex-wrap gap-6 items-center">
                {companies.map((company) => (
                  <div
                    key={company.id}
                    className="w-10 h-10 rounded-full border-[#685189] bg-primary/5 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110"
                    title={company.name}
                  >
                    <Image
                      src={company.logo || "/placeholder.svg"}
                      alt={company.name}
                      width={24}
                      height={24}
                      className="object-fill w-6 h-6 rounded-full opacity-70 hover:opacity-100"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* CV Button */}
            <Button className="mt-6 rounded-full px-6 py-2 flex items-center gap-2 bg-white-100 text-black hover:bg-[#685189]">
              <Download className="w-4 h-4" />
              Download CV
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

