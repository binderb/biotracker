import { relations } from 'drizzle-orm';
import { boolean, integer, json, pgEnum, pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core';

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

export const formfieldTypeEnum = pgEnum('type', ['label', 'textarea', 'multitextarea', 'input', 'multiinput', 'checkbox', 'multicheckbox', 'date', 'database', 'generated']);

export const formDocTypeEnum = pgEnum('docType', ['form', 'studyplan']);

export const formFunctionalAreaEnum = pgEnum('functionalArea', ['IVT', 'BSI']);

export const forms = pgTable('forms', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 500 }).notNull(),
  docType: formDocTypeEnum('docType').notNull(),
  functionalArea: formFunctionalAreaEnum('functionalArea').notNull(),
});

export const formsRelations = relations(forms, ({ many }) => ({
  revisions: many(formrevisions),
}));

export const formrevisions = pgTable('formrevisions', {
  id: serial('id').primaryKey(),
  form: integer('form')
    .notNull()
    .references(() => forms.id),
  created: timestamp('created').notNull(),
});

export const formrevisionsRelations = relations(formrevisions, ({ one, many }) => ({
  form: one(forms, {
    fields: [formrevisions.form],
    references: [forms.id],
  }),
  sections: many(formsections),
}));

export const formsections = pgTable('formsection', {
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

export const formrows = pgTable('formrow', {
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

export const formfields = pgTable('formfield', {
  id: serial('id').primaryKey(),
  formrow: integer('formrow')
    .notNull()
    .references(() => formrows.id),
  type: formfieldTypeEnum('type').notNull(),
  params: json('params'),
});

export const formfieldsRelations = relations(formfields, ({ one }) => ({
  formrow: one(formrows, {
    fields: [formfields.formrow],
    references: [formrows.id],
  }),
}));
