
import React from 'react'
import Frontend from './Front-end';
import MobileDeveloper from './Mobilecard';
import DataScience from './DataScience';
import Other from './Other';
import BackEnd from './Back-end';


export const SkillsCard = () => {
  return (

    <div className="skills section" id="skills">
      <h2 className="section_title">My Technical skils</h2>
      <span className="section_subtitle">I&apos;m proficient in a wide range of technologies and tools to build amazing digital experiences.</span>

      <div className="skills_container container grid">
        
        <Frontend />
        <MobileDeveloper />
        <DataScience />
        <Other />
        <BackEnd />   
      </div>
    </div>
  );
}

