import { relations } from "drizzle-orm";
import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { leads } from "./schema_salesleadsModule";
import { clients, projects } from "./schema_clientModule";
import { studies } from "./schema_studiesModule";

export type Quote = typeof quotes.$inferSelect;

export const quotes = pgTable('quotes', {
  id: serial('id').primaryKey(),
  link: varchar('link', { length: 500 }).notNull(),
  saleslead: integer('saleslead').notNull().references(() => leads.id),
  client: integer('client').notNull().references(() => clients.id),
  project: integer('project').notNull().references(() => projects.id),
  index: integer('index').notNull(),
});

export const quotesRelations = relations(quotes, ({ one, many }) => ({
  saleslead: one(leads, {
    fields: [quotes.saleslead],
    references: [leads.id],
  }),
  client: one(clients, {
    fields: [quotes.client],
    references: [clients.id],
  }),
  project: one(projects, {
    fields: [quotes.project],
    references: [projects.id],
  }),
  studies: many(studies),
}));