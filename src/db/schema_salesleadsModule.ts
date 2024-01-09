import { integer, pgEnum, pgTable, serial, varchar, timestamp, boolean, text, json } from 'drizzle-orm/pg-core';
import { Client, ProjectWithAllDetails, clients, projects } from './schema_clientModule';
import { users, usersToSalesleadcontributors } from './schema_usersModule';
import { forms, formrevisions, formsections, formrows, formfields, Form, FormWithAllLevels, FormRevisionWithAllLevels, SalesFormRevisionWithAllLevelsAndData } from './schema_formsModule';
import { relations } from 'drizzle-orm';
import { quotes } from './schema_quotesModule';
import { studies } from './schema_studiesModule';
import { files } from './schema_filesModule';

// Using this type is convenient when creating a new lead since there won't be any revisions yet, and no id.
// When editing a lead, we'll need to use the id of the latest revision, and the study plans will be
// associated with the latest revision too.
export type NewSalesLead = {
  name: string;
  author: typeof users.$inferSelect;
  status: typeof leads.$inferSelect['status'];
  client: Client | null;
  project: ProjectWithAllDetails | null;
  contributors: {
    user: typeof users.$inferSelect
  }[]
  studyPlans: FormWithAllLevels[];
  quote: string | null;
  studies: typeof studies.$inferSelect[];
  // firstNote: string;
};

export type SalesLeadWithAllDetails = {
  id: number,
  name: string,
  created: Date,
  status: typeof leads.$inferSelect['status'],
  project: ProjectWithAllDetails,
  contributors: {
    contributor: Omit<typeof users.$inferSelect, 'password'>
  }[]
  revisions: SalesLeadRevisionWithAllDetails[]
  notes: typeof salesleadnotes.$inferSelect[]
  author: Omit<typeof users.$inferSelect, 'password'>
  client: Client
  quote: typeof quotes.$inferSelect | null
  studies: typeof studies.$inferSelect[]
};
type SalesLeadRevisionWithAllDetails = typeof salesleadrevisions.$inferSelect & {
  studyplans: {
    formrevision: SalesFormRevisionWithAllLevelsAndData & {
      form: Form
    }
  }[]
}

export const salesleadStatusEnum = pgEnum('status', [
  'In Progress', 
  'Paused',
  'Needs Method Development',
  'Won',
  'Cancelled',
]);

export const leads = pgTable('leads', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 500 }).notNull(),
  created: timestamp('created').notNull(),
  author: integer('author').notNull().references(() => users.id),
  status: salesleadStatusEnum('status'),
  client: integer('client').notNull().references(() => clients.id),
  project: integer('project').notNull().references(() => projects.id),
  //repository: varchar('repository', { length: 500 }),
});

export const leadsRelations = relations(leads, ({one,many}) => ({
  revisions: many(salesleadrevisions),
  notes: many(salesleadnotes),
  author: one(users, {
    fields: [leads.author],
    references: [users.id],
  }),
  contributors: many(usersToSalesleadcontributors),
  quote: one(quotes, {
    fields: [leads.id],
    references: [quotes.saleslead],
  }),
  studies: many(studies),
  client: one(clients, {
    fields: [leads.client],
    references: [clients.id],
  }),
  project: one(projects, {
    fields: [leads.project],
    references: [projects.id],
  }),
}));

export const salesleadrevisions = pgTable('leadrevs', {
  id: serial('id').primaryKey(),
  saleslead: integer('saleslead').notNull().references(() => leads.id),
  created: timestamp('created').notNull(),
  author: integer('author').notNull().references(() => users.id),
});

export const salesleadrevisionsRelations = relations(salesleadrevisions, ({one,many}) => ({
  saleslead: one(leads, {
    fields: [salesleadrevisions.saleslead],
    references: [leads.id],
  }),
  formdata: many(salesleadformdata),
  studyplans: many(salesleadrevisionsToFormrevisions),
}));

export const salesleadrevisionsToFormrevisions = pgTable('leadrevs_to_formrevs', {
  id: serial('id').primaryKey(),
  salesleadrevision: integer('salesleadrevision').notNull().references(() => salesleadrevisions.id),
  formrevision: integer('formrevision').notNull().references(() => formrevisions.id),
});

export const formrevisionsToSalesleadrevisionsRelations = relations(salesleadrevisionsToFormrevisions, ({ one }) => ({
  salesleadrevision: one(salesleadrevisions, {
    fields: [salesleadrevisionsToFormrevisions.salesleadrevision],
    references: [salesleadrevisions.id],
  }),
  formrevision: one(formrevisions, {
    fields: [salesleadrevisionsToFormrevisions.formrevision],
    references: [formrevisions.id],
  }),
}));

export const salesleadformdata = pgTable('leadformdata', {
  id: serial('id').primaryKey(),
  salesleadrevision: integer('salesleadrevision').notNull().references(() => salesleadrevisions.id),
  formfield: integer('formfield').notNull().references(() => formfields.id),
  value: json('value').notNull(),
});

export const salesleadformdataRelations = relations(salesleadformdata, ({one}) => ({
  salesleadrevision: one(salesleadrevisions, {
    fields: [salesleadformdata.salesleadrevision],
    references: [salesleadrevisions.id],
  }),
  formfield: one(formfields, {
    fields: [salesleadformdata.formfield],
    references: [formfields.id],
  }),
}));

export const salesleadnotes = pgTable('leadnotes', {
  id: serial('id').primaryKey(),
  salesleadrevision: integer('salesleadrevision').notNull().references(() => salesleadrevisions.id),
  created: timestamp('created').notNull(),
  newRevision: boolean('newRevision').notNull(),
  author: integer('author').notNull().references(() => users.id),
  note: text('note').notNull(),
});

export const salesleadnotesRelations = relations(salesleadnotes, ({one}) => ({
  saleslead: one(leads, {
    fields: [salesleadnotes.salesleadrevision],
    references: [leads.id],
  }),
}));