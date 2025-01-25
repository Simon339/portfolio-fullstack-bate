"use client";
import { ServicesCard } from '@/components/Website/ServicesCard';
import React from 'react'

export default function page(){
    return (
        <section className="mb-4">
            <h1 className="section_title">
                Services
            </h1>
            <span className='section_subtitle'>Here is the Services that I offere</span> 
            <ServicesCard/>
        </section>
    )
}
  