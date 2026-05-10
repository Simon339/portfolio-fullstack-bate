
import { defineConfig } from 'drizzle-kit';


// export default defineConfig({
//   out: "./drizzle",
//   schema: "./server/schema.ts",
//   dialect: "turso",
//   dbCredentials: {
//     url: process.env.TURSO_DATABASE_URL!,
//     authToken: process.env.TURSO_AUTH_TOKEN!,
//   },
// });

//mysql
export default defineConfig({
  schema: "./server/schema.ts",
  out: "./drizzle",
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});