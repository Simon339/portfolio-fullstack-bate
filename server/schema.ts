import { varchar, uuid, integer, text, pgTable, pgEnum, timestamp, boolean, primaryKey, date, uniqueIndex, jsonb } from "drizzle-orm/pg-core";
  
export const APPROVAL_STATUS_ENUM = pgEnum("approval_status", [ "PENDING", "APPROVED", "REJECTED"]);
  
export const UserRole = pgEnum("role", ["USER", "ADMIN", "SUPER_ADMIN"]);

export const backupFrequencyEnum = pgEnum("backup_frequency", ["daily", "weekly", "monthly"])

export const backupTypeEnum = pgEnum("backup_type", ["manual", "scheduled"])

export const backupStatusEnum = pgEnum("backup_status", ["pending", "completed", "failed"])
  
  export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    surname: varchar("surname", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    country: varchar("country", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    emailVerified: timestamp("email_verified"),
    password: text("password").notNull(),
    image: varchar("image", { length: 255 }),
    role: UserRole("role").notNull().default("USER"),
    status: APPROVAL_STATUS_ENUM("status").default("PENDING").notNull(),
    lastActivityDate: date("last_activity_date").defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletionRequestedAt: timestamp("deletion_requested_at", { withTimezone: true }),
  });
  
  export const verificationTokens = pgTable(
    "verification_tokens",
    {
      id: uuid("id").primaryKey().defaultRandom(),
      email: varchar("email", { length: 255 }).notNull(),
      token: varchar("token", { length: 255 }).notNull(),
      expires: timestamp("expires", { withTimezone: true }).notNull(),
    },
    (table) => ({
      verificationTokenUnique: uniqueIndex("verification_token_unique").on(table.email, table.token),
    })
  );
  
  export const passwordResetTokens = pgTable(
    "password_reset_tokens",
    {
      id: uuid("id").primaryKey().defaultRandom(),
      email: varchar("email", { length: 255 }).notNull(),
      token: varchar("token", { length: 255 }).notNull(),
      expires: timestamp("expires", { withTimezone: true }).notNull(),
    },
    (table) => ({
      uniqueEmailToken: uniqueIndex("unique_email_token").on(table.email, table.token),
    })
  );
  
  export const contactForms = pgTable("contact_forms", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    topic: varchar("topic", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    message: text("message").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    read: boolean("read").default(false).notNull(),
  });
  
  export const ratings = pgTable("ratings", {
    id: uuid("id").primaryKey().defaultRandom(),
    rating: integer("rating").notNull(),
    feedback: text("feedback"),
    name: varchar("name", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  });
  
  export const tokens = pgTable(
    "tokens",
    {
      id: uuid("id").primaryKey().defaultRandom(),
      email: varchar("email", { length: 255 }).notNull(),
      token: varchar("token", { length: 255 }).notNull(),
      expires: timestamp("expires", { withTimezone: true }).notNull(),
    },
    (table) => ({
      tokensUniqueEmailToken: uniqueIndex("tokens_unique_email_token").on(table.email, table.token),
    })
  );
  
  export const serviceInquiries = pgTable("service_inquiries", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    companyName: varchar("company_name", { length: 255 }).notNull(),
    service: varchar("service", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    read: boolean("read").default(false).notNull(),
  });
  
  export const techstacks = pgTable("techstacks", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).unique().notNull(),
    image: text("image"),
  });
  
  export const categories = pgTable("categories", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).unique().notNull(),
  });
  
  export const projects = pgTable("projects", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description").notNull(),
    demo: varchar("demo", { length: 255 }).notNull(),
    image: text("image"),
    features: jsonb("features"), 
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: 'set null' }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  });
  
  export const projectTechstacks = pgTable(
    "project_techstacks",
    {
      projectId: uuid("project_id")
        .notNull()
        .references(() => projects.id, { onDelete: 'cascade' }),
      techstackId: uuid("techstack_id")
        .notNull()
        .references(() => techstacks.id, { onDelete: 'cascade' }),
    },
    (table) => ({
      pk: primaryKey({ columns: [table.projectId, table.techstackId] }),
    })
  );
  
  export const auditLogs = pgTable("audit_logs", {
    id: uuid("id").primaryKey().defaultRandom(),
    action: varchar("action", { length: 50 }).notNull(),
    tableName: varchar("table_name", { length: 255 }).notNull(),
    recordId: varchar("record_id", { length: 255 }).notNull(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    timestamp: timestamp("timestamp", { withTimezone: true }).defaultNow().notNull(),
    details: jsonb("details"),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
  });

  export const deletedUsers = pgTable("deleted_users", {
    id: uuid("id").primaryKey().defaultRandom(),
    originalUserId: uuid("original_user_id").notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }).defaultNow().notNull(),
    userData: jsonb("user_data").notNull(),
  })

  export const backups = pgTable("backups", {
    id: uuid("id").primaryKey().defaultRandom(),
    filename: varchar("filename", { length: 255 }).notNull(),
    path: varchar("path", { length: 512 }).notNull(),
    size: varchar("size", { length: 20 }).notNull(),
    type: backupTypeEnum("type").default("manual").notNull(),
    status: backupStatusEnum("status").default("completed").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    notes: text("notes"),
    metadata: jsonb("metadata"),
  })

  export const systemSettings = pgTable("system_settings", {
    id: uuid("id").defaultRandom().primaryKey(),
  siteName: varchar("site_name", { length: 255 }).notNull(),
  siteDescription: text("site_description"),
  logo: varchar("logo", { length: 255 }),
  contactEmail: varchar("contact_email", { length: 255 }).notNull(),
  timezone: varchar("timezone", { length: 50 }).notNull(),
  maintenanceMode: boolean("maintenance_mode").default(false),
  backupFrequency: backupFrequencyEnum("backup_frequency").default("daily"),
  backupEnabled: boolean("backup_enabled").default(false),
  backupRetentionDays: integer("backup_retention_days").default(30),
  fontFamily: varchar("font_family", { length: 50 }).default("Inter"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  });
