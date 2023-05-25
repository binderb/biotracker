import { Schema, model, models } from 'mongoose';

const leadChangeSchema = new Schema({
  field: String!,
  before: String!,
  after: String!
});

const LeadChange = models?.LeadChange || model('LeadChange', leadChangeSchema);

export default LeadChange;