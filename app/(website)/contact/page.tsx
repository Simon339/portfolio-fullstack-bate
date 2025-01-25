import ContactForm from '@/components/Website/ContactForm'
import { ChevronRight, Linkedin, MailCheck, Phone } from 'lucide-react'
import React from 'react'

export default function page(){
  return (
    <section id="contact">
      <h2 className="section_title">Get in touch</h2>
      <span className="section_subtitle">Contact Me</span>

      <div className="contact_container container grid">
        <div className="contact_content">
          <h3 className="contact_title">Talk to me</h3>

          <div className="contact_info">

            <div
              className="contact_card backdrop-blur-md"
            >
              <MailCheck className="text-center contact_card-icon" />

              <h3 className="contact_card-title">Email</h3>
              <span className="contact_card-data">simonmalapane018@gmail.com</span>

              <a href="mailto:simonmalapane018@gmail.com" className="contact_button">Write me{" "} <ChevronRight className="contact_button-icon" /></a>
            </div>

            <div
              className="contact_card backdrop-blur-md"
            >
              <Phone className="contact_card-icon" />

              <h3 className="contact_card-title">Phone Call</h3>
              <span className="contact_card-data">0813124016</span>

              <a href="tel:0813124016" className="contact_button">Write me{" "} <ChevronRight className="contact_button-icon" /></a>

            </div>

            <div
              className="contact_card backdrop-blur-md"
            >
              <Linkedin className="contact_card-icon" />

              <h3 className="contact_card-title">LinkedIn</h3>
              <span className="contact_card-data">Malesela Simon</span>

              <a href="https://www.linkedin.com/in/Simon Malesela" className="contact_button">Write me{" "} <ChevronRight className="contact_button-icon" /></a>
            </div>

          </div>
        </div>
        <ContactForm />
      </div>
    </section>
  )
}
