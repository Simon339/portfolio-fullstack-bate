"use client";
import { ServicesCard } from '@/components/Website/ServicesCard';
import React from 'react'

export default function page(){
    return (
        <section className="py-12">
            <div className="flex flex-col items-center mb-12 mt-8">
            <h1 className="text-3xl font-bold mb-4 text-center text-white ">
                Services
            </h1>
            <div className="w-12 h-1 justify-center items-center bg-white/20 mx-auto mb-3"></div>
            <span className='text-muted-foreground text-center max-w-md'>Here is the Services that I offere</span> 
            </div>
            
            <ServicesCard/>
        </section>
    )
}
  