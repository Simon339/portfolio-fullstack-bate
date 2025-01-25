"use client";
import Pagination from '@/components/Website/pagination'
import { InfiniteMovingCards } from '@/components/ui/infinite-moving-cards';
import React from 'react'

export default function page() {
  return (
    <section className="mb-4">
      <h1 className="section_title">
        Project
      </h1>
      <span className="section_subtitle">
        A small Selection of {' '}Recent Projects
      </span>
      <Pagination />
      <section className='mb-1'>
        <h2 className="section_title text-gray-300">My clients Says</h2>
        <span className="section_subtitle text-gray-400">Testimonial</span>
        <div className="testimonial_container">
          <InfiniteMovingCards
            items={testimonials}
            direction="right"
            speed="slow"
          />
        </div>
      </section>
    </section >
  )
}

const testimonials = [
  {
    quote:
      "I'm extremely impressed with the website—it’s beyond excellent. The design is sleek and modern, and the functionality is top-notch. Every element is perfectly placed, making the site not only beautiful but also incredibly easy to use. It's clear that a lot of thought went into creating this seamless experience. For anyone seeking a website that excels in both style and performance, this is it.",
    name: "Funder",
    title: "BB Financial Acquaintance",
  },
  {
    quote:
      "Absolutely stunning website—truly exceeds all expectations! Malesela has delivered exceptional work, capturing every detail with precision. The result is a flawless, professional site that perfectly represents our brand. Highly recommend!",
    name: "Director of BB Financial",
    title: "BB Financial Acquaintance",
  },
  {
    quote: "It looks absolutely perfect! I plan to take more photos this week and will send them over for you to add. Thanks for your amazing work!",
    name: "Founder of Thutokelesedi",
    title: "Thutokelesedi",
  },
];


/*<Filters  /> Add pagination  and fix text and insect new filter button try Headless UI
        
        <Pagination />*/