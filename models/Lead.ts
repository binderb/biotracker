import { Schema, model, models } from 'mongoose';

const leadSchema = new Schema({
  name: String!,
  author: { type: Schema.Types.ObjectId, ref: 'User' }!,
  status: { type: String, required: true, default: 'active'},
  drafters: [{ type: Schema.Types.ObjectId, ref: 'User' }]!,
  client: { type: Schema.Types.ObjectId, ref: 'Client' }!,
  project: { type: Schema.Types.ObjectId, ref: 'ClientProject'},
  revisions: [{ type: Schema.Types.ObjectId, ref: 'LeadRevision' }]!,
  notes: [{ type: Schema.Types.ObjectId, ref: 'LeadNote' }]!,
  published: {type: Boolean!, default: false},
  studies: [{ type: Schema.Types.ObjectId, ref: 'Study' }]
});

const Lead = models?.Lead || model('Lead', leadSchema);

export default Lead;