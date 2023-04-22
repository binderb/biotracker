import { Schema, model, models } from 'mongoose';
import Study from './Study';

const clientSchema = new Schema({
  name: String!,
  code: String!,
  studies: [{ type: Schema.Types.ObjectId, ref: 'Study' }]!,
});

const Client = models?.Client || model('Client', clientSchema);

export default Client;