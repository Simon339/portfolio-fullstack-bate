"use client"

import { EducationCard } from "@/components/Website/EducationCard";
import { SkillsCard } from "@/components/Website/SkillBanner";
import { educationData } from "@/data";


export default function pages() {
    return (
        <section className="text-white">
            <h2 className="section_title">Qualifications</h2>
            <span className="section_subtitle">My Personnal Journey</span>

            <div className="qualification_container container grid">
                <div className="qualification_group">
                    <h3 className="qualification_heading">Education</h3>

                    <div className="qualifications_items">
                        {educationData.map((val, id) => {
                            if(val.category === 'education') {
                                return(
                                    <EducationCard
                                        key={id} 
                                        title={val.title} 
                                        subtitle={val.subtitle} 
                                        date={val.date} 
                                        description={val.description} 
                                    />
                                );
                            }
                        })}
                    </div>
                </div>

                <div className="qualification_group">
                    <h3 className="qualification_heading">Online Certificate</h3>

                    <div className="qualifications_items">
                        {educationData.map((val, id) => {
                            if(val.category === 'online certificate') {
                                return(
                                    <EducationCard
                                    key={id} 
                                    title={val.title} 
                                    subtitle={val.subtitle} 
                                    date={val.date} 
                                    description={val.description} 
                                    />
                                );
                            }
                        })}
                    </div>
                </div>
            </div>
            <SkillsCard/>
        </section>
    );
}