import { drizzle } from "drizzle-orm/mysql2";
import mysql from 'mysql2/promise';

// Create connection pool
const pool = mysql.createPool({
  uri: process.env.DATABASE_URL!,
});

// Test connection
pool.getConnection().then(conn => {
  console.log('Database connected successfully');
  conn.release();
}).catch(err => {
  console.error('Database connection failed:', err);
});

export const db = drizzle(pool);