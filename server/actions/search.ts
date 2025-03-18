"use server"

import { db } from "@/server/db"
import { projects, categories, techstacks, serviceInquiries, contactForms, users } from "@/server/schema"
import { ilike, or } from "drizzle-orm"

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

  const searchTerm = `%${query.toLowerCase()}%`
  const results: SearchResult[] = []

  // Search projects
  const projectResults = await db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      image: projects.image,
      createdAt: projects.createdAt,
    })
    .from(projects)
    .where(or(ilike(projects.name, searchTerm), ilike(projects.description, searchTerm)))
    .limit(5)

  results.push(
    ...projectResults.map((project) => ({
      id: project.id,
      title: project.name,
      description: project.description.substring(0, 100) + (project.description.length > 100 ? "..." : ""),
      type: "project" as const,
      url: `/dashboard/projects/${project.id}`,
      createdAt: project.createdAt,
      image: project.image,
    })),
  )

  // Search categories
  const categoryResults = await db
    .select({
      id: categories.id,
      name: categories.name,
    })
    .from(categories)
    .where(ilike(categories.name, searchTerm))
    .limit(5)

  results.push(
    ...categoryResults.map((category) => ({
      id: category.id,
      title: category.name,
      description: `Category`,
      type: "category" as const,
      url: `/dashboard/projects`,
    })),
  )

  // Search techstacks
  const techstackResults = await db
    .select({
      id: techstacks.id,
      name: techstacks.name,
      image: techstacks.image,
    })
    .from(techstacks)
    .where(ilike(techstacks.name, searchTerm))
    .limit(5)

  results.push(
    ...techstackResults.map((techstack) => ({
      id: techstack.id,
      title: techstack.name,
      description: `Technology`,
      type: "techstack" as const,
      url: `/dashboard/projects`,
      image: techstack.image,
    })),
  )

  // Search service inquiries
  const inquiryResults = await db
    .select({
      id: serviceInquiries.id,
      name: serviceInquiries.name,
      companyName: serviceInquiries.companyName,
      service: serviceInquiries.service,
      email: serviceInquiries.email,
      createdAt: serviceInquiries.createdAt,
    })
    .from(serviceInquiries)
    .where(
      or(
        ilike(serviceInquiries.name, searchTerm),
        ilike(serviceInquiries.companyName, searchTerm),
        ilike(serviceInquiries.service, searchTerm),
        ilike(serviceInquiries.email, searchTerm),
      ),
    )
    .limit(5)

  results.push(
    ...inquiryResults.map((inquiry) => ({
      id: inquiry.id,
      title: inquiry.name,
      description: `${inquiry.companyName} - ${inquiry.service}`,
      type: "inquiry" as const,
      url: `/dashboard/inquiries/${inquiry.id}`,
      createdAt: inquiry.createdAt,
    })),
  )

  // Search contact forms
  const contactResults = await db
    .select({
      id: contactForms.id,
      name: contactForms.name,
      topic: contactForms.topic,
      email: contactForms.email,
      createdAt: contactForms.createdAt,
    })
    .from(contactForms)
    .where(
      or(
        ilike(contactForms.name, searchTerm),
        ilike(contactForms.topic, searchTerm),
        ilike(contactForms.email, searchTerm),
        ilike(contactForms.message, searchTerm),
      ),
    )
    .limit(5)

  results.push(
    ...contactResults.map((contact) => ({
      id: contact.id,
      title: contact.name,
      description: `${contact.topic}`,
      type: "contact" as const,
      url: `/dashboard/mails/${contact.id}`,
      createdAt: contact.createdAt,
    })),
  )

  // Search users
  const userResults = await db
    .select({
      id: users.id,
      name: users.name,
      surname: users.surname,
      email: users.email,
      image: users.image,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(or(ilike(users.name, searchTerm), ilike(users.surname, searchTerm), ilike(users.email, searchTerm)))
    .limit(5)

  results.push(
    ...userResults.map((user) => ({
      id: user.id,
      title: `${user.name} ${user.surname}`,
      description: user.email,
      type: "user" as const,
      url: `/dashboard/users/${user.id}`,
      createdAt: user.createdAt,
      image: user.image,
    })),
  )

  // Sort results by relevance (for now, just by creation date)
  return results.sort((a, b) => {
    if (!a.createdAt) return 1
    if (!b.createdAt) return -1
    return b.createdAt.getTime() - a.createdAt.getTime()
  })
}

