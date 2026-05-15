// seed.ts
import { db } from "@/server/db";
import { contactForms, serviceInquiries } from "@/server/schema";
import { v4 as uuidv4 } from 'uuid';

// Contact form seed data
const contactMessages: Omit<typeof contactForms.$inferInsert, 'id'>[] = [
  {
    name: "John Smith",
    email: "john.smith@example.com",
    topic: "General Inquiry",
    message: "I'm interested in learning more about your services. Could you please send me more information about your pricing structure?",
    createdAt: new Date("2024-03-15T10:30:00"),
    read: false,
  },
  {
    name: "Sarah Johnson",
    email: "sarah.j@techcorp.com",
    topic: "Technical Support",
    message: "Having an issue with the API integration. The authentication keeps failing. Can you help me troubleshoot?",
    createdAt: new Date("2024-03-14T14:45:00"),
    read: false,
  },
  {
    name: "Michael Brown",
    email: "michael.brown@designstudio.com",
    topic: "Partnership Opportunity",
    message: "We're looking for a strategic partner to collaborate on an upcoming project. Would you be open to a discussion?",
    createdAt: new Date("2024-03-14T09:15:00"),
    read: true,
  },
  {
    name: "Emily Davis",
    email: "emily.davis@gmail.com",
    topic: "Billing Question",
    message: "I noticed an unexpected charge on my recent invoice. Can you please clarify what this charge is for?",
    createdAt: new Date("2024-03-13T16:20:00"),
    read: false,
  },
  {
    name: "David Wilson",
    email: "david.wilson@startup.io",
    topic: "Feature Request",
    message: "Would it be possible to add real-time analytics dashboard? This would greatly benefit our team's workflow.",
    createdAt: new Date("2024-03-13T11:00:00"),
    read: true,
  },
  {
    name: "Lisa Anderson",
    email: "lisa.anderson@enterprise.com",
    topic: "Security Concern",
    message: "Could you provide more details about your data encryption standards and compliance certifications?",
    createdAt: new Date("2024-03-12T13:30:00"),
    read: false,
  },
  {
    name: "Robert Taylor",
    email: "rtaylor@smallbiz.com",
    topic: "Product Demo",
    message: "I'd like to schedule a product demo for our team of 5 people. What's the best way to arrange this?",
    createdAt: new Date("2024-03-12T09:45:00"),
    read: true,
  },
  {
    name: "Jennifer Martinez",
    email: "jennifer.m@nonprofit.org",
    topic: "Discount Request",
    message: "We're a non-profit organization. Do you offer any special pricing or grants for organizations like ours?",
    createdAt: new Date("2024-03-11T15:10:00"),
    read: false,
  },
  {
    name: "Thomas White",
    email: "thomas.white@agency.com",
    topic: "White Label Option",
    message: "Do you offer white-label solutions? We'd like to resell your product under our own brand.",
    createdAt: new Date("2024-03-11T10:20:00"),
    read: true,
  },
  {
    name: "Patricia Clark",
    email: "p.clark@edu.edu",
    topic: "Educational License",
    message: "Our university is interested in a site license for all students and faculty. What are our options?",
    createdAt: new Date("2024-03-10T14:00:00"),
    read: false,
  },
];

// Service inquiries seed data with correct address structure
const serviceInquiriesData: Omit<typeof serviceInquiries.$inferInsert, 'id'>[] = [
  {
    name: "James Wilson",
    companyName: "Tech Solutions Inc",
    service: "Web Development",
    email: "james.wilson@techsolutions.com",
    phoneNumber: "+1 (555) 123-4567",
    address: {
      unit: "Suite 100",
      street: "123 Business Ave",
      subdivision: "Financial District",
      city: "San Francisco",
      province: "CA",
      postalCode: "94105",
    },
    quotationNumber: "Q-2024-0001",
    createdAt: new Date("2024-03-15T08:30:00"),
    read: false,
  },
  {
    name: "Maria Garcia",
    companyName: "Creative Studios",
    service: "UI/UX Design",
    email: "maria.garcia@creativestudios.com",
    phoneNumber: "+1 (555) 234-5678",
    address: {
      unit: null,
      street: "456 Design Blvd",
      subdivision: "Arts District",
      city: "Los Angeles",
      province: "CA",
      postalCode: "90001",
    },
    quotationNumber: "Q-2024-0002",
    createdAt: new Date("2024-03-14T13:15:00"),
    read: true,
  },
  {
    name: "Robert Chen",
    companyName: "DataFlow Analytics",
    service: "Data Migration",
    email: "robert.chen@dataflow.com",
    phoneNumber: "+1 (555) 345-6789",
    address: {
      unit: "Floor 5",
      street: "789 Data Drive",
      subdivision: "Tech Hub",
      city: "Austin",
      province: "TX",
      postalCode: "78701",
    },
    quotationNumber: "Q-2024-0003",
    createdAt: new Date("2024-03-14T10:45:00"),
    read: false,
  },
  {
    name: "Amanda Foster",
    companyName: "Cloud Nine Solutions",
    service: "Cloud Infrastructure",
    email: "amanda.foster@cloudnine.com",
    phoneNumber: "+1 (555) 456-7890",
    address: {
      unit: "Tower 2, Suite 300",
      street: "321 Cloud Lane",
      subdivision: "Tech Corridor",
      city: "Seattle",
      province: "WA",
      postalCode: "98101",
    },
    quotationNumber: "Q-2024-0004",
    createdAt: new Date("2024-03-13T16:30:00"),
    read: false,
  },
  {
    name: "Kevin Patel",
    companyName: "Mobile First Apps",
    service: "Mobile Development",
    email: "kevin.patel@mobilefirst.com",
    phoneNumber: "+1 (555) 567-8901",
    address: {
      unit: null,
      street: "567 Mobile Way",
      subdivision: "Innovation District",
      city: "Chicago",
      province: "IL",
      postalCode: "60601",
    },
    quotationNumber: "Q-2024-0005",
    createdAt: new Date("2024-03-13T11:20:00"),
    read: true,
  },
  {
    name: "Rachel Simmons",
    companyName: "E-Commerce Pros",
    service: "E-commerce Solution",
    email: "rachel.simmons@ecompros.com",
    phoneNumber: "+1 (555) 678-9012",
    address: {
      unit: "Floor 12",
      street: "890 Commerce St",
      subdivision: "Financial District",
      city: "New York",
      province: "NY",
      postalCode: "10001",
    },
    quotationNumber: "Q-2024-0006",
    createdAt: new Date("2024-03-12T14:45:00"),
    read: false,
  },
  {
    name: "Daniel Kim",
    companyName: "AI Innovators",
    service: "AI Integration",
    email: "daniel.kim@aiinnovators.com",
    phoneNumber: "+1 (555) 789-0123",
    address: {
      unit: "Penthouse",
      street: "234 AI Boulevard",
      subdivision: "Innovation Park",
      city: "Boston",
      province: "MA",
      postalCode: "02110",
    },
    quotationNumber: "Q-2024-0007",
    createdAt: new Date("2024-03-12T09:30:00"),
    read: true,
  },
  {
    name: "Laura Thompson",
    companyName: "SecureNet Systems",
    service: "Security Audit",
    email: "laura.thompson@securenet.com",
    phoneNumber: "+1 (555) 890-1234",
    address: {
      unit: "Suite 200",
      street: "123 Security Plaza",
      subdivision: "Government District",
      city: "Washington",
      province: "DC",
      postalCode: "20001",
    },
    quotationNumber: "Q-2024-0008",
    createdAt: new Date("2024-03-11T15:00:00"),
    read: false,
  },
  {
    name: "Mark Rodriguez",
    companyName: "Digital Marketing Hub",
    service: "SEO Optimization",
    email: "mark.rodriguez@digitalhub.com",
    phoneNumber: "+1 (555) 901-2345",
    address: {
      unit: null,
      street: "456 Marketing Ave",
      subdivision: "Media District",
      city: "Miami",
      province: "FL",
      postalCode: "33101",
    },
    quotationNumber: "Q-2024-0009",
    createdAt: new Date("2024-03-11T10:15:00"),
    read: true,
  },
  {
    name: "Stephanie Lee",
    companyName: "Enterprise Resources",
    service: "ERP Implementation",
    email: "stephanie.lee@enterpriseres.com",
    phoneNumber: "+1 (555) 012-3456",
    address: {
      unit: "Suite 400",
      street: "789 Enterprise Dr",
      subdivision: "Business Park",
      city: "Dallas",
      province: "TX",
      postalCode: "75201",
    },
    quotationNumber: "Q-2024-0010",
    createdAt: new Date("2024-03-10T13:45:00"),
    read: false,
  },
  // Additional seed data with more variety
  {
    name: "Alex Thompson",
    companyName: "StartUp Labs",
    service: "DevOps Consulting",
    email: "alex@startuplabs.com",
    phoneNumber: "+1 (555) 123-7890",
    address: {
      unit: null,
      street: "101 Innovation Way",
      subdivision: null,
      city: "Portland",
      province: "OR",
      postalCode: "97201",
    },
    quotationNumber: "Q-2024-0011",
    createdAt: new Date("2024-03-09T11:00:00"),
    read: false,
  },
  {
    name: "Nina Williams",
    companyName: "Blockchain Solutions",
    service: "Smart Contract Development",
    email: "nina@blockchainsol.com",
    phoneNumber: "+1 (555) 987-6543",
    address: {
      unit: "Floor 8",
      street: "456 Crypto Street",
      subdivision: "Tech Valley",
      city: "Denver",
      province: "CO",
      postalCode: "80202",
    },
    quotationNumber: "Q-2024-0012",
    createdAt: new Date("2024-03-08T14:30:00"),
    read: false,
  },
];

// Function to seed database
export async function seedDatabase() {
  try {

    // Check if data already exists
    const existingContacts = await db.select().from(contactForms).limit(1);
    
    if (existingContacts.length > 0) {
      return { 
        success: false, 
        message: "Database already has data. Please clear existing records first before seeding." 
      };
    }

    for (const message of contactMessages) {
      await db.insert(contactForms).values({
        id: uuidv4(),
        ...message,
      });
    }

    // Insert service inquiries
    for (const inquiry of serviceInquiriesData) {
      await db.insert(serviceInquiries).values({
        id: uuidv4(),
        ...inquiry,
      });
    }

   //revalidatePath("/dashboard/mails");
    
    return { 
      success: true, 
      message: `Successfully seeded ${contactMessages.length} contact messages and ${serviceInquiriesData.length} service inquiries` 
    };
  } catch (error) {
    return { 
      success: false, 
      message: "Failed to seed database. Check console for details." 
    };
  }
}

// Function to clear database
export async function clearDatabase() {
  try {
    
    await db.delete(serviceInquiries);
    await db.delete(contactForms);
    
    
   //revalidatePath("/dashboard/mails");
    
    return { 
      success: true, 
      message: "Database cleared successfully" 
    };
  } catch (error) {
    return { 
      success: false, 
      message: "Failed to clear database" 
    };
  }
}

// Optional: Function to seed only specific tables
export async function seedOnlyContactForms() {
  try {
    const existingContacts = await db.select().from(contactForms).limit(1);
    
    if (existingContacts.length > 0) {
      return { 
        success: false, 
        message: "Contact forms already have data. Clear first if you want to reseed." 
      };
    }

    for (const message of contactMessages) {
      await db.insert(contactForms).values({
        id: uuidv4(),
        ...message,
      });
    }

   //revalidatePath("/dashboard/mails");
    
    return { 
      success: true, 
      message: `Successfully seeded ${contactMessages.length} contact messages` 
    };
  } catch (error) {
    return { 
      success: false, 
      message: "Failed to seed contact forms" 
    };
  }
}

export async function seedOnlyServiceInquiries() {
  try {
    const existingInquiries = await db.select().from(serviceInquiries).limit(1);
    
    if (existingInquiries.length > 0) {
      return { 
        success: false, 
        message: "Service inquiries already have data. Clear first if you want to reseed." 
      };
    }

    for (const inquiry of serviceInquiriesData) {
      await db.insert(serviceInquiries).values({
        id: uuidv4(),
        ...inquiry,
      });
    }

   //revalidatePath("/dashboard/mails");
    
    return { 
      success: true, 
      message: `Successfully seeded ${serviceInquiriesData.length} service inquiries` 
    };
  } catch (error) {
    return { 
      success: false, 
      message: "Failed to seed service inquiries" 
    };
  }
}