"use client";
import AboutCard from '@/components/Website/AboutCard';
import { Button } from '@/components/ui/button';
import { profile } from '@/data';

export default function page(){
 
  return (
    <section id="about">
    <h2 className='section_title'>About Me</h2>
    <span className='section_subtitle text-white'>My introduction</span> 
  
   
    <div className="about_container mx-auto grid text-white bg-black-100">
      {profile.map((item) => {
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
          key={item.id}
          src={item.img} 
          alt={'Profile'} 
          className="about_img"
          />  
        );
      })}
      <div className="about_data">
        <AboutCard />
        {profile.map((item) => {
          return (
            <p key={item.id} className="about_description">
              {item.description}
            </p>

          );
        })}
        <Button className='w-32 bg-white-100'>
          <a  href="../assets/CV.pdf"  download>
            Download Cv
          </a>
        </Button>
      </div> 
      
    </div>
  </section>
  )
}
