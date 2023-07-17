import { Schema, model, models } from 'mongoose';

const leadRevisionSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User' }!,
  templateRevision: [{ type: Schema.Types.ObjectId, ref: 'LeadTemplateRevision' }]!,
  createdAt: Date!,
  content: [String]!,
});

const LeadRevision = models?.LeadRevision || model('LeadRevision', leadRevisionSchema);

export default LeadRevision;