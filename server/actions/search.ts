"use server"

import { db } from "@/server/db"
import { projects, categories, techstacks, serviceInquiries, contactForms, user } from "@/server/schemasql"
import { sql } from "drizzle-orm"

export type SearchResult = {
  id: string
  title: string
  description: string
  type: "project" | "category" | "techstack" | "inquiry" | "contact" | "user"
  url: string
  createdAt?: Date
  image?: string | null
}

export async function searchAll(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) {
    return []
  }

  const searchTerm = query.trim().toLowerCase()
  const results: SearchResult[] = []

  // Search projects
  const projectResults = await db
    .select()
    .from(projects)
    .where(
      sql`LOWER(${projects.name}) LIKE ${`%${searchTerm}%`} OR LOWER(${projects.description}) LIKE ${`%${searchTerm}%`}`
    )
    .limit(5)

  results.push(
    ...projectResults.map((project) => ({
      id: project.id,
      title: project.name,
      description: project.description 
        ? project.description.substring(0, 100) + (project.description.length > 100 ? "..." : "")
        : "No description",
      type: "project" as const,
      url: `/dashboard/projects/${project.id}`,
      createdAt: project.createdAt,
      image: project.image,
    })),
  )

  // Search categories
  const categoryResults = await db
    .select()
    .from(categories)
    .where(sql`LOWER(${categories.name}) LIKE ${`%${searchTerm}%`}`)
    .limit(5)

  results.push(
    ...categoryResults.map((category) => ({
      id: category.id,
      title: category.name,
      description: "Category",
      type: "category" as const,
      url: `/dashboard/projects?category=${category.id}`,
      createdAt: category.createdAt,
    })),
  )

  // Search techstacks
  const techstackResults = await db
    .select()
    .from(techstacks)
    .where(sql`LOWER(${techstacks.name}) LIKE ${`%${searchTerm}%`}`)
    .limit(5)

  results.push(
    ...techstackResults.map((techstack) => ({
      id: techstack.id,
      title: techstack.name,
      description: "Technology Stack",
      type: "techstack" as const,
      url: `/dashboard/projects?techstack=${techstack.id}`,
      createdAt: techstack.createdAt,
      image: techstack.image,
    })),
  )

  // Search service inquiries
  const inquiryResults = await db
    .select()
    .from(serviceInquiries)
    .where(
      sql`LOWER(${serviceInquiries.name}) LIKE ${`%${searchTerm}%`} OR 
          LOWER(${serviceInquiries.companyName}) LIKE ${`%${searchTerm}%`} OR 
          LOWER(${serviceInquiries.service}) LIKE ${`%${searchTerm}%`} OR 
          LOWER(${serviceInquiries.email}) LIKE ${`%${searchTerm}%`}`
    )
    .limit(5)

  results.push(
    ...inquiryResults.map((inquiry) => ({
      id: inquiry.id,
      title: inquiry.name,
      description: `${inquiry.companyName || "No company"} - ${inquiry.service}`,
      type: "inquiry" as const,
      url: `/dashboard/inquiries/${inquiry.id}`,
      createdAt: inquiry.createdAt,
    })),
  )

  // Search contact forms
  const contactResults = await db
    .select()
    .from(contactForms)
    .where(
      sql`LOWER(${contactForms.name}) LIKE ${`%${searchTerm}%`} OR 
          LOWER(${contactForms.topic}) LIKE ${`%${searchTerm}%`} OR 
          LOWER(${contactForms.email}) LIKE ${`%${searchTerm}%`} OR 
          LOWER(${contactForms.message}) LIKE ${`%${searchTerm}%`}`
    )
    .limit(5)

  results.push(
    ...contactResults.map((contact) => ({
      id: contact.id,
      title: contact.name,
      description: contact.topic || "Contact form submission",
      type: "contact" as const,
      url: `/dashboard/mails/${contact.id}`,
      createdAt: contact.createdAt,
    })),
  )

  // Search users
  const userResults = await db
    .select()
    .from(user)
    .where(
      sql`LOWER(${user.name}) LIKE ${`%${searchTerm}%`} OR LOWER(${user.email}) LIKE ${`%${searchTerm}%`}`
    )
    .limit(5)

  results.push(
    ...userResults.map((userItem) => ({
      id: userItem.id,
      title: userItem.name || "Unknown User",
      description: userItem.email,
      type: "user" as const,
      url: `/dashboard/users/${userItem.id}`,
      createdAt: userItem.createdAt,
      image: userItem.image,
    })),
  )

  // Sort results by relevance (most recent first)
  return results.sort((a, b) => {
    if (!a.createdAt) return 1
    if (!b.createdAt) return -1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}