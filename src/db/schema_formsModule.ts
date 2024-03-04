import { relations } from 'drizzle-orm';
import { boolean, integer, json, pgEnum, pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core';
import { SalesLeadFormData, salesleadformdata, salesleadrevisions, salesleadrevisionsToFormrevisions } from './schema_salesleadsModule';

export type Form = typeof forms.$inferSelect;
export type FormWithAllLevels = typeof forms.$inferSelect & {
  revisions: FormRevisionWithAllLevels[]
};
export type FormRevisionWithAllLevels = typeof formrevisions.$inferSelect & {
  sections: FormSectionWithAllLevels[];
};
export type FormSectionWithAllLevels = typeof formsections.$inferSelect & {
  rows: FormRowWithAllLevels[];
};
export type FormRowWithAllLevels = typeof formrows.$inferSelect & {
  fields: (typeof formfields.$inferSelect)[];
};
export type FormField = typeof formfields.$inferSelect;

export type SalesFormRevisionWithAllLevelsAndData = typeof formrevisions.$inferSelect & {
  sections: SalesFormSectionWithAllLevelsAndData[];
  form: Form;
};
export type SalesFormSectionWithAllLevelsAndData = typeof formsections.$inferSelect & {
  rows: SalesFormRowWithAllLevelsAndData[];
};
export type SalesFormRowWithAllLevelsAndData = typeof formrows.$inferSelect & {
  fields: SalesFormFieldAndData[];
};
export type SalesFormFieldAndData = typeof formfields.$inferSelect & {
  salesleadformdata: SalesLeadFormData[];
};

export const formfieldTypeEnum = pgEnum('type', ['label', 'textarea', 'multitextarea', 'input', 'multiinput', 'checkbox', 'multicheckbox', 'date', 'database', 'generated']);

export const formDocTypeEnum = pgEnum('docType', ['form', 'studyplan']);

export const formFunctionalAreaEnum = pgEnum('functionalArea', ['IVT', 'BSI']);

export const forms = pgTable('forms', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 500 }).notNull(),
  docType: formDocTypeEnum('docType').notNull(),
  functionalArea: formFunctionalAreaEnum('functionalArea').notNull(),
  index: integer('index').notNull(),
});

export const formsRelations = relations(forms, ({ many }) => ({
  revisions: many(formrevisions),
}));

export const formrevisions = pgTable('formrevs', {
  id: serial('id').primaryKey(),
  form: integer('form')
    .notNull()
    .references(() => forms.id),
  created: timestamp('created').notNull(),
  note: varchar('note', { length: 500 }).notNull(),
});

export const formrevisionsRelations = relations(formrevisions, ({ one, many }) => ({
  form: one(forms, {
    fields: [formrevisions.form],
    references: [forms.id],
  }),
  sections: many(formsections),
  salesleadrevisions: many(salesleadrevisionsToFormrevisions),
}));

export const formsections = pgTable('formsections', {
  id: serial('id').primaryKey(),
  formrevision: integer('formrevision')
    .notNull()
    .references(() => formrevisions.id),
  name: varchar('name', { length: 500 }).notNull(),
  extensible: boolean('extensible').notNull(),
});

export const formsectionsRelations = relations(formsections, ({ one, many }) => ({
  rows: many(formrows),
  formrevision: one(formrevisions, {
    fields: [formsections.formrevision],
    references: [formrevisions.id],
  }),
}));

export const formrows = pgTable('formrows', {
  id: serial('id').primaryKey(),
  formsection: integer('formsection').notNull().references(() => formsections.id),
  extensible: boolean('extensible').notNull(),
});

export const formrowsRelations = relations(formrows, ({ one, many }) => ({
  fields: many(formfields),
  formsection: one(formsections, {
    fields: [formrows.formsection],
    references: [formsections.id],
  }),
}));

export const formfields = pgTable('formfields', {
  id: serial('id').primaryKey(),
  formrow: integer('formrow')
    .notNull()
    .references(() => formrows.id),
  type: formfieldTypeEnum('type').notNull(),
  params: json('params'),
});

export const formfieldsRelations = relations(formfields, ({ one, many }) => ({
  formrow: one(formrows, {
    fields: [formfields.formrow],
    references: [formrows.id],
  }),
  salesleadformdata: many(salesleadformdata),
}));
