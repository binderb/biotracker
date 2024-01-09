'use server';

import { db } from "@/db";
import { configs } from "@/db/schema_configModule";
import { OAuth2Client } from "google-auth-library";
import { google } from "googleapis";
import path from "path";
const fsPromises = require('fs').promises;

export async function saveGoogleDriveToken (authCode:string) {
  try {
    const credentialsPath = path.join(process.cwd(),process.env.GOOGLE_CREDENTIALS_PATH!);
    const content = await fsPromises.readFile(credentialsPath);
    const credentials = JSON.parse(content).web;
    const client = new OAuth2Client(
      credentials.client_id,
      credentials.client_secret,
      credentials.redirect_uris[0]
    )
    const { tokens } = await client.getToken(authCode);
    if (!tokens.refresh_token) {
      throw new Error("Refresh token not received.");
    }
    client.setCredentials(tokens);
    const token = JSON.stringify({
      type: 'authorized_user',
      client_id: credentials.client_id,
      client_secret: credentials.client_secret,
      refresh_token: client.credentials.refresh_token,
    });
    const drive = google.drive({version: 'v3', auth: client});
    const userResponse = await drive.about.get({
      fields: 'user(emailAddress)'
    });
    const accountEmail = userResponse?.data?.user?.emailAddress ?? "(no email retrieved)";
    const deleteResponse = await db.delete(configs);
    const configResponse = await db.insert(configs).values({
      accountEmail: accountEmail,
      token: token
    }).returning();
  } catch (err:any) {
    throw err;
  }
}