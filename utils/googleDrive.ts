const fs = require('fs').promises;
const Readable = require('stream').Readable;
import path from "path";
const {authenticate} = require('@google-cloud/local-auth');
const { OAuth2Client } = require('google-auth-library');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.

async function loadSavedCredentialsIfExist() {
  try {
    const credentialsPath = path.join(process.cwd(),process.env.GOOGLE_TOKEN_PATH!);
    const content = await fs.readFile(credentialsPath);
    const credentials = JSON.parse(content);
    // const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_PATH!);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

export async function saveNewGoogleDriveToken(code:string) {
  try {
    const credentialsPath = path.join(process.cwd(),process.env.GOOGLE_CREDENTIALS_PATH!);
    const content = await fs.readFile(credentialsPath);
    const credentials = JSON.parse(content).web;
    const client = new OAuth2Client(
      credentials.client_id,
      credentials.client_secret,
      credentials.redirect_uris[0]
    )
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const payload = JSON.stringify({
      type: 'authorized_user',
      client_id: credentials.client_id,
      client_secret: credentials.client_secret,
      refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(path.join(process.cwd(),process.env.GOOGLE_TOKEN_PATH!), payload);
  } catch (err:any) {
    throw err;
  }
}

export async function getGoogleDriveAuthUrl() {
  const credentialsPath = path.join(process.cwd(),process.env.GOOGLE_CREDENTIALS_PATH!);
  const content = await fs.readFile(credentialsPath);
  const credentials = JSON.parse(content).web;
  const SCOPES = [
    'https://www.googleapis.com/auth/drive.metadata.readonly',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/documents'
  ];
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return 'already_authorized';
  }
  
  client = new OAuth2Client(
    credentials.client_id,
    credentials.client_secret,
    credentials.redirect_uris[0]
  )
  const authUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });

  return authUrl;
}

export async function userAuthorizeGoogleDrive() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  } else {
    throw new Error(`App not authorized. Please ensure that an admin has authorized your organization's Google Account to interact with this app.`);
  }
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {OAuth2Client} authClient An authorized OAuth2 client.
 */
export async function listFiles(authClient:any) {
  const drive = google.drive({version: 'v3', auth: authClient});
  const folderId = await getFolderIdFromPath('/Studies',authClient);
  const res = await drive.files.list({
    pageSize: 10,
    q: `'${folderId}' in parents and trashed=false`,
    fields: 'nextPageToken, files(id, name)',
  });
  const files = res.data.files;
  if (files.length === 0) {
    return 'No files found.';
  } else {
    return `Files in Studies Folder:\n${res.data.files.map((file:any) => `${file.name} \n`)}`;
  }
}

export async function createDirectoryIfNotExists(directoryName:string, parentFolderId:string, auth:any) {
  const drive = google.drive({ version: 'v3', auth });

  // Check if the directory already exists
  const query = `mimeType='application/vnd.google-apps.folder' and trashed=false and name='${directoryName}' and '${parentFolderId}' in parents`;
  const res = await drive.files.list({
    q: query,
    fields: 'files(id)',
    spaces: 'drive',
  });
  if (res.data.files.length > 0) {
    // The directory already exists, return its ID
    return res.data.files[0].id;
  } else {
    // The directory doesn't exist, create it and return its ID
    const directoryMetadata = {
      name: directoryName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId],
    };
    const res = await drive.files.create({
      resource: directoryMetadata,
      fields: 'id',
    });
    return res.data.id;
  }
}

export async function createDirectoryWithSubdirectories(directoryName:string, parentFolderId:string, subdirectoryNames:Array<string>, auth:any) {
  const drive = google.drive({ version: 'v3', auth });

  // Create the main study directory
  const directoryMetadata = {
    name: directoryName,
    mimeType: 'application/vnd.google-apps.folder',
    parents: [parentFolderId],
  };
  const res = await drive.files.create({
    resource: directoryMetadata,
    fields: 'id',
  });
  const directoryId = res.data.id;

  // Create the subdirectories
  for (const subdirectoryName of subdirectoryNames) {
    const subdirectoryMetadata = {
      name: subdirectoryName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [directoryId],
    };
    await drive.files.create({
      resource: subdirectoryMetadata,
    });
  }

  return directoryId;
}

export async function getFolderIdFromPath(path:string, auth:any) {
  const drive = google.drive({ version: 'v3', auth });

  // Split the path into its component parts
  const pathParts = path.split('/').filter((part) => part !== '');

  let parentFolderId = null;
  for (let i = 0; i < pathParts.length; i++) {
    const res:any = await drive.files.list({
      q: `name='${pathParts[i]}' and mimeType='application/vnd.google-apps.folder' and trashed = false${parentFolderId ? ` and '${parentFolderId}' in parents` : ''}`,
      fields: 'nextPageToken, files(id, name)',
    });

    if (res.data.files.length === 0) {
      throw new Error(`Folder not found: ${path}`);
    } else if (res.data.files.length > 1) {
      throw new Error(`Multiple folders found with name '${pathParts[i]}' in parent folder with ID '${parentFolderId}'`);
    }

    parentFolderId = res.data.files[0].id;
  }

  return parentFolderId;
}

export async function convertToPdf(parentFolderId:any, filename:any, fileId:any, auth:any) {

  const drive = google.drive({ version: 'v3', auth });

  try {
    // Export the Google Doc as a PDF file.
    const exportResult = await drive.files.export(
      { fileId: fileId, mimeType: 'application/pdf' },
      { responseType: 'stream' }
    );

    // Upload the PDF back to the same folder.
    const metadata = { name: filename, parents: [parentFolderId] };
    const media = { mimeType: 'application/pdf', body: exportResult.data };
    const pdfFile = await drive.files.create({
      resource: metadata,
      media: media,
    });

    // Remove the original Google Doc file.
    const cleanupResult = await drive.files.delete({ fileId });

  } catch (err) {
    // TODO(developer) - Handle error
    throw err;
  }
}