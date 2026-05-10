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

  // Convert to plain objects
  return unreadContactMessages.map(msg => ({
    ...msg,
    createdAt: msg.createdAt,
  }));
}

export async function countUnreadNotifications() {
  const unreadContactMessagesCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(contactForms)
    .where(eq(contactForms.read, false));

  const unreadServiceInquiriesCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(serviceInquiries)
    .where(eq(serviceInquiries.read, false));

  const totalUnreadNotifications = Number(unreadContactMessagesCount[0]?.count || 0) + Number(unreadServiceInquiriesCount[0]?.count || 0);

  return totalUnreadNotifications;
}

export async function markContactFormAsRead(id: string) {
  const headersList = await headers();
  const ipAddress = headersList.get('x-forwarded-for') || 'unknown';
  const userAgent = headersList.get('user-agent') || 'unknown';

  const messageToUpdate = await db
    .select()
    .from(contactForms)
    .where(eq(contactForms.id, id))
    .limit(1);

  if (messageToUpdate.length === 0) {
    throw new Error('Contact form not found');
  }

  await db
    .update(contactForms)
    .set({ read: true })
    .where(eq(contactForms.id, id));

  // Return plain object
  return {
    ...messageToUpdate[0],
    read: true,
    createdAt: messageToUpdate[0].createdAt,
  };
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

  // Convert to plain objects with serialized dates
  return [...contactMessages, ...serviceInquiriesData].map((notification) => ({
    ...notification,
    createdAt: notification.createdAt,
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

  // Convert to plain objects with serialized dates
  return allServiceInquiry.map((message) => ({
    ...message,
    createdAt: message.createdAt,
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

  // Convert to plain objects with serialized dates
  return contactMessages.map((message) => ({
    ...message,
    createdAt: message.createdAt,
    isSelected: false,
    isRead: message.read,
  }));
}

export async function deleteRecords(ids: { contactFormIds?: string[], serviceInquiryIds?: string[] }) {
  const headersList = await headers();
  const ipAddress = headersList.get('x-forwarded-for') || 'unknown';
  const userAgent = headersList.get('user-agent') || 'unknown';

  if (ids.contactFormIds && ids.contactFormIds.length > 0) {
    for (const id of ids.contactFormIds) {
      await db
        .delete(contactForms)
        .where(eq(contactForms.id, id));
    }
  }

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

  const inquiryToUpdate = await db
    .select()
    .from(serviceInquiries)
    .where(eq(serviceInquiries.id, id))
    .limit(1);

  if (inquiryToUpdate.length === 0) {
    throw new Error('Service inquiry not found');
  }

  await db
    .update(serviceInquiries)
    .set({ read: true })
    .where(eq(serviceInquiries.id, id));

  // Return plain object
  return {
    ...inquiryToUpdate[0],
    read: true,
    createdAt: inquiryToUpdate[0].createdAt,
  };
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

  // Convert to plain objects with serialized dates
  return pendingUsers.map(userData => ({
    ...userData,
    createdAt: userData.createdAt,
  }));
}

export async function getNotifications(options?: { limit?: number }) {
  const limit = options?.limit || 50;

  try {
    const contactMessages = await db
      .select({
        id: contactForms.id,
        name: contactForms.name,
        email: contactForms.email,
        topic: contactForms.topic,
        message: contactForms.message,
        read: contactForms.read,
        createdAt: contactForms.createdAt,
      })
      .from(contactForms)
      .where(eq(contactForms.read, false)) // Only unread
      .orderBy(desc(contactForms.createdAt));

    const serviceInquiriesData = await db
      .select({
        id: serviceInquiries.id,
        name: serviceInquiries.name,
        email: serviceInquiries.email,
        companyName: serviceInquiries.companyName,
        service: serviceInquiries.service,
        read: serviceInquiries.read,
        createdAt: serviceInquiries.createdAt,
      })
      .from(serviceInquiries)
      .where(eq(serviceInquiries.read, false)) // Only unread
      .orderBy(desc(serviceInquiries.createdAt));

    // Transform to notification format with plain objects
    const contactNotifications = contactMessages.map(msg => ({
      id: `contact_${msg.id}`,
      title: 'New Contact Message',
      message: `From: ${msg.name} - ${msg.topic}`,
      type: 'info' as const,
      read: msg.read,
      createdAt: msg.createdAt,
      metadata: {
        source: 'contact_form',
        id: msg.id,
        name: msg.name,
        email: msg.email,
      },
    }));

    const serviceNotifications = serviceInquiriesData.map(inquiry => ({
      id: `service_${inquiry.id}`,
      title: 'New Service Inquiry',
      message: `Service: ${inquiry.service} - Company: ${inquiry.companyName}`,
      type: 'warning' as const,
      read: inquiry.read,
      createdAt: inquiry.createdAt,
      metadata: {
        source: 'service_inquiry',
        id: inquiry.id,
        name: inquiry.name,
        company: inquiry.companyName,
      },
    }));

    const allNotifications = [
      ...contactNotifications,
      ...serviceNotifications,
    ];

    const sortedNotifications = allNotifications
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    return sortedNotifications;
  } catch (error) {
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string) {
  const headersList = await headers();
  const ipAddress = headersList.get('x-forwarded-for') || 'unknown';
  const userAgent = headersList.get('user-agent') || 'unknown';

  // Extract the actual ID without prefix
  const actualId = notificationId.replace(/^(contact_|service_|user_)/, '');

  // Try contact forms
  if (notificationId.startsWith('contact_')) {
    const contactForm = await db
      .select()
      .from(contactForms)
      .where(eq(contactForms.id, actualId))
      .limit(1);

    if (contactForm.length > 0) {
      await db
        .update(contactForms)
        .set({ read: true })
        .where(eq(contactForms.id, actualId));
      
      return {
        ...contactForm[0],
        read: true,
        createdAt: contactForm[0].createdAt,
      };
    }
  }

  // Try service inquiries
  if (notificationId.startsWith('service_')) {
    const serviceInquiry = await db
      .select()
      .from(serviceInquiries)
      .where(eq(serviceInquiries.id, actualId))
      .limit(1);

    if (serviceInquiry.length > 0) {
      await db
        .update(serviceInquiries)
        .set({ read: true })
        .where(eq(serviceInquiries.id, actualId));
      
      return {
        ...serviceInquiry[0],
        read: true,
        createdAt: serviceInquiry[0].createdAt,
      };
    }
  }

  // For user registrations
  if (notificationId.startsWith('user_')) {
    const userExists = await db
      .select()
      .from(user)
      .where(eq(user.id, actualId))
      .limit(1);

    if (userExists.length > 0) {
      return {
        ...userExists[0],
        read: true,
        createdAt: userExists[0].createdAt,
      };
    }
  }

  throw new Error(`Notification not found: ${notificationId}`);
}

export async function markAllNotificationsAsRead() {
  const headersList = await headers();
  const ipAddress = headersList.get('x-forwarded-for') || 'unknown';
  const userAgent = headersList.get('user-agent') || 'unknown';

  const updatedContactForms = await db
    .update(contactForms)
    .set({ read: true })
    .where(eq(contactForms.read, false));

  const updatedServiceInquiries = await db
    .update(serviceInquiries)
    .set({ read: true })
    .where(eq(serviceInquiries.read, false));

  return {
    contactFormsUpdated: updatedContactForms.length,
    serviceInquiriesUpdated: updatedServiceInquiries.length,
  };
}

export async function getNotificationCounts() {
  try {
    const [unreadContacts, unreadServices] = await Promise.all([
      db.select({ count: sql<number>`count(*)` })
        .from(contactForms)
        .where(eq(contactForms.read, false)),
      db.select({ count: sql<number>`count(*)` })
        .from(serviceInquiries)
        .where(eq(serviceInquiries.read, false)),
    ]);

    return {
      unreadContacts: Number(unreadContacts[0]?.count || 0),
      unreadServices: Number(unreadServices[0]?.count || 0),
      total: Number(unreadContacts[0]?.count || 0) +
        Number(unreadServices[0]?.count || 0),
    };
  } catch (error) {
    return {
      unreadContacts: 0,
      unreadServices: 0,
      total: 0,
    };
  }
}

export async function getSimpleNotifications(options?: { limit?: number }) {
  const limit = options?.limit || 50;

  try {
    const contactMessages = await db
      .select({
        id: contactForms.id,
        name: contactForms.name,
        email: contactForms.email,
        topic: contactForms.topic,
        message: contactForms.message,
        read: contactForms.read,
        createdAt: contactForms.createdAt,
      })
      .from(contactForms)
      .orderBy(desc(contactForms.createdAt));

    const serviceInquiriesData = await db
      .select({
        id: serviceInquiries.id,
        name: serviceInquiries.name,
        email: serviceInquiries.email,
        companyName: serviceInquiries.companyName,
        service: serviceInquiries.service,
        read: serviceInquiries.read,
        createdAt: serviceInquiries.createdAt,
      })
      .from(serviceInquiries)
      .orderBy(desc(serviceInquiries.createdAt));

    const contactNotifications = contactMessages.map(msg => ({
      id: `contact_${msg.id}`,
      title: 'New Contact Message',
      message: `From: ${msg.name} - ${msg.topic}`,
      type: 'info' as const,
      read: msg.read,
      createdAt: msg.createdAt,
      source: 'contact_form' as const,
      metadata: {
        source: 'contact_form',
        id: msg.id,
        name: msg.name,
        email: msg.email,
      },
    }));

    const serviceNotifications = serviceInquiriesData.map(inquiry => ({
      id: `service_${inquiry.id}`,
      title: 'New Service Inquiry',
      message: `Service: ${inquiry.service} - Company: ${inquiry.companyName}`,
      type: 'warning' as const,
      read: inquiry.read,
      createdAt: inquiry.createdAt,
      source: 'service_inquiry' as const,
      metadata: {
        source: 'service_inquiry',
        id: inquiry.id,
        name: inquiry.name,
        company: inquiry.companyName,
      },
    }));

    const allNotifications = [...contactNotifications, ...serviceNotifications];

    const sortedNotifications = allNotifications
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    return sortedNotifications;
  } catch (error) {
    return [];
  }
}