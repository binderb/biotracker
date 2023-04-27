import { EmptyObject } from "lodash";
import Client from "../models/Client";
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
      const { username, password } = args;
      try {
        await connectMongo();
        await User.create({
          username: username,
          password: password
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
      // const mainDir = './Studies/'+clientCode+'/'+clientCode+'00'+studyIndex+'-'+studyType;
      // if (!fs.existsSync(mainDir)){
      //     fs.mkdirSync(mainDir, { recursive: true });
      // }
      // const dataDir = mainDir + '/Data';
      // if (!fs.existsSync(dataDir)){
      //   fs.mkdirSync(dataDir, { recursive: true });
      // }
      // const formsDir = mainDir + '/Forms';
      // if (!fs.existsSync(formsDir)){
      //   fs.mkdirSync(formsDir, { recursive: true });
      // }
      // const protocolDir = mainDir + '/Protocol';
      // if (!fs.existsSync(protocolDir)){
      //   fs.mkdirSync(protocolDir, { recursive: true });
      // }
      // const quoteDir = mainDir + '/Quote';
      // if (!fs.existsSync(quoteDir)){
      //   fs.mkdirSync(quoteDir, { recursive: true });
      // }
      // console.log('completed adding new study!');
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