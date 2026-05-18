import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
const client = new Client({
  connectionString: process.env.DATABASE_URL!,
});

// Test connection
client.connect()
  .then(() => {
  })
  .catch(err => {
  });

export const db = drizzle(process.env.DATABASE_URL!);



// Create connection pool
// const pool = mysql.createPool({
//   uri: process.env.DATABASE_URL!,
// });

// // Test connection
// pool.getConnection().then(conn => {
//   console.log('Database connected successfully');
//   conn.release();
// }).catch(err => {
//   console.error('Database connection failed:', err);
// });
// export const db = drizzle(pool);

// import { drizzle } from 'drizzle-orm/libsql';
// import { createClient } from '@libsql/client';

// const client = createClient({
//   url: process.env.TURSO_DATABASE_URL!,
//   authToken: process.env.TURSO_AUTH_TOKEN!,
// });

// // Test the connection
// client.execute('SELECT 1')
//   .then(() => {
//     console.log('Database connected successfully');
//   })
//   .catch(err => {
//     console.error('Database connection failed:', err);
//   });

// export const db = drizzle(client);
