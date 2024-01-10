'use server';

import path from "path";
const fsPromises = require('fs').promises;
import { JWTInput, OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import { db } from "@/db";
import { Config, configs } from "@/db/schema_configModule";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { loadSavedTokenIfExists, getGoogleDriveClient, getDriveIdFromName, listFiles } from "@/lib/GoogleDriveFunctions";


export async function authorizeGoogleDrive () {
  if (!process.env.GOOGLE_CREDENTIALS) {
    throw new Error('GOOGLE_CREDENTIALS environment variable not set');
  }
  const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS).web;
  const SCOPES = [
    'https://www.googleapis.com/auth/drive.metadata.readonly',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/documents',
    'https://www.googleapis.com/auth/drive.readonly'
  ];
  let existingClient = await loadSavedTokenIfExists();
  if (existingClient) {
    throw new Error('App is already authorized.');
  }
  
  const client = new OAuth2Client(
    credentials.client_id,
    credentials.client_secret,
    credentials.redirect_uris[0]
  )
  const authUrl = client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES
  });

  return authUrl;
}

export async function testGoogleDriveConnection (drive:string,path:string) {
  const client = await getGoogleDriveClient();
  const filesList = await listFiles(drive,path,client);
  return filesList;
}

export async function saveGoogleDriveConfig (config:Config) {
  const configResponse = await db.query.configs.findFirst();
  if (!configResponse) {
    throw new Error('No configuration object found in database. Please ensure you have connected a Google Drive account before saving drive configs.');
  }
  const client = await getGoogleDriveClient();
  const studiesDriveId = await getDriveIdFromName(config.studiesDriveName as string, client);
  const salesleadDriveId = await getDriveIdFromName(config.salesleadDriveName as string, client);
  const updateResponse = await db.update(configs).set({
    studiesDriveName: config.studiesDriveName,
    studiesDriveId: studiesDriveId,
    studiesPath: config.studiesPath,
    salesleadDriveName: config.salesleadDriveName,
    salesleadDriveId: salesleadDriveId,
    salesleadPath: config.salesleadPath,
  }).where(eq(configs.id, configResponse.id)).returning();
}

export async function clearGoogleDriveConfig () {
  const deleteResponse = await db.delete(configs);
  revalidatePath('/app/settings/shared-drive');
}

