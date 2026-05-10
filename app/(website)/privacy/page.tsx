import { Database, Eye, Shield, Lock, Server, Users } from 'lucide-react'
import React from 'react'

const Privacy = () => {
  const sections = [
    {
      id: 1,
      icon: <Database className="w-5 h-5" />,
      title: "Information We Collect",
      content: "We collect information you provide directly to us, such as when you contact us and service through forms. This may include your name/company, email address, phone number, and any messages you send."
    },
    {
      id: 2,
      icon: <Eye className="w-5 h-5" />,
      title: "How We Use Information",
      content: "We use the information we collect to respond to your inquiries, provide services, improve our website, and communicate with you about updates or opportunities that may interest you."
    },
    {
      id: 3,
      icon: <Shield className="w-5 h-5" />,
      title: "Data Protection",
      content: "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction."
    },
    {
      id: 4,
      icon: <Lock className="w-5 h-5" />,
      title: "Data Retention",
      content: "We retain personal information only for as long as necessary to fulfill the purposes for which it was collected, including for the purposes of satisfying any legal or reporting requirements."
    },
    {
      id: 5,
      icon: <Server className="w-5 h-5" />,
      title: "Third-Party Services",
      content: "We may use third-party services for hosting, analytics, and communication. These services have their own privacy policies governing how they use your information."
    },
    {
      id: 6,
      icon: <Users className="w-5 h-5" />,
      title: "Your Rights",
      content: "You have the right to access, correct, or delete your personal information. You may also object to or restrict certain processing of your data. Contact us to exercise these rights."
    }
  ]

  return (
    <section className="min-h-screen py-20 bg-black-100 text-white">
      <div className="mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-primary/10 border border-[#685189]">
              <Shield className="w-12 h-12 text-[#685189]" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <div className="w-16 h-1 bg-[#685189] mx-auto mb-6"></div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
          <p className="text-sm text-muted-foreground/70 mt-4">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        {/* Introduction */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-4 text-white">Introduction</h2>
          <p className="text-muted-foreground leading-relaxed">
            This Privacy Policy describes how we handle your personal information when you visit our website, 
            contact us through forms, or interact with our services. We are committed to protecting your privacy 
            and ensuring transparency in our data practices.
          </p>
        </div>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {sections.map((section) => (
            <div
              key={section.id}
              className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6 transition-all hover:border-[#685189]/50 hover:bg-white/10"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-[#685189]/20 border border-[#685189]/30">
                  {section.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3 text-white">{section.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{section.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4 text-white">Contact Us</h2>
          <p className="text-muted-foreground mb-6">
            If you have any questions about this Privacy Policy or how we handle your data, please contact us.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="mailto:simonmalapane018@protonmail.com"
              className="px-6 py-3 rounded-full border border-[#685189] bg-primary/5 hover:bg-[#685189] hover:text-white transition-all flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Email Privacy Questions
            </a>
            <a
              href="/contact"
              className="px-6 py-3 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 transition-all flex items-center gap-2"
            >
              Go to Contact
            </a>
            <a
              href="/serveices"
              className="px-6 py-3 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 transition-all flex items-center gap-2"
            >
              Go to services
            </a>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-sm text-muted-foreground/60 text-center">
            This Privacy Policy may be updated periodically. We encourage you to review this page regularly 
            for any changes. Your continued use of our website after any modifications constitutes acceptance 
            of the updated policy.
          </p>
        </div>
      </div>
    </section>
  )
}

export default Privacy