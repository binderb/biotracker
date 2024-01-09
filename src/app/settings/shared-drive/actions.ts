'use server';

import path from "path";
const fsPromises = require('fs').promises;
import { JWTInput, OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import { db } from "@/db";
import { Config, configs } from "@/db/schema_configModule";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";


export async function authorizeGoogleDrive () {
  if (!process.env.GOOGLE_CREDENTIALS_PATH) {
    throw new Error('GOOGLE_CREDENTIALS_PATH environment variable not set');
  }
  const credentialsPath = path.join(process.cwd(),process.env.GOOGLE_CREDENTIALS_PATH);
  const content = await fsPromises.readFile(credentialsPath);
  const credentials = JSON.parse(content).web;
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

async function loadSavedTokenIfExists() {
  try {
    const configsResponse = await db.query.configs.findFirst();
    console.log('configsResponse',configsResponse);
    if (!configsResponse) {
      return null;
    }
    const token = configsResponse.token as JWTInput;
    console.log(google.auth.fromJSON(token));
    return google.auth.fromJSON(token);
  } catch (err:any) {
    throw err;
  }
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

export async function getGoogleDriveClient() {
  let client = await loadSavedTokenIfExists();
  if (client) {
    return client;
  } else {
    throw new Error(`App not authorized. Please ensure that an admin has authorized your organization's Google Account to interact with this app.`);
  }
}

export async function listFiles(driveName:string,path:string,auth:any) {
  const drive = google.drive({version: 'v3', auth: auth});
  try {
    const drives = await drive.drives.list({
      // supportsAllDrives: true,
      // includeItemsFromAllDrives: true
    });
    const targetDrive = drives?.data?.drives?.find((drive:any) => drive.name === driveName);
    if (!targetDrive) {
      throw new Error('No drive with the provided name exists on the connected account.');
    }
    const driveId = targetDrive.id as string;
    const folderId = await getFolderIdFromPath(driveId, path, auth);
    console.log('folderId',folderId);
    const query = `'${folderId}' in parents and trashed=false`;
    const results = await drive.files.list({
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      q: query,
    });
    if (!results.data.files) {
      throw new Error('No files found.');
    }
    return JSON.stringify(results.data.files.map((file:any) => file.name));
  } catch (err:any) {
    return err;
  }
}

export async function getFolderIdFromPath(driveId:string, path:string, auth:any) {
  const drive = google.drive({ version: 'v3', auth });

  // Split the path into its component parts
  const pathParts = path.split('/').filter((part:string) => part !== '');
  let parentFolderId = '';
  if (pathParts.length > 0) {
    for (let i = 0; i < pathParts.length; i++) {
      let parentId = driveId;
      if (i > 0) parentId = parentFolderId;
      const query = `'${parentId}' in parents and name='${pathParts[i]}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
      const res = await drive.files.list({
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
        q: query,
        fields: 'nextPageToken, files(id, name)',
      });
      if (res.data.files) {
          if (res.data.files.length === 0) {
          throw new Error(`Folder not found on target drive: ${path}`);
        } else if (res.data.files.length > 1) {
          throw new Error(`Multiple folders found with name '${pathParts[i]}' in target drive with ID '${parentFolderId}'`);
        }
        parentFolderId = res.data.files[0].id as string;
      }
      

      
    }
  } else {
    return driveId;
  }
  return parentFolderId;
}

export async function getDriveIdFromName (driveName:String, auth:any) {
  const drive = google.drive({version: 'v3', auth: auth});
  try {
    const drives = await drive.drives.list({
      // supportsAllDrives: true,
      // includeItemsFromAllDrives: true
    });
    if (!drives.data.drives) {
      throw new Error('No drives found.');
    }
    const targetDrive = drives.data.drives.find((drive:any) => drive.name === driveName);
    if (!targetDrive) {
      throw new Error('No drive with the provided name exists on the connected account.');
    }
    const driveId = targetDrive.id;
    return driveId;
  } catch (err:any) {
    throw err;
  }
}