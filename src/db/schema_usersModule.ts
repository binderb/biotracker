import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { saleslead, salesleadrevision, salesleadnote } from "./schema_salesleadModule";

export type User = typeof users.$inferSelect;

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', {length: 256}).unique().notNull(),
  password: varchar('password', {length: 256}).notNull(),
  first: varchar('first', {length: 256}).notNull(),
  last: varchar('last', {length: 256}).notNull(),
  role: varchar('role', {length: 100}).notNull(),
});

export const usersRelations = relations(users, ({many}) => ({
  authorOfSalesleads: many(saleslead),
  authorOfSalesleadrevisions: many(salesleadrevision),
  authorOfSalesleadnotes: many(salesleadnote),
  contributorToSalesleads: many(usersToSalesleadcontributors),
}));

export const usersToSalesleadcontributors = pgTable('users_to_salesleadcontributors', {
  contributor: integer('contributor').notNull().references(() => users.id),
  saleslead: integer('saleslead').notNull().references(() => saleslead.id),
});

export const usersToSalesleadcontributorsRelations = relations(usersToSalesleadcontributors, ({one}) => ({
  contributor: one(users, {
    fields: [usersToSalesleadcontributors.contributor],
    references: [users.id],
  }),
  saleslead: one(saleslead, {
    fields: [usersToSalesleadcontributors.saleslead],
    references: [saleslead.id],
  }),
}));
