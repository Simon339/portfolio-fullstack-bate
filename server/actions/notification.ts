'use server';

import { db } from "@/server/db";
import { auditLogs, contactForms, serviceInquiries, users } from "../schema";
import { eq, sql, desc } from "drizzle-orm";
import { headers } from "next/headers";

export async function getUnreadNotifications() {
  
  const unreadContactMessages = await db
    .select()
    .from(contactForms)
    .where(eq(contactForms.read, false))
    .orderBy(contactForms.createdAt);

  
  return unreadContactMessages;
}

export async function countUnreadNotifications() {
  // Count unread contact messages
  const unreadContactMessagesCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(contactForms)
    .where(eq(contactForms.read, false));

  // Count unread service inquiries
  const unreadServiceInquiriesCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(serviceInquiries)
    .where(eq(serviceInquiries.read, false));

  // Count pending users
  const pendingUsersCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .where(eq(users.status, "PENDING"));

  // Ensure all counts are numbers and sum them
  const totalUnreadNotifications =
    Number(unreadContactMessagesCount[0].count) +
    Number(unreadServiceInquiriesCount[0].count) +
    Number(pendingUsersCount[0].count);

  return totalUnreadNotifications;
}


export async function markContactFormAsRead(id: string) {
  const headersList  = await headers();
    const ipAddress = headersList.get('x-forwarded-for') || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';
  // Convert string UUID to UUID type if needed
  const updatedMessage = await db
    .update(contactForms)
    .set({ read: true })
    .where(eq(contactForms.id, id))
    .returning();

  if (updatedMessage.length > 0) {
   
    await db.insert(auditLogs).values({
      action: 'UPDATE',
      tableName: 'contact_forms',
      recordId: id,
      details: JSON.stringify({ action: 'Marked contact form as read', data: updatedMessage[0] }),
      ipAddress: ipAddress, 
      userAgent: userAgent,
    });
  }

  return updatedMessage[0];
}

export async function getAllNotifications() {
  const contactMessages = await db
    .select({
      id: contactForms.id,
      type: sql<'contact'>`'contact'`,
      name: contactForms.name,
      email: contactForms.email,
      topic: contactForms.topic,
      message: contactForms.message,
      createdAt: contactForms.createdAt,
      read: contactForms.read,
    })
    .from(contactForms)
    .orderBy(desc(contactForms.createdAt));

  const serviceInquiriesData = await db
    .select({
      id: serviceInquiries.id,
      type: sql<'service'>`'service'`,
      name: serviceInquiries.name,
      email: serviceInquiries.email,
      companyName: serviceInquiries.companyName,
      phoneNumber: serviceInquiries.phoneNumber,
      service: serviceInquiries.service,
      createdAt: serviceInquiries.createdAt,
      read: serviceInquiries.read,
    })
    .from(serviceInquiries)
    .orderBy(desc(serviceInquiries.createdAt));

  return [...contactMessages, ...serviceInquiriesData].map((notification) => ({
    ...notification,
    isSelected: false,
    isRead: notification.read,
  }));
}

export async function getAllServiceInquiry() {
 
  const allServiceInquiry = await db
    .select({
      id: serviceInquiries.id,
      name: serviceInquiries.name,
      email: serviceInquiries.email,
      companyName: serviceInquiries.companyName,
      phoneNumber: serviceInquiries.phoneNumber,
      service: serviceInquiries.service,
      createdAt: serviceInquiries.createdAt,
      read: serviceInquiries.read,
    })
    .from(serviceInquiries)
    .orderBy(desc(serviceInquiries.createdAt));


  return allServiceInquiry.map((message) => ({
    ...message,
    isSelected: false,
    isRead: message.read,
  }));
}

export async function getAllContactMessages() {
  const contactMessages = await db
    .select({
      id: contactForms.id,
      type: sql<'contact'>`'contact'`,
      name: contactForms.name,
      email: contactForms.email,
      topic: contactForms.topic,
      message: contactForms.message,
      createdAt: contactForms.createdAt,
      read: contactForms.read,
    })
    .from(contactForms)
    .orderBy(desc(contactForms.createdAt));

    return contactMessages.map((message) => ({
      ...message,
      isSelected: false,
      isRead: message.read,
    }))
}

export async function deleteRecords(ids: { contactFormIds?: string[], serviceInquiryIds?: string[] }) {
  const headersList = await headers();
  const ipAddress = headersList.get('x-forwarded-for') || 'unknown';
  const userAgent = headersList.get('user-agent') || 'unknown';

  // Delete contact forms and log
  if (ids.contactFormIds && ids.contactFormIds.length > 0) {
    for (const id of ids.contactFormIds) {
      const deletedContactForm = await db
        .delete(contactForms)
        .where(eq(contactForms.id, id))
        .returning();

      if (deletedContactForm.length > 0) {
        await db.insert(auditLogs).values({
          action: 'DELETE',
          tableName: 'contact_forms',
          recordId: id,
          details: JSON.stringify({ action: 'Deleted contact form', data: deletedContactForm[0] }),
          ipAddress: ipAddress,
          userAgent: userAgent,
        });
      }
    }
  }

  // Delete service inquiries and log
  if (ids.serviceInquiryIds && ids.serviceInquiryIds.length > 0) {
    for (const id of ids.serviceInquiryIds) {
      const deletedServiceInquiry = await db
        .delete(serviceInquiries)
        .where(eq(serviceInquiries.id, id))
        .returning();

      if (deletedServiceInquiry.length > 0) {
        await db.insert(auditLogs).values({
          action: 'DELETE',
          tableName: 'service_inquiries',
          recordId: id,
          details: JSON.stringify({ action: 'Deleted service inquiry', data: deletedServiceInquiry[0] }),
          ipAddress: ipAddress,
          userAgent: userAgent,
        });
      }
    }
  }

  return { success: true };
}

export async function markServiceInquiryAsRead(id: string) {
  const headersList = await headers();
  const ipAddress = headersList.get('x-forwarded-for') || 'unknown';
  const userAgent = headersList.get('user-agent') || 'unknown';

  const updatedInquiry = await db
    .update(serviceInquiries)
    .set({ read: true })
    .where(eq(serviceInquiries.id, id))
    .returning();

  if (updatedInquiry.length > 0) {
    await db.insert(auditLogs).values({
      action: 'UPDATE',
      tableName: 'service_inquiries',
      recordId: id,
      details: JSON.stringify({ action: 'Marked service inquiry as read', data: updatedInquiry[0] }),
      ipAddress: ipAddress,
      userAgent: userAgent,
    });
  }

  return updatedInquiry[0];
}

export async function getPendingUsers() {
  const pendingUsers = await db
    .select({
      id: users.id,
      name: users.name,
      surname: users.surname,
      email: users.email,
      role: users.role,
      status: users.status,
      image: users.image,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.status, "PENDING"))
    .orderBy(desc(users.createdAt));

  return pendingUsers;
}

export async function updateUserStatus(id: string, status: 'APPROVED' | 'REJECTED') {
  const headersList = await headers();
  const ipAddress = headersList.get('x-forwarded-for') || 'unknown';
  const userAgent = headersList.get('user-agent') || 'unknown';

  const updatedUser = await db
    .update(users)
    .set({ status })
    .where(eq(users.id, id))
    .returning();

  if (updatedUser.length > 0) {
    await db.insert(auditLogs).values({
      action: 'UPDATE',
      tableName: 'users',
      recordId: id,
      details: JSON.stringify({ action: `User status updated to ${status}`, data: updatedUser[0] }),
      ipAddress: ipAddress,
      userAgent: userAgent,
    });
  }

  return updatedUser[0];
}