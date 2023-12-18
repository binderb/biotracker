import { relations } from "drizzle-orm";
import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { salesleads } from "./schema_salesleadsModule";
import { clients, projects } from "./schema_clientModule";
import { studies } from "./schema_studiesModule";

export const quotes = pgTable('quotes', {
  id: serial('id').primaryKey(),
  link: varchar('link', { length: 500 }).notNull(),
  saleslead: integer('saleslead').notNull().references(() => salesleads.id),
  client: integer('client').notNull().references(() => clients.id),
  project: integer('project').notNull().references(() => projects.id),
  index: integer('index').notNull(),
});

export const quotesRelations = relations(quotes, ({ one, many }) => ({
  saleslead: one(salesleads, {
    fields: [quotes.saleslead],
    references: [salesleads.id],
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