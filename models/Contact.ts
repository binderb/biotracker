import { Schema, model, models } from 'mongoose';

const contactSchema = new Schema({
  first: String!,
  last: String!,
  referredBy: { type: Schema.Types.ObjectId, ref: 'Contact'},
  organization: { type: Schema.Types.ObjectId, ref: 'Client'},
  keyContact: Boolean,
  nda: Boolean,
  email: String,
  phone: String,
  urls: [String],
  notes: String
});

const Contact = models?.Contact || model('Contact', contactSchema);

export default Contact;