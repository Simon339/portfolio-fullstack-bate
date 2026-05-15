"use client"

import { EducationCard } from "@/components/Website/EducationCard"
import { SkillsCard } from "@/components/Website/SkillBanner"
import { educationData } from "@/data"

export default function QualificationsPage() {
  return (
    <section className="py-12 mb-2">
      <div className="flex flex-col items-center mb-12 mt-8">
        <h2 className="text-3xl font-bold mb-1 text-white">Qualifications</h2>
        <div className="w-12 h-1 bg-white/20 mx-auto mb-3"></div>
        <span className="text-white/50 text-sm">My Personal Journey</span>
      </div>

      <div className="qualification_container container grid">
        <div>
          <h3 className="text-sm uppercase tracking-wider text-white/40 mb-4">Education</h3>
          <div className="space-y-1">
            {educationData.map((val, id) => {
              if (val.category === "education") {
                return (
                  <EducationCard
                    key={id}
                    title={val.title}
                    subtitle={val.subtitle}
                    date={val.date}
                    description={val.description}
                  />
                )
              }
            })}
          </div>
        </div>

        <div>
          <h3 className="text-sm uppercase tracking-wider text-white/40 mb-4">Online Certificate</h3>
          <div className="space-y-1">
            {educationData.map((val, id) => {
              if (val.category === "online certificate") {
                return (
                  <EducationCard
                    key={id}
                    title={val.title}
                    subtitle={val.subtitle}
                    date={val.date}
                    description={val.description}
                  />
                )
              }
            })}
          </div>
        </div>
      </div>

      <div className="qualification_container container mt-4">
        <SkillsCard />
      </div>
    </section>
  )
}

