import User from "../models/User";
require('dotenv').config({path:'.env.local'});
import connectMongo from "../utils/connectMongo";

// Default admin user, should be deleted after initial installation!
const rootUser = {
  username: 'root',
  password: 'rootroot',
  role: 'admin'
}

async function seedDatabase () {
  console.log("Establishing connection...");
  await connectMongo();
  console.log("Connected to database...");
  try {
    await User.create(rootUser);
    console.log("Inserted initial root user!");
  } catch (err:any) {
    console.log(err.message);
  }
  process.exit();
}

seedDatabase();

export {};