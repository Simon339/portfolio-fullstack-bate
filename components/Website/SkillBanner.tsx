export const SkillsCard = () => {
  // Function to get color based on skill level
  const getColorForLevel = (level: any) => {
    if (level >= 80) return "#10B981"
    if (level >= 60) return "#3B82F6"
    if (level >= 40) return "#8B5CF6"
    return "#EC4899"
  }

  const skillCategories = [
    {
      title: "Frontend",
      skills: [
        { name: "HTML", level: 90 },
        { name: "CSS", level: 85 },
        { name: "JavaScript", level: 75 },
        { name: "Bootstrap", level: 70 },
      ],
    },
    {
      title: "Mobile",
      skills: [
        { name: "Dart", level: 65 },
        { name: "React Native", level: 40 },
      ],
    },
    {
      title: "Data",
      skills: [
        { name: "Python", level: 70 },
        { name: "Python Django", level: 60 },
        { name: "SQL", level: 65 },
        { name: "Java", level: 60 },
        { name: "VBA", level: 55 },
      ],
    },
    {
      title: "Other",
      skills: [
        { name: "Git", level: 75 },
        { name: "GitHub", level: 70 },
        { name: "Huawei 5G", level: 45 },
        { name: "Postman", level: 60 },
      ],
    },
    {
      title: "Backend",
      skills: [
        { name: "Next.js", level: 85 },
        { name: "Vite", level: 80 },
        { name: "Node.js", level: 70 },
        { name: "Api Development", level: 65 },
      ],
    },
  ]

  return (
    <div className="py-8">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-medium text-white">Technical Skills</h2>
      </div>

      <div className="space-y-12">
        {skillCategories.map((category, index) => (
          <div key={index} className="space-y-4">
            <div className="flex items-center">
              <div className="w-16 h-[1px] bg-white/20"></div>
              <h3 className="text-xs uppercase tracking-widest text-white/60 mx-3">{category.title}</h3>
              <div className="flex-1 h-[1px] bg-white/20"></div>
            </div>

            <div className="grid grid-cols-2 gap-x-12 gap-y-5">
              {category.skills.map((skill, skillIndex) => {
                const skillColor = getColorForLevel(skill.level)

                return (
                  <div key={skillIndex} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-white/80">{skill.name}</span>
                      <span className="text-[10px]" style={{ color: skillColor }}>
                        {skill.level}%
                      </span>
                    </div>
                    <div className="h-[1px] w-full bg-white/10 relative">
                     
                      <div
  className="absolute top-0 left-0 h-[1px] animate-[progressAnimation_1s_ease-out_forwards]"
  style={{
    '--target-width': `${skill.level}%`,
    backgroundColor: skillColor,
    animationDelay: `${skillIndex * 100}ms`,
  } as React.CSSProperties}
></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-12 flex justify-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-3 h-1" style={{ backgroundColor: "#EC4899" }}></div>
          <span className="text-[10px] text-white/50">Beginner</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-1" style={{ backgroundColor: "#8B5CF6" }}></div>
          <span className="text-[10px] text-white/50">Intermediate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-1" style={{ backgroundColor: "#3B82F6" }}></div>
          <span className="text-[10px] text-white/50">Proficient</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-1" style={{ backgroundColor: "#10B981" }}></div>
          <span className="text-[10px] text-white/50">Advanced</span>
        </div>
      </div>
    </div>
  )
}