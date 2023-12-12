import { relations } from "drizzle-orm";
import { boolean, integer, pgEnum, pgTable, serial, text, varchar } from "drizzle-orm/pg-core";
import { db } from ".";

export type User = typeof users.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type ClientWithProjectsAddresses = typeof clients.$inferSelect & {
  billingAddresses: {
    address: typeof addresses.$inferSelect
  }[] | null
  projects: typeof projects.$inferSelect[] | null
};
export type Address = typeof addresses.$inferSelect;

export const clientAccountTypeEnum = pgEnum('accountType',['active','inactive']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', {length: 256}).unique().notNull(),
  password: varchar('password', {length: 256}).notNull(),
  first: varchar('first', {length: 256}).notNull(),
  last: varchar('last', {length: 256}).notNull(),
  role: varchar('role', {length: 100}).notNull(),
});

export const clients = pgTable('clients', {
  id: serial('id').primaryKey(),
  name: varchar('name', {length: 500}).notNull().unique(),
  code: varchar('code', {length: 3}).notNull().unique(),
  referredBy: integer('referred_by').references(()=>contacts.id),
  website: varchar('website', {length: 500}),
  accountType: clientAccountTypeEnum('accountType')
});

export const clientsRelations = relations(clients, ({many}) => ({
  projects: many(projects),
  billingAddresses: many(clientsToAddresses)
}));

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  name: varchar('name', {length: 500}).notNull(),
  nda: boolean('nda'),
  client: integer('client').notNull().references(()=>clients.id),
  billingAddress: integer('billingAddress').references(()=>addresses.id),
});

export const projectsRelations = relations(projects, ({one,many})=>({
  client: one(clients, {
    fields: [projects.client],
    references: [clients.id],
  }),
  projectsToContacts: many(projectsToContacts),
}));

export const contacts = pgTable('contacts', {
  id: serial('id').primaryKey(),
  first: varchar('first', {length: 256}).notNull(),
  last: varchar('last', {length: 256}).notNull(),
  referredBy: integer('referred_by'),
  email: varchar('email', {length: 256}),
  phone: varchar('phone', {length: 25}),
  links: text('links'),
  notes: text('notes'),
});

export const contactsRelations = relations(contacts, ({one,many}) => ({
  contactReferredBy: one(contacts, {
    fields: [contacts.id],
    references: [contacts.referredBy]
  }),
  clients: one(clients, {
    fields: [contacts.id],
    references: [clients.referredBy]
  }),
  projectsToContacts: many(projectsToContacts),
}));

export const projectsToContacts = pgTable('projects_to_contacts', {
  projectId: integer('project_id').notNull().references(()=>projects.id),
  contactId: integer('contact_id').notNull().references(()=>contacts.id),
  keyContact: boolean('key_contact').default(false),
});

export const projectsToContactsRelations = relations(projectsToContacts, ({one}) => ({
  project: one(projects, {
    fields: [projectsToContacts.projectId],
    references: [projects.id]
  }),
  contact: one(contacts, {
    fields: [projectsToContacts.contactId],
    references: [contacts.id]
  }),
}));

export const addresses = pgTable('addresses', {
  id: serial('id').primaryKey(),
  identifier: varchar('identifier', {length: 256}).notNull().unique(),
  entityName: varchar('entity_name', {length: 500}),
  addressLine1: varchar('address_line_1', {length: 500}),
  addressLine2: varchar('address_line_2', {length: 500}),
  city: varchar('city', {length: 256}),
  stateProvince: varchar('state_province', {length: 256}),
  country: varchar('country', {length: 256}),
  postalCode: varchar('postal_code', {length: 25}),
});

export const addressesRelations = relations(addresses, ({one,many}) => ({
  projectBillingAddress: one(projects, {
    fields: [addresses.id],
    references: [projects.billingAddress]
  }),
  clientBillingAddresses: many(clientsToAddresses),
}));

export const clientsToAddresses = pgTable('clients_to_addresses', {
  clientId: integer('client_id').notNull().references(()=>clients.id),
  addressId: integer('address_id').notNull().references(()=>addresses.id),
});

export const clientsToAddressesRelations = relations(clientsToAddresses, ({one}) => ({
  client: one(clients, {
    fields: [clientsToAddresses.clientId],
    references: [clients.id]
  }),
  address: one(addresses, {
    fields: [clientsToAddresses.addressId],
    references: [addresses.id]
  })
}));