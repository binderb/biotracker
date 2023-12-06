import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";


export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', {length: 256}).unique().notNull(),
  password: varchar('password', {length: 256}).notNull(),
  first: varchar('first', {length: 256}).notNull(),
  last: varchar('last', {length: 256}).notNull(),
  role: varchar('role', { length: 100 }).notNull(),
});