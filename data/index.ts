export const ROUTES = [
  {
    id: 1,
    name: "Home",
    path: "/",
  },
  {
    id: 2,
    name: "About",
    path: "/about",
  },
  {
    id: 3,
    name: "My Journey",
    path: "/my-journey",
  },
  {
    id: 4,
    name: "Services",
    path: "/services",
  },
  {
    id: 5,
    name: "Projects",
    path: "/projects",
  },
  {
    id: 6,
    name: "Contact",
    path: "/contact",
  },
];

export const profile = [
  {
    id: 1,
    description:
      "Hello, I'm Malesela Simon Malapane, a technology enthusiast with experise in Web Developer, Flutter, Cybersecurity, Data Science and React. As a student, I've gained hands-on experience through various projects, delivering results that exceed client expectations. I'm excited to bring my skills and passion to new opprtunities.",
    img: "/assets/Profile.jpg",
    //"/assets/Profile.jpg"
  },
];

// Company logos 
export const companies = [
  { id: 1, logo: "/assets/company/BB.png", name: "BB FINANCIAL ACQUAINTANCE" },
  { id: 2, logo: "/assets/company/ME.png", name: "Mixed Emotions" },
  { id: 3, logo: "/assets/company/mictsate.png", name: "MICTSETA" },
  {
    id: 4,
    logo: "/assets/company/TN-logo.png",
    name: "Magotlho TN Solutions (PTY) LTD",
  },
  {
    id: 5,
    logo: "/assets/company/Thutokelesedi.png",
    name: "Thuto ke Lesedi Kasie Tutorial",
  },
  { id: 6, 
    logo: "/assets/company/VersityFinds.png", 
    name: "Versity Finds" 
  },
];

export const aboutcards = [
  {
    id: 1,
    title: "Experience",
    subtitle: "5 years",
    icon: "/Json/Experience.json",
  },
  {
    id: 2,
    title: "Completed",
    subtitle: "24+ Projects",
    icon: "/Json/Projects.json",
  },
  {
    id: 3,
    title: "Support",
    subtitle: "Online 24/7 & On Site",
    icon: "/Json/Support.json",
  },
];

export const projectsData = [
  {
    id: 1,
    title: "BB FINANCIAL ACQUAINTANCE",
    category: "website",
    demoUrl: "https://simon339.github.io/BB_website_2023/",
    techStack: ["HTML", "CSS", "Bootstrap", "Java"],
    image: "/assets/Projects/BB-financialmockup2.png",
    description:
      "For BB Financial Acquaintance, a registered provider of professional bookkeeping services, I designed and developed a comprehensive website that effectively communicates the company's commitment to delivering cost-effective and efficient financial solutions for businesses of all sizes. The platform was strategically crafted to simplify complex bookkeeping processes, offering visitors intuitive access to essential services including receipt organization, invoice management, and purchase order tracking. With a focus on user experience, the website features a clean, professional layout with responsive design principles ensuring seamless functionality across all devices. Clear calls-to-action guide users through service exploration while emphasizing the tangible benefits of outsourcing financial management. The final product serves as both an informational hub and a lead generation tool, enhancing BB Financial Acquaintance's market presence and establishing trust through transparent service representation.",
    features: [
      {
        name: "Document Management System",
        description:
          "Organizes essential business documents including receipts, invoices, and purchase orders in a structured digital format for easy retrieval and management",
      },
      {
        name: "User-Friendly Interface",
        description:
          "Clean, intuitive layout with clear calls-to-action that guides users through service exploration with minimal learning curve",
      },
      {
        name: "Responsive Design",
        description:
          "Fully responsive implementation that ensures optimal viewing experience across all devices including desktop, tablet, and mobile",
      },
      {
        name: "Professional Platform",
        description:
          "Corporate-grade website design that enhances company reputation and establishes credibility in the financial services sector",
      },
      {
        name: "Service Accessibility",
        description:
          "Easy access to comprehensive bookkeeping services with clear service descriptions and transparent value propositions",
      },
      {
        name: "Cost-Effective Solutions",
        description:
          "Showcases affordable outsourcing options for small to medium-sized businesses seeking professional financial management",
      },
      {
        name: "Value Communication",
        description:
          "Clearly communicates the benefits of financial outsourcing through well-structured content and visual demonstrations",
      },
    ],
  },
  {
    id: 2,
    title: "Social Network Chatapp",
    category: "app",
    demoUrl: "/ui.aiimg.com",
    techStack: ["Dart", "Firebase"],
    image: "/assets/Projects/Chatapp-mockup.png",
    description:
      "The Social Network Chatapp represents an innovative fusion of real-time messaging technology and social networking capabilities, inspired by platforms like X (formerly Twitter). This advanced communication solution enables users to engage in dynamic conversations, share multimedia content, and build meaningful connections within an active digital community. Built with scalability in mind, the app features a modern, intuitive interface designed to maximize user engagement through interactive elements and seamless navigation. Core functionalities include instant messaging with read receipts, content sharing with rich media support, customizable user profiles with privacy controls, and intelligent notification systems. The platform supports both individual and group communications while maintaining robust security protocols. This project demonstrates sophisticated backend architecture integrated with real-time database solutions to deliver responsive, reliable performance that fosters genuine social interaction and community building.",
    features: [
      {
        name: "Real-Time Messaging",
        description:
          "Instant message delivery with read receipts and typing indicators for seamless synchronous communication",
      },
      {
        name: "User Authentication System",
        description:
          "Secure login and registration system with profile personalization options and privacy control settings",
      },
      {
        name: "Content Sharing Platform",
        description:
          "Rich media sharing capabilities including images, videos, and documents with preview functionality",
      },
      {
        name: "Cross-Platform Compatibility",
        description:
          "Native application performance across iOS, Android, and web platforms with consistent user experience",
      },
      {
        name: "End-to-End Encryption",
        description:
          "Military-grade encryption for all messages ensuring complete privacy and security for user communications",
      },
      {
        name: "Push Notification System",
        description:
          "Intelligent notification delivery for new messages with customizable alert preferences",
      },
      {
        name: "Modern Interface Design",
        description:
          "Contemporary UI with intuitive navigation patterns and accessibility considerations for diverse user needs",
      },
    ],
  },
  {
    id: 3,
    title: "Food App",
    category: "app",
    demoUrl: "/ui.aiimg.com",
    techStack: ["Dart", "Firebase"],
    image: "/assets/Projects/FoodApp-Mockup.png",
    description:
      "This comprehensive food delivery application bridges the gap between local restaurants and customers seeking convenient dining solutions, with particular emphasis on supporting small and medium-sized culinary businesses. Modeled after industry leaders like Uber Eats, the platform provides users with extensive restaurant discovery tools, detailed menu browsing, and streamlined ordering processes that culminate in efficient doorstep delivery. For restaurant partners, the app offers a cost-effective digital storefront complete with inventory management, order tracking, and customer relationship features. The user experience is enhanced through personalized recommendations based on order history, secure multi-payment gateway integration, real-time delivery tracking with geolocation, and push notifications for order updates. Designed with accessibility in mind, the application maintains responsive performance across mobile and web platforms while prioritizing data security and transaction reliability to build consumer trust and encourage repeat usage.",
    features: [
      {
        name: "Restaurant Discovery System",
        description:
          "Comprehensive restaurant listings with detailed menus, pricing, ratings, and location-based filtering",
      },
      {
        name: "Secure Payment Processing",
        description:
          "Multiple payment gateway integration with encrypted transaction processing and receipt generation",
      },
      {
        name: "Real-Time Order Tracking",
        description:
          "Live GPS tracking of delivery personnel with estimated time of arrival updates and route visualization",
      },
      {
        name: "Personalized Recommendations",
        description:
          "AI-driven suggestion system based on user preferences, order history, and browsing patterns",
      },
      {
        name: "User Registration & Authentication",
        description:
          "Secure account creation and management system with social login options and profile customization",
      },
      {
        name: "Restaurant Rating System",
        description:
          "Comprehensive rating and review platform for restaurants with verified customer feedback",
      },
      {
        name: "Order Update Notifications",
        description:
          "Push notification system for order status updates from preparation through to delivery completion",
      },
      {
        name: "Order History Management",
        description:
          "Complete order tracking system with favorites saving, reordering capabilities, and spending analytics",
      },
    ],
  },
  {
    id: 4,
    title: "Mental Healthapp",
    category: "app",
    demoUrl: "/ui.aiimg.com",
    techStack: ["Dart", "Firebase", "SQLite", "Bloc", "Hive"],
    image: "/assets/Projects/Mental-Healthapp-Mockup.png",
    description:
      "This holistic mental wellness platform provides users with comprehensive tools and resources for daily emotional management and psychological well-being. Developed with privacy and accessibility as core principles, the application offers a secure digital environment where individuals can track mood patterns through visual journals, access professionally-guided meditation sessions, practice therapeutic breathing exercises, and connect with licensed therapists via encrypted chat or video consultations. The platform incorporates evidence-based approaches to mental health support, delivering personalized wellness recommendations through adaptive algorithms that learn from user interactions. Advanced data protection measures ensure complete confidentiality of sensitive information, while offline functionality allows for continuous access to core features. This project represents a significant contribution to digital mental health solutions, combining clinical insights with user-centered design to create a supportive ecosystem for emotional self-care and professional intervention.",
    features: [
      {
        name: "Daily Mood Tracking",
        description:
          "Visual journal system for emotional monitoring with trend analysis and pattern recognition capabilities",
      },
      {
        name: "Guided Meditation Library",
        description:
          "Extensive collection of professionally-guided meditation sessions categorized by focus and duration",
      },
      {
        name: "Therapeutic Breathing Exercises",
        description:
          "Interactive breathing techniques with visual guidance and duration customization for stress relief",
      },
      {
        name: "Therapist Consultation Platform",
        description:
          "Secure encrypted chat and video consultation system with licensed mental health professionals",
      },
      {
        name: "Personalized Mental Health Tips",
        description:
          "AI-generated wellness recommendations based on user mood patterns and interaction history",
      },
      {
        name: "Confidential Data Protection",
        description:
          "End-to-end encryption for all sensitive user data with local storage options for enhanced privacy",
      },
      {
        name: "Secure Local Storage",
        description:
          "Offline data persistence using Hive database for continuous access to core features without internet",
      },
    ],
  },
  {
    id: 5,
    title: "Brand T-shirt design",
    category: "design",
    demoUrl: "/ui.aiimg.com",
    techStack: [],
    image: "/assets/Projects/T-shirt.png",
    description:
      "This comprehensive branding project involved conceptualizing and executing a complete visual identity system for a clothing line, with particular focus on merchandise design and brand coherence. The design process encompassed extensive market research, trend analysis, and target audience profiling to develop distinctive graphic elements that resonate with contemporary fashion consumers. Final deliverables included high-resolution vector artwork suitable for various printing techniques, multiple color palette options for seasonal collections, and typographic treatments that complement the brand's personality. All design assets were optimized for diverse applications including screen printing, embroidery, and digital marketing while maintaining visual consistency across product lines. The project demonstrates sophisticated understanding of fashion branding principles, from initial concept development through to production-ready file preparation, ensuring market-ready products that effectively communicate brand values through wearable art.",
    features: [
      {
        name: "Custom Logo Design",
        description:
          "Original logo creation with typographic treatments that reflect brand personality and market positioning",
      },
      {
        name: "Multiple Color Schemes",
        description:
          "Diverse color palette options for seasonal collections and special edition releases",
      },
      {
        name: "Vector Artwork Production",
        description:
          "High-resolution vector graphics optimized for various printing techniques and scaling requirements",
      },
      {
        name: "Responsive Design Adaptation",
        description:
          "Design elements optimized for different product types and sizes while maintaining brand consistency",
      },
      {
        name: "Production-Ready Files",
        description:
          "Complete file packages including digital and print-ready formats for manufacturing partners",
      },
      {
        name: "Brand Identity Integration",
        description:
          "Visual elements that seamlessly integrate with overall brand identity and marketing materials",
      },
      {
        name: "Merchandise Versatility",
        description:
          "Designs adaptable across various merchandise types including apparel, accessories, and promotional items",
      },
    ],
  },
  {
    id: 6,
    title: "Thuto ke lesedi Tutorials",
    category: "website",
    demoUrl: "https://simon339.github.io/Thutokelesedi-website/",
    techStack: ["HTML", "CSS", "Bootstrap", "Java"],
    image: "/assets/Projects/Thutokelesedimockup2.png",
    description:
      "This educational initiative website represents a comprehensive digital platform for Thuto ke Lesedi Kasie Tutorial, a community-driven organization dedicated to academic empowerment in underserved African communities. The website serves as both informational resource and operational hub, detailing the organization's founding philosophy rooted in transformative education and community upliftment. Beyond basic institutional presentation, the platform facilitates direct engagement through online application systems, virtual consultation scheduling, and multimedia content showcasing program impact. Specialized sections provide detailed curriculum information, tutor profiles with qualifications, and success stories that demonstrate tangible outcomes. The design incorporates multilingual support to accommodate diverse linguistic backgrounds while maintaining intuitive navigation for users with varying digital literacy. This project embodies the convergence of social mission and technological implementation, creating a scalable digital presence that supports the organization's goal of breaking cycles of poverty through accessible, quality education.",
    features: [
      {
        name: "Online Application System",
        description:
          "Digital application processing with form validation, document upload, and status tracking capabilities",
      },
      {
        name: "Impact Gallery",
        description:
          "Multimedia showcase of program outcomes with before/after comparisons and success story highlights",
      },
      {
        name: "Team Member Profiles",
        description:
          "Comprehensive staff and tutor introductions with qualifications, expertise, and contact information",
      },
      {
        name: "Contact Management System",
        description:
          "Integrated contact forms with automated response and inquiry tracking for efficient communication",
      },
      {
        name: "Multilingual Support",
        description:
          "Language translation capabilities to accommodate diverse linguistic communities and improve accessibility",
      },
      {
        name: "Live Session Integration",
        description:
          "Real-time virtual classroom capabilities with instructor-led sessions and interactive learning tools",
      },
      {
        name: "Organizational Information Hub",
        description:
          "Detailed About Us section with mission, vision, history, and impact metrics presentation",
      },
      {
        name: "Professional Design Implementation",
        description:
          "Clean, responsive design with intuitive navigation optimized for educational content presentation",
      },
    ],
  },
  {
    id: 7,
    title: "Count down",
    category: "website",
    demoUrl: "https://simon339.github.io/Countdown-time/",
    techStack: ["HTML", "CSS", "Bootstrap", "Java"],
    image: "/assets/Projects/Count-downmockup2.png",
    description:
      "This interactive web application delivers an immersive countdown experience specifically designed for New Year's celebrations and other significant chronological milestones. The platform combines sophisticated time calculation algorithms with engaging visual presentation to create anticipatory excitement through real-time temporal tracking. Dynamic animations and festive graphic elements respond to the diminishing time intervals, while responsive design ensures consistent experience across desktop, tablet, and mobile devices. Additional features include social sharing capabilities for collaborative celebration, customizable countdown targets for personal events, and ambient audio options to enhance the celebratory atmosphere. The project demonstrates advanced frontend development techniques including precise interval management, CSS animation optimization, and cross-browser compatibility solutions, resulting in a lightweight yet visually compelling digital experience that transforms temporal anticipation into engaging user interaction.",
    features: [
      {
        name: "Real-Time Countdown Timer",
        description:
          "Precise second-by-second countdown calculation with millisecond accuracy for exact temporal tracking",
      },
      {
        name: "Festive Animation System",
        description:
          "Dynamic visual effects and celebratory animations that respond to countdown progression",
      },
      {
        name: "User-Friendly Interface",
        description:
          "Intuitive design with clear time displays and minimal controls for effortless user interaction",
      },
      {
        name: "Responsive Design Framework",
        description:
          "Adaptive layout that maintains visual integrity and functionality across all screen sizes and devices",
      },
      {
        name: "Social Sharing Integration",
        description:
          "Easy sharing capabilities across social media platforms for collaborative event participation",
      },
      {
        name: "Celebration Theme Customization",
        description:
          "Multiple visual themes and customization options for different types of celebratory events",
      },
      {
        name: "Digital Companion Experience",
        description:
          "Immersive interactive experience that enhances anticipation and engagement for special occasions",
      },
    ],
  },
  {
    id: 8,
    title: "JARVIS Ai",
    category: "ai",
    demoUrl: "/ui.aiimg.com",
    techStack: ["Python"],
    image: "/assets/Projects/jarvis-ai.jpg",
    description:
      "JARVIS AI represents an advanced artificial intelligence platform engineered to function as a comprehensive personal and professional assistant, drawing conceptual inspiration from sophisticated AI systems while implementing practical, real-world applications. The system leverages cutting-edge natural language processing capabilities to interpret complex user commands, contextualize requests, and execute multi-step tasks across integrated digital environments. Core functionalities include intelligent scheduling with calendar synchronization, automated email management with sentiment-aware responses, smart device control through IoT integration, and data analysis with predictive insights generation. The platform incorporates machine learning algorithms that adapt to individual user patterns, preferences, and communication styles, creating increasingly personalized interaction experiences over time. This project demonstrates sophisticated AI implementation with particular emphasis on practical utility, privacy-conscious design, and seamless integration with existing digital ecosystems for both individual productivity enhancement and organizational workflow optimization.",
    features: [
      {
        name: "Natural Language Processing",
        description:
          "Advanced NLP capabilities for intuitive command interpretation and conversational interaction",
      },
      {
        name: "Voice Recognition System",
        description:
          "Accurate speech-to-text conversion with multi-language support and voice command execution",
      },
      {
        name: "Third-Party Integration",
        description:
          "Seamless connectivity with external applications and services through API integration",
      },
      {
        name: "Real-Time Data Analysis",
        description:
          "Live data processing with predictive analytics and comprehensive reporting capabilities",
      },
      {
        name: "Personalized User Experience",
        description:
          "Adaptive interface that learns from user behavior to provide customized interactions and recommendations",
      },
      {
        name: "Task Automation Engine",
        description:
          "Intelligent automation of repetitive tasks and complex workflow orchestration",
      },
      {
        name: "Predictive Insight Generation",
        description:
          "Data-driven forecasting and intelligent recommendations based on historical patterns and trends",
      },
    ],
  },
  {
    id: 9,
    title: "MICTSETA JobPortal",
    category: "website",
    demoUrl: "/ui.aiimg.com",
    techStack: ["Next.js", "Tailwind", "Auth.js", "Prisma", "PostgreSQL"],
    image: "/assets/Projects/MICTSATE.png",
    description:
      "This specialized employment platform serves the Media, Information and Communications Technologies Sector Education and Training Authority (MICTSETA) by connecting job seekers with opportunities in ICT, media, and telecommunications sectors. The comprehensive portal features dual interfaces tailored for both candidates and employers, with advanced matching algorithms that align skills, experience, and qualifications with relevant positions. Job seekers benefit from sophisticated search functionality with multi-criteria filtering, automated application tracking, resume building tools with industry-specific templates, and personalized career development recommendations. Employers gain access to candidate management systems with applicant screening features, job posting templates optimized for sector requirements, and analytics dashboards for recruitment metrics. The platform integrates educational resources and certification tracking specific to MICTSETA's skills development mandate, creating a holistic ecosystem that supports career progression within South Africa's growing digital economy.",
    features: [
      {
        name: "Advanced Job Search Filters",
        description:
          "Multi-criteria search functionality with category, location, salary, and skill-based filtering options",
      },
      {
        name: "Application Tracking System",
        description:
          "Integrated ATS for employers with candidate screening, interview scheduling, and hiring workflow management",
      },
      {
        name: "Intelligent Skill Matching",
        description:
          "Algorithm-based candidate-job matching with compatibility scoring and recommendation systems",
      },
      {
        name: "Company Profile Management",
        description:
          "Comprehensive employer profiles with job listings, company information, and recruitment analytics",
      },
      {
        name: "HR Management Panel",
        description:
          "Administrative interface for job post management, application review, and candidate communication",
      },
      {
        name: "User Account System",
        description:
          "Secure account creation with resume upload, profile management, and application tracking",
      },
      {
        name: "Job Application Tracking",
        description:
          "Real-time status updates and notification system for job applications and interview invitations",
      },
      {
        name: "Professional Development Resources",
        description:
          "Career advancement tools including resume builders, interview preparation, and skills training materials",
      },
    ],
  },
  {
    id: 10,
    title: "WhatsApp Clone UI",
    category: "app",
    demoUrl: "/ui.aiimg.com",
    techStack: ["React.js"],
    image: "/assets/Projects/Whatsapp-clone.png",
    description:
      "This user interface replication project meticulously reconstructs the visual and interactive elements of WhatsApp's popular messaging platform while implementing custom backend functionality for educational and developmental purposes. The interface delivers pixel-perfect responsiveness across device formats, maintaining the familiar navigation patterns and visual hierarchy that users expect from established messaging applications. Core components include animated chat bubbles with delivery status indicators, multimedia attachment interfaces with preview capabilities, contact lists with presence indicators, and settings panels with extensive customization options. The project emphasizes frontend engineering excellence through optimized rendering performance, accessibility compliance, and cross-platform consistency while demonstrating understanding of real-time communication interface design principles. This implementation serves as both a technical demonstration of UI/UX proficiency and a foundation for custom messaging solution development.",
    features: [
      {
        name: "Chat Interface System",
        description:
          "Complete messaging interface with multimedia support, emoji integration, and message status indicators",
      },
      {
        name: "Real-Time Notifications",
        description:
          "Instant push notifications for new messages with customizable alert preferences and vibration patterns",
      },
      {
        name: "User Profile Customization",
        description:
          "Comprehensive profile management with photo upload, status updates, and privacy settings",
      },
      {
        name: "Voice & Video Calling",
        description:
          "Integrated communication features with call quality indicators and connection status monitoring",
      },
      {
        name: "Group Chat Management",
        description:
          "Multi-participant chat rooms with admin controls, member management, and broadcast messaging",
      },
      {
        name: "Familiar Interface Design",
        description:
          "Pixel-perfect UI replication with intuitive navigation patterns and consistent user experience",
      },
      {
        name: "Cross-Platform Responsiveness",
        description:
          "Optimized performance across mobile and web platforms with adaptive layout configurations",
      },
    ],
  },
  {
    id: 11,
    title: "Pie Chart Feature",
    category: "app",
    demoUrl: "/ui.aiimg.com",
    techStack: ["Dart"],
    image: "/assets/Projects/Pie-chart-Features.png",
    description:
      "This specialized Flutter package provides developers with sophisticated data visualization capabilities through animated, interactive pie chart components designed for mobile and web applications. The feature-rich implementation offers extensive customization options including dynamic color schemes, interactive segment highlighting with touch feedback, animated transitions between data states, and responsive scaling across device resolutions. Advanced functionalities include real-time data updating without complete widget rebuilds, export capabilities to multiple formats (PNG, PDF, CSV), and accessibility features for visually impaired users. The package architecture emphasizes performance optimization through efficient canvas rendering and minimal state management overhead, making it suitable for data-intensive applications. This project demonstrates deep understanding of Flutter's graphics subsystem, mathematical visualization principles, and developer experience considerations through comprehensive documentation and example implementations.",
    features: [
      {
        name: "Dynamic Chart Generation",
        description:
          "Real-time pie chart creation with automatic segment calculation and proportional visualization",
      },
      {
        name: "Animated Transitions",
        description:
          "Smooth visual effects for data changes with configurable animation duration and easing functions",
      },
      {
        name: "Interactive Data Segments",
        description:
          "Touch-responsive chart elements with hover details, selection highlighting, and tap interactions",
      },
      {
        name: "Customizable Color Schemes",
        description:
          "Flexible color configuration with theme support, gradient options, and accessibility considerations",
      },
      {
        name: "Real-Time Data Visualization",
        description:
          "Live data updates without widget rebuilds for efficient performance in data-intensive applications",
      },
      {
        name: "Data Export Capabilities",
        description:
          "Multi-format export options including PNG images, PDF reports, and CSV data files",
      },
      {
        name: "Accessibility Features",
        description:
          "Screen reader support, high contrast modes, and keyboard navigation for inclusive design",
      },
      {
        name: "Easy Integration Framework",
        description:
          "Simple implementation with comprehensive documentation and example code snippets",
      },
    ],
  },
  {
    id: 12,
    title: "React Todo-App",
    category: "app",
    demoUrl: "/ui.aiimg.com",
    techStack: ["React.js"],
    image: "/assets/Projects/React-ToDo-App.png",
    description:
      "This productivity application exemplifies modern React development practices through implementation of a feature-complete task management system with emphasis on user experience and data persistence. The application architecture employs component-based design patterns with efficient state management, delivering responsive interactions through optimized rendering pipelines. Core functionalities include intelligent task categorization with tag systems, priority-based sorting algorithms, deadline tracking with visual indicators, and comprehensive filtering options for workflow management. Local storage integration ensures data persistence across sessions while maintaining application performance through efficient data serialization. The interface design follows minimalist principles with intuitive gesture controls, keyboard shortcut support, and accessibility compliance for diverse user needs. This project demonstrates full-stack frontend development proficiency with particular emphasis on state management optimization, user interaction design, and progressive enhancement strategies.",
    features: [
      {
        name: "Task Management System",
        description:
          "Complete CRUD operations for task creation, editing, deletion, and organization with drag-and-drop support",
      },
      {
        name: "Completion Tracking",
        description:
          "Visual indicators and progress tracking for completed tasks with undo/redo functionality",
      },
      {
        name: "Advanced Filtering System",
        description:
          "Multi-criteria filtering by status, priority, category, and due date for efficient task organization",
      },
      {
        name: "Persistent Local Storage",
        description:
          "Browser-based data persistence with efficient serialization and automatic backup mechanisms",
      },
      {
        name: "User Onboarding Experience",
        description:
          "Intuitive tutorial system and guided setup for new users with progressive feature introduction",
      },
      {
        name: "Minimalist Interface Design",
        description:
          "Clean, distraction-free UI with keyboard shortcuts and efficient workflow optimization",
      },
      {
        name: "Real-Time Task Updates",
        description:
          "Instant synchronization of task changes across all interface components without page refresh",
      },
    ],
  },
  {
    id: 13,
    title: "Login-Feature",
    category: "app",
    demoUrl: "/ui.aiimg.com",
    techStack: ["Dart", "Firebase"],
    image: "/assets/Projects/Login-Feature.jpg",
    description:
      "This authentication module provides comprehensive user management capabilities for Flutter applications, implementing secure, scalable, and user-friendly access control systems. The feature supports multiple authentication methods including traditional email/password combinations, OAuth2 integration with major social platforms, and biometric verification where device hardware permits. Security implementations include encrypted credential storage, session management with automatic renewal, and optional two-factor authentication with time-based one-time passwords. User experience considerations encompass intuitive form validation with real-time feedback, password strength evaluation with progressive requirements, and seamless error recovery flows. The modular architecture allows for easy integration with existing user databases while providing hooks for custom authentication logic. This project demonstrates sophisticated understanding of security protocols, cross-platform compatibility challenges, and user experience optimization in authentication workflows.",
    features: [
      {
        name: "Email & Password Authentication",
        description:
          "Secure credential-based login system with password encryption and secure storage protocols",
      },
      {
        name: "Social Media Integration",
        description:
          "OAuth2 integration with popular social platforms including Google, Facebook, and Apple for seamless login",
      },
      {
        name: "Password Recovery System",
        description:
          "Comprehensive forgot password functionality with secure reset links and identity verification",
      },
      {
        name: "Two-Factor Authentication",
        description:
          "Enhanced security with time-based one-time passwords and backup authentication methods",
      },
      {
        name: "Error Handling Framework",
        description:
          "Robust error management with user-friendly messages and automated recovery procedures",
      },
      {
        name: "Secure Session Management",
        description:
          "Encrypted session token handling with automatic renewal and timeout protection",
      },
      {
        name: "Onboarding Optimization",
        description:
          "Streamlined user registration and login processes with progressive form completion",
      },
    ],
  },
  {
    id: 14,
    title: "ToDo App",
    category: "app",
    demoUrl: "/ui.aiimg.com",
    techStack: ["Dart", "Hive"],
    image: "/assets/Projects/ToDo-App.jpg",
    description:
      "This task management application leverages Flutter's capabilities with Hive database integration to deliver exceptional offline performance and data persistence. The architecture implements efficient local storage strategies that maintain application responsiveness even with extensive task collections, utilizing Hive's lightweight NoSQL structure for rapid CRUD operations. Feature implementations include sophisticated task organization through nested categorization systems, smart notification scheduling with device alarm integration, and data synchronization preparedness for future cloud integration. The user interface incorporates adaptive theming with automatic light/dark mode detection, gesture-based task manipulation, and visual progress tracking through completion metrics. Performance optimization techniques include lazy loading for extensive task lists, efficient state management through provider patterns, and minimal memory footprint through optimized data serialization. This project demonstrates practical implementation of local-first application design with emphasis on reliability and user experience.",
    features: [
      {
        name: "Task Prioritization System",
        description:
          "Intelligent task categorization with priority levels, tags, and custom organizational structures",
      },
      {
        name: "Local Storage Integration",
        description:
          "Hive NoSQL database implementation for fast, efficient local data persistence without internet dependency",
      },
      {
        name: "Data Persistence Assurance",
        description:
          "Guaranteed data retention across app restarts and device reboots with automatic backup mechanisms",
      },
      {
        name: "Dark/Light Mode Support",
        description:
          "Automatic theme detection with manual override options for personalized visual preferences",
      },
      {
        name: "Offline Task Management",
        description:
          "Complete functionality without internet connectivity with sync preparedness for future online integration",
      },
      {
        name: "Due Date Reminders",
        description:
          "Smart notification scheduling with device alarm integration and customizable alert timing",
      },
      {
        name: "Completion Analytics",
        description:
          "Visual progress tracking with completion statistics and productivity trend analysis",
      },
      {
        name: "Efficient CRUD Operations",
        description:
          "Rapid task creation, reading, updating, and deletion with optimized database queries",
      },
    ],
  },
  {
    id: 15,
    title: "Student Res",
    category: "website",
    demoUrl: "/ui.aiimg.com",
    techStack: ["HTML", "CSS", "Bootstrap", "Java"],
    image: "/assets/Projects/Student-Res-Mockup.jpg",
    description:
      "This comprehensive accommodation platform specifically addresses the unique housing needs of student populations by connecting academic institutions, property managers, and students in a purpose-built digital ecosystem. The platform features sophisticated property discovery tools with geographic filtering around educational campuses, detailed amenity comparison matrices, and virtual tour capabilities for remote property evaluation. Student-specific functionalities include academic calendar integration for lease period alignment, roommate matching algorithms based on compatibility factors, and financial planning tools for budget management. Administrative interfaces provide property managers with occupancy analytics, maintenance request tracking, and automated communication systems for tenant updates. Security implementations include verified student status confirmation, secure payment processing for deposits and rentals, and privacy controls for personal information. This project demonstrates understanding of specialized marketplace requirements with emphasis on trust, convenience, and community building.",
    features: [
      {
        name: "Student Profile Management",
        description:
          "Comprehensive student account system with academic verification and personal preference tracking",
      },
      {
        name: "Property Search Engine",
        description:
          "Advanced filtering options by location, price, amenities, and proximity to educational institutions",
      },
      {
        name: "Room Booking System",
        description:
          "Integrated calendar booking with availability tracking and reservation management",
      },
      {
        name: "Interactive Map Interface",
        description:
          "Geographic property visualization with campus proximity indicators and transportation routing",
      },
      {
        name: "Administrative Control Panel",
        description:
          "Comprehensive admin interface for property management, tenant communication, and occupancy tracking",
      },
      {
        name: "Real-Time Availability Updates",
        description:
          "Instant notification system for room availability changes and booking confirmations",
      },
      {
        name: "Secure Authentication System",
        description:
          "Multi-factor login protection with encrypted password storage and session management",
      },
    ],
  },
  {
    id: 16,
    title: "DevChat",
    category: "app",
    demoUrl: "https://devchat-v1.vercel.app/",
    techStack: ["Tailwind", "Vite", "Appwrite", "React Router", "React Query"],
    image: "/assets/Projects/devchat.png",
    description:
      "DevChat establishes a specialized communication platform designed exclusively for software developers, providing both real-time collaboration tools and community building features tailored to technical workflows. The platform implements sophisticated code collaboration features including syntax-highlighted snippet sharing, integrated code execution environments for multiple languages, and version-controlled collaborative editing. Community aspects include topic-based channel organization, reputation systems through peer recognition, and knowledge base creation through conversation archiving. Technical implementations emphasize low-latency messaging through WebSocket connections, efficient asset delivery for code files and documentation, and scalable infrastructure for concurrent user sessions. The interface design prioritizes developer productivity with keyboard-centric navigation, dark mode optimization for extended coding sessions, and integration capabilities with common development tools. This project demonstrates comprehensive understanding of developer needs and technical communication requirements.",
    features: [
      {
        name: "Thematic Chat Channels",
        description:
          "Topic-specific communication spaces organized by programming languages, frameworks, and technologies",
      },
      {
        name: "Code Collaboration Tools",
        description:
          "Real-time code sharing with syntax highlighting, collaborative editing, and execution capabilities",
      },
      {
        name: "Advanced Search Functionality",
        description:
          "Comprehensive search across messages, code snippets, and documentation with filtering options",
      },
      {
        name: "Developer Profile System",
        description:
          "Professional profile management with skill showcases, project portfolios, and reputation scoring",
      },
      {
        name: "Cross-Platform Compatibility",
        description:
          "Consistent experience across desktop, mobile, and web interfaces with synchronized data",
      },
      {
        name: "Real-Time Messaging Infrastructure",
        description:
          "Low-latency WebSocket communication with message persistence and delivery confirmation",
      },
      {
        name: "Community Building Features",
        description:
          "Knowledge base creation, peer recognition systems, and collaborative learning environments",
      },
    ],
  },
  {
    id: 17,
    title: "Magotlho TN Solutions (PTY) LTD",
    category: "website",
    demoUrl: "https://tnsolutions-pty-ltd.vercel.app/",
    techStack: ["Next.js", "Tailwind"],
    image: "/assets/Projects/Magotlho.png",
    description:
      "This corporate website for Magotlho TN Solutions (Pty) Ltd establishes a sophisticated digital presence for an electrical services provider, balancing technical professionalism with client accessibility. The design implementation reflects the company's core values of reliability, expertise, and customer focus through carefully curated visual elements and information architecture. Technical service representations include detailed breakdowns of electrical installation methodologies, maintenance protocol explanations, and safety compliance documentation. Client-facing features encompass interactive service quotation tools, project portfolio galleries with case study details, and emergency contact systems with rapid response protocols. The technical implementation emphasizes performance optimization through Next.js static generation strategies, accessibility compliance for diverse user needs, and SEO optimization for local service discovery. This project demonstrates ability to translate technical service offerings into compelling digital narratives that build client trust and facilitate business development.",
    features: [
      {
        name: "Fully Responsive Design",
        description:
          "Adaptive layout that maintains visual integrity and functionality across all devices and screen sizes",
      },
      {
        name: "Service Overview System",
        description:
          "Comprehensive service descriptions with technical specifications, pricing information, and case studies",
      },
      {
        name: "Professional Team Showcase",
        description:
          "Staff profiles with qualifications, expertise areas, and professional certifications display",
      },
      {
        name: "Project Portfolio Gallery",
        description:
          "Visual showcase of completed projects with detailed case studies and client testimonials",
      },
      {
        name: "SEO Optimization Framework",
        description:
          "Search engine optimization implementation for improved local service discovery and ranking",
      },
      {
        name: "User-Friendly Navigation",
        description:
          "Intuitive site structure with clear information hierarchy and easy access to key content",
      },
      {
        name: "Custom Visual Design",
        description:
          "Brand-specific visual elements that communicate professionalism and technical expertise",
      },
      {
        name: "Company Values Presentation",
        description:
          "Comprehensive About Us section detailing mission, vision, and corporate philosophy",
      },
    ],
  },
  {
    id: 18,
    title: "Magotlho TN Solutions Business Card Design",
    category: "design",
    demoUrl: "https://tnsolutions-pty-ltd.vercel.app/",
    techStack: [],
    image: "/assets/Projects/TNbusinesscard.png",
    description:
      "This print design project involves comprehensive business card development for Magotlho TN Solutions, implementing both aesthetic refinement and functional optimization for professional networking contexts. Design considerations encompass brand consistency through established color palette implementation, typographic hierarchy for information prioritization, and spatial optimization for maximum readability. Technical specifications include precise bleed area definitions for printing accuracy, material selection guidance for durability and texture, and file preparation for various printing technologies including offset, digital, and specialty finishes. The dual-sided design strategically separates essential contact information from supplementary details while maintaining visual coherence across both surfaces. This project demonstrates sophisticated understanding of print design principles, brand identity application across physical media, and practical considerations for professional networking tools.",
    features: [
      {
        name: "Brand Consistency Implementation",
        description:
          "Strict adherence to established brand guidelines with consistent color, typography, and visual elements",
      },
      {
        name: "Modern Layout Design",
        description:
          "Contemporary card layout with clear information hierarchy and balanced visual composition",
      },
      {
        name: "Essential Contact Information",
        description:
          "Strategic placement of critical contact details with clear readability and accessibility",
      },
      {
        name: "Logo Integration Strategy",
        description:
          "Prominent logo placement that reinforces brand recognition while maintaining aesthetic balance",
      },
      {
        name: "Dual-Sided Design Optimization",
        description:
          "Strategic front/back content separation with visual continuity across both card surfaces",
      },
      {
        name: "Professional Color Palette",
        description:
          "Industry-appropriate color selection that communicates reliability and technical expertise",
      },
      {
        name: "Networking-Optimized Format",
        description:
          "Design considerations for easy handling, storage, and sharing in professional networking scenarios",
      },
    ],
  },
  {
    id: 19,
    title: "Mixed Emotions",
    category: "design",
    demoUrl: "",
    techStack: [],
    image: "/assets/Projects/ME.png",
    description:
      "This comprehensive rebranding initiative for the Mixed Emotions clothing line involves strategic repositioning through visual identity redesign with particular emphasis on emotional resonance and market differentiation. The design process incorporates psychological color theory applications, typographic personality development, and symbolic imagery that communicates the brand's core concept of emotional complexity and expression. Implementation extends across multiple touchpoints including primary logo marks, secondary brand elements, packaging systems, and digital presence guidelines. Market considerations include competitor analysis for differentiation strategies, target demographic alignment through visual language, and scalability planning for product line expansion. The final design system provides flexible application frameworks that maintain brand recognition across diverse applications while allowing for seasonal variation and product-specific adaptations. This project demonstrates strategic brand development capabilities with emphasis on emotional connection and market relevance.",
    features: [
      {
        name: "Emotional Spectrum Symbolism",
        description:
          "Visual representation of diverse emotional states through color, shape, and typographic expression",
      },
      {
        name: "Bold Minimalist Design Approach",
        description:
          "Striking visual elements with simplified forms that communicate emotional depth through restraint",
      },
      {
        name: "Fashion Branding Versatility",
        description:
          "Design system adaptable across clothing categories, seasons, and marketing materials",
      },
      {
        name: "Icon & Brand Alignment",
        description:
          "Cohesive visual relationship between primary iconography and overall brand identity elements",
      },
      {
        name: "Contemporary Aesthetic Sensibility",
        description:
          "Modern design language that resonates with fashion-conscious consumers while maintaining emotional authenticity",
      },
      {
        name: "Cross-Product Branding Consistency",
        description:
          "Unified visual identity application across diverse product lines and marketing channels",
      },
      {
        name: "Emotional Depth Communication",
        description:
          "Visual strategies that convey complex emotional concepts through abstract and representational elements",
      },
    ],
  },
];

export const getTotalProjects = () => {
  return projectsData.length;
};

export const projectsNav = [
  {
    name: "all",
  },
  {
    name: "website",
  },
  {
    name: "app",
  },
  {
    name: "ai",
  },
  {
    name: "design",
  },
];

export const educationData = [
  {
    id: 1,
    title: "Vaal University of Technology",
    subtitle: "Diploma in Financial Information Systems",
    date: "Present",
    category: "education",
  },
  {
    id: 2,
    title: "VUT NEMISA",
    subtitle: "Mobile Digital Literacy",
    date: "2022",
    description: "Introduction to Fourth Industrial Revolution",
    category: "education",
  },
  {
    id: 3,
    title: "Thabo-Ntsako Secondary School",
    subtitle: "Grade 12",
    date: "2020",
    category: "education",
  },
  {
    id: 4,
    title: "Micro Tech Computer Trainning Campus",
    subtitle: "Diploma Microsoft Office & Office Administration",
    date: "2018",
    description: "Short Course",
    category: "education",
  },
  {
    id: 5,
    title: "Cognitive Class.ai",
    subtitle: "Building Clould Native and Multicloud Applications",
    date: "2024",
    description: "IBM CC0150EN",
    category: "online certificate",
  },
  {
    id: 6,
    title: "Cognitive Class.ai",
    subtitle: "SQL and Relation Databases 101",
    date: "2023",
    description: "IBM DS0105EN",
    category: "online certificate",
  },
  {
    id: 7,
    title: "Cognitive Class.ai",
    subtitle: "Data Science 101",
    date: "2023",
    description: "IBM DS0101EN",
    category: "online certificate",
  },
  {
    id: 8,
    title: "Cognitive Class.ai",
    subtitle: "Data Science Tools",
    date: "2023",
    description: "IBM DS0105EN",
    category: "online certificate",
  },
  {
    id: 9,
    title: "HUAWEI",
    subtitle: "5G Basics: What its all about",
    date: "2023",
    description: "Certificate Code: ICT20230330000145 ",
    category: "online certificate",
  },
  {
    id: 10,
    title: "MTN App of the year & IT Varsity",
    subtitle: "MTN Business App Academy",
    date: "2022",
    description: "Base on Flutter",
    category: "online certificate",
  },
];

export const sidebarLinks = [
  {
    imgURL: "/assets/icons/home.svg",
    route: "/dashboard",
    label: "Home",
  },
  {
    imgURL: "/assets/icons/user-cog.svg",
    route: "/users",
    label: "Users",
  },
  {
    imgURL: "/assets/icons/mail-warning.svg",
    route: "/messages",
    label: "Messages",
  },
  {
    imgURL: "/assets/icons/chart-pie.svg",
    route: "/analytics",
    label: "Analytics",
  },
  {
    imgURL: "/assets/icons/feedback.svg",
    route: "/feedback",
    label: "FeedBacks",
  },
  {
    imgURL: "/assets/icons/settings.svg",
    route: "/settings",
    label: "Settings",
  },
];
