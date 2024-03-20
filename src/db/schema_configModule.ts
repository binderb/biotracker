import { json, pgTable, serial, varchar } from "drizzle-orm/pg-core";

export type Config = typeof configs.$inferSelect;

export const configs = pgTable('configs', {
  id: serial('id').primaryKey(),
  type: varchar('type',{length: 500}).notNull(),
  accountEmail: varchar('account_email',{length: 500}).notNull(),
  token: json('token').notNull(),
  studiesDriveName: varchar('studies_drive_name',{length: 500}),
  studiesDriveId: varchar('studies_drive_id',{length: 500}),
  studiesPath: varchar('studies_path',{length: 500}),
  salesleadDriveName: varchar('saleslead_drive_name',{length: 500}),
  salesleadDriveId: varchar('saleslead_drive_id',{length: 500}),
  salesleadPath: varchar('saleslead_path',{length: 500}),
});