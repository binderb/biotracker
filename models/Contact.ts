import { Schema, model, models } from 'mongoose';

const contactSchema = new Schema({
  first: String!,
  last: String!,
  referredBy: { type: Schema.Types.ObjectId, ref: 'Contact'},
  email: String,
  phone: String,
  links: String,
  notes: String
});

const Contact = models?.Contact || model('Contact', contactSchema);

export default Contact;