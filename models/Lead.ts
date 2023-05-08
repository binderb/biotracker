import { Schema, model, models } from 'mongoose';

const leadSchema = new Schema({
  name: String!,
  author: { type: Schema.Types.ObjectId, ref: 'User' }!,
  drafters: [{ type: Schema.Types.ObjectId, ref: 'User' }]!,
  client: { type: Schema.Types.ObjectId, ref: 'Client' }!,
  revisions: [{ type: Schema.Types.ObjectId, ref: 'LeadRevision' }]!,
  notes: [{ type: Schema.Types.ObjectId, ref: 'LeadNote' }]!
});

const Lead = models?.Lead || model('Lead', leadSchema);

export default Lead;