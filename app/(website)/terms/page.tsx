import { FileText, Scale, AlertTriangle, Book, CheckCircle, XCircle } from "lucide-react"

const Terms = () => {
   const terms = [
    {
      id: 1,
      icon: <FileText className="w-5 h-5" />,
      title: "Acceptance of Terms",
      content: "By accessing and using this website, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our website."
    },
    {
      id: 2,
      icon: <Scale className="w-5 h-5" />,
      title: "Intellectual Property",
      content: "All content on this website, including text, graphics, logos, and images, is our property or licensed to us and is protected by copyright and other intellectual property laws."
    },
    {
      id: 3,
      icon: <AlertTriangle className="w-5 h-5" />,
      title: "User Conduct",
      content: "You agree not to use the website for any unlawful purpose or in any way that could damage, disable, or impair the website or interfere with any other party's use."
    },
    {
      id: 4,
      icon: <Book className="w-5 h-5" />,
      title: "Limitation of Liability",
      content: "We are not liable for any direct, indirect, incidental, or consequential damages arising from your use of the website or any content therein."
    },
    {
      id: 5,
      icon: <CheckCircle className="w-5 h-5" />,
      title: "Permissions",
      content: "You may view and print content from this website for personal, non-commercial use, provided you do not modify the content and retain all copyright notices."
    },
    {
      id: 6,
      icon: <XCircle className="w-5 h-5" />,
      title: "Prohibited Actions",
      content: "Unauthorized use of website content, reverse engineering, data mining, or any activity that disrupts website functionality is strictly prohibited."
    }
  ]

  return (
    <section className="min-h-screen py-20 bg-black-100 text-white">
      <div className="mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-primary/10 border border-[#685189]">
              <Scale className="w-12 h-12 text-[#685189]" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <div className="w-16 h-1 bg-[#685189] mx-auto mb-6"></div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Please read these terms carefully before using our website. By using our site, you agree to these terms.
          </p>
          <p className="text-sm text-muted-foreground/70 mt-4">Effective: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        {/* Introduction */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-4 text-white">Welcome</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            These Terms of Service govern your use of our website and services. They outline your rights and 
            responsibilities as a user and our obligations as service providers. We reserve the right to update 
            these terms at any time, and continued use constitutes acceptance of changes.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            For questions about these terms, please contact us using the information provided at the bottom of this page.
          </p>
        </div>

        {/* Key Terms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {terms.map((term) => (
            <div
              key={term.id}
              className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6 transition-all hover:border-[#685189]/50 hover:bg-white/10"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-[#685189]/20 border border-[#685189]/30">
                  {term.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3 text-white">{term.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{term.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Sections */}
        <div className="space-y-8 mb-12">
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-4 text-white">Disclaimer</h3>
            <p className="text-muted-foreground mb-4">
              The information on this website is provided for general informational purposes only. While we strive 
              to keep information accurate and up-to-date, we make no representations or warranties of any kind.
            </p>
            <p className="text-muted-foreground">
              We are not responsible for any errors or omissions, or for the results obtained from the use of this information.
            </p>
          </div>

          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-4 text-white">Governing Law</h3>
            <p className="text-muted-foreground">
              These Terms shall be governed by and construed in accordance with the laws of South Africa, without 
              regard to its conflict of law provisions. Any disputes arising from these Terms will be subject to 
              the exclusive jurisdiction of the courts of South Africa.
            </p>
          </div>
        </div>

        {/* Contact & Actions */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-white">Need Help?</h2>
          <p className="text-muted-foreground mb-6">
            If you have questions about these Terms of Service or need clarification on any points, please don't 
            hesitate to reach out to us.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="mailto:simonmalapane018@protonmail.com"
              className="px-6 py-3 rounded-full border border-[#685189] bg-primary/5 hover:bg-[#685189] hover:text-white transition-all flex items-center gap-2"
            >
              <Scale className="w-4 h-4" />
              Contact Regarding Terms
            </a>
            <a
              href="/privacy"
              className="px-6 py-3 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 transition-all flex items-center gap-2"
            >
              View Privacy Policy
            </a>
          </div>
        </div>

        {/* Final Note */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-sm text-muted-foreground/60 text-center">
            By using this website, you acknowledge that you have read, understood, and agree to be bound by these 
            Terms of Service. Thank you for visiting.
          </p>
        </div>
      </div>
    </section>
  )
}

export default Terms