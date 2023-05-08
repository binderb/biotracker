import { Schema, model, models } from 'mongoose';

const leadRevisionSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User' }!,
  createdAt: { type: Date!, default: Date.now() },
  content: String!,
});

const LeadRevision = models?.LeadRevision || model('LeadRevision', leadRevisionSchema);

export default LeadRevision;