import InventorySpec from "../models/InventorySpec";
import connectMongo from "./connectMongo";


const resolversInventory = {
  Query: {
    getInventory: async (_:any, args:any) => {
      await connectMongo();
      try {
        await InventorySpec.find();
      } catch ( err:any ) {
        throw new Error(err.message);
      }
    }
  },
  Mutation: {

  }
}

export default resolversInventory;