import ContactForm from "@/components/Website/ContactForm"
import { ChevronRight, Linkedin, MailCheck, Phone } from "lucide-react"

export default function ContactPage() {
  return (
    <section id="contact" className="py-16 ">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-2 text-white ">Get in touch</h2>
        <div className="w-12 h-1 bg-white/20 mx-auto mb-3"></div>
        <span className="text-muted-foreground text-center max-w-md">Contact Me</span>
      </div>

      <div className="contact_container px-4 grid gap-10">
        <div className="space-y-6">
          <h3 className="text-xl font-semibold mb-4 text-white">Talk to me</h3>

          <div className="grid grid-cols-1 gap-4">
            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-lg p-4 transition-all hover:border-white/20 flex items-center">
              <div className="p-2 rounded-full bg-white/10 mr-4">
                <MailCheck className="w-4 h-4 text-white" />
              </div>

              <div className="flex-1">
                <h3 className="text-sm font-medium text-white">Email</h3>
                <span className="text-white/70 text-xs">simonmalapane018@gmail.com</span>
              </div>

              <a href="mailto:simonmalapane018@gmail.com" className="text-white/80 hover:text-white transition-colors">
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>

            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-lg p-4 transition-all hover:border-white/20 flex items-center">
              <div className="p-2 rounded-full bg-white/10 mr-4">
                <Phone className="w-4 h-4 text-white" />
              </div>

              <div className="flex-1">
                <h3 className="text-sm font-medium text-white">Phone</h3>
                <span className="text-white/70 text-xs">0813124016</span>
              </div>

              <a href="tel:0813124016" className="text-white/80 hover:text-white transition-colors">
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>

            <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-lg p-4 transition-all hover:border-white/20 flex items-center">
              <div className="p-2 rounded-full bg-white/10 mr-4">
                <Linkedin className="w-4 h-4 text-white" />
              </div>

              <div className="flex-1">
                <h3 className="text-sm font-medium text-white">LinkedIn</h3>
                <span className="text-white/70 text-xs">Malesela Simon</span>
              </div>

              <a
                href="https://www.linkedin.com/in/Simon-Malesela"
                className="text-white/80 hover:text-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <ContactForm />
      </div>
    </section>
  )
}



