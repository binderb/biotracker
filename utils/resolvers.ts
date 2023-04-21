import { EmptyObject } from "lodash";
import Client from "../models/Client";
import connectMongo from "./connectMongo";

const resolvers = {
  Query: {
    hello: () => "hello world!",
    getClients: async () => {
      await connectMongo();
      return Client.find();
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
    }
  }
}

export default resolvers;