// app/actions/seed-actions.ts
'use server'

import { seedDatabase, clearDatabase } from '@/server/data/seedd';

export async function seedDatabaseAction() {
  try {
    const result = await seedDatabase();
    return result;
  } catch (error) {
    console.error('Error in seed action:', error);
    return { 
      success: false, 
      message: 'Failed to seed database' 
    };
  }
}

export async function clearDatabaseAction() {
  try {
    const result = await clearDatabase();
    return result;
  } catch (error) {
    console.error('Error in clear action:', error);
    return { 
      success: false, 
      message: 'Failed to clear database' 
    };
  }
}