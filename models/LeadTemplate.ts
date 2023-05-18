import { Schema, model, models } from 'mongoose';

const leadTemplateSchema = new Schema({
  name: String!,
  createdAt: Date!,
  revisions: [{ type: Schema.Types.ObjectId, ref: 'LeadTemplateRevision'}],
  active: Boolean!,
});

const LeadTemplate = models?.LeadTemplate || model('LeadTemplate', leadTemplateSchema);

export default LeadTemplate;