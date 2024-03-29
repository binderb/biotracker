import { relations } from "drizzle-orm";
import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { leads } from "./schema_salesleadsModule";
import { quotes } from "./schema_quotesModule";

export const studies = pgTable('studies', {
  id: serial('id').primaryKey(),
  link: varchar('link', { length: 500 }).notNull(),
  saleslead: integer('saleslead').notNull().references(() => leads.id),
  quote: integer('quote').notNull().references(() => quotes.id),
});

export const studiesRelations = relations(studies, ({ one }) => ({
  saleslead: one(leads, {
    fields: [studies.saleslead],
    references: [leads.id],
  }),
  quote: one(quotes, {
    fields: [studies.quote],
    references: [quotes.id],
  }),
}));