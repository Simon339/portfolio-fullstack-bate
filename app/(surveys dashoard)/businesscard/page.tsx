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
  const profileData = profile[0];
  const [viewCount, setViewCount] = useState<number>(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);
  const router = useRouter();

  // Admin credentials (in production, use environment variables and proper auth)
  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';

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
    'Cybersecurity',
    'Data Science',
    'Consulting'
  ];

  // Check if user is admin from localStorage
  useEffect(() => {
    const adminStatus = localStorage.getItem('isBusinessCardAdmin');
    if (adminStatus === 'true') {
      setIsAdmin(true);
    }
  }, []);

  // Generate a unique device ID
  const getDeviceId = () => {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  };

  // Track unique visitor
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        const deviceId = getDeviceId();
        const hasVisited = localStorage.getItem(`visited_${deviceId}`);
        
        if (!hasVisited) {
          // First time visit from this device
          const response = await fetch('/api/track-visitor', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ deviceId }),
          });
          
          if (response.ok) {
            const data = await response.json();
            if (isAdmin) {
              setViewCount(data.viewCount);
            }
            localStorage.setItem(`visited_${deviceId}`, 'true');
          }
        } else if (isAdmin) {
          // Get current view count for admin
          const response = await fetch('/api/get-view-count');
          if (response.ok) {
            const data = await response.json();
            setViewCount(data.viewCount);
          }
        }
      } catch (error) {
        console.error('Error tracking visitor:', error);
      } finally {
        setIsLoading(false);
      }
    };

    trackVisitor();
  }, [isAdmin]);

  const handleViewProjects = () => {
    router.push('/projects');
  };

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdmin(true);
      localStorage.setItem('isBusinessCardAdmin', 'true');
      setShowAdminModal(false);
      setAdminPassword('');
      
      // Fetch view count after login
      fetch('/api/get-view-count')
        .then(res => res.json())
        .then(data => setViewCount(data.viewCount));
    } else {
      alert('Invalid password');
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('isBusinessCardAdmin');
    setViewCount(0);
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
      
      {/* Admin Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-[fadeIn_0.3s_ease-out]">
          <div className="bg-gradient-to-br from-slate-800 to-purple-900 rounded-2xl p-6 max-w-md w-full border border-purple-500/30 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-purple-500/20">
                <Lock className="text-purple-400" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Admin Access</h2>
                <p className="text-gray-400 text-sm">View visitor analytics</p>
              </div>
            </div>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
              placeholder="Enter admin password"
              className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 mb-4 transition-all"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleAdminLogin}
                className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-semibold transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => {
                  setShowAdminModal(false);
                  setAdminPassword('');
                }}
                className="flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-gray-300 font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
        <div className="card-flip-container relative w-full" style={{ aspectRatio: '1.75/1' }}>
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
                          {profileData.img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img 
                              src={profileData.img} 
                              alt="Malesela Malapane" 
                              className="w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            <span className="text-xl font-bold text-white">MM</span>
                          )}
                        </div>
                      </div>
                      {/* Online status indicator */}
                      <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-slate-800 shadow-lg"></div>
                    </div>

                    {/* Name & Title */}
                    <div className="flex-1 min-w-0">
                      <h1 className="text-lg font-bold text-white leading-tight truncate">
                        Malesela S. Malapane
                      </h1>
                      <p className="text-xs text-purple-300 mt-0.5 font-medium">
                        Technology Enthusiast & Developer
                      </p>
                    </div>

                    {/* QR Code */}
                    <div className="flex-shrink-0 w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
                      <QrCode size={24} className="text-slate-800" />
                    </div>
                  </div>

                  {/* Specialization Tags */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    <span className="text-[10px] bg-purple-500/20 text-purple-300 rounded-full px-2 py-0.5 border border-purple-500/30 font-medium">
                      Web Developer
                    </span>
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 rounded-full px-2 py-0.5 border border-blue-500/30 font-medium">
                      Flutter
                    </span>
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-300 rounded-full px-2 py-0.5 border border-cyan-500/30 font-medium">
                      Cybersecurity
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 rounded-full px-2 py-0.5 border border-emerald-500/30 font-medium">
                      Data Science
                    </span>
                  </div>
                </div>

                {/* Middle Section: Contact Details */}
                <div className="space-y-1.5">
                  <a 
                    href={contactInfo.email.href}
                    className="flex items-center gap-2.5 text-xs text-gray-300 hover:text-purple-300 transition-all group p-1.5 rounded-lg hover:bg-white/5"
                  >
                    <Mail size={13} className="text-gray-500 group-hover:text-purple-400 flex-shrink-0 transition-colors" />
                    <span className="truncate">malesela@example.com</span>
                  </a>
                  <a 
                    href={contactInfo.phone.href}
                    className="flex items-center gap-2.5 text-xs text-gray-300 hover:text-purple-300 transition-all group p-1.5 rounded-lg hover:bg-white/5"
                  >
                    <Phone size={13} className="text-gray-500 group-hover:text-purple-400 flex-shrink-0 transition-colors" />
                    <span>+27 XX XXX XXXX</span>
                  </a>
                  <a 
                    href={contactInfo.location.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-xs text-gray-300 hover:text-purple-300 transition-all group p-1.5 rounded-lg hover:bg-white/5"
                  >
                    <MapPin size={13} className="text-gray-500 group-hover:text-purple-400 flex-shrink-0 transition-colors" />
                    <span>South Africa</span>
                  </a>
                  <a 
                    href={contactInfo.website.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-xs text-gray-300 hover:text-purple-300 transition-all group p-1.5 rounded-lg hover:bg-white/5"
                  >
                    <Globe size={13} className="text-gray-500 group-hover:text-purple-400 flex-shrink-0 transition-colors" />
                    <span>malesela.dev</span>
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
                    className="flex items-center gap-1 text-[10px] font-medium text-purple-400 hover:text-purple-300 transition-colors group"
                  >
                    View Portfolio
                    <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>

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
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>

              {/* Accent bar - Top */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-500 to-blue-600"></div>

              <div className="relative h-full p-5 flex flex-col justify-between">
                
                {/* Top Section: About */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <User size={14} className="text-purple-400" />
                    <h3 className="text-xs font-semibold text-purple-300 uppercase tracking-wider">About Me</h3>
                  </div>
                  <p className="text-[10px] text-gray-300 leading-relaxed line-clamp-3">
                    {profileData.description}
                  </p>
                </div>

                {/* Middle Section: Key Stats */}
                <div className="grid grid-cols-3 gap-1.5">
                  {aboutcards.map((card) => {
                    const IconComponent = card.icon;
                    return (
                      <div key={card.id} className="text-center p-2 bg-white/5 rounded-lg border border-white/5">
                        <IconComponent size={14} className="text-purple-400 mx-auto mb-1" />
                        <p className="text-base font-bold text-white">{card.subtitle}</p>
                        <p className="text-[9px] text-gray-400">{card.title}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Services Section */}
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Briefcase size={14} className="text-purple-400" />
                    <h3 className="text-xs font-semibold text-purple-300 uppercase tracking-wider">Services</h3>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {services.map((service, idx) => (
                      <span 
                        key={idx}
                        className="text-[9px] bg-white/10 text-gray-300 rounded-full px-2 py-0.5 border border-white/5 font-medium"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Section: Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <p className="text-[9px] text-gray-400">© 2026 Malesela Malapane</p>
                  <button
                    onClick={handleViewProjects}
                    className="flex items-center gap-1 text-[10px] font-medium text-purple-400 hover:text-purple-300 transition-colors group"
                  >
                    Get in Touch
                    <ChevronRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Accent bar - Bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600/50 via-purple-500/50 to-blue-600/50"></div>
            </div>
          </div>
        </div>

        {/* Admin Controls - Bottom (no-print) */}
        <div className="flex justify-center mt-4 no-print">
          {!isAdmin ? (
            <button
              onClick={() => setShowAdminModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded-lg transition-all"
              title="Admin Access"
            >
              <Lock size={10} />
              Admin
            </button>
          ) : (
            <div className="flex items-center gap-3 bg-white/5 rounded-full px-3 py-1.5 border border-white/10">
              <span className="text-[10px] text-gray-300 flex items-center gap-1">
                <Eye size={10} className="text-green-400" />
                {isLoading ? (
                  <span className="inline-block w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  `${viewCount} ${viewCount === 1 ? 'view' : 'views'}`
                )}
              </span>
              <span className="text-gray-600">|</span>
              <button
                onClick={handleAdminLogout}
                className="text-[10px] text-gray-400 hover:text-red-400 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
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