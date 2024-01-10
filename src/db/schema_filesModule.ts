import { relations } from "drizzle-orm";
import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { salesleads } from "./schema_salesleadsModule";
import { clients, projects } from "./schema_clientModule";
import { studies } from "./schema_studiesModule";

export const files = pgTable('files', {
  id: serial('id').primaryKey(),
  url: varchar('url', { length: 500 }).notNull(),
});