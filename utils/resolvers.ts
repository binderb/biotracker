import { EmptyObject } from "lodash";
import Client from "../models/Client";
import Study from "../models/Study";
import connectMongo from "./connectMongo";
const fs = require('fs');

const resolvers = {
  Query: {
    hello: () => "hello world!",
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
      console.log(client);
      if (client.studies) {
        const studies = client.studies.map((e:any) => e.index);
        if (studies.length === 0) {
          return 1;
        } else {
          return studies.length + 1;
        }
      } else {
        return 1;
      }
    }
  },

  Mutation: {
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
      const mainDir = './Studies/'+clientCode+'/'+clientCode+'00'+studyIndex+'-'+studyType;
      if (!fs.existsSync(mainDir)){
          fs.mkdirSync(mainDir, { recursive: true });
      }
      const dataDir = mainDir + '/Data';
      if (!fs.existsSync(dataDir)){
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const formsDir = mainDir + '/Forms';
      if (!fs.existsSync(formsDir)){
        fs.mkdirSync(formsDir, { recursive: true });
      }
      const protocolDir = mainDir + '/Protocol';
      if (!fs.existsSync(protocolDir)){
        fs.mkdirSync(protocolDir, { recursive: true });
      }
      const quoteDir = mainDir + '/Quote';
      if (!fs.existsSync(quoteDir)){
        fs.mkdirSync(quoteDir, { recursive: true });
      }
      return newStudy;
    }
  }
}

export default resolvers;