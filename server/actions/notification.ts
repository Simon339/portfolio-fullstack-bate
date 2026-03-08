'use server';

import { db } from "@/server/db";
import { contactForms, serviceInquiries, user } from "../schema";
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

  // Ensure all counts are numbers and sum them
  const totalUnreadNotifications = Number(unreadContactMessagesCount[0]?.count || 0) + Number(unreadServiceInquiriesCount[0]?.count || 0) 

  return totalUnreadNotifications;
}

export async function markContactFormAsRead(id: string) {
  const headersList  = await headers();
  const ipAddress = headersList.get('x-forwarded-for') || 'unknown';
  const userAgent = headersList.get('user-agent') || 'unknown';
  
  // Get the message before updating
  const messageToUpdate = await db
    .select()
    .from(contactForms)
    .where(eq(contactForms.id, id))
    .limit(1);

  if (messageToUpdate.length === 0) {
    throw new Error('Contact form not found');
  }

  // Update the message
  const updatedMessage = await db
    .update(contactForms)
    .set({ read: true })
    .where(eq(contactForms.id, id))


  return updatedMessage[0];
}

export async function getAllNotifications() {
  const contactMessages = await db
    .select({
      id: contactForms.id,
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
  console.log('Fetching all service inquiries...');
  
  const allServiceInquiry = await db
    .select({
      id: serviceInquiries.id,
      name: serviceInquiries.name,
      email: serviceInquiries.email,
      companyName: serviceInquiries.companyName,
      quotationNumber: serviceInquiries.quotationNumber,
      phoneNumber: serviceInquiries.phoneNumber,
      address: serviceInquiries.address,
      service: serviceInquiries.service,
      subtotal: serviceInquiries.subtotal,
      taxRate: serviceInquiries.taxRate,
      total: serviceInquiries.total,
      notes: serviceInquiries.notes,
      terms: serviceInquiries.terms,
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

  // Delete contact forms
  if (ids.contactFormIds && ids.contactFormIds.length > 0) {
    for (const id of ids.contactFormIds) {
      await db
        .delete(contactForms)
        .where(eq(contactForms.id, id));
    }
  }

  // Delete service inquiries
  if (ids.serviceInquiryIds && ids.serviceInquiryIds.length > 0) {
    for (const id of ids.serviceInquiryIds) {
      await db
        .delete(serviceInquiries)
        .where(eq(serviceInquiries.id, id));
    }
  }

  return { success: true };
}

export async function markServiceInquiryAsRead(id: string) {
  const headersList = await headers();
  const ipAddress = headersList.get('x-forwarded-for') || 'unknown';
  const userAgent = headersList.get('user-agent') || 'unknown';

  // Get the inquiry before updating
  const inquiryToUpdate = await db
    .select()
    .from(serviceInquiries)
    .where(eq(serviceInquiries.id, id))
    .limit(1);

  if (inquiryToUpdate.length === 0) {
    throw new Error('Service inquiry not found');
  }

  const updatedInquiry = await db
    .update(serviceInquiries)
    .set({ read: true })
    .where(eq(serviceInquiries.id, id))

  return updatedInquiry[0];
}

export async function getPendingUsers() {
  const pendingUsers = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(desc(user.createdAt));

  return pendingUsers;
}

export async function getNotifications(options?: { limit?: number }) {
  const limit = options?.limit || 50;
  
  
  try {
    // Get ALL contact messages
    const contactMessages = await db
      .select({
        id: contactForms.id,
        title: sql<string>`'New Contact Message'`,
        message: sql<string>`CONCAT('From: ', ${contactForms.name}, ' - ', ${contactForms.topic})`,
        type: sql<'info'>`'info'`,
        read: contactForms.read,
        createdAt: contactForms.createdAt,
        metadata: sql<Record<string, any>>`JSON_OBJECT(
          'source', 'contact_form',
          'id', ${contactForms.id},
          'name', ${contactForms.name},
          'email', ${contactForms.email}
        )`
      })
      .from(contactForms)
      .orderBy(desc(contactForms.createdAt));

    // Get ALL service inquiries
    const serviceInquiriesData = await db
      .select({
        id: serviceInquiries.id,
        title: sql<string>`'New Service Inquiry'`,
        message: sql<string>`CONCAT('Service: ', ${serviceInquiries.service}, ' - Company: ', ${serviceInquiries.companyName})`,
        type: sql<'warning'>`'warning'`,
        read: serviceInquiries.read,
        createdAt: serviceInquiries.createdAt,
        metadata: sql<Record<string, any>>`JSON_OBJECT(
          'source', 'service_inquiry',
          'id', ${serviceInquiries.id},
          'name', ${serviceInquiries.name},
          'company', ${serviceInquiries.companyName}
        )`
      })
      .from(serviceInquiries)
      .orderBy(desc(serviceInquiries.createdAt));

    // Get recent users (last 7 days) - MariaDB syntax
    const pendingUsers = await db
      .select({
        id: user.id,
        title: sql<string>`'Pending User Registration'`,
        message: sql<string>`CONCAT('New user: ', ${user.name}, ' (', ${user.email}, ')')`,
        type: sql<'success'>`'success'`,
        read: sql<boolean>`false`,
        createdAt: user.createdAt,
        metadata: sql<Record<string, any>>`JSON_OBJECT(
          'source', 'user_registration',
          'id', ${user.id},
          'name', ${user.name},
          'email', ${user.email}
        )`
      })
      .from(user)
      .where(sql`${user.createdAt} > DATE_SUB(NOW(), INTERVAL 7 DAY)`)
      .orderBy(desc(user.createdAt));

    // Combine ALL notifications
    const allNotifications = [
      ...contactMessages,
      ...serviceInquiriesData,
      ...pendingUsers
    ];
    // Sort by createdAt date (most recent first) and apply limit ONLY at the end
    const sortedNotifications = allNotifications
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
    return sortedNotifications;
  } catch (error) {
    console.error('Error in getNotifications:', error);
    // Return empty array instead of throwing to prevent UI crash
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string) {
  const headersList = await headers();
  const ipAddress = headersList.get('x-forwarded-for') || 'unknown';
  const userAgent = headersList.get('user-agent') || 'unknown';

  // Try to find and mark as read in contact forms
  const contactForm = await db
    .select()
    .from(contactForms)
    .where(eq(contactForms.id, notificationId))
    .limit(1);

  if (contactForm.length > 0) {
    return await markContactFormAsRead(notificationId);
  }

  // Try to find and mark as read in service inquiries
  const serviceInquiry = await db
    .select()
    .from(serviceInquiries)
    .where(eq(serviceInquiries.id, notificationId))
    .limit(1);

  if (serviceInquiry.length > 0) {
    return await markServiceInquiryAsRead(notificationId);
  }

  // For user registrations, just return success since users don't have read status
  const userExists = await db
    .select()
    .from(user)
    .where(eq(user.id, notificationId))
    .limit(1);

  if (userExists.length > 0) {
    return { id: notificationId, read: true };
  }

  throw new Error(`Notification not found: ${notificationId}`);
}

export async function markAllNotificationsAsRead() {
  const headersList = await headers();
  const ipAddress = headersList.get('x-forwarded-for') || 'unknown';
  const userAgent = headersList.get('user-agent') || 'unknown';

  // Mark all contact forms as read
  const updatedContactForms = await db
    .update(contactForms)
    .set({ read: true })
    .where(eq(contactForms.read, false))

  // Mark all service inquiries as read
  const updatedServiceInquiries = await db
    .update(serviceInquiries)
    .set({ read: true })
    .where(eq(serviceInquiries.read, false))

  return {
    contactFormsUpdated: updatedContactForms.length,
    serviceInquiriesUpdated: updatedServiceInquiries.length
  };
}

// Add function to get notification counts by type
export async function getNotificationCounts() {
  try {
    const [unreadContacts, unreadServices] = await Promise.all([
      db.select({ count: sql<number>`count(*)` })
        .from(contactForms)
        .where(eq(contactForms.read, false)),
      db.select({ count: sql<number>`count(*)` })
        .from(serviceInquiries)
        .where(eq(serviceInquiries.read, false)),
      db.select({ count: sql<number>`count(*)` })
        .from(user)
        .where(sql`${user.createdAt} > DATE_SUB(NOW(), INTERVAL 7 DAY)`)
    ]);

    return {
      unreadContacts: Number(unreadContacts[0]?.count || 0),
      unreadServices: Number(unreadServices[0]?.count || 0),
      total: Number(unreadContacts[0]?.count || 0) + 
            Number(unreadServices[0]?.count || 0)
    };
  } catch (error) {
    console.error('Error in getNotificationCounts:', error);
    return {
      unreadContacts: 0,
      unreadServices: 0,
      total: 0
    };
  }
}

// Simplified version if JSON_OBJECT doesn't work
export async function getSimpleNotifications(options?: { limit?: number }) {
  const limit = options?.limit || 50;
  
  try {
    // Get contact messages (simplified without JSON)
    const contactMessages = await db
      .select({
        id: sql<string>`CONCAT('contact_', ${contactForms.id})`, // Add prefix
        title: sql<string>`'New Contact Message'`,
        message: sql<string>`CONCAT('From: ', ${contactForms.name}, ' - ', ${contactForms.topic})`,
        type: sql<'info'>`'info'`,
        read: contactForms.read,
        createdAt: contactForms.createdAt,
        source: sql<string>`'contact_form'`
      })
      .from(contactForms)
      .orderBy(desc(contactForms.createdAt));

    // Get service inquiries (simplified without JSON)
    const serviceInquiriesData = await db
      .select({
        id: sql<string>`CONCAT('service_', ${serviceInquiries.id})`, // Add prefix
        title: sql<string>`'New Service Inquiry'`,
        message: sql<string>`CONCAT('Service: ', ${serviceInquiries.service}, ' - Company: ', ${serviceInquiries.companyName})`,
        type: sql<'warning'>`'warning'`,
        read: serviceInquiries.read,
        createdAt: serviceInquiries.createdAt,
        source: sql<string>`'service_inquiry'`
      })
      .from(serviceInquiries)
      .orderBy(desc(serviceInquiries.createdAt));

    // Combine ALL notifications
    const allNotifications = [
      ...contactMessages,
      ...serviceInquiriesData
    ];

    // Sort by createdAt date (most recent first) and apply limit ONLY at the end
    const sortedNotifications = allNotifications
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    // Add metadata manually
    return sortedNotifications.map(notification => ({
      ...notification,
      metadata: {
        source: notification.source,
        id: notification.id.replace(/^(contact_|service_)/, '')
      }
    }));
  } catch (error) {
    return [];
  }
}