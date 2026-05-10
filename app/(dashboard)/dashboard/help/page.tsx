"use client"

import { useState } from "react"
import { Users, Shield, FolderKanban, MessageSquare, Star, FileText, Settings, ChevronDown, ChevronRight, Search, BookOpen, HelpCircle, Lock, Mail, Smartphone, Database, Layers, ClipboardList, UserCheck, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils"

interface SectionData {
    id: string
    title: string
    icon: React.ReactNode
    description: string
    content: ContentItem[]
}

interface ContentItem {
    title: string
    description: string
    details?: string[]
    type?: "info" | "warning" | "success"
}

const helpSections: SectionData[] = [
    {
        id: "users",
        title: "User Management",
        icon: <Users className="h-5 w-5" />,
        description: "Understanding user accounts, roles, and authentication in the system",
        content: [
            {
                title: "User Accounts",
                description: "Each user has a unique profile with essential information stored securely.",
                details: [
                    "Name: Your display name visible across the platform",
                    "Email: Used for login, notifications, and verification (must be unique)",
                    "Profile Image: Optional avatar for personalization",
                    "Email Verification: Required to access all features",
                    "Created/Updated Timestamps: Track when your account was created and last modified",
                ],
            },
            {
                title: "User Roles",
                description: "The system has three distinct roles with different permission levels:",
                details: [
                    "User: Standard access to view projects, submit contact forms, and request services",
                    "Admin: Elevated access to manage content, view inquiries, and moderate users",
                    "Owner: Full system access including user management and system configuration",
                ],
                type: "info",
            },
            {
                title: "Account Restrictions",
                description: "Users may be temporarily or permanently restricted from accessing the platform.",
                details: [
                    "Ban Status: Indicates if an account is currently restricted",
                    "Ban Reason: Explanation provided for the restriction",
                    "Ban Expiration: Date when temporary bans are lifted automatically",
                ],
                type: "warning",
            },
        ],
    },
    {
        id: "authentication",
        title: "Authentication & Security",
        icon: <Shield className="h-5 w-5" />,
        description: "How login, sessions, and security features work",
        content: [
            {
                title: "Login Methods",
                description: "Multiple ways to securely access your account:",
                details: [
                    "Email & Password: Traditional login with your registered email",
                    "GitHub OAuth: Sign in using your GitHub account",
                    "Google OAuth: Sign in using your Google account",
                    "Account Linking: Connect multiple providers to one account",
                ],
            },
            {
                title: "Two-Factor Authentication (2FA)",
                description: "Add an extra layer of security to protect your account.",
                details: [
                    "Enable 2FA from your account settings",
                    "Receive OTP codes via email for verification",
                    "Backup codes provided for emergency access",
                    "Required during login when enabled",
                ],
                type: "success",
            },
            {
                title: "Sessions",
                description: "Track and manage your active login sessions:",
                details: [
                    "Secure token-based authentication",
                    "Automatic session expiration for security",
                    "IP address and device tracking for security auditing",
                    "Admin impersonation tracking for accountability",
                ],
            },
            {
                title: "Password Security",
                description: "Your password is protected with industry-standard practices:",
                details: [
                    "Passwords are securely hashed before storage",
                    "HaveIBeenPwned integration checks for compromised passwords",
                    "Password reset via email with time-limited tokens",
                ],
                type: "info",
            },
        ],
    },
    {
        id: "projects",
        title: "Projects & Portfolio",
        icon: <FolderKanban className="h-5 w-5" />,
        description: "Browse and understand the project showcase system",
        content: [
            {
                title: "Project Information",
                description: "Each project displays comprehensive details:",
                details: [
                    "Project Name: Unique identifier for the project",
                    "Description: Detailed explanation of the project purpose and features",
                    "Demo Link: Live preview or demonstration URL",
                    "Project Image: Visual representation or screenshot",
                    "Features: List of key functionalities and capabilities",
                ],
            },
            {
                title: "Categories",
                description: "Projects are organized into categories for easy navigation:",
                details: [
                    "Each project belongs to a specific category",
                    "Categories help filter and find relevant projects",
                    "Browse by category to discover similar work",
                ],
            },
            {
                title: "Tech Stacks",
                description: "Technologies used in each project are clearly displayed:",
                details: [
                    "Framework and libraries used",
                    "Each technology includes its logo/image",
                    "Multiple technologies can be associated with a single project",
                    "Filter projects by technology stack",
                ],
            },
        ],
    },
    {
        id: "contact",
        title: "Contact Forms",
        icon: <MessageSquare className="h-5 w-5" />,
        description: "How to get in touch and what happens with your messages",
        content: [
            {
                title: "Submitting a Contact Form",
                description: "Reach out with questions, feedback, or inquiries:",
                details: [
                    "Your Name: How you want to be addressed",
                    "Email: Where replies will be sent",
                    "Topic: Category of your inquiry for proper routing",
                    "Message: Your detailed question or feedback",
                ],
            },
            {
                title: "Response Process",
                description: "What happens after you submit a contact form:",
                details: [
                    "Messages are timestamped and stored securely",
                    "Admin team reviews incoming messages",
                    "Read status tracked for follow-up management",
                    "Responses sent directly to your provided email",
                ],
                type: "info",
            },
        ],
    },
    {
        id: "ratings",
        title: "Ratings & Feedback",
        icon: <Star className="h-5 w-5" />,
        description: "Share your experience and help improve the platform",
        content: [
            {
                title: "Leaving a Rating",
                description: "Share your experience with the portfolio or services:",
                details: [
                    "Numeric Rating: Score to indicate satisfaction level",
                    "Feedback Text: Optional detailed comments or suggestions",
                    "Your Name: Optional attribution for your rating",
                ],
            },
            {
                title: "How Ratings Are Used",
                description: "Your feedback helps improve the platform:",
                details: [
                    "Ratings help identify areas for improvement",
                    "Feedback is reviewed regularly by the team",
                    "Positive ratings may be featured as testimonials",
                ],
                type: "success",
            },
        ],
    },
    {
        id: "services",
        title: "Service Inquiries & Quotations",
        icon: <FileText className="h-5 w-5" />,
        description: "Request services and receive professional quotations",
        content: [
            {
                title: "Submitting a Service Inquiry",
                description: "Request a quote for professional services:",
                details: [
                    "Your Name: Contact person for the inquiry",
                    "Company Name: Business or organization name",
                    "Service Type: What service you are interested in",
                    "Email: For quotation delivery and follow-up",
                    "Phone Number: Alternative contact method",
                    "Address: Including unit, street, city, province, and postal code",
                ],
            },
            {
                title: "Quotation Details",
                description: "Professional quotations include comprehensive pricing:",
                details: [
                    "Unique Quotation Number: For reference and tracking",
                    "Line Items: Detailed breakdown of services/products",
                    "Quantities and Units: Exact amounts and measurements",
                    "Unit Pricing: Cost per item or service",
                    "Subtotal: Sum before taxes",
                    "Tax Rate: Applicable tax percentage",
                    "Total: Final amount including taxes",
                    "Notes: Additional information or clarifications",
                    "Terms: Payment terms and conditions",
                ],
                type: "info",
            },
            {
                title: "Quotation Items",
                description: "Each quotation contains detailed line items:",
                details: [
                    "Description: What the item or service includes",
                    "Quantity: How many units requested",
                    "Unit: Measurement type (hours, pieces, etc.)",
                    "Unit Price: Cost per single unit",
                    "Total: Calculated total for the line item",
                ],
            },
        ],
    },
    {
        id: "audit",
        title: "System Audit & Tracking",
        icon: <ClipboardList className="h-5 w-5" />,
        description: "How the system tracks changes and maintains accountability",
        content: [
            {
                title: "Audit Logging",
                description: "The system maintains detailed logs of important actions:",
                details: [
                    "Action Type: What operation was performed (create, update, delete)",
                    "Table Name: Which data was affected",
                    "Record ID: Specific item that was changed",
                    "User ID: Who performed the action",
                    "Timestamp: Exact date and time of the action",
                    "Details: Additional context about the change",
                    "IP Address: Location information for security",
                    "User Agent: Device/browser used",
                ],
                type: "info",
            },
            {
                title: "Why Audit Logs Matter",
                description: "Audit logs serve important purposes:",
                details: [
                    "Security: Detect unauthorized access or suspicious activity",
                    "Accountability: Track who made what changes",
                    "Compliance: Meet regulatory requirements",
                    "Debugging: Troubleshoot issues by reviewing history",
                ],
            },
        ],
    },
]

const quickLinks = [
    { title: "Getting Started", description: "New to the platform? Start here", icon: <BookOpen className="h-4 w-4" /> },
    { title: "Account Security", description: "Protect your account", icon: <Lock className="h-4 w-4" /> },
    { title: "Contact Support", description: "Need help? Reach out", icon: <Mail className="h-4 w-4" /> },
    { title: "Two-Factor Setup", description: "Enable 2FA for security", icon: <Smartphone className="h-4 w-4" /> },
]

function HelpSection({ section, isExpanded, onToggle }: { section: SectionData; isExpanded: boolean; onToggle: () => void }) {
    return (
        <div className="border border-[#acc2ef] rounded-lg overflow-hidden bg-white">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-100 transition-colors text-left"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg text-gray-800">
                        {section.icon}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-800">{section.title}</h3>
                        <p className="text-sm text-gray-600">{section.description}</p>
                    </div>
                </div>
                {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-gray-600 flex-shrink-0" />
                ) : (
                    <ChevronRight className="h-5 w-5 text-gray-600 flex-shrink-0" />
                )}
            </button>
            {isExpanded && (
                <div className="border-t border-[#acc2ef] p-4 space-y-4">
                    {section.content.map((item, index) => (
                        <div key={index} className="space-y-2">
                            <div className="flex items-start gap-2">
                                {item.type === "warning" && <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />}
                                {item.type === "success" && <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />}
                                {item.type === "info" && <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />}
                                {!item.type && <div className="w-5" />}
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-800">{item.title}</h4>
                                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                    {item.details && (
                                        <ul className="mt-2 space-y-1">
                                            {item.details.map((detail, idx) => (
                                                <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                                    <span className="text-[#acc2ef] mt-1.5">•</span>
                                                    <span>{detail}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

function TableOfContents({ sections, activeSection, onSectionClick }: { sections: SectionData[], activeSection: string | null, onSectionClick: (id: string) => void }) {
    return (
        <div className="hidden lg:block sticky top-4">
            <div className="border border-[#acc2ef] rounded-lg p-4 bg-white">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Table of Contents
                </h3>
                <nav className="space-y-1">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => onSectionClick(section.id)}
                            className={cn(
                                "w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2",
                                activeSection === section.id
                                    ? "bg-gray-100 text-gray-800 font-medium"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                            )}
                        >
                            {section.icon}
                            {section.title}
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    )
}

function DataModelDiagram() {
    const entities = [
        { name: "User", fields: ["id", "name", "email", "role", "2FA enabled"], color: "bg-blue-50 border-blue-200" },
        { name: "Session", fields: ["token", "expiresAt", "ipAddress"], color: "bg-green-50 border-green-200" },
        { name: "Project", fields: ["name", "description", "demo", "features"], color: "bg-purple-50 border-purple-200" },
        { name: "Service Inquiry", fields: ["quotationNumber", "service", "total"], color: "bg-amber-50 border-amber-200" },
        { name: "Contact Form", fields: ["topic", "message", "read status"], color: "bg-pink-50 border-pink-200" },
        { name: "Rating", fields: ["score", "feedback", "name"], color: "bg-teal-50 border-teal-200" },
    ]

    return (
        <div className="border border-[#acc2ef] rounded-lg p-6 bg-white">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Data Overview
            </h3>
            <p className="text-sm text-gray-600 mb-4">
                The system is built around these core entities that work together to provide a complete portfolio and service management platform.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {entities.map((entity) => (
                    <div key={entity.name} className={cn("border rounded-lg p-3", entity.color)}>
                        <h4 className="font-medium text-gray-800 text-sm mb-2">{entity.name}</h4>
                        <ul className="space-y-0.5">
                            {entity.fields.map((field) => (
                                <li key={field} className="text-xs text-gray-600">• {field}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    )
}

const Help = () => {
    const [searchQuery, setSearchQuery] = useState("")
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["users"]))
    const [activeSection, setActiveSection] = useState<string | null>("users")

    const filteredSections = helpSections.filter((section) => {
        const query = searchQuery.toLowerCase()
        if (!query) return true

        const matchesTitle = section.title.toLowerCase().includes(query)
        const matchesDescription = section.description.toLowerCase().includes(query)
        const matchesContent = section.content.some(
            (item) =>
                item.title.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query) ||
                item.details?.some((detail) => detail.toLowerCase().includes(query))
        )

        return matchesTitle || matchesDescription || matchesContent
    })

    const toggleSection = (id: string) => {
        setExpandedSections((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(id)) {
                newSet.delete(id)
            } else {
                newSet.add(id)
            }
            return newSet
        })
        setActiveSection(id)
    }

    const handleSectionClick = (id: string) => {
        setExpandedSections((prev) => new Set(prev).add(id))
        setActiveSection(id)
        const element = document.getElementById(id)
        element?.scrollIntoView({ behavior: "smooth", block: "start" })
    }

    const expandAll = () => {
        setExpandedSections(new Set(helpSections.map((s) => s.id)))
    }

    const collapseAll = () => {
        setExpandedSections(new Set())
        setActiveSection(null)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="border-b border-[#acc2ef] bg-gray-50">
                <div className="mx-auto px-4 py-6 sm:px-6 text-center">
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <div className="p-2 rounded-lg border border-[#acc2ef] bg-white">
                            <HelpCircle className="h-5 w-5 text-[#acc2ef]" />
                        </div>
                        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">Help Center</h1>
                    </div>
                    <p className="text-gray-500 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                        Welcome to the help center. Find answers to common questions and learn how to use the platform effectively.
                    </p>
                </div>
            </header>

            <main className=" mx-auto px-2 py-3">
                {/* Quick Links */}
                <section className="mb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {quickLinks.map((link) => (
                            <div
                                key={link.title}
                                className="border border-[#acc2ef] rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-100 rounded-lg text-gray-800">
                                        {link.icon}
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-800">{link.title}</h3>
                                        <p className="text-sm text-gray-600">{link.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Search and Controls */}
                <section className="mb-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search help topics..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-[#acc2ef] rounded-lg bg-white text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#acc2ef] focus:border-transparent"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={expandAll}
                                className="px-4 py-2 text-sm font-medium text-gray-800 bg-white border border-[#acc2ef] rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Expand All
                            </button>
                            <button
                                onClick={collapseAll}
                                className="px-4 py-2 text-sm font-medium text-gray-800 bg-white border border-[#acc2ef] rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Collapse All
                            </button>
                        </div>
                    </div>
                </section>

                {/* Data Model Overview */}
                <section className="mb-8">
                    <DataModelDiagram />
                </section>

                {/* Main Content */}
                <div className="flex gap-8">
                    {/* Table of Contents - Desktop */}
                    <aside className="w-64 flex-shrink-0">
                        <TableOfContents
                            sections={helpSections}
                            activeSection={activeSection}
                            onSectionClick={handleSectionClick}
                        />
                    </aside>

                    {/* Help Sections */}
                    <div className="flex-1 space-y-4">
                        {filteredSections.length === 0 ? (
                            <div className="border border-[#acc2ef] rounded-lg p-8 bg-white text-center">
                                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="font-medium text-gray-800 mb-2">No results found</h3>
                                <p className="text-sm text-gray-600">
                                    Try adjusting your search terms or browse the sections below.
                                </p>
                            </div>
                        ) : (
                            filteredSections.map((section) => (
                                <div key={section.id} id={section.id}>
                                    <HelpSection
                                        section={section}
                                        isExpanded={expandedSections.has(section.id)}
                                        onToggle={() => toggleSection(section.id)}
                                    />
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* FAQ Section */}
                <section className="mt-12">
                    <div className="border border-[#acc2ef] rounded-lg p-6 bg-white">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <UserCheck className="h-5 w-5" />
                            Frequently Asked Questions
                        </h2>
                        <div className="space-y-4">
                            <div className="border-b border-gray-200 pb-4">
                                <h4 className="font-medium text-gray-800 mb-2">How do I reset my password?</h4>
                                <p className="text-sm text-gray-600">
                                    Click on &quot;Forgot Password&quot; on the login page. Enter your email address, and you&apos;ll receive a secure link to create a new password. The link expires in 24 hours for security.
                                </p>
                            </div>
                            <div className="border-b border-gray-200 pb-4">
                                <h4 className="font-medium text-gray-800 mb-2">What are the different user roles?</h4>
                                <p className="text-sm text-gray-600">
                                    <strong>User:</strong> Standard access for viewing and interacting with the portfolio. <strong>Admin:</strong> Can manage content and view inquiries. <strong>Owner:</strong> Full system access including user management.
                                </p>
                            </div>
                            <div className="border-b border-gray-200 pb-4">
                                <h4 className="font-medium text-gray-800 mb-2">How do I enable two-factor authentication?</h4>
                                <p className="text-sm text-gray-600">
                                    Navigate to your account settings and look for the &quot;Two-Factor Authentication&quot; section. Follow the prompts to enable 2FA. You&apos;ll receive verification codes via email when logging in.
                                </p>
                            </div>
                            <div className="border-b border-gray-200 pb-4">
                                <h4 className="font-medium text-gray-800 mb-2">How do I request a service quotation?</h4>
                                <p className="text-sm text-gray-600">
                                    Fill out the service inquiry form with your details including name, company, service type, and contact information. You&apos;ll receive a professional quotation with a unique reference number.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-800 mb-2">Can I link multiple social accounts?</h4>
                                <p className="text-sm text-gray-600">
                                    Yes! You can link your GitHub and Google accounts to your profile. This allows you to sign in using any of your connected accounts while maintaining a single user profile.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contact Support */}
                <section className="mt-8">
                    <div className="border border-[#acc2ef] rounded-lg p-6 bg-white">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-1">Still need help?</h3>
                                <p className="text-sm text-gray-600">
                                    Can&apos;t find what you&apos;re looking for? Our support team is here to assist you.
                                </p>
                            </div>
                            <button className="px-6 py-2.5 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Contact Support
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-[#acc2ef] bg-white mt-12">
                <div className=" mx-auto px-2 py-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-gray-600">
                            MS Portfolio Help Center • Last updated: {new Date().toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-4">
                            <button className="text-sm text-gray-600 hover:text-gray-800 transition-colors">
                                Privacy Policy
                            </button>
                            <button className="text-sm text-gray-600 hover:text-gray-800 transition-colors">
                                Terms of Service
                            </button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Help