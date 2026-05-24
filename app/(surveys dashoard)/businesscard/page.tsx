"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, MapPin, Phone, Github, Linkedin, Twitter, Globe, ArrowRight, QrCode, Share2, Download, Code2, Sparkles, Cpu, ServerCog, Headset } from "lucide-react"

const BusinessCardPage = () => {
  const [isFlipped, setIsFlipped] = useState(false)
  const router = useRouter()

  const contactInfo = {
    email: {
      value: "simonmalapane018@protonmail.com",
      href: "mailto:simonmalapane018@protonmail.com?subject=Business Inquiry&body=Hello Malesela,",
      icon: Mail,
    },
    phone: {
      value: "081 897 4649",
      href: "tel:+27818974649",
      icon: Phone,
    },
    location: {
      value: "South Africa",
      href: "https://maps.google.com/?q=South+Africa",
      icon: MapPin,
    },
    website: {
      value: "m-s-portfolio.vercel.app",
      href: "https://m-s-portfolio.vercel.app",
      icon: Globe,
    },
  }

  const socialLinks = [
    { icon: Github, href: "https://github.com/simon339", label: "GitHub" },
    { icon: Linkedin, href: "https://linkedin.com/in/malesela", label: "LinkedIn" },
    { icon: Twitter, href: "https://twitter.com/malesela", label: "Twitter" },
  ]

  const handleViewProjects = () => {
    router.push("/projects")
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Malesela Simon Malapane - Digital Business Card",
          text: "Technology Enthusiast & Developer | Web Dev • Flutter • Cybersecurity • Data Science • Backend Dev",
          url: window.location.href,
        })
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  const handleDownload = () => {
    window.print()
  }

  return (
    <section className="min-h-screen bg-[#000319] flex items-center justify-center p-3 sm:p-4 md:p-6 print:p-0 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-r from-amber-500/8 to-orange-500/8 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 -right-32 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-r from-amber-600/6 to-yellow-500/6 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] md:w-[800px] md:h-[800px] bg-gradient-radial from-amber-500/3 to-transparent rounded-full" />
      </div>

      <div className="w-full max-w-[420px] sm:max-w-md md:max-w-lg print-card relative z-10">
        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-4 sm:mb-6 no-print">
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="group flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs font-medium bg-white/5 hover:bg-white/10 rounded-full text-zinc-400 hover:text-amber-400 transition-all duration-300 border border-white/10 hover:border-amber-500/30"
          >
            <QrCode size={14} className="group-hover:rotate-12 transition-transform" />
            <span>{isFlipped ? "View Front" : "View Back"}</span>
          </button>
          <button
            onClick={handleShare}
            className="group flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs font-medium bg-white/5 hover:bg-white/10 rounded-full text-zinc-400 hover:text-amber-400 transition-all duration-300 border border-white/10 hover:border-amber-500/30"
          >
            <Share2 size={14} className="group-hover:scale-110 transition-transform" />
            Share
          </button>
          <button
            onClick={handleDownload}
            className="group flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-[11px] sm:text-xs font-medium bg-white/5 hover:bg-white/10 rounded-full text-zinc-400 hover:text-amber-400 transition-all duration-300 border border-white/10 hover:border-amber-500/30"
          >
            <Download size={14} className="group-hover:translate-y-0.5 transition-transform" />
            Save
          </button>
        </div>

        {/* Business Card Container */}
        <div className="card-flip-container relative w-full" style={{ aspectRatio: "1.6 / 1.1" }}>
          <div className={`card-flip-inner w-full h-full ${isFlipped ? "is-flipped" : ""}`}>
            {/* Front Side */}
            <div className="card-front relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/5 shadow-2xl shadow-black/50">
              {/* Background layers */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800" />

              {/* Subtle grid pattern */}
              <div
                className="absolute inset-0 opacity-[0.02]"
                style={{
                  backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                  backgroundSize: "40px 40px",
                }}
              />

              {/* Diagonal accent line */}
              <div className="absolute top-0 right-0 w-[200%] h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent origin-top-right rotate-[-35deg] translate-y-32" />

              {/* Corner accent */}
              <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24">
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-10 h-10 sm:w-16 sm:h-16 border border-amber-500/10 rounded-full" />
                <div className="absolute top-5 right-5 sm:top-6 sm:right-6 w-7 h-7 sm:w-10 sm:h-10 border border-amber-500/15 rounded-full" />
              </div>

              {/* Main content */}
              <div className="relative h-full p-4 sm:p-6 md:p-8 flex flex-col justify-between">
                {/* Top section - Decorative */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500/60" />
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-amber-500/40" />
                    <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-amber-500/20" />
                  </div>
                  <div className="text-[8px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] text-zinc-600 uppercase font-light">
                    Est. 2020
                  </div>
                </div>

                {/* Center - Name & Identity */}
                <div className="flex-1 flex flex-col justify-center items-center text-center -mt-2 sm:-mt-4">
                  {/* Monogram/Logo */}
                  <div className="relative mb-3 sm:mb-5">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 flex items-center justify-center backdrop-blur-sm">
                      <div className="w-full h-full rounded-lg sm:rounded-xl bg-slate-800 overflow-hidden flex items-center justify-center">
                        <img
                          src="/logo.png"
                          alt="Malesela Malapane"
                          className="w-full h-full object-cover rounded-lg sm:rounded-xl"
                        />
                      </div>
                    </div>
                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent blur-lg -z-10" />
                  </div>

                  {/* Name */}
                  <h1
                    className="text-lg sm:text-xl md:text-2xl font-light tracking-wide text-white mb-0.5 sm:mb-1"
                    style={{ fontFamily: "Playfair Display, serif" }}
                  >
                    Malesela Simon
                  </h1>
                  <h2
                    className="shimmer-text text-sm sm:text-base md:text-lg font-medium tracking-widest uppercase mb-2 sm:mb-4"
                    style={{ fontFamily: "Playfair Display, serif" }}
                  >
                    Malapane
                  </h2>

                  {/* Title */}
                  <div className="flex items-center gap-2 sm:gap-3 text-zinc-500">
                    <div className="h-[1px] w-5 sm:w-8 bg-gradient-to-r from-transparent to-zinc-700" />
                    <span className="text-[9px] sm:text-[11px] tracking-[0.15em] sm:tracking-[0.2em] uppercase font-light whitespace-nowrap">
                      Developer & IT Specialist
                    </span>
                    <div className="h-[1px] w-5 sm:w-8 bg-gradient-to-l from-transparent to-zinc-700" />
                  </div>
                </div>

                {/* Bottom section - Expertise tags */}
                <div className="flex flex-wrap justify-center gap-x-2 sm:gap-x-3 md:gap-x-4 gap-y-1 text-[8px] sm:text-[9px] text-zinc-600 tracking-wider uppercase">
                  <span className="flex items-center gap-1 sm:gap-1.5">
                    <Code2 size={9} className="text-amber-500/50 sm:size-[10px]" />
                    Web
                  </span>
                  <span className="flex items-center gap-1 sm:gap-1.5">
                    <Cpu size={9} className="text-amber-500/50 sm:size-[10px]" />
                    Mobile
                  </span>
                  <span className="flex items-center gap-1 sm:gap-1.5">
                    <ServerCog size={9} className="text-amber-500/50 sm:size-[10px]" />
                    Backend
                  </span>
                  <span className="flex items-center gap-1 sm:gap-1.5">
                    <Headset size={9} className="text-amber-500/50 sm:size-[10px]" />
                    Consultant
                  </span>
                  <span className="flex items-center gap-1 sm:gap-1.5">
                    <Sparkles size={9} className="text-amber-500/50 sm:size-[10px]" />
                    Data Sci
                  </span>
                </div>
              </div>

              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
            </div>

            <div className="card-back relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/5 shadow-2xl shadow-black/50">
              {/* Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800" />

              {/* Subtle pattern */}
              <div
                className="absolute inset-0 opacity-[0.015]"
                style={{
                  backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                  backgroundSize: "24px 24px",
                }}
              />

              {/* Top accent */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

              {/* Card Content */}
              <div className="relative h-full p-3 sm:p-5 md:p-6 flex flex-col justify-between">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    {/* Mini Avatar */}
                    <div className="w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <div className="w-full h-full rounded-lg sm:rounded-xl bg-slate-800 overflow-hidden flex items-center justify-center">
                        <img
                          src="/logo.png"
                          alt="Malesela Malapane"
                          className="w-full h-full object-cover rounded-lg sm:rounded-xl"
                        />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <h3
                        className="text-xs sm:text-sm md:text-base font-medium text-white tracking-wide truncate"
                        style={{ fontFamily: "Playfair Display, serif" }}
                      >
                        Malesela S. Malapane
                      </h3>
                      <p className="text-[8px] sm:text-[10px] text-zinc-500 tracking-wider uppercase mt-0.5 truncate">
                        Developer & IT Specialist
                      </p>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="relative w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 bg-white rounded-md sm:rounded-lg flex items-center justify-center shadow-lg shadow-black/20 group flex-shrink-0">
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=40x40&data=/services"
                      alt="QR Code to services"
                      className="w-full h-full object-contain p-1 rounded-md sm:rounded-lg"
                    />
                    {/* Tooltip message */}
                    <div className="absolute bottom-full right-0 sm:left-1/2 sm:-translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] sm:text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      You can click Reserve to fill form
                      <div className="absolute top-full right-3 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 -mt-px border-4 border-transparent border-t-gray-900"></div>
                    </div>
                    {/* Hidden anchor that redirects on click */}
                    <a href="/services" className="absolute inset-0 rounded-md sm:rounded-lg" aria-label="Services"></a>
                  </div>
                </div>

                {/* Specialization Tags */}
                <div className="flex flex-wrap gap-1 sm:gap-1.5 mt-2 sm:mt-3">
                  <span className="text-[8px] sm:text-[9px] bg-amber-500/10 text-amber-400/90 rounded-full px-2 sm:px-2.5 py-0.5 sm:py-1 border border-amber-500/20 font-medium tracking-wide">
                    Web Developer
                  </span>
                  <span className="text-[8px] sm:text-[9px] bg-blue-500/10 text-blue-400/90 rounded-full px-2 sm:px-2.5 py-0.5 sm:py-1 border border-blue-500/20 font-medium tracking-wide">
                    Mobile Apps
                  </span>
                  <span className="text-[8px] sm:text-[9px] bg-emerald-500/10 text-emerald-400/90 rounded-full px-2 sm:px-2.5 py-0.5 sm:py-1 border border-emerald-500/20 font-medium tracking-wide">
                    Backend
                  </span>
                  <span className="text-[8px] sm:text-[9px] bg-violet-500/10 text-violet-400/90 rounded-full px-2 sm:px-2.5 py-0.5 sm:py-1 border border-violet-500/20 font-medium tracking-wide">
                    Data Science
                  </span>
                </div>

                {/* Contact Details */}
                <div className="space-y-0.5 sm:space-y-1 mt-2 sm:mt-3">
                  <a
                    href={contactInfo.email.href}
                    className="flex items-center justify-end gap-2 text-[10px] sm:text-[11px] text-zinc-400 hover:text-amber-400 transition-all group py-1 sm:py-1.5 px-1.5 sm:px-2 rounded-md sm:rounded-lg hover:bg-white/5"
                  >
                    <span className="truncate">{contactInfo.email.value}</span>
                    <Mail
                      size={11}
                      className="text-zinc-600 group-hover:text-amber-500 flex-shrink-0 transition-colors sm:size-3"
                    />
                  </a>
                  <a
                    href={contactInfo.phone.href}
                    className="flex items-center justify-end gap-2 text-[10px] sm:text-[11px] text-zinc-400 hover:text-amber-400 transition-all group py-1 sm:py-1.5 px-1.5 sm:px-2 rounded-md sm:rounded-lg hover:bg-white/5"
                  >
                    <span>{contactInfo.phone.value}</span>
                    <Phone
                      size={11}
                      className="text-zinc-600 group-hover:text-amber-500 flex-shrink-0 transition-colors sm:size-3"
                    />
                  </a>
                  <a
                    href={contactInfo.location.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-end gap-2 text-[10px] sm:text-[11px] text-zinc-400 hover:text-amber-400 transition-all group py-1 sm:py-1.5 px-1.5 sm:px-2 rounded-md sm:rounded-lg hover:bg-white/5"
                  >
                    <span>{contactInfo.location.value}</span>
                    <MapPin
                      size={11}
                      className="text-zinc-600 group-hover:text-amber-500 flex-shrink-0 transition-colors sm:size-3"
                    />
                  </a>
                  <a
                    href={contactInfo.website.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-end gap-2 text-[10px] sm:text-[11px] text-zinc-400 hover:text-amber-400 transition-all group py-1 sm:py-1.5 px-1.5 sm:px-2 rounded-md sm:rounded-lg hover:bg-white/5"
                  >
                    <span className="truncate">{contactInfo.website.value}</span>
                    <Globe
                      size={11}
                      className="text-zinc-600 group-hover:text-amber-500 flex-shrink-0 transition-colors sm:size-3"
                    />
                  </a>
                </div>

                {/* Footer - Social + CTA */}
                <div className="flex items-center justify-between pt-2 sm:pt-3 mt-1 sm:mt-2 border-t border-white/5 gap-2">
                  {/* Social Links */}
                  <div className="flex items-center gap-0.5 sm:gap-1">
                    {socialLinks.map((social, idx) => {
                      const IconComponent = social.icon
                      return (
                        <a
                          key={idx}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-600 hover:text-amber-400 transition-all p-1.5 sm:p-2 rounded-md sm:rounded-lg hover:bg-white/5"
                          title={social.label}
                          aria-label={social.label}
                        >
                          <IconComponent size={13} className="sm:size-[14px]" />
                        </a>
                      )
                    })}
                  </div>

                  {/* CTA */}
                  <button
                    onClick={handleViewProjects}
                    className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] font-medium text-zinc-500 hover:text-amber-400 transition-all group px-2 sm:px-3 py-1 sm:py-1.5 rounded-full hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 whitespace-nowrap"
                  >
                    View Portfolio
                    <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Bottom accent */}
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
            </div>
          </div>
        </div>

        {/* Click hint */}
        <div className="text-center mt-3 sm:mt-4 no-print">
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="text-[9px] sm:text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer"
          >
            Click card or button to flip
          </button>
        </div>

        {/* Watermark */}
        <div className="text-center mt-1.5 sm:mt-2 text-[8px] sm:text-[9px] text-zinc-800 no-print tracking-widest uppercase">
          Digital Business Card
        </div>
      </div>
    </section>
  )
}

export default BusinessCardPage;
