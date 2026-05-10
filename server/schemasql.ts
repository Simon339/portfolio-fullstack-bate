import { relations } from 'drizzle-orm';
import { mysqlTable, varchar, boolean, datetime, text, index, foreignKey, int, json, primaryKey, mysqlEnum,  decimal, timestamp } from 'drizzle-orm/mysql-core';


// User table
export const user = mysqlTable('user', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: varchar('image', { length: 500 }),
  twoFactorEnabled: boolean('two_factor_enabled').default(false).notNull(),
  role: mysqlEnum("role", ["user", "admin", "owner"]).default('user').notNull(),
  banned: boolean('banned').default(false).notNull(),
  banReason: varchar('ban_reason', { length: 500 }),
  banExpires: datetime('ban_expires'),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull(),
}, (table) => ({
  emailIdx: index('email_idx').on(table.email),
  roleIdx: index('user_role_idx').on(table.role),
  bannedIdx: index('user_banned_idx').on(table.banned),
}));

// Session table
export const session = mysqlTable('session', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: datetime('expires_at').notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: varchar('user_agent', { length: 500 }),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull(),
  impersonatedBy: varchar('impersonated_by', { length: 255 }),
}, (table) => ({
  userIdx: index('user_idx').on(table.userId),
  tokenIdx: index('token_idx').on(table.token),
  expiresIdx: index('expires_idx').on(table.expiresAt),
  userFk: foreignKey({
    columns: [table.userId],
    foreignColumns: [user.id],
    name: 'sessions_user_id_fk'
  }).onDelete('cascade'),
  impersonatedByFk: foreignKey({
    columns: [table.impersonatedBy],
    foreignColumns: [user.id],
    name: 'sessions_impersonated_by_fk'
  }).onDelete('set null'),
}));

// Account table
export const account = mysqlTable('account', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  accountId: varchar('account_id', { length: 255 }).notNull(),
  providerId: varchar('provider_id', { length: 255 }).notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  accessTokenExpiresAt: datetime('access_token_expires_at'),
  refreshTokenExpiresAt: datetime('refresh_token_expires_at'),
  scope: varchar('scope', { length: 500 }),
  idToken: text('id_token'),
  password: varchar('password', { length: 255 }),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull(),
}, (table) => ({
  userIdx: index('accounts_user_idx').on(table.userId),
  providerIdx: index('provider_idx').on(table.providerId),
  accountProviderIdx: index('account_provider_idx').on(table.accountId, table.providerId),
  userFk: foreignKey({
    columns: [table.userId],
    foreignColumns: [user.id],
    name: 'accounts_user_id_fk'
  }).onDelete('cascade'),
}));

// Verification table
export const verification = mysqlTable('verification', {
  id: varchar('id', { length: 36 }).primaryKey(),
  identifier: varchar('identifier', { length: 255 }).notNull(),
  value: varchar('value', { length: 255 }).notNull(),
  expiresAt: datetime('expires_at').notNull(),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull(),
}, (table) => ({
  identifierIdx: index('identifier_idx').on(table.identifier),
  expiresIdx: index('verification_expires_idx').on(table.expiresAt),
}));

// Two-factor authentication table
export const twoFactor = mysqlTable('two_factor', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull().unique(),
  secret: varchar('secret', { length: 255 }),
  backupCodes: text('backup_codes'),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull(),
}, (table) => ({
  userIdx: index('two_factor_user_idx').on(table.userId),
  userFk: foreignKey({
    columns: [table.userId],
    foreignColumns: [user.id],
    name: 'two_factor_user_id_fk'
  }).onDelete('cascade'),
}));


// Contact forms table
export const contactForms = mysqlTable('contact_forms', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  topic: varchar('topic', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  message: text('message').notNull(),
  read: boolean('read').default(false).notNull(),
  createdAt: datetime('created_at').notNull(),
}, (table) => ({
  emailIdx: index('contact_forms_email_idx').on(table.email),
  readIdx: index('contact_forms_read_idx').on(table.read),
  createdAtIdx: index('contact_forms_created_at_idx').on(table.createdAt),
}));

// Ratings table
export const ratings = mysqlTable('ratings', {
  id: varchar('id', { length: 255 }).primaryKey(),
  rating: int('rating').notNull(),
  feedback: text('feedback'),
  name: varchar('name', { length: 255 }),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull(),
}, (table) => ({
  ratingIdx: index('ratings_rating_idx').on(table.rating),
  createdAtIdx: index('ratings_created_at_idx').on(table.createdAt),
}));

// Service inquiries table
export const serviceInquiries = mysqlTable('service_inquiries', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  companyName: varchar('company_name', { length: 255 }).notNull(),
  service: varchar('service', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  address: json("address").$type<{
    unit: string | null;
    street: string;
    subdivision: string | null;
    city: string;
    province: string;
    postalCode: string;
  }>(),
  phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
  quotationNumber: varchar("quotation_number", { length: 50 }).notNull().unique(),

  //serviceinquiries made by user or admin
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }),
  total: decimal("total", { precision: 10, scale: 2 }),
  notes: text("notes"),
  terms: text("terms"),

  read: boolean('read').default(false).notNull(),
  createdAt: datetime('created_at').notNull(),
}, (table) => ({
  emailIdx: index('service_inquiries_email_idx').on(table.email),
  serviceIdx: index('service_inquiries_service_idx').on(table.service),
  readIdx: index('service_inquiries_read_idx').on(table.read),
}));

// Quotation Items Table 
export const quotationItems = mysqlTable("quotation_items", {
  id: varchar("id", { length: 36 }).primaryKey(),
  quotationId: varchar("quotation_id", { length: 36 })
    .notNull(),
  description: text("description").notNull(),
  quantity: int("quantity").notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
}, (table) => ({
  quotationIdx: index('quotation_items_quotation_idx').on(table.quotationId), // Added index
  quotationFk: foreignKey({ 
    columns: [table.quotationId],
    foreignColumns: [serviceInquiries.id],
    name: 'quotation_items_quotation_id_fk'
  }).onDelete('cascade'),
}));

// Techstacks table
export const techstacks = mysqlTable('techstacks', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  image: text('image'),
}, (table) => ({
  nameIdx: index('techstacks_name_idx').on(table.name),
}));

// Categories table
export const categories = mysqlTable('categories', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull().unique(),
}, (table) => ({
  nameIdx: index('categories_name_idx').on(table.name),
}));

// Projects table
export const projects = mysqlTable('projects', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  demo: varchar('demo', { length: 255 }).notNull(),
  image: text('image'),
  features: json('features'),
  categoryId: varchar('category_id', { length: 255 }),
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull(),
}, (table) => ({
  nameIdx: index('projects_name_idx').on(table.name),
  categoryIdx: index('projects_category_idx').on(table.categoryId),
  createdAtIdx: index('projects_created_at_idx').on(table.createdAt),
  categoryFk: foreignKey({
    columns: [table.categoryId],
    foreignColumns: [categories.id],
    name: 'projects_category_id_fk'
  }).onDelete('cascade'),
}));


// Project techstacks table (junction)
export const projectTechstacks = mysqlTable('project_techstacks', {
  projectId: varchar('project_id', { length: 255 }).notNull(),
  techstackId: varchar('techstack_id', { length: 255 }).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.projectId, table.techstackId] }),
  projectIdx: index('project_techstacks_project_idx').on(table.projectId),
  techstackIdx: index('project_techstacks_techstack_idx').on(table.techstackId),
  projectFk: foreignKey({
    columns: [table.projectId],
    foreignColumns: [projects.id],
    name: 'project_techstacks_project_id_fk'
  }).onDelete('cascade'),
  techstackFk: foreignKey({
    columns: [table.techstackId],
    foreignColumns: [techstacks.id],
    name: 'project_techstacks_techstack_id_fk'
  }).onDelete('cascade'),
}));

// Audit logs table
export const auditLogs = mysqlTable('audit_logs', {
  id: int('id').primaryKey().autoincrement(),
  action: varchar('action', { length: 50 }).notNull(),
  tableName: varchar('table_name', { length: 255 }).notNull(),
  recordId: varchar('record_id', { length: 255 }).notNull(),
  userId: varchar('user_id', { length: 255 }),
  timestamp: datetime('timestamp').notNull(),
  details: json('details'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
}, (table) => ({
  actionIdx: index('audit_logs_action_idx').on(table.action),
  tableNameIdx: index('audit_logs_table_name_idx').on(table.tableName),
  userIdIdx: index('audit_logs_user_id_idx').on(table.userId),
  timestampIdx: index('audit_logs_timestamp_idx').on(table.timestamp),
  userFk: foreignKey({
    columns: [table.userId],
    foreignColumns: [user.id],
    name: 'audit_logs_user_id_fk'
  }).onDelete('set null'),
}));

// Relations
export const usersRelations = relations(user, ({ many, one }) => ({
  sessions: many(session, { relationName: 'userSessions' }),
  accounts: many(account),
  twoFactor: one(twoFactor),
  impersonatedSessions: many(session, { relationName: 'impersonatedSessions' }),
}));

// Fix for sessionsRelations - add matching relationName values
export const sessionsRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
    relationName: 'userSessions',
  }),
  impersonatedByUser: one(user, {
    fields: [session.impersonatedBy],
    references: [user.id],
    relationName: 'impersonatedSessions',
  }),
}));

export const accountsRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));


export const twoFactorRelations = relations(twoFactor, ({ one }) => ({
  user: one(user, {
    fields: [twoFactor.userId],
    references: [user.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  category: one(categories, {
    fields: [projects.categoryId],
    references: [categories.id],
  }),
  techstacks: many(projectTechstacks),
}));

export const projectTechstacksRelations = relations(projectTechstacks, ({ one }) => ({
  project: one(projects, {
    fields: [projectTechstacks.projectId],
    references: [projects.id],
  }),
  techstack: one(techstacks, {
    fields: [projectTechstacks.techstackId],
    references: [techstacks.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(user, {
    fields: [auditLogs.userId],
    references: [user.id],
  }),
}));

export const serviceInquiriesRelations = relations(serviceInquiries, ({ many }) => ({
  quotationItems: many(quotationItems),
}));

export const quotationItemsRelations = relations(quotationItems, ({ one }) => ({
  serviceInquiry: one(serviceInquiries, {
    fields: [quotationItems.quotationId],
    references: [serviceInquiries.id],
  }),
}));

// Export the schema object
export const schema = {
  user,
  session,
  account,
  verification,
  twoFactor,
  contactForms,
  ratings,
  serviceInquiries,
  techstacks,
  categories,
  projects,
  projectTechstacks,
  auditLogs,
};

// Export enum types
export type UserRole = "user" | "admin" | "owner";

// Export types
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;
export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;
export type VerificationToken = typeof verification.$inferSelect;
export type NewVerificationToken = typeof verification.$inferInsert;
export type TwoFactor = typeof twoFactor.$inferSelect;
export type NewTwoFactor = typeof twoFactor.$inferInsert;
export type ContactForm = typeof contactForms.$inferSelect;
export type NewContactForm = typeof contactForms.$inferInsert;
export type Rating = typeof ratings.$inferSelect;
export type NewRating = typeof ratings.$inferInsert;
export type ServiceInquiry = typeof serviceInquiries.$inferSelect;
export type NewServiceInquiry = typeof serviceInquiries.$inferInsert;
export type Techstack = typeof techstacks.$inferSelect;
export type NewTechstack = typeof techstacks.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type ProjectTechstack = typeof projectTechstacks.$inferSelect;
export type NewProjectTechstack = typeof projectTechstacks.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;