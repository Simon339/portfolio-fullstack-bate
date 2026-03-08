
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as dotenv from "dotenv";

dotenv.config();

// Create MySQL connection pool
const poolConnection = mysql.createPool({
  uri: process.env.DATABASE_URL!,
});

// Create drizzle instance with MySQL
export const db = drizzle({ client:poolConnection });