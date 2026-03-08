import React from 'react'
import { TextGenerateEffect } from '@/components/ui/text-generate-effect';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function Hero (){
  return (
    <div className="pb-1 pt-3 sm:pb-0 sm:pt-1">
      <div
        className="h-screen w-full bg-black-100  bg-grid-white/[0.03]
       absolute top-0 left-0 flex items-center justify-center"
      >
        
        <div
          className="absolute pointer-events-none inset-0 flex items-center justify-center bg-black-100
        [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"
        />
      </div>


      <div className="flex justify-center items-center relative mt-5 mb-4 z-10">
        <div className="max-w-[89vw] md:max-w-3xl lg:max-w-[60vw] flex flex-col items-center justify-center">
          <p className="uppercase tracking-widest mb-8 text-xs text-center text-blue-100 max-w-80">
            Malesela&rsquo;s Portfolio
          </p>

            <TextGenerateEffect
                className="text-center text-[24px] md:text-lg lg:text-2xl sm:text-[15px] text-white"
                words="Welcome to my Portfolio, Where Innovation Meets Execution."
            />

                <p className="welcome pb-3 mb-5 text-center tracking-wider text-sm md:text-lg lg:text-2xl">
                    Highly skilled IT consultant, Web Developer and Software developer
                </p>

                <a href='/contact'>
                  <Button
                    className="group relative overflow-hidden px-6 py-3 bg-[#000B58] text-white font-bold mb-3 
                      hover:bg-[#685189] transition-all duration-300 ease-out
                      hover:scale-105 hover:shadow-lg hover:shadow-[#000B58]/40
                      border border-transparent hover:border-white/20"
                  >
                    {/* Glow effect - behind the text */}
                    <span className="absolute inset-0 bg-gradient-to-r from-[#000B58] via-[#685189] to-[#000B58] 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Button content */}
                    <span className="relative z-10 flex items-center gap-2">
                      Hire Me
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                    
                    {/* Shine effect - moves across */}
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
                      translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
                  </Button>
                </a>
            </div> 
        </div>    
    </div>
  );
}