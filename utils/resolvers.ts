import Client from "../models/Client";
import Lead from "../models/Lead";
import LeadRevision from "../models/LeadRevision";
import LeadNote from "../models/LeadNote";
import LeadChange from "../models/LeadChange";
import Study from "../models/Study";
import connectMongo from "./connectMongo";
import User from "../models/User";
import { adminAuthorizeGoogleDrive, createDirectoryIfNotExists, createDirectoryWithSubdirectories, getFolderIdFromPath, listFiles, userAuthorizeGoogleDrive } from "./googleDrive";
const fs = require('fs');

const resolvers = {
  Query: {
    getUsers: async () => {
      await connectMongo();
      return User.find();
    },
    getClients: async () => {
      await connectMongo();
      return Client.find();
    },
    getClientCodes: async () => {
      await connectMongo();
      return Client.find();
    },
    getNextStudy: async (_:any, args:any) => {
      const { clientCode } = args;
      console.log(clientCode);
      await connectMongo();
      const client = await Client.findOne({code: clientCode});
      if (!client) {
        throw new Error(`Client code doesn't exist!`);
      }
      if (client.studies) {
        const studies = client.studies.map((e:any) => e.index);
        if (studies.length === 0) {
          console.log(1);
          return 1;
        } else {
          console.log(studies.length+1);
          return studies.length + 1;
        }
      } else {
        console.log(1);
        return 1;
      }
    }
  },

  Mutation: {
    addUser: async (_:any, args:any) => {
      const { username, password, first, last, role } = args;
      try {
        await connectMongo();
        await User.create({
          username: username,
          password: password,
          first: first,
          last: last,
          role: role
        });
      } catch (err:any) {
        throw new Error (err.message);
      }
    },
    addClient: async (_:any, args:any) => {
      const { name } = args;
      await connectMongo();
      const clients = await Client.find();
      const clientNames = clients.map(e => e.name);
      const clientCodes = clients.map(e => e.code);
      if (clientNames.includes(name)) {
        throw new Error("Client already exists! Please choose a different name.");
      }
      // generate a new client code
      const codeSymbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let newCode = null;
      while (!newCode) {
        const potentialCode:Array<string> = [];
        for (let i=0;i<3;i++) {
          const randomIndex = Math.floor(Math.random()*codeSymbols.length);
          potentialCode.push(codeSymbols[randomIndex]);
        }
        if (!clientCodes.includes(potentialCode.join(''))) newCode = potentialCode.join('');
      }
      const newClient = await Client.create({
        name: name,
        code: newCode
      });
      return newClient;
    },
    addLead: async (_:any, args:any) => {
      const { name, author, drafters, client, content, firstNote } = args;
      try {
        // Create Lead Revision
        const newRevision = await LeadRevision.create({
          author,
          content
        });
        // Create Lead Note
        const newNote = await LeadNote.create({
          author,
          content: firstNote,
          revision: newRevision._id,
        });
        // // Create Lead
        const newLead = await Lead.create({
          name,
          author,
          drafters,
          client,
          revisions: [newRevision._id],
          notes: [newNote._id]
        });
      } catch (err:any) {
        throw new Error(err.message);
      }
      return `success`;

    },
    addStudy: async (_:any, args:any) => {
      const { clientCode, studyIndex, studyType } = args;
      await connectMongo();
      const client = await Client.findOne({code: clientCode});
      if (!client) {
        throw new Error("Client code not found!");
      }
      const newStudy = await Study.create({
        type: studyType,
        index: studyIndex
      });
      await Client.findOneAndUpdate({code: clientCode},{$addToSet: {studies: newStudy._id}});
      return client;
    },
    authorizeGoogleDrive: async () => {
      await adminAuthorizeGoogleDrive();
      return 'success';
    },
    testGoogleDrive: async () => {
      const client = await userAuthorizeGoogleDrive();
      const files = await listFiles(client);
      return files;
    },
    createDriveStudyTree: async (_:any, args:any) => {
      const { clientCode, studyName } = args;
      const client = await userAuthorizeGoogleDrive();
      const studyFolderId = await getFolderIdFromPath(`/Studies`, client);
      console.log('client code: ',clientCode);
      console.log('study name: ',studyName);
      const clientFolderId = await createDirectoryIfNotExists(clientCode, studyFolderId, client);
      const result = await createDirectoryWithSubdirectories(studyName, clientFolderId, ['Data','Forms','Protocol','Quote'], client);
      return 'Study folder tree created in Google Drive!';
    }
  }
}

export default resolvers;