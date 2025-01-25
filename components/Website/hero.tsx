import React from 'react'
// import { Spotlight } from '@/components/ui/spotlight';
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';
import { Button } from '@/components/ui/button';

export default function Hero (){
  return (
    <div className="pb-1 pt-3 sm:pb-0 sm:pt-1">
      {/* <div>
        <Spotlight
          className="-top-40 -left-10 md:-left-32 md:-top-20 h-screen"
          fill="white"
        />
        <Spotlight
          className="h-[80vh] w-[50vw] top-10 left-full"
          fill="purple"
        />
        <Spotlight className="left-80 top-28 h-[80vh] w-[50vw]" fill="blue" />
      </div> */}

      <div
        className="h-screen w-full dark:bg-black-100 bg-white dark:bg-grid-white/[0.03] bg-grid-black-100/[0.2]
       absolute top-0 left-0 flex items-center justify-center"
      >
        
        <div
          className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black-100
        [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"
        />
      </div>


      <div className="flex justify-center items-center  relative mt-5 mb-4 z-10">
        <div className="max-w-[89vw] md:max-w-3xl lg:max-w-[60vw] flex flex-col items-center justify-center">
          <p className="uppercase tracking-widest mb-8 text-xs text-center text-blue-100 max-w-80">
            Malesela&rsquo;s Portfolio
          </p>

            <TextGenerateEffect
                className="text-center text-[24px] md:text-lg lg:text-2xl sm:text-[15px]"
                words="Welcome to my Portfolio, Where Innovation Meets Execution."
            />

                <p className="welcome pb-3 mb-5 text-center tracking-wider text-sm md:text-lg lg:text-2xl">
                    Highly skilled IT consultant, Web Developer and Software developer
                </p>

                <a href='/contact'>
                  <Button
              className='bg-[#000B58] text-white font-bold mb-3 hover:bg-[#685189]'
                  >
                   Hire Me
                  </Button>
                </a>
            </div> 
        </div>    
    </div>
  );
}