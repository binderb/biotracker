'use server';

import { db } from "@/db";
import { JWTInput } from "google-auth-library";
import { google } from "googleapis";

export async function loadSavedTokenIfExists() {
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

export async function createDirectoryIfNotExists(directoryName:string, parentFolderId:string, auth:any) {
  const drive = google.drive({ version: 'v3', auth });
  console.log('parentFolderId',parentFolderId);
  
  // Check if the directory already exists
  const query = `mimeType='application/vnd.google-apps.folder' and trashed=false and name='${directoryName}' and '${parentFolderId}' in parents`;
  const res = await drive.files.list({
    q: query,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    fields: 'files(id)',
    spaces: 'drive',
  });
  if (!res.data.files) {
    throw new Error('No files found.');
  }
  console.log('res.data.files',res.data.files);
  if (res.data.files.length > 0) {
    // The directory already exists, return its ID
    return res.data.files[0].id;
  } else {
    console.log('directory does not already exist');
    // The directory doesn't exist, create it and return its ID
    const directoryMetadata = {
      name: directoryName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId],
    };
    const res = await drive.files.create({
      requestBody: directoryMetadata,
      supportsAllDrives: true,
      fields: 'id',
    });
    return res.data.id;
  }
}