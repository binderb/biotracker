import { integer, pgEnum, pgTable, serial, varchar, timestamp, boolean, text, json } from 'drizzle-orm/pg-core';
import { clients, projects } from './schema_clientModule';
import { users, usersToSalesleadcontributors } from './schema_usersModule';
import { forms, formrevisions, formsections, formrows, formfields } from './schema_formsModule';
import { relations } from 'drizzle-orm';

export const salesleadStatusEnum = pgEnum('status', [
  'inprogress', 
  'paused',
  'won',
  'cancelled',
]);

export const saleslead = pgTable('saleslead', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 500 }).notNull(),
  author: integer('author').notNull().references(() => users.id),
  status: salesleadStatusEnum('status'),
  client: integer('client').notNull().references(() => clients.id),
  project: integer('project').notNull().references(() => projects.id),
  //files
  //studies
  //quote
});

export const salesleadRelations = relations(saleslead, ({one,many}) => ({
  revisions: many(salesleadrevision),
  notes: many(salesleadnote),
  author: one(users, {
    fields: [saleslead.author],
    references: [users.id],
  }),
  contributors: many(usersToSalesleadcontributors),
}));

export const salesleadrevision = pgTable('salesleadrevision', {
  id: serial('id').primaryKey(),
  saleslead: integer('saleslead').notNull().references(() => saleslead.id),
  created: timestamp('created').notNull(),
  author: integer('author').notNull().references(() => users.id),
  //files
  //studies
});

export const salesleadrevisionRelations = relations(salesleadrevision, ({one,many}) => ({
  saleslead: one(saleslead, {
    fields: [salesleadrevision.saleslead],
    references: [saleslead.id],
  }),
  formdata: many(salesleadformdata),
}));

export const salesleadformdata = pgTable('salesleadformdata', {
  id: serial('id').primaryKey(),
  salesleadrevision: integer('salesleadrevision').notNull().references(() => salesleadrevision.id),
  // form (necessary?)
  form: integer('form').notNull().references(() => forms.id),
  // form revision (necessary?)
  formrevision: integer('formrevision').notNull().references(() => formrevisions.id),
  // form section (necessary?)
  formsection: integer('formsection').notNull().references(() => formsections.id),
  // form row (necessary?)
  formrow: integer('formrow').notNull().references(() => formrows.id),
  // form field
  formfield: integer('formfield').notNull().references(() => formfields.id),
  // value 
  value: json('value').notNull(),
});

export const salesleadnote = pgTable('salesleadnote', {
  id: serial('id').primaryKey(),
  salesleadrevision: integer('salesleadrevision').notNull().references(() => salesleadrevision.id),
  created: timestamp('created').notNull(),
  newRevision: boolean('newRevision').notNull(),
  author: integer('author').notNull().references(() => users.id),
  note: text('note').notNull(),
});