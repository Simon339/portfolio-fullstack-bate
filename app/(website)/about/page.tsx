"use client"

import AboutCard from "@/components/Website/AboutCard"
import { Button } from "@/components/ui/button"
import { profile, companies } from "@/data"
import { Download } from "lucide-react"
import Image from "next/image"

export default function About() {

  return (
    <section id="about" className="py-20 bg-black-100 text-white">
      <div className="mx-auto px-4 max-w-6xl">
        <div className="flex flex-col items-center mb-12">
          <h2 className="text-3xl font-bold mb-2">About Me</h2>
          <div className="w-12 h-1 bg-primary mb-6"></div>
          <p className="text-muted-foreground text-center max-w-md">My introduction</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Profile Image */}
          <div className="flex justify-center lg:justify-end">
            {profile.map((item) => (
              <div key={item.id} className="relative w-80 h-80 overflow-hidden rounded-2xl border-4 border-[#685189]">
                <Image
                  src={item.img || "/placeholder.png"}
                  alt="Profile"
                  fill
                  className="object-cover about_img"
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
              <p className="text-sm text-muted-foreground mb-4">
                Companies I&apos;ve worked with:
              </p>
              <div className="flex flex-wrap gap-4 items-center">
                {companies.map((company) => (
                  <div
                    key={company.id}
                    className="w-10 h-10 rounded-full border border-[#685189] bg-primary/5 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 hover:border-primary overflow-hidden"
                    title={company.name}
                  >
                    <Image
                      src={company.logo || "/placeholder.svg"}
                      alt={company.name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* CV Button */}
            <div className="pt-2">
              <Button className="rounded-full px-8 py-3 flex items-center gap-2 bg-white text-black hover:bg-[#685189] hover:text-white transition-all">
                <Download className="w-4 h-4" />
                Download CV
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}