const fs = require('fs').promises;
import path from "path";
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
    if (!tokens.refresh_token) {
      throw new Error("Refresh token not received.");
    }
    client.setCredentials(tokens);
    const payload = JSON.stringify({
      type: 'authorized_user',
      client_id: credentials.client_id,
      client_secret: credentials.client_secret,
      refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(path.join(process.cwd(),process.env.GOOGLE_TOKEN_PATH!), payload);
    // Update config database entry.
    const drive = google.drive({version: 'v3', auth: client});
    const userResponse = await drive.about.get({
      fields: 'user(emailAddress)'
    });
    const accountEmail = userResponse.data.user.emailAddress;
    return accountEmail;

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
    'https://www.googleapis.com/auth/documents',
    'https://www.googleapis.com/auth/drive.readonly'
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
    prompt: 'consent',
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
export async function listFiles(driveName:string,path:string,auth:any) {
  const drive = google.drive({version: 'v3', auth: auth});
  try {
    const drives = await drive.drives.list({
      supportsAllDrives: true,
      includeItemsFromAllDrives: true
    });
    const targetDrive = drives.data.drives.find((drive:any) => drive.name === driveName);
    if (!targetDrive) {
      throw new Error('No drive with the provided name exists on the connected account.');
    }
    const driveId = targetDrive.id;
    const folderId = await getFolderIdFromPath(driveId, path, auth);
    console.log(folderId);
    const query = `'${folderId}' in parents and trashed=false`;
    const results = await drive.files.list({
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      q: query,
    });
    return JSON.stringify(results.data.files.map((file:any) => file.name));
  } catch (err:any) {
    return err;
  }
  // const folderId = await getFolderIdFromPath(path, auth);
  // const res = await drive.files.list({
  //   pageSize: 10,
  //   supportsAllDrives: true,
  //   includeItemsFromAllDrives: true,
  //   q: `'${folderId}' in parents and trashed=false`,
  //   fields: 'nextPageToken, files(id, name)',
  // });
  // const files = res.data.files;
  // console.log(files);
  // if (files.length === 0) {
  //   return 'No files found.';
  // } else {
  //   return `Files in "${path}":\n${res.data.files.map((file:any) => `${file.name} \n`)}`;
  // }
}

export async function createDirectoryIfNotExists(directoryName:string, parentFolderId:string, auth:any) {
  const drive = google.drive({ version: 'v3', auth });
  
  // Check if the directory already exists
  const query = `mimeType='application/vnd.google-apps.folder' and trashed=false and name='${directoryName}' and '${parentFolderId}' in parents`;
  const res = await drive.files.list({
    q: query,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
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
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
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
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
    fields: 'id',
  });
  const directoryId = res.data.id;
  const directoryIds = [directoryId];
  console.log('specific study directory id: ',directoryId);

  // Create the subdirectories

  for (let i=0; i<subdirectoryNames.length; i++) {
    const subdirectoryMetadata = {
      name: subdirectoryNames[i],
      mimeType: 'application/vnd.google-apps.folder',
      parents: [directoryId],
    };
    const newId = await drive.files.create({
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      resource: subdirectoryMetadata,
    });
    directoryIds.push(newId.data.id);
  }

  return directoryIds;
}

export async function getFolderIdFromPath(driveId:string, path:string, auth:any) {
  const drive = google.drive({ version: 'v3', auth });

  // Split the path into its component parts
  const pathParts = path.split('/').filter((part:any) => part !== '');
  console.log(pathParts);
  let parentFolderId = null;
  if (pathParts.length > 0) {
    for (let i = 0; i < pathParts.length; i++) {
      let parentId = driveId;
      if (i > 0) parentId = parentFolderId;
      const query = `'${parentId}' in parents and name='${pathParts[i]}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
      console.log(query);
      const res = await drive.files.list({
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
        q: query,
        fields: 'nextPageToken, files(id, name)',
      });
      console.log(res.data);

      if (res.data.files.length === 0) {
        throw new Error(`Folder not found on target drive: ${path}`);
      } else if (res.data.files.length > 1) {
        throw new Error(`Multiple folders found with name '${pathParts[i]}' in target drive with ID '${parentFolderId}'`);
      }

      parentFolderId = res.data.files[0].id;
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
      supportsAllDrives: true,
      includeItemsFromAllDrives: true
    });
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

export async function convertToPdf(parentFolderId:any, filename:any, fileId:any, auth:any) {

  const drive = google.drive({ version: 'v3', auth });

  try {
    // Export the Google Doc as a PDF file.
    const exportResult = await drive.files.export(
      { 
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
        fileId: fileId, 
        mimeType: 'application/pdf' 
      },
      { responseType: 'stream' }
    );

    // Upload the PDF back to the same folder.
    const metadata = { name: filename, parents: [parentFolderId] };
    const media = { mimeType: 'application/pdf', body: exportResult.data };
    const pdfFile = await drive.files.create({
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      resource: metadata,
      media: media,
    });

    // Remove the original Google Doc file.
    const cleanupResult = await drive.files.delete({ 
      fileId: fileId,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true 
    });

  } catch (err) {
    throw err;
  }
}

export async function deleteFileAtPath(parentId:any, filename:any, mimeType:string, auth:any) {

  const drive = google.drive({ version: 'v3', auth});

  try {
    const query = `'${parentId}' in parents and name='${filename}' and mimeType='${mimeType}' and trashed=false`;
    const res = await drive.files.list({
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      q: query,
      fields: 'nextPageToken, files(id, name)',
    });
    // if (res.data.files.length === 0) {
    //   throw new Error(`File not found in directory ${parentId}: ${filename}`);
    // }
    for (let file of res?.data?.files) {
      await drive.files.delete({
        fileId: file.id,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true
      });
    }
  } catch (err) {
    throw err;
  }

}