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
  referredBy: { type: Schema.Types.ObjectId, ref: 'Contact' },
  website: String,
  billingAddresses: [{ type: Schema.Types.ObjectId, ref: 'MailingAddress'}],
  projects: [{ type: Schema.Types.ObjectId, ref: 'ClientProject'}],
  accountType: {
    type: String,
    default: 'active'
  }
});

const Client = models?.Client || model('Client', clientSchema);

export default Client;