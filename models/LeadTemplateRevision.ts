import { Schema, model, models } from 'mongoose';

const leadTemplateRevisionSchema = new Schema({
  createdAt: Date!,
  sections: [{ type: Schema.Types.ObjectId, ref: 'LeadTemplateSection'}]!,
});

const LeadTemplateRevision = models?.LeadTemplateRevision || model('LeadTemplateRevision', leadTemplateRevisionSchema);

export default LeadTemplateRevision;