"use client";

import Pagination from '@/components/Website/pagination'
import { InfiniteMovingCards } from '@/components/ui/infinite-moving-cards';

export default function page() {
  return (
    <section className="py-12 mt-6 text-white">
      <div className="flex flex-col items-center mb-12">
        <h1 className="text-3xl text-center font-bold text-white">
          Project
        </h1>
        <div className="w-12 h-1 items-center justify-center bg-white/20 mx-auto mb-3"></div>
        <span className="text-muted-foreground text-center max-w-md">
          A small Selection of {' '}Recent Projects
        </span>
      </div>

      <Pagination />
      <section className='mb-2 mt-1'>
        <div className="flex flex-col items-center mb-2">
          <h2 className="text-3xl font-bold text-white">My clients Says</h2>
          <div className="w-12 h-1 bg-white/20 mx-auto mb-3"></div>
          <span className="text-muted-foreground text-center max-w-md">Testimonial</span>
        </div>

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
  {
    quote: "Excellent service! The website creator was professional, responsive, and delivered a great website that met my needs. Highly recommended!",
    name: "Mr. Vincent Magotlho Founder of Magotlho TN Solutions",
    title: "Magotlho TN Solutions (PTY) LTD",
  },
];


/*<Filters  /> Add pagination  and fix text and insect new filter button try Headless UI
        
        <Pagination />*/
