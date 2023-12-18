import { integer, pgEnum, pgTable, serial, varchar, timestamp, boolean, text, json } from 'drizzle-orm/pg-core';
import { clients, projects } from './schema_clientModule';
import { users, usersToSalesleadcontributors } from './schema_usersModule';
import { forms, formrevisions, formsections, formrows, formfields } from './schema_formsModule';
import { relations } from 'drizzle-orm';
import { quotes } from './schema_quotesModule';
import { studies } from './schema_studiesModule';
import { files } from './schema_filesModule';

export const salesleadStatusEnum = pgEnum('status', [
  'inprogress', 
  'paused',
  'won',
  'cancelled',
]);

export const salesleads = pgTable('salesleads', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 500 }).notNull(),
  author: integer('author').notNull().references(() => users.id),
  status: salesleadStatusEnum('status'),
  client: integer('client').notNull().references(() => clients.id),
  project: integer('project').notNull().references(() => projects.id),
});

export const salesleadsRelations = relations(salesleads, ({one,many}) => ({
  revisions: many(salesleadrevisions),
  notes: many(salesleadnotes),
  author: one(users, {
    fields: [salesleads.author],
    references: [users.id],
  }),
  contributors: many(usersToSalesleadcontributors),
  quote: one(quotes, {
    fields: [salesleads.id],
    references: [quotes.saleslead],
  }),
  studies: many(studies),
  files: many(files),
}));

export const salesleadrevisions = pgTable('salesleadrevisions', {
  id: serial('id').primaryKey(),
  saleslead: integer('saleslead').notNull().references(() => salesleads.id),
  created: timestamp('created').notNull(),
  author: integer('author').notNull().references(() => users.id),
});

export const salesleadrevisionsRelations = relations(salesleadrevisions, ({one,many}) => ({
  saleslead: one(salesleads, {
    fields: [salesleadrevisions.saleslead],
    references: [salesleads.id],
  }),
  formdata: many(salesleadformdata),
}));

export const salesleadformdata = pgTable('salesleadformdata', {
  id: serial('id').primaryKey(),
  salesleadrevision: integer('salesleadrevision').notNull().references(() => salesleadrevisions.id),
  formfield: integer('formfield').notNull().references(() => formfields.id),
  value: json('value').notNull(),
});

export const salesleadnotes = pgTable('salesleadnotes', {
  id: serial('id').primaryKey(),
  salesleadrevision: integer('salesleadrevision').notNull().references(() => salesleadrevisions.id),
  created: timestamp('created').notNull(),
  newRevision: boolean('newRevision').notNull(),
  author: integer('author').notNull().references(() => users.id),
  note: text('note').notNull(),
});