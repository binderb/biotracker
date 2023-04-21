import Client from "../models/Client";
import connectMongo from "./connectMongo";

const resolvers = {
  Query: {
    hello: () => "hello world!",
    getClients: async () => {
      // const Client = (await import('../models/Client')).default;
      await connectMongo();
      return Client.find();
    }
  },

  Mutation: {
    addClient: async (_:any, args:any) => {
      // const Client = (await import('../models/Client')).default;
      await connectMongo();
      const client = await Client.create(args);
      return client;
    }
  }
}

export default resolvers;