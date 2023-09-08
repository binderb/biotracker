import { Schema, model, models } from 'mongoose';

const clientSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  referredBy: String,
  nda: Boolean,
  website: String,
  billingAddress: String,
  accountType: String
});

const Client = models?.Client || model('Client', clientSchema);

export default Client;