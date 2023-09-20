import { Schema, model, models } from 'mongoose';

const mailingAddressSchema = new Schema({
  identifier: {
    type: String,
    required: true,
    unique: true
  },
  entityName: String,
  addressLine1: String,
  addressLine2: String,
  city: String,
  stateProvince: String,
  country: String,
  postalCode: String
});

const MailingAddress = models?.MailingAddress || model('MailingAddress', mailingAddressSchema);

export default MailingAddress;