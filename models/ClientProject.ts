import { Schema, model, models } from 'mongoose';

const clientProjectSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  nda: Boolean,
  client: { type: Schema.Types.ObjectId, ref: 'Client' },
  billingAddress: { type: Schema.Types.ObjectId, ref: 'MailingAddress' },
  contacts: [{ type: Schema.Types.ObjectId, ref: 'Contact' }],
  keyContacts: [Boolean],
});

const ClientProject = models?.ClientProject || model('ClientProject', clientProjectSchema);

export default ClientProject;