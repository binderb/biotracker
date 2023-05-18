import { Schema, model, models } from 'mongoose';

const leadTemplateSectionSchema = new Schema({
  name: String!,
  index: Number!,
  fields: [{ type: Schema.Types.ObjectId, ref: 'LeadTemplateField'}]!,
  extensible: Boolean!,
  enstensibleGroupName: String
});

const LeadTemplateSection = models?.LeadTemplateSection || model('LeadTemplateSection', leadTemplateSectionSchema);

export default LeadTemplateSection;