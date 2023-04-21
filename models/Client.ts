import { Schema, model, models } from 'mongoose';

console.log("initializing models");

const clientSchema = new Schema({
  name: String!
});

const Client = models?.Client || model('Client', clientSchema);

export default Client;