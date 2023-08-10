import { Schema, model, models } from 'mongoose';

const leadRevisionSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User' }!,
  createdAt: Date!,
  content: String!,
  published: {type: Boolean!, default: false},
});

const LeadRevision = models?.LeadRevision || model('LeadRevision', leadRevisionSchema);

export default LeadRevision;