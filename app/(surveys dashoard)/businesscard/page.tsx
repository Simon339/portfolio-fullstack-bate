'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { profile } from '@/data';
import { Briefcase, FolderGit2, Headphones, Mail, MapPin, Phone, User, Github, Linkedin, Twitter, Globe, ExternalLink, ArrowRight, Eye, Lock, Dot, QrCode, Share2, Download, ChevronRight } from 'lucide-react';

export const aboutcards = [
  {
    id: 1,
    title: "Experience",
    subtitle: "5 years",
    icon: Briefcase,
  },
  {
    id: 2,
    title: "Completed",
    subtitle: "24+ Projects",
    icon: FolderGit2,
  },
  {
    id: 3,
    title: "Support",
    subtitle: "Online 24/7 & On Site",
    icon: Headphones,
  },
];

const BusinessCardPage = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const router = useRouter();
  // Contact information with proper hyperlinks
  const contactInfo = {
    email: {
      value: "malesela@example.com",
      href: "mailto:malesela@example.com?subject=Business Inquiry&body=Hello Malesela,",
      icon: Mail
    },
    phone: {
      value: "+27 XX XXX XXXX",
      href: "tel:+27XXXXXXXXXX",
      icon: Phone
    },
    location: {
      value: "South Africa",
      href: "https://maps.google.com/?q=South+Africa",
      icon: MapPin
    },
    website: {
      value: "malesela.dev",
      href: "https://malesela.dev",
      icon: Globe
    }
  };

  // Social media links
  const socialLinks = [
    { icon: Github, href: "https://github.com/simon339", label: "GitHub" },
    { icon: Linkedin, href: "https://linkedin.com/in/malesela", label: "LinkedIn" },
    { icon: Twitter, href: "https://twitter.com/malesela", label: "Twitter" },
  ];

  // Services offered
  const services = [
    'Web Development',
    'Mobile Apps',
    'UI/UX Design',
    'SEO ',
    'Data Science',
    'Consulting',
    'Back-end Development'
  ];


  const handleViewProjects = () => {
    router.push('/projects');
  }; 

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Malesela Simon Malapane - Digital Business Card',
          text: 'Technology Enthusiast & Developer | Web Dev • Flutter • Cybersecurity • Data Science',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 print:p-0">
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .btn-shimmer {
          position: relative;
          overflow: hidden;
        }
        .btn-shimmer::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          animation: shimmer 2s infinite;
        }
        .contact-link {
          transition: all 0.3s ease;
        }
        .contact-link:hover {
          transform: translateY(-2px);
        }
        .card-flip-container {
          perspective: 1500px;
        }
        .card-flip-inner {
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
        }
        .card-flip-inner.is-flipped {
          transform: rotateY(180deg);
        }
        .card-front, .card-back {
          backface-visibility: hidden;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        .card-back {
          transform: rotateY(180deg);
        }
        @media print {
          body * {
            visibility: hidden;
          }
          .print-card, .print-card * {
            visibility: visible;
          }
          .print-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
          }
          .no-print {
            display: none !important;
          }
          .card-flip-container {
            perspective: none;
          }
          .card-flip-inner {
            transform: none !important;
          }
          .card-back {
            display: block;
            position: relative;
            transform: none;
            page-break-before: always;
          }
        }
      `}</style>

      <div className="max-w-md w-full print-card">
        {/* Action Buttons - Top (no-print) */}
        <div className="flex justify-end gap-2 mb-4 no-print">
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs bg-white/10 hover:bg-white/20 rounded-xl text-gray-300 hover:text-white transition-all border border-white/10 hover:border-white/20"
          >
            <QrCode size={14} />
            {isFlipped ? 'Front' : 'Back'}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-2 text-xs bg-white/10 hover:bg-white/20 rounded-xl text-gray-300 hover:text-white transition-all border border-white/10 hover:border-white/20"
          >
            <Share2 size={14} />
            Share
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-2 text-xs bg-white/10 hover:bg-white/20 rounded-xl text-gray-300 hover:text-white transition-all border border-white/10 hover:border-white/20"
          >
            <Download size={14} />
            Save
          </button>
        </div>

        {/* Business Card - Standard 3.5" x 2" ratio (1.75:1) */}
        <div className="card-flip-container relative w-full" style={{ aspectRatio: '1.45/1' }}>
          <div className={`card-flip-inner w-full h-full ${isFlipped ? 'is-flipped' : ''}`}>
            {/* FRONT OF CARD */}


            <div className="card-front relative bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-white/10 hover:border-purple-500/20 transition-all duration-300 print:border-gray-300">
              {/* Subtle pattern overlay */}
              <div className="absolute inset-0 opacity-[0.03]">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle at 25px 25px, white 2px, transparent 0)',
                  backgroundSize: '50px 50px'
                }}></div>
              </div>

              {/* Decorative gradient orbs */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>

              {/* Accent bar - Top */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600"></div>


              {/* Accent bar - Bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600/50 via-blue-500/50 to-purple-600/50"></div>
            </div>

            {/* BACK OF CARD */}
            <div className="card-back relative bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-white/10 hover:border-purple-500/20 transition-all duration-300 print:border-gray-300">
              {/* Subtle pattern overlay */}
              <div className="absolute inset-0 opacity-[0.03]">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle at 25px 25px, white 2px, transparent 0)',
                  backgroundSize: '50px 50px'
                }}></div>
              </div>

              {/* Decorative gradient orbs */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>

              {/* Accent bar - Top */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600"></div>

              {/* Card Content */}
              <div className="relative h-full p-5 flex flex-col justify-between">

                {/* Top Section: Identity */}
                <div>
                  {/* Header Row: Avatar + Name + Title + QR */}
                  <div className="flex items-start gap-3">
                    {/* Avatar/Monogram */}
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 p-0.5 shadow-lg">
                        <div className="w-full h-full rounded-xl bg-slate-800 overflow-hidden flex items-center justify-center">
                          <img
                            src="/logo.png"
                            alt="Malesela Malapane"
                            className="w-full h-full object-cover rounded-xl"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Name & Title */}
                    <div className="flex-1 min-w-0">
                      <h1 className="text-lg font-bold text-white leading-tight truncate">
                        Malesela S. Malapane
                      </h1>
                      <p className="text-xs text-gray-300 mt-0.5 font-medium">
                        Developer & IT Specialist
                      </p>
                    </div>

                    {/* QR Code */}
                    <div className="flex-shrink-0 w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
                      <QrCode size={40} className="text-slate-800" />
                    </div>
                  </div>

                  {/* Specialization Tags */}
                  <div className="mt-3 flex flex-wrap gap-1 text-white">
                    <span className="text-[10px] bg-purple/30 text-purple/90 rounded-full px-2 py-0.5 border border-purple/30 font-medium">
                      Web Developer
                    </span>
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 rounded-full px-2 py-0.5 border border-blue-500/30 font-medium">
                      Mobile developer
                    </span>
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-300 rounded-full px-2 py-0.5 border border-cyan-500/30 font-medium">
                      Back end developer
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 rounded-full px-2 py-0.5 border border-emerald-500/30 font-medium">
                      Data Science
                    </span>
                  </div>
                </div>

                {/* Middle Section: Contact Details */}
                <div className="space-y-1.5 items-end">
                  <a
                    href={contactInfo.email.href}
                    className="flex justify-end items-center gap-2.5 text-xs text-gray-300 hover:text-purple-300 transition-all group p-1.5 rounded-lg hover:bg-white/5"
                  >
                    <span className="truncate">malesela@example.com</span>
                    <Mail size={13} className="text-gray-500 group-hover:text-purple-400 flex-shrink-0 transition-colors justify-end" />
                  </a>
                  <a
                    href={contactInfo.phone.href}
                    className="flex justify-end items-center gap-2.5 text-xs text-gray-300 hover:text-purple-300 transition-all group p-1.5 rounded-lg hover:bg-white/5"
                  >
                    <span>+27 XX XXX XXXX</span>
                    <Phone size={13} className="text-gray-500 group-hover:text-purple-400 flex-shrink-0 transition-colors" />
                  </a>
                  <a
                    href={contactInfo.location.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex justify-end items-center gap-2.5 text-xs text-gray-300 hover:text-purple-300 transition-all group p-1.5 rounded-lg hover:bg-white/5"
                  >
                    <span>South Africa</span>
                    <MapPin size={13} className="text-gray-500 group-hover:text-purple-400 flex-shrink-0 transition-colors" />
                  </a>
                  <a
                    href={contactInfo.website.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex justify-end items-center gap-2.5 text-xs text-gray-300 hover:text-purple-300 transition-all group p-1.5 rounded-lg hover:bg-white/5"
                  >
                    <span>malesela.dev</span>
                    <Globe size={13} className="text-gray-500 group-hover:text-purple-400 flex-shrink-0 transition-colors" />
                  </a>
                </div>

                {/* Bottom Section: Social + CTA */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  {/* Social Links */}
                  <div className="flex items-center gap-2">
                    {socialLinks.map((social, idx) => {
                      const IconComponent = social.icon;
                      return (
                        <a
                          key={idx}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-purple-400 transition-colors p-1 rounded-lg hover:bg-white/10"
                          title={social.label}
                        >
                          <IconComponent size={14} />
                        </a>
                      );
                    })}
                  </div>

                  {/* Call to Action */}
                  <button
                    onClick={handleViewProjects}
                    className="flex items-center gap-1 text-[10px] font-medium text-gray-300 hover:text-purple-300 transition-colors group"
                  >
                    View Portfolio
                    <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Accent bar - Bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600/50 via-blue-500/50 to-purple-600/50"></div>
            </div>
          </div>
        </div>

        {/* Watermark */}
        <div className="text-center mt-3 text-[9px] text-white/20 no-print">
          Digital Business Card • Updated 2026
        </div>
      </div>
    </section>
  );
};



export default BusinessCardPage;