"use client";

import React, { useRef, useEffect } from 'react';
import { aboutcards } from '@/data';

const AboutCard = () => {
  const ref = useRef(null);

  useEffect(() => {
    import("@lottiefiles/lottie-player");
  }, []);


  return (
    <div className="about_info grid text-white">
      {aboutcards.map((item) => {
      return (     
        <div key={item.id} className="about_box">
          <div>
          <lottie-player
            id="about"
            ref={ref}
            src={item.icon} 
            autoplay
            loop
            mode="normal"
            className="about_icon" 
          ></lottie-player>
          </div>
          <h3 className='about_title'>{item.title}</h3>
          <span className="about_subtitle italic">{item.subtitle}</span>
        </div>
      );
    })}
    </div>
  )
}

export default AboutCard