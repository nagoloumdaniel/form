import { relations } from "drizzle-orm";
import { index, integer, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const passwordResetCodes = pgTable(
  "password_reset_codes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    codeHash: text("code_hash").notNull(),
    attempts: integer("attempts").notNull().default(0),
    ticketHash: text("ticket_hash"),
    ticketExpiresAt: timestamp("ticket_expires_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("password_reset_codes_user_id_idx").on(table.userId),
    index("password_reset_codes_code_hash_idx").on(table.codeHash),
    index("password_reset_codes_ticket_hash_idx").on(table.ticketHash),
  ],
);

/** Compteur par seau et par fenêtre, verrouillé ligne par ligne à chaque incrément. */
export const rateCounters = pgTable(
  "rate_counters",
  {
    bucket: text("bucket").notNull(),
    windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
    hits: integer("hits").notNull().default(0),
  },
  (table) => [
    primaryKey({ columns: [table.bucket, table.windowStart] }),
    index("rate_counters_window_start_idx").on(table.windowStart),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  passwordResetCodes: many(passwordResetCodes),
}));

export const passwordResetCodesRelations = relations(passwordResetCodes, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetCodes.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type PasswordResetCode = typeof passwordResetCodes.$inferSelect;
