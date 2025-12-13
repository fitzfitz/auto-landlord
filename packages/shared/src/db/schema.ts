import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ============================================================================
// Users Table
// ============================================================================
export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  name: text("name"),
  role: text("role").notNull().default("LANDLORD"), // LANDLORD, TENANT, SUPER_ADMIN
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  subscription: one(subscriptions, {
    fields: [users.id],
    references: [subscriptions.userId],
  }),
  properties: many(properties),
  tenancy: one(tenants, {
    fields: [users.id],
    references: [tenants.userId],
  }),
  tickets: many(tickets),
  notifications: many(notifications),
}));

// ============================================================================
// Plans Table
// ============================================================================
export const plans = sqliteTable("plans", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  price: integer("price").notNull(), // in cents
  features: text("features").notNull(),
  maxProperties: integer("max_properties").notNull(),
});

export const plansRelations = relations(plans, ({ many }) => ({
  subscriptions: many(subscriptions),
}));

// ============================================================================
// Subscriptions Table
// ============================================================================
export const subscriptions = sqliteTable("subscriptions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id),
  planId: text("plan_id")
    .notNull()
    .references(() => plans.id),
  status: text("status").notNull(), // active, past_due, canceled

  // Phase 5: PayPal Integration
  paypalSubscriptionId: text("paypal_subscription_id"),
  paypalCustomerId: text("paypal_customer_id"),
  paypalPlanId: text("paypal_plan_id"),

  startDate: integer("start_date", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  endDate: integer("end_date", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  plan: one(plans, {
    fields: [subscriptions.planId],
    references: [plans.id],
  }),
}));

// ============================================================================
// Properties Table
// ============================================================================
export const properties = sqliteTable("properties", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  landlordId: text("landlord_id")
    .notNull()
    .references(() => users.id),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zip: text("zip").notNull(),
  rentAmount: integer("rent_amount").notNull(),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  propertyType: text("property_type"), // HOUSE, APARTMENT, CONDO, etc
  status: text("status").notNull().default("VACANT"), // VACANT, OCCUPIED, MAINTENANCE

  // Phase 4: Public Listing Fields
  slug: text("slug").unique(),
  description: text("description"),
  amenities: text("amenities"), // JSON string array
  isListed: integer("is_listed", { mode: "boolean" }).notNull().default(false),

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  landlord: one(users, {
    fields: [properties.landlordId],
    references: [users.id],
  }),
  tenants: many(tenants),
  tickets: many(tickets),
  images: many(propertyImages),
  marketing: one(marketingKits, {
    fields: [properties.id],
    references: [marketingKits.propertyId],
  }),
  applications: many(applications),
}));

// ============================================================================
// Property Images Table
// ============================================================================
export const propertyImages = sqliteTable("property_images", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  url: text("url").notNull(), // Cloudflare R2 public URL
  publicId: text("public_id"), // R2 object key for deletion
  order: integer("order").notNull().default(0), // Display order
  size: integer("size"), // File size in bytes
  propertyId: text("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const propertyImagesRelations = relations(propertyImages, ({ one }) => ({
  property: one(properties, {
    fields: [propertyImages.propertyId],
    references: [properties.id],
  }),
}));

// ============================================================================
// Marketing Kits Table
// ============================================================================
export const marketingKits = sqliteTable("marketing_kits", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  propertyId: text("property_id")
    .notNull()
    .unique()
    .references(() => properties.id),
  landingPageUrl: text("landing_page_url"),
  socialPostUrl: text("social_post_url"),
  description: text("description"),
});

export const marketingKitsRelations = relations(marketingKits, ({ one }) => ({
  property: one(properties, {
    fields: [marketingKits.propertyId],
    references: [properties.id],
  }),
}));

// ============================================================================
// Tenants Table
// ============================================================================
export const tenants = sqliteTable("tenants", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id),
  propertyId: text("property_id")
    .notNull()
    .references(() => properties.id),
  leaseStart: integer("lease_start", { mode: "timestamp" }).notNull(),
  leaseEnd: integer("lease_end", { mode: "timestamp" }).notNull(),
});

export const tenantsRelations = relations(tenants, ({ one }) => ({
  user: one(users, {
    fields: [tenants.userId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [tenants.propertyId],
    references: [properties.id],
  }),
}));

// ============================================================================
// Tickets Table
// ============================================================================
export const tickets = sqliteTable("tickets", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("OPEN"), // OPEN, IN_PROGRESS, RESOLVED
  priority: text("priority").notNull().default("MEDIUM"), // LOW, MEDIUM, HIGH, URGENT
  propertyId: text("property_id")
    .notNull()
    .references(() => properties.id),
  creatorId: text("creator_id")
    .notNull()
    .references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const ticketsRelations = relations(tickets, ({ one }) => ({
  property: one(properties, {
    fields: [tickets.propertyId],
    references: [properties.id],
  }),
  creator: one(users, {
    fields: [tickets.creatorId],
    references: [users.id],
  }),
}));

// ============================================================================
// Notifications Table
// ============================================================================
export const notifications = sqliteTable("notifications", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  type: text("type").notNull(),
  message: text("message").notNull(),
  read: integer("read", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// Applications Table (Rental Applications)
// ============================================================================
export const applications = sqliteTable("applications", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  propertyId: text("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),

  // Applicant Info
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message"),

  // Application Status
  status: text("status").notNull().default("NEW"), // NEW, VIEWED, CONTACTED, ACCEPTED, REJECTED

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const applicationsRelations = relations(applications, ({ one }) => ({
  property: one(properties, {
    fields: [applications.propertyId],
    references: [properties.id],
  }),
}));

// ============================================================================
// Type Exports
// ============================================================================
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Plan = typeof plans.$inferSelect;
export type NewPlan = typeof plans.$inferInsert;

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;

export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;

export type PropertyImage = typeof propertyImages.$inferSelect;
export type NewPropertyImage = typeof propertyImages.$inferInsert;

export type MarketingKit = typeof marketingKits.$inferSelect;
export type NewMarketingKit = typeof marketingKits.$inferInsert;

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;

export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;
