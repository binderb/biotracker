import { Schema, model, models } from 'mongoose';

const clientSchema = new Schema({
  name: String!,
  code: String!
});

const Client = models?.Client || model('Client', clientSchema);

export default Client;