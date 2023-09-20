import mongoose from "mongoose";

const { MONGO_URI } = process.env;

if (!MONGO_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local!'
  );
}

// Define global cached connection.
declare global {
  var mongoose: {conn: mongoose.Mongoose | null}
}
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null }
}

export default async function connectMongo () {
  // Return the cached connection if it exists.
  if (cached.conn) return cached.conn;

  cached.conn = await mongoose.connect(MONGO_URI!,{
    authSource: 'admin'
  });
  return cached.conn;
}