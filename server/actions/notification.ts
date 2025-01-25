'use server';

import { db } from "../db";

export async function getUnreadNotifications() {
  const unreadContactMessages = await db.contactForm.findMany({
    where: {
      read: false,  
    },
    orderBy: {
      createdAt: 'desc',  
    },
  });

  return unreadContactMessages;
}

export async function countUnreadNotifications() {
  const unreadContactMessagesCount = await db.contactForm.count({
    where: {
      read: false,
    },
  });

  return unreadContactMessagesCount;
}

export async function markContactFormAsRead(id: string | number) {
  const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
  const updatedMessage = await db.contactForm.update({
    where: { id: numericId },
    data: {
      read: true,
    },
  });
  return updatedMessage;
}

export async function getAllContactMessages() {
  const allContactMessages = await db.contactForm.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      topic: true,
      message: true,
      createdAt: true,
      read: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return allContactMessages.map(message => ({
    ...message,
    isSelected: false,
    isRead: message.read,
  }));
}

export async function getAllServiceInquiry() {
  const allServiceInquiry = await db.serviceInquiry.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      companyName: true,
      phoneNumber: true,
      service: true,
      createdAt: true,
      read: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return allServiceInquiry.map(message => ({
    ...message,
    isSelected: false,
    isRead: message.read,
  }));
}